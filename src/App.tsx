import React, { useState } from 'react';
import { Storefront } from './Storefront';
import { AdminPanel, AdminLogin } from './Admin';
import { useStore } from './StoreProvider';
import { Edit, LogIn } from 'lucide-react';

export default function App() {
  const { isAdminAuth } = useStore();
  const [viewRoute, setViewRoute] = useState<'store' | 'admin'>('store');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {viewRoute === 'store' && <Storefront onOpenAdmin={() => setViewRoute('admin')} />}
      {viewRoute === 'admin' && (isAdminAuth ? <AdminPanel onOpenStore={() => setViewRoute('store')} /> : <AdminLogin onOpenStore={() => setViewRoute('store')} />)}
    </div>
  );
}
