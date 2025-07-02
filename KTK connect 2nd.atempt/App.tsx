import React, { useState } from 'react';
import { ClubDataProvider } from './context/ClubContext';
import Header from './components/layout/Header';
import Dashboard from './components/views/Dashboard';
import Groups from './components/views/Groups';
import CourtBooking from './components/views/CourtBooking';
import AICoach from './components/views/AICoach';
import Planner from './components/views/Planner';
import { AppView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'groups':
        return <Groups />;
      case 'booking':
        return <CourtBooking />;
      case 'coach':
        return <AICoach />;
      case 'planner':
        return <Planner />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ClubDataProvider>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </main>
      </div>
    </ClubDataProvider>
  );
};

export default App;