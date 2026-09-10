import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { customers, products, challans, lowStockCount, outOfStockCount } = useData();

  const totalRevenue = challans
    .filter((c) => c.status === 'CONFIRMED')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const confirmedChallans = challans.filter((c) => c.status === 'CONFIRMED').length;
  const draftChallans = challans.filter((c) => c.status === 'DRAFT').length;

  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.minStockAlert
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational overview for Wholesale & Distribution activities � Role:{' '}
            <span className="font-semibold text-indigo-600">{user?.role}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <Link
              to="/challans"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Challan
            </Link>
          )}
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <Link
              to="/customers"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Users className="h-3.5 w-3.5 text-slate-500" />
              Add Customer
            </Link>
          )}
          {['ADMIN', 'WAREHOUSE'].includes(user?.role || '') && (
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Package className="h-3.5 w-3.5 text-slate-500" />
              Adjust Stock
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active CRM Clients</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{customers.length}</span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {customers.filter((c) => c.status === 'LEAD').length} potential leads in pipeline
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`rounded-xl border p-5 shadow-xs ${lowStockCount > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Stock Alerts</span>
            <div className={`rounded-lg p-2 ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
              {lowStockCount + outOfStockCount}
            </span>
            <span className="text-xs text-slate-500">items need attention</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {outOfStockCount > 0 ? `${outOfStockCount} completely out of stock` : 'Healthy warehouse reorder flow'}
          </div>
        </div>

        {/* Pending Challans */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sales Challans</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{challans.length}</span>
            <span className="text-xs text-slate-500">total orders</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="font-semibold text-blue-600">{draftChallans} Draft</span> �{' '}
            <span className="font-semibold text-emerald-600">{confirmedChallans} Confirmed</span>
          </div>
        </div>

        {/* Total Invoiced Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dispatched Value</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ?{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            From {confirmedChallans} confirmed sales orders
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">
                  Minimum Stock Warning ({lowStockProducts.length} items below safety buffer)
                </h3>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  The following items require replenishment to avoid sales challan fulfillment bottlenecks.
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-amber-900 hover:text-amber-800 underline shrink-0"
            >
              Manage Inventory &rarr;
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-amber-200 text-xs font-medium text-amber-900 shadow-2xs"
              >
                <span className="font-semibold">{p.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${p.currentStock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                  Stock: {p.currentStock} / Min: {p.minStockAlert}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Split: Recent Challans & CRM Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Challans Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Sales Challans</h2>
            <Link to="/challans" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {challans.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {c.challanNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'DRAFT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{c.customerName}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.items.length} items � {c.totalQuantity} units
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    ?{c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Accounts Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Pipeline</h2>
            <Link to="/customers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View CRM &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {customers.slice(0, 4).map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{cust.customerName}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cust.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cust.status === 'LEAD'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cust.status}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                      {cust.customerType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cust.businessName}</div>
                  {cust.notes && (
                    <div className="text-[11px] text-slate-400 italic truncate max-w-xs mt-0.5">
                      "{cust.notes}"
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  <div>{cust.mobileNumber}</div>
                  {cust.followUpDate && (
                    <div className="text-indigo-600 font-medium mt-0.5">
                      Follow-up: {cust.followUpDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
