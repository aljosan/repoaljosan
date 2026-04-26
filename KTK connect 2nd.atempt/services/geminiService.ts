import { AI_COACH_SYSTEM_PROMPT } from '../constants';

export interface CoachChatSession {
  sendMessageStream: (params: { message: string }) => Promise<AsyncIterable<{ text: string }>>;
}

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY environment variable not set. AI Coach will not be available.');
}

export const createCoachChatSession = (): CoachChatSession | null => {
  void AI_COACH_SYSTEM_PROMPT;
  return null;
};
