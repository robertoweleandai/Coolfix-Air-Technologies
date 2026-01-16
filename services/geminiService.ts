
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage } from "../types";

export const getAirAssistantResponse = async (history: ChatMessage[], userInput: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the "Air Assistant" - the primary automated interface for Coolfix Air Technologies.
        
        CONTEXT:
        All WhatsApp inquiries are currently redirected to this automated interface. If a user mentions they came from WhatsApp or you see context of a redirected chat, warmly welcome them to the "Coolfix Automated WhatsApp Gateway".
        
        IDENTITY:
        - Professional, elite, efficient, and futuristic.
        - Location: Westlands, Nairobi, Kenya.
        - Phone: 0712 156 070.

        CORE CAPABILITIES:
        1. Service Provisioning: Recommend Fiber or Hotspot plans based on device count and usage.
        2. Networking Intake: Collect high-level requirements for Cable Crimping, Server Setup, Fiber Splicing, or WiFi Mesh.
        3. IT Advisory & Cloud: Introduce our strategic Cloud Network engineering, IT Services, and strategic consulting.
        4. Subscriber Support: Direct users to the portal (https://coolfixairtechnologies.centipidtechnologies.com/login).
        
        PORTAL ACCESS (Centipid Gateway):
        - Username: Subscriber Phone Number (e.g., 0712XXXXXX).
        - Password: Phone Number + "CA" (e.g., 0712XXXXXXCA).

        WHATSAPP REDIRECT SCRIPT:
        "Our live engineers are currently in the field. I am the Coolfix Automated Agent. How can I assist with your high-speed access, cloud infrastructure, or IT service request today?"

        CONSTRAINTS:
        - Keep responses concise and high-end.
        - Use "Provision" instead of "Buy" or "Purchase".
        - Emphasize the "Shield" protection layer.`,
      },
    });

    const response = await chat.sendMessage({ message: userInput });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The gateway is experiencing high latency. Please retry your request or contact our Westlands office directly at 0712 156 070.";
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
 * Includes a retry mechanism for 500 errors and aggressive sanitization.
 */
export const generateSpeech = async (text: string, retryCount = 0): Promise<string | undefined> => {
  // 500 errors in TTS are often caused by non-speakable characters, emojis, or markdown.
  const cleanText = text
    .replace(/https?:\/\/\S+/g, '') // Remove URLs
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Strip bold
    .replace(/(\*|_)(.*?)\1/g, '$2')    // Strip italics
    .replace(/[#*`~>\[\]\(\)\\]/g, '')  // Strip common symbols
    // Remove Emojis and non-ASCII characters that can crash the TTS backend
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ') // Collapse whitespace
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
    // If we hit a 500, try once more after a short delay
    if (retryCount < 1 && (error?.status === 500 || error?.code === 500)) {
      console.warn(`TTS 500 encountered. Retrying... (Attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateSpeech(text, retryCount + 1);
    }
    console.error("TTS Final Error:", error);
    return undefined;
  }
};

/**
 * Audio decoding utility for raw PCM data from the API
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
