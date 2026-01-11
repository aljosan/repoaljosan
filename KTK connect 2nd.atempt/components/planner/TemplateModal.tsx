import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useBookings } from '../../context/ClubContext';
import Icon from '../ui/Icon';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'apply' | 'save';

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
    const { scheduleTemplates, allBookings, saveScheduleAsTemplate, applyScheduleTemplate } = useBookings();
    const [activeTab, setActiveTab] = useState<Tab>('apply');
    const [templateName, setTemplateName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>(scheduleTemplates[0]?.id || '');
    const [weekStartDate, setWeekStartDate] = useState('');
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const handleSave = () => {
        setFeedback(null);
        if (!templateName.trim()) {
            setFeedback({ type: 'error', message: 'Please provide a name for the template.' });
            return;
        }
        // This is a simplified version; in a real app, you'd select the week to save
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const bookingsToSave = allBookings.filter(b => new Date(b.startTime) >= startOfWeek && new Date(b.startTime) <= endOfWeek);
        saveScheduleAsTemplate(templateName, bookingsToSave);
        setTemplateName('');
        setFeedback({ type: 'success', message: 'Template saved successfully!'});
    };
    
    const handleApply = () => {
        setFeedback(null);
        if(!selectedTemplate || !weekStartDate) {
             setFeedback({ type: 'error', message: 'Please select a template and a start date.' });
            return;
        }
        const result = applyScheduleTemplate(selectedTemplate, new Date(weekStartDate));
        if (result.success) {
            setFeedback({ type: 'success', message: result.message });
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
    };
    
    const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Templates">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('apply')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${activeTab === 'apply' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>Apply Template</button>
                    <button onClick={() => setActiveTab('save')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${activeTab === 'save' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>Save Current Week</button>
                </nav>
            </div>
            <div className="py-6 px-2 space-y-4">
                {activeTab === 'apply' ? (
                    <>
                        <div>
                            <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700">Select Template</label>
                            <select id="templateSelect" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className={commonInputClasses}>
                                {scheduleTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="weekStartDate" className="block text-sm font-medium text-gray-700">Apply to week starting</label>
                            <input type="date" id="weekStartDate" value={weekStartDate} onChange={e => setWeekStartDate(e.target.value)} className={commonInputClasses}/>
                        </div>
                         <Button onClick={handleApply} className="w-full">Apply Template</Button>
                    </>
                ) : (
                    <>
                        <div>
                            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">Template Name</label>
                            <input type="text" id="templateName" placeholder="e.g., Summer Training Schedule" value={templateName} onChange={e => setTemplateName(e.target.value)} className={commonInputClasses}/>
                            <p className="text-xs text-gray-500 mt-1">Saves the current week's schedule as a new template.</p>
                        </div>
                        <Button onClick={handleSave} className="w-full">Save as New Template</Button>
                    </>
                )}
                {feedback && (
                    <div className={`mt-4 p-3 rounded-md text-sm text-center ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TemplateModal;
