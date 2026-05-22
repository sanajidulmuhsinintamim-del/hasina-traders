import React, { useState, useMemo } from 'react';
import { useStore } from './StoreProvider';
import { LogOut, Package, Database, BarChart3, Plus, Tags, Trash2, Calendar, TrendingUp, Edit } from 'lucide-react';
import { OfflineSale, Product } from './types';
import { loginWithGoogle, logoutUser } from './firebase';

export const AdminLogin = ({ onOpenStore }: { onOpenStore: () => void }) => {
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-[#081621] relative">
        <button type="button" onClick={onOpenStore} className="absolute -top-12 left-0 text-sm font-semibold text-gray-500 hover:text-[#081621] flex items-center gap-1">&larr; Back to Storefront</button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#081621]">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-1">M/S Hasina Traders</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
        <div className="mb-6 text-center text-sm text-gray-600">
          <p>Login securely with your Google Account.</p>
          <p className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">Authorized: sanajidul.muhsinin.tamim@gmail.com</p>
        </div>
        <button type="submit" className="w-full bg-[#ef4a23] hover:bg-red-600 text-white py-3 rounded font-semibold transition-colors flex justify-center items-center gap-2">
          Sign In with Google
        </button>
      </form>
    </div>
  );
};

export const AdminPanel = ({ onOpenStore }: { onOpenStore: () => void }) => {
  const [activeTab, setActiveTab] = useState<'POS' | 'PRODUCTS' | 'BRANDS' | 'STATS'>('POS');

  const navItems = [
    { id: 'POS', label: 'Offline POS Ledger', icon: Database },
    { id: 'PRODUCTS', label: 'Online DB Management', icon: Package },
    { id: 'BRANDS', label: 'Brand Registry', icon: Tags },
    { id: 'STATS', label: 'Unified Analytics', icon: BarChart3 }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 flex flex-col">
      <header className="bg-[#081621] text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg"><Database size={20} className="text-[#ef4a23]"/></div>
          <h1 className="font-bold text-xl tracking-tight">System Admin <span className="text-xs font-normal text-gray-400 block -mt-1">M/S Hasina Traders</span></h1>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-4">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === item.id ? 'bg-[#ef4a23] text-white' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-6 border-l border-white/20 pl-6">
            <button onClick={onOpenStore} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium">
              Storefront
            </button>
            <button onClick={async () => { await logoutUser(); }} className="flex items-center gap-2 text-[#ef4a23] hover:text-red-400 text-sm font-medium">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'POS' && <OffilePOS />}
        {activeTab === 'PRODUCTS' && <ProductManager />}
        {activeTab === 'BRANDS' && <BrandManager />}
        {activeTab === 'STATS' && <Statistics />}
      </main>
    </div>
  );
};

const OffilePOS = () => {
  const { brands, addOfflineSale, offlineSales } = useStore();
  const [brand, setBrand] = useState(brands[0] || '');
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState<OfflineSale['unit']>('KG');
  const [qty, setQty] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  const total = (Number(qty) || 0) * (Number(unitPrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !itemName || !qty || !unitPrice) return;
    addOfflineSale({ brand, itemName, unit, qty: Number(qty), unitPrice: Number(unitPrice), total });
    setItemName('');
    setQty('');
    setUnitPrice('');
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const todaySales = offlineSales.filter(s => s.timestamp >= todayStart);
  const yesterdaySales = offlineSales.filter(s => s.timestamp < todayStart && s.timestamp >= (todayStart - 86400000));

  const formatTime = (ts: number) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second:'2-digit' }).format(ts);
  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(ts);

  const SalesTable = ({ sales, title, accent }: { sales: OfflineSale[], title: string, accent: string }) => (
    <div className={`bg-white rounded-lg shadow-sm border-t-4 ${accent} overflow-hidden`}>
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18} className="text-gray-500"/>{title}</h3>
        <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">Total: ৳{sales.reduce((acc, s) => acc + s.total, 0).toLocaleString()}</span>
      </div>
      {sales.length === 0 ? <p className="p-6 text-sm text-gray-500 text-center">No transactions recorded.</p> : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Brand & Item</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Unit Price</th>
              <th className="px-6 py-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap text-gray-500">{formatTime(s.timestamp)}</td>
                <td className="px-6 py-3 text-gray-800"><span className="font-semibold text-[#081621]">{s.brand}</span> - {s.itemName}</td>
                <td className="px-6 py-3 font-mono">{s.qty} {s.unit}</td>
                <td className="px-6 py-3 font-mono">৳{s.unitPrice.toLocaleString()}</td>
                <td className="px-6 py-3 font-mono font-semibold text-[#ef4a23]">৳{s.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 bg-[#ef4a23] rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">High-Speed Terminal</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Brand</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full border-gray-300 rounded-md bg-gray-50 p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none border">
               {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Item Description</label>
            <input placeholder="e.g. 16mm Steel Rod" value={itemName} onChange={e => setItemName(e.target.value)} required className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
          </div>
          <div className="md:col-span-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value as any)} className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none">
                {['KG', 'Bag', 'Piece', 'Pft', 'Ton'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Qty</label>
                <input type="number" min="0" step="any" value={qty} onChange={e => setQty(e.target.value)} required className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm font-mono focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Price/Unit (৳)</label>
                <input type="number" min="0" step="any" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm font-mono focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
             </div>
          </div>
          
          <div className="md:col-span-6 flex items-center justify-between border-t border-gray-100 pt-6 mt-2">
            <div className="space-y-1">
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Live Calculation</p>
               <p className="text-3xl font-bold font-mono text-[#081621] tracking-tight">৳{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            
            <button type="submit" className="bg-[#ef4a23] hover:bg-[#d83c17] text-white px-8 py-3 rounded-md font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={20} /> Add Recorded Entry to Save
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <SalesTable sales={todaySales} title="Today's Sales Box" accent="border-[#ef4a23]" />
         <SalesTable sales={yesterdaySales} title={`Yesterday's Sales Box (${formatDate(todayStart - 86400000)})`} accent="border-gray-400" />
      </div>
    </div>
  );
};

const ProductManager = () => {
  const { products, brands, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const InitialState = { name: '', brand: brands[0] || '', category: categories[0] || '', description: '', regularPrice: '', salePrice: '', availability: 'In Stock' as const, imageUrl: '' };
  const [form, setForm] = useState(InitialState);

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      regularPrice: p.regularPrice.toString(),
      salePrice: p.salePrice.toString(),
      availability: p.availability,
      imageUrl: p.imageUrl
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const cancelAdd = () => {
    setForm(InitialState);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, {
          ...form,
          regularPrice: Number(form.regularPrice),
          salePrice: Number(form.salePrice)
        });
      } else {
        await addProduct({
          ...form,
          regularPrice: Number(form.regularPrice),
          salePrice: Number(form.salePrice)
        });
      }
      setForm(InitialState);
      setIsAdding(false);
      setEditingId(null);
    } catch (err: any) {
      alert("Failed to save product: " + (err.message || String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
         <h2 className="text-lg font-bold text-[#081621] flex items-center gap-2"><Package className="text-[#ef4a23]"/> Online Products</h2>
         <button onClick={() => isAdding ? cancelAdd() : setIsAdding(true)} className="bg-[#081621] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0c2233] transition-colors">
            {isAdding ? 'Cancel' : '+ New Product'}
         </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-sm border border-[#ef4a23]/30 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
               <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                <select value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]">
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Detailed Description & Specs</label>
               <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required className="w-full border rounded p-2 text-sm h-24 outline-none focus:border-[#ef4a23]" />
            </div>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Regular Price (৳)</label>
                    <input type="number" value={form.regularPrice} onChange={e=>setForm({...form, regularPrice:e.target.value})} required className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sale Price (৳)</label>
                    <input type="number" value={form.salePrice} onChange={e=>setForm({...form, salePrice:e.target.value})} required className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]" />
                  </div>
               </div>
               <div className="flex gap-4 items-center p-3 bg-green-50 rounded border border-green-100">
                  <span className="text-xs text-green-700 font-semibold uppercase">Save Amount Calculation:</span>
                  <span className="text-lg font-mono font-bold text-green-600">৳{ (Number(form.regularPrice) || 0) - (Number(form.salePrice) || 0) }</span>
               </div>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Availability</label>
               <select value={form.availability} onChange={e=>setForm({...form, availability:e.target.value as any})} className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]">
                  <option>In Stock</option>
                  <option>Pre Order</option>
                  <option>Upcoming</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Product Image (Upload)</label>
               <input type="file" accept="image/*" onChange={(e)=>{
                  const file = e.target.files?.[0];
                  if(file) {
                     if(file.size > 600 * 1024) {
                        alert("Image too large! Please use a smaller image (under 600KB) to ensure it saves correctly.");
                        return;
                     }
                     const reader = new FileReader();
                     reader.onloadend = () => setForm({...form, imageUrl: reader.result as string});
                     reader.readAsDataURL(file);
                  }
               }} className="w-full border rounded p-1.5 text-sm outline-none focus:border-[#ef4a23]" />
               {form.imageUrl && <div className="mt-1 text-xs text-green-600 font-semibold">Image selected ✓</div>}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button type="submit" className="bg-[#ef4a23] text-white px-6 py-2 rounded font-semibold hover:bg-red-600 transition-colors">{editingId ? 'Update Product' : 'Publish Product'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-sm text-left">
           <thead className="bg-[#081621] text-white/90 text-xs uppercase">
             <tr>
               <th className="px-4 py-3">Product</th>
               <th className="px-4 py-3">Category</th>
               <th className="px-4 py-3">Regular Price</th>
               <th className="px-4 py-3">Sale Price</th>
               <th className="px-4 py-3">Status</th>
               <th className="px-4 py-3 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {products.map(p => (
               <tr key={p.id} className="hover:bg-gray-50">
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded border" />
                      <div>
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.brand}</div>
                      </div>
                   </div>
                 </td>
                 <td className="px-4 py-3 text-gray-600">{p.category}</td>
                 <td className="px-4 py-3 font-mono text-gray-500 line-through">৳{p.regularPrice.toLocaleString()}</td>
                 <td className="px-4 py-3 font-mono text-[#ef4a23] font-bold">৳{p.salePrice.toLocaleString()}</td>
                 <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.availability === 'In Stock' ? 'bg-green-100 text-green-700' : p.availability === 'Pre Order' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.availability}
                    </span>
                 </td>
                 <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="text-blue-500 hover:text-blue-700 p-1 mr-2" title="Edit"><Edit size={18}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete"><Trash2 size={18}/></button>
                 </td>
               </tr>
             ))}
             {products.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No products found.</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
};

const BrandManager = () => {
  const { brands, addBrand, removeBrand } = useStore();
  const [newBrand, setNewBrand] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(newBrand.trim()) {
      addBrand(newBrand.trim());
      setNewBrand('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h2 className="text-lg font-bold text-[#081621] flex items-center gap-2 mb-4"><Tags className="text-[#ef4a23]"/> Global Brand Registry</h2>
         <form onSubmit={handleAdd} className="flex gap-2 mb-8">
            <input value={newBrand} onChange={e=>setNewBrand(e.target.value)} placeholder="Type new brand name..." className="flex-1 border rounded p-2 outline-none focus:border-[#ef4a23] text-sm" />
            <button type="submit" className="bg-[#081621] text-white px-6 py-2 rounded text-sm font-semibold hover:bg-gray-800">Add Brand</button>
         </form>

         <div className="flex flex-wrap gap-3">
            {brands.map(b => (
              <div key={b} className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3 text-sm font-medium text-gray-800">
                {b}
                <button onClick={() => removeBrand(b)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
         </div>
       </div>
    </div>
  );
};

const Statistics = () => {
  const { products, onlineOrders, offlineSales } = useStore();
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayOffline = offlineSales.filter(s => s.timestamp >= todayStart);

  // Group by brand logic for offline today
  const offlineBreakdown = todayOffline.reduce((acc, sale) => {
    const key = `${sale.brand} - ${sale.itemName}`;
    if (!acc[key]) acc[key] = { qty: 0, revenue: 0, unit: sale.unit };
    acc[key].qty += sale.qty;
    acc[key].revenue += sale.total;
    return acc;
  }, {} as Record<string, {qty: number, revenue: number, unit: string}>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-[#081621]">
            <h3 className="font-bold text-gray-800 mb-2">Online Store Overview</h3>
            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="p-4 bg-gray-50 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Total Products</p>
                  <p className="text-3xl font-bold text-[#081621] font-mono">{products.length}</p>
               </div>
               <div className="p-4 bg-gray-50 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Lifetime Orders</p>
                  <p className="text-3xl font-bold text-[#081621] font-mono">{onlineOrders.length}</p>
               </div>
               <div className="col-span-2 p-4 bg-gray-50 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Total Online Revenue</p>
                  <p className="text-3xl font-bold text-[#ef4a23] font-mono">৳{onlineOrders.reduce((a,o)=>a+o.total,0).toLocaleString()}</p>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-[#ef4a23]">
            <h3 className="font-bold text-gray-800 mb-2">Offline Physical Store (Today)</h3>
            <div className="p-4 bg-orange-50 rounded border border-orange-100 mb-6 mt-6">
                <p className="text-xs text-orange-700 font-semibold mb-1 uppercase">Today's Offline Revenue</p>
                <p className="text-4xl font-bold text-[#ef4a23] font-mono">৳{todayOffline.reduce((a,o)=>a+o.total,0).toLocaleString()}</p>
            </div>
            
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Item Breakdown (Today)</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
               {Object.entries(offlineBreakdown).length === 0 ? <p className="text-sm text-gray-400 italic">No sales yet.</p> : (
                 Object.entries(offlineBreakdown).map(([name, data]) => (
                   <div key={name} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded border border-gray-100">
                     <span className="font-medium text-gray-800 w-2/3 truncate">{name}</span>
                     <span className="font-mono text-gray-500">{data.qty} {data.unit}</span>
                     <span className="font-mono font-semibold text-[#081621]">৳{data.revenue.toLocaleString()}</span>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  )
};
