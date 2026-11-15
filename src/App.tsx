// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, authActions } from './store/authStore';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { QuickEntryModal } from './components/layout/QuickEntryModal';
import { AuthView } from './features/auth/AuthView';
import { DashboardView } from './features/dashboard/DashboardView';
import { IncomeView } from './features/income/IncomeView';
import { ExpenseView } from './features/expenses/ExpenseView';
import { BudgetView } from './features/budgets/BudgetView';
import { GoalsView } from './features/goals/GoalsView';
import { TransactionsView } from './features/transactions/TransactionsView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { AdminView } from './features/admin/AdminView';
import { SettingsView } from './features/settings/SettingsView';

export default function App() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    authActions.initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Initializing Personal Finance Hub...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Financial Dashboard',
    income: 'Income Portfolio',
    expenses: 'Expense Tracker',
    budgets: 'Monthly Budgets',
    goals: 'Savings Goals',
    transactions: 'Transaction History',
    analytics: 'Analytics & Reports',
    admin: 'Platform Admin Console',
    settings: 'Account Settings',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'admin' && !isAdmin) {
            setCurrentTab('dashboard');
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Topbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenQuickModal={() => setIsQuickModalOpen(true)}
          pageTitle={tabTitles[currentTab] || 'Dashboard'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={refreshKey}>
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenQuickModal={() => setIsQuickModalOpen(true)}
              />
            )}
            {currentTab === 'income' && <IncomeView />}
            {currentTab === 'expenses' && <ExpenseView />}
            {currentTab === 'budgets' && <BudgetView />}
            {currentTab === 'goals' && <GoalsView />}
            {currentTab === 'transactions' && <TransactionsView />}
            {currentTab === 'analytics' && <AnalyticsView />}
            {currentTab === 'admin' && isAdmin && <AdminView />}
            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
