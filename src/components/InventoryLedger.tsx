import React, { useState, useMemo } from 'react';
import { useStore } from '../StoreProvider';
import { LedgerItem } from '../types';
import { Plus, Edit, Trash2, Save, X, Search, Bookmark, Tag, Layers, RefreshCw, Clipboard, FileText, CheckCircle2, Calculator, HelpCircle, AlertTriangle } from 'lucide-react';

export const InventoryLedger: React.FC = () => {
  const { ledgerItems, ledgerHistory, addLedgerItem, updateLedgerItem, deleteLedgerItem, saveLedgerSnapshot, resetLedgerToNewPresets } = useStore();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // New Item Form State
  const [newSerial, setNewSerial] = useState('');
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newStock, setNewStock] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Snapshot Modal State
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');

  // Inline confirmations states to bypass window.confirm
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // State to track which history card is expanded
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  const toggleHistoryExpand = (id: string) => {
    setExpandedHistories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Seeding check
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to safely parse and round numbers with epsilon accuracy
  const safeRound = (val: number): number => {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  };

  const formatBDTValue = (val: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeRound(val)).replace('BDT', '৳');
  };

  // Compute stats on ALL items (real-time)
  const stats = useMemo(() => {
    let variants = 0;
    let totalStock = 0;
    let grandTotal = 0;

    ledgerItems.forEach(item => {
      variants += 1;
      totalStock += Number(item.stock) || 0;
      
      const rate = Number(item.rate) || 0;
      const stock = Number(item.stock) || 0;
      const rowTotal = safeRound(rate * stock);
      grandTotal += rowTotal;
    });

    return {
      totalVariants: variants,
      totalStock,
      grandTotal: safeRound(grandTotal)
    };
  }, [ledgerItems]);

  // Handle upper section 'Add New Product' form matching
  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!newSerial.trim()) {
      setFormError('Serial Number is required');
      return;
    }
    if (!newName.trim()) {
      setFormError('Product Name is required');
      return;
    }
    
    const rateVal = parseFloat(newRate);
    if (isNaN(rateVal) || rateVal < 0) {
      setFormError('Unit Rate must be a positive number');
      return;
    }

    const stockVal = parseInt(newStock, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      setFormError('Available Stock must be a non-negative integer');
      return;
    }

    // Check if duplicate serial
    const serialTrimmed = newSerial.trim();
    const isDuplicate = ledgerItems.some(item => item.serial.toLowerCase() === serialTrimmed.toLowerCase());
    if (isDuplicate) {
      setFormError(`Product with Serial No. "${serialTrimmed}" already exists in the system`);
      return;
    }

    try {
      await addLedgerItem({
        serial: serialTrimmed,
        name: newName.trim(),
        rate: rateVal,
        stock: stockVal
      });

      // Reset
      setNewSerial('');
      setNewName('');
      setNewRate('');
      setNewStock('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (e: any) {
      setFormError(e.message || 'Failed to add ledger item');
    }
  };

  // Inline editing controls
  const startEditing = (item: LedgerItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditRate(String(item.rate));
    setEditStock(String(item.stock));
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveRowEdit = async (id: string, originalSerial: string) => {
    setEditError(null);

    if (!editName.trim()) {
      setEditError('Product name is required');
      return;
    }

    const rateVal = parseFloat(editRate);
    if (isNaN(rateVal) || rateVal < 0) {
      setEditError('Rate must be positive');
      return;
    }

    const stockVal = parseFloat(editStock);
    if (isNaN(stockVal) || stockVal < 0) {
      setEditError('Stock must be non-negative');
      return;
    }

    try {
      await updateLedgerItem(id, {
        name: editName.trim(),
        rate: rateVal,
        stock: Math.floor(stockVal)
      });
      setEditingId(null);
    } catch (e: any) {
      setEditError(e.message || 'Failed to update row');
    }
  };

  // Save computation snapshot
  const handleSaveSnapshot = async () => {
    try {
      // Map all ledger items beautifully with their detailed specification
      const itemsPayload = ledgerItems.map(item => ({
        serial: item.serial,
        name: item.name,
        rate: item.rate,
        stock: item.stock
      }));

      await saveLedgerSnapshot(snapshotNote.trim() || 'Calculated Ledger Snapshot', {
        ...stats,
        items: itemsPayload
      });
      setSnapshotNote('');
      setSnapshotModalOpen(false);
    } catch (e: any) {
      alert('Failed to save calculation snapshot: ' + e.message);
    }
  };

  // Filtered ledger items for table
  const filteredItems = useMemo(() => {
    return ledgerItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.serial.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStock = !showOnlyInStock || item.stock > 0;
      return matchesSearch && matchesStock;
    });
  }, [ledgerItems, searchTerm, showOnlyInStock]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* SECTION Header */}
      <div className="bg-[#081621] p-6 rounded-lg text-white border-l-4 border-[#ef4a23] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Inventory Ledger &amp; Live Calculator</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Real-time valuation registry and ledger sheets for M/S Hasina Traders plumbing supplies.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={isRefreshing}
            className="border border-[#ef4a23]/30 hover:border-[#ef4a23] hover:bg-[#ef4a23]/10 text-gray-300 font-bold text-xs py-2.5 px-3.5 rounded shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            title="Load the custom 49 plumbing supplies"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> Reset &amp; Load New Presets
          </button>
          <button
            onClick={() => setSnapshotModalOpen(true)}
            className="bg-[#ef4a23] hover:bg-red-600 text-white font-bold text-xs py-2.5 px-4 rounded shadow-sm dynamic-button flex items-center gap-2 transition"
          >
            <Bookmark size={15} /> Save Valuation Snapshot
          </button>
        </div>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Total Variants Registered</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono tracking-tight">{stats.totalVariants}</span>
          </div>
          <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
            <Layers size={22} />
          </div>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-slate-400"></div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Total Combined Stock Units</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">{stats.totalStock.toLocaleString()}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
            <Clipboard size={22} />
          </div>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-blue-500"></div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Grand Total Inventory Value</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#ef4a23] font-mono tracking-tight">
              {formatBDTValue(stats.grandTotal)}
            </span>
          </div>
          <div className="bg-orange-50 p-2.5 rounded-lg text-[#ef4a23]">
            <Calculator size={22} />
          </div>
          <div className="absolute left-0 bottom-0 h-1 w-full bg-[#ef4a23]"></div>
        </div>
      </div>

      {/* UPPER SECTION: ADD NEW PRODUCT FORM */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Layers size={18} className="text-[#ef4a23]" />
          <h3 className="font-bold text-md text-slate-800">Add New Ledger Registry Item</h3>
        </div>
        
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-xs font-semibold flex items-center gap-2">
            <X size={15} className="bg-red-100 rounded-full text-red-700 h-5 w-5 p-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="bg-green-100 rounded-full text-green-700 h-5 w-5 p-0.5 shrink-0" />
            <span>Product added to the inventory ledger successfully!</span>
          </div>
        )}

        <form onSubmit={handleAddNewItem} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Serial No.*</label>
            <input
              type="text"
              required
              placeholder="e.g. 45"
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Product Name / Format*</label>
            <input
              type="text"
              required
              placeholder="e.g. 2 inch GI Socket"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Unit Rate (BDT ৳)*</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="0.00"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Available Stock*</label>
            <input
              type="number"
              required
              min="0"
              step="1"
              placeholder="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-[#081621] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded shadow-sm dynamic-button flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={15} /> Add Product
            </button>
          </div>
        </form>
      </div>

      {/* MIDDLE SECTION: INVENTORY LEDGER TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters and search header */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Query by Serial No. or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-medium border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyInStock}
                onChange={(e) => setShowOnlyInStock(e.target.checked)}
                className="h-4 w-4 text-[#ef4a23] rounded focus:ring-orange-500 accent-[#ef4a23]"
              />
              <span>Filter Available Stock &gt; 0 Only</span>
            </label>

            <span className="text-gray-400 font-normal">|</span>
            <span className="text-gray-500 font-mono text-xs">
              Showing <strong className="text-slate-800">{filteredItems.length}</strong> of {ledgerItems.length} products
            </span>
          </div>
        </div>

        {/* The ledger table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#081621] text-white text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-16 text-center border-b border-slate-700">Serial No.</th>
                <th className="py-3.5 px-4 border-b border-slate-700">Product Name / Spec</th>
                <th className="py-3.5 px-4 w-40 text-right border-b border-slate-700">Unit Rate</th>
                <th className="py-3.5 px-4 w-36 text-center border-b border-slate-700">Available Stock</th>
                <th className="py-3.5 px-4 w-48 text-right border-b border-slate-700">Total Amount (BDT)</th>
                <th className="py-3.5 px-4 w-40 text-center border-b border-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                    No matching ledger items found in the system.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const rowTotal = safeRound(Number(item.rate) * Number(item.stock));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Serial */}
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                        {item.serial}
                      </td>

                      {/* Product Name */}
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full max-w-md p-1.5 border border-orange-400 rounded focus:outline-none text-xs text-slate-800 font-semibold"
                            />
                            {editError && (
                              <p className="text-[10px] text-red-600 font-bold">{editError}</p>
                            )}
                          </div>
                        ) : (
                          item.name
                        )}
                      </td>

                      {/* Unit Rate */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span>৳</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-24 p-1.5 border border-orange-400 rounded focus:outline-none text-right font-mono text-xs font-semibold"
                            />
                          </div>
                        ) : (
                          formatBDTValue(item.rate)
                        )}
                      </td>

                      {/* Available Stock */}
                      <td className="py-2.5 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-20 p-1.5 border border-orange-400 rounded focus:outline-none text-center font-mono text-xs font-semibold"
                          />
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${item.stock > 0 ? 'bg-blue-50 text-blue-700 text-[10px]' : 'bg-red-50 text-red-600 text-[10px]'}`}>
                            {item.stock} {item.stock > 0 ? 'units' : 'out'}
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-2.5 px-4 text-right font-mono font-black text-slate-950 text-sm">
                        {formatBDTValue(rowTotal)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveRowEdit(item.id, item.serial)}
                              className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition shadow-sm"
                              title="Save Changes"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition shadow-sm"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : itemToDelete === item.id ? (
                          <div className="flex flex-col items-center justify-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                            <span className="text-[10px] text-red-600 font-bold leading-none select-none">Sure?</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <button
                                onClick={async () => {
                                  await deleteLedgerItem(item.id);
                                  setItemToDelete(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] py-1 px-2.5 rounded transition shadow-sm leading-none"
                                title="Confirm removal"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setItemToDelete(null)}
                                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-[9px] py-1 px-2 rounded transition shadow-sm leading-none"
                                title="Cancel"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditing(item)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded transition"
                              title="Edit Ledger Row"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => setItemToDelete(item.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded transition"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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

      {/* SNAPSHOT HISTORY LOG SECTION */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <FileText size={18} className="text-[#ef4a23]" />
          <h3 className="font-bold text-md text-slate-800">Saved Calculations Log &amp; Valuations</h3>
        </div>

        {ledgerHistory.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded border border-dashed border-gray-200 text-gray-500 font-medium text-xs">
            No valuation snapshots logged yet in the system database. Click 'Save Valuation Snapshot' to commit current sheet calculations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ledgerHistory.map((snap) => {
              const isExpanded = !!expandedHistories[snap.id];
              return (
                <div key={snap.id} className="p-4 border border-gray-100 bg-gray-50/50 hover:bg-slate-50 rounded-lg shadow-md transition space-y-3 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{snap.note || "Calculated Ledger Sheet Snapshot"}</h4>
                        <p className="text-gray-400 text-[10px] sm:text-xs tracking-wide font-mono">
                          {new Date(snap.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-[#ef4a23]/10 text-[#ef4a23] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap">
                        Snapshot Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white border border-gray-100 p-2.5 rounded text-center mt-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Variants</span>
                        <span className="text-xs font-bold text-slate-700">{snap.totalVariants} Items</span>
                      </div>
                      <div className="space-y-0.5 border-x border-gray-100">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Stock</span>
                        <span className="text-xs font-bold text-slate-700">{snap.totalStock.toLocaleString()} Units</span>
                      </div>
                      <div className="space-y-0.5 font-mono font-bold">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Grand Total</span>
                        <span className="text-xs font-black text-[#ef4a23]">{formatBDTValue(snap.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Expandable items detail container */}
                    {isExpanded && snap.items && snap.items.length > 0 && (
                      <div className="mt-3 bg-white border border-gray-100 rounded overflow-hidden max-h-60 overflow-y-auto animate-fadeIn select-all">
                        <div className="bg-[#081621] text-white text-[9px] uppercase font-bold p-1.5 grid grid-cols-12 sticky top-0">
                          <span className="col-span-2 text-center">SL</span>
                          <span className="col-span-6">Product / Specification</span>
                          <span className="col-span-2 text-right">Rate</span>
                          <span className="col-span-2 text-center">Stock</span>
                        </div>
                        <div className="divide-y divide-gray-50 text-[10px]">
                          {snap.items.map((item, index) => (
                            <div key={index} className="p-1.5 grid grid-cols-12 hover:bg-slate-50 font-medium text-slate-700">
                              <span className="col-span-2 text-center font-bold font-mono text-slate-400">{item.serial}</span>
                              <span className="col-span-6 font-semibold shrink-0 truncate" title={item.name}>{item.name}</span>
                              <span className="col-span-2 text-right font-mono text-slate-600">৳{item.rate}</span>
                              <span className="col-span-2 text-center font-mono">{item.stock}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => toggleHistoryExpand(snap.id)}
                      className="text-[11px] font-bold text-[#ef4a23] hover:text-red-700 flex items-center gap-1 cursor-pointer transition focus:outline-none"
                    >
                      {isExpanded ? (
                        <>Collapse Snapshot Details ↑</>
                      ) : (
                        <>Expand Snapshot Details ({snap.items?.length || snap.totalVariants} items) ↓</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SAVE COMPUTED SNAPSHOT MODAL */}
      {snapshotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-t-4 border-[#ef4a23] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#081621] text-white">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Bookmark size={15} /> Save Valuation Snapshot
              </h3>
              <button onClick={() => setSnapshotModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">
                This commits the current inventory counts, unit rates, and total computed valuation of 
                <strong className="text-slate-800"> {stats.totalVariants} variants</strong> ({stats.totalStock.toLocaleString()} total stock units) 
                amounting to <strong className="text-[#ef4a23]">{formatBDTValue(stats.grandTotal)}</strong> to the secure database system log for historical reports.
              </p>

              <div className="space-y-1">
                <label className="block text-gray-700 text-xs font-bold uppercase">Custom Snapshot Note / Description</label>
                <textarea
                  className="w-full text-xs font-semibold p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  rows={3}
                  placeholder="e.g. End of Month plumbing stock audit, Babul verification..."
                  value={snapshotNote}
                  onChange={(e) => setSnapshotNote(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setSnapshotModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold text-xs py-2 px-4 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="bg-[#ef4a23] hover:bg-red-600 text-white font-bold text-xs py-2 px-4 rounded transition shadow-sm"
              >
                Confirm Snapshot &amp; Commit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border-t-4 border-red-600 overflow-hidden text-slate-800">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#081621] text-white">
              <h3 className="font-bold text-xs tracking-tight flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500 animate-pulse" /> Overwrite Ledger Presets?
              </h3>
              <button onClick={() => setShowResetConfirm(false)} className="text-gray-400 hover:text-white transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs leading-relaxed">
              <p>
                Are you sure you want to overwrite your ledger with the 49 custom plumbing products specified?
              </p>
              <p className="font-semibold text-red-600 p-2 bg-red-50 border border-red-100 rounded">
                ⚠️ WARNING: This will reset all current product rates and stock levels to 0. This cannot be undone!
              </p>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-[11px]">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold py-1.5 px-3 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowResetConfirm(false);
                  setIsRefreshing(true);
                  await resetLedgerToNewPresets();
                  setIsRefreshing(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded transition shadow-sm"
              >
                Yes, Load Presets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
