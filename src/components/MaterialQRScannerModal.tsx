import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { useProject } from '../context/ProjectContext';
import { MaterialLedgerItem } from '../types';
import { formatCurrency } from '../utils/translations';
import { 
  Camera, 
  Upload, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Package, 
  Truck, 
  Building2, 
  Printer, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  FileCheck2,
  HardHat
} from 'lucide-react';

interface MaterialQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMaterialForLabel?: MaterialLedgerItem | null;
}

interface ScannedDeliveryData {
  materialId?: string;
  projectId: string;
  materialName: string;
  category: MaterialLedgerItem['category'];
  quantity: number;
  unit: string;
  ratePerUnit?: number;
  supplier: string;
  invoiceNo?: string;
  date?: string;
  rawPayload: string;
}

export const MaterialQRScannerModal: React.FC<MaterialQRScannerModalProps> = ({ 
  isOpen, 
  onClose,
  selectedMaterialForLabel 
}) => {
  const { 
    projects, 
    materials, 
    activeProjectId, 
    receiveMaterialDelivery, 
    language 
  } = useProject();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'simulate' | 'label'>(
    selectedMaterialForLabel ? 'label' : 'camera'
  );

  // Camera scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);

  // Scanned payload & verification
  const [scannedData, setScannedData] = useState<ScannedDeliveryData | null>(null);
  const [isDeliveredConfirmed, setIsDeliveredConfirmed] = useState(false);
  const [confirmedItem, setConfirmedItem] = useState<MaterialLedgerItem | null>(null);

  // Label generator state
  const [labelMaterialId, setLabelMaterialId] = useState<string>(
    selectedMaterialForLabel?.id || materials[0]?.id || ''
  );
  const [labelQrDataUrl, setLabelQrDataUrl] = useState<string>('');

  // Update initial tab when selected material changes
  useEffect(() => {
    if (selectedMaterialForLabel) {
      setLabelMaterialId(selectedMaterialForLabel.id);
      setActiveTab('label');
    }
  }, [selectedMaterialForLabel]);

  // Generate QR code for label generator tab
  useEffect(() => {
    const targetMat = materials.find(m => m.id === labelMaterialId);
    if (targetMat) {
      const qrPayload = JSON.stringify({
        source: 'AlAsadConstructors',
        materialId: targetMat.id,
        projectId: targetMat.projectId,
        materialName: targetMat.materialName,
        category: targetMat.category,
        quantity: targetMat.quantity,
        unit: targetMat.unit,
        ratePerUnit: targetMat.ratePerUnit,
        supplier: targetMat.supplier,
        invoiceNo: targetMat.invoiceNo || 'INV-SITE',
        type: 'MATERIAL_DELIVERY'
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff'
        }
      }).then(url => {
        setLabelQrDataUrl(url);
      }).catch(err => {
        console.error('QR code generation error', err);
      });
    }
  }, [labelMaterialId, materials]);

  // Audio beep feedback upon QR scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch affirmative beep
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // Helper to parse QR text into delivery payload
  const parseQRText = (text: string): ScannedDeliveryData | null => {
    const trimmed = text.trim();
    const effectiveProjectId = activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || 'proj-1');

    // 1. Try JSON
    try {
      const obj = JSON.parse(trimmed);
      if (obj.materialName) {
        return {
          materialId: obj.materialId,
          projectId: obj.projectId || effectiveProjectId,
          materialName: obj.materialName,
          category: obj.category || 'cement',
          quantity: Number(obj.quantity || obj.receivedQty || 10),
          unit: obj.unit || 'Units',
          ratePerUnit: obj.ratePerUnit ? Number(obj.ratePerUnit) : undefined,
          supplier: obj.supplier || 'Site Supplier',
          invoiceNo: obj.invoiceNo || `CH-${Date.now().toString().slice(-4)}`,
          date: obj.date || new Date().toISOString().split('T')[0],
          rawPayload: trimmed
        };
      }
    } catch {
      // Not JSON, continue to pattern matching
    }

    // 2. Tokenized pattern: AAC:MAT:name:quantity:unit:supplier:invoice
    if (trimmed.startsWith('AAC:MAT:') || trimmed.startsWith('AAC-MAT:')) {
      const parts = trimmed.split(/[:|]/);
      return {
        projectId: effectiveProjectId,
        materialName: parts[2] || 'Construction Material',
        category: (parts[3] as any) || 'cement',
        quantity: Number(parts[4] || 50),
        unit: parts[5] || 'Units',
        supplier: parts[6] || 'Authorized Vendor',
        invoiceNo: parts[7] || `CH-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        rawPayload: trimmed
      };
    }

    // 3. Match by existing material ID (e.g. mat-1, mat-2)
    const matchedById = materials.find(m => m.id === trimmed || trimmed.includes(m.id));
    if (matchedById) {
      return {
        materialId: matchedById.id,
        projectId: matchedById.projectId,
        materialName: matchedById.materialName,
        category: matchedById.category,
        quantity: 50, // default batch delivery
        unit: matchedById.unit,
        ratePerUnit: matchedById.ratePerUnit,
        supplier: matchedById.supplier,
        invoiceNo: `CH-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        rawPayload: trimmed
      };
    }

    // 4. Fallback generic material scan
    return {
      projectId: effectiveProjectId,
      materialName: trimmed.slice(0, 40) || 'Site Construction Material',
      category: 'cement',
      quantity: 50,
      unit: 'Bags',
      supplier: 'Direct Site Carrier',
      invoiceNo: `CH-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      rawPayload: trimmed
    };
  };

  const handleSuccessfulScan = (qrContent: string) => {
    playBeep();
    stopCamera();
    const parsed = parseQRText(qrContent);
    if (parsed) {
      setScannedData(parsed);
      setIsDeliveredConfirmed(false);
      setConfirmedItem(null);
    }
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setIsScanningActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanLoop();
      }
    } catch (err: any) {
      console.warn('Camera error or permission declined:', err);
      setCameraError(
        language === 'ur'
          ? 'کیمرہ شروع نہیں ہو سکا۔ برائے مہربانی کیمرہ کی اجازت چیک کریں یا "تصویر اپ لوڈ" استعمال کریں۔'
          : 'Unable to access site camera. Please allow camera permissions or use Image Upload / Simulate tab.'
      );
      setIsScanningActive(false);
    }
  };

  // Stop camera stream & scan loop
  const stopCamera = () => {
    setIsScanningActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Live video frame processing loop using jsQR
  const scanLoop = () => {
    if (!isScanningActive && !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleSuccessfulScan(code.data);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  };

  // Handle image file upload for scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleSuccessfulScan(code.data);
          } else {
            alert(
              language === 'ur'
                ? 'تصویر میں کوئی درست QR کوڈ نہیں مل سکا۔ برائے مہربانی صاف تصویر استعمال کریں۔'
                : 'No QR code detected in this image. Please upload a clear photo of the material delivery tag.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Lifecycle for camera based on tab and modal state
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Confirm and update stock in MaterialsLedger
  const handleConfirmStockUpdate = () => {
    if (!scannedData) return;

    const res = receiveMaterialDelivery({
      materialId: scannedData.materialId,
      projectId: scannedData.projectId,
      materialName: scannedData.materialName,
      category: scannedData.category,
      quantity: scannedData.quantity,
      unit: scannedData.unit,
      ratePerUnit: scannedData.ratePerUnit,
      supplier: scannedData.supplier,
      invoiceNo: scannedData.invoiceNo,
      date: scannedData.date
    });

    setIsDeliveredConfirmed(true);
    setConfirmedItem(res.item);
  };

  // Demo delivery simulations
  const handleSimulateDelivery = (sample: {
    materialName: string;
    category: MaterialLedgerItem['category'];
    quantity: number;
    unit: string;
    supplier: string;
    ratePerUnit: number;
  }) => {
    const payload = JSON.stringify({
      materialName: sample.materialName,
      category: sample.category,
      quantity: sample.quantity,
      unit: sample.unit,
      supplier: sample.supplier,
      ratePerUnit: sample.ratePerUnit,
      invoiceNo: `CH-${Date.now().toString().slice(-4)}`,
      projectId: activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || 'proj-1')
    });
    handleSuccessfulScan(payload);
  };

  // Existing matching material in ledger
  const existingMaterial = scannedData ? materials.find(m => 
    (scannedData.materialId && m.id === scannedData.materialId) ||
    (m.projectId === scannedData.projectId && m.materialName.toLowerCase().trim() === scannedData.materialName.toLowerCase().trim())
  ) : null;

  const currentStock = existingMaterial ? existingMaterial.quantity : 0;
  const projectedStock = scannedData ? currentStock + scannedData.quantity : 0;
  const selectedProj = projects.find(p => p.id === (scannedData?.projectId || activeProjectId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
              <QrCode className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {language === 'ur' ? 'میٹریل ترسیل QR کوڈ اسکینر' : 'Material Delivery QR Scanner'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Stock Auto-Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ur'
                  ? 'سائٹ پر سامان وصول کرتے وقت QR اسکین کریں، اسٹاک خودکار اپ ڈیٹ ہوگا'
                  : 'Scan incoming delivery challan to verify and update material stock levels instantly'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800/80 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setScannedData(null);
              setIsDeliveredConfirmed(false);
              setActiveTab('camera');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'لائیو کیمرہ' : 'Live Camera'}</span>
          </button>

          <button
            onClick={() => {
              setScannedData(null);
              setIsDeliveredConfirmed(false);
              setActiveTab('upload');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'تصویر اپ لوڈ' : 'Upload Image'}</span>
          </button>

          <button
            onClick={() => {
              setScannedData(null);
              setIsDeliveredConfirmed(false);
              setActiveTab('simulate');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'simulate'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'ur' ? 'فوری ڈیمو اسکین' : 'Simulate Delivery'}</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('label');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'label'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'QR لیبل بنائیں' : 'Print / View QR'}</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* STATE 1: SCANNED DELIVERY CONFIRMATION SHEET */}
          {scannedData ? (
            <div className="space-y-4 animate-fadeIn">
              {isDeliveredConfirmed ? (
                /* Success Screen */
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {language === 'ur' ? 'اسٹاک لیجر میں ترسیل کا اضافہ مکمل!' : 'Stock Level Updated Successfully!'}
                    </h4>
                    <p className="text-xs text-emerald-300 mt-1 max-w-md mx-auto">
                      {scannedData.quantity} {scannedData.unit} of "{scannedData.materialName}" successfully verified and registered into inventory.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 max-w-sm mx-auto text-xs space-y-1.5 text-left font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Previous Stock:</span>
                      <span className="text-slate-200">{currentStock} {scannedData.unit}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Delivered Added:</span>
                      <span>+{scannedData.quantity} {scannedData.unit}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex justify-between text-white font-bold text-sm">
                      <span>New Total Stock:</span>
                      <span className="text-emerald-400">{projectedStock} {scannedData.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setScannedData(null);
                        setIsDeliveredConfirmed(false);
                        setActiveTab('camera');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'مزید سامان اسکین کریں' : 'Scan Another Delivery'}</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      {language === 'ur' ? 'بند کریں' : 'Close & View Ledger'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Verification Form before saving */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          QR Verified
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Challan #{scannedData.invoiceNo}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1 truncate">
                        {scannedData.materialName}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Supplier: <strong className="text-slate-100">{scannedData.supplier}</strong> · Category: <span className="uppercase text-amber-400 font-mono text-[11px]">{scannedData.category}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stock Comparison Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Stock</span>
                      <span className="text-base sm:text-lg font-bold text-slate-200 font-mono">
                        {currentStock} <span className="text-xs font-normal text-slate-400">{scannedData.unit}</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 uppercase font-mono block">Scanned Delivery</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                        +{scannedData.quantity} <span className="text-xs font-normal text-emerald-300">{scannedData.unit}</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40">
                      <span className="text-[10px] text-blue-300 uppercase font-mono block">New Ledger Total</span>
                      <span className="text-base sm:text-lg font-bold text-white font-mono">
                        {projectedStock} <span className="text-xs font-normal text-blue-300">{scannedData.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Editable Delivery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block">
                        {language === 'ur' ? 'پروجیکٹ سائٹ' : 'Target Job Site'}
                      </label>
                      <select
                        value={scannedData.projectId}
                        onChange={(e) => setScannedData({ ...scannedData, projectId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-medium focus:ring-1 focus:ring-blue-500"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block">
                        {language === 'ur' ? 'موصول شدہ مقدار (Edit Quantity)' : 'Delivered Quantity'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={scannedData.quantity}
                          onChange={(e) => setScannedData({ ...scannedData, quantity: Math.max(1, Number(e.target.value)) })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono font-bold focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 font-mono text-xs px-2 py-2 bg-slate-900 rounded-lg border border-slate-800">
                          {scannedData.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setScannedData(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      {language === 'ur' ? 'منسوخ / دوبارہ اسکین کریں' : 'Rescan / Cancel'}
                    </button>

                    <button
                      onClick={handleConfirmStockUpdate}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'ur' ? 'اسٹاک لیجر میں جمع کریں' : 'Confirm & Update Stock Level'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'camera' ? (
            /* TAB 1: LIVE CAMERA SCANNER */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[380px] flex items-center justify-center border border-blue-900/40 shadow-inner">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                    <p className="text-xs text-rose-300 leading-relaxed">
                      {cameraError}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* High-Tech Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-2xl shadow-2xl flex items-center justify-center">
                        {/* Corner brackets */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-bounce" />

                        <div className="text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                          Align Delivery QR inside frame
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-time delivery decoder active</span>
                </span>
                <button
                  onClick={() => setActiveTab('simulate')}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium cursor-pointer"
                >
                  No printer? Test with sample QR →
                </button>
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            /* TAB 2: UPLOAD IMAGE */
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/50 hover:bg-slate-950/80 group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="font-bold text-white text-sm">
                  {language === 'ur' ? 'ڈیلیوری چالان یا QR کوڈ کی تصویر منتخب کریں' : 'Upload Delivery Challan or QR Photo'}
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {language === 'ur'
                    ? 'اپنے موبائل یا کمپیوٹر سے تصویر اپ لوڈ کریں یا کیمرے سے رسید کی تصویر لیں۔'
                    : 'Snap a picture of the supplier invoice, material bag label, or QR delivery receipt.'}
                </p>
                <span className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold group-hover:bg-blue-600 group-hover:text-white transition">
                  Browse Files / Camera
                </span>
              </label>
            </div>
          ) : activeTab === 'simulate' ? (
            /* TAB 3: SIMULATE DELIVERY */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                <span className="font-bold block mb-0.5">Quick On-Site Delivery Simulation:</span>
                Click any standard construction material delivery below to test instant QR decoding and watch stock levels update automatically.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSimulateDelivery({
                    materialName: 'OPC Cement Grade 53 (Lucky)',
                    category: 'cement',
                    quantity: 100,
                    unit: 'Bags',
                    supplier: 'Lucky Cement Ltd',
                    ratePerUnit: 1450
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                      Lucky Cement OPC 53
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Delivery: +100 Bags · Challan #LC-8810
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Click to Test Scan →
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateDelivery({
                    materialName: 'Deformed Steel Rebar Grade 60 (1/2")',
                    category: 'steel',
                    quantity: 10,
                    unit: 'Tons',
                    supplier: 'Amreli Steels Limited',
                    ratePerUnit: 265000
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-left transition flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs group-hover:text-blue-300 transition-colors">
                      Amreli Steel Grade 60
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Delivery: +10 Tons · Mill Certificate #AS-492
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Click to Test Scan →
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateDelivery({
                    materialName: 'Crushed Coarse Aggregates (Bajjri 3/4")',
                    category: 'aggregates',
                    quantity: 25,
                    unit: 'Tons',
                    supplier: 'Manghopir Quarry Works',
                    ratePerUnit: 4200
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                      Crushed Aggregates (3/4")
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Delivery: +25 Tons · Dumper #KHI-7819
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Click to Test Scan →
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateDelivery({
                    materialName: 'Burnt Clay Red Bricks (A-Grade)',
                    category: 'bricks',
                    quantity: 5000,
                    unit: 'Pcs',
                    supplier: 'Bhatti Kiln Works',
                    ratePerUnit: 14.5
                  })}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/50 text-left transition flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs group-hover:text-orange-300 transition-colors">
                      Red Clay Bricks (A-Class)
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Delivery: +5,000 Pcs · Batch #BK-102
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Click to Test Scan →
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 4: PRINT / VIEW MATERIAL QR LABEL */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">
                  {language === 'ur' ? 'لیبل کے لیے میٹریل منتخب کریں:' : 'Select Material for QR Delivery Tag:'}
                </span>
                <select
                  value={labelMaterialId}
                  onChange={(e) => setLabelMaterialId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.materialName} ({m.quantity} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Printable Tag Card */}
              {labelQrDataUrl && (
                <div className="p-6 bg-white text-slate-950 rounded-2xl border-2 border-slate-300 shadow-xl max-w-sm mx-auto space-y-4 font-sans text-center print:border-none print:shadow-none">
                  {/* Tag Brand Header */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-md object-cover border border-slate-400" />
                      <div>
                        <div className="text-xs font-black uppercase tracking-tight text-slate-950">
                          Al Asad Constructors
                        </div>
                        <div className="text-[9px] font-mono text-slate-600">
                          Site Delivery Inward Tag
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      QA PASSED
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
                    <img 
                      src={labelQrDataUrl} 
                      alt="Material QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>

                  {/* Material Spec Details */}
                  {(() => {
                    const mat = materials.find(m => m.id === labelMaterialId);
                    if (!mat) return null;
                    const proj = projects.find(p => p.id === mat.projectId);
                    return (
                      <div className="text-left text-xs space-y-1 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-950 text-sm truncate">{mat.materialName}</div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Category: <strong className="text-slate-900 uppercase">{mat.category}</strong> · Site: {proj?.code || 'SITE'}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Supplier: <strong className="text-slate-900">{mat.supplier}</strong>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Stock Level: <strong className="text-slate-900">{mat.quantity} {mat.unit}</strong>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>Scan on site arrival</span>
                    <span>PEC Reg. 2026</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'لیبل پرنٹ کریں (A4/Tag)' : 'Print QR Tag'}</span>
                </button>

                {labelQrDataUrl && (
                  <a
                    href={labelQrDataUrl}
                    download={`material-qr-${labelMaterialId}.png`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Download PNG</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Al Asad Constructors Digital Inward Material Tracking</span>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition text-xs"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
