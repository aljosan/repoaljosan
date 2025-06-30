import React, { useState } from 'react';
import { Post, Member } from '../types';
import PostCard from './PostCard';
import MemberAvatar from './MemberAvatar';

interface CommunityViewProps {
    posts: Post[];
    members: Member[];
    currentUser: Member | null;
    onAddPost: (authorId: string, textContent: string, videoUrl?: string) => void;
}

const CreatePostForm: React.FC<{
    currentUser: Member | null;
    onAddPost: (authorId: string, textContent: string, videoUrl?: string) => void;
}> = ({ currentUser, onAddPost }) => {
    const [textContent, setTextContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textContent.trim()) {
            alert("Please write something in your post.");
            return;
        }
        if (currentUser) {
            onAddPost(currentUser.id, textContent, videoUrl);
        }
        setTextContent('');
        setVideoUrl('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-5">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    {currentUser && <MemberAvatar member={currentUser} size="md" />}
                    <div className="w-full">
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-club-primary"
                            rows={3}
                            placeholder={currentUser ? `What's on your mind, ${currentUser.name}?` : 'Log in to post'}
                        />
                         <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full p-2 mt-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-club-primary"
                            placeholder="Optional: Paste a YouTube video link here"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-3">
                    <button type="submit" className="px-6 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed" disabled={!textContent.trim()}>
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

const CommunityView: React.FC<CommunityViewProps> = ({ posts, members, currentUser, onAddPost }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <CreatePostForm currentUser={currentUser} onAddPost={onAddPost} />

            {posts.map(post => {
                const author = members.find(m => m.id === post.authorId);
                if (!author) return null; // Or render a placeholder for deleted user

                return (
                    <PostCard key={post.id} post={post} author={author} />
                );
            })}
        </div>
    );
};

export default CommunityView;