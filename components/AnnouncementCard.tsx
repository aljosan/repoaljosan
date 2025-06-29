import React from 'react';
import { Announcement, Member } from '../types';
import MemberAvatar from './MemberAvatar';

interface AnnouncementCardProps {
    announcement: Announcement;
    author?: Member;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, author }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-club-primary">
            <div className="flex items-center mb-4">
                {author && <MemberAvatar member={author} />}
                <div className="ml-3">
                    <h2 className="text-xl font-bold text-slate-800">{announcement.title}</h2>
                    <p className="text-sm text-slate-500">
                        Posted by {author ? author.name : 'Admin'} on {new Date(announcement.timestamp).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700">
                {announcement.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementCard;