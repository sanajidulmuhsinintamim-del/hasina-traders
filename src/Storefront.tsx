import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from './StoreProvider';
import { 
  Search, ShoppingCart, User, Phone, MapPin, CheckCircle, Plus, Minus, Trash2, X, Star, 
  MessageSquare, LogIn, LogOut, Tag, ArrowLeft, ArrowUpRight, ShieldCheck, Heart, 
  Layers, Package, Grid, Compass, Bath, Hammer, Workflow, Paintbrush, ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { Product, CartItem, Order, Review, Qa } from './types';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion } from 'motion/react';

// Premium, custom inline vector icons for heavy-industry building materials business
const RodSteelIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <path d="M4 14h16M4 18h16M4 10h16M4 6h16" strokeWidth="2.5" />
    <path d="M6 4l2 12M11 4l2 12M16 4l2 12" strokeWidth="1.25" opacity="0.8" strokeDasharray="1 1" />
  </svg>
);

const CementIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" />
    <path d="M5 8h14M5 16h14" strokeWidth="1.5" />
    <path d="M9 11h6" strokeWidth="2.5" />
    <path d="M11 10h2M11 12h2" opacity="0.75" />
  </svg>
);

const BricksIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <rect x="2" y="14" width="11" height="6" rx="1" strokeWidth="2" />
    <rect x="14" y="14" width="8" height="6" rx="1" opacity="0.8" />
    <rect x="6" y="6" width="12" height="6" rx="1" strokeWidth="2" />
    <line x1="12" y1="6" x2="12" y2="12" />
    <line x1="7" y1="14" x2="7" y2="20" />
  </svg>
);

const SandIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <path d="M12 4L3 19h18L12 4z" strokeWidth="2" />
    <circle cx="10" cy="14" r="1.2" fill="currentColor" />
    <circle cx="14" cy="15" r="1" fill="currentColor" />
    <circle cx="12" cy="11" r="1" fill="currentColor" />
    <circle cx="8" cy="17" r="1" fill="currentColor" />
    <circle cx="16" cy="17" r="1.2" fill="currentColor" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const TilesIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <rect x="3" y="3" width="8" height="8" rx="1" strokeWidth="2" />
    <rect x="13" y="3" width="8" height="8" rx="1" opacity="0.6" />
    <path d="M3 13h18v2a6 6 0 0112 0v2H3v-4z" strokeWidth="1.75" />
    <path d="M12 13v3" strokeWidth="1.5" />
  </svg>
);

const ToolsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0z" />
    <path d="M18.3 2.7L4 17l3 3L21.3 5.7M14.5 14.5l-9.8-1a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2l-1-9.8" />
    <path d="M3 21l4-4M6 15l3 3" />
  </svg>
);

const PipesIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <path d="M3 5h12v4H3z" strokeWidth="2" />
    <path d="M15 7h4a2 2 0 012 2v10" strokeWidth="2" strokeLinecap="square" />
    <path d="M19 19h2v2h-2z" fill="currentColor" />
    <path d="M10 5V3M10 9v10M6 19h8v2H6z" />
  </svg>
);

const PaintCoilsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 select-none">
    <path d="M12 9a4 4 0 100 8 4 4 0 000-8z" strokeWidth="1.5" />
    <path d="M12 6a7 7 0 100 14" strokeWidth="1.5" />
    <path d="M5 3h6v4H5z" />
    <path d="M8 7v4" strokeWidth="2" />
  </svg>
);

interface MeshProductSliderRowProps {
  products: Product[];
  seed: number;
  speed: number;
  addToCart: (p: Product) => void;
  setSelectedProduct: (p: Product) => void;
  setDetailsTab: (tab: 'specs' | 'reviews' | 'qa') => void;
  isConstructionRod: (p: Product) => boolean;
}

const MeshProductSliderRow: React.FC<MeshProductSliderRowProps> = ({ 
  products, seed, speed, addToCart, setSelectedProduct, setDetailsTab, isConstructionRod 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const lastActive = useRef(Date.now());

  // Deterministically shuffle products to be fully mixed up ("elo melo vabe") and interesting
  const rowProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const list = [...products];
    // Simple robust LCG pseudo-random generator with the numeric seed
    let s = seed;
    const nextRandom = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Shuffle the list completely ("elo melo")
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom() * (i + 1));
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }

    // Build a nice long repeatable baseline for the continuous glider
    let baseList = [...list];
    while (baseList.length < 12 && list.length > 0) {
      baseList = [...baseList, ...list];
    }
    
    // Duplicate 3 times for seamless warping in infinite scrolling
    return [...baseList, ...baseList, ...baseList];
  }, [products, seed]);

  // Smooth, continuous automatic infinite loop that never pauses, calculating bounding layouts dynamically on each frame
  useEffect(() => {
    const el = containerRef.current;
    if (!el || rowProducts.length === 0) return;

    // Initial positioning in the middle duplicate
    const initialWidth = el.scrollWidth;
    el.scrollLeft = initialWidth / 3;

    let frameId: number;

    const tick = () => {
      if (el) {
        const dynamicWidth = el.scrollWidth;
        const oneThird = dynamicWidth / 3;
        
        // Continuous automated smooth infinite gliding. Optimized modifier for steady fluid movement
        el.scrollLeft += speed * 0.72;

        // Perfectly seamless warp checks
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += oneThird;
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [rowProducts, speed]);

  // Drag listeners (retained as state registers but non-blocking to auto-glider scroll)
  const startDragging = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = clientX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    lastActive.current = Date.now();
  };

  const moveDragging = (clientX: number, e: { preventDefault: () => void }) => {
    if (!isDown.current) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const x = clientX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity
    el.scrollLeft = scrollLeftStart.current - walk;
    lastActive.current = Date.now();
  };

  const stopDragging = () => {
    isDown.current = false;
    lastActive.current = Date.now();
  };

  if (rowProducts.length === 0) {
    return <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase animate-pulse">Consigned streams starting...</div>;
  }

  return (
    <div className="relative group overflow-hidden select-none py-1">
      <div 
        ref={containerRef}
        onMouseDown={(e) => startDragging(e.pageX)}
        onMouseMove={(e) => moveDragging(e.pageX, e)}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchStart={(e) => startDragging(e.touches[0].pageX)}
        onTouchMove={(e) => moveDragging(e.touches[0].pageX, e)}
        onTouchEnd={stopDragging}
        className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 md:gap-4 py-2 px-1 cursor-grab active:cursor-grabbing select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {rowProducts.map((p, idx) => {
          const saveAmount = p.regularPrice - p.salePrice;
          
          return (
            <div 
              key={`${p.id}-slide-${idx}`}
              className="w-[110px] sm:w-[145px] md:w-[160px] shrink-0 flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-150 p-1.5 hover:shadow-lg hover:border-red-500 transition-all duration-305 text-xs text-left"
            >
              <div className="relative">
                {saveAmount > 0 ? (
                  <div className="absolute top-1 left-1 bg-[#ef4a23] text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs z-10 uppercase tracking-widest leading-none">
                    Save: ৳{saveAmount.toLocaleString()}
                  </div>
                ) : (
                  <div className="absolute top-1 left-1 bg-[#081621] text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs z-10 uppercase tracking-widest leading-none">
                    Approved
                  </div>
                )}
                
                {/* Decreased height for standard view to easily fit two dynamic rows together on desktop screen */}
                <div 
                  onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                  className="w-full h-24 sm:h-32 md:h-34 flex items-center justify-center overflow-hidden rounded bg-gray-50/20 p-0.5 cursor-pointer relative"
                >
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    loading="lazy"
                    className="object-contain w-full h-full hover:scale-105 transition-transform duration-300 pointer-events-none" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 mb-1 mt-1">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide text-sky-700 bg-sky-50 px-1 py-0.5 rounded truncate max-w-[65%]">
                  {p.brand || 'Consigned'}
                </span>
                <span className="text-[7px] sm:text-[8px] font-black px-1 py-0.5 rounded tracking-widest bg-emerald-50 text-emerald-800">
                  {p.availability || 'In Stock'}
                </span>
              </div>

              <h3 
                onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                className="text-gray-900 font-extrabold text-[9px] sm:text-[11px] leading-tight line-clamp-2 hover:text-[#ef4a23] cursor-pointer transition-colors mb-1 min-h-[22px] sm:min-h-[28px]"
              >
                {p.name}
              </h3>

              <div className="mb-1.5">
                <span className="text-[10px] sm:text-xs font-black text-red-650 font-mono">
                  ৳{p.salePrice.toLocaleString()} ({p.unit || (isConstructionRod(p) ? 'KG' : 'Pcs')})
                </span>
              </div>

              <button 
                onClick={() => addToCart(p)}
                disabled={p.availability !== 'In Stock'}
                className={`w-full font-extrabold py-1 rounded text-[8px] sm:text-[10px] transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
                  p.availability === 'In Stock' 
                    ? 'bg-[#ef4a23] hover:bg-[#d83c17] active:scale-95 text-white' 
                     : 'bg-gray-150 text-gray-400 cursor-not-allowed'
                }`}
              >
                🛒 Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    addQuestion,
    aboutUsTitle,
    aboutUsText,
    aboutUsPhotoUrl,
    facebookUrl,
    youtubeUrl,
    otherUrl,
    homeOwnerPhotoUrl,
    homeOwnerText,
    homeOwnerTitle
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

  // Restructured site layout navigation and filtering states
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'contact' | 'about'>('home');
  const [priceRange, setPriceRange] = useState<number>(250000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Home Screen Carousel slides
  const promoSlides = [
    {
      title: "PREMIUM CONSTRUCTION STEEL REINFORCEMENT",
      desc: "Order standard-certified BSRM Xtreme 500W deformed reinforcement bars directly. Ensuring maximum security, shear resistance, and concrete-gripping strength for commercial foundations in Gopalganj & Faridpur.",
      badge: "Deal Of The Month",
      offer: "Best price per ton with door-to-door transit truck delivery.",
      cta: "Explore Steel Catalog",
      categoryTarget: "Rod & Structural Steel",
      img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200",
      bgGradient: "from-[#081621] via-[#0d2235] to-[#041120]",
    },
    {
      title: "ULTIMATE STRUCTURAL BINDING CEMENT",
      desc: "Discover Seven Rings Gold, Akij, and Anchor Premium composite cement sacks. Expertly balanced binders with rapid setting profiles and high structural reliability for solid load-bearing pillars and roofs.",
      badge: "Bulk Save Extra",
      offer: "Get ৳15 off per bag on bookings above 300 sacks with free sand loaders.",
      cta: "Explore Cement Catalog",
      categoryTarget: "Cement",
      img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200",
      bgGradient: "from-[#1a1112] via-[#2d1112] to-[#120506]",
    }
  ];

  // Auto-rotate effect for the hero slider banner
  useEffect(() => {
    if (currentTab !== 'home') return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentTab]);

  // helper to get icon, color and metadata for real dynamic categories from the store/database
  const getCategoryDetails = (catName: string) => {
    const normalized = catName.toLowerCase();
    
    if (normalized.includes('steel') || normalized.includes('rod')) {
      return {
        name: catName,
        desc: "High-grade structural steel and deformed bars",
        icon: RodSteelIcon,
        color: "text-red-600 bg-red-50 border-red-200"
      };
    }
    if (normalized.includes('cement')) {
      return {
        name: catName,
        desc: "Premium Portland composites & binders",
        icon: CementIcon,
        color: "text-amber-600 bg-amber-50 border-amber-200"
      };
    }
    if (normalized.includes('bricks') || normalized.includes('brick') || normalized.includes('block')) {
      return {
        name: catName,
        desc: "Standard clay bricks & autoclaved blocks",
        icon: BricksIcon,
        color: "text-orange-600 bg-orange-50 border-orange-200"
      };
    }
    if (normalized.includes('sand') || normalized.includes('aggregate')) {
      return {
        name: catName,
        desc: "Fine river sand & crushed aggregates",
        icon: SandIcon,
        color: "text-yellow-700 bg-yellow-50 border-yellow-200"
      };
    }
    if (normalized.includes('tiles') || normalized.includes('sanitary') || normalized.includes('bath') || normalized.includes('pot') || normalized.includes('toilet') || normalized.includes('basin')) {
      return {
        name: catName,
        desc: "Polished flooring & bathroom fixtures",
        icon: TilesIcon,
        color: "text-indigo-600 bg-indigo-50 border-indigo-200"
      };
    }
    if (normalized.includes('hardware') || normalized.includes('tool') || normalized.includes('equip') || normalized.includes('hammer') || normalized.includes('wrench')) {
      return {
        name: catName,
        desc: "Industrial hammers, wrenches & supplies",
        icon: ToolsIcon,
        color: "text-slate-600 bg-slate-50 border-slate-200"
      };
    }
    if (normalized.includes('pipes') || normalized.includes('fitting') || normalized.includes('elbow') || normalized.includes('plug') || normalized.includes('unions')) {
      return {
        name: catName,
        desc: "Heavy-duty uPVC and elbow connectors",
        icon: PipesIcon,
        color: "text-teal-600 bg-teal-50 border-teal-200"
      };
    }
    if (normalized.includes('paint') || normalized.includes('coil') || normalized.includes('wiring') || normalized.includes('wire')) {
      return {
        name: catName,
        desc: "Protective bucket paints & electrical wiring",
        icon: PaintCoilsIcon,
        color: "text-pink-600 bg-pink-50 border-pink-200"
      };
    }
    
    // Fallback icon and colors for newly added custom categories
    return {
      name: catName,
      desc: `Premium authorized ${catName} supplies`,
      icon: CementIcon,
      color: "text-sky-600 bg-sky-50 border-sky-200"
    };
  };

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    setSearchQuery('');
    setActiveBrand('All');
    setStockFilter('All');
    setPriceRange(250000);
    setCurrentTab('shop');
    setIsCheckout(false);
    setIsProfileOpen(false);
    setSelectedProduct(null);
  };

  // Deterministic seed-based shuffling to generate high-mesh, decoupled row arrays
  const generateSmartMeshRow = (prodList: Product[], rowSeed: number): Product[] => {
    if (!prodList || prodList.length === 0) return [];
    
    // Fallback if inventory size is extremely sparse
    if (prodList.length < 3) {
      const fallbackList: Product[] = [];
      for (let i = 0; i < 350; i++) {
        fallbackList.push({ ...prodList[i % prodList.length], id: `mesh-p-${rowSeed}-${i}` });
      }
      return fallbackList;
    }

    // Decoupled shuffling order for each row using deterministic sin logic
    let working = [...prodList].sort((a, b) => {
      const codeA = a.name.charCodeAt(0) + a.name.charCodeAt(a.name.length - 1);
      const codeB = b.name.charCodeAt(0) + b.name.charCodeAt(b.name.length - 1);
      return Math.sin(codeA * rowSeed) - Math.sin(codeB * rowSeed);
    });

    const meshed: Product[] = [];
    const pool = [...working];

    // Anti-clusters sequencing
    while (pool.length > 0) {
      let chosenIdx = 0;
      if (meshed.length > 0) {
        const lastItem = meshed[meshed.length - 1];
        let found = pool.findIndex(x => x.category !== lastItem.category && x.brand !== lastItem.brand);
        if (found === -1) {
          found = pool.findIndex(x => x.category !== lastItem.category);
        }
        if (found === -1) {
          found = pool.findIndex(x => x.brand !== lastItem.brand);
        }
        if (found !== -1) {
          chosenIdx = found;
        }
      }
      meshed.push(pool[chosenIdx]);
      pool.splice(chosenIdx, 1);
    }

    // Multiply the meshed sequence up to 350 items sequentially
    const sequenceList: Product[] = [];
    for (let i = 0; i < 350; i++) {
      const baseItem = meshed[i % meshed.length];
      sequenceList.push({ ...baseItem, id: `${baseItem.id}-mesh-row-${rowSeed}-${i}` });
    }

    // Final boundary pass to fix adjacent wrap glitches
    for (let i = 1; i < sequenceList.length; i++) {
      const prev = sequenceList[i - 1];
      const curr = sequenceList[i];
      if (curr.category === prev.category || curr.brand === prev.brand) {
        // Search subsequent candidates up to 20 spaces
        for (let j = i + 1; j < Math.min(sequenceList.length, i + 20); j++) {
          const candidate = sequenceList[j];
          const nextOfCand = sequenceList[j + 1];
          if (
            candidate.category !== prev.category && 
            candidate.brand !== prev.brand &&
            (nextOfCand ? candidate.category !== nextOfCand.category : true)
          ) {
            sequenceList[i] = candidate;
            sequenceList[j] = curr;
            break;
          }
        }
      }
    }

    return sequenceList;
  };
  
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

  // Filter by dynamic Price Range slider
  filtered = filtered.filter(p => p.salePrice <= priceRange);
  
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
      
      {/* Main Header (Pure Star Tech Style Architecture) */}
      <header className="bg-gradient-to-r from-[#081621] via-[#0d2232] to-[#081621] text-white sticky top-0 z-30 shadow-2xl border-t-2 border-[#ef4a23] border-b border-orange-500/10 py-3.5 sm:py-5 md:py-6 select-none">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* MOBILE RESPONSIVE LAYOUT (Double-row setup to handle small screens elegantly without any ribbon truncation) */}
          <div className="flex md:hidden flex-col gap-2.5">
            {/* Row 1: Brand Logo & Actions */}
            <div className="flex flex-row items-center justify-between gap-2 flex-nowrap w-full">
              {/* Logo / Brand Name - 100% visible on mobile, no overlapping or clipping */}
              <div 
                className="cursor-pointer shrink-0 flex flex-col text-left justify-center" 
                onClick={() => { setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}
              >
                <h1 className="text-sm font-black tracking-tight text-white m-0 leading-none hover:text-[#ef4a23] transition-colors whitespace-nowrap">
                  মেসার্স হাসিনা ট্রেডার্স
                </h1>
                <div className="h-1"></div>
                <p className="text-gray-350 text-[8.5px] font-black uppercase tracking-widest leading-none">
                  M/S Hasina Traders
                </p>
              </div>

              {/* Actions: Hotline, Cart, User, Admin */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Hotline Quick Action link */}
                <a 
                  href="tel:+8801988030534" 
                  className="flex items-center gap-1 bg-[#ef4a23]/20 border border-[#ef4a23]/40 px-2 py-1 rounded hover:bg-[#ef4a23] transition-all shrink-0"
                  title="Call Hotline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-mono text-[9px] font-black text-white">+880-1988030534</span>
                </a>

                {/* Cart Icon */}
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className="relative p-1 text-white hover:text-[#ef4a23] transition-colors shrink-0 cursor-pointer"
                  title="View Cart"
                >
                  <ShoppingCart size={17} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ef4a23] text-white text-[7.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* Profile Button */}
                {currentUser ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => { setIsProfileOpen(!isProfileOpen); setIsCheckout(false); setSelectedProduct(null); }}
                      className={`flex items-center gap-0.5 text-[8.5px] font-black uppercase text-white hover:text-[#ef4a23] px-1.5 py-1 rounded border ${isProfileOpen ? 'border-[#ef4a23] text-[#ef4a23]' : 'border-gray-800 bg-[#112335]'} transition-all`}
                    >
                      <User size={11} className="text-[#ef4a23]" />
                      <span className="max-w-[42px] truncate inline">{currentUser.displayName || 'User'}</span>
                    </button>
                    <button onClick={handleLogout} className="p-0.5 hover:text-red-500 text-gray-400 transition-colors shrink-0" title="Log Out">
                      <LogOut size={12} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsAuthModalOpen(true); setAuthTab('login'); }}
                    className="flex items-center gap-0.5 hover:text-[#ef4a23] border border-gray-800 text-[8.5px] font-black tracking-wide bg-[#112335] text-white py-1 px-1.5 rounded shadow-inner transition-colors shrink-0"
                  >
                    <LogIn size={11} className="text-[#ef4a23]"/>
                    <span>Login</span>
                  </button>
                )}

                {/* Admin Icon link */}
                <button onClick={onOpenAdmin} className="text-gray-400 hover:text-white p-0.5 shrink-0" title="Admin Dashboard">
                  <svg size={15} className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </button>
              </div>
            </div>

            {/* Row 2: Full Width Navigation Tabs Ribbon */}
            <div className="flex bg-[#0c1e2d] p-0.5 rounded-lg border border-gray-800 shadow-inner w-full flex-row">
              <button 
                onClick={() => { setCurrentTab('home'); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}
                className={`flex-1 text-center py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentTab === 'home' && !isCheckout && !isProfileOpen && !selectedProduct
                    ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏡 Home
              </button>

              <button 
                onClick={() => { setCurrentTab('shop'); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}
                className={`flex-1 text-center py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentTab === 'shop' && !isCheckout && !isProfileOpen && !selectedProduct
                    ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛍️ Shop
              </button>

              <button 
                onClick={() => { setCurrentTab('contact'); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}
                className={`flex-1 text-center py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentTab === 'contact' && !isCheckout && !isProfileOpen && !selectedProduct
                    ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📞 Contact
              </button>

              <button 
                onClick={() => { setCurrentTab('about'); setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}
                className={`flex-1 text-center py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentTab === 'about' && !isCheckout && !isProfileOpen && !selectedProduct
                    ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ℹ️ About Us
              </button>
            </div>
          </div>

          {/* DESKTOP LAYOUT (Perfect single-row design retained for large screens - "desktop okay ase") */}
          <div className="hidden md:flex flex-row items-center justify-between gap-4 flex-nowrap w-full">
            
            {/* Logo, Brand Identity, & Navigation Tabs next to it */}
            <div className="flex flex-row items-center gap-5 md:gap-8 shrink-0">
               <div className="cursor-pointer shrink-0 flex flex-col justify-center" onClick={() => { setIsCheckout(false); setIsProfileOpen(false); setSelectedProduct(null); }}>
                  <h1 className="text-base sm:text-lg md:text-2xl font-black tracking-tight text-white m-0 leading-none hover:text-[#ef4a23] transition-colors whitespace-nowrap">
                    মেসার্স হাসিনা ট্রেডার্স
                  </h1>
                  <div className="h-1.5 sm:h-2"></div>
                  <p className="text-gray-300 text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">
                    M/S Hasina Traders
                  </p>
               </div>

               {/* Header Navigation Menu right next to the Brand name with no overflow scroll or swipe system */}
               <div className="flex bg-[#0c1e2d] p-0.5 rounded-lg border border-gray-800 shadow-inner flex-nowrap">
                 <button 
                   onClick={() => { 
                     setCurrentTab('home'); 
                     setIsCheckout(false); 
                     setIsProfileOpen(false); 
                     setSelectedProduct(null); 
                   }}
                   className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none shrink-0 ${
                     currentTab === 'home' && !isCheckout && !isProfileOpen && !selectedProduct
                       ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)] font-black' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   🏡 Home
                 </button>

                 <button 
                   onClick={() => { 
                     setCurrentTab('shop'); 
                     setIsCheckout(false); 
                     setIsProfileOpen(false); 
                     setSelectedProduct(null); 
                   }}
                   className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none shrink-0 ${
                     currentTab === 'shop' && !isCheckout && !isProfileOpen && !selectedProduct
                       ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)] font-black' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   🛍️ Shop
                 </button>

                 <button 
                   onClick={() => { 
                     setCurrentTab('contact'); 
                     setIsCheckout(false); 
                     setIsProfileOpen(false); 
                     setSelectedProduct(null); 
                   }}
                   className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none shrink-0 ${
                     currentTab === 'contact' && !isCheckout && !isProfileOpen && !selectedProduct
                       ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)] font-black' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   📞 Contact
                 </button>

                 <button 
                   onClick={() => { 
                     setCurrentTab('about'); 
                     setIsCheckout(false); 
                     setIsProfileOpen(false); 
                     setSelectedProduct(null); 
                   }}
                   className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none shrink-0 ${
                     currentTab === 'about' && !isCheckout && !isProfileOpen && !selectedProduct
                       ? 'bg-[#ef4a23] text-white shadow-[0_2px_4px_rgba(239,74,35,0.25)] font-black' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   ℹ️ About Us
                 </button>
               </div>
            </div>

            {/* Premium Glowing Hotline Display - Integrated in the same single line */}
            <div className="hidden lg:flex items-center gap-2 bg-[#ef4a23]/10 border border-[#ef4a23]/30 px-3 py-1.5 rounded-lg shadow-inner shrink-0">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
               <div className="flex flex-col text-left">
                 <span className="text-[8px] uppercase font-black tracking-widest text-[#ef4a23] leading-none">Building Materials Hotline</span>
                 <a href="tel:+8801988030534" className="font-mono text-xs font-black text-white hover:text-[#ef4a23] mt-1 transition-colors leading-none">
                   +880-1988030534
                 </a>
               </div>
            </div>

            {/* Quick Actions (Cart, Profile, Admin) inline with no Google Auth Badge */}
            <div className="flex items-center gap-4 shrink-0">
               {/* Cart Flow Action */}
               <button 
                 onClick={() => setIsCartOpen(true)} 
                 className="relative p-1.5 text-white hover:text-[#ef4a23] transition-colors shrink-0 cursor-pointer"
                 title="View Cart"
               >
                 <ShoppingCart size={18} />
                 {cartItemCount > 0 && (
                   <span className="absolute -top-1 -right-1 bg-[#ef4a23] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                     {cartItemCount}
                   </span>
                 )}
               </button>

               {/* Profile Dashboard flow */}
               {currentUser ? (
                 <div className="flex items-center gap-2 shrink-0">
                   <button 
                     onClick={() => { setIsProfileOpen(!isProfileOpen); setIsCheckout(false); setSelectedProduct(null); }}
                     className={`flex items-center gap-1 text-xs font-black uppercase text-white hover:text-[#ef4a23] px-1.5 py-1 rounded border ${isProfileOpen ? 'border-[#ef4a23] text-[#ef4a23]' : 'border-gray-800 bg-[#112335]'} transition-all`}
                   >
                     <User size={13} className="text-[#ef4a23]" />
                     <span className="max-w-[80px] truncate hidden xs:inline">{currentUser.displayName || 'User'}</span>
                   </button>
                   <button onClick={handleLogout} className="p-1 hover:text-red-500 text-gray-400 transition-colors shrink-0" title="Log Out">
                     <LogOut size={14} />
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => { setIsAuthModalOpen(true); setAuthTab('login'); }}
                   className="flex items-center gap-1 hover:text-[#ef4a23] border border-gray-850 text-xs font-black tracking-wide bg-[#112335] text-white py-1.5 px-3 rounded shadow-inner transition-colors shrink-0"
                 >
                   <LogIn size={13} className="text-[#ef4a23]"/>
                   <span className="hidden xs:inline">Login</span>
                 </button>
               )}

               {/* Secure Admin Portal Link */}
               <button onClick={onOpenAdmin} className="text-gray-400 hover:text-white p-1 shrink-0" title="Admin Dashboard">
                 <svg size={16} className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
               </button>
            </div>

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
                           <span className="text-[9px] text-gray-400 font-bold">৳{c.product.salePrice.toLocaleString()} ({c.product.unit || (isConstructionRod(c.product) ? 'KG' : 'Pcs')})</span>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 md:px-4 py-2 md:py-6">
        
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
                             <span className="text-2xl font-black text-red-600">৳{selectedProduct.salePrice.toLocaleString()} ({selectedProduct.unit || (isConstructionRod(selectedProduct) ? 'KG' : 'Pcs')})</span>
                           </div>
                           {selectedProduct.regularPrice > selectedProduct.salePrice && (
                             <div className="flex flex-col">
                               <span className="text-xs text-gray-500 font-medium">Regular Price</span>
                               <span className="text-xs text-gray-400 line-through font-semibold font-mono">৳{selectedProduct.regularPrice.toLocaleString()} ({selectedProduct.unit || (isConstructionRod(selectedProduct) ? 'KG' : 'Pcs')})</span>
                             </div>
                           )}
                           {selectedProduct.regularPrice > selectedProduct.salePrice && (
                             <div className="bg-orange-100 text-orange-850 text-xs font-black py-1 px-3 rounded-md">
                               Special Savings: ৳{(selectedProduct.regularPrice - selectedProduct.salePrice).toLocaleString()}
                             </div>
                           )}
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
          currentTab === 'home' ? (
            /* SWITCH CASE 3: PREMIUM HOME EXPERIENCE LANDING PAGE (Offline/Online Double Active) */
            <div className="space-y-6 md:space-y-8">

              {/* SECTION 1: DYNAMIC "FEATURED CATEGORY" INTERFACE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                  <h2 className="text-lg md:text-xl font-black text-[#081621] tracking-tight font-sans">Featured Categories</h2>
                  <span className="text-gray-400 text-[10px] font-bold font-mono uppercase bg-gray-100 py-1 px-2.5 rounded">{categories.length} Sectors</span>
                </div>

                {/* Ultra-compact horizontal category badges to minimize height so Featured Products is visible alongside it on first viewport entry */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 px-0.5">
                  {categories.map((catName, idx) => {
                    const cat = getCategoryDetails(catName);
                    const CatIcon = cat.icon;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleCategoryClick(catName)}
                        className="bg-white border border-gray-180 hover:border-red-300 rounded-lg p-1.5 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 sm:justify-start"
                      >
                        <div className={`p-1.5 rounded-md ${cat.color} group-hover:scale-105 transition-transform duration-300 border flex items-center justify-center shrink-0 h-7 w-7`}>
                          <CatIcon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-[10px] sm:text-[11px] text-[#081621] tracking-tight leading-tight group-hover:text-[#ef4a23] transition-colors font-sans break-words pr-1">{catName}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: FEATURED PRODUCTS INFINITE GLIDERS */}
              <div className="space-y-4 py-1 overflow-hidden">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                  <h2 className="text-lg md:text-xl font-black text-[#081621] tracking-tight flex items-center gap-1 font-sans">
                    Featured Products
                  </h2>
                </div>

                {/* 2 Parallel Infinite Glide Loops with Shuffled Sequences both scrolling in the same direction */}
                <div className="space-y-3 relative select-text font-sans">
                  
                  {/* Row 1 - Seed 101 - Slides Left (Positive medium-fast speed) */}
                  <div>
                    <MeshProductSliderRow 
                      products={products} 
                      seed={101} 
                      speed={1.6} 
                      addToCart={addToCart}
                      setSelectedProduct={setSelectedProduct}
                      setDetailsTab={setDetailsTab}
                      isConstructionRod={isConstructionRod}
                    />
                  </div>

                  {/* Row 2 - Seed 202 - Slides Left (Positive medium-fast speed - same direction!) */}
                  <div>
                    <MeshProductSliderRow 
                      products={products} 
                      seed={202} 
                      speed={1.6} 
                      addToCart={addToCart}
                      setSelectedProduct={setSelectedProduct}
                      setDetailsTab={setDetailsTab}
                      isConstructionRod={isConstructionRod}
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 3: PREMIUM OWNER SHOWCASE BANNER */}
              <div className="bg-gradient-to-br from-[#081621] to-[#0c1e2d] text-white rounded-2xl shadow-xl overflow-hidden border-b-4 border-[#ef4a23] mt-8 text-left font-sans">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Left Side: Owner Profile Portrait image (Dimension style: 1536 X 2048) */}
                  <div className="w-full md:w-[32%] lg:w-[28%] shrink-0 relative bg-slate-950/20 border-r border-[#ef4a23]/10 flex flex-col justify-stretch">
                    <div className="relative aspect-[1536/2048] w-full h-full min-h-[300px] md:h-full">
                      <img 
                        src={homeOwnerPhotoUrl || "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=1536&h=2048"} 
                        alt="MS Hasina Traders Proprietor" 
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/30 to-transparent"></div>
                      {/* Floating badge inside the portrait container */}
                      <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10">
                        <span className="bg-[#ef4a23] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-md border border-[#ef4a23]/30">
                          Reliable Leader Since 1996
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Mid range premium message paragraph */}
                  <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#ef4a23] uppercase tracking-widest">PROPRIETOR'S MESSAGE</p>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">
                        {homeOwnerTitle || "মেসার্স হাসিনা ট্রেডার্স-এর চেয়ারম্যান ও প্রোপরাইটর বাবুল মাতুব্বর"}
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-semibold whitespace-pre-line text-justify">
                      {homeOwnerText || "বিগত ৩ দশক ধরে আমরা অত্যন্ত সততা ও বিশ্বস্ততার সাথে গোপালগঞ্জ, ফরিদপুর ও পার্শ্ববর্তী অঞ্চলে বিশ্বখ্যাত রড, সেরা ব্র্যান্ডের কোয়ালিটি সিমেন্ট এবং স্যানিটারি সামগ্রী সরবরাহ করে আসছি। গুণগত মান ও ওজনে বিন্দুমাত্র ছাড় না দিয়ে দেশের উন্নয়ন কার্যক্রমে সরাসরি অংশীদার থাকাই আমাদের সর্বোচ্চ অঙ্গীকার। কাঙ্ক্ষিত সময়ে ও নিরাপদ ডেলিভারির নিশ্চয়তার মাধ্যমে আপনার কষ্টের টাকায় গড়া স্বপ্নের প্রতিটি স্থাপনা মজবুত ও দীর্ঘস্থায়ী করার লক্ষ্যে আমরা অবিরাম কাজ করে যাচ্ছি। যেকোনো নির্মাণ প্রকল্পে আমাদের পরামর্শ ও সহযোগিতার জন্য সরাসরি হটলাইনে যোগাযোগ করুন।"}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Contact Direct</span>
                        <a href="tel:+8801988030534" className="font-mono text-sm sm:text-base font-black text-white hover:text-[#ef4a23] transition-colors leading-none mt-1">
                          +880-1988030534
                        </a>
                      </div>
                      <span className="text-gray-700">|</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Location Status</span>
                        <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Batikamari Bazar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate Footer Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-200 pt-8 text-left font-sans">
                <div className="flex items-start gap-3">
                  <div className="bg-[#ef4a23]/10 text-[#ef4a23] p-2 rounded-lg"><ShieldCheck size={20}/></div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#081621] uppercase tracking-wide">100% Licensed & Standardized</h4>
                    <p className="text-[11px] text-gray-500 mt-1">Every consignment carries BUET test reports & certified mill approvals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#ef4a23]/10 text-[#ef4a23] p-2 rounded-lg font-mono font-bold">৳</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#081621] uppercase tracking-wide">No Hidden Middlemen Costs</h4>
                    <p className="text-[11px] text-gray-500 mt-1">Real-time fair wholesale rates directly comparable with Bangladesh market sheets.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#ef4a23]/10 text-[#ef4a23] p-2 rounded-lg"><Phone size={18}/></div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#081621] uppercase tracking-wide">Emergency Site Logistics</h4>
                    <p className="text-[11px] text-gray-500 mt-1">Gopalganj- Faridpur district supply trucks available 24/7. Phone support included.</p>
                  </div>
                </div>
              </div>

            </div>
          ) : currentTab === 'contact' ? (
            /* SWITCH CASE 5: CONTACT & ADDRESS TAB VIEW */
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden text-left font-sans animate-in fade-in slide-in-from-top-4 duration-305">
              <div className="bg-[#081621] text-white p-6 md:p-8 relative overflow-hidden border-b-4 border-[#ef4a23]">
                <div className="absolute top-0 right-0 opacity-10 translate-x-12 -translate-y-12 select-none pointer-events-none">
                  <Phone size={240} className="text-white" />
                </div>
                <div className="relative z-10 max-w-xl space-y-2">
                  <span className="bg-[#ef4a23] text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded">24/7 Hotline Support</span>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Contact & Address Details</h1>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-semibold">
                    Have bulk requirements or custom construction site requests? Get in touch with our representative or Bablu Matubbor directly.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address Box */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
                    <h3 className="font-extrabold text-sm text-[#081621] uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-[#ef4a23]" /> Physical Warehouse
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm font-extrabold text-gray-800">M/S Hasina Traders</p>
                      <p className="text-xs text-gray-650 leading-normal font-semibold">
                        Batikamari Bazar, Batikamari, Gopalganj Sadar,<br />
                        Gopalganj, Bangladesh
                      </p>
                      <p className="text-[11px] text-gray-400 font-bold">
                        (Conveniently located near the primary highway junction for easy sand loader & steel delivery truck access).
                      </p>
                    </div>
                  </div>

                  {/* Contact Numbers Box */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
                    <h3 className="font-extrabold text-sm text-[#081621] uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <Phone size={16} className="text-[#ef4a23]" /> Mobile & Email
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="bg-orange-50 text-[#ef4a23] font-bold text-[9px] uppercase px-1.5 py-0.5 rounded border border-orange-100 shrink-0 mt-0.5">Primary</span>
                        <div>
                          <p className="text-sm font-black text-gray-800 font-mono">+880-1988030534</p>
                          <p className="text-[10px] text-gray-400 font-semibold font-sans">Proprietor: Bablu Matubbor</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="bg-sky-50 text-sky-700 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded border border-sky-100 shrink-0 mt-0.5">Backup</span>
                        <div>
                          <p className="text-sm font-black text-gray-800 font-mono">+880-1996418168</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded border border-emerald-100 shrink-0 mt-0.5">Email</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 font-sans">tradersmshasina@gmail.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Message form / Inquiry Form */}
                <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4 shadow-3xs">
                  <div className="border-b pb-3">
                    <h3 className="font-extrabold text-sm text-[#081621] uppercase tracking-wider">Leave a Digital Site Inquiry</h3>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Submit your rod and cement estimate; our administrative desks will answer with custom rate calculations.</p>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry submitted successfully! Our representative will call you back within 15 minutes."); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">Company / Your Name *</label>
                      <input required type="text" placeholder="e.g., Sanajidul Tamim" className="w-full border rounded p-2 text-xs font-semibold outline-none focus:border-[#ef4a23]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">Mobile Contact Phone *</label>
                      <input required type="tel" placeholder="e.g., 01988030534" className="w-full border rounded p-2 text-xs font-mono outline-none focus:border-[#ef4a23]" />
                    </div>
                    <div className="sm:col-span-2">
                       <label className="block text-[10px] font-extrabold uppercase tracking-wide text-gray-500 mb-1">Message / Materials Calculation Details *</label>
                       <textarea required rows={4} placeholder="e.g. Need 4 tons of 16mm BSRM Rod and 150 bags of Seven Rings Cement delivered to Sadar site..." className="w-full border border-gray-200 rounded p-2 text-xs font-semibold outline-none focus:border-[#ef4a23]"></textarea>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button type="submit" className="bg-[#ef4a23] hover:bg-[#d83c17] text-white text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-md shadow-sm cursor-pointer transition-colors">
                        Send Site Inquiry
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : currentTab === 'about' ? (
            /* SWITCH CASE 6: ABOUT US PROPRIETOR VIEW */
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden text-left font-sans animate-in fade-in slide-in-from-top-4 duration-305">
              <div className="bg-[#081621] text-white p-6 md:p-8 relative overflow-hidden border-b-4 border-[#ef4a23]">
                <div className="absolute top-0 right-0 opacity-10 translate-x-12 -translate-y-12 select-none pointer-events-none">
                  <User size={240} className="text-white" />
                </div>
                <div className="relative z-10 max-w-xl space-y-2">
                  <span className="bg-[#ef4a23] text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded">Heritage Since 1996</span>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">About Hasina Traders</h1>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-semibold">
                    Connecting premium building manufacturing plants to local commercial foundations with uncompromised logistics.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="w-full md:w-1/3 shrink-0">
                    <div className="border-4 border-gray-100 rounded-2xl overflow-hidden shadow-md bg-white">
                      <img 
                        src={aboutUsPhotoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"} 
                        alt="Proprietor of Hasina Traders" 
                        className="w-full aspect-[4/5] object-cover h-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-center text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-2.5 font-sans">
                      PROP. BABLU MATUBBOR
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-black text-[#081621] uppercase tracking-tight border-b pb-2 font-sans">
                      {aboutUsTitle || "Our Proprietor Bablu Matubbor"}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-705 leading-relaxed font-semibold whitespace-pre-line">
                      {aboutUsText || "M/S Hasina Traders has been a pioneer in building construction supplies and structural materials since 1996 in Gopalganj, Faridpur, and surrounding districts. Focused on reliability, premium quality standards, and on-site delivery networks."}
                    </p>
                     <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 mt-6">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 font-sans">Our Quality Guarantee</h4>
                      <p className="text-[11px] text-gray-500 leading-normal font-semibold">
                        Every single delivery from our shipyard is certified of standard weight, mill-certified grade, and is fully approved of strength parameters. We reject sub-standard products at our shipyard so that your building remains secure for decades.
                      </p>
                    </div>

                    {/* Dynamic Social Links inside the About Us view */}
                    {(facebookUrl || youtubeUrl || otherUrl) && (
                      <div className="mt-6 pt-5 border-t border-gray-150">
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 font-sans">Connecting via Social Platforms</h4>
                        <div className="flex flex-wrap gap-3">
                          {facebookUrl && (
                            <a 
                              href={facebookUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1.5 bg-[#1877f2]/5 border border-[#1877f2]/15 hover:border-[#1877f2]/30 hover:bg-[#1877f2]/10 text-[#1877f2] font-semibold text-[11px] uppercase px-3.5 py-2 rounded-lg transition-all"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                              </svg>
                              Official Facebook Page
                            </a>
                          )}
                          {youtubeUrl && (
                            <a 
                              href={youtubeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1.5 bg-red-600/5 border border-red-650/15 hover:border-red-600/30 hover:bg-red-650/10 text-red-605 font-semibold text-[11px] uppercase px-3.5 py-2 rounded-lg transition-all"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M23.498 6.163c-.272-1.022-1.04-1.826-2.022-2.1c-1.78-.485-8.913-.485-8.913-.485s-7.133 0-8.912.485c-.982.274-1.75 1.078-2.021 2.1c-.48 1.83-.48 5.65-.48 5.65s0 3.82.48 5.65c.271 1.022 1.04 1.826 2.021 2.1c1.78.485 8.912.485 8.912.485s7.133 0 8.913-.485c.983-.274 1.75-1.078 2.022-2.1c.48-1.83.48-5.65.48-5.65s0-3.82-.48-5.65zm-14.27 10.33V7.5l6.59 4.5z"/>
                              </svg>
                              YouTube Channel
                            </a>
                          )}
                          {otherUrl && (
                            <a 
                              href={otherUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1.5 bg-emerald-600/5 border border-emerald-600/15 hover:border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-600 font-semibold text-[11px] uppercase px-3.5 py-2 rounded-lg transition-all"
                            >
                              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                              Official Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SWITCH CASE 4: SHOP SEARCH & CATALOG (PUBLIC DISCOVERY MODULE) */
            <div className="space-y-6 text-left">
              {/* Elastic Search Engine */}
              <div className="bg-[#081621] rounded-xl p-4 md:p-6 shadow-md border border-orange-500/10 flex flex-col md:flex-row items-center gap-4">
                <div className="text-left flex-1">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider">Search Our Catalog</h2>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">Look up rods, cement, building inputs, fittings, or brands instantly.</p>
                </div>
                <div className="w-full max-w-xl relative">
                  <input 
                    type="text" 
                    placeholder="Search rods, cement, categories, or brands..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#112335] text-white rounded-lg py-2.5 md:py-3 px-4 pr-12 outline-none text-xs md:text-sm placeholder:text-gray-400 focus:bg-white focus:text-[#081621] focus:ring-2 focus:ring-[#ef4a23] border border-transparent transition-all"
                  />
                  <Search size={18} className="absolute right-4 top-2.5 md:top-3.5 text-gray-400 cursor-pointer pointer-events-none"/>
                </div>
              </div>

              {/* Dynamic Categories Rail (Rod, Cement, Fittings etc.) wrapped neatly with no horizontal scroll scroll/swipe track */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-3 text-left">
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <button 
                    onClick={() => { setActiveCategory('All'); }} 
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeCategory === 'All' 
                        ? 'bg-[#ef4a23] text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c} 
                      onClick={() => { setActiveCategory(c); }} 
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                        activeCategory === c 
                          ? 'bg-[#ef4a23] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
              {/* Left Sidebar compact responsive layout for mobile friendliness */}
              <aside className="hidden md:block w-full md:w-64 shrink-0 space-y-4">
                
                {/* Category Selection List Filter Block */}
                <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
                   <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#081621] border-b pb-2 mb-3">Categories</h3>
                   <div className="space-y-2">
                     <label className="flex items-center gap-2 cursor-pointer group select-none">
                       <input 
                         type="radio" 
                         name="cat" 
                         checked={activeCategory === 'All'} 
                         onChange={() => setActiveCategory('All')} 
                         className="w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" 
                       />
                       <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#ef4a23] transition-colors">All Categories</span>
                     </label>
                     {categories.map(c => (
                       <label key={c} className="flex items-center gap-2 cursor-pointer group select-none">
                         <input 
                           type="radio" 
                           name="cat" 
                           checked={activeCategory === c} 
                           onChange={() => setActiveCategory(c)} 
                           className="w-4 h-4 text-[#ef4a23] focus:ring-[#ef4a23] cursor-pointer" 
                         />
                         <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#ef4a23] transition-colors">{c}</span>
                       </label>
                     ))}
                   </div>
                </div>

                {/* Price Range Filter Block */}
                <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
                   <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#081621] border-b pb-2 mb-3 font-sans">Price Range</h3>
                   <input 
                     type="range" 
                     min={0} 
                     max={250000} 
                     step={500} 
                     value={priceRange} 
                     onChange={(e) => setPriceRange(Number(e.target.value))} 
                     className="w-full accent-[#ef4a23] cursor-pointer" 
                   />
                   <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mt-1.5 font-mono">
                     <span>৳0</span>
                     <span className="text-red-650 font-black text-xs font-sans">Up to ৳{priceRange.toLocaleString()}</span>
                     <span>৳2.5L</span>
                   </div>
                </div>

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
              
               {/* MOBILE COMPACT FILTER ROW (Ultra Space Saving) */}
               <div className="md:hidden space-y-1 mb-1.5 bg-white p-2 rounded-lg border border-gray-150 shadow-2xs">
                 {/* Availability horizontal list */}
                <div className="flex items-start gap-1 mb-0.5">
                   <span className="text-[9px] font-black uppercase text-gray-400 shrink-0 w-11">Stock:</span>
                   <div className="flex flex-wrap gap-1 py-0.5">
                     {['All', 'In Stock', 'Pre Order', 'Upcoming'].map(s => {
                       const isSelected = stockFilter === s;
                       return (
                         <button
                           key={s}
                           onClick={() => setStockFilter(s as any)}
                           className={`text-[8.5px] font-black px-1.5 py-0.5 rounded transition-all whitespace-nowrap border ${
                             isSelected 
                               ? 'bg-[#ef4a23] border-[#ef4a23] text-white shadow-3xs' 
                               : 'bg-gray-50 border-gray-200 text-gray-650 hover:bg-gray-100'
                           }`}
                         >
                           {s}
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 {/* Brands wrapped list - shown in exactly/maximum two lines without swiping */}
                 <div className="flex items-start gap-1">
                   <span className="text-[9px] font-black uppercase text-[#8897a6] mt-1 shrink-0 w-11">Brand:</span>
                   <div className="flex flex-wrap gap-1 py-0.5">
                     <button
                       onClick={() => setActiveBrand('All')}
                       className={`text-[8.5px] font-black px-1.5 py-0.5 rounded transition-all whitespace-nowrap border ${
                         activeBrand === 'All' 
                           ? 'bg-[#ef4a23] border-[#ef4a23] text-white shadow-3xs' 
                           : 'bg-gray-50 border-gray-200 text-gray-[#556370] hover:bg-gray-100'
                       }`}
                     >
                       All Brands
                     </button>
                     {brands.map(b => {
                       const isSelected = activeBrand === b;
                       return (
                         <button
                           key={b}
                           onClick={() => setActiveBrand(b)}
                           className={`text-[8.5px] font-black px-1.5 py-0.5 rounded transition-all whitespace-nowrap border ${
                             isSelected 
                               ? 'bg-[#ef4a23] border-[#ef4a23] text-white shadow-3xs' 
                               : 'bg-gray-50 border-gray-200 text-gray-[#556370] hover:bg-gray-100'
                           }`}
                         >
                           {b}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               </div>

              {/* Sorting Header Ledger Bar */}
              <div className="bg-white p-1 md:p-3.5 px-2 md:px-3.5 rounded-lg shadow-sm border border-gray-200 mb-1.5 md:mb-5 flex justify-between items-center gap-2">
                 <h2 className="text-[10px] md:text-xs font-extrabold text-gray-700 tracking-wide uppercase">
                   {filtered.length} {filtered.length === 1 ? 'Item' : 'Items'} Found
                 </h2>
                 <div className="flex gap-4">
                   <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded md:bg-transparent md:p-0">
                     <span className="text-[9px] md:text-[10px] text-gray-400 font-extrabold uppercase">Sort:</span>
                     <select value={sortMethod} onChange={e => setSortMethod(e.target.value as any)} className="bg-white md:bg-gray-50 border border-gray-255 text-[9px] md:text-xs rounded px-1.5 py-0.5 outline-none font-bold focus:border-[#ef4a23]">
                       <option>Default</option>
                       <option>Price L-H</option>
                       <option>Price H-L</option>
                     </select>
                   </div>
                 </div>
              </div>

              {/* Product cards layout */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-2 md:p-0">
                {filtered.map(p => {
                  const saveAmount = p.regularPrice - p.salePrice;
                  return (
                    <React.Fragment key={p.id}>
                      {/* DESKTOP CARD VIEW */}
                      <div className="hidden md:flex flex-col bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-4 relative border border-gray-150 justify-between group">
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
                          className="w-full h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-50/10 p-0.5 border border-gray-100 mb-3 mt-6 cursor-pointer relative"
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
                              <span className="text-lg font-black text-red-650 font-mono">৳{p.salePrice.toLocaleString()} ({p.unit || (isConstructionRod(p) ? 'KG' : 'Pcs')})</span>
                              {p.regularPrice > p.salePrice && (
                                <span className="text-xs text-gray-400 line-through font-mono">৳{p.regularPrice.toLocaleString()} ({p.unit || (isConstructionRod(p) ? 'KG' : 'Pcs')})</span>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {/* Red Interactive Shopping Cart Action button */}
                              <button 
                                onClick={() => addToCart(p)}
                                disabled={p.availability !== 'In Stock'}
                                className={`flex-grow font-extrabold py-2.5 rounded text-xs transition-colors shadow-xs uppercase tracking-wide flex items-center justify-center gap-1.5 ${
                                  p.availability === 'In Stock' ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95' : 'bg-gray-150 text-gray-400 cursor-not-allowed'
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

                      {/* PREMIUM MOBILE CARD VIEW (Strict Component Hierarchy) */}
                      <div className="md:hidden flex flex-col bg-white rounded-lg shadow-2xs hover:shadow-xs p-2.5 border border-gray-200 justify-between h-full select-none">
                        
                        {/* [1st - Top] Product Image WITH Save Badge in Left Corner */}
                        <div 
                          onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                          className="w-full aspect-square flex items-center justify-center overflow-hidden rounded bg-gray-50/10 p-0.5 border border-gray-150 cursor-pointer relative mb-1.5"
                        >
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            className="object-contain h-full w-full referrer" 
                            referrerPolicy="no-referrer" 
                          />
                          {saveAmount > 0 && (
                            <div className="absolute top-1 left-1 bg-[#ef4a23] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 font-sans tracking-wide">
                              Save: ৳{saveAmount.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* [2nd] Brand Name & Availability Badge */}
                        <div className="flex items-center justify-between gap-1 mb-1 bg-gray-50/30 p-1.5 rounded">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-sky-700 bg-sky-50 px-1 py-0.5 rounded truncate max-w-[55%] font-sans">
                            {p.brand || 'Generic'}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider font-sans shrink-0 ${
                            p.availability === 'In Stock' ? 'bg-emerald-50 text-emerald-800' :
                            p.availability === 'Pre Order' ? 'bg-sky-50 text-sky-800' : 'bg-fuchsia-50 text-fuchsia-800'
                          }`}>
                            {p.availability || 'In Stock'}
                          </span>
                        </div>

                        {/* [3rd] Product Title / Name */}
                        <h3 
                          onClick={() => { setSelectedProduct(p); setDetailsTab('specs'); }}
                          className="text-gray-900 font-bold text-[11px] leading-[1.3] line-clamp-2 hover:text-[#ef4a23] cursor-pointer transition-colors mb-1.5 flex-grow font-sans"
                        >
                          {p.name}
                        </h3>

                        {/* [4th] Discounted Price, Original Strike-Through Price, and Best Price tag */}
                        <div className="mb-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11.5px] font-black text-[#ef4a23] font-mono leading-none">
                              ৳{p.salePrice.toLocaleString()} ({p.unit || (isConstructionRod(p) ? 'KG' : 'Pcs')})
                            </span>
                            <div className="flex items-center gap-1 flex-wrap min-h-[12px]">
                              {p.regularPrice > p.salePrice ? (
                                <span className="text-[9px] text-gray-450 line-through font-mono">
                                  ৳{p.regularPrice.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-[8.5px] text-gray-400 font-semibold font-sans">Best Price</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* [5th - Bottom] Red Action Call Button (Shopping Cart) */}
                        <button 
                          onClick={() => addToCart(p)}
                          disabled={p.availability !== 'In Stock'}
                          className={`w-full font-extrabold py-2 rounded text-[10px] transition-all uppercase tracking-wider flex items-center justify-center gap-1 font-sans ${
                            p.availability === 'In Stock' 
                              ? 'bg-[#ef4a23] hover:bg-[#d83c17] active:scale-95 text-white' 
                              : 'bg-gray-150 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart size={11} /> Add to Cart
                        </button>
                      </div>
                    </React.Fragment>
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
          </div>
        )) : (
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
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <h2 className="text-xl font-bold text-white mb-2 leading-none flex items-center gap-1">
               মেসার্স হাসিনা ট্রেডার্স
             </h2>
             <p className="text-[#ef4a23] text-xs font-bold leading-normal">M/S Hasina Traders • Premium Building Materials and Sanitary Store</p>
              {/* Dynamic Corporate Social Connect Links */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-4 mb-4">
                {facebookUrl && (
                  <a 
                    href={facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 bg-[#1877f2]/10 border border-[#1877f2]/20 hover:bg-[#1877f2]/20 hover:border-[#1877f2]/30 text-[#1877f2] font-black text-[10px] uppercase px-2.5 py-1.5 rounded-md tracking-wider transition-all"
                  >
                    <svg className="w-3 h-3 fill-current mr-0.5" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 bg-red-650/10 border border-red-600/20 hover:bg-red-650/20 hover:border-red-600/30 text-red-500 font-black text-[10px] uppercase px-2.5 py-1.5 rounded-md tracking-wider transition-all"
                  >
                    <svg className="w-3 h-3 fill-current mr-0.5" viewBox="0 0 24 24">
                      <path d="M23.498 6.163c-.272-1.022-1.04-1.826-2.022-2.1c-1.78-.485-8.913-.485-8.913-.485s-7.133 0-8.912.485c-.982.274-1.75 1.078-2.021 2.1c-.48 1.83-.48 5.65-.48 5.65s0 3.82.48 5.65c.271 1.022 1.04 1.826 2.021 2.1c1.78.485 8.912.485 8.912.485s7.133 0 8.913-.485c.983-.274 1.75-1.078 2.022-2.1c.48-1.83.48-5.65.48-5.65s0-3.82-.48-5.65zm-14.27 10.33V7.5l6.59 4.5z"/>
                    </svg>
                    YouTube
                  </a>
                )}
                {otherUrl && (
                  <a 
                    href={otherUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 bg-emerald-600/10 border border-emerald-600/20 hover:bg-emerald-600/20 hover:border-emerald-605/30 text-emerald-500 font-black text-[10px] uppercase px-2.5 py-1.5 rounded-md tracking-wider transition-all"
                  >
                    <svg className="w-3 h-3 fill-none stroke-current mr-0.5" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Website
                  </a>
                )}
              </div>
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
        </div>
      </footer>

      {/* Floating Shopping Cart Option for Mobile screens */}
      <div className="md:hidden fixed bottom-5 right-5 z-45 print:hidden">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[#ef4a23] hover:bg-[#d83c17] active:scale-95 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center relative transition-transform duration-200"
          title="Open Cart"
        >
          <ShoppingCart size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#081621] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#ef4a23]">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
