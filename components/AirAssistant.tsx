
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ChatMessage } from '../types';
import { getAirAssistantResponse, generateSpeech, decode, encode, decodeAudioData } from '../services/geminiService';

interface AirAssistantProps {
  externalQuery?: string | null;
  onQueryHandled?: () => void;
}

const AirAssistant: React.FC<AirAssistantProps> = ({ externalQuery, onQueryHandled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to Coolfix Air. I am your automated engineering assistant. How can I help you optimize your connectivity today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentVoiceSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (externalQuery) {
      setIsOpen(true);
      if (externalQuery.includes('WhatsApp')) {
        setIsWhatsAppMode(true);
      }
      handleSend(externalQuery);
      if (onQueryHandled) onQueryHandled();
    }
  }, [externalQuery]);

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

    // Stop any currently playing speech to avoid overlap
    if (currentVoiceSourceRef.current) {
      try { currentVoiceSourceRef.current.stop(); } catch(e) {}
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
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => stopLiveSession(),
        onerror: (e) => {
          console.error("Live Session Error:", e);
          stopLiveSession();
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are the Air Assistant for Coolfix Air Technologies. You are speaking live with a customer. Be helpful, professional, and efficient. Focus on Cloud Networking, IT Services and ISP support.",
      }
    });

    liveSessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch(e) {}
    }
    if (audioContextInRef.current) {
      try { audioContextInRef.current.close(); } catch(e) {}
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponse = await getAirAssistantResponse(messages, messageToSend);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    
    if (botResponse) {
      playSpeech(botResponse);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-[380px] sm:w-[420px] h-[600px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden glass-effect animate-in slide-in-from-bottom-12 duration-500">
          <div className={`p-6 bg-gradient-to-r flex justify-between items-center ${isWhatsAppMode ? 'from-emerald-600 to-teal-700' : 'from-cyan-600 via-blue-700 to-indigo-800'}`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <i className={`fa-solid ${isWhatsAppMode ? 'fa-brands fa-whatsapp' : 'fa-robot'} text-white text-xl`}></i>
              </div>
              <div>
                <p className="font-black text-white text-sm tracking-tight">{isWhatsAppMode ? 'WhatsApp Gateway' : 'Air Assistant'}</p>
                <p className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                  {isLiveActive ? 'Live Voice Session' : 'Automated Agent'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => { initAudio(); setIsVoiceEnabled(!isVoiceEnabled); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isVoiceEnabled ? 'bg-white/20 text-white' : 'bg-black/20 text-white/40'}`}
                title={isVoiceEnabled ? "Mute" : "Unmute"}
              >
                <i className={`fa-solid ${isVoiceEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              </button>
              <button onClick={() => { setIsOpen(false); stopLiveSession(); }} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/20 transition-all">
                <i className="fa-solid fa-chevron-down"></i>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {isLiveActive ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-12 p-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping scale-150 opacity-20"></div>
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping scale-125 opacity-40 delay-300"></div>
                  <div className="w-48 h-48 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                    <i className="fa-solid fa-microphone text-white text-5xl"></i>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <h4 className="text-2xl font-black text-white">Live Voice Connection</h4>
                  <p className="text-slate-400 text-sm font-medium">Listening to your engineering request...</p>
                </div>
                <button 
                  onClick={stopLiveSession}
                  className="px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center gap-3"
                >
                  <i className="fa-solid fa-phone-slash"></i>
                  End Live Session
                </button>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-cyan-600 text-white rounded-tr-none font-medium' 
                        : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5 font-medium'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/80 p-4 rounded-3xl rounded-tl-none border border-white/5 flex space-x-1.5">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
                  <div className="flex gap-4 items-center">
                    <button 
                      onClick={startLiveSession}
                      className="w-14 h-14 bg-slate-800 border border-white/5 rounded-2xl flex items-center justify-center text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all shadow-inner"
                      title="Start Live Call"
                    >
                      <i className="fa-solid fa-phone-plus"></i>
                    </button>
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type message..."
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-500 font-medium shadow-inner"
                      />
                      <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
                      >
                        <i className="fa-solid fa-paper-plane-top"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="px-6 py-2 bg-slate-900 border-t border-white/5 text-center">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Encrypted Session (AES-256)</p>
          </div>
        </div>
      )}

      <button
        onClick={() => { setIsOpen(!isOpen); if (isOpen) stopLiveSession(); }}
        className={`w-20 h-20 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(6,182,212,0.5)] flex items-center justify-center text-white text-3xl hover:scale-105 active:scale-95 transition-all group relative overflow-hidden ${
          isOpen ? 'bg-slate-800 rotate-180' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'}`}></i>
        {!isOpen && (
          <span className="absolute top-4 right-4 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default AirAssistant;
