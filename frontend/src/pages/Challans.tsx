import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  X,
  AlertTriangle,
  Eye,
  Building,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Challan, ChallanStatus } from '../types';

export const Challans: React.FC = () => {
  const { user } = useAuth();
  const { customers, products, challans, createChallan, confirmChallan, cancelChallan } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingChallan, setViewingChallan] = useState<Challan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Challan Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 },
  ]);

  const canCreate = ['ADMIN', 'SALES'].includes(user?.role || '');

  // Filtered Challans
  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerBusiness.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setErrorMessage(null);
    setSelectedCustomerId(customers[0]?.id || '');
    setItems([{ productId: products[0]?.id || '', quantity: 1 }]);
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateSubmit = async (status: 'DRAFT' | 'CONFIRMED') => {
    setErrorMessage(null);
    if (!selectedCustomerId) {
      setErrorMessage('Please select a valid customer');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setErrorMessage('All line items must have a valid product and quantity greater than 0');
      return;
    }

    const result = await createChallan(selectedCustomerId, items, status);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create sales challan');
    } else {
      setIsCreateModalOpen(false);
      if (result.challan) {
        setViewingChallan(result.challan);
      }
    }
  };

  const handleConfirmDraft = async (challanId: string) => {
    setErrorMessage(null);
    const res = await confirmChallan(challanId);
    if (!res.success) {
      setErrorMessage(res.error || 'Could not confirm challan');
    } else {
      const updated = challans.find((c) => c.id === challanId);
      if (updated) setViewingChallan(updated);
    }
  };

  // Compute live preview totals for the creator modal
  const computedTotalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const computedTotalAmount = items.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.unitPrice * Number(item.quantity || 0) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Challans</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create delivery orders, lock product pricing snapshots, and execute atomic stock reductions.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Sales Challan
          </button>
        )}
      </div>

      {/* Global Error Banner if any */}
      {errorMessage && !isCreateModalOpen && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Challan # (e.g. CH-202609-0001) or customer..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DRAFT', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Challans Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Challan Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items & Qty</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No challans found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((chal) => (
                  <tr key={chal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                      {chal.challanNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{chal.customerName}</div>
                      <div className="text-[11px] text-slate-400">{chal.customerBusiness}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{chal.totalQuantity} units</span>
                      <span className="text-[11px] text-slate-400 block">
                        across {chal.items.length} line items
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ?{chal.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          chal.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : chal.status === 'DRAFT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {chal.status === 'CONFIRMED' && <CheckCircle2 className="h-3 w-3" />}
                        {chal.status === 'DRAFT' && <Clock className="h-3 w-3" />}
                        {chal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      <div>{new Date(chal.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">by {chal.createdByName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setViewingChallan(chal);
                        }}
                        className="rounded-md bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sales Challan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create Sales Challan</h2>
                  <p className="text-xs text-slate-500">
                    Auto-generates sequential order number & captures immutable product snapshot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="mt-4 space-y-4 text-xs overflow-y-auto max-h-[50vh] pr-1">
                {/* Select Customer */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Customer *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.businessName}) � {c.customerType} [{c.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Line Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Line Items & Quantities</span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Plus className="h-3 w-3" />
                      Add Product Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const selectedProduct = products.find((p) => p.id === item.productId);
                      const isLowStock =
                        selectedProduct && selectedProduct.currentStock < item.quantity;

                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                        >
                          <div className="flex-1 w-full">
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 focus:outline-none"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (?{p.unitPrice}) � Stock: {p.currentStock}
                                </option>
                              ))}
                            </select>
                            {selectedProduct && (
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                                <span>SKU: {selectedProduct.sku}</span>
                                <span
                                  className={`font-semibold ${
                                    isLowStock ? 'text-rose-600 font-bold' : 'text-slate-600'
                                  }`}
                                >
                                  Available in Warehouse: {selectedProduct.currentStock} units
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="w-24 shrink-0">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, 'quantity', Number(e.target.value))
                              }
                              className={`w-full rounded border px-2 py-1.5 text-right font-medium focus:outline-none ${
                                isLowStock
                                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                                  : 'border-slate-200 bg-white text-slate-900'
                              }`}
                              placeholder="Qty"
                            />
                          </div>

                          <div className="w-24 shrink-0 text-right font-bold text-slate-900">
                            ?
                            {(
                              (selectedProduct?.unitPrice || 0) * Number(item.quantity || 0)
                            ).toFixed(2)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            disabled={items.length === 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Summary Bar */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex items-center justify-between">
                  <span className="text-slate-600">
                    Order Summary ({items.length} items, {computedTotalQuantity} total quantity):
                  </span>
                  <span className="font-bold text-indigo-900 text-sm">
                    Net Total: ?{computedTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCreateSubmit('DRAFT')}
                  className="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateSubmit('CONFIRMED')}
                  className="flex-1 sm:flex-initial rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Challan / Invoice Drawer */}
      {viewingChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[95vh] flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Top Bar with Print & Close */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-700">
                    {viewingChallan.challanNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      viewingChallan.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingChallan.status === 'DRAFT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {viewingChallan.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    Print / Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingChallan(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Header */}
              <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                      DELIVERY CHALLAN / TAX INVOICE
                    </h2>
                    <p className="text-xs text-slate-500">Nexus Wholesale Distribution Ltd</p>
                    <p className="text-[11px] text-slate-400">GSTIN: 29AABCU9603R1ZM � State: Karnataka</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-indigo-700 font-mono text-sm">
                      {viewingChallan.challanNumber}
                    </div>
                    <div className="text-slate-500">
                      Date: {new Date(viewingChallan.createdAt).toLocaleDateString()}
                    </div>
                    {viewingChallan.confirmedAt && (
                      <div className="text-emerald-600 font-semibold text-[10px]">
                        Dispatched: {new Date(viewingChallan.confirmedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Snapshot */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Billed & Shipped To:
                    </span>
                    <div className="font-bold text-slate-900">{viewingChallan.customerName}</div>
                    <div className="text-slate-600">{viewingChallan.customerBusiness}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Dispatch Details:
                    </span>
                    <div className="text-slate-700">Created By: {viewingChallan.createdByName}</div>
                    <div className="text-slate-500 text-[11px]">Mode: Hand Delivery / Cargo</div>
                  </div>
                </div>
              </div>

              {/* Line Items Snapshot Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5">Item Description (Snapshot Data)</th>
                      <th className="px-3 py-2.5">SKU</th>
                      <th className="px-3 py-2.5 text-right">Unit Price</th>
                      <th className="px-3 py-2.5 text-right">Quantity</th>
                      <th className="px-3 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingChallan.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {item.snapshotProductName}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                          {item.snapshotSku}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          ?{item.snapshotUnitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          ?{item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold">
                    <tr>
                      <td colSpan={3} className="px-3 py-2.5 text-slate-700">
                        Total Quantity: {viewingChallan.totalQuantity} units
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700">Grand Total:</td>
                      <td className="px-3 py-2.5 text-right text-indigo-700 text-sm">
                        ?{viewingChallan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Note on Snapshot Integrity */}
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Snapshot Data Verified:</strong> Line item prices and SKU records are permanently
                  locked to the time of transaction to protect invoice integrity against future catalog edits.
                </span>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setViewingChallan(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              {viewingChallan.status === 'DRAFT' && canCreate && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      cancelChallan(viewingChallan.id);
                      setViewingChallan(null);
                    }}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Cancel Challan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDraft(viewingChallan.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-xs"
                  >
                    Confirm & Deduct Stock Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
