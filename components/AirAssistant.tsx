
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ChatMessage } from '../types';
import { getAirAssistantResponse, generateSpeech, decode, encode, decodeAudioData } from '../services/geminiService';

const WHATSAPP_NUMBER = "254712156070";

interface AirAssistantProps {
  externalQuery?: string | null;
  onQueryHandled?: () => void;
  isVoiceEnabled?: boolean;
  onVoiceToggle?: (val: boolean) => void;
}

const AirAssistant = ({ externalQuery, onQueryHandled, isVoiceEnabled = true, onVoiceToggle }: AirAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Centipid Node Online. I am the Cooolfix Automated Gateway. Initialize your request by providing your sector location and requested throughput tier.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGreetingPlayed, setIsGreetingPlayed] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentVoiceSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const quickActions = [
    { label: "📍 Coverage Scan", query: "Run coverage scan for my sector." },
    { label: "🔧 Node Fault", query: "Report technical node fault." },
    { label: "💳 Uplink Credit", query: "I need to renew my internet provisioning." },
    { label: "🚀 High-Fidelity Tiers", query: "Provide details on premium fiber tiers." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (externalQuery) {
      setIsOpen(true);
      setIsWhatsAppMode(externalQuery.includes('WhatsApp'));
      handleSend(externalQuery);
      if (onQueryHandled) onQueryHandled();
    }
  }, [externalQuery]);

  useEffect(() => {
    if (isOpen && !isGreetingPlayed && isVoiceEnabled) {
      const greeting = messages.find(m => m.role === 'model')?.text;
      if (greeting) {
        playSpeech(greeting);
        setIsGreetingPlayed(true);
      }
    }
  }, [isOpen, isVoiceEnabled, isGreetingPlayed]);

  useEffect(() => {
    if (!isVoiceEnabled && currentVoiceSourceRef.current) {
      try {
        currentVoiceSourceRef.current.stop();
        currentVoiceSourceRef.current = null;
      } catch (e) {}
    }
  }, [isVoiceEnabled]);

  const initAudio = () => {
    if (!audioContextOutRef.current) {
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextOutRef.current.state === 'suspended') {
      audioContextOutRef.current.resume();
    }
  };

  const playSpeech = async (text: string) => {
    if (!isVoiceEnabled || isLiveActive) return;
    initAudio();
    const ctx = audioContextOutRef.current!;

    if (currentVoiceSourceRef.current) {
      try {
        currentVoiceSourceRef.current.stop();
        currentVoiceSourceRef.current = null;
      } catch(e) {}
    }

    const base64Audio = await generateSpeech(text);
    if (!base64Audio) return;

    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      currentVoiceSourceRef.current = source;
    } catch (err) {
      console.error("Audio Playback Error:", err);
    }
  };

  const startLiveSession = async () => {
    initAudio();
    setIsLiveActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = audioContextInRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextInRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            const ctx = audioContextOutRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onclose: () => stopLiveSession(),
        onerror: () => stopLiveSession(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are the Air Assistant for Cooolfix Air Technologies. You are triaging a live customer voice request. Use elite engineering terminology.",
      }
    });

    liveSessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    if (liveSessionRef.current) liveSessionRef.current.close();
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;

    if (!text) {
      setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
      setInput('');
    }
    
    setIsTyping(true);
    const botResponse = await getAirAssistantResponse(messages, messageToSend);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    if (isVoiceEnabled) playSpeech(botResponse);
  };

  const escalateToWhatsApp = () => {
    const chatSummary = messages.map(m => `${m.role === 'user' ? 'CLIENT' : 'NODE'}: ${m.text}`).join('\n');
    const msg = `COOOLFIX GATEWAY COMMAND SUMMARY:\n${chatSummary}\n\nREQUESTING FIELD ENGINEER FOR DEPLOYMENT FINALIZATION.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-[380px] sm:w-[440px] h-[680px] bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden glass-effect animate-in slide-in-from-bottom-12 duration-500">
          <div className={`p-8 bg-gradient-to-br flex flex-col gap-6 ${isWhatsAppMode ? 'from-emerald-600/90 to-teal-800/90' : 'from-slate-800 via-slate-900 to-black'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center shadow-2xl border border-white/20 relative group">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-[1.25rem] animate-pulse group-hover:bg-cyan-500/40 transition-all"></div>
                  <i className={`fa-solid ${isWhatsAppMode ? 'fa-brands fa-whatsapp' : 'fa-tower-broadcast'} text-white text-2xl z-10`}></i>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tighter uppercase leading-none">Cooolfix Air</h3>
                  <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    Gateway Online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${shieldActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                   <i className={`fa-solid ${shieldActive ? 'fa-shield-halved' : 'fa-triangle-exclamation'} text-[8px]`}></i>
                   <span className="text-[8px] font-black uppercase tracking-widest">{shieldActive ? 'Shield Active' : 'Shield Alert'}</span>
                </div>
                <button onClick={() => { setIsOpen(false); stopLiveSession(); }} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/40 border-t border-white/5 pt-4">
               <span>Pkt loss: 0.00%</span>
               <span className="text-cyan-500/60">Lat: 14ms</span>
               <span>Uplink: Synchronized</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-950/40">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`max-w-[88%] p-5 rounded-[2rem] text-[13px] leading-relaxed shadow-lg ${
                    m.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none font-bold' 
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-white/10 font-medium'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/90 p-5 rounded-[2rem] rounded-tl-none border border-white/10 flex gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              )}
            </div>
            {!isTyping && (
              <div className="px-8 py-4 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.query)}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/50 rounded-2xl text-[9px] font-black text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-40"></div>
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            <div className="p-8 bg-slate-900/80 border-t border-white/5 space-y-6 backdrop-blur-xl">
              {isWhatsAppMode && (
                <button 
                  onClick={escalateToWhatsApp}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 motion-btn-shimmer"
                >
                  <i className="fa-solid fa-satellite-dish animate-pulse text-lg"></i>
                  Handshake Field Engineer
                </button>
              )}
              <div className="flex items-center gap-4">
                <button 
                  onClick={startLiveSession} 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-inner ${isLiveActive ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-white/5 hover:bg-cyan-600/20 text-cyan-400 border-white/10'}`}
                  title="Live Voice Triage"
                >
                  <i className={`fa-solid ${isLiveActive ? 'fa-phone-slash' : 'fa-microphone'} text-xl`}></i>
                </button>
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Enter command sequence..." 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-[1.25rem] py-5 px-8 outline-none font-bold text-sm text-white shadow-2xl focus:border-cyan-500/60 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    disabled={!input.trim()}
                    onClick={() => handleSend()}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-cyan-500 hover:text-cyan-400 transition-all disabled:opacity-20"
                  >
                    <i className="fa-solid fa-paper-plane text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => { setIsOpen(!isOpen); initAudio(); }} 
        className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-3xl transition-all active:scale-90 group relative overflow-hidden ${
          isOpen 
          ? 'bg-slate-800 text-white rotate-180 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
          : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_20px_50px_rgba(6,182,212,0.4)]'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center z-20 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <i className={`fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-robot'} group-hover:scale-110 transition-transform z-10`}></i>
      </button>
    </div>
  );
};

export default AirAssistant;
