import React, { useState } from 'react';
import { useStore } from './StoreProvider';
import { Search, ShoppingCart, User, Phone, MapPin, CheckCircle, ChevronDown, Filter, Plus, Minus, Trash2, X } from 'lucide-react';
import { Product, CartItem } from './types';

export const Storefront = ({ onOpenAdmin }: { onOpenAdmin: () => void }) => {
  const { products, categories, brands, addOnlineOrder } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'In Stock' | 'Pre Order' | 'Upcoming'>('All');
  const [sortMethod, setSortMethod] = useState<'Default' | 'Price L-H' | 'Price H-L'>('Default');
  const [displayCount, setDisplayCount] = useState<20 | 50 | 100>(20);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [showNotification, setShowNotification] = useState('');
  
  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    name: '', phone: '', altPhone: '', address: '', district: 'Dhaka', thana: '', notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

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
  const cartItemCount = cart.reduce((a,c) => a + c.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setShowNotification(`${product.name} added to cart!`);
    setTimeout(() => setShowNotification(''), 3000);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(cart.length === 0) return;
    
    // Basic phone validation for BD (11 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(checkoutForm.phone)) {
       alert("Please enter a valid 11-digit Bangladeshi phone number (e.g., 017XXXXXXXX)");
       return;
    }

    addOnlineOrder({
      customerInfo: {
        ...checkoutForm,
        paymentMethod
      },
      items: cart,
      subtotal: cartTotal,
      deliveryCharge: checkoutForm.district === 'Dhaka' ? 60 : 120,
      total: cartTotal + (checkoutForm.district === 'Dhaka' ? 60 : 120),
      status: 'Pending'
    });
    setCart([]);
    setIsCheckout(false);
    setCheckoutForm({ name: '', phone: '', altPhone: '', address: '', district: 'Dhaka', thana: '', notes: '' });
    setShowNotification('Order Placed Successfully! Your items are on the way.');
    setTimeout(() => setShowNotification(''), 4000);
  };

  const districts = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Faridpur', 'Gopalganj'];

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex flex-col font-sans relative">
      {/* Flash Offer Top Bar */}
      <div className="bg-[#ef4a23] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        MASSIVE WAREHOUSE SALE! GET UP TO 15% OFF ON BSRM ROD & SEVEN RINGS CEMENT. CALL TODAY!
      </div>

      {/* Main Header (Like Star Tech) */}
      <header className="bg-[#081621] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="cursor-pointer" onClick={() => setIsCheckout(false)}>
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
             <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 hover:text-[#ef4a23] transition-colors group">
               <ShoppingCart size={24} className="group-hover:-translate-y-1 transition-transform" />
               <div className="absolute -top-2 -right-2 bg-[#ef4a23] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#081621]">
                 {cartItemCount}
               </div>
               {cartItemCount > 0 && <span className="text-sm font-bold ml-1">৳{cartTotal.toLocaleString()}</span>}
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
             <button onClick={() => {setActiveCategory('All'); setIsCheckout(false);}} className={`px-4 py-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === 'All' && !isCheckout ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-200'}`}>All Categories</button>
             {categories.map(c => (
               <button key={c} onClick={() => {setActiveCategory(c); setIsCheckout(false);}} className={`px-4 py-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === c && !isCheckout ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-200'}`}>{c}</button>
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

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
               <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ShoppingCart size={20} className="text-[#ef4a23]"/> Your Cart</h2>
               <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {cart.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                   <ShoppingCart size={40} className="opacity-20" />
                   <p>Your cart is empty</p>
                 </div>
               ) : cart.map(c => (
                 <div key={c.product.id} className="flex gap-3 bg-white border border-gray-100 p-2 rounded relative group hover:border-gray-200 transition-colors">
                    <img src={c.product.imageUrl} alt={c.product.name} className="w-16 h-16 object-contain rounded bg-gray-50 p-1" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 pr-6 leading-tight">{c.product.name}</h4>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{c.product.brand}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded p-0.5">
                          <button onClick={() => updateCartQty(c.product.id, -1)} disabled={c.quantity <= 1} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#ef4a23] disabled:opacity-30"><Minus size={12}/></button>
                          <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                          <button onClick={() => updateCartQty(c.product.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#ef4a23]"><Plus size={12}/></button>
                        </div>
                        <span className="font-bold text-[#ef4a23] text-sm">৳{(c.product.salePrice * c.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(c.product.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full"><Trash2 size={16}/></button>
                 </div>
               ))}
             </div>

             <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-gray-800">
                  <span className="font-semibold text-sm">Subtotal:</span>
                  <span className="font-bold text-lg font-mono">৳{cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckout(true);
                  }} 
                  disabled={cart.length === 0}
                  className="w-full bg-[#ef4a23] hover:bg-[#d83c17] disabled:bg-gray-300 text-white font-bold py-3 rounded shadow-md transition-colors flex justify-center items-center gap-2"
                >
                  Proceed to Checkout
                </button>
             </div>
          </div>
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

        {/* Product Grid Area or Checkout Area */}
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
                    <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-50 mb-4 pt-4 mt-8">
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
          <div className="flex-1 w-full max-w-6xl mx-auto rounded mb-10 animate-in fade-in zoom-in-95 duration-300">
            <button onClick={()=>setIsCheckout(false)} className="text-sm font-semibold text-gray-500 mb-6 hover:text-[#ef4a23] flex items-center gap-1 transition-colors">&larr; Back to Shopping</button>
            <h2 className="text-2xl font-black text-[#081621] mb-6 border-b-2 border-gray-200 pb-4">Secure Checkout</h2>
            
            {cart.length === 0 ? (
              <div className="bg-white p-16 text-center shadow-sm border border-gray-200 rounded-lg">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-600 font-medium">Your shopping cart is currently empty.</p>
                <button onClick={()=>setIsCheckout(false)} className="mt-6 bg-[#ef4a23] text-white px-6 py-2 rounded font-bold hover:bg-orange-600 transition-colors">Start Shopping</button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Checkout Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                        <input required value={checkoutForm.name} onChange={e=>setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Enter your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                        <input required value={checkoutForm.phone} onChange={e=>setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="01XXXXXXXXX" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Alternative Phone (Optional)</label>
                        <input value={checkoutForm.altPhone} onChange={e=>setCheckoutForm({...checkoutForm, altPhone: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="01XXXXXXXXX" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Delivery Address *</label>
                        <textarea required value={checkoutForm.address} onChange={e=>setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border border-gray-300 rounded p-2 h-20 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="House number, street name..." />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                        <select required value={checkoutForm.district} onChange={e=>setCheckoutForm({...checkoutForm, district: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#ef4a23] outline-none bg-white">
                          {districts.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Area / Thana / Post Code *</label>
                        <input required value={checkoutForm.thana} onChange={e=>setCheckoutForm({...checkoutForm, thana: e.target.value})} className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Enter Area or Thana" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Order Notes / Special Instructions (Optional)</label>
                        <textarea value={checkoutForm.notes} onChange={e=>setCheckoutForm({...checkoutForm, notes: e.target.value})} className="w-full border border-gray-300 rounded p-2 h-16 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Any special delivery instructions..." />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Payment Method</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[ 
                        { id: 'Cash on Delivery', sub: 'Pay securely after receiving', icon: '🚚' },
                        { id: 'bKash', sub: 'Mobile Banking', icon: '৳' },
                        { id: 'Nagad', sub: 'Mobile Banking', icon: '৳' },
                        { id: 'Credit/Debit Card', sub: 'Visa, MasterCard, Amex', icon: '💳' }
                      ].map(method => (
                        <label key={method.id} className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-[#ef4a23] bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                           <input type="radio" required name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" />
                           <div>
                             <p className="font-bold text-sm text-gray-800 flex items-center gap-1">{method.icon} {method.id}</p>
                             <p className="text-xs text-gray-500 mt-0.5">{method.sub}</p>
                           </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Payment Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                     <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800">Checkout Summary</h4>
                        <p className="text-xs text-gray-500">{cartItemCount} items</p>
                     </div>
                     
                     <div className="max-h-60 overflow-y-auto px-4 py-2 border-b border-gray-100">
                       {cart.map(c => (
                         <div key={c.product.id} className="py-2 flex justify-between text-sm">
                           <span className="text-gray-600 line-clamp-1 w-2/3">{c.quantity}x {c.product.name}</span>
                           <span className="font-semibold text-gray-800">৳{(c.product.salePrice * c.quantity).toLocaleString()}</span>
                         </div>
                       ))}
                     </div>

                     <div className="p-6">
                        <div className="flex justify-between items-center mb-3 text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-gray-800">৳{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <span className="text-gray-600">Home Delivery ({checkoutForm.district})</span>
                          <span className="font-bold text-gray-800">৳{checkoutForm.district === 'Dhaka' ? '60' : '120'}</span>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-6 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">Total</span>
                          <span className="font-black text-2xl font-mono text-[#ef4a23]">৳{(cartTotal + (checkoutForm.district === 'Dhaka' ? 60 : 120)).toLocaleString()}</span>
                        </div>
                        <button type="submit" className="w-full bg-[#ef4a23] hover:bg-[#d83c17] text-white font-bold py-3 rounded shadow-md transition-colors flex justify-center items-center gap-2 active:scale-95">
                           <CheckCircle size={18} /> Confirm Order
                        </button>
                        <p className="text-[11px] text-gray-400 mt-4 text-center">
                          By confirming this order, you agree to M/S Hasina Traders terms and privacy policy. 
                        </p>
                     </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#081621] text-gray-300 py-12 mt-auto border-t-4 border-[#ef4a23] print:hidden">
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