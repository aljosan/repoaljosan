import React from 'react';
import { Article, ArticleCategory } from '../types';

interface ArticleCardProps {
    article: Article;
    onSelect: () => void;
}

const categoryColors: Record<ArticleCategory, string> = {
    [ArticleCategory.TECHNICAL]: "bg-blue-100 text-blue-800",
    [ArticleCategory.TACTICAL]: "bg-green-100 text-green-800",
    [ArticleCategory.MENTAL]: "bg-purple-100 text-purple-800",
    [ArticleCategory.PHYSICAL]: "bg-orange-100 text-orange-800",
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
    return (
        <div onClick={onSelect} className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
            <div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[article.category]}`}>
                    {article.category}
                </span>
                <h3 className="font-bold text-lg text-slate-800 mt-3">{article.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{article.summary}</p>
            </div>
            <div className="mt-4 text-sm font-semibold text-club-primary hover:text-club-primary-dark">
                Read More &rarr;
            </div>
        </div>
    );
};

export default ArticleCard;