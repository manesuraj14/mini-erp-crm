import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const demoAccounts: { role: UserRole; email: string; title: string; color: string }[] = [
    { role: 'ADMIN', email: 'admin@minierp.com', title: 'Administrator', color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900' },
    { role: 'SALES', email: 'sales@minierp.com', title: 'Sales Officer', color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900' },
    { role: 'WAREHOUSE', email: 'warehouse@minierp.com', title: 'Warehouse Manager', color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900' },
    { role: 'ACCOUNTS', email: 'accounts@minierp.com', title: 'Accounts Executive', color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || `${selectedRole.toLowerCase()}@minierp.com`, selectedRole);
    navigate('/');
  };

  const handleQuickLogin = (demoRole: UserRole, demoEmail: string) => {
    login(demoEmail, demoRole);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-indigo-950/50">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold text-xl">
            ERP
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Mini ERP + CRM Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Wholesale & Distribution Operations Management</p>
        </div>

        {/* 1-Click Evaluation Fast Logins */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            1-Click Demo Logins (Evaluation Mode)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc.role, acc.email)}
                className="flex flex-col items-start p-2.5 rounded-lg border border-slate-700/60 bg-slate-800/80 hover:bg-slate-700 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                    {acc.role}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{acc.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@minierp.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="��������"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ADMIN">ADMIN (Full Access)</option>
              <option value="SALES">SALES (CRM & Challans)</option>
              <option value="WAREHOUSE">WAREHOUSE (Inventory & Logs)</option>
              <option value="ACCOUNTS">ACCOUNTS (Invoices & Audits)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Sign In to Portal
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Case Study Candidate Assessment � 48h Turnaround
        </div>
      </div>
    </div>
  );
};
