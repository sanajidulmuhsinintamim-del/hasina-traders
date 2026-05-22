import React, { useState } from 'react';
import { useStore } from './StoreProvider';
import { Search, ShoppingCart, User, Phone, MapPin, CheckCircle, ChevronDown, Filter } from 'lucide-react';
import { Product, CartItem } from './types';

export const Storefront = ({ onOpenAdmin }: { onOpenAdmin: () => void }) => {
  const { products, categories, brands, addOnlineOrder } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'In Stock' | 'Pre Order' | 'Upcoming'>('All');
  const [sortMethod, setSortMethod] = useState<'Default' | 'Price L-H' | 'Price H-L'>('Default');
  const [displayCount, setDisplayCount] = useState<20 | 50 | 100>(20);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [showNotification, setShowNotification] = useState('');

  // Filtering
  let filtered = products;
  if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
  if (activeBrand !== 'All') filtered = filtered.filter(p => p.brand === activeBrand);
  if (stockFilter !== 'All') filtered = filtered.filter(p => p.availability === stockFilter);
  
  // Sorting
  if (sortMethod === 'Price L-H') filtered.sort((a,b) => a.salePrice - b.salePrice);
  if (sortMethod === 'Price H-L') filtered.sort((a,b) => b.salePrice - a.salePrice);
  
  // Display count
  filtered = filtered.slice(0, displayCount);

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setShowNotification(`${product.name} added to cart!`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent, gw: string) => {
    e.preventDefault();
    if(cart.length === 0) return;
    addOnlineOrder({
      items: cart,
      total: cartTotal,
      status: 'Pending',
      gateway: gw,
      customerName: 'Guest Customer',
      phone: '01xxxxxxxxx'
    });
    setCart([]);
    setIsCheckout(false);
    setShowNotification('Order Placed Successfully via ' + gw);
    setTimeout(() => setShowNotification(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex flex-col font-sans">
      {/* Flash Offer Top Bar */}
      <div className="bg-[#ef4a23] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        MASSIVE WAREHOUSE SALE! GET UP TO 15% OFF ON BSRM ROD & SEVEN RINGS CEMENT. CALL TODAY!
      </div>

      {/* Main Header (Like Star Tech) */}
      <header className="bg-[#081621] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div>
                <h1 className="text-2xl font-black tracking-tight text-white m-0 leading-none">মেসার্স হাসিনা ট্রেডার্স</h1>
                <p className="text-[#ef4a23] text-sm font-medium mt-1 tracking-wider">নির্মাণে সেরাটা পেতে আজই আস্থা রাখুন</p>
             </div>
          </div>

          <div className="flex-1 w-full max-w-xl mx-8 relative">
             <input type="text" placeholder="Search products, brands, categories..." className="w-full bg-white text-gray-900 rounded-sm py-2.5 px-4 pr-10 outline-none text-sm placeholder:text-gray-400"/>
             <Search size={18} className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-[#ef4a23] transition-colors"/>
          </div>

          <div className="flex gap-6 items-center">
             <div className="flex flex-col text-right hidden lg:flex">
               <span className="text-gray-400 text-xs">Hotline</span>
               <span className="font-bold text-white text-sm">01988-030534</span>
             </div>
             <button onClick={() => setIsCheckout(true)} className="relative flex items-center gap-2 hover:text-[#ef4a23] transition-colors group">
               <ShoppingCart size={24} className="group-hover:-translate-y-1 transition-transform" />
               <div className="absolute -top-2 -right-2 bg-[#ef4a23] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#081621]">
                 {cart.reduce((a,c) => a + c.quantity, 0)}
               </div>
             </button>
             <button onClick={onOpenAdmin} className="text-white hover:text-[#ef4a23] flex items-center gap-1 transition-colors ml-2" title="Admin Login">
               <User size={24} />
               <span className="hidden sm:inline font-bold text-sm ml-1">Admin</span>
             </button>
          </div>
        </div>
        
        {/* Navbar */}
        <div className="border-t border-white/5 bg-[#0a1e2e]">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveCategory('All')} className={`px-4 py-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === 'All' ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-200'}`}>All Categories</button>
             {categories.map(c => (
               <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === c ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-200'}`}>{c}</button>
             ))}
          </div>
        </div>
      </header>

      {showNotification && (
        <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-4 rounded shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom border-l-4 border-[#ef4a23]">
          <CheckCircle className="text-[#ef4a23]" size={20} />
          <span className="font-medium text-sm">{showNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar (Filters) */}
        {!isCheckout && (
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-900 border-b pb-2 tracking-tight">Availability</h3>
               <div className="mt-3 space-y-2">
                 {['All', 'In Stock', 'Pre Order', 'Upcoming'].map(s => (
                   <label key={s} className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="stock" checked={stockFilter === s} onChange={() => setStockFilter(s as any)} className="w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" />
                     <span className="text-sm text-gray-700 group-hover:text-[#ef4a23] transition-colors">{s}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-900 border-b pb-2 tracking-tight">Filter By Brand</h3>
               <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                 <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="brand" checked={activeBrand === 'All'} onChange={() => setActiveBrand('All')} className="text-[#ef4a23] focus:ring-[#ef4a23] w-4 h-4" />
                     <span className="text-sm text-gray-700">All Brands</span>
                 </label>
                 {brands.map(b => (
                   <label key={b} className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="brand" checked={activeBrand === b} onChange={() => setActiveBrand(b)} className="text-[#ef4a23] focus:ring-[#ef4a23] w-4 h-4 cursor-pointer" />
                     <span className="text-sm text-gray-700 group-hover:text-[#ef4a23] transition-colors">{b}</span>
                   </label>
                 ))}
               </div>
            </div>
          </aside>
        )}

        {/* Product Grid Area */}
        {!isCheckout ? (
          <div className="flex-1">
            {/* Sorting & Filter Bar */}
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-6 flex flex-wrap justify-between items-center gap-4">
               <h2 className="text-sm font-semibold text-gray-700">
                 {filtered.length} {filtered.length === 1 ? 'Product' : 'Products'} found
               </h2>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 font-medium">Show:</span>
                   <select value={displayCount} onChange={e=>setDisplayCount(Number(e.target.value) as any)} className="bg-gray-50 border border-gray-200 text-sm rounded px-2 py-1 outline-none focus:border-[#ef4a23]">
                     <option value={20}>20</option>
                     <option value={50}>50</option>
                     <option value={100}>100</option>
                   </select>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 font-medium">Sort By:</span>
                   <select value={sortMethod} onChange={e=>setSortMethod(e.target.value as any)} className="bg-gray-50 border border-gray-200 text-sm rounded px-2 py-1 outline-none focus:border-[#ef4a23]">
                     <option>Default</option>
                     <option>Price L-H</option>
                     <option>Price H-L</option>
                   </select>
                 </div>
               </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => {
                const saveAmount = p.regularPrice - p.salePrice;
                return (
                  <div key={p.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 relative border border-gray-100 flex flex-col justify-between group">
                    
                    {/* Top Left Star Tech Structural Pricing Badge Overlay */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                       <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded shadow-sm">Regular: ৳{p.regularPrice.toLocaleString()}</span>
                       <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">Sale: ৳{p.salePrice.toLocaleString()}</span>
                       {saveAmount > 0 && (
                         <div className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm animate-pulse">
                           Save: ৳{saveAmount.toLocaleString()}
                         </div>
                       )}
                    </div>

                    {/* Availability Flag Badge (Top Right Side Overlay) */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold shadow-sm ${
                        p.availability === 'In Stock' ? 'bg-green-100 text-green-700' :
                        p.availability === 'Pre Order' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {p.availability || 'In Stock'}
                      </span>
                    </div>

                    {/* Product Visual Presentation Frame */}
                    <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-50 mb-4 pt-4 mt-10">
                       <img src={p.imageUrl} alt={p.name} className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{p.brand || 'Generic'}</span>
                        <h3 className="text-gray-800 font-bold text-base line-clamp-2 mt-0.5 group-hover:text-blue-600 cursor-pointer">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-black text-red-600">৳{p.salePrice.toLocaleString()}</span>
                          {p.regularPrice > p.salePrice && (
                            <span className="text-xs text-gray-400 line-through">৳{p.regularPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          disabled={p.availability !== 'In Stock'}
                          className={`w-full font-bold py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow-md ${
                            p.availability === 'In Stock' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          🛒 {p.availability === 'In Stock' ? 'Add to Cart' : p.availability}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 bg-white border border-gray-200 border-dashed rounded">
                  No products found for this criteria.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-4xl mx-auto bg-white p-8 rounded shadow-sm border border-gray-200 mb-10">
            <button onClick={()=>setIsCheckout(false)} className="text-sm font-semibold text-gray-500 mb-6 hover:text-[#ef4a23] flex items-center gap-1">&larr; Back to Shopping</button>
            <h2 className="text-2xl font-bold text-[#081621] mb-6 border-b pb-4">Secure Checkout</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 py-8 text-center bg-gray-50 rounded">Your cart is empty.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {cart.map(c => (
                      <div key={c.product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                        <div className="flex items-center gap-3 w-3/4">
                          <img src={c.product.imageUrl} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{c.product.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{c.quantity} x ৳{c.product.salePrice.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="font-bold font-mono text-[#ef4a23] text-sm">৳{(c.product.salePrice * c.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-lg">Total Amount</span>
                    <span className="font-black text-3xl font-mono text-[#081621]">৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                   <h3 className="font-bold text-lg mb-4 text-gray-800">Bangladeshi Payment Simulator</h3>
                   <div className="space-y-3">
                     {[
                       { id: 'bKash', color: 'bg-[#e2136e]', text: 'white' },
                       { id: 'Nagad', color: 'bg-[#f37c35]', text: 'white' },
                       { id: 'Rocket', color: 'bg-[#8c2d82]', text: 'white' },
                       { id: 'Credit Card', color: 'bg-[#081621]', text: 'white' },
                     ].map(gw => (
                       <button
                         key={gw.id}
                         onClick={(e) => handleCheckoutSubmit(e, gw.id)}
                         className={`w-full py-4 rounded font-bold text-lg shadow-sm transform transition-all active:scale-[0.98] hover:opacity-90 ${gw.color}`}
                         style={{ color: gw.text }}
                       >
                         Pay with {gw.id}
                       </button>
                     ))}
                   </div>
                   <p className="text-xs text-gray-400 mt-6 text-center italic">This securely simulates a payment gateway for testing and admin preview.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#081621] text-gray-300 py-12 mt-auto border-t-4 border-[#ef4a23]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div>
             <h2 className="text-xl font-bold text-white mb-2">মেসার্স হাসিনা ট্রেডার্স</h2>
             <p className="text-sm text-gray-400 mb-4">Premium Building Materials and Sanitary Store</p>
             <div className="space-y-2">
               <p className="flex items-center gap-2 text-sm"><MapPin size={16} className="text-[#ef4a23]" /> Batikamari Bazar, Bangladesh</p>
               <p className="flex items-center gap-2 text-sm"><User size={16} className="text-[#ef4a23]" /> Prop: Babul Matubbar</p>
             </div>
           </div>
           <div>
             <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
             <ul className="space-y-3">
               <li className="flex items-center gap-3 text-sm hover:text-white transition-colors cursor-pointer"><Phone size={16} className="text-gray-400" /> +880-1988030534</li>
               <li className="flex items-center gap-3 text-sm hover:text-white transition-colors cursor-pointer"><Phone size={16} className="text-gray-400" /> +880-1996418168</li>
               <li className="flex items-center gap-3 text-sm hover:text-white transition-colors cursor-pointer"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-4">@</span> tradersmshasina@gmail.com</li>
             </ul>
           </div>
           <div>
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">About System</h3>
              <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-4 mb-4">
                Powered by a robust offline/online dual engine. Designed to handle intense retail loads while providing a premium online storefront experience.
              </p>
              <button onClick={onOpenAdmin} className="text-[#ef4a23] hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors">
                 <User size={16} /> Secure Admin Login
              </button>
           </div>
        </div>
      </footer>
    </div>
  );
};
