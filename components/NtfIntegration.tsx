import React from 'react';
import { useClubData } from '../hooks/useClubData';
import { Member } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface NtfIntegrationProps {
    clubData: ReturnType<typeof useClubData>;
}

const NtfIntegration: React.FC<NtfIntegrationProps> = ({ clubData }) => {
    const { ntfSyncStatus, syncWithNtf } = clubData;
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [syncResult, setSyncResult] = React.useState<{ synced: Member[], skipped: Member[] } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncResult(null);
        const result = await syncWithNtf();
        setSyncResult(result);
        setIsSyncing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Norwegian Tennis Federation (NTF) Integration</h2>
                <p className="text-sm text-slate-500 mt-1">Synchronize member data with the national federation's system.</p>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-slate-700">Sync Status</h3>
                    {ntfSyncStatus.lastSync ? (
                        <p className="text-sm text-slate-600">
                            Last synced on {ntfSyncStatus.lastSync.toLocaleString()}. 
                            Synced {ntfSyncStatus.membersSynced} members, skipped {ntfSyncStatus.membersSkipped}.
                        </p>
                    ) : (
                        <p className="text-sm text-slate-600">No synchronization has occurred yet.</p>
                    )}
                </div>
                
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSyncing && <LoadingSpinner size="sm" color="white" />}
                        <span className={isSyncing ? 'ml-2' : ''}>Sync Members with NTF</span>
                    </button>
                    {isSyncing && <p className="text-sm text-slate-500 animate-pulse">Synchronizing, please wait...</p>}
                </div>
                
                {syncResult && (
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                        <h3 className="font-semibold text-slate-800">Sync Report</h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-800">Synced Members ({syncResult.synced.length})</h4>
                            <p className="text-sm text-green-700">These members had consent and were included in the sync.</p>
                            <ul className="text-xs text-green-600 mt-2 list-disc list-inside">
                                {syncResult.synced.map(m => <li key={m.id}>{m.name}</li>)}
                            </ul>
                        </div>
                         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800">Skipped Members ({syncResult.skipped.length})</h4>
                            <p className="text-sm text-yellow-700">These members did not have consent and were skipped.</p>
                            <ul className="text-xs text-yellow-600 mt-2 list-disc list-inside">
                                {syncResult.skipped.map(m => <li key={m.id}>{m.name}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NtfIntegration;
