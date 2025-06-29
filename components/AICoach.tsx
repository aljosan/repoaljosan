import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCoachResponseStream, resetChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

const AICoach: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom of chat on new message
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Reset chat session when component unmounts
        return () => {
            resetChat();
        };
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: prompt };
        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);
        setError(null);

        try {
            const history = [...messages, userMessage];
            const stream = await getCoachResponseStream(prompt, history);

            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                modelResponse += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (e) {
            console.error("Error getting response from AI coach:", e);
            setError("Sorry, I'm having trouble connecting to the coach right now. Please try again later.");
            setMessages(prev => prev.filter(msg => msg.role !== 'model' || msg.text !== ''));
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, messages]);


    return (
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
            <div className="p-4 border-b border-slate-200 flex items-center space-x-3">
                 <div className="p-2 bg-club-primary/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-club-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M19 3v4M17 5h4M14 11l-1-1-1 1M10 11l-1-1-1 1M12 21l-1-1-1 1M16 21l-1-1-1 1M5 17l-1-1-1 1M9 17l-1-1-1 1" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">KTK AI Coach</h3>
                    <p className="text-sm text-slate-500">Ask for drills, strategy, or tennis tips!</p>
                </div>
            </div>

            <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-slate-500">
                        <p>Welcome! How can I help you improve your game today?</p>
                        <p className="text-xs mt-2">e.g., "How can I improve my backhand?"</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <img src="https://picsum.photos/seed/coach/40/40" alt="coach" className="h-8 w-8 rounded-full" />}
                        <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-club-primary text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start items-center space-x-3">
                         <img src="https://picsum.photos/seed/coach/40/40" alt="coach" className="h-8 w-8 rounded-full" />
                         <div className="bg-slate-200 rounded-2xl rounded-bl-none p-4">
                            <LoadingSpinner size="sm" />
                         </div>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>

            <div className="p-4 border-t border-slate-200">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 w-full px-4 py-2 bg-slate-100 border border-transparent rounded-full text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-club-primary focus:border-transparent transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="p-3 bg-club-primary text-white rounded-full disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-club-primary-dark focus:outline-none focus:ring-2 focus:ring-club-primary focus:ring-offset-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AICoach;