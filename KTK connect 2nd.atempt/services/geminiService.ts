import { GoogleGenAI, Chat } from "@google/genai";
import { AI_COACH_SYSTEM_PROMPT } from '../constants';

// Ensure the API key is available. In a real environment, this should be handled securely.
if (!process.env.GEMINI_API_KEY) {
  // In a real app, you'd have better error handling or a fallback.
  // For this project, we'll log a warning and allow the UI to function without the AI coach.
  console.warn(
    "GEMINI_API_KEY environment variable not set. AI Coach will not be available."
  );
}

// Initialize the Generative AI client if the API key exists
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// This function creates a new chat session with the pre-defined system prompt for the coach
export const createCoachChatSession = (): Chat | null => {
  if (!ai) return null;

  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash-preview-04-17',
    config: {
      systemInstruction: AI_COACH_SYSTEM_PROMPT,
    },
  });

  return chat;
};
