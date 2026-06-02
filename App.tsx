import React, { useState, useEffect } from 'react';
import { Storefront } from './Storefront';
import { AdminPanel, AdminLogin } from './Admin';
import { useStore } from './StoreProvider';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const { isAdminAuth } = useStore();
  const [viewRoute, setViewRoute] = useState<'store' | 'admin'>('store');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const handleDbError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.message) {
        setDbError(customEvent.detail.message);
      }
    };
    window.addEventListener('database-quota-error', handleDbError);
    return () => {
      window.removeEventListener('database-quota-error', handleDbError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {dbError && (
        <div className="bg-[#ef4a23] text-white font-bold text-xs py-3.5 px-4 flex justify-between items-center gap-3 border-b border-red-700 shadow-lg tracking-wide z-[9999]">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
            <AlertTriangle size={18} className="shrink-0 text-white animate-bounce" />
            <span>{dbError}</span>
          </div>
          <button onClick={() => setDbError(null)} className="hover:bg-red-700 p-1 rounded-full text-white transition-all" title="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
      {viewRoute === 'store' && <Storefront onOpenAdmin={() => setViewRoute('admin')} />}
      {viewRoute === 'admin' && (isAdminAuth ? <AdminPanel onOpenStore={() => setViewRoute('store')} /> : <AdminLogin onOpenStore={() => setViewRoute('store')} />)}
    </div>
  );
}
