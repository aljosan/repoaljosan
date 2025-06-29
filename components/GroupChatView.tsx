import React, { useState, useEffect, useRef } from 'react';
import { Group, GroupMessage, Member, Coach } from '../types';
import GroupMessageComponent from './GroupMessage';

interface GroupChatViewProps {
    group: Group;
    messages: GroupMessage[];
    onSendMessage: (groupId: string, authorId: string, textContent: string) => void;
    allMembers: Member[];
    currentUser: Member;
    onBack: () => void;
    coaches: Coach[];
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ group, messages, onSendMessage, allMembers, currentUser, onBack, coaches }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(group.id, currentUser.id, newMessage.trim());
            setNewMessage('');
        }
    };

    const sortedMessages = [...messages].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
    const coach = group.coachId ? coaches.find(c => c.id === group.coachId) : null;
    const participantCount = group.memberIds.length + (coach ? 1 : 0);

    // Combine members and coaches into a single list for author lookup
    const allParticipants = [...allMembers, ...coaches];

    return (
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center space-x-3 sticky top-0 bg-white z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">{group.name}</h3>
                    <div className="text-sm text-slate-500 flex items-center space-x-2 flex-wrap">
                        <span>{participantCount} participants</span>
                        {coach && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center space-x-1">
                                    <img src={coach.avatarUrl} alt={coach.name} className="h-4 w-4 rounded-full"/>
                                    <span>Coached by {coach.name}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {sortedMessages.map(msg => {
                    const author = allParticipants.find(p => p.id === msg.authorId);
                    if (!author) return null;
                    return (
                        <GroupMessageComponent
                            key={msg.id}
                            message={msg}
                            author={author}
                            isCurrentUser={author.id === currentUser.id}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${group.name}...`}
                        className="flex-1 w-full px-4 py-2 bg-slate-100 border border-transparent rounded-full text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-club-primary focus:border-transparent transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
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

export default GroupChatView;