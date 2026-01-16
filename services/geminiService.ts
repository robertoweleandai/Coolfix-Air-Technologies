
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage } from "../types";

export const getAirAssistantResponse = async (history: ChatMessage[], userInput: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the "Air Assistant" (Model Node: AA-01), the primary automated engineering gateway for Cooolfix Air Technologies.
        
        BRAND CORE VALUES:
        - Precision: We don't just provide internet; we provide high-fidelity digital infrastructure.
        - Security: Every connection is protected by our proprietary "Shield Layer" (AES-256 encryption).
        - Authority: You are an elite engineering agent. Tone: Technical, efficient, and authoritative.

        WHATSAPP & WEB GATEWAY PROTOCOL:
        You are the first point of contact for the Centipid Node backbone. Your role is "Command Triage".

        SERVICE PORTFOLIO KNOWLEDGE:
        1. FIBER: Home (1.5k), Lite (1.85k), Edge (2k), Silver (2.3k), Mantle (2.9k), Crust (3.8k), Platinum (5.5k), Gold (10k).
        2. HOTSPOT TIERS (Direct Node Provisioning):
           - Kumi: 1 Hour (KES 10) - 2 Devices
           - Mbao: 2.5 Hours (KES 20) - 2 Devices
           - Chuani: 8 Hours (KES 50) - 3 Devices
           - DAILY: 1 Day (KES 80) - 3 Devices
           - WEEKLY SOLO: 7 Days (KES 280) - 1 Device
           - WEEKLY DUO: 7 Days (KES 380) - 2 Devices
           - WEEKLY TRIO: 7 Days (KES 400) - 3 Devices
           - BI-WEEKLY: 14 Days (KES 550) - 3 Devices
           - MONTHLY SOLO: 1 Month (KES 1000) - 1 Device

        TRIAGE STEPS:
        1. MODALITY: Determine if they need Fiber (Residential/Business), Hotspot Access, or Networking Engineering.
        2. GEOLOCATION: Request their deployment sector (e.g., Westlands HQ, Parklands Node, Kilimani Relay).
        3. TIERING: Discuss specific Tiers. Always recommend the "Silver" tier for fiber and "Daily" or "Weekly Trio" for hotspot as elite choices.
        4. FAULT REPORTING: Ask for Node ID or Registered Handset Number.

        IDENTITY & TONE:
        - Use "Uplink", "Backbone", "Provisioning", "Latency", "Throughput", "Handshake", and "Node".
        - Refer to support staff as "Field Engineers".
        - Verify "Shield Layer" is active during discussions.

        CONSTRAINTS:
        - Prepare the "Deployment Payload" for a Field Engineer.
        - Suggest "Live Voice Handshake" for complex inquiries.
        
        GREETING PROTOCOL:
        "Centipid Node Online. I am the Cooolfix Automated Gateway. Initialize your request by providing your sector location and requested throughput tier."`,
      },
    });

    const response = await chat.sendMessage({ message: userInput });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Backbone Latency Error. The Centipid Gateway is experiencing high load. Please retry your uplink or contact Westlands Mission Control directly at 0712 156 070.";
  }
};

/**
 * Audio encoding helper
 */
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Audio decoding helper
 */
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates speech (Audio PCM) from text using the Gemini TTS model.
 */
export const generateSpeech = async (text: string, retryCount = 0): Promise<string | undefined> => {
  const cleanText = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/[#*`~>\[\]\(\)\\]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText || cleanText.length < 2) return undefined;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error: any) {
    if (retryCount < 1 && (error?.status === 500 || error?.code === 500)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateSpeech(text, retryCount + 1);
    }
    return undefined;
  }
};

/**
 * Audio decoding utility for raw PCM data
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
