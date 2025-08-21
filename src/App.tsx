import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PerformanceMonitor } from './hooks/usePerformance';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import ProfileDetail from './components/ProfileDetail';
import ReferralSystem from './components/ReferralSystem';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { state } = useApp();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.MainButton.hide();
      
      // Set theme
      tg.setHeaderColor('#1a1a2e');
      tg.setBackgroundColor('#0f0f23');
    }
  }, []);

  const renderContent = () => {
    if (state.selectedProfile) {
      return <ProfileDetail />;
    }
    
    switch (state.activeTab) {
      case 'feed':
        return <Feed />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'referrals':
        return <ReferralSystem />;
      case 'profile':
        return state.selectedProfile ? <ProfileDetail /> : <Feed />;
      default:
        return <Feed />;
    }
  };

  return (
    <PerformanceMonitor>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-md mx-auto min-h-screen relative">
          <main className="p-4 pb-20">
            {renderContent()}
          </main>
          <Navigation />
        </div>
      </div>
    </PerformanceMonitor>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;