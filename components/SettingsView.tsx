import React from 'react';
import { useClubDataContext } from '../hooks/ClubDataContext';
import NtfIntegration from './NtfIntegration';
import AdminCreditManagement from './AdminCreditManagement';

const SettingsView: React.FC = () => {
    const { currentUser, ADMIN_ID } = useClubDataContext();
    
    if (currentUser.id !== ADMIN_ID) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-slate-600">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
                <p className="mt-2 text-slate-600">Manage club integrations and other administrative tasks.</p>
            </div>
            
            <AdminCreditManagement />
            <NtfIntegration />
        </div>
    );
};

export default SettingsView;