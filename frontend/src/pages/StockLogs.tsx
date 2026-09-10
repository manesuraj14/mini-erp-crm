import React, { useState } from 'react';
import { History, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const StockLogs: React.FC = () => {
  const { stockLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [movementFilter, setMovementFilter] = useState('ALL');

  const filteredLogs = stockLogs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = movementFilter === 'ALL' || log.movementType === movementFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movement Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit record of all warehouse inventory movements (Inward batches, Challan dispatches, Adjustments).
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, reason, or operator..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'IN', 'OUT'].map((mf) => (
            <button
              key={mf}
              type="button"
              onClick={() => setMovementFilter(mf)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                movementFilter === mf
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {mf === 'ALL' ? 'All Movements' : mf === 'IN' ? 'Stock IN (+)' : 'Stock OUT (-)'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Movement</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Quantity Changed</th>
                <th className="px-4 py-3">Reason / Trigger</th>
                <th className="px-4 py-3">Logged By</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          log.movementType === 'IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.movementType === 'IN' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {log.movementType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {log.productName}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      <span
                        className={
                          log.movementType === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {log.movementType === 'IN' ? '+' : '-'} {log.quantityChanged} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {log.reason}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {log.userName}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
