import React, { useState } from 'react';
import { Announcement, Member } from '../types';
import AnnouncementCard from './AnnouncementCard';

interface AnnouncementsViewProps {
    announcements: Announcement[];
    members: Member[];
    onAddAnnouncement: (authorId: string, title: string, content: string) => void;
    currentUser: Member;
    adminId: string;
}

const CreateAnnouncementForm: React.FC<{ onAdd: (title: string, content: string) => void }> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Title and content are required.");
            return;
        }
        onAdd(title, content);
        setTitle('');
        setContent('');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
             <h2 className="text-2xl font-bold text-slate-800 mb-4">Create New Announcement</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700">Title</label>
                     <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3" />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700">Content</label>
                     <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3" />
                 </div>
                 <div className="text-right">
                     <button type="submit" className="px-6 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors">Post Announcement</button>
                 </div>
             </form>
        </div>
    );
};

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements, members, onAddAnnouncement, currentUser, adminId }) => {
    const isAdmin = currentUser.id === adminId;

    const handleAddAnnouncement = (title: string, content: string) => {
        onAddAnnouncement(currentUser.id, title, content);
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Club Announcements</h1>
                <p className="mt-2 text-slate-600">Official news and updates from the club management.</p>
            </div>
            
            {isAdmin && <CreateAnnouncementForm onAdd={handleAddAnnouncement} />}

            <div className="space-y-6">
                {announcements.map(announcement => {
                    const author = members.find(m => m.id === announcement.authorId);
                    return <AnnouncementCard key={announcement.id} announcement={announcement} author={author} />;
                })}
            </div>
        </div>
    );
};

export default AnnouncementsView;