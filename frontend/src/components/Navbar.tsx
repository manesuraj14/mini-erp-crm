import React, { useState } from 'react';
import { Menu, LogOut, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  toggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleMobileSidebar }) => {
  const { user, switchRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const availableRoles: { role: UserRole; desc: string }[] = [
    { role: 'ADMIN', desc: 'Full System & Modules Access' },
    { role: 'SALES', desc: 'Customer CRM & Sales Challans' },
    { role: 'WAREHOUSE', desc: 'Inventory & Stock In/Out' },
    { role: 'ACCOUNTS', desc: 'Challan Invoicing & Ledgers' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left side: Hamburger & Context title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Wholesale / Distribution Portal
          </span>
        </div>
      </div>

      {/* Right side: Fast Role Switcher (Evaluator friendly) & User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span className="hidden md:inline text-slate-500">Active Role:</span>
            <span className="font-bold text-indigo-700">{user?.role}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Role (Evaluation Mode)
                </div>
                <div className="mt-1 space-y-1">
                  {availableRoles.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        switchRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        user?.role === item.role
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{item.role}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                      {user?.role === item.role && <Check className="h-4 w-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden text-left lg:block">
            <div className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</div>
            <div className="text-[11px] text-slate-400 leading-none mt-1">{user?.email}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
