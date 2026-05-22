import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, OfflineSale, Order } from './types';
import { DEFAULT_BRANDS, DEFAULT_CATEGORIES, INITIAL_PRODUCTS } from './data';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface AppState {
  isAdminAuth: boolean;
  currentUser: User | null;
  brands: string[];
  categories: string[];
  products: Product[];
  offlineSales: OfflineSale[];
  onlineOrders: Order[];
  isLoaded: boolean;
}

interface AppContextType extends AppState {
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOfflineSale: (sale: Omit<OfflineSale, 'id' | 'timestamp'>) => void;
  addOnlineOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    isAdminAuth: false,
    currentUser: null,
    brands: DEFAULT_BRANDS,
    categories: DEFAULT_CATEGORIES,
    products: [],
    offlineSales: [],
    onlineOrders: [],
    isLoaded: false
  });

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // For this app, only TAMIM is admin. We check if the Google Account matches the preconfigured one.
      const isAdmin = !!(user && user.emailVerified && user.email === 'sanajidul.muhsinin.tamim@gmail.com');
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

    // Settings Listener (Brands/Categories)
    const unsubSettings = onSnapshot(doc(db, 'storeSettings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.brands) setState(s => ({ ...s, brands: data.brands }));
        if (data.categories) setState(s => ({ ...s, categories: data.categories }));
      } else {
        // Bootstrap INITIAL_PRODUCTS if empty (Only done once on client)
        if (state.isAdminAuth && state.products.length === 0) {
           // Not doing automatic bootstrap here to avoid multiple writes, we'll let user add products.
        }
      }
      setState(s => ({ ...s, isLoaded: true }));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'storeSettings/config'));

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    // Admin-only listeners
    if (state.isAdminAuth) {
      const unsubSales = onSnapshot(collection(db, 'offlineSales'), (snapshot) => {
        const sales = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OfflineSale));
        setState(s => ({ ...s, offlineSales: sales.sort((a,b) => b.timestamp - a.timestamp) }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'offlineSales'));

      const unsubOrders = onSnapshot(collection(db, 'onlineOrders'), (snapshot) => {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setState(s => ({ ...s, onlineOrders: orders.sort((a,b) => b.createdAt - a.createdAt) }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'onlineOrders'));

      return () => {
        unsubSales();
        unsubOrders();
      };
    } else {
      setState(s => ({ ...s, offlineSales: [], onlineOrders: [] }));
    }
  }, [state.isAdminAuth]);

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
      await setDoc(doc(db, 'offlineSales', id), { ...sale, timestamp: Date.now() });
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

  return (
    <AppContext.Provider value={{
      ...state,
      addBrand,
      removeBrand,
      addProduct,
      updateProduct,
      deleteProduct,
      addOfflineSale,
      addOnlineOrder,
      updateOrderStatus
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
