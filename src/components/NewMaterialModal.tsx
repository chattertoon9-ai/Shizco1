import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { MaterialLedgerItem } from '../types';
import { translations } from '../utils/translations';
import { X, Package } from 'lucide-react';

interface NewMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMaterialModal: React.FC<NewMaterialModalProps> = ({ isOpen, onClose }) => {
  const { projects, activeProjectId, addMaterial, language } = useProject();
  const t = translations[language];

  const defaultProjId = activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || '');

  const [projectId, setProjectId] = useState(defaultProjId);
  const [materialName, setMaterialName] = useState('');
  const [category, setCategory] = useState<MaterialLedgerItem['category']>('steel');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('Metric Tons');
  const [ratePerUnit, setRatePerUnit] = useState(250000);
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [status, setStatus] = useState<MaterialLedgerItem['status']>('received');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const totalAmount = quantity * ratePerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim() || !projectId) return;

    addMaterial({
      projectId,
      materialName: materialName.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit: unit.trim() || 'Units',
      ratePerUnit: Number(ratePerUnit) || 0,
      totalAmount,
      supplier: supplier.trim() || 'Direct Supplier',
      invoiceNo: invoiceNo.trim() || undefined,
      date,
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>{t.newMaterial}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Site / Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="steel">Steel Rebar (سریا)</option>
                <option value="cement">Cement (سیمنٹ)</option>
                <option value="aggregates">Sand & Aggregates (ریت و بجری)</option>
                <option value="bricks">Bricks & AAC Blocks (اینٹیں و بلاکس)</option>
                <option value="plumbing">Plumbing (پلمبنگ)</option>
                <option value="electrical">Electrical (بجلی کا سامان)</option>
                <option value="finishing">Finishing (ماربل، ٹائل، پینٹ)</option>
                <option value="hardware">Hardware & Safety (شٹرنگ سامان)</option>
              </select>
            </div>
          </div>

          {/* Material Name */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Material Description & Grade *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deformed Steel Rebar 60 Grade (20mm)"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Qty, Unit, Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Unit (e.g. Bags, Tons, Cu.ft)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Unit Rate (PKR)
              </label>
              <input
                type="number"
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Total Calculation Display */}
          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex justify-between items-center text-xs">
            <span className="text-neutral-400">Total Calculated Cost:</span>
            <span className="text-amber-400 font-bold font-mono text-sm">
              PKR {totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Supplier, Invoice, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Supplier / Mill
              </label>
              <input
                type="text"
                placeholder="e.g. Mughal Steel"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Invoice / Bilty #
              </label>
              <input
                type="text"
                placeholder="e.g. INV-1092"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="received">Received on Site</option>
                <option value="ordered">Ordered (In Transit)</option>
                <option value="consumed">Consumed in Work</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              {language === 'ur' ? 'سامان شامل کریں' : 'Add Material'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
