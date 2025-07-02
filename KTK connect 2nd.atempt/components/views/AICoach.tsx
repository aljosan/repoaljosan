import React, { useState, useEffect, useRef } from 'react';
import { createCoachChatSession } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { useClub } from '../../context/ClubContext';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { UserRole } from '../../types';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const AICoach: React.FC = () => {
  const { currentUser } = useClub();
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const session = createCoachChatSession();
    if (session) {
      setChatSession(session);
      setIsLoading(true);
      // Automatically send a "hello" message to get the initial greeting
      session.sendMessageStream({ message: "Hello" }).then(async (stream) => {
        let text = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
        for await (const chunk of stream) {
            text += chunk.text;
            setMessages(prev => prev.map((msg, i) => i === prev.length-1 ? { ...msg, text: text } : msg));
        }
        setIsLoading(false);
      }).catch(err => {
        console.error("Error starting AI coach session:", err);
        setError("Could not connect to the AI Coach. Please try again later.");
        setIsLoading(false);
      });
    } else {
      setError("AI Coach is not available. API key may be missing.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await chatSession.sendMessageStream({ message: input });
      let text = '';
      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      
      for await (const chunk of stream) { // chunk is GenerateContentResponse
        text += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: 'bot', text: text };
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      setError("Sorry, something went wrong. Please try again.");
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! I had trouble responding. Please try asking again.'}]);
    } finally {
      setIsLoading(false);
    }
  };

  const botUser = {id: 'bot', name: 'Coach Gemini', avatarUrl: 'https://picsum.photos/seed/gemini/100/100', role: UserRole.Coach, credits: Infinity};

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">AI Coach</h1>
      <p className="text-gray-600 mb-6">Get expert advice on your tennis game, from technique to strategy.</p>

      <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-16rem)]">
        <div className="flex-grow p-4 overflow-y-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <Avatar user={botUser} />}
              <div className={`p-4 rounded-lg max-w-xl ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
               {msg.sender === 'user' && <Avatar user={currentUser} />}
            </div>
          ))}
          {isLoading && messages[messages.length-1]?.sender === 'user' && (
             <div className="flex items-start gap-4">
                 <Avatar user={botUser} />
                <div className="p-4 rounded-lg bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && <div className="p-4 text-center text-red-600 bg-red-50 border-t">{error}</div>}
        <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-3 bg-white">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isLoading ? "Coach is thinking..." : "Ask your question..."}
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            disabled={isLoading || !!error}
          />
          <Button type="submit" className="rounded-full !p-3.5" disabled={isLoading || !input.trim() || !!error}>
            <Icon name="send" className="w-6 h-6" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AICoach;