// src/features/admin/AdminView.tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { User } from '../../types';
import { useAuth } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminView: React.FC = () => {
  const { user: currentUser, currency } = useAuth();
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalTransactions: number;
    totalVolume: number;
    activeBudgets: number;
    activeGoals: number;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllUsers(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Permanently purge user account "${name}" and all associated financial records?`)) {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        loadData();
      } else {
        alert(res.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-rose-600 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Super Administrator Privilege Console</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Governance & User Management</h2>
        <p className="text-xs text-slate-500">Monitor system activity, manage user access, and oversee multi-tenant accounts.</p>
      </div>

      {/* Zero-Config Database Management Strip */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">Zero-Configuration Persistence Active</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Operating with standalone embedded storage. No environment variables or external database setup required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                const res = await adminApi.backupDatabase();
                if (res) {
                  const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `financehub_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Export JSON Backup
            </button>
            <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer">
              Restore JSON Backup
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  try {
                    const parsed = JSON.parse(text);
                    const res = await adminApi.restoreDatabase(parsed);
                    if (res.success) {
                      alert('Database backup restored successfully.');
                      loadData();
                    } else {
                      alert(res.message || 'Restore failed');
                    }
                  } catch (err) {
                    alert('Invalid JSON file format');
                  }
                }}
              />
            </label>
            <button
              onClick={async () => {
                if (confirm('Reset all financial data back to initial clean demonstration records?')) {
                  const res = await adminApi.resetDatabase();
                  if (res.success) {
                    alert('Database reset to initial demo seeds.');
                    loadData();
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              Reset to Initial Seeds
            </button>
          </div>
        </div>
      </div>

      {/* Platform Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Accounts</span>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{stats?.totalUsers || 0}</h3>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Transactions</span>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{stats?.totalTransactions || 0}</h3>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Platform Cumulative Volume</span>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {formatCurrency(stats?.totalVolume || 0, currency)}
          </h3>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Budgets & Goals</span>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {(stats?.activeBudgets || 0) + (stats?.activeGoals || 0)}
          </h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Directory</h3>
            <p className="text-xs text-slate-500">All registered system identities</p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">{users.length} accounts total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading directory...</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{u.name}</span>
                            {isCurrent && <span className="ml-1.5 text-[10px] text-emerald-600 font-bold">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                            u.role === 'admin' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
