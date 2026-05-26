import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, OfflineSale, Order, Review, Qa } from './types';
import { DEFAULT_BRANDS, DEFAULT_CATEGORIES, INITIAL_PRODUCTS } from './data';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

interface AppState {
  isAdminAuth: boolean;
  currentUser: User | null;
  brands: string[];
  categories: string[];
  units: string[];
  products: Product[];
  offlineSales: OfflineSale[];
  onlineOrders: Order[];
  reviews: Review[];
  qas: Qa[];
  isLoaded: boolean;
}

interface AppContextType extends AppState {
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addUnit: (unit: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOfflineSale: (sale: Omit<OfflineSale, 'id' | 'timestamp'>) => void;
  addOnlineOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
  addQuestion: (productId: string, question: string) => Promise<void>;
  answerQuestion: (qaId: string, answer: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    isAdminAuth: false,
    currentUser: null,
    brands: DEFAULT_BRANDS,
    categories: DEFAULT_CATEGORIES,
    units: ['KG', 'Bag', 'Piece', 'Pft', 'Ton'],
    products: [],
    offlineSales: [],
    onlineOrders: [],
    reviews: [],
    qas: [],
    isLoaded: false
  });

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // For this app, only TAMIM and BABUL are admins. We check if the Google Account matches the preconfigured one.
      let isAdmin = false;
      if (user && user.emailVerified && user.email) {
        const normEmail = user.email.toLowerCase().replace(/\s+/g, '');
        const rawEmail = user.email.toLowerCase();
        isAdmin = normEmail === 'sanajidul.muhsinin.tamim@gmail.com' ||
                  normEmail === 'babul28111979@gmail.com' ||
                  rawEmail === 'babul 28111979@gmail.com' ||
                  rawEmail === 'babul28111979@gmail.com';
      }
      setState(s => ({ ...s, currentUser: user, isAdminAuth: isAdmin }));
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Products Listener
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setState(s => ({ ...s, products: products.sort((a, b) => b.createdAt - a.createdAt) }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    // Reviews Listener
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const revs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      setState(s => ({ ...s, reviews: revs.sort((a, b) => b.createdAt - a.createdAt) }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));

    // Q&A Listener
    const unsubQas = onSnapshot(collection(db, 'qas'), (snapshot) => {
      const qs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Qa));
      setState(s => ({ ...s, qas: qs.sort((a, b) => b.createdAt - a.createdAt) }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'qas'));

    // Settings Listener (Brands/Categories)
    const unsubSettings = onSnapshot(doc(db, 'storeSettings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.brands) setState(s => ({ ...s, brands: data.brands }));
        if (data.categories) setState(s => ({ ...s, categories: data.categories }));
        if (data.units) setState(s => ({ ...s, units: data.units }));
      }
      setState(s => ({ ...s, isLoaded: true }));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'storeSettings/config'));

    return () => {
      unsubProducts();
      unsubReviews();
      unsubQas();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    let unsubSales = () => {};
    let unsubOrders = () => {};

    if (state.isAdminAuth) {
      unsubSales = onSnapshot(collection(db, 'offlineSales'), (snapshot) => {
        const sales = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OfflineSale));
        setState(s => ({ ...s, offlineSales: sales.sort((a,b) => b.timestamp - a.timestamp) }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'offlineSales'));

      unsubOrders = onSnapshot(collection(db, 'onlineOrders'), (snapshot) => {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setState(s => ({ ...s, onlineOrders: orders.sort((a,b) => b.createdAt - a.createdAt) }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'onlineOrders'));
    } else if (state.currentUser) {
      // Normal logged-in user can listen to their own orders!
      const q = query(collection(db, 'onlineOrders'), where('userId', '==', state.currentUser.uid));
      unsubOrders = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setState(s => ({ ...s, onlineOrders: orders.sort((a,b) => b.createdAt - a.createdAt) }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'onlineOrders'));
    } else {
      setState(s => ({ ...s, offlineSales: [], onlineOrders: [] }));
    }

    return () => {
      unsubSales();
      unsubOrders();
    };
  }, [state.isAdminAuth, state.currentUser]);

  // Actions
  const updateSettings = async (updates: any) => {
    try {
      await setDoc(doc(db, 'storeSettings', 'config'), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'storeSettings/config');
    }
  };

  const addBrand = async (brand: string) => {
    const newBrands = state.brands.includes(brand) ? state.brands : [...state.brands, brand];
    await updateSettings({ brands: newBrands });
  };
  
  const removeBrand = async (brand: string) => {
    const newBrands = state.brands.filter(b => b !== brand);
    await updateSettings({ brands: newBrands });
  };

  const addUnit = async (unit: string) => {
    const newUnits = state.units.includes(unit) ? state.units : [...state.units, unit];
    await updateSettings({ units: newUnits });
  };

  const addProduct = async (p: Omit<Product, 'id' | 'createdAt'>) => {
    const pId = `prod-${Date.now()}`;
    const newProd = { ...p, createdAt: Date.now() };
    try {
      await setDoc(doc(db, 'products', pId), newProd);
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, `products/${pId}`); }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch(e) { handleFirestoreError(e, OperationType.UPDATE, `products/${id}`); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch(e) { handleFirestoreError(e, OperationType.DELETE, `products/${id}`); }
  };

  const addOfflineSale = async (sale: Omit<OfflineSale, 'id' | 'timestamp'>) => {
    const id = `sale-${Date.now()}`;
    try {
      // Remove any undefined keys to secure against Firestore document compile exceptions
      const cleanSale: any = {};
      Object.keys(sale).forEach(key => {
        const val = (sale as any)[key];
        if (val !== undefined) {
          cleanSale[key] = val;
        }
      });
      await setDoc(doc(db, 'offlineSales', id), { ...cleanSale, timestamp: Date.now() });
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, `offlineSales/${id}`); }
  };

  const addOnlineOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const id = `HT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      await setDoc(doc(db, 'onlineOrders', id), { ...order, createdAt: Date.now() });
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, `onlineOrders/${id}`); }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'onlineOrders', id), { status });
    } catch(e) { handleFirestoreError(e, OperationType.UPDATE, `onlineOrders/${id}`); }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    if (!state.currentUser) return;
    const rId = `review-${Date.now()}`;
    const newReview = {
      productId,
      userId: state.currentUser.uid,
      userName: state.currentUser.displayName || 'Anonymous Partner',
      rating,
      comment,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'reviews', rId), newReview);
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, `reviews/${rId}`); }
  };

  const addQuestion = async (productId: string, question: string) => {
    const qId = `qa-${Date.now()}`;
    const newQa = {
      productId,
      question,
      askedBy: state.currentUser?.displayName || 'Visitor',
      askedById: state.currentUser?.uid || 'guest',
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'qas', qId), newQa);
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, `qas/${qId}`); }
  };

  const answerQuestion = async (qaId: string, answer: string) => {
    if (!state.isAdminAuth) return;
    try {
      await updateDoc(doc(db, 'qas', qaId), {
        answer,
        answeredBy: 'Tamim',
        answeredAt: Date.now()
      });
    } catch(e) { handleFirestoreError(e, OperationType.UPDATE, `qas/${qaId}`); }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addBrand,
      removeBrand,
      addUnit,
      addProduct,
      updateProduct,
      deleteProduct,
      addOfflineSale,
      addOnlineOrder,
      updateOrderStatus,
      addReview,
      addQuestion,
      answerQuestion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
