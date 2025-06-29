import React from 'react';
import { Article, ArticleCategory } from '../types';

interface ArticleDetailViewProps {
    article: Article;
    onBack: () => void;
}

const categoryColors: Record<ArticleCategory, string> = {
    [ArticleCategory.TECHNICAL]: "bg-blue-100 text-blue-800",
    [ArticleCategory.TACTICAL]: "bg-green-100 text-green-800",
    [ArticleCategory.MENTAL]: "bg-purple-100 text-purple-800",
    [ArticleCategory.PHYSICAL]: "bg-orange-100 text-orange-800",
};

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack }) => {
    return (
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-club-primary hover:text-club-primary-dark flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Learning Center
            </button>
            
            <div className="border-b border-slate-200 pb-4 mb-6">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[article.category]}`}>
                    {article.category}
                </span>
                <h1 className="text-3xl font-bold text-slate-800 mt-3">{article.title}</h1>
            </div>

            <div className="prose prose-lg max-w-none text-slate-700">
                {article.content.split('\n').map((paragraph, index) => (
                   paragraph.trim() && <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default ArticleDetailView;