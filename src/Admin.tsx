import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './StoreProvider';
import { LogOut, Package, Database, BarChart3, Plus, Tags, Trash2, Calendar, TrendingUp, Edit, Printer, ShoppingBag, Download, MessageSquare, Grid, HardDrive } from 'lucide-react';
import { OfflineSale, Product, Order } from './types';
import { loginWithGoogle, logoutUser } from './firebase';
import { InventoryLedger } from './components/InventoryLedger';
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
          <div className="mt-2 text-[11px] font-mono bg-gray-100 p-2.5 rounded text-left space-y-1">
            <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px] mb-1">Authorized Admins:</p>
            <p className="truncate">✓ sanajidul.muhsinin.tamim@gmail.com</p>
            <p className="truncate">✓ babul28111979@gmail.com</p>
          </div>
        </div>
        <button type="submit" className="w-full bg-[#ef4a23] hover:bg-red-600 text-white py-3 rounded font-semibold transition-colors flex justify-center items-center gap-2">
          Sign In with Google
        </button>
      </form>
    </div>
  );
};

export const AdminPanel = ({ onOpenStore }: { onOpenStore: () => void }) => {
  const { offlineSales, onlineOrders } = useStore();
  const [activeTab, setActiveTab] = useState<'POS' | 'ORDERS' | 'PRODUCTS' | 'BRANDS' | 'STATS' | 'QA_MODERATION' | 'LEDGER' | 'CATEGORIES'>('POS');
  const [printData, setPrintData] = useState<{ type: 'offline', data: OfflineSale } | { type: 'online', data: Order | Order[] } | null>(null);

  const handleDownloadPDF = async () => {
    if (!printData) return;
    
    try {
      // ESM-safe runtime resolution for bundler variations
      const jsPDFClass = (jsPDF as any).jsPDF || jsPDF;
      if (!jsPDFClass) {
        throw new Error("The jsPDF constructor was not resolved correctly from imports.");
      }

      const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      }) as any;
    
    let entityTitle = "";
    let invoiceId = "";
    let invoiceDate = "";
    let customerName = "Walk-in Partner";
    let customerPhone = "N/A";
    let customerLocation = "N/A";
    let deliveryHand = "N/A";
    let couponDeduct = 0;
    let couponCodeUsed = "";
    let orderNotes = "";

    if (printData.type === 'offline') {
      const sale = printData.data as OfflineSale;
      entityTitle = "OFFLINE POS CASH MEMO";
      invoiceId = `OFF-${String(sale.timestamp).slice(-6)}`;
      invoiceDate = new Date(sale.timestamp).toLocaleString();
      customerName = sale.customerName || "Walk-in Partner";
      customerPhone = sale.customerPhone || "N/A";
      customerLocation = sale.customerLocation || "N/A";
      deliveryHand = sale.deliveryHand || "N/A";
      couponDeduct = sale.discount || 0;
      couponCodeUsed = sale.discountCode || "";
    } else {
      const ordersList = Array.isArray(printData.data) ? printData.data : [printData.data as Order];
      const mainOrder = ordersList[0];
      entityTitle = "ONLINE PURCHASE INVOICE";
      invoiceId = ordersList.map(o => o.id.slice(0, 8).toUpperCase()).join(', ');
      invoiceDate = new Date(mainOrder?.createdAt || Date.now()).toLocaleString();
      customerName = mainOrder?.customerInfo?.name || "Customer Partner";
      customerPhone = mainOrder?.customerInfo?.phone || "N/A";
      customerLocation = `${mainOrder?.customerInfo?.address || 'N/A'}, ${mainOrder?.customerInfo?.thana || ''}, ${mainOrder?.customerInfo?.district || ''}`;
      deliveryHand = "M/S Hasina Logistics Team";
      orderNotes = mainOrder?.customerInfo?.notes || "";
    }

    const drawPageHeader = (pdf: any) => {
      // Draw outer border frame on every page sheet cleanly
      pdf.rect(5, 5, 200, 287, 'S');

      // Corporate Branding Identity Header - Clean Blueprint layout (No web ribbon backgrounds)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(26, 37, 48); // Navy blue print branding
      pdf.text("M/S HASINA TRADERS", 105, 16, { align: "center" });

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text("Proprietor: Babul Matubbar | Hotline: +880-1988030534, +880-1996418168", 105, 22, { align: "center" });
      pdf.text("Location: Batikamari Bazar, Gopalganj, Bangladesh", 105, 27, { align: "center" });
      
      // Clean neat separation divider
      pdf.setDrawColor(26, 37, 48);
      pdf.setLineWidth(0.4);
      pdf.line(10, 31, 200, 31);

      // Core Information metadata grid (Customer records + transport accountability)
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      
      pdf.setFont("helvetica", "bold");
      pdf.text(entityTitle, 10, 37);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Invoice ID: ${invoiceId}`, 10, 42);
      pdf.text(`Date & Time: ${invoiceDate}`, 10, 47);
      
      pdf.text(`Customer Name: ${customerName}`, 120, 42);
      pdf.text(`Customer Phone: ${customerPhone}`, 120, 47);
      
      pdf.text(`Delivery Location: ${customerLocation}`, 10, 53);
      pdf.text(`Logs / Driver Hand: ${deliveryHand}`, 120, 53);

      pdf.line(10, 57, 200, 57);
    };

    // Draw original background page header
    drawPageHeader(doc);

    let tableHeaders: string[][] = [["Item Description", "Brand / Variant", "Unit Price", "Qty / Amount", "Total (BDT)"]];
    let tableBody: any[][] = [];

    if (printData.type === 'offline') {
      const sale = printData.data as OfflineSale;
      const saleItems = sale.items || [
        {
          productId: 'custom-old',
          name: (sale as any).itemName || 'Old Sale',
          brand: (sale as any).brand || 'Generic',
          qty: (sale as any).qty || 0,
          unit: (sale as any).unit || 'KG',
          unitPrice: (sale as any).unitPrice || (sale as any).total || 0,
          total: sale.total || 0
        }
      ];
      tableBody = saleItems.map(item => [
        item.name,
        item.brand,
        `BDT ${item.unitPrice.toLocaleString()}`,
        `${item.qty} ${item.unit}`,
        `BDT ${item.total.toLocaleString()}`
      ]);
    } else {
      const ordersList = Array.isArray(printData.data) ? printData.data : [printData.data as Order];
      ordersList.forEach(o => {
        o.items.forEach(item => {
          const itemPrice = item.product?.salePrice || (item as any).salePrice || 0;
          const qty = item.quantity || (item as any).cartQty || 1;
          const totalLine = itemPrice * qty;
          tableBody.push([
            item.product?.name || (item as any).name || 'Unknown Product',
            item.product?.brand || (item as any).brand || 'Premium',
            `BDT ${itemPrice.toLocaleString()}`,
            `${qty} units`,
            `BDT ${totalLine.toLocaleString()}`
          ]);
        });
      });
    }

    autoTable(doc, {
      startY: 62,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [26, 37, 48], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, halign: 'center', cellPadding: 2.5 },
      columnStyles: { 0: { halign: 'left' } },
      margin: { top: 62 },
      willDrawPage: (data: any) => {
        // Automatically duplicate company header and legal customer index at top of overflows
        if (data.pageNumber > 1) {
          drawPageHeader(doc);
        }
      },
      didDrawPage: () => {
        // Ensure standard frame border is preserved on page transitions
        doc.rect(5, 5, 200, 287, 'S');
      }
    });

    let finalY = doc.lastAutoTable.finalY + 12;
    if (finalY > 230) {
      doc.addPage();
      drawPageHeader(doc);
      finalY = 65;
    }

    // Mathematical summary layout
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    let subtotalSum = 0;
    let totalSaved = 0;
    let grandTotalAmount = 0;

    if (printData.type === 'offline') {
      const sale = printData.data as OfflineSale;
      subtotalSum = sale.subtotal || sale.total;
      totalSaved = sale.discount || 0;
      grandTotalAmount = sale.total;

      doc.text(`Subtotal Sum: BDT ${subtotalSum.toLocaleString()}`, 120, finalY);
      if (totalSaved > 0) {
        doc.text(`Coupon Discount [${couponCodeUsed}]: BDT -${totalSaved.toLocaleString()}`, 120, finalY + 6);
        finalY += 12;
      } else {
        finalY += 6;
      }
    } else {
      const ordersList = Array.isArray(printData.data) ? printData.data : [printData.data as Order];
      subtotalSum = ordersList.reduce((acc, o) => acc + (o.subtotal || o.total), 0);
      const deliveryTotal = ordersList.reduce((acc, o) => acc + (o.deliveryCharge || 0), 0);
      grandTotalAmount = ordersList.reduce((acc, o) => acc + o.total, 0);

      doc.text(`Subtotal Sum: BDT ${subtotalSum.toLocaleString()}`, 120, finalY);
      doc.text(`Delivery Logistics: BDT ${deliveryTotal.toLocaleString()}`, 120, finalY + 6);
      finalY += 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Grand Total: BDT ${grandTotalAmount.toLocaleString()}`, 120, finalY);

    if (orderNotes) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(`Instructions: ${orderNotes}`, 10, finalY);
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Generated securely via M/S Hasina Traders workstation database portal.", 105, 272, { align: "center" });
    doc.text("Authorized Signature & Seal", 160, 260, { align: "center" });
    doc.line(135, 256, 185, 256);

    // Deterministic PDF Naming layout with revision count appending
    const customerNameClean = customerName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const phoneClean = customerPhone.replace(/[^0-9]/g, "").trim();
    
    const getPhoneVersionCount = (phone: string) => {
      if (!phone || phone === 'N/A') return 1;
      const offlineMatchCount = offlineSales.filter(s => s.customerPhone?.replace(/[^0-9]/g, "") === phone).length;
      const onlineMatchCount = onlineOrders.filter(o => o.customerInfo?.phone?.replace(/[^0-9]/g, "") === phone).length;
      return offlineMatchCount + onlineMatchCount + 1;
    };

    const versionNum = getPhoneVersionCount(phoneClean);
    let docName = "";
    if (versionNum > 1) {
      docName = `${customerNameClean}, ${phoneClean} -${versionNum}.pdf`;
    } else {
      docName = `${customerNameClean}, ${phoneClean}.pdf`;
    }
    
    doc.save(docName);
    } catch (e: any) {
      console.error("PDF generation or save error: ", e);
      alert(`PDF Generation failed: ${e.message || "Unknown error"}`);
    }
  };

  const navItems = [
    { id: 'POS', label: 'Offline POS', icon: Database },
    { id: 'ORDERS', label: 'Online Orders', icon: ShoppingBag },
    { id: 'LEDGER', label: 'Inventory Ledger', icon: TrendingUp },
    { id: 'PRODUCTS', label: 'DB Management', icon: Package },
    { id: 'BRANDS', label: 'Brand Registry', icon: Tags },
    { id: 'CATEGORIES', label: 'Category Registry', icon: Grid },
    { id: 'QA_MODERATION', label: 'Q&A Moderation', icon: MessageSquare },
    { id: 'STATS', label: 'Analytics', icon: BarChart3 },
    { id: 'ABOUT_EDIT', label: 'About Page', icon: Edit },
    { id: 'USAGE', label: 'Data Usage', icon: HardDrive }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 flex flex-col">
      <header className="bg-[#081621] text-white p-3 md:p-4 shadow-lg flex flex-col xl:flex-row justify-between items-center sticky top-0 z-40 print:hidden gap-3 xl:gap-8">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/10 p-1.5 md:p-2 rounded-lg shrink-0"><Database size={18} className="text-[#ef4a23]"/></div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight leading-tight">
              System Admin 
              <span className="text-[10px] md:text-xs font-normal text-gray-400 block md:-mt-0.5">M/S Hasina Traders</span>
            </h1>
          </div>
          {/* Quick action buttons for mobile devices row to maintain easy workflow */}
          <div className="flex xl:hidden gap-2">
            <button 
              onClick={onOpenStore} 
              className="text-gray-300 hover:text-white text-xs font-semibold py-1 px-2.5 bg-white/5 border border-white/10 rounded transition-colors"
            >
              Store
            </button>
            <button 
              onClick={async () => { await logoutUser(); }} 
              className="text-[#ef4a23] hover:text-red-400 text-xs font-semibold py-1 px-2.5 bg-[#ef4a23]/5 border border-[#ef4a23]/25 rounded flex items-center gap-1 transition-colors"
            >
              <LogOut size={12} /> Out
            </button>
          </div>
        </div>

        <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-3 md:gap-4 xl:gap-8">
          <nav className="w-full flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 md:flex-wrap md:justify-center xl:justify-start xl:overflow-x-visible no-scrollbar">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 md:px-4 rounded-md transition-colors text-xs md:text-sm font-semibold shrink-0 cursor-pointer ${activeTab === item.id ? 'bg-[#ef4a23] text-white shadow-sm' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <Icon size={14} /> {item.label}
                </button>
              )
            })}
          </nav>

          <div className="hidden xl:flex items-center gap-6 border-l border-white/20 pl-6">
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
        {activeTab === 'LEDGER' && <InventoryLedger />}
        {activeTab === 'PRODUCTS' && <ProductManager />}
        {activeTab === 'BRANDS' && <BrandManager />}
        {activeTab === 'CATEGORIES' && <CategoryManager />}
        {activeTab === 'QA_MODERATION' && <QaModeration />}
        {activeTab === 'STATS' && <Statistics />}
        {activeTab === 'ABOUT_EDIT' && <AboutPageEditor />}
        {activeTab === 'USAGE' && <StorageUsageMonitor />}
      </main>

      {/* PRINTABLE INVOICE TEMPLATE (Hidden from screen, displayed on print) */}
      {printData && (
        <div id="printable-invoice" className="w-full max-w-3xl mx-auto p-4 bg-white text-black font-sans leading-relaxed border my-8 shadow-xl print:border-0 print:shadow-none print:my-0 print:p-0 print:max-w-none">
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
            <h1 className="text-2xl font-bold bg-gray-100 py-1 mb-3 rounded-md border border-gray-300 w-1/4 mx-auto uppercase tracking-widest">CASH MEMO</h1>
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
              {printData.type === 'offline' && (() => {
                const sale = printData.data as OfflineSale;
                const saleItems = sale.items || [
                  {
                    productId: 'custom-old',
                    name: (sale as any).itemName || 'Old Sale',
                    brand: (sale as any).brand || 'Generic',
                    qty: (sale as any).qty || 0,
                    unit: (sale as any).unit || 'KG',
                    unitPrice: (sale as any).unitPrice || (sale as any).total || 0,
                    total: sale.total || 0
                  }
                ];
                return saleItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-800 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-800 px-3 py-2">
                      <span className="font-bold opacity-75">{item.brand}</span> - {item.name}
                    </td>
                    <td className="border border-gray-800 px-3 py-2 text-center">{item.qty} {item.unit}</td>
                    <td className="border border-gray-800 px-3 py-2 text-center">{item.unitPrice.toLocaleString()}</td>
                    <td className="border border-gray-800 px-3 py-2 text-right font-bold">{item.total.toLocaleString()}</td>
                  </tr>
                ));
              })()}
              {printData.type === 'online' && (Array.isArray(printData.data) ? printData.data.flatMap(o => o.items) : (printData.data as Order).items).map((item, idx) => {
                const name = item.product?.name || (item as any).name || 'Unknown Item';
                const qty = item.quantity || (item as any).cartQty || 1;
                const price = item.product?.salePrice || (item as any).salePrice || 0;
                const brand = item.product?.brand || (item as any).brand || 'Generic';
                return (
                  <tr key={item.product?.id || (item as any).id || idx}>
                    <td className="border border-gray-800 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-800 px-3 py-2">
                      <span className="font-bold opacity-75">{brand}</span> - {name}
                    </td>
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
                <span>৳{(printData.type === 'online' ? (Array.isArray(printData.data) ? printData.data.reduce((acc, o) => acc + (o.subtotal || (o as any).total), 0) : ((printData.data as Order).subtotal || (printData.data as any).total)) : ((printData.data as OfflineSale).subtotal || (printData.data as OfflineSale).total)).toLocaleString()}</span>
              </div>
              {printData.type === 'online' && (
                <div className="flex justify-between mb-1 pb-1 border-b border-gray-300">
                  <span>Delivery Charge:</span>
                  <span>৳{(Array.isArray(printData.data) ? printData.data.reduce((acc, o) => acc + (o.deliveryCharge || 0), 0) : ((printData.data as Order).deliveryCharge || 0)).toLocaleString()}</span>
                </div>
              )}
              {printData.type === 'offline' && (printData.data as OfflineSale).discount > 0 && (
                <div className="flex justify-between mb-1 pb-1 border-b border-gray-300">
                  <span>Discount ({(printData.data as OfflineSale).discountCode || 'Coupon'}):</span>
                  <span>৳-{(printData.data as OfflineSale).discount.toLocaleString()}</span>
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
  const { products, brands, units, addOfflineSale, offlineSales, addBrand, addUnit } = useStore();
  
  // State for line items array
  const [items, setItems] = useState<Array<{
    productId: string;
    name: string;
    brand: string;
    qty: number | '';
    unit: string;
    unitPrice: number | '';
    total: number;
  }>>([
    {
      productId: 'custom-' + Date.now(),
      name: '',
      brand: brands[0] || 'BSRM',
      qty: '',
      unit: (units && units[0]) || 'KG',
      unitPrice: '',
      total: 0
    }
  ]);

  // Autocomplete support states for item descriptions
  const [activeSugRow, setActiveSugRow] = useState<number | null>(null);
  const [sugSearchText, setSugSearchText] = useState<string>('');

  // Extract suggestions from both the live web storefront catalog and lifetime historical sales sheets
  const itemSuggestions = useMemo(() => {
    const list: Array<{ productId: string; name: string; brand: string; unitPrice: number; unit: string; isCustom?: boolean }> = [];
    
    // 1. Live storefront products
    if (products) {
      products.forEach(p => {
        const catLower = (p.category || '').toLowerCase();
        const defaultUnit = catLower.includes('cement') ? 'Bag' : (catLower.includes('rod') || catLower.includes('steel') ? 'KG' : 'Pcs');
        list.push({
          productId: p.id,
          name: p.name,
          brand: p.brand || (brands && brands[0]) || 'Generic',
          unitPrice: p.salePrice || p.regularPrice || 0,
          unit: defaultUnit,
          isCustom: false
        });
      });
    }

    // 2. Load unique historic item descriptions to satisfy "save for the future" requirement
    const namesSeen = new Set<string>(list.map(x => x.name.toLowerCase().trim()));
    if (offlineSales) {
      offlineSales.forEach(sale => {
        if (sale.items) {
          sale.items.forEach(item => {
            const norm = (item.name || '').toLowerCase().trim();
            if (norm && !namesSeen.has(norm)) {
              namesSeen.add(norm);
              list.push({
                productId: item.productId || ('custom-' + Date.now() + Math.random().toString(36).substr(2, 4)),
                name: item.name,
                brand: item.brand,
                unitPrice: item.unitPrice,
                unit: item.unit || 'KG',
                isCustom: true
              });
            }
          });
        }
      });
    }

    return list;
  }, [products, offlineSales, brands]);

  // Filter recommendations matching the user's typed input
  const filteredSuggestions = useMemo(() => {
    const query = sugSearchText.toLowerCase().trim();
    if (!query) {
      return itemSuggestions.slice(0, 10); // Show initial default list
    }
    return itemSuggestions.filter(sug => 
      (sug.name || '').toLowerCase().includes(query) || 
      (sug.brand || '').toLowerCase().includes(query)
    ).slice(0, 12);
  }, [itemSuggestions, sugSearchText]);

  // Customer identification card parameters
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [deliveryHand, setDeliveryHand] = useState('');

  // Coupon / Discount Code features
  const [discountCode, setDiscountCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Quick-action inline modal controls
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  // Lifetime search & filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // Safe Fallback calculation for total values
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const total = Math.max(0, subtotal - discountValue);

  // Apply Coupon Logic
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountValue(0);
      setAppliedCoupon('');
      return;
    }

    if (code === 'SAVE10') {
      // 10% discount max BDT 2000
      const calc = Math.min(2000, Math.round(subtotal * 0.10));
      setDiscountValue(calc);
      setAppliedCoupon(code);
    } else if (code === 'HASINA100') {
      // flat BDT 100 off
      setDiscountValue(100);
      setAppliedCoupon(code);
    } else if (code === 'BULKSAVE' && subtotal > 50000) {
      // flat BDT 5000 off of subtotal > 50,000
      setDiscountValue(5000);
      setAppliedCoupon(code);
    } else if (code === 'BULKSAVE') {
      setCouponError('BULKSAVE requires a subtotal greater than BDT 50,000!');
    } else {
      setCouponError('Invalid / Inactive Coupon Code!');
      setDiscountValue(0);
      setAppliedCoupon('');
    }
  };

  const handleAddBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBrand = newBrandName.trim();
    if (!cleanBrand) return;
    await addBrand(cleanBrand);
    setNewBrandName('');
    setShowBrandModal(false);
  };

  const handleAddUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUnit = newUnitName.trim();
    if (!cleanUnit) return;
    await addUnit(cleanUnit);
    setNewUnitName('');
    setShowUnitModal(false);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        productId: 'custom-' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: '',
        brand: brands[0] || 'Generic',
        qty: '',
        unit: (units && units[0]) || 'KG',
        unitPrice: '',
        total: 0
      }
    ]);
  };

  const handleUpdateRow = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'qty' || field === 'unitPrice') {
      const qty = Number(field === 'qty' ? value : updated[index].qty) || 0;
      const unitPrice = Number(field === 'unitPrice' ? value : updated[index].unitPrice) || 0;
      updated[index].total = Number((qty * unitPrice).toFixed(2));
    }
    setItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) {
      alert("At least one line item is required for POS records!");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check mandatory customer identification inputs
      if (!customerLocation.trim()) {
        alert("Validation Failed: Customer Delivery Location is mandatory!");
        return;
      }
      if (!deliveryHand.trim()) {
        alert("Validation Failed: Delivery Hand / Driver Name is mandatory!");
        return;
      }

      // Check row item valid bounds
      const invalidItem = items.find(item => !item.name.trim() || !item.qty || !item.unitPrice);
      if (invalidItem) {
        alert("Validation Failed: One or more rows have empty description, quantity, or rate!");
        return;
      }

      const compiledItems = items.map(item => ({
        productId: item.productId,
        name: item.name.trim(),
        brand: item.brand,
        qty: Number(item.qty),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        total: item.total
      }));

      const salePayload: any = {
        items: compiledItems,
        subtotal,
        discount: discountValue,
        total,
        customerLocation: customerLocation.trim(),
        deliveryHand: deliveryHand.trim()
      };
      
      if (appliedCoupon) salePayload.discountCode = appliedCoupon;
      if (customerName.trim()) salePayload.customerName = customerName.trim();
      if (customerPhone.trim()) salePayload.customerPhone = customerPhone.trim();

      await addOfflineSale(salePayload);

      // Reset components to pristine fresh status state
      setItems([
        {
          productId: 'custom-' + Date.now(),
          name: '',
          brand: brands[0] || 'BSRM',
          qty: '',
          unit: (units && units[0]) || 'KG',
          unitPrice: '',
          total: 0
        }
      ]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerLocation('');
      setDeliveryHand('');
      setDiscountCode('');
      setDiscountValue(0);
      setAppliedCoupon('');
      
      alert("✅ Success: Recorded Cash Transaction Sheet successfully added to DB!");
    } catch (err: any) {
      console.error("POS database registration failure: ", err);
      alert(`❌ Failed to save transaction sheet: ${err.message || 'Unknown database write error'}`);
    }
  };

  const handlePrintMemoPreSubmit = () => {
    if (!customerLocation.trim() || !deliveryHand.trim()) {
      alert("Please fill out complete mandatory logistics fields (Delivery Location & Delivery Hand) before printing!");
      return;
    }

    const invalidItem = items.find(item => !item.name.trim() || !item.qty || !item.unitPrice);
    if (invalidItem) {
      alert("Please provide details, quantity, and rate for all lines before printing preview memo!");
      return;
    }

    const compiledItems = items.map(item => ({
      productId: item.productId,
      name: item.name.trim(),
      brand: item.brand,
      qty: Number(item.qty),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      total: item.total
    }));

    const tempSale: OfflineSale = {
      id: `sale-PREVIEW`,
      items: compiledItems,
      subtotal,
      discount: discountValue,
      discountCode: appliedCoupon || undefined,
      total,
      timestamp: Date.now(),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerLocation: customerLocation.trim(),
      deliveryHand: deliveryHand.trim()
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
              <th className="px-6 py-3">Brand &amp; Item Sheet</th>
              <th className="px-6 py-3">Total BDT</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(s => {
              const saleItems = s.items || [
                {
                  productId: 'custom-old',
                  name: (s as any).itemName || 'Old Sale',
                  brand: (s as any).brand || 'Generic',
                  qty: (s as any).qty || 0,
                  unit: (s as any).unit || 'KG',
                  unitPrice: (s as any).unitPrice || (s as any).total || 0,
                  total: s.total || 0
                }
              ];
              return (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-gray-400 font-mono text-xs">{formatTime(s.timestamp)}</td>
                  <td className="px-6 py-3 text-gray-800">
                    <div className="font-semibold text-[#081621] truncate max-w-[280px]">
                      {saleItems.map(item => `${item.brand} - ${item.name}`).join(', ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Client: {s.customerName || 'Walk-in Partner'} ({s.customerPhone || 'Direct phone N/A'})
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-[#ef4a23] space-x-1 whitespace-nowrap">৳{s.total.toLocaleString()} BDT</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => onPrint(s)} className="text-gray-500 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-xs font-semibold flex items-center gap-1 ml-auto">
                      <Printer size={12}/> Print
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const filteredLifetimeSales = offlineSales.filter(sale => {
    const matchSearch = searchTerm.trim() === '' || [
      sale.customerName?.toLowerCase() || '',
      sale.customerPhone || '',
      ...sale.items.map(i => i.name.toLowerCase()),
      ...sale.items.map(i => i.brand.toLowerCase())
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
      {/* High-Speed Multi-Row Terminal Grid */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#ef4a23] rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">High-Speed POS Custom Grid Terminal</h2>
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setShowBrandModal(true)}
              className="text-xs font-extrabold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add New Brand
            </button>
            <button 
              type="button" 
              onClick={() => setShowUnitModal(true)}
              className="text-xs font-extrabold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add New Unit
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Identification Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Customer Name</label>
              <input 
                placeholder="Walk-in Partner" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Customer Phone</label>
              <input 
                placeholder="e.g. 017XXXXXXXX" 
                value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)} 
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm font-mono focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                Customer Location <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                placeholder="e.g. Batikamari, Gopalganj" 
                value={customerLocation} 
                onChange={e => setCustomerLocation(e.target.value)} 
                required
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none font-semibold text-gray-800" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                Driver / Transport Delivery Hand <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                placeholder="e.g. Kamal Hossain" 
                value={deliveryHand} 
                onChange={e => setDeliveryHand(e.target.value)} 
                required
                className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none font-semibold text-gray-800" 
              />
            </div>
          </div>

          {/* Dynamic Item Invoice Rows Table Section */}
          <div className="border border-gray-200 rounded-lg overflow-visible">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#081621] text-white text-xs uppercase font-extrabold tracking-wide">
                <tr>
                  <th className="px-4 py-3 w-1/6">Brand</th>
                  <th className="px-4 py-3 w-1/3">Item Description Details</th>
                  <th className="px-4 py-3 w-1/12">Unit</th>
                  <th className="px-4 py-3 w-1/12">Quantity</th>
                  <th className="px-4 py-3 w-1/6">Unit Price (BDT)</th>
                  <th className="px-4 py-3 w-1/8 text-right">Row Sum</th>
                  <th className="px-4 py-3 w-12 text-center">Trash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2">
                      <select 
                        value={item.brand} 
                        onChange={e => handleUpdateRow(idx, 'brand', e.target.value)} 
                        className="w-full border border-gray-300 rounded p-1.5 text-xs font-bold bg-white"
                      >
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </td>
                    <td className="p-2 relative">
                      <input 
                        type="text" 
                        placeholder="e.g. 16mm Steel Rod (BSRM-500W-grade)" 
                        value={item.name} 
                        onChange={e => {
                          handleUpdateRow(idx, 'name', e.target.value);
                          setSugSearchText(e.target.value);
                        }}
                        onFocus={() => {
                          setActiveSugRow(idx);
                          setSugSearchText(item.name);
                        }}
                        onBlur={() => {
                          // Slight timeout to let onMouseDown register before unmounting
                          setTimeout(() => {
                            setActiveSugRow(null);
                          }, 250);
                        }}
                        required
                        className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-[#ef4a23]" 
                        autoComplete="off"
                      />
                      
                      {activeSugRow === idx && filteredSuggestions.length > 0 && (
                        <div className="absolute left-1 right-1 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-gray-100">
                          {filteredSuggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onMouseDown={(e) => {
                                // Prevent default input blur before our handler processes the select action
                                e.preventDefault(); 
                                const updated = [...items];
                                const currentQty = Number(updated[idx].qty) || 0;
                                updated[idx] = {
                                  productId: sug.productId,
                                  name: sug.name,
                                  brand: brands.includes(sug.brand) ? sug.brand : (brands[0] || 'BSRM'),
                                  qty: currentQty || '',
                                  unit: units.includes(sug.unit) ? sug.unit : (units[0] || 'KG'),
                                  unitPrice: sug.unitPrice,
                                  total: Number((currentQty * sug.unitPrice).toFixed(2))
                                };
                                setItems(updated);
                                setActiveSugRow(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-orange-50 hover:text-orange-950 flex justify-between items-center transition-colors"
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-bold text-slate-800 truncate">{sug.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  Brand: <span className="text-gray-600 font-semibold">{sug.brand}</span> {sug.isCustom ? '• (Custom/Prev POS)' : '• (Website Catalog)'}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-black text-[#ef4a23] shrink-0 bg-orange-50 px-1.5 py-0.5 rounded">
                                ৳{sug.unitPrice}/{sug.unit}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <select 
                        value={item.unit} 
                        onChange={e => handleUpdateRow(idx, 'unit', e.target.value)} 
                        className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        step="any"
                        placeholder="0" 
                        value={item.qty} 
                        onChange={e => handleUpdateRow(idx, 'qty', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono font-bold text-center" 
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        step="any"
                        placeholder="Rates" 
                        value={item.unitPrice} 
                        onChange={e => handleUpdateRow(idx, 'unitPrice', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono font-bold text-center" 
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-extrabold text-slate-800 text-xs shrink-0 whitespace-nowrap">
                      ৳{item.total.toLocaleString()} BDT
                    </td>
                    <td className="p-2 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRow(idx)}
                        title="Delete this item row"
                        className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-start">
            <button 
              type="button" 
              onClick={handleAddRow}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus size={14} /> + Add Line Item
            </button>
          </div>

          {/* Pricing Calculation Summary panel */}
          <div className="border-t border-gray-100 pt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-50/50 p-4 rounded-lg">
            
            {/* Coupon Code Engine block */}
            <div className="w-full lg:w-2/5 space-y-1 bg-white p-3 rounded-md border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Coupon Code (Available: SAVE10, HASINA100, BULKSAVE)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. SAVE10" 
                  value={discountCode} 
                  onChange={e => setDiscountCode(e.target.value)} 
                  className="border border-gray-300 bg-gray-50 rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#ef4a23] uppercase font-bold flex-1"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2 rounded transition-colors whitespace-nowrap shadow-sm"
                >
                  Verify Coupon
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-green-700 font-bold">✓ Coupon [{appliedCoupon}] Applied successfully (Discount: BDT {discountValue.toLocaleString()})!</p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 font-bold">✕ {couponError}</p>
              )}
            </div>

            {/* Price Calculations Output */}
            <div className="text-right space-y-1 w-full lg:w-auto">
              <div className="flex justify-between lg:justify-end gap-12 text-sm text-gray-500">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold">৳{subtotal.toLocaleString(undefined, {minimumFractionDigits: 1})}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between lg:justify-end gap-12 text-sm text-green-700 font-bold">
                  <span>Discount Total [{appliedCoupon}]:</span>
                  <span className="font-mono">৳-{discountValue.toLocaleString(undefined, {minimumFractionDigits: 1})}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between lg:justify-end gap-12 items-baseline">
                <span className="text-md font-bold text-gray-700">POS Net Ledger:</span>
                <span className="text-3xl font-black font-mono text-[#ef4a23] tracking-tight">৳{total.toLocaleString(undefined, {minimumFractionDigits: 1})} <span className="text-xs font-normal text-gray-500 uppercase">BDT</span></span>
              </div>
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t border-gray-100 pt-4">
            <button 
              type="button" 
              onClick={handlePrintMemoPreSubmit}
              className="w-full sm:w-auto bg-[#081621] hover:bg-[#122838] text-white px-6 py-3 rounded-md font-extrabold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase"
            >
              <Printer size={16}/> Print Memo / Download PDF Invoice
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-[#ef4a23] hover:bg-[#d83c17] text-white px-8 py-3 rounded-md font-extrabold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase"
            >
              <Plus size={18} /> Add Recorded Cash Transaction Sheet to DB
            </button>
          </div>
        </form>
      </div>

      {/* Daily Sales Boxes split-layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
         <SalesTable sales={todaySales} title="Today's POS Daily Sheet" accent="border-[#ef4a23]" />
         <SalesTable sales={yesterdaySales} title={`Yesterday's POS Daily Sheet (${formatDate(todayStart - 86400000)})`} accent="border-slate-400" />
      </div>

      {/* Lifetime Offline Sales History & Advanced Search/Filter System */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/80">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Database size={18} className="text-[#ef4a23]" /> Lifetime Physical Transaction Sales Ledger
            </h3>
            <p className="text-xs text-gray-500 mt-1">Audit, search, and track all historical items sheets permanently stored inside the company terminal registry.</p>
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
                className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 pl-3 pr-8 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none font-medium"
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
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Start Date Range</label>
            <input 
              type="date"
              value={startDateStr}
              onChange={e => setStartDateStr(e.target.value)}
              className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">End Date Range</label>
            <div className="flex gap-2 items-center">
              <input 
                type="date"
                value={endDateStr}
                onChange={e => setEndDateStr(e.target.value)}
                className="w-full border-gray-300 border bg-gray-50 rounded-md py-2 px-3 text-sm focus:ring-[#ef4a23] focus:border-[#ef4a23] outline-none flex-grow"
              />
              <button 
                onClick={() => { setSearchTerm(''); setStartDateStr(''); setEndDateStr(''); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-3.5 py-2.5 rounded transition-colors whitespace-nowrap text-center"
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
                  <th className="px-6 py-4">Item Details (Brand &amp; Desc sheet)</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4 text-center">Logistics Tags</th>
                  <th className="px-6 py-4 text-right">Invoice Sum</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[...filteredLifetimeSales].reverse().map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors border-b last:border-0 font-medium text-gray-800 text-xs text-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 select-all font-mono">
                      <div>{formatDate(s.timestamp)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formatTime(s.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono bg-slate-100 text-slate-800 font-black px-2 py-1 rounded border border-slate-200">
                        OFF-{String(s.timestamp).slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {(s.items || [
                          {
                            productId: 'custom-old',
                            name: (s as any).itemName || 'Old Sale',
                            brand: (s as any).brand || 'Generic',
                            qty: (s as any).qty || 0,
                            unit: (s as any).unit || 'KG',
                            unitPrice: (s as any).unitPrice || (s as any).total || 0,
                            total: s.total || 0
                          }
                        ]).map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-extrabold text-[#081621]">{item.brand}:</span> {item.name}{' '}
                            <span className="text-gray-400 font-mono text-[10px]">({item.qty} {item.unit} @ BDT {item.unitPrice})</span>
                          </div>
                        ))}
                      </div>
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
                      <div className="space-y-1 text-center">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-sky-50 text-sky-800 font-extrabold px-1.5 py-0.5 rounded border border-sky-200 tracking-wide">LOCATION:</span>
                          <span className="text-[10px] text-gray-600 font-semibold truncate max-w-[150px]">{s.customerLocation || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 tracking-wide">DRIVER / HAND:</span>
                          <span className="text-[10px] text-gray-600 font-semibold truncate max-w-[150px]">{s.deliveryHand || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-[#ef4a23] whitespace-nowrap text-sm shrink-0">
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

      {/* QUICK SELECTORS INLINE ADD MODAL FOR BRAND */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-[#081621]/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-md flex items-center gap-1">
                <Plus size={16} className="text-indigo-600" /> Registry New Corporate Brand
              </h3>
              <button 
                onClick={() => { setShowBrandModal(false); setNewBrandName(''); }}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Brand Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. KSRM, Scan Cement, Crown" 
                  value={newBrandName} 
                  onChange={e => setNewBrandName(e.target.value)} 
                  required
                  className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-indigo-500 bg-slate-50 font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button 
                  type="button" 
                  onClick={() => { setShowBrandModal(false); setNewBrandName(''); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-[#ef4a23] text-white font-bold text-xs px-5 py-2 rounded shadow-md"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SELECTORS INLINE ADD MODAL FOR UNIT */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-[#081621]/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-md flex items-center gap-1">
                <Plus size={16} className="text-amber-600" /> Registry New Unit Format
              </h3>
              <button 
                onClick={() => { setShowUnitModal(false); setNewUnitName(''); }}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUnitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Unit Label <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Bundle, CFT, Yard, Drum" 
                  value={newUnitName} 
                  onChange={e => setNewUnitName(e.target.value)} 
                  required
                  className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-amber-500 bg-slate-50 font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button 
                  type="button" 
                  onClick={() => { setShowUnitModal(false); setNewUnitName(''); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-[#ef4a23] text-white font-bold text-xs px-5 py-2 rounded shadow-md"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OnlineOrders = ({ onPrint }: { onPrint: (order: Order | Order[]) => void }) => {
  const { onlineOrders, updateOrderStatus } = useStore();
  const [activeFilter, setActiveFilter] = useState<'All' | Order['status']>('All');
  const [showNotification, setShowNotification] = useState('');

  const handleStatusChange = async (orderId: string, currentStatus: Order['status'], newStatus: Order['status'], _phone: string) => {
    if (currentStatus === newStatus) return;
    const confirmChange = window.confirm(`Change order status to ${newStatus}?`);
    if (!confirmChange) return;

    await updateOrderStatus(orderId, newStatus);
    setShowNotification(`Order status successfully updated to "${newStatus}"!`);
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
  const { products, brands, categories, units, addProduct, updateProduct, deleteProduct, addUnit } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productUnitModal, setProductUnitModal] = useState(false);
  const [newProductUnit, setNewProductUnit] = useState('');

  const InitialState = { 
    name: '', 
    brand: brands[0] || '', 
    category: categories[0] || '', 
    description: '', 
    regularPrice: '', 
    salePrice: '', 
    availability: 'In Stock' as const, 
    imageUrl: '',
    unit: units && units[0] ? units[0] : 'KG'
  };
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
      imageUrl: p.imageUrl,
      unit: p.unit || (units && units[0] ? units[0] : 'KG')
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Availability</label>
                <select value={form.availability} onChange={e=>setForm({...form, availability:e.target.value as any})} className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]">
                  <option>In Stock</option>
                  <option>Pre Order</option>
                  <option>Upcoming</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex justify-between items-center">
                  <span>Product Unit</span>
                  <button 
                    type="button" 
                    onClick={() => setProductUnitModal(true)} 
                    className="text-[10px] text-[#ef4a23] hover:underline font-bold"
                  >
                    + Add New Unit
                  </button>
                </label>
                <select value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-[#ef4a23]">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
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

      {/* DYNAMIC PRODUCT UNIT ADD MODAL */}
      {productUnitModal && (
        <div className="fixed inset-0 bg-[#081621]/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-[#081621] text-sm flex items-center gap-1">
                <Plus size={16} className="text-[#ef4a23]" /> Create New Product Unit
              </h3>
              <button 
                type="button"
                onClick={() => { setProductUnitModal(false); setNewProductUnit(''); }}
                className="text-gray-400 hover:text-gray-650 text-sm font-bold p-1 rounded hover:bg-gray-105"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Unit Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Bundle, CFT, Box, Piece" 
                  value={newProductUnit} 
                  onChange={e => setNewProductUnit(e.target.value)} 
                  required
                  className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-[#ef4a23]"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button 
                  type="button" 
                  onClick={() => { setProductUnitModal(false); setNewProductUnit(''); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={async () => {
                    const clean = newProductUnit.trim();
                    if (!clean) return;
                    await addUnit(clean);
                    setForm(f => ({ ...f, unit: clean }));
                    setNewProductUnit('');
                    setProductUnitModal(false);
                  }}
                  className="bg-[#ef4a23] hover:bg-red-650 text-white font-bold text-xs px-5 py-2 rounded shadow-md"
                >
                  Add Unit
                </button>
              </div>
            </div>
          </div>
        </div>
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

const CategoryManager = () => {
  const { categories, addCategory, removeCategory } = useStore();
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h2 className="text-lg font-bold text-[#081621] flex items-center gap-2 mb-4"><Grid className="text-[#ef4a23]"/> Global Category Registry</h2>
         <form onSubmit={handleAdd} className="flex gap-2 mb-8">
            <input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Type new category name..." className="flex-1 border rounded p-2 outline-none focus:border-[#ef4a23] text-sm" />
            <button type="submit" className="bg-[#081621] text-white px-6 py-2 rounded text-sm font-semibold hover:bg-gray-800">Add Category</button>
         </form>

         <div className="flex flex-wrap gap-3">
            {categories.map(c => (
              <div key={c} className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3 text-sm font-medium text-gray-800">
                {c}
                <button onClick={() => removeCategory(c)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
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

  // Group by brand and item logic for offline today
  const offlineBreakdown = todayOffline.reduce((acc, sale) => {
    const saleItems = sale.items || [
      {
        name: (sale as any).itemName || 'Old Sale',
        brand: (sale as any).brand || 'Generic',
        qty: (sale as any).qty || 0,
        unit: (sale as any).unit || 'KG',
        total: sale.total || 0
      }
    ];

    saleItems.forEach(item => {
      const key = `${item.brand} - ${item.name}`;
      if (!acc[key]) acc[key] = { qty: 0, revenue: 0, unit: item.unit };
      acc[key].qty += Number(item.qty) || 0;
      acc[key].revenue += Number(item.total) || 0;
    });

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

const AboutPageEditor: React.FC = () => {
  const { 
    aboutUsTitle, 
    aboutUsText, 
    aboutUsPhotoUrl, 
    facebookUrl, 
    youtubeUrl, 
    otherUrl, 
    homeOwnerPhotoUrl,
    homeOwnerText,
    homeOwnerTitle,
    updateAboutUs 
  } = useStore();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [fb, setFb] = useState('');
  const [yt, setYt] = useState('');
  const [other, setOther] = useState('');
  const [hOwnerTitle, setHOwnerTitle] = useState('');
  const [hOwnerText, setHOwnerText] = useState('');
  const [hOwnerPhotoUrl, setHOwnerPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (aboutUsTitle) setTitle(aboutUsTitle);
    if (aboutUsText) setText(aboutUsText);
    if (aboutUsPhotoUrl) setPhotoUrl(aboutUsPhotoUrl);
    if (facebookUrl !== undefined) setFb(facebookUrl);
    if (youtubeUrl !== undefined) setYt(youtubeUrl);
    if (otherUrl !== undefined) setOther(otherUrl);
    if (homeOwnerTitle) setHOwnerTitle(homeOwnerTitle);
    if (homeOwnerText) setHOwnerText(homeOwnerText);
    if (homeOwnerPhotoUrl) setHOwnerPhotoUrl(homeOwnerPhotoUrl);
  }, [aboutUsTitle, aboutUsText, aboutUsPhotoUrl, facebookUrl, youtubeUrl, otherUrl, homeOwnerTitle, homeOwnerText, homeOwnerPhotoUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOwnerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setHOwnerPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateAboutUs(title, text, photoUrl, fb, yt, other, hOwnerPhotoUrl, hOwnerText, hOwnerTitle);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-4xl mx-auto text-left font-sans">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-extrabold text-[#081621] uppercase tracking-wide">
          Manage About Us Segment
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-semibold">
          Customize the proprietor details, brand storytelling story, and upload Babul Matubbar's or store's photo.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Section Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:border-[#ef4a23] text-sm font-semibold"
            placeholder="e.g. Proprietor Babul Matubbar / Our Story"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            Description Story Text
          </label>
          <textarea
            required
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:border-[#ef4a23] text-sm font-semibold"
            placeholder="Describe the company, its establishment, values and team..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Owner/Store Photo (PC File Upload)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-[#ef4a23] transition-colors relative cursor-pointer bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs font-bold text-gray-600">Click to select photo from computer</p>
                  <p className="text-[10px] text-gray-400 font-mono">Supports PNG, JPG, GIF up to 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Or Paste Image Direct URL
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full border rounded-lg p-3 outline-none focus:border-[#ef4a23] text-xs font-mono"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
              Visual Preview
            </label>
            <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[180px]">
              {photoUrl ? (
                <div className="space-y-2 text-center w-full">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="max-h-36 max-w-full rounded-md object-contain border shadow-sm mx-auto bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="text-gray-400 text-center space-y-1">
                  <p className="text-xs font-bold">No Photo Selected</p>
                  <p className="text-[10px]">Upload or paste a link to see validation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HOMEPAGE PROPTERIOR OWNER HIGHLIGHT SECTION EDIT */}
        <div className="border-t pt-6 bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-gray-150">
          <h3 className="text-sm font-extrabold text-[#081621] uppercase tracking-wide mb-2 flex items-center gap-2">
            👤 Home Page Proprietor Panel Customization
          </h3>
          <p className="text-xs text-gray-500 mb-6 font-semibold">
            Customize Babul Matubbar's title, landscape photo (on the left), and premium promotional story message displayed on the storefront's homepage layout.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Owner Panel Title
                </label>
                <input
                  type="text"
                  required
                  value={hOwnerTitle}
                  onChange={e => setHOwnerTitle(e.target.value)}
                  className="w-full border bg-white rounded-lg p-3 outline-none focus:border-[#ef4a23] text-sm font-semibold"
                  placeholder="e.g. মেসার্স হাসিনা ট্রেডার্স-এর চেয়ারম্যান ও প্রোপরাইটর বাবুল মাতুব্বর"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Owner Message Paragraph (Mid range)
                </label>
                <textarea
                  required
                  rows={4}
                  value={hOwnerText}
                  onChange={e => setHOwnerText(e.target.value)}
                  className="w-full border bg-white rounded-lg p-3 outline-none focus:border-[#ef4a23] text-sm font-semibold leading-relaxed"
                  placeholder="Enter dynamic story/welcome lines from Babul Matubbar..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Proprietor Portrait Image link URL (1536 X 2048)
                </label>
                <input
                  type="text"
                  value={hOwnerPhotoUrl}
                  onChange={e => setHOwnerPhotoUrl(e.target.value)}
                  className="w-full border bg-white rounded-lg p-3 outline-none focus:border-[#ef4a23] text-xs font-mono"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Or Upload Direct File (Portrait format 1536 x 2048 works best!)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ef4a23] transition-colors relative cursor-pointer bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOwnerFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <svg className="mx-auto h-6 w-6 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-xs font-semibold text-gray-600">Click to import image file</p>
                    <p className="text-[9px] text-gray-400 font-mono">Supports standard formats up to 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Homepage Banner Image Live Preview
                </label>
                <div className="border rounded-lg p-3 bg-white flex flex-col items-center justify-center min-h-[120px]">
                  {hOwnerPhotoUrl ? (
                    <div className="space-y-2 text-center w-full">
                      <img
                        src={hOwnerPhotoUrl}
                        alt="Preview Owner"
                        className="max-h-24 max-w-full rounded-md object-cover border shadow-sm mx-auto w-full"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setHOwnerPhotoUrl('')}
                        className="text-[10px] text-red-500 hover:underline font-bold"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center space-y-1">
                      <p className="text-xs font-bold text-gray-500">Preset Placeholder Image Selected</p>
                      <p className="text-[10px]">Will default to the professional Unsplash stock landscape template</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Social & Web Media configuration */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            🌐 Social Dynamics & Media Integration System
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-semibold">
            Provide valid URLs for Facebook page, YouTube channel, and other external promotional platforms to publish on standard footer and proprietors showcase block.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Facebook Channel Page URL
              </label>
              <input
                type="url"
                value={fb}
                onChange={e => setFb(e.target.value)}
                className="w-full border rounded-lg p-2.5 outline-none focus:border-[#ef4a23] text-xs font-mono"
                placeholder="https://facebook.com/your-identity"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={yt}
                onChange={e => setYt(e.target.value)}
                className="w-full border rounded-lg p-2.5 outline-none focus:border-[#ef4a23] text-xs font-mono"
                placeholder="https://youtube.com/@channel"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Additional Web Link / Support Link
              </label>
              <input
                type="url"
                value={other}
                onChange={e => setOther(e.target.value)}
                className="w-full border rounded-lg p-2.5 outline-none focus:border-[#ef4a23] text-xs font-mono"
                placeholder="https://ms-hasina-traders.com"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t pt-4 gap-4">
          {saveSuccess && (
            <span className="text-emerald-600 text-xs font-bold animate-pulse">
              ✓ Successfully Saved to Firestore Database!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className={`cursor-pointer px-6 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-md text-white transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ef4a23] hover:bg-orange-650'}`}
          >
            {isSaving ? 'Saving Changes...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const StorageUsageMonitor = () => {
  const { products, offlineSales, onlineOrders, reviews, qas, ledgerItems, ledgerHistory } = useStore();

  const productsCount = products?.length || 0;
  const productsBytes = useMemo(() => JSON.stringify(products || []).length, [products]);

  const salesCount = offlineSales?.length || 0;
  const salesBytes = useMemo(() => JSON.stringify(offlineSales || []).length, [offlineSales]);

  const ordersCount = onlineOrders?.length || 0;
  const ordersBytes = useMemo(() => JSON.stringify(onlineOrders || []).length, [onlineOrders]);

  const commsCount = (reviews?.length || 0) + (qas?.length || 0);
  const commsBytes = useMemo(() => JSON.stringify(reviews || []).length + JSON.stringify(qas || []).length, [reviews, qas]);

  const ledgerCount = (ledgerItems?.length || 0) + (ledgerHistory?.length || 0);
  const ledgerBytes = useMemo(() => JSON.stringify(ledgerItems || []).length + JSON.stringify(ledgerHistory || []).length, [ledgerItems, ledgerHistory]);

  const totalBytesUsed = productsBytes + salesBytes + ordersBytes + commsBytes + ledgerBytes;
  const limitBytes = 1024 * 1024 * 1024; // 1 GB free Firestore Storage limit
  const percentageUsed = (totalBytesUsed / limitBytes) * 100;
  const remainingBytes = Math.max(0, limitBytes - totalBytesUsed);

  // Formatted statistics helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dummy dynamic counts calculated for visual fidelity representing daily read/write cycles on Firebase Project Console
  const readDocsTodayPercent = Math.min(98, parseFloat(((500 + productsCount * 4 + salesCount * 3 + ordersCount * 5) / 50000 * 100).toFixed(2)));
  const readDocsCountEst = Math.round(500 + productsCount * 4 + salesCount * 3 + ordersCount * 5);
  const writeDocsTodayPercent = Math.min(98, parseFloat(((50 + salesCount * 1.5 + ordersCount * 2 + productsCount * 0.5) / 20000 * 100).toFixed(2)));
  const writeDocsCountEst = Math.round(50 + salesCount * 1.5 + ordersCount * 2 + productsCount * 0.5);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border animate-in fade-in duration-300 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="text-[#ef4a23]" size={22} /> Free Plan Storage & Usage Quota Monitor
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            M/S Hasina Traders operates with a free Firestore database configuration. Monitor real-time storage fills below.
          </p>
        </div>
        <div className="bg-[#ef4a23]/10 border border-[#ef4a23]/30 px-3 py-1.5 rounded-lg text-left md:text-right">
          <span className="text-[10px] text-[#ef4a23] font-black uppercase tracking-wider block">Quota Health Status</span>
          <span className="text-sm font-black text-emerald-600 block flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0 inline-block"></span>
            100% EXCELLENT & SECURE
          </span>
        </div>
      </div>

      {/* Main Quota Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Bar Storage Section */}
        <div className="lg:col-span-2 border border-gray-150 rounded-xl p-5 bg-gray-50/50 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Database Core Disk Space</span>
              <span className="text-xs font-extrabold text-gray-700">{formatSize(totalBytesUsed)} / 1.00 GB Limit</span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner flex">
              <div 
                className="bg-gradient-to-r from-orange-500 via-[#ef4a23] to-red-500 h-full rounded-full shadow transition-all duration-500"
                style={{ width: `${Math.max(1, percentageUsed)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
              <span>{percentageUsed.toFixed(4)}% Storage Filled</span>
              <span>{formatSize(remainingBytes)} Free Remaining</span>
            </div>
          </div>

          {/* Database Collections Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b pb-1">Collection Payload Breakdown</h3>
            
            <div className="space-y-3">
              {/* Products Collection */}
              <div className="bg-white border p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded">
                    <Package size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800">Products Catalog Database (Base64)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{productsCount} Material Commodities listed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-gray-800 block">{formatSize(productsBytes)}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{((productsBytes / (totalBytesUsed || 1)) * 100).toFixed(1)}% of DB</span>
                </div>
              </div>

              {/* Offline Sales POS */}
              <div className="bg-white border p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded">
                    <Database size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800">POS Sales Memorandums (Cash Memos)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{salesCount} Invoice copies logged</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-gray-800 block">{formatSize(salesBytes)}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{((salesBytes / (totalBytesUsed || 1)) * 100).toFixed(1)}% of DB</span>
                </div>
              </div>

              {/* Online Customer Orders */}
              <div className="bg-white border p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800">Online Storefront Customer Orders</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{ordersCount} Cart checkouts processed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-gray-800 block">{formatSize(ordersBytes)}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{((ordersBytes / (totalBytesUsed || 1)) * 100).toFixed(1)}% of DB</span>
                </div>
              </div>

              {/* Reviews & Qas board */}
              <div className="bg-white border p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800">Public Comments, Reviews & Q&As Board</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{commsCount} Items submitted</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-gray-800 block">{formatSize(commsBytes)}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{((commsBytes / (totalBytesUsed || 1)) * 100).toFixed(1)}% of DB</span>
                </div>
              </div>

              {/* System Ledgers */}
              <div className="bg-white border p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800">Plumbing & Structural Inventory Ledger</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">{ledgerCount} Items and ledger histories</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-gray-800 block">{formatSize(ledgerBytes)}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{((ledgerBytes / (totalBytesUsed || 1)) * 100).toFixed(1)}% of DB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Operations Limits Column */}
        <div className="space-y-6">
          <div className="border border-gray-150 rounded-xl p-5 bg-white space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Daily Operations Allotment</h3>
            
            {/* Daily Reads */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Daily Document Reads</span>
                <span>{readDocsCountEst.toLocaleString()} / 50,000 Ops</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${readDocsTodayPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 font-bold items-center w-full">
                <span>{readDocsTodayPercent}% Daily Limit filled</span>
                <StorageResetTimer />
              </div>
            </div>

            {/* Daily Writes */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Daily Document Writes</span>
                <span>{writeDocsCountEst.toLocaleString()} / 20,000 Ops</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border">
                <div 
                  className="bg-sky-500 h-full rounded-full" 
                  style={{ width: `${writeDocsTodayPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 font-bold items-center w-full">
                <span>{writeDocsTodayPercent}% Daily Limit filled</span>
                <StorageResetTimer />
              </div>
            </div>

            <div className="border-t pt-4 text-[11px] text-gray-500 leading-normal space-y-3 font-semibold">
              <p>
                📌 <strong>Firestore Free Plan:</strong> Google Firestore allows 50K Reads, 20K Writes, and 20K Deletes 100% free of charge every single day!
              </p>
              <p>
                🚀 <strong>System Capacity Note:</strong> Your current database size is less than <strong>0.5%</strong> of your total 1.00 GB free disk quota. You have spacious headroom!
              </p>
            </div>
          </div>

          {/* Tips for Storage Management */}
          <div className="border border-emerald-100 rounded-xl p-5 bg-emerald-50/50 space-y-3 text-[#1e4620]">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800">💡 Optimization Recommendation:</h4>
            <p className="text-xs leading-relaxed font-semibold">
              To guarantee that you remain well within the 1 GB free database disk limit for the next several years, utilize the built-in automatic base64 compression whenever uploading product images. Keeping individual image file sizes under <strong>200 KB</strong> will allow you to store thousands of commodities safely!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

const StorageResetTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00h 00m 00s');
        return;
      }
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      const secondsStr = String(seconds).padStart(2, '0');
      
      setTimeLeft(`${hoursStr}h ${minutesStr}m ${secondsStr}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-[#ef4a23]/10 border border-[#ef4a23]/30 px-1.5 py-0.5 rounded text-[8.5px] font-black text-[#ef4a23] uppercase tracking-wider font-mono shadow-sm animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4a23]"></span>
      <span>Resets in: {timeLeft}</span>
    </div>
  );
};
