import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might have better error handling or a fallback.
  // For this example, we'll throw an error to make it clear the key is missing.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = "You are an expert tennis coach for Kristiansand Tennisklubb (KTK). Provide clear, encouraging, and actionable advice on tennis techniques, strategy, fitness, and drills. Keep your answers concise, friendly, and easy to understand for amateur to intermediate players. Structure your advice with bullet points or short paragraphs for readability. Never mention that you are an AI or a language model.";

let chat: Chat | null = null;

function getChatInstance(): Chat {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash-preview-04-17',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 0.9,
            },
            history: [],
        });
    }
    return chat;
}

export const getCoachResponseStream = async (
    prompt: string,
    _history: ChatMessage[]
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const chatInstance = getChatInstance();
    
    // The Gemini API's chat object manages history internally after creation.
    // If you need to reset or sync history, you would re-create the chat instance.
    // For this simple example, we let the service manage its own state.
    // If you wanted to pass full history every time:
    // chatInstance.history = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));

    const result = await chatInstance.sendMessageStream({ message: prompt });
    return result;
};

export const resetChat = () => {
    chat = null;
}