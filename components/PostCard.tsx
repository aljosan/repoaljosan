import React from 'react';
import { Post, Member } from '../types';
import MemberAvatar from './MemberAvatar';

interface PostCardProps {
    post: Post;
    author: Member;
}

// Helper function to format time difference
const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// Helper function to get YouTube embed URL
const getYoutubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
};


const PostCard: React.FC<PostCardProps> = ({ post, author }) => {
    const embedUrl = post.videoUrl ? getYoutubeEmbedUrl(post.videoUrl) : null;

    return (
        <div className="bg-white rounded-lg shadow-md p-5 border border-slate-200">
            <div className="flex items-center mb-4">
                <MemberAvatar member={author} size="md" />
                <div className="ml-3">
                    <p className="font-bold text-slate-800">{author.name}</p>
                    <p className="text-sm text-slate-500">{timeSince(post.timestamp)}</p>
                </div>
            </div>

            <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.textContent}</p>
            
            {embedUrl && (
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-slate-200">
                    <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded youtube"
                        className="w-full h-full"
                    />
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 flex space-x-6 text-slate-600">
                 <button className="flex items-center space-x-2 hover:text-club-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span className="text-sm font-medium">Like</span>
                </button>
                 <button className="flex items-center space-x-2 hover:text-club-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span className="text-sm font-medium">Comment</span>
                </button>
            </div>
             <style>{`
                .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
                .aspect-h-9 { }
                .aspect-w-16 > iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            `}</style>
        </div>
    );
};

export default PostCard;