
import React, { useState, useMemo } from 'react';
import { Survey, SurveyResponse } from '../types';
import { useClubDataContext } from '../hooks/ClubDataContext';

interface SurveysViewProps {}

const SurveyResults: React.FC<{ survey: Survey, responses: SurveyResponse[] }> = ({ survey, responses }) => {
    const totalResponses = responses.length;

    return (
        <div className="space-y-8">
            {survey.questions.map(question => {
                const questionResponses = responses.map(r => r.answers.find(a => a.questionId === question.id)?.answer).filter(Boolean);
                
                return (
                    <div key={question.id}>
                        <h3 className="font-semibold text-lg text-slate-800">{question.text}</h3>
                        <p className="text-sm text-slate-500 mb-4">{questionResponses.length} of {totalResponses} answered</p>
                        <div className="space-y-3">
                            {question.options.map(option => {
                                const count = questionResponses.filter(answer => answer === option).length;
                                const percentage = questionResponses.length > 0 ? (count / questionResponses.length) * 100 : 0;
                                return (
                                    <div key={option}>
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="font-medium text-slate-700">{option}</span>
                                            <span className="text-slate-500">{count} vote{count !== 1 && 's'} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-club-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const SurveyForm: React.FC<{ survey: Survey, onSubmit: (answers: { questionId: string; answer: string; }[]) => void }> = ({ survey, onSubmit }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({...prev, [questionId]: answer}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(answers).length !== survey.questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
        onSubmit(formattedAnswers);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {survey.questions.map(question => (
                <fieldset key={question.id}>
                    <legend className="font-semibold text-lg text-slate-800 mb-3">{question.text}</legend>
                    <div className="space-y-3">
                        {question.options.map(option => (
                             <label key={option} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <input 
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={answers[question.id] === option}
                                    onChange={() => handleAnswerChange(question.id, option)}
                                    className="h-4 w-4 text-club-primary focus:ring-club-primary"
                                />
                                <span className="ml-3 text-slate-700">{option}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            ))}
            <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-club-primary focus:ring-offset-2">
                    Submit Survey
                </button>
            </div>
        </form>
    );
};


const SurveysView: React.FC<SurveysViewProps> = () => {
    const { surveys, surveyResponses, currentUser, submitSurveyResponse } = useClubDataContext();
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

    const userResponses = useMemo(() => {
        if (!currentUser) return [] as typeof surveyResponses;
        return surveyResponses.filter(r => r.memberId === currentUser.id);
    }, [surveyResponses, currentUser?.id]);

    const handleSurveySubmit = (surveyId: string) => (answers: { questionId: string; answer: string; }[]) => {
        submitSurveyResponse({
            surveyId,
            memberId: currentUser!.id,
            answers,
        });
    };

    if (selectedSurveyId) {
        const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
        if (!selectedSurvey) {
            // Should not happen, but good practice
            return <p>Survey not found.</p>;
        }

        const hasUserResponded = userResponses.some(r => r.surveyId === selectedSurveyId);
        const allResponsesForSurvey = surveyResponses.filter(r => r.surveyId === selectedSurveyId);

        return (
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
                 <button onClick={() => setSelectedSurveyId(null)} className="mb-6 text-sm font-semibold text-club-primary hover:text-club-primary-dark">
                    &larr; Back to all surveys
                </button>
                <div className="border-b border-slate-200 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedSurvey.title}</h2>
                    <p className="mt-1 text-slate-600">{selectedSurvey.description}</p>
                </div>
                {hasUserResponded ? (
                    <div>
                         <p className="text-center font-semibold text-club-primary bg-club-primary/10 p-3 rounded-lg mb-8">Thank you for your feedback! Here are the current results.</p>
                         <SurveyResults survey={selectedSurvey} responses={allResponsesForSurvey} />
                    </div>
                ) : (
                    <SurveyForm survey={selectedSurvey} onSubmit={handleSurveySubmit(selectedSurvey.id)} />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Club Surveys</h1>
                <p className="mt-2 text-slate-600">Share your feedback to help us improve the club for everyone.</p>
            </div>
            {surveys.map(survey => {
                const hasResponded = userResponses.some(r => r.surveyId === survey.id);
                return (
                    <div key={survey.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-xl">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{survey.title}</h2>
                            <p className="mt-1 text-slate-600">{survey.description}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedSurveyId(survey.id)} 
                            className={`px-5 py-2 rounded-md font-semibold text-white whitespace-nowrap transition-colors ${hasResponded ? 'bg-slate-500 hover:bg-slate-600' : 'bg-club-primary hover:bg-club-primary-dark'}`}
                        >
                            {hasResponded ? 'View Results' : 'Take Survey'}
                        </button>
                    </div>
                )
            })}
        </div>
    );
};

export default SurveysView;
