import React, { useState, useMemo } from 'react';
import { Article, ArticleCategory } from '../types';
import ArticleCard from './ArticleCard';
import ArticleDetailView from './ArticleDetailView';

interface LearningCenterViewProps {
    articles: Article[];
}

const LearningCenterView: React.FC<LearningCenterViewProps> = ({ articles }) => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const articlesByCategory = useMemo(() => {
        const grouped: { [key in ArticleCategory]?: Article[] } = {};
        for (const article of articles) {
            if (!grouped[article.category]) {
                grouped[article.category] = [];
            }
            grouped[article.category]!.push(article);
        }
        return grouped;
    }, [articles]);

    const categoryOrder = [ArticleCategory.TECHNICAL, ArticleCategory.TACTICAL, ArticleCategory.MENTAL, ArticleCategory.PHYSICAL];

    if (selectedArticle) {
        return <ArticleDetailView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
    }

    return (
        <div className="space-y-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Learning Center</h1>
                <p className="mt-2 text-slate-600">Improve your game with tips and guides from our experts.</p>
            </div>
            
            {categoryOrder.map(category => {
                const categoryArticles = articlesByCategory[category];
                if (!categoryArticles || categoryArticles.length === 0) return null;

                return (
                    <div key={category}>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-club-primary pb-2">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryArticles.map(article => (
                                <ArticleCard key={article.id} article={article} onSelect={() => setSelectedArticle(article)} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LearningCenterView;