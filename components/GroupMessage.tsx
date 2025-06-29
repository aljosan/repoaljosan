
import React from 'react';
import { GroupMessage, Member, Coach } from '../types';
import MemberAvatar from './MemberAvatar';

interface GroupMessageProps {
    message: GroupMessage;
    author: Member | Coach;
    isCurrentUser: boolean;
}

const GroupMessageComponent: React.FC<GroupMessageProps> = ({ message, author, isCurrentUser }) => {
    const time = message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (isCurrentUser) {
        return (
            <div className="flex justify-end items-end gap-2">
                <div className="text-right">
                    <span className="text-xs text-slate-400">{time}</span>
                    <div className="bg-club-primary text-white px-4 py-2 rounded-2xl rounded-br-none inline-block mt-1">
                        <p>{message.textContent}</p>
                    </div>
                </div>
                <MemberAvatar member={author} size="sm" />
            </div>
        );
    }

    return (
        <div className="flex justify-start items-end gap-2">
            <MemberAvatar member={author} size="sm" />
            <div>
                 <p className="text-xs text-slate-500 ml-2 mb-1">{author.name}</p>
                <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl rounded-bl-none inline-block">
                    <p>{message.textContent}</p>
                </div>
                <span className="text-xs text-slate-400 ml-2">{time}</span>
            </div>
        </div>
    );
};

export default GroupMessageComponent;