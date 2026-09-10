import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  History,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, closeMobile }) => {
  const { user } = useAuth();
  const { lowStockCount, pendingChallansCount } = useData();

  const role = user?.role || 'SALES';

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      to: '/customers',
      label: 'Customer CRM',
      icon: Users,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
      badge: null,
    },
    {
      to: '/products',
      label: 'Inventory & Stock',
      icon: Package,
      roles: ['ADMIN', 'WAREHOUSE', 'SALES'],
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      to: '/challans',
      label: 'Sales Challans',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
      badge: pendingChallansCount > 0 ? `${pendingChallansCount} Draft` : null,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      to: '/stock-logs',
      label: 'Stock Audit Logs',
      icon: History,
      roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'],
      badge: null,
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
            ERP
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">Nexus Operations</h1>
            <p className="text-xs text-slate-400">Mini ERP + CRM Portal</p>
          </div>
        </div>

        {/* Role Pill Indicator */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md bg-slate-800/60 border border-slate-700/50">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Role:
            </span>
            <span className="font-semibold text-white tracking-wide bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[11px] border border-indigo-500/30">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && ['ADMIN', 'WAREHOUSE'].includes(role) && (
          <div className="mx-3 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Inventory Alert
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} have fallen below minimum alert quantities.
            </p>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-xs text-slate-400 flex items-center justify-between">
          <span>v1.0.0 � 48h MVP</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
