import React, { useState, useMemo } from 'react';
import { useStore } from './StoreProvider';
import { Search, ShoppingCart, User, Phone, MapPin, CheckCircle, Plus, Minus, Trash2, X, Star, MessageSquare, LogIn, LogOut, Tag, ArrowLeft, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { Product, CartItem, Order, Review, Qa } from './types';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const Storefront = ({ onOpenAdmin }: { onOpenAdmin: () => void }) => {
  const { 
    products, 
    categories, 
    brands, 
    addOnlineOrder, 
    currentUser, 
    onlineOrders, 
    reviews, 
    qas, 
    addReview, 
    addQuestion 
  } = useStore();

  const isConstructionRod = (product: Product) => {
    if (!product) return false;
    const nameLower = product.name.toLowerCase();
    const catLower = (product.category || '').toLowerCase();
    const brandLower = (product.brand || '').toLowerCase();
    return (
      catLower.includes('rod') || 
      catLower.includes('steel') || 
      nameLower.includes('bar') || 
      nameLower.includes('rod') || 
      brandLower === 'bsrm' || 
      brandLower === 'zsrm'
    );
  };

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'In Stock' | 'Pre Order' | 'Upcoming'>('All');
  const [sortMethod, setSortMethod] = useState<'Default' | 'Price L-H' | 'Price H-L'>('Default');
  const [displayCount, setDisplayCount] = useState<20 | 50 | 100>(20);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [showNotification, setShowNotification] = useState('');
  
  // Account/Profile Tracker Panel state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Authentication barrier modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  // Star Tech Product Details modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsTab, setDetailsTab] = useState<'specs' | 'reviews' | 'qa'>('specs');
  
  // Hover Zoom state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Community Submission states inside product details
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newQaQuestion, setNewQaQuestion] = useState('');

  // Coupon Engine state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout Form State (Alternative Phone Removed)
  const [checkoutForm, setCheckoutForm] = useState({
    name: '', phone: '', address: '', district: 'Dhaka', thana: '', notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Filtering
  let filtered = products;
  
  // Filter by category
  if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
  
  // Filter by brand
  if (activeBrand !== 'All') filtered = filtered.filter(p => p.brand === activeBrand);
  
  // Filter by stock
  if (stockFilter !== 'All') filtered = filtered.filter(p => p.availability === stockFilter);
  
  // Filter by Search Query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.brand || '').toLowerCase().includes(q) || 
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }
  
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

  // Auth Handling
  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      await loginWithGoogle();
      setIsAuthModalOpen(false);
      setShowNotification('Google Sign-In successful!');
      setTimeout(() => setShowNotification(''), 3000);
    } catch (err: any) {
      setAuthError(err.message || 'Login Failed');
    }
  };

  const handleAuthFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authForm.email || !authForm.password) {
      setAuthError('Please fill in both email and password!');
      return;
    }
    try {
      if (authTab === 'login') {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        setIsAuthModalOpen(false);
        setAuthForm({ email: '', password: '', name: '' });
        setShowNotification('Login successful!');
        setTimeout(() => setShowNotification(''), 3000);
      } else {
        if (!authForm.name) {
          setAuthError('Please enter your name for registration!');
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: authForm.name });
        }
        setIsAuthModalOpen(false);
        setAuthForm({ email: '', password: '', name: '' });
        setShowNotification('Registration and Login successful!');
        setTimeout(() => setShowNotification(''), 3000);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsProfileOpen(false);
    setIsCheckout(false);
    setShowNotification('Logged out successfully!');
    setTimeout(() => setShowNotification(''), 3000);
  };

  // Checkout submit with authorization guard check
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthTab('login');
      return;
    }
    setIsCheckout(true);
    setIsCartOpen(false);
    setIsProfileOpen(false);
  };

  // Apply Coupon code
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (code === 'HASINA50') {
      setAppliedCoupon({ code: 'HASINA50', discount: 50 });
      setShowNotification('Coupon "HASINA50" Applied: ৳50 Off!');
      setTimeout(() => setShowNotification(''), 3000);
    } else if (code === 'WELCOME100') {
      setAppliedCoupon({ code: 'WELCOME100', discount: 100 });
      setShowNotification('Coupon "WELCOME100" Applied: ৳100 Off!');
      setTimeout(() => setShowNotification(''), 3000);
    } else {
      setCouponError('Invalid coupon code! Please try "HASINA50" or "WELCOME100".');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Bangladesh cell phone length validation
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(checkoutForm.phone)) {
       alert("Please provide a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).");
       return;
    }

    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const subtotal = cartTotal;
    const delivery = checkoutForm.district === 'Dhaka' ? 60 : 120;
    const grandTotal = Math.max(0, subtotal - discount + delivery);

    addOnlineOrder({
      customerInfo: {
        name: checkoutForm.name,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        district: checkoutForm.district,
        thana: checkoutForm.thana,
        notes: checkoutForm.notes,
        paymentMethod
      },
      items: cart,
      subtotal,
      deliveryCharge: delivery,
      total: grandTotal,
      status: 'Pending',
      userId: currentUser.uid // Attach user tracking ID
    });

    setCart([]);
    setIsCheckout(false);
    setAppliedCoupon(null);
    setCouponInput('');
    setCheckoutForm({ name: '', phone: '', address: '', district: 'Dhaka', thana: '', notes: '' });
    setShowNotification('Order placed successfully! We will process and deliver your items soon.');
    setTimeout(() => setShowNotification(''), 5000);
  };

  // Dynamic Unit pricing conversion matrix tailored for Bangladeshi construction supplies
  const getUnitConversions = (product: Product) => {
    const price = product.salePrice;
    const cat = (product.category || '').toLowerCase();
    
    if (cat.includes('rod') || cat.includes('steel') || cat.includes('iron')) {
      return [
        { unit: '1 KG', desc: 'Retail price per KG', price: price },
        { unit: '1 Bundle (50 KG)', desc: 'Bundle price', price: price * 50 },
        { unit: '1 Ton (1000 KG)', desc: 'Mega Project wholesale rate', price: price * 1000 }
      ];
    } else if (cat.includes('cement')) {
      return [
        { unit: '1 Bag (50 KG)', desc: 'Retail price per bag', price: price },
        { unit: '1 Ton (20 Bags)', desc: 'Wholesale project rate', price: price * 20 }
      ];
    } else if (cat.includes('brick')) {
      return [
        { unit: '1 Piece', desc: 'Price per item', price: price },
        { unit: '1000 Pieces', desc: 'Truck load wholesale rate', price: price * 1000 }
      ];
    }
    return [
      { unit: '1 Unit', desc: 'Retail price', price: price },
      { unit: '10 Units Pack', desc: 'Package price for 10 units', price: price * 10 },
      { unit: '100 Units Carton', desc: 'Wholesale price', price: price * 100 }
    ];
  };

  // Hover Zoom cursor orientation calculator
  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Handles adding Star Tech Reviews
  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!newReviewComment.trim()) return;
    await addReview(selectedProduct!.id, newReviewRating, newReviewComment);
    setNewReviewComment('');
    setShowNotification('Thank you for your valuable review!');
    setTimeout(() => setShowNotification(''), 4000);
  };

  // Handles posting Star Tech Public questions
  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQaQuestion.trim()) return;
    await addQuestion(selectedProduct!.id, newQaQuestion);
    setNewQaQuestion('');
    setShowNotification('Your question has been submitted! Admin will answer soon.');
    setTimeout(() => setShowNotification(''), 4000);
  };

  const selectedProductReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return reviews.filter(r => r.productId === selectedProduct.id);
  }, [selectedProduct, reviews]);

  const selectedProductQas = useMemo(() => {
    if (!selectedProduct) return [];
    return qas.filter(q => q.productId === selectedProduct.id);
  }, [selectedProduct, qas]);

  const averageRating = useMemo(() => {
    if (selectedProductReviews.length === 0) return 5;
    const sum = selectedProductReviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / selectedProductReviews.length).toFixed(1));
  }, [selectedProductReviews]);

  const orderStatuses = {
    'Pending': { color: 'bg-amber-100 text-amber-800 border-amber-300' },
    'Confirmed': { color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    'Processing': { color: 'bg-blue-100 text-blue-800 border-blue-300' },
    'Ready to Ship': { color: 'bg-teal-100 text-teal-800 border-teal-300' },
    'Shipped': { color: 'bg-purple-100 text-purple-800 border-purple-300' },
    'Delivered': { color: 'bg-green-100 text-green-800 border-green-300' },
    'Cancelled': { color: 'bg-rose-100 text-rose-800 border-rose-300' }
  };

  const districts = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Faridpur', 'Gopalganj'];

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex flex-col font-sans relative text-gray-900 select-none">
      
      {/* Top Banner Alert Segment */}
      <div className="bg-[#ef4a23] text-white text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-1">
        🔥 Mega Project Offer! Special discount on ordering 10 tons of BSRM steel rods or Seven Rings cement! Hotline: +880-1988030534
      </div>

      {/* Main Header (Pure Star Tech Style Architecture) */}
      <header className="bg-[#081621] text-white sticky top-0 z-30 shadow-md border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo and Brand Identity */}
          <div className="flex items-center gap-3">
             <div className="cursor-pointer" onClick={() => { setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}>
                <h1 className="text-2xl font-black tracking-tight text-white m-0 leading-none hover:text-[#ef4a23] transition-colors flex items-center gap-2">
                  মেসার্স হাসিনা ট্রেডার্স
                </h1>
                <p className="text-[#ef4a23] text-xs font-bold mt-1 tracking-widest uppercase">M/S Hasina Traders • Established 1996</p>
             </div>
          </div>

          {/* Elastic Star Tech Search Engine */}
          <div className="flex-1 w-full max-w-lg mx-0 md:mx-6 relative">
             <input 
               type="text" 
               placeholder="Search rods, cement, categories, or brands..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-[#112335] text-white rounded py-2.5 px-4 pr-10 outline-none text-sm placeholder:text-gray-400 focus:bg-white focus:text-[#081621] focus:ring-1 focus:ring-[#ef4a23] border border-transparent focus:border-transparent transition-all"
             />
             <Search size={18} className="absolute right-3 top-3 text-gray-400 cursor-pointer pointer-events-none"/>
          </div>

          {/* Communication Controls & Auth Segment */}
          <div className="flex gap-4 items-center">
             <div className="flex flex-col text-right hidden lg:flex border-r border-[#1e2e3d] pr-4">
               <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Steel & Cement Hotline</span>
               <span className="font-extrabold text-white text-sm">+880-1988030534</span>
             </div>
             
             {/* Cart Trigger */}
             <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 text-white hover:text-[#ef4a23] p-1.5 rounded transition-colors group">
               <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform" />
               <div className="absolute -top-1 -right-1.5 bg-[#ef4a23] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#081621]">
                 {cartItemCount}
               </div>
               {cartItemCount > 0 && <span className="text-xs font-sans font-black hidden sm:inline text-white">৳{cartTotal.toLocaleString()}</span>}
             </button>

             {/* User Profile Tracking / Dynamic Dashboard trigger */}
             {currentUser ? (
               <div className="flex items-center gap-2 border-l border-gray-800 pl-4">
                 <button 
                   onClick={() => { setIsProfileOpen(!isProfileOpen); setIsCheckout(false); setSelectedProduct(null); }}
                   className={`flex items-center gap-1.5 text-xs font-black uppercase text-white hover:text-[#ef4a23] px-3 py-1.5 rounded border ${isProfileOpen ? 'border-[#ef4a23] text-[#ef4a23]' : 'border-gray-800 bg-[#112335]'} transition-all`}
                 >
                   <User size={14} className="text-[#ef4a23]" />
                   <span className="max-w-[80px] truncate">{currentUser.displayName || 'Account'}</span>
                 </button>
                 <button onClick={handleLogout} className="p-1.5 hover:text-red-500 text-gray-400 transition-colors" title="Log Out">
                   <LogOut size={16} />
                 </button>
               </div>
             ) : (
               <button 
                 onClick={() => { setIsAuthModalOpen(true); setAuthTab('login'); }}
                 className="flex items-center gap-1.5 hover:text-[#ef4a23] border border-gray-800 text-xs font-black tracking-wide bg-[#112335] text-white py-1.5 px-3 rounded shadow-inner transition-colors"
               >
                 <LogIn size={14} className="text-[#ef4a23]"/>
                 Login / Register
               </button>
             )}

             {/* Secure Admin Portal Link */}
             <button onClick={onOpenAdmin} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title="Admin Dashboard">
               <svg size={20} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
             </button>
          </div>
        </div>
        
        {/* Responsive Navbar Categories Rail */}
        <div className="border-t border-white/5 bg-[#0a1e2e]">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar py-0.5">
             <button 
               onClick={() => { setActiveCategory('All'); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }} 
               className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === 'All' && !isCheckout && !isProfileOpen && !selectedProduct ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-300'}`}
             >
               All Categories
             </button>
             {categories.map(c => (
               <button 
                 key={c} 
                 onClick={() => { setActiveCategory(c); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }} 
                 className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors hover:text-[#ef4a23] ${activeCategory === c && !isCheckout && !isProfileOpen && !selectedProduct ? 'text-[#ef4a23] border-b-2 border-[#ef4a23]' : 'text-gray-300'}`}
               >
                 {c}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* Notifications overlay system */}
      {showNotification && (
        <div className="fixed bottom-10 right-10 bg-gray-950 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border-l-4 border-green-500 max-w-sm">
          <CheckCircle className="text-green-500 shrink-0" size={20} />
          <span className="font-semibold text-xs leading-relaxed">{showNotification}</span>
        </div>
      )}

      {/* Cart Slider Drawer Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCartOpen(false)}></div>
          <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#081621] text-white">
               <h2 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-white">
                 <ShoppingCart size={18} className="text-[#ef4a23]"/> Your Current Cart ({cartItemCount})
               </h2>
               <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={18}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                    <div className="bg-gray-100 p-4 rounded-full text-gray-500">
                      <ShoppingCart size={36} />
                    </div>
                    <p className="font-bold text-sm">Your cart is completely empty!</p>
                    <p className="text-xs max-w-xs leading-normal">Add preferred construction items from rods, cement, plumbing or sanitary categories to your cart.</p>
                  </div>
                ) : cart.map(c => (
                  <div key={c.product.id} className="flex gap-3 bg-white border border-gray-100 p-3 rounded-lg relative group hover:shadow-md hover:border-gray-200 transition-all">
                     <img src={c.product.imageUrl} alt={c.product.name} className="w-16 h-16 object-contain rounded bg-gray-50 p-1" />
                     <div className="flex-1 flex flex-col justify-between">
                       <div>
                         <h4 className="text-xs font-extrabold text-gray-800 line-clamp-2 pr-6 leading-normal hover:text-blue-600 cursor-pointer" onClick={() => { setSelectedProduct(c.product); setIsCartOpen(false); }}>{c.product.name}</h4>
                         <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 inline-block">{c.product.brand}</span>
                       </div>
                       <div className="flex justify-between items-center mt-3">
                         <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded p-0.5">
                           <button onClick={() => updateCartQty(c.product.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white rounded transition-colors"><Minus size={11}/></button>
                           <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                           <button onClick={() => updateCartQty(c.product.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-green-500 hover:bg-white rounded transition-colors"><Plus size={11}/></button>
                         </div>
                         <div className="text-right">
                           <span className="font-black text-[#ef4a23] text-sm font-mono block">৳{(c.product.salePrice * c.quantity).toLocaleString()}</span>
                           <span className="text-[9px] text-gray-400 font-bold">৳{c.product.salePrice.toLocaleString()} / {isConstructionRod(c.product) ? 'KG' : 'Pcs'}</span>
                         </div>
                       </div>
                     </div>
                     <button onClick={() => removeFromCart(c.product.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full p-0.5"><Trash2 size={15}/></button>
                  </div>
                ))}
             </div>

             <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-gray-800">
                  <span className="font-extrabold text-sm">Subtotal:</span>
                  <span className="font-extrabold text-lg text-gray-900 font-mono">৳{cartTotal.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={handleProceedToCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-[#ef4a23] hover:bg-[#d83c17] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded shadow-lg transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider uppercase active:scale-98"
                >
                  Proceed to Checkout
                </button>
                {!currentUser && (
                  <p className="text-[10px] text-gray-500 font-semibold text-center mt-1 bg-amber-50 rounded py-1 px-2 border border-amber-200">
                    ⚠️ You must be logged in to place an order or apply a coupon.
                  </p>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Main Content View Switch (Profile Dashboard, Product details, Checkout, Catalog) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* SWITCH CASE 1: LOGGED STATE "MY ACCOUNT / ORDER TRACKING" DASHBOARD */}
        {isProfileOpen && currentUser ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#081621] flex items-center gap-2">
                  <User className="text-[#ef4a23]"/> Customer Dashboard & Order Tracking
                </h2>
                <p className="text-xs text-gray-500 mt-1">Welcome, <strong className="text-gray-800">{currentUser.displayName || currentUser.email}</strong> • Track your orders and check their status details.</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 text-xs font-black border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded transition-all transition-colors"
              >
                <LogOut size={13}/> Log Out
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-700">Google Account</span>
                <span className="font-extrabold text-sm text-gray-800 break-all mt-2">{currentUser.email || 'N/A'}</span>
              </div>
              <div className="bg-[#081621] text-white rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4a23]">Total Online Orders</span>
                <span className="font-black text-2xl text-white mt-2">{onlineOrders.length} orders</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700">Security Status</span>
                <span className="font-extrabold text-sm text-emerald-800 mt-2 flex items-center gap-1">
                  <ShieldCheck size={16}/> Verified User
                </span>
              </div>
            </div>

            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-widest mb-4 border-b pb-2">Your Previous Online Orders Ledger</h3>
            
            {onlineOrders.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50 text-gray-400">
                <p className="font-bold text-sm">You have not placed any online orders yet!</p>
                <p className="text-xs mt-1">Add items to your cart and complete checkout to place your first order.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {onlineOrders.map((order) => {
                  const itemsSummary = order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');
                  const statusColors = orderStatuses[order.status || 'Pending'] || { color: 'bg-gray-100 text-gray-800' };
                  
                  const getOrderStepIndex = (status: string) => {
                    switch (status) {
                      case 'Pending': return 0;
                      case 'Confirmed':
                      case 'Processing': return 1;
                      case 'Ready to Ship':
                      case 'Shipped': return 2;
                      case 'Delivered': return 3;
                      default: return 0;
                    }
                  };
                  
                  const currentStep = getOrderStepIndex(order.status || 'Pending');
                  const isCancelled = order.status === 'Cancelled';
                  
                  return (
                    <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-xs transition-all bg-[#fafbfc]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div>
                          <span className="text-[10px] bg-gray-800 text-white font-extrabold px-1.5 py-0.5 rounded-sm tracking-wide mr-2">
                            Invoice: {order.id}
                          </span>
                           <span className="text-xs text-gray-500 font-medium">
                            {new Date(order.createdAt || order.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded border ${statusColors.color} shadow-2xs`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 mt-2 line-clamp-1 leading-normal block">
                        <strong>Items:</strong> {itemsSummary}
                      </div>

                      {/* Interactive Live Life Cycle Stepper */}
                      <div className="my-5 bg-slate-50 border border-slate-150 rounded-lg p-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-4">Live Order Progress Tracker</p>
                        {isCancelled ? (
                          <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded text-xs font-extrabold uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                            ⚠️ This order has been cancelled by the administrator or customer request.
                          </div>
                        ) : (
                          <div className="flex items-center justify-between relative mt-2 mb-1 px-4">
                            {/* Connective Line */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 -translate-y-1/2 z-0">
                               <div 
                                 className="h-full bg-[#ef4a23] transition-all duration-500" 
                                 style={{ width: `${(currentStep / 3) * 100}%` }}
                               ></div>
                            </div>
                            
                            {/* Steps */}
                            {[
                              { label: 'Pending', desc: 'Placed' },
                              { label: 'Processing', desc: 'Confirmed' },
                              { label: 'Shipping', desc: 'In Transit' },
                              { label: 'Delivered', desc: 'Arrived' }
                            ].map((step, idx) => {
                              const isCompleted = idx < currentStep;
                              const isActive = idx === currentStep;
                              return (
                                <div key={idx} className="flex flex-col items-center z-10 relative">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 transition-all ${
                                    isCompleted ? 'bg-orange-600 border-orange-655 text-white' :
                                    isActive ? 'bg-white border-[#ef4a23] text-[#ef4a23] scale-110 shadow-md ring-4 ring-orange-100/50' :
                                    'bg-white border-gray-300 text-gray-400'
                                  }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[10px] font-extrabold mt-1.5 ${isActive ? 'text-[#ef4a23]' : isCompleted ? 'text-gray-850' : 'text-gray-400'}`}>{step.label}</span>
                                  <span className="text-[8px] text-gray-400 font-medium uppercase mt-0.5">{step.desc}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <p className="text-[11px] text-gray-500"><strong>Delivery Address:</strong> {order.customerInfo?.address}, {order.customerInfo?.thana}, {order.customerInfo?.district}</p>
                          <p className="text-[11px] text-gray-500"><strong>Payment Method:</strong> {order.customerInfo?.paymentMethod || 'Cash on Delivery'}</p>
                        </div>
                        <span className="font-black text-[#ef4a23] text-sm">৳{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button 
              onClick={() => setIsProfileOpen(false)} 
              className="mt-8 bg-gray-800 hover:bg-[#ef4a23] text-white text-xs font-black px-5 py-2.5 rounded transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14}/> Return to Shopping
            </button>
          </div>
        ) : selectedProduct ? (
          /* SWITCH CASE 2: STAR TECH STYLE INTERACTIVE DETAILS VIEW */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-in zoom-in-95 duration-200">
             <button onClick={() => setSelectedProduct(null)} className="text-xs font-black hover:text-[#ef4a23] text-gray-500 mb-6 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 py-1.5 px-3.5 rounded transition-all max-w-[150px]">
               &larr; Back to Shop
             </button>
             
             {/* Left Block Image Frame & Right Block Pricing Segment */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
                
                {/* Left Block */}
                <div>
                  <div 
                    className="relative overflow-hidden cursor-zoom-in border border-gray-100 rounded-lg bg-gray-50 hover:bg-white h-80 flex items-center justify-center p-6 group focus-within:ring-1 focus-within:ring-[#ef4a23]"
                    onMouseMove={handleMouseMoveZoom}
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                  >
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name} 
                      className="object-contain h-full w-full transition-transform duration-75 referrer"
                      referrerPolicy="no-referrer"
                      style={{
                        transform: isZooming ? 'scale(2)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                    />
                    
                    {/* Save percentage overlay badge in modal */}
                    {selectedProduct.regularPrice > selectedProduct.salePrice && (
                      <span className="absolute bottom-4 left-4 bg-orange-600 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                        Save: ৳{(selectedProduct.regularPrice - selectedProduct.salePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold text-center mt-2 flex items-center justify-center gap-1 select-none">
                    🔍 Hover to explore details close-up.
                  </p>
                </div>

                {/* Right Block */}
                <div className="flex flex-col h-full justify-between">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/10 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">{selectedProduct.brand || 'Premium Brand'}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          selectedProduct.availability === 'In Stock' ? 'bg-emerald-50 text-emerald-800' :
                          selectedProduct.availability === 'Pre Order' ? 'bg-sky-50 text-sky-800' : 'bg-fuchsia-50 text-fuchsia-800'
                        }`}>
                          {selectedProduct.availability || 'In Stock'}
                        </span>
                      </div>

                      <h2 className="text-xl font-black text-gray-900 leading-snug">{selectedProduct.name}</h2>
                      <p className="text-xs text-gray-600 leading-relaxed bg-[#f8fafc] border-l-2 p-3 font-medium select-text">{selectedProduct.description}</p>
                      
                      {/* Price Grid (Star Tech Style Matrix) */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Pricing Matrix</span>
                         <div className="flex flex-wrap items-baseline gap-4 mt-2">
                           <div className="flex flex-col">
                             <span className="text-xs text-gray-500 font-semibold">Cash Sale Price</span>
                             <span className="text-2xl font-black text-red-600">৳{selectedProduct.salePrice.toLocaleString()} / {isConstructionRod(selectedProduct) ? 'KG' : 'Pcs'}</span>
                           </div>
                           {selectedProduct.regularPrice > selectedProduct.salePrice && (
                             <div className="flex flex-col">
                               <span className="text-xs text-gray-500 font-medium">Regular Price</span>
                               <span className="text-xs text-gray-400 line-through font-semibold font-mono">৳{selectedProduct.regularPrice.toLocaleString()} / {isConstructionRod(selectedProduct) ? 'KG' : 'Pcs'}</span>
                             </div>
                           )}
                           {selectedProduct.regularPrice > selectedProduct.salePrice && (
                             <div className="bg-orange-100 text-orange-850 text-xs font-black py-1 px-3 rounded-md">
                               Special Savings: ৳{(selectedProduct.regularPrice - selectedProduct.salePrice).toLocaleString()}
                             </div>
                           )}
                         </div>
                      </div>

                      {/* Construction Unit Conversion Board */}
                      <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-4">
                         <h4 className="text-xs font-extrabold text-amber-850 uppercase tracking-wider mb-2 flex items-center gap-1">
                           📊 Local Unit Conversion Calculator (Dynamic Multipliers)
                         </h4>
                         <div className="space-y-1.5">
                           {getUnitConversions(selectedProduct).map((unit, index) => (
                             <div key={index} className="flex justify-between items-center text-xs font-semibold py-1 border-b border-dashed border-amber-100/50">
                               <div className="flex items-center gap-1">
                                 <span className="text-gray-800">{unit.unit}</span>
                                 <span className="text-gray-400 font-normal">({unit.desc})</span>
                                </div>
                               <span className="font-extrabold font-mono text-gray-900">৳{unit.price.toLocaleString()}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                   </div>

                   <div className="mt-8">
                     <button 
                       onClick={() => addToCart(selectedProduct)}
                       disabled={selectedProduct.availability !== 'In Stock'}
                       className={`w-full font-black py-3.5 rounded-lg shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${
                         selectedProduct.availability === 'In Stock' ? 'bg-[#ef4a23] hover:bg-orange-650 text-white hover:shadow-lg active:scale-98' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                       }`}
                     >
                       🛒 {selectedProduct.availability === 'In Stock' ? 'Add to Cart' : selectedProduct.availability}
                     </button>
                     <p className="text-[10px] text-gray-400 text-center mt-2">
                       * Reliable delivery service for professional construction materials across all of Bangladesh.
                     </p>
                   </div>
                </div>
             </div>

             {/* Bottom Block (Specs, Reviews, public QAs) */}
             <div className="border border-gray-150 rounded-lg overflow-hidden">
                <div className="flex bg-[#0a1e2e] text-white">
                  <button 
                    onClick={() => setDetailsTab('specs')} 
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-black transition-colors ${detailsTab === 'specs' ? 'bg-[#ef4a23] text-white' : 'text-gray-300 hover:text-white'}`}
                  >
                    Specifications
                  </button>
                  <button 
                    onClick={() => setDetailsTab('reviews')} 
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-black transition-colors relative ${detailsTab === 'reviews' ? 'bg-[#ef4a23] text-white' : 'text-gray-300 hover:text-white'}`}
                  >
                    Reviews ({selectedProductReviews.length})
                  </button>
                  <button 
                    onClick={() => setDetailsTab('qa')} 
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-black transition-colors ${detailsTab === 'qa' ? 'bg-[#ef4a23] text-white' : 'text-gray-300 hover:text-white'}`}
                  >
                    Q&A Section ({selectedProductQas.length})
                  </button>
                </div>

                <div className="p-6">
                  {/* specs panel */}
                  {detailsTab === 'specs' && (
                    <div className="space-y-4 text-xs font-semibold select-text leading-relaxed text-gray-700">
                      <div className="flex border-b pb-2"><span className="w-1/3 text-gray-500">Brand</span><span className="w-2/3 font-black text-gray-900">{selectedProduct.brand || 'N/A'}</span></div>
                      <div className="flex border-b pb-2"><span className="w-1/3 text-gray-500">Category</span><span className="w-2/3 font-black text-gray-900">{selectedProduct.category || 'N/A'}</span></div>
                      <div className="flex border-b pb-2"><span className="w-1/3 text-gray-500">Availability</span><span className="w-2/3 font-black text-gray-900">{selectedProduct.availability}</span></div>
                      <div className="flex"><span className="w-1/3 text-gray-500">Description</span><span className="w-2/3 leading-normal">{selectedProduct.description}</span></div>
                    </div>
                  )}

                  {/* reviews subsegment */}
                  {detailsTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Submit a review */}
                      {currentUser ? (
                        <form onSubmit={handleAddReviewSubmit} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                          <h4 className="text-xs font-extrabold text-gray-800 uppercase mb-3">We value your experience and feedback</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-gray-500">Select Rating:</span>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(star => (
                                <button 
                                  key={star} 
                                  type="button" 
                                  onClick={() => setNewReviewRating(star)}
                                  className="text-amber-500 hover:scale-110 transition-transform"
                                >
                                  <Star size={18} fill={star <= newReviewRating ? 'currentColor' : 'none'}/>
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea 
                            required
                            placeholder="Write your feedback regarding product quality, strength or reliability..."
                            value={newReviewComment}
                            onChange={e => setNewReviewComment(e.target.value)}
                            className="bg-white border rounded text-xs p-3 w-full h-18 outline-none focus:border-[#ef4a23]"
                          />
                          <button type="submit" className="mt-2 bg-[#ef4a23] hover:bg-orange-650 hover:shadow text-white text-xs font-extrabold px-4 py-2 rounded-md transition-all">
                            Submit Review
                          </button>
                        </form>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-amber-850 text-xs font-semibold text-center select-none">
                          🔑 Please <strong className="cursor-pointer text-indigo-700 underline" onClick={() => { setIsAuthModalOpen(true); setAuthTab('login'); }}>Login</strong> to submit a review and share your feedback.
                        </div>
                      )}

                      {/* reviews list */}
                      <div className="space-y-4">
                        {selectedProductReviews.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-4">No reviews submitted yet. Be the first to review this product.</p>
                        ) : selectedProductReviews.map(r => (
                          <div key={r.id} className="border-b pb-3 leading-normal">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                              <div>
                                <span className="text-xs font-black text-gray-800 mr-2">{r.userName}</span>
                                <span className="text-[10px] text-gray-400 font-semibold">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-0.5 text-amber-500">
                                {[...Array(r.rating)].map((_, i) => <Star key={i} size={11} fill="currentColor"/>)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 mt-2 pl-2 select-text">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Q & As public block */}
                  {detailsTab === 'qa' && (
                    <div className="space-y-6">
                      <form onSubmit={handleAddQuestionSubmit} className="space-y-2">
                        <textarea 
                          required
                          placeholder="Do you have questions about this product or bulk requirements? Ask here..."
                          value={newQaQuestion}
                          onChange={e => setNewQaQuestion(e.target.value)}
                          className="bg-white border rounded text-xs p-3 w-full h-18 outline-none focus:border-[#ef4a23]"
                        />
                        <button type="submit" className="bg-[#ef4a23] hover:bg-orange-650 hover:shadow text-white text-xs font-extrabold px-4 py-2 rounded-md transition-all">
                          Ask Question
                        </button>
                      </form>

                      <div className="space-y-4 select-text">
                        {selectedProductQas.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-4">No questions asked yet.</p>
                        ) : selectedProductQas.map(q => (
                          <div key={q.id} className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-extrabold text-blue-650 flex items-center gap-1">
                                 <MessageSquare size={12}/> {q.askedBy}
                               </span>
                               <span className="text-[9px] text-gray-400 font-bold">{new Date(q.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-xs font-bold text-gray-800 pl-1">{q.question}</p>
                             
                             {q.answer ? (
                               <div className="mt-3 bg-white border border-gray-150 rounded p-2.5 ml-3">
                                 <p className="text-[10px] uppercase font-bold text-[#ef4a23] tracking-widest">M/S Hasina Traders Response:</p>
                                 <p className="text-xs font-bold text-gray-750 mt-1">{q.answer}</p>
                               </div>
                             ) : (
                               <p className="text-[9px] text-amber-600 font-bold ml-1 mt-2 flex items-center gap-0.5">
                                 🕒 Question is awaiting response...
                               </p>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        ) : !isCheckout ? (
          /* SWITCH CASE 3: PRODUCT CATALOG (PUBLIC DISCOVERY MODULE) */
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Sidebar compact responsive layout for mobile friendliness */}
            <aside className="w-full md:w-64 shrink-0 space-y-4">
              
              {/* Availability Filter Block made smaller for mobile scaling */}
              <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#081621] border-b pb-2 mb-3">Availability</h3>
                 <div className="space-y-2">
                   {['All', 'In Stock', 'Pre Order', 'Upcoming'].map(s => (
                     <label key={s} className="flex items-center gap-2 cursor-pointer group select-none">
                       <input 
                         type="radio" 
                         name="stock" 
                         checked={stockFilter === s} 
                         onChange={() => setStockFilter(s as any)} 
                         className="w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" 
                       />
                       <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#ef4a23] transition-colors">{s}</span>
                     </label>
                   ))}
                 </div>
              </div>

              {/* Brands Filter Block made smaller and compact */}
              <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#081621] border-b pb-2 mb-3">Filter By Brand</h3>
                 <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                   <label className="flex items-center gap-2 cursor-pointer group select-none">
                       <input 
                         type="radio" 
                         name="brand" 
                         checked={activeBrand === 'All'} 
                         onChange={() => setActiveBrand('All')} 
                         className="text-[#ef4a23] focus:ring-[#ef4a23] w-4 h-4 cursor-pointer" 
                       />
                       <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#ef4a23] transition-colors">All Brands</span>
                   </label>
                   {brands.map(b => (
                     <label key={b} className="flex items-center gap-2 cursor-pointer group select-none">
                       <input 
                         type="radio" 
                         name="brand" 
                         checked={activeBrand === b} 
                         onChange={() => setActiveBrand(b)} 
                         className="text-[#ef4a23] focus:ring-[#ef4a23] w-4 h-4 cursor-pointer" 
                       />
                       <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#ef4a23] transition-colors">{b}</span>
                     </label>
                   ))}
                 </div>
              </div>
            </aside>

            {/* Product display ledger with details click action overlay */}
            <div className="flex-1">
              {/* Sorting Header Ledger Bar */}
              <div className="bg-white p-3.5 rounded-lg shadow-sm border border-gray-200 mb-5 flex flex-wrap justify-between items-center gap-4">
                 <h2 className="text-xs font-extrabold text-gray-700 tracking-wide">
                   {filtered.length} {filtered.length === 1 ? 'Product' : 'Products'} found in catalog
                 </h2>
                 <div className="flex gap-4">
                   <div className="flex items-center gap-1.5">
                     <span className="text-[10px] text-gray-400 font-extrabold uppercase">Show:</span>
                     <select value={displayCount} onChange={e => setDisplayCount(Number(e.target.value) as any)} className="bg-gray-50 border border-gray-250 text-xs rounded px-2 py-1 outline-none font-bold focus:border-[#ef4a23]">
                       <option value={20}>20</option>
                       <option value={50}>50</option>
                       <option value={100}>100</option>
                     </select>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <span className="text-[10px] text-gray-400 font-extrabold uppercase">Sort:</span>
                     <select value={sortMethod} onChange={e => setSortMethod(e.target.value as any)} className="bg-gray-50 border border-gray-250 text-xs rounded px-2 py-1 outline-none font-bold focus:border-[#ef4a23]">
                       <option>Default</option>
                       <option>Price L-H</option>
                       <option>Price H-L</option>
                     </select>
                   </div>
                 </div>
              </div>

              {/* Product cards layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => {
                  const saveAmount = p.regularPrice - p.salePrice;
                  return (
                    <div key={p.id} className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-4 relative border border-gray-150 flex flex-col justify-between group">
                      
                      {/* Top elements */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                         {saveAmount > 0 && (
                           <div className="bg-[#ef4a23] text-white text-[9px] font-black px-2 py-1 rounded shadow-sm flex items-center gap-0.5 uppercase tracking-wide">
                             Save: ৳{saveAmount.toLocaleString()}
                           </div>
                         )}
                      </div>

                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                          p.availability === 'In Stock' ? 'bg-emerald-50 text-emerald-800' :
                          p.availability === 'Pre Order' ? 'bg-sky-50 text-sky-800' : 'bg-fuchsia-50 text-fuchsia-800'
                        }`}>
                          {p.availability || 'In Stock'}
                        </span>
                      </div>

                      {/* Image Viewer clickable for full details details tab */}
                      <div 
                        onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                        className="w-full h-44 flex items-center justify-center overflow-hidden rounded-md bg-gray-50/50 mb-3 pt-3 mt-6 cursor-pointer relative group-hover:bg-white"
                      >
                         <img src={p.imageUrl} alt={p.name} className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300 referrer" referrerPolicy="no-referrer" />
                         <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="bg-[#081621]/95 text-[#ef4a23] border border-[#ef4a23]/30 text-[10px] font-extrabold px-3 py-1.5 rounded shadow">View Details</span>
                         </div>
                      </div>

                      {/* Content block */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">{p.brand || 'Generic'}</span>
                          <h3 
                            onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                            className="text-gray-900 font-extrabold text-sm line-clamp-2 mt-1 hover:text-[#ef4a23] cursor-pointer transition-colors leading-snug"
                          >
                            {p.name}
                          </h3>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-black text-red-600 font-mono">৳{p.salePrice.toLocaleString()} / {isConstructionRod(p) ? 'KG' : 'Pcs'}</span>
                            {p.regularPrice > p.salePrice && (
                              <span className="text-xs text-gray-400 line-through font-mono">৳{p.regularPrice.toLocaleString()} / {isConstructionRod(p) ? 'KG' : 'Pcs'}</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => addToCart(p)}
                              disabled={p.availability !== 'In Stock'}
                              className={`flex-grow font-extrabold py-2.5 rounded text-xs transition-colors shadow-xs uppercase tracking-wide flex items-center justify-center gap-1.5 ${
                                p.availability === 'In Stock' ? 'bg-indigo-650 hover:bg-slate-800 text-white active:scale-95' : 'bg-gray-150 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              🛒 Add to Cart
                            </button>
                            <button 
                              onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                              className="bg-slate-100 hover:bg-[#ef4a23] hover:text-white text-[#081621] p-2.5 rounded transition-colors"
                              title="View Detailed Pricing"
                            >
                              <ArrowUpRight size={14}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-gray-400 bg-white border border-gray-200 border-dashed rounded-lg">
                  No products found match your criteria. Try different search terms.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SWITCH CASE 4: SECURE CHECKOUT PAGE (MANDATORY AUTHORIZATION BLOCK) */
          <div className="flex-1 w-full max-w-5xl mx-auto rounded animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsCheckout(false)} className="text-xs font-extrabold text-gray-500 mb-6 hover:text-[#ef4a23] flex items-center gap-1 bg-white border px-3 py-1.5 rounded shadow-2xs transition-colors max-w-[150px]">&larr; Back to Shopping</button>
            <h2 className="text-xl font-black text-[#081621] mb-6 border-b-2 border-gray-200 pb-4 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="text-emerald-600"/> Secure checkout gateway
            </h2>
            
            {cart.length === 0 ? (
              <div className="bg-white p-16 text-center shadow-sm border border-gray-200 rounded-lg">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-600 font-medium">Your cart is currently empty!</p>
                <button onClick={() => setIsCheckout(false)} className="mt-6 bg-[#ef4a23] text-white px-6 py-2 rounded font-bold hover:bg-orange-600 transition-colors">Start Shopping</button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Checkout Fields Block */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-250 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#081621] mb-4 border-b pb-2">Customer Shipping Parameters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Full Name *</label>
                        <input required value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Enter your full name" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Active Bangladesh Mobile Number *</label>
                        <input required value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="01XXXXXXXXX" />
                      </div>
                      
                      {/* Alternative Phone removal verified */}
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Full Construction Site Address *</label>
                        <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 h-16 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Commercial site, village, union, road, holding..." />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Select Delivery District *</label>
                        <select required value={checkoutForm.district} onChange={e => setCheckoutForm({...checkoutForm, district: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 focus:ring-1 focus:ring-[#ef4a23] outline-none bg-white font-semibold">
                          {districts.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Area / Thana *</label>
                        <input required value={checkoutForm.thana} onChange={e => setCheckoutForm({...checkoutForm, thana: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Enter Thana / Area" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Payment/Site Notes (Optional)</label>
                        <textarea value={checkoutForm.notes} onChange={e => setCheckoutForm({...checkoutForm, notes: e.target.value})} className="w-full border border-gray-300 text-xs rounded p-2.5 h-12 focus:ring-1 focus:ring-[#ef4a23] outline-none" placeholder="Any special instructions, gate boundaries, delivery block guidance..." />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-250 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#081621] mb-4 border-b pb-2">Payment Gateway Selection</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[ 
                        { id: 'Cash on Delivery', sub: 'Pay with Cash after material has arrived on site', icon: '🚚' },
                        { id: 'bKash', sub: 'bKash Personal Transfer', icon: '৳' },
                        { id: 'Nagad', sub: 'Nagad Personal Transfer', icon: '৳' },
                        { id: 'Credit/Debit Card', sub: 'Card payment at delivery point / dealer', icon: '💳' }
                      ].map(method => (
                        <label key={method.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-[#ef4a23] bg-orange-50/20' : 'border-gray-200 hover:border-gray-350'}`}>
                           <input type="radio" required name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" />
                           <div>
                             <p className="font-extrabold text-xs text-gray-800 flex items-center gap-1">{method.icon} {method.id}</p>
                             <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{method.sub}</p>
                           </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout Summary Sidebar with Coupon Discount */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-250 sticky top-24">
                     <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Checkout Summary</h4>
                        <p className="text-[10px] text-gray-500 font-bold">{cartItemCount} item(s) selected</p>
                     </div>
                     
                     <div className="max-h-56 overflow-y-auto px-4 py-2 border-b border-gray-100">
                       {cart.map(c => (
                         <div key={c.product.id} className="py-2 flex justify-between text-xs font-bold font-mono">
                           <span className="text-gray-600 line-clamp-1 w-3/5 font-sans">{c.quantity}x {c.product.name}</span>
                           <span className="text-gray-800 shrink-0">৳{(c.product.salePrice * c.quantity).toLocaleString()}</span>
                         </div>
                       ))}
                     </div>

                     <div className="p-5">
                        
                        {/* Coupon Code Panel */}
                        <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-gray-200">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Tag size={12} className="text-[#ef4a23]"/> Use Coupon Code
                          </label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              placeholder="Enter Code (e.g. HASINA50)" 
                              value={couponInput} 
                              onChange={e => setCouponInput(e.target.value)} 
                              className="bg-white border text-xs rounded px-2.5 py-2 outline-none uppercase flex-grow font-extrabold tracking-wider focus:border-[#ef4a23]"
                            />
                            <button 
                              type="button" 
                              onClick={handleApplyCoupon} 
                              className="bg-gray-800 hover:bg-[#ef4a23] text-white font-extrabold text-xs px-3.5 py-1.5 rounded transition-colors uppercase"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && <p className="text-[10px] text-red-500 font-bold mt-1.5">{couponError}</p>}
                          {appliedCoupon && (
                            <div className="flex justify-between items-center bg-green-50 border border-green-200 text-green-700 rounded px-2 mt-2 text-[10px] font-extrabold">
                              <span>Code {appliedCoupon.code} active!</span>
                              <span>- ৳{appliedCoupon.discount} discount</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 border-b-2 border-dashed border-gray-150 pb-4 mb-4 text-xs font-semibold font-mono">
                          <div className="flex justify-between items-center text-gray-600">
                            <span className="font-sans">Subtotal</span>
                            <span className="font-bold text-gray-800">৳{cartTotal.toLocaleString()}</span>
                          </div>
                          {appliedCoupon && (
                            <div className="flex justify-between items-center text-green-600">
                              <span className="font-sans">Coupon Discount ({appliedCoupon.code})</span>
                              <span className="font-bold">- ৳{appliedCoupon.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-gray-600">
                            <span className="font-sans">Delivery Fee ({checkoutForm.district === 'Dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span>
                            <span className="font-bold text-gray-800">৳{checkoutForm.district === 'Dhaka' ? '60' : '120'}</span>
                          </div>
                        </div>

                        <div className="mb-6 flex justify-between items-center bg-slate-50 p-2.5 rounded border">
                           <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">Total Bill</span>
                           <span className="font-black text-xl font-mono text-[#ef4a23]">৳{Math.max(0, cartTotal - (appliedCoupon ? appliedCoupon.discount : 0) + (checkoutForm.district === 'Dhaka' ? 60 : 120)).toLocaleString()}</span>
                        </div>
                        
                        <button type="submit" className="w-full bg-[#ef4a23] hover:bg-orange-650 text-white font-black py-3.5 rounded shadow-lg transition-colors flex justify-center items-center gap-1.5 text-xs uppercase tracking-wider uppercase active:scale-98">
                           📝 Confirm Order
                        </button>
                        
                        <p className="text-[10px] text-gray-400 mt-4 text-center leading-normal">
                          You are purchasing construction materials from M/S Hasina Traders at secure and highly reliable market prices. 
                        </p>
                     </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Authentication and Fast registration modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 border-t-4 border-[#ef4a23] overflow-hidden">
             <div className="bg-[#081621] p-4 text-white flex justify-between items-center">
               <h3 className="font-black text-xs uppercase tracking-wider text-white">
                 {authTab === 'login' ? 'Secure Account Login' : 'Create New Account'}
               </h3>
               <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={18}/></button>
             </div>

             <div className="p-5">
               {/* Tab Switch */}
               <div className="flex bg-slate-100 rounded-lg p-1 mb-4 select-none">
                 <button 
                   onClick={() => { setAuthTab('login'); setAuthError(''); }} 
                   className={`flex-1 py-1.5 text-xs font-extrabold rounded-md text-center transition-all ${authTab === 'login' ? 'bg-[#ef4a23] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                   Login
                 </button>
                 <button 
                   onClick={() => { setAuthTab('register'); setAuthError(''); }} 
                   className={`flex-1 py-1.5 text-xs font-extrabold rounded-md text-center transition-all ${authTab === 'register' ? 'bg-[#ef4a23] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                   Register
                 </button>
               </div>

               {/* Prominent Google auth bypass native tool */}
               <button 
                 type="button"
                 onClick={handleGoogleSignIn}
                 className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs flex justify-center items-center gap-2 shadow-inner transition-colors mb-4 group"
               >
                 <svg className="w-4 h-4" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.19-.19-1.68-.45z"/>
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                 </svg>
                 Sign in with Google
               </button>

               <div className="relative flex py-2 items-center">
                 <div className="flex-grow border-t border-gray-200"></div>
                 <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or use Email Address</span>
                 <div className="flex-grow border-t border-gray-200"></div>
               </div>

               <form onSubmit={handleAuthFormSubmit} className="space-y-3 mt-2 text-xs">
                 {authTab === 'register' && (
                   <div>
                     <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Your Name *</label>
                     <input 
                       required 
                       type="text" 
                       placeholder="Enter your name" 
                       value={authForm.name} 
                       onChange={e => setAuthForm({...authForm, name: e.target.value})}
                       className="w-full border rounded p-2 outline-none focus:border-[#ef4a23]"
                     />
                   </div>
                 )}
                 <div>
                   <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Email Address *</label>
                   <input 
                     required 
                     type="email" 
                     placeholder="name@gmail.com" 
                     value={authForm.email} 
                     onChange={e => setAuthForm({...authForm, email: e.target.value})}
                     className="w-full border rounded p-2 outline-none focus:border-[#ef4a23]"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Secret Password *</label>
                   <input 
                     required 
                     type="password" 
                     placeholder="••••••••" 
                     value={authForm.password} 
                     onChange={e => setAuthForm({...authForm, password: e.target.value})}
                     className="w-full border rounded p-2 outline-none focus:border-[#ef4a23]"
                   />
                 </div>

                 {authError && <p className="text-[10px] text-red-500 font-bold bg-red-50 rounded p-2 border border-red-200">{authError}</p>}

                 <button type="submit" className="w-full bg-[#ef4a23] hover:bg-orange-650 text-white font-extrabold py-2.5 rounded-lg transition-colors uppercase tracking-wider mt-2 shadow-xs">
                   {authTab === 'login' ? 'Secure Login' : 'Register Account'}
                 </button>
               </form>
             </div>
          </div>
        </div>
      )}

      {/* Footer (Pure Star Tech Style Footer) */}
      <footer className="bg-[#081621] text-gray-300 py-12 mt-auto border-t-4 border-[#ef4a23] print:hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div>
             <h2 className="text-xl font-bold text-white mb-2 leading-none flex items-center gap-1">
               মেসার্স হাসিনা ট্রেডার্স
             </h2>
             <p className="text-[#ef4a23] text-xs font-bold leading-normal">M/S Hasina Traders • Premium Building Materials and Sanitary Store</p>
             <p className="text-sm text-gray-400 mt-4 leading-relaxed">
               Since 1996, we have been serving Gopalganj and Faridpur regions as a retail and wholesale dealer of high-quality construction rods, cement, sanitary materials, and modern building inputs. 
             </p>
           </div>
           <div>
             <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs border-b border-gray-800 pb-2">Contact & Address</h3>
             <ul className="space-y-3 leading-normal font-semibold text-xs text-gray-400">
               <li className="flex items-center gap-2"><MapPin size={14} className="text-[#ef4a23]" /> Batikamari Bazar, Batikamari, Gopalganj</li>
               <li className="flex items-center gap-2"><User size={14} className="text-[#ef4a23]" /> Proprietor: Bablu Matubbor</li>
               <li className="flex items-center gap-2"><Phone size={14} className="text-[#ef4a23]" /> +880-1988030534</li>
               <li className="flex items-center gap-2"><Phone size={14} className="text-[#ef4a23]" /> +880-1996418168</li>
               <li className="flex items-center gap-2"><span className="text-xs font-bold text-[#ef4a23]">@</span> tradersmshasina@gmail.com</li>
             </ul>
           </div>
           <div>
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs border-b border-gray-800 pb-2">Offline & Online Dual System</h3>
              <p className="text-xs text-gray-400 leading-relaxed pl-2 mb-4">
                Through our modern real-time POS system, customers can receive and print official order copies, bills, or thermal receipts on-site. 
              </p>
              <button onClick={onOpenAdmin} className="text-[#ef4a23] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors bg-white/5 py-1.5 px-3 rounded border border-white/10 uppercase">
                 <svg size={16} className="w-4 h-4 fill-current text-[#ef4a23]" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                 Admin Access (Staff Entry)
              </button>
           </div>
        </div>
      </footer>
    </div>
  );
};
