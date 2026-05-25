import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './StoreProvider';
import { LogOut, Package, Database, BarChart3, Plus, Tags, Trash2, Calendar, TrendingUp, Edit, Printer, ShoppingBag, Download, MessageSquare } from 'lucide-react';
import { OfflineSale, Product, Order } from './types';
import { loginWithGoogle, logoutUser } from './firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [activeTab, setActiveTab] = useState<'POS' | 'ORDERS' | 'PRODUCTS' | 'BRANDS' | 'STATS' | 'QA_MODERATION'>('POS');
  const [printData, setPrintData] = useState<{ type: 'offline', data: OfflineSale } | { type: 'online', data: Order | Order[] } | null>(null);

  const handleDownloadPDF = async () => {
    if (!printData) return;
    
    // Programmatic high-quality vector jsPDF generator
    const doc = new jsPDF() as any;
    
    // Draw Border Accent Box
    doc.rect(5, 5, 200, 287, 'S');

    // M/S Hasina Traders Business Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(8, 22, 33);
    doc.text("M/S HASINA TRADERS", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Proprietor: Babul Matubbar | Hotline: +880-1988030534", 105, 26, { align: "center" });
    doc.text("Location: Batikamari Bazar, Gopalganj, Bangladesh", 105, 31, { align: "center" });
    
    // Separation lines with color codes
    doc.setDrawColor(239, 74, 35);
    doc.setLineWidth(0.8);
    doc.line(10, 36, 200, 36);

    // Metadata details
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    if (printData.type === 'offline') {
      const sale = printData.data as OfflineSale;
      
      doc.setFont("helvetica", "bold");
      doc.text("OFFLINE POS CASH MEMO", 10, 44);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice ID: OFF-${String(sale.timestamp).slice(-6)}`, 10, 51);
      doc.text(`Date & Time: ${new Date(sale.timestamp).toLocaleString()}`, 10, 57);
      
      doc.text(`Customer Name: ${sale.customerName || 'Walk-in Partner'}`, 120, 51);
      doc.text(`Customer Phone: ${sale.customerPhone || 'N/A'}`, 120, 57);

      const headers = [["Item Description", "Brand", "Unit Price", "Qty", "Total (BDT)"]];
      const data = [
        [sale.itemName, sale.brand, `BDT ${sale.unitPrice.toLocaleString()}`, `${sale.qty} ${sale.unit}`, `BDT ${sale.total.toLocaleString()}`]
      ];

      autoTable(doc, {
        startY: 65,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [8, 22, 33], textColor: [255, 255, 255] },
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        didDrawPage: () => {
          doc.rect(5, 5, 200, 287, 'S');
        }
      });

      const finalY = doc.lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total: BDT ${sale.total.toLocaleString()}`, 120, finalY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Generated via Hashina Traders Local Terminal. Official signature and seal required.", 105, 260, { align: "center" });
      doc.text("Authorized Signature & Seal", 160, 250, { align: "center" });
      doc.line(135, 246, 185, 246);
    } else {
      const ordersList = Array.isArray(printData.data) ? printData.data : [printData.data as Order];
      const mainOrder = ordersList[0];
      
      doc.setFont("helvetica", "bold");
      doc.text("ONLINE PURCHASE INVOICE", 10, 44);
      doc.setFont("helvetica", "normal");
      doc.text(`Order IDs: ${ordersList.map(o => o.id.slice(0, 8).toUpperCase()).join(', ')}`, 10, 51);
      doc.text(`Submitted On: ${new Date(mainOrder.createdAt).toLocaleDateString()}`, 10, 57);
      
      doc.text(`Customer Name: ${mainOrder.customerInfo?.name || 'Customer Partner'}`, 120, 51);
      doc.text(`Customer Phone: ${mainOrder.customerInfo?.phone || 'N/A'}`, 120, 57);
      doc.text(`Delivery Address: ${mainOrder.customerInfo?.address || 'N/A'}, ${mainOrder.customerInfo?.thana || ''}`, 10, 63);

      const headers = [["Item Name", "Brand", "Unit Price", "Qty", "Total (BDT)"]];
      const data: any[] = [];
      let subtotalSum = 0;
      
      ordersList.forEach(o => {
        o.items.forEach(item => {
          const itemPrice = item.product?.salePrice || (item as any).salePrice || 0;
          const qty = item.quantity || (item as any).cartQty || 1;
          const totalLine = itemPrice * qty;
          subtotalSum += totalLine;
          data.push([
            item.product?.name || (item as any).name || 'Unknown Item',
            item.product?.brand || (item as any).brand || 'Generic',
            `BDT ${itemPrice.toLocaleString()}`,
            `${qty} units`,
            `BDT ${totalLine.toLocaleString()}`
          ]);
        });
      });

      autoTable(doc, {
        startY: 69,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [8, 22, 33], textColor: [255, 255, 255] },
        styles: { fontSize: 9, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        didDrawPage: () => {
          doc.rect(5, 5, 200, 287, 'S');
        }
      });

      const finalY = doc.lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Subtotal : BDT ${subtotalSum.toLocaleString()}`, 120, finalY);
      
      const totalDeliv = ordersList.reduce((acc, o) => acc + (o.deliveryCharge || 0), 0);
      const totalGrand = ordersList.reduce((acc, o) => acc + (o.total || 0), 0);
      const paymentGateway = mainOrder.customerInfo?.paymentMethod || 'Cash on Delivery';

      doc.text(`Delivery Charge: BDT ${totalDeliv.toLocaleString()}`, 120, finalY + 6);
      doc.text(`Payment Gateway: ${paymentGateway}`, 10, finalY);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Grand Total: BDT ${totalGrand.toLocaleString()}`, 120, finalY + 14);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for ordering online from M/S Hasina Traders! Under active shipment tracking.", 105, 260, { align: "center" });
      doc.text("Authorized Signature & Seal", 160, 250, { align: "center" });
      doc.line(135, 246, 185, 246);
    }

    let docName = '';
    if (printData.type === 'offline') {
      const sale = printData.data as OfflineSale;
      const cName = sale.customerName || 'Walk-in Partner';
      const cPhone = sale.customerPhone || 'N/A';
      const q = sale.qty || 1;
      docName = `${cName}, ${cPhone} -${q}.pdf`;
    } else {
      const ordersList = Array.isArray(printData.data) ? printData.data : [printData.data as Order];
      const mainOrder = ordersList[0];
      const cName = mainOrder.customerInfo?.name || 'Customer Partner';
      const cPhone = mainOrder.customerInfo?.phone || 'N/A';
      const q = ordersList.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.quantity || 1), 0), 0);
      docName = `${cName}, ${cPhone} -${q}.pdf`;
    }
    doc.save(docName);
  };

  const navItems = [
    { id: 'POS', label: 'Offline POS', icon: Database },
    { id: 'ORDERS', label: 'Online Orders', icon: ShoppingBag },
    { id: 'PRODUCTS', label: 'DB Management', icon: Package },
    { id: 'BRANDS', label: 'Brand Registry', icon: Tags },
    { id: 'QA_MODERATION', label: 'Q&A Moderation', icon: MessageSquare },
    { id: 'STATS', label: 'Analytics', icon: BarChart3 }
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 print:hidden">
        {printData && (
           <div className="bg-indigo-50 text-indigo-900 p-4 rounded-lg mb-6 flex justify-between items-center shadow-md border border-indigo-200 animate-in fade-in slide-in-from-top-4">
              <div>
                <p className="font-bold flex items-center gap-2"><Printer size={18}/> PDF / Print Preview Active</p>
                <p className="text-sm">Invoice is previewed below. You can save as PDF or print.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => window.print()} className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">
                    <Printer size={16} className="inline mr-1" /> Print 
                 </button>
                 <button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">
                    <Download size={16} className="inline mr-1" /> Download PDF
                 </button>
                 <button onClick={() => setPrintData(null)} className="ml-4 text-indigo-600 hover:text-indigo-900 border-b border-transparent hover:border-indigo-600 text-sm font-bold transition-colors">
                    Close Preview
                 </button>
              </div>
           </div>
        )}
        {activeTab === 'POS' && <OffilePOS onPrint={(sale) => setPrintData({ type: 'offline', data: sale })} />}
        {activeTab === 'ORDERS' && <OnlineOrders onPrint={(order) => setPrintData({ type: 'online', data: order })} />}
        {activeTab === 'PRODUCTS' && <ProductManager />}
        {activeTab === 'BRANDS' && <BrandManager />}
        {activeTab === 'QA_MODERATION' && <QaModeration />}
        {activeTab === 'STATS' && <Statistics />}
      </main>

      {/* PRINTABLE INVOICE TEMPLATE (Hidden from screen, displayed on print) */}
      {printData && (
        <div id="printable-invoice" className="w-full max-w-3xl mx-auto p-4 bg-white text-black font-sans leading-relaxed border my-8 shadow-xl">
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
            <h1 className="text-2xl font-bold bg-gray-100 py-1 mb-3 rounded-md border border-gray-300 w-1/3 mx-auto uppercase tracking-widest">CASH MEMO</h1>
            <h2 className="text-4xl font-black mb-1">মেসার্স হাসিনা ট্রেডার্স</h2>
            <p className="text-xl font-bold tracking-wide">M/S Hasina Traders</p>
            <p className="text-md mt-2 font-medium">Proprietor: Babul Matubbar</p>
            <p className="text-sm text-gray-700">Location: Batikamari Bazar</p>
            <p className="text-sm font-semibold mt-1">Hotline: +880-1988030534, +880-1996418168</p>
            <p className="text-sm font-semibold">Email: tradersmshasina@gmail.com</p>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p><strong>Invoice No:</strong> {
                printData.type === 'offline' 
                  ? `OFF-${String((printData.data as OfflineSale).timestamp).slice(-6)}` 
                  : (Array.isArray(printData.data) 
                      ? `ONL-GRP-${(printData.data[0] as Order).id.slice(0, 6).toUpperCase()}` 
                      : `ONL-${(printData.data as Order).id.slice(0, 6).toUpperCase()}`)
              }</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(printData.type === 'offline' ? (printData.data as OfflineSale).timestamp : (Array.isArray(printData.data) ? printData.data[0].createdAt : (printData.data as Order).createdAt)).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(printData.type === 'offline' ? (printData.data as OfflineSale).timestamp : (Array.isArray(printData.data) ? printData.data[0].createdAt : (printData.data as Order).createdAt)).toLocaleTimeString()}</p>
            </div>
          </div>
          
          {((printData.type === 'online') || (printData.type === 'offline' && ((printData.data as OfflineSale).customerPhone || (printData.data as OfflineSale).customerName))) && (
            <div className="mb-4 bg-gray-50 border border-gray-200 p-3">
              <p className="font-bold text-sm uppercase mb-1 border-b pb-1">Customer Information</p>
              <p className="text-sm"><strong>Name:</strong> {
                printData.type === 'online' 
                  ? ((Array.isArray(printData.data) ? printData.data[0] : (printData.data as Order)).customerInfo?.name || 'Unknown')
                  : ((printData.data as OfflineSale).customerName || 'Walk-in Partner')
              }</p>
              <p className="text-sm"><strong>Phone:</strong> {
                printData.type === 'online'
                  ? ((Array.isArray(printData.data) ? printData.data[0] : (printData.data as Order)).customerInfo?.phone || 'N/A')
                  : ((printData.data as OfflineSale).customerPhone || 'N/A')
              }</p>
              {printData.type === 'online' && (
                <p className="text-sm"><strong>Address:</strong> {(Array.isArray(printData.data) ? printData.data[0] : (printData.data as Order)).customerInfo?.address || 'No Address Provided'}</p>
              )}
              {printData.type === 'offline' && (printData.data as OfflineSale).customerLocation && (
                <p className="text-sm"><strong>Location:</strong> {(printData.data as OfflineSale).customerLocation}</p>
              )}
              {printData.type === 'offline' && (printData.data as OfflineSale).deliveryHand && (
                <p className="text-sm"><strong>Delivery Hand:</strong> {(printData.data as OfflineSale).deliveryHand}</p>
              )}
              <p className="text-sm"><strong>Payment:</strong> {
                printData.type === 'online'
                  ? ((Array.isArray(printData.data) ? printData.data[0] : (printData.data as Order)).customerInfo?.paymentMethod || 'Cash on Delivery').toUpperCase()
                  : 'CASH ON DELIVERY'
              }</p>
            </div>
          )}

          <table className="w-full text-left border-collapse border border-gray-800 mb-6">
            <thead>
              <tr className="bg-gray-100 uppercase text-xs font-bold tracking-wider">
                <th className="border border-gray-800 px-3 py-2 text-center w-12">No.</th>
                <th className="border border-gray-800 px-3 py-2 text-center">Description</th>
                <th className="border border-gray-800 px-3 py-2 text-center w-24">Qty</th>
                <th className="border border-gray-800 px-3 py-2 text-center w-28">Rate (৳)</th>
                <th className="border border-gray-800 px-3 py-2 text-right w-32">Total (৳)</th>
              </tr>
            </thead>
            <tbody>
              {printData.type === 'offline' && (
                <tr>
                  <td className="border border-gray-800 px-3 py-2 text-center">1</td>
                  <td className="border border-gray-800 px-3 py-2">
                    <span className="font-bold opacity-75">{(printData.data as OfflineSale).brand}</span> - {(printData.data as OfflineSale).itemName}
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-center">{(printData.data as OfflineSale).qty} {(printData.data as OfflineSale).unit}</td>
                  <td className="border border-gray-800 px-3 py-2 text-center">{(printData.data as OfflineSale).unitPrice.toLocaleString()}</td>
                  <td className="border border-gray-800 px-3 py-2 text-right font-bold">{(printData.data as OfflineSale).total.toLocaleString()}</td>
                </tr>
              )}
              {printData.type === 'online' && (Array.isArray(printData.data) ? printData.data.flatMap(o => o.items) : (printData.data as Order).items).map((item, idx) => {
                const name = item.product?.name || (item as any).name || 'Unknown Item';
                const qty = item.quantity || (item as any).cartQty || 1;
                const price = item.product?.salePrice || (item as any).salePrice || 0;
                return (
                  <tr key={item.product?.id || (item as any).id || idx}>
                    <td className="border border-gray-800 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-800 px-3 py-2">{name}</td>
                    <td className="border border-gray-800 px-3 py-2 text-center">{qty} pcs</td>
                    <td className="border border-gray-800 px-3 py-2 text-center">{price.toLocaleString()}</td>
                    <td className="border border-gray-800 px-3 py-2 text-right font-bold">{(price * qty).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 border border-gray-800 p-3 bg-gray-50 text-sm">
              <div className="flex justify-between mb-1 pb-1 border-b border-gray-300">
                <span>Subtotal:</span>
                <span>৳{(printData.type === 'online' ? (Array.isArray(printData.data) ? printData.data.reduce((acc, o) => acc + (o.subtotal || (o as any).total), 0) : ((printData.data as Order).subtotal || (printData.data as any).total)) : (printData.data as OfflineSale).total).toLocaleString()}</span>
              </div>
              {printData.type === 'online' && (
                <div className="flex justify-between mb-1 pb-1 border-b border-gray-300">
                  <span>Delivery Charge:</span>
                  <span>৳{(Array.isArray(printData.data) ? printData.data.reduce((acc, o) => acc + (o.deliveryCharge || 0), 0) : ((printData.data as Order).deliveryCharge || 0)).toLocaleString()}</span>
                </div>
              )}
              {printData.type === 'offline' && (
                <div className="flex justify-between mb-1 pb-1 border-b border-gray-300">
                  <span>Discount:</span>
                  <span>৳0</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>Grand Total:</span>
                <span>৳{(printData.type === 'online' ? (Array.isArray(printData.data) ? printData.data.reduce((acc, o) => acc + (o.total || 0), 0) : (printData.data as Order).total) : (printData.data as OfflineSale).total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between text-sm">
            <div className="border-t border-gray-800 pt-1 w-40 text-center"><p>Customer Signature</p></div>
            <div className="border-t border-gray-800 pt-1 w-40 text-center"><p>Authorized Signature</p></div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest border-t border-gray-300 pt-2">
            ** Thank you for choosing M/S Hasina Traders **
          </div>
        </div>
      )}
    </div>
  );
};

const OffilePOS = ({ onPrint }: { onPrint: (sale: OfflineSale) => void }) => {
  const { brands, addOfflineSale, offlineSales } = useStore();
  const [brand, setBrand] = useState(brands[0] || '');
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState<OfflineSale['unit']>('KG');
  const [qty, setQty] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  
  // Custom Customer parameters
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [deliveryHand, setDeliveryHand] = useState('');

  // Lifetime search & filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  const total = (Number(qty) || 0) * (Number(unitPrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !itemName || !qty || !unitPrice) return;
    addOfflineSale({ 
      brand, 
      itemName, 
      unit, 
      qty: Number(qty), 
      unitPrice: Number(unitPrice), 
      total,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerLocation: customerLocation.trim() || undefined,
      deliveryHand: deliveryHand.trim() || undefined
    });
    setItemName('');
    setQty('');
    setUnitPrice('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerLocation('');
    setDeliveryHand('');
  };

  const handlePrintMemoPreSubmit = () => {
    if (!brand || !itemName || !qty || !unitPrice) {
      alert("Please fill out the brand, item description, quantity, and unit price fields before printing the memo or downloading the PDF!");
      return;
    }
    const tempSale: OfflineSale = {
      id: `sale-PREVIEW`,
      brand,
      itemName,
      unit,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      total,
      timestamp: Date.now(),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerLocation: customerLocation.trim() || undefined,
      deliveryHand: deliveryHand.trim() || undefined
    };
    onPrint(tempSale);
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
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap text-gray-500">{formatTime(s.timestamp)}</td>
                <td className="px-6 py-3 text-gray-800"><span className="font-semibold text-[#081621]">{s.brand}</span> - {s.itemName}</td>
                <td className="px-6 py-3 font-mono">{s.qty} {s.unit}</td>
                <td className="px-6 py-3 font-mono font-semibold text-[#ef4a23]">৳{s.total.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => onPrint(s)} className="text-gray-500 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-xs font-semibold flex items-center gap-1 ml-auto">
                    <Printer size={12}/> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const filteredLifetimeSales = offlineSales.filter(sale => {
    const matchSearch = searchTerm.trim() === '' || [
      sale.customerName?.toLowerCase() || '',
      sale.customerPhone || '',
      sale.itemName.toLowerCase(),
      sale.brand.toLowerCase()
    ].some(field => field.includes(searchTerm.toLowerCase()));

    let matchStart = true;
    if (startDateStr) {
      const startOfDay = new Date(startDateStr);
      startOfDay.setHours(0, 0, 0, 0);
      matchStart = sale.timestamp >= startOfDay.getTime();
    }

    let matchEnd = true;
    if (endDateStr) {
      const endOfDay = new Date(endDateStr);
      endOfDay.setHours(23, 59, 59, 999);
      matchEnd = sale.timestamp <= endOfDay.getTime();
    }

    return matchSearch && matchStart && matchEnd;
  });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* High-Speed Terminal Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 bg-[#ef4a23] rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">High-Speed Terminal</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Brand</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full border-gray-300 rounded-md bg-gray-50 p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none border font-semibold border-gray-200">
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
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Price/Unit (BDT)</label>
                <input type="number" min="0" step="any" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm font-mono focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
             </div>
          </div>

          <div className="md:col-span-3">
             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Customer Name (Optional)</label>
             <input placeholder="Enter customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
          </div>
          <div className="md:col-span-3">
             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Customer Phone (Optional)</label>
             <input placeholder="e.g. 017XXXXXXXX" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm font-mono focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
          </div>
          <div className="md:col-span-3">
             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Customer Location (Optional)</label>
             <input placeholder="e.g. Batikamari, Gopalganj" value={customerLocation} onChange={e => setCustomerLocation(e.target.value)} className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
          </div>
          <div className="md:col-span-3">
             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Delivery Hand / Driver Name (Optional)</label>
             <input placeholder="e.g. Kamal Hossain" value={deliveryHand} onChange={e => setDeliveryHand(e.target.value)} className="w-full border-gray-300 border bg-gray-50 rounded-md p-2.5 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" />
          </div>
          
          <div className="md:col-span-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 mt-2 gap-4">
            <div className="space-y-1 w-full sm:w-auto text-center sm:text-left">
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Live Calculation</p>
               <p className="text-3xl font-bold font-mono text-[#081621] tracking-tight">৳{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={handlePrintMemoPreSubmit}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-md font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm text-center"
              >
                <Printer size={16}/> Print POS Cash Memo
              </button>
              <button 
                type="submit" 
                className="bg-[#ef4a23] hover:bg-[#d83c17] text-white px-8 py-3 rounded-md font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm text-center"
              >
                <Plus size={18} /> Add Recorded Entry to Save
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Daily Sales Boxes split-layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <SalesTable sales={todaySales} title="Today's Sales Box" accent="border-[#ef4a23]" />
         <SalesTable sales={yesterdaySales} title={`Yesterday's Sales Box (${formatDate(todayStart - 86400000)})`} accent="border-gray-400" />
      </div>

      {/* Lifetime Offline Sales History & Advanced Search/Filter System */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/80">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Database size={18} className="text-[#ef4a23]" /> Lifetime Offline Sales Ledger History
            </h3>
            <p className="text-xs text-gray-500 mt-1">Audit and search all historical physical transactions stored permanently in your workstation ledger.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              Matched: {filteredLifetimeSales.length} of {offlineSales.length} Entries
            </span>
            <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              Sum: ৳{filteredLifetimeSales.reduce((sum, s) => sum + s.total, 0).toLocaleString()} BDT
            </span>
          </div>
        </div>

        {/* Filter Controls Pane */}
        <div className="p-6 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Search Buyer Details or Items</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search by Customer Name, Phone, Brand, or Item..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 pl-3 pr-8 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Start Date</label>
            <input 
              type="date"
              value={startDateStr}
              onChange={e => setStartDateStr(e.target.value)}
              className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">End Date</label>
            <div className="flex gap-2 items-center">
              <input 
                type="date"
                value={endDateStr}
                onChange={e => setEndDateStr(e.target.value)}
                className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none flex-grow"
              />
              <button 
                onClick={() => { setSearchTerm(''); setStartDateStr(''); setEndDateStr(''); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-3.5 py-2.5 rounded transition-colors whitespace-nowrap"
                title="Reset Filters to defaults"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table list block */}
        {filteredLifetimeSales.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white">
            <p className="font-extrabold text-sm text-gray-800">No matching history entries found!</p>
            <p className="text-xs mt-1 text-gray-400">Try loosening your search terms or specifying a broader date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-600 bg-gray-50 uppercase border-b border-gray-100 font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Slip Date &amp; Time</th>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Item details (Brand &amp; Desc)</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Logistics Metatags</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-right">Invoice Sum</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[...filteredLifetimeSales].reverse().map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors border-b last:border-0 font-medium text-gray-800 text-xs font-medium">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 select-all">
                      <div>{formatDate(s.timestamp)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formatTime(s.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono bg-slate-100 text-slate-800 font-black px-2 py-1 rounded border border-slate-200">
                        OFF-{String(s.timestamp).slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-[#081621]">{s.brand}</div>
                      <div className="text-gray-500 mt-0.5">{s.itemName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.customerName || s.customerPhone ? (
                        <div>
                          <div className="font-black text-gray-800">{s.customerName || 'Walk-in Partner'}</div>
                          <div className="text-gray-500 mt-0.5 font-mono text-[11px]">{s.customerPhone || 'N/A Phone'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-semibold italic text-[11px]">Direct Retail Customer</span>
                      )}
                    </td>
                    <td className="px-6 py-4 select-text">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-sky-50 text-sky-800 font-extrabold px-1.5 py-0.5 rounded border border-sky-200 tracking-wide">LOCATION:</span>
                          <span className="text-[10px] text-gray-600 font-medium truncate max-w-[150px]">{s.customerLocation || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 tracking-wide">DRIVER / HAND:</span>
                          <span className="text-[10px] text-gray-600 font-medium truncate max-w-[150px]">{s.deliveryHand || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold whitespace-nowrap">
                      {s.qty} <span className="text-gray-400 font-medium text-[10px]">{s.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-[#ef4a23] whitespace-nowrap text-sm">
                      ৳{s.total.toLocaleString()} BDT
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => onPrint(s)} 
                        className="text-[#081621] hover:text-[#ef4a23] hover:border-[#ef4a23] bg-white border border-gray-200 hover:bg-orange-50 px-2.5 py-1.5 rounded shadow-xs font-bold text-xs flex items-center gap-1 ml-auto transition-all"
                      >
                        <Printer size={13} /> Print Memo / PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const OnlineOrders = ({ onPrint }: { onPrint: (order: Order | Order[]) => void }) => {
  const { onlineOrders, updateOrderStatus } = useStore();
  const [activeFilter, setActiveFilter] = useState<'All' | Order['status']>('All');
  const [showNotification, setShowNotification] = useState('');

  const handleStatusChange = async (orderId: string, currentStatus: Order['status'], newStatus: Order['status'], phone: string) => {
    if (currentStatus === newStatus) return;
    const confirmChange = window.confirm(`Change order status to ${newStatus}?`);
    if (!confirmChange) return;

    await updateOrderStatus(orderId, newStatus);
    
    if (newStatus === 'Delivered') {
      const order = onlineOrders.find(o => o.id === orderId);
      const cName = order?.customerInfo?.name || 'Customer';
      const totalAmount = order?.total || 0;
      const message = `Dear ${cName}, your order #${orderId} of BDT ${totalAmount.toLocaleString()} has been successfully delivered by M/S Hasina Traders! Thank you for purchasing of construction materials from us. For queries, contact +880-1988030534.`;
      
      const gatewayUrl = (import.meta as any).env.VITE_SMS_GATEWAY_API_URL || 'https://api.bulksmsbd.com/api/smsapi';
      const apiToken = (import.meta as any).env.VITE_SMS_GATEWAY_API_TOKEN || '';
      
      if (apiToken) {
        try {
          console.log(`[SMS Gateway] Sending real delivery notification to: ${phone}...`);
          await fetch(gatewayUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: apiToken,
              to: phone,
              message: message
            })
          });
          setShowNotification(`Delivered notification sent to ${phone} successfully!`);
        } catch (err) {
          console.error('[SMS Gateway Error]', err);
          setShowNotification(`Delivered! But SMS dispatch failed: ${String(err)}`);
        }
      } else {
        console.log(`[SMS Simulation Mode] to ${phone}: "${message}"`);
        setShowNotification(`SMS dispatched to ${phone}: "${message}"`);
      }
    } else {
      setShowNotification(`Status updated to ${newStatus}. SMS Sent to ${phone}: "Your Hasina Traders Order is now ${newStatus}"`);
    }
    setTimeout(() => setShowNotification(''), 5000);
  };

  const filteredOrders = activeFilter === 'All' ? onlineOrders : onlineOrders.filter(o => o.status === activeFilter);

  const ordersByPhone = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const phone = order.customerInfo?.phone || (order as any).phone || 'UnknownPhone';
      if (!acc[phone]) acc[phone] = [];
      acc[phone].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
  }, [filteredOrders]);

  const statuses: Order['status'][] = ['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {showNotification && (
        <div className="fixed top-20 right-10 bg-[#081621] text-white px-6 py-4 rounded shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-right border-l-4 border-green-500">
          <span className="text-xl">📩</span>
          <span className="font-medium text-sm leading-snug">{showNotification}</span>
        </div>
      )}

      {/* Analytics & Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         {['All', 'Pending', 'Processing', 'Delivered'].map(status => (
           <button 
              key={status} 
              onClick={() => setActiveFilter(status as any)}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-24 transition-colors ${activeFilter === status ? 'bg-[#ef4a23] text-white border-transparent shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'}`}
           >
              <h3 className={`text-xs font-bold uppercase tracking-wider ${activeFilter === status ? 'text-white/80' : 'text-gray-400'}`}>{status} Orders</h3>
              <p className="text-2xl font-black">{status === 'All' ? onlineOrders.length : onlineOrders.filter(o => o.status === status).length}</p>
           </button>
         ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} className="text-[#ef4a23]"/> Customer Online Orders ({filteredOrders.length})</h2>
        </div>
        {filteredOrders.length === 0 ? <p className="p-8 text-center text-gray-500">No orders found for this criteria.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#081621] text-white/90 text-xs uppercase whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3">Order Date</th>
                  <th className="px-6 py-3">Customer Info</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Status Pipeline</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(ordersByPhone).map(([phone, groupOrders]: [string, any]) => (
                  <React.Fragment key={phone}>
                    {groupOrders.length > 0 && (
                      <tr className="bg-indigo-50/50 border-t border-indigo-100">
                        <td colSpan={5} className="px-6 py-2 text-xs font-bold text-indigo-800 tracking-widest uppercase">
                           👥 Customer Group: {groupOrders[0].customerInfo?.name || (groupOrders[0] as any).customerName || 'Unknown'} (Phone: {phone}) &mdash; {groupOrders.length} Orders
                        </td>
                        <td className="px-6 py-2 text-right">
                           <button onClick={() => onPrint(groupOrders)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1 ml-auto transition-colors">
                              <Printer size={12}/> Print All ({groupOrders.length})
                           </button>
                        </td>
                      </tr>
                    )}
                    {groupOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                           <span className="font-bold text-gray-800">{new Date(order.createdAt || (order as any).timestamp).toLocaleDateString()}</span>
                           <br/>
                           <span className="text-xs">{new Date(order.createdAt || (order as any).timestamp).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900">{order.customerInfo?.name || (order as any).customerName || 'Unknown'}</div>
                           <div className="text-xs text-gray-600 mt-1">{order.customerInfo?.phone || (order as any).phone || 'N/A'}</div>
                           <div className="text-[10px] text-gray-400 mt-1 uppercase max-w-[150px] truncate" title={order.customerInfo?.address || ''}>{order.customerInfo?.address || 'No Address Provided'}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#081621] uppercase text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">{order.customerInfo?.paymentMethod || (order as any).gateway || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-[#ef4a23]">৳{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <select 
                             value={order.status}
                             onChange={(e) => handleStatusChange(order.id, order.status, e.target.value as Order['status'], order.customerInfo?.phone || (order as any).phone || 'N/A')}
                             className={`text-xs font-bold px-2 py-1.5 rounded border focus:ring-1 outline-none appearance-none cursor-pointer ${
                                order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                             }`}
                           >
                             {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onPrint(order)} className="text-[#081621] hover:text-[#ef4a23] bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm text-xs font-bold flex items-center gap-1 ml-auto transition-colors group">
                            <Printer size={14} className="group-hover:-translate-y-0.5 transition-transform"/> View PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                 Object.entries(offlineBreakdown).map(([name, data]: [string, any]) => (
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

const QaModeration = () => {
  const { qas, answerQuestion, products } = useStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerSubmit = async (qaId: string) => {
    const ans = answers[qaId];
    if (!ans || !ans.trim()) return;
    await answerQuestion(qaId, ans);
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[qaId];
      return copy;
    });
    alert('Answer posted successfully!');
  };

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Unknown Product';
  };

  const unanswered = qas.filter(q => !q.answer);
  const answered = qas.filter(q => !!q.answer);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🗣️ Q&A Moderation Dashboard
        </h2>
        <p className="text-xs text-gray-500 mb-6">Answer questions asked by customers. Replies will be displayed in real-time on the public storefront.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unanswered box */}
          <div className="bg-white border rounded-lg p-4 shadow-2xs">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 mb-4 border-b pb-2">
              Pending Questions ({unanswered.length})
            </h3>
            {unanswered.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center select-none">No new questions pending!</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {unanswered.map(q => (
                  <div key={q.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                      <span className="truncate max-w-[200px]">Product: {getProductName(q.productId)}</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 pr-1 mb-2">Questioner ({q.askedBy}): "{q.question}"</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type your answer..." 
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="bg-white border text-xs rounded px-2.5 py-1.5 outline-none flex-grow focus:border-[#ef4a23]"
                      />
                      <button 
                        onClick={() => handleAnswerSubmit(q.id)}
                        className="bg-gray-800 hover:bg-[#ef4a23] text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded transition-all transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answered box */}
          <div className="bg-white border rounded-lg p-4 shadow-2xs">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 mb-4 border-b pb-2">
              Answered Questions ({answered.length})
            </h3>
            {answered.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center select-none">No questions have been answered yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {answered.map(q => (
                  <div key={q.id} className="border border-slate-100 rounded-lg p-3 bg-emerald-50/10">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                      <span className="truncate max-w-[200px]">Product: {getProductName(q.productId)}</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Q: "{q.question}"</p>
                    <div className="mt-2 bg-emerald-50/30 p-2 rounded text-xs select-text">
                      <strong className="text-[#ef4a23] text-[9px] uppercase tracking-wide">Answer:</strong>
                      <p className="text-xs font-medium text-gray-850 mt-0.5">{q.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
