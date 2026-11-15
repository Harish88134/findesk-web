// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Target,
  FileSpreadsheet,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';

export type NavTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'budgets'
  | 'goals'
  | 'transactions'
  | 'analytics'
  | 'admin'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income' as NavTab, label: 'Income', icon: ArrowDownLeft },
    { id: 'expenses' as NavTab, label: 'Expenses', icon: ArrowUpRight },
    { id: 'budgets' as NavTab, label: 'Budgets', icon: PieChart },
    { id: 'goals' as NavTab, label: 'Savings Goals', icon: Target },
    { id: 'transactions' as NavTab, label: 'Transactions', icon: FileSpreadsheet },
    { id: 'analytics' as NavTab, label: 'Analytics & Reports', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin Console', icon: ShieldAlert }] : []),
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Wallet className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              FinanceHub
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Personal Finance Manager</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-300 tracking-wider">
            FINANCIAL WORKSPACE
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User profile snippet & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold shrink-0 text-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'No email'}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
