import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { MaterialLedgerItem } from '../types';
import { translations, formatCurrency } from '../utils/translations';
import { 
  Package, 
  Plus, 
  Search, 
  Coins, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Trash2,
  FileSpreadsheet,
  Download,
  QrCode
} from 'lucide-react';
import { exportMaterialsToCSV } from '../utils/csvExport';
import { GlobalSearchFilterBar } from './GlobalSearchFilterBar';
import { MaterialQRScannerModal } from './MaterialQRScannerModal';

interface MaterialsLedgerProps {
  onOpenNewMaterial: () => void;
}

export const MaterialsLedger: React.FC<MaterialsLedgerProps> = ({ onOpenNewMaterial }) => {
  const { 
    projects, 
    materials, 
    activeProjectId, 
    setActiveProjectId, 
    updateMaterialStatus, 
    deleteMaterial, 
    language,
    searchQuery,
    statusFilter
  } = useProject();

  const t = translations[language];
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedMaterialForQR, setSelectedMaterialForQR] = useState<MaterialLedgerItem | null>(null);

  const relevantMaterials = materials.filter(m => {
    if (activeProjectId !== 'all' && m.projectId !== activeProjectId) {
      return false;
    }
    if (categoryFilter !== 'all' && m.category !== categoryFilter) {
      return false;
    }
    if (statusFilter !== 'all' && m.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.materialName.toLowerCase().includes(q);
      const matchSupplier = m.supplier.toLowerCase().includes(q);
      const matchCategory = m.category.toLowerCase().includes(q);
      const matchInvoice = m.invoiceNo?.toLowerCase().includes(q) || false;
      return matchName || matchSupplier || matchCategory || matchInvoice;
    }
    return true;
  });

  const totalExpense = relevantMaterials.reduce((sum, m) => sum + m.totalAmount, 0);

  const getStatusBadge = (status: MaterialLedgerItem['status']) => {
    switch (status) {
      case 'received':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            {language === 'ur' ? 'موصول شدہ (Received)' : 'Received on Site'}
          </span>
        );
      case 'consumed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-300">
            {language === 'ur' ? 'استعمال شدہ (Consumed)' : 'Consumed / Used'}
          </span>
        );
      case 'ordered':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 border border-amber-800/60 text-amber-400">
            {language === 'ur' ? 'آرڈر شدہ (Ordered)' : 'Pending Delivery'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Package className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'تعمیراتی سامان اور اخراجات لیجر' : 'Procurement & Materials Ledger'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {language === 'ur' ? 'سامان و میٹریل انوینٹری' : 'Materials Inventory & Spend Ledger'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام پروجیکٹس کا سامان' : 'All Projects Materials'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelectedMaterialForQR(null);
              setIsQRScannerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 rounded-lg transition-all shadow-sm whitespace-nowrap cursor-pointer"
            title={language === 'ur' ? 'سامان کی ترسیل کا QR کوڈ اسکین کریں اور اسٹاک اپ ڈیٹ کریں' : 'Scan construction material delivery QR to update stock levels'}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ur' ? 'کیو آر اسکینر' : 'Scan Delivery QR'}</span>
          </button>

          <button
            onClick={() => exportMaterialsToCSV(relevantMaterials, projects, language)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Download Materials Ledger as CSV for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ur' ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onOpenNewMaterial}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.newMaterial}</span>
          </button>
        </div>
      </div>

      {/* Global Search and Filter Bar */}
      <GlobalSearchFilterBar
        currentContext="materials"
        matchingCount={relevantMaterials.length}
        totalCount={materials.length}
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs text-neutral-400 mb-1 flex justify-between">
            <span>{language === 'ur' ? 'کل میٹریل لاگت' : 'Total Material Spend'}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatCurrency(totalExpense, language)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            <span>{relevantMaterials.length} {language === 'ur' ? 'آئٹمز رجسٹرڈ' : 'items tracked'}</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs text-neutral-400 mb-1 flex justify-between">
            <span>{language === 'ur' ? 'سائٹ پر موصول شدہ' : 'Received on Site'}</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {relevantMaterials.filter(m => m.status === 'received').length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            <span>{language === 'ur' ? 'سامان ذخیرہ میں موجود' : 'Ready for work crews'}</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs text-neutral-400 mb-1 flex justify-between">
            <span>{language === 'ur' ? 'زیر التواء ترسیل' : 'Pending Shipments'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {relevantMaterials.filter(m => m.status === 'ordered').length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            <span>{language === 'ur' ? 'آرڈرز روانہ ہونے کو تیار' : 'Orders in transit'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">
            {language === 'ur' ? 'میٹریل کیٹیگری:' : 'Material Category:'}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام کیٹیگریز (All)' : 'All Categories'}</option>
            <option value="steel">{language === 'ur' ? 'سریا (Steel Rebar)' : 'Steel Rebar'}</option>
            <option value="cement">{language === 'ur' ? 'سیمنٹ (Cement)' : 'Cement'}</option>
            <option value="aggregates">{language === 'ur' ? 'ریت و بجری (Sand/Gravel)' : 'Aggregates & Sand'}</option>
            <option value="bricks">{language === 'ur' ? 'اینٹیں و بلاکس (Bricks/Blocks)' : 'Bricks & Blocks'}</option>
            <option value="plumbing">{language === 'ur' ? 'پلمبنگ (Plumbing)' : 'Plumbing'}</option>
            <option value="electrical">{language === 'ur' ? 'بجلی کا سامان (Electrical)' : 'Electrical'}</option>
            <option value="finishing">{language === 'ur' ? 'فنشنگ (ماربل/پینٹ)' : 'Finishes (Marble/Paint)'}</option>
          </select>
        </div>

        <div className="text-xs text-neutral-400">
          <span className="font-mono text-amber-400 font-bold">{relevantMaterials.length}</span>
          <span> {language === 'ur' ? 'آئٹمز درج ہیں' : 'records in ledger'}</span>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Material & Category</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Supplier / Invoice</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {relevantMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    {language === 'ur' ? 'کوئی سامان ریکارڈ نہیں ملا' : 'No material records found'}
                  </td>
                </tr>
              ) : (
                relevantMaterials.map(m => {
                  const proj = projects.find(p => p.id === m.projectId);
                  return (
                    <tr key={m.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{m.materialName}</div>
                        <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                          {m.category}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-amber-400">
                        {proj?.code}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-200 tabular-nums">
                        {m.quantity.toLocaleString()} {m.unit}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-neutral-400 tabular-nums">
                        {formatCurrency(m.ratePerUnit, language)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                        {formatCurrency(m.totalAmount, language)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-neutral-200">{m.supplier}</div>
                        {m.invoiceNo && (
                          <div className="text-[11px] font-mono text-neutral-500">#{m.invoiceNo}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <select
                          value={m.status}
                          onChange={(e) => updateMaterialStatus(m.id, e.target.value as any)}
                          className="bg-neutral-950 border border-neutral-700 text-xs rounded px-2 py-1 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="ordered">Ordered</option>
                          <option value="received">Received</option>
                          <option value="consumed">Consumed</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedMaterialForQR(m);
                              setIsQRScannerOpen(true);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title={language === 'ur' ? 'ڈیلیوری QR لیبل دیکھیں یا پرنٹ کریں' : 'View / Print Material QR Code'}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMaterial(m.id)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner and Label Generator Modal */}
      <MaterialQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => {
          setIsQRScannerOpen(false);
          setSelectedMaterialForQR(null);
        }}
        selectedMaterialForLabel={selectedMaterialForQR}
      />
    </div>
  );
};
