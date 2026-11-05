import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency } from '../utils/translations';
import { COMPANY_TAX_PROFILE } from '../data/initialData';
import { TaxInvoice, TaxInvoiceItem, RFQDocument, RFQLineItem, RFQQuotation } from '../types';
import {
  FileText,
  Calculator,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Printer,
  Trash2,
  ExternalLink,
  Eye,
  Building2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  Receipt,
  Scale,
  Award,
  Send,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const TaxComplianceView: React.FC = () => {
  const {
    projects,
    taxInvoices,
    rfqs,
    language,
    isAdmin,
    activeProjectId,
    setActiveProjectId,
    setActiveTab,
    addTaxInvoice,
    updateTaxInvoiceStatus,
    deleteTaxInvoice,
    addRFQ,
    updateRFQStatus,
    addQuotationToRFQ,
    deleteRFQ,
    setIsLoginModalOpen
  } = useProject();

  const t = translations[language];

  // Active sub-module within TaxComplianceView
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'rfqs' | 'calculator'>('invoices');

  // Modals state
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isNewRFQOpen, setIsNewRFQOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<TaxInvoice | null>(null);
  const [selectedRFQForPrint, setSelectedRFQForPrint] = useState<RFQDocument | null>(null);
  const [selectedRFQForQuotes, setSelectedRFQForQuotes] = useState<RFQDocument | null>(null);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New Invoice Form State
  const [invProject, setInvProject] = useState(projects[0]?.id || 'proj-01');
  const [invNumber, setInvNumber] = useState(`AAC-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [invClientName, setInvClientName] = useState('Rehman Developers & Investments');
  const [invClientNtn, setInvClientNtn] = useState('3847291-2');
  const [invClientStrn, setInvClientStrn] = useState('3277876543210');
  const [invClientSrb, setInvClientSrb] = useState('S3847291-5');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [invType, setInvType] = useState<'sale' | 'purchase'>('sale');
  const [invNotes, setInvNotes] = useState('');

  // Invoice Items
  const [invItems, setInvItems] = useState<Array<{
    description: string;
    itemType: 'goods' | 'services';
    quantity: number;
    unit: string;
    unitPrice: number;
    whtRate: number;
  }>>([
    {
      description: 'RCC Structural Frame Construction & Concreting Works',
      itemType: 'services',
      quantity: 1,
      unit: 'Job Lot',
      unitPrice: 2500000,
      whtRate: 7.5
    }
  ]);

  // New RFQ Form State
  const [rfqProject, setRfqProject] = useState(projects[0]?.id || 'proj-01');
  const [rfqNumber, setRfqNumber] = useState(`AAC-RFQ-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState<RFQDocument['category']>('ready_mix');
  const [rfqDeadline, setRfqDeadline] = useState(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
  const [rfqBudget, setRfqBudget] = useState(1500000);
  const [rfqTerms, setRfqTerms] = useState('All deliveries must accompany mill test certificates and FBR active filer tax invoice.');
  const [rfqLines, setRfqLines] = useState<Array<{
    description: string;
    specification: string;
    quantity: number;
    unit: string;
    estimatedRate: number;
    taxCategory: 'fbr_goods_18' | 'srb_services_13' | 'exempt';
  }>>([
    {
      description: 'Ready Mix Concrete 3000 PSI',
      specification: 'Standard Mix Class B, 1:2:4, max aggregate 20mm',
      quantity: 100,
      unit: 'Cu. M',
      estimatedRate: 12500,
      taxCategory: 'fbr_goods_18'
    }
  ]);

  // Add Quote Form
  const [quoteVendor, setQuoteVendor] = useState('');
  const [quoteNtn, setQuoteNtn] = useState('');
  const [quoteIsFiler, setQuoteIsFiler] = useState(true);
  const [quoteBaseAmount, setQuoteBaseAmount] = useState(1000000);
  const [quoteLeadDays, setQuoteLeadDays] = useState(3);

  // Quick Tax Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1000000);
  const [calcType, setCalcType] = useState<'mixed_turnkey' | 'pure_goods' | 'pure_services'>('mixed_turnkey');
  const [calcFilerStatus, setCalcFilerStatus] = useState<'filer' | 'non_filer'>('filer');

  // ADMIN PERMISSION GUARD
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/40 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {language === 'ur' ? 'ایڈمنسٹریٹر لاگ ان درکار ہے' : 'Admin Privilege Required'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'ur'
              ? 'ٹیکس کمپلائنس، FBR/SRB ریٹرنز، سرکاری انوائسز اور RFQ کا نظام صرف الاسد کنسٹرکٹرز کے ایڈمن ڈائریکٹرز کے لیے مخصوص ہے۔'
              : 'Tax Compliance, FBR & SRB calculation ledgers, and RFQ procurement are restricted to Administrator accounts.'}
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 text-left space-y-1">
            <div className="font-semibold text-slate-300">Quick Switch to Admin Demo:</div>
            <div className="font-mono text-emerald-400">Email: admin@alasad.com</div>
            <div className="font-mono text-emerald-400">Password: admin</div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/30"
          >
            {language === 'ur' ? 'ایڈمن کے طور پر سائن ان کریں' : 'Sign In as Administrator'}
          </button>
        </div>
      </div>
    );
  }

  // Filtered Invoices
  const filteredInvoices = taxInvoices.filter(inv => {
    const matchProject = activeProjectId === 'all' || inv.projectId === activeProjectId;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch = searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientOrVendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientNtn.includes(searchQuery);
    return matchProject && matchStatus && matchSearch;
  });

  // Filtered RFQs
  const filteredRFQs = rfqs.filter(r => {
    const matchProject = activeProjectId === 'all' || r.projectId === activeProjectId;
    const matchSearch = searchQuery === '' ||
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProject && matchSearch;
  });

  // Financial & Tax Totals
  const totalInvoicedGross = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalFbrGstCollected = filteredInvoices.reduce((sum, i) => sum + i.totalFbrGst, 0);
  const totalSrbSstCollected = filteredInvoices.reduce((sum, i) => sum + i.totalSrbSst, 0);
  const totalWhtDeducted = filteredInvoices.reduce((sum, i) => sum + i.totalWhtDeduction, 0);
  const totalNetReceivable = filteredInvoices.reduce((sum, i) => sum + i.netPayable, 0);

  // RECHARTS: Tax Distribution
  const taxDistributionData = [
    { name: 'FBR GST (18%)', value: totalFbrGstCollected, color: '#3b82f6' },
    { name: 'SRB SST (13%)', value: totalSrbSstCollected, color: '#10b981' },
    { name: 'WHT Sec 153', value: totalWhtDeducted, color: '#f59e0b' },
  ].filter(t => t.value > 0);

  // RECHARTS: Project Tax Invoiced Comparison
  const projectTaxData = projects.map(p => {
    const pInvoices = taxInvoices.filter(i => i.projectId === p.id);
    return {
      name: p.code,
      subtotal: Math.round(pInvoices.reduce((s, i) => s + i.subtotal, 0) / 100000), // in Lakhs
      taxes: Math.round(pInvoices.reduce((s, i) => s + (i.totalFbrGst + i.totalSrbSst), 0) / 100000)
    };
  });

  // Helper calculation for live invoice item
  const calculateInvoiceTotals = (items: typeof invItems) => {
    let subtotal = 0;
    let totalFbrGst = 0;
    let totalSrbSst = 0;
    let totalWht = 0;

    const computedItems: TaxInvoiceItem[] = items.map((item, idx) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;

      let fbrGstRate = item.itemType === 'goods' ? 18 : 0;
      let fbrGstAmount = (lineTotal * fbrGstRate) / 100;
      totalFbrGst += fbrGstAmount;

      let srbSstRate = item.itemType === 'services' ? 13 : 0;
      let srbSstAmount = (lineTotal * srbSstRate) / 100;
      totalSrbSst += srbSstAmount;

      let whtAmount = (lineTotal * item.whtRate) / 100;
      totalWht += whtAmount;

      let net = (lineTotal + fbrGstAmount + srbSstAmount) - whtAmount;

      return {
        id: `item-${idx}-${Date.now()}`,
        description: item.description,
        itemType: item.itemType,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalAmount: lineTotal,
        fbrGstRate,
        fbrGstAmount,
        srbSstRate,
        srbSstAmount,
        whtRate: item.whtRate,
        whtAmount,
        netAmount: net
      };
    });

    const grandTotal = subtotal + totalFbrGst + totalSrbSst;
    const netPayable = grandTotal - totalWht;

    return {
      computedItems,
      subtotal,
      totalFbrGst,
      totalSrbSst,
      totalWht,
      grandTotal,
      netPayable
    };
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const { computedItems, subtotal, totalFbrGst, totalSrbSst, totalWht, grandTotal, netPayable } = calculateInvoiceTotals(invItems);

    addTaxInvoice({
      invoiceNumber: invNumber.trim(),
      projectId: invProject,
      date: invDate,
      dueDate: invDueDate,
      clientOrVendorName: invClientName.trim(),
      clientNtn: invClientNtn.trim(),
      clientStrn: invClientStrn.trim() || undefined,
      clientSrbNumber: invClientSrb.trim() || undefined,
      companyNtn: COMPANY_TAX_PROFILE.ntn,
      companyStrn: COMPANY_TAX_PROFILE.strn,
      companySrb: COMPANY_TAX_PROFILE.srb,
      invoiceType: invType,
      items: computedItems,
      subtotal,
      totalFbrGst,
      totalSrbSst,
      totalWhtDeduction: totalWht,
      grandTotal,
      netPayable,
      status: 'issued',
      notes: invNotes.trim() || undefined
    });

    setIsNewInvoiceOpen(false);
    setInvNotes('');
    setInvNumber(`AAC-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle.trim()) return;

    const mappedLines: RFQLineItem[] = rfqLines.map((l, idx) => ({
      id: `line-${idx}-${Date.now()}`,
      description: l.description,
      specification: l.specification,
      quantity: l.quantity,
      unit: l.unit,
      estimatedRate: l.estimatedRate,
      taxCategory: l.taxCategory
    }));

    addRFQ({
      rfqNumber: rfqNumber.trim(),
      projectId: rfqProject,
      title: rfqTitle.trim(),
      category: rfqCategory,
      issueDate: new Date().toISOString().split('T')[0],
      submissionDeadline: rfqDeadline,
      status: 'open',
      lineItems: mappedLines,
      quotations: [],
      estimatedBudget: Number(rfqBudget) || 1000000,
      termsAndConditions: rfqTerms.trim()
    });

    setIsNewRFQOpen(false);
    setRfqTitle('');
    setRfqNumber(`AAC-RFQ-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
  };

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQForQuotes || !quoteVendor.trim()) return;

    // Estimate taxes based on category
    let fbrTax = 0;
    let srbTax = 0;
    if (selectedRFQForQuotes.category === 'ready_mix' || selectedRFQForQuotes.category === 'civil_materials' || selectedRFQForQuotes.category === 'steel_rebar') {
      fbrTax = (quoteBaseAmount * 18) / 100;
    } else {
      srbTax = (quoteBaseAmount * 13) / 100;
    }

    addQuotationToRFQ(selectedRFQForQuotes.id, {
      vendorName: quoteVendor.trim(),
      vendorNtn: quoteNtn.trim() || undefined,
      isFiler: quoteIsFiler,
      quotedAmount: Number(quoteBaseAmount) || 0,
      fbrTax,
      srbTax,
      totalWithTax: quoteBaseAmount + fbrTax + srbTax,
      leadTimeDays: Number(quoteLeadDays) || 3,
      status: 'pending'
    });

    setIsAddQuoteModalOpen(false);
    setQuoteVendor('');
    setQuoteNtn('');
  };

  // CSV Export for FBR Annexure C & SRB SST Return
  const exportTaxCsv = () => {
    const headers = [
      'Invoice #',
      'Date',
      'Due Date',
      'Project Code',
      'Buyer/Client Name',
      'Buyer NTN',
      'Buyer STRN',
      'Buyer SRB Reg',
      'Subtotal (PKR)',
      'FBR GST 18% (PKR)',
      'SRB SST 13% (PKR)',
      'WHT Sec 153 (PKR)',
      'Grand Total (PKR)',
      'Net Payable (PKR)',
      'Status'
    ];

    const rows = filteredInvoices.map(inv => {
      const proj = projects.find(p => p.id === inv.projectId);
      return [
        inv.invoiceNumber,
        inv.date,
        inv.dueDate,
        proj?.code || inv.projectId,
        `"${inv.clientOrVendorName.replace(/"/g, '""')}"`,
        inv.clientNtn,
        inv.clientStrn || '-',
        inv.clientSrbNumber || '-',
        inv.subtotal,
        inv.totalFbrGst,
        inv.totalSrbSst,
        inv.totalWhtDeduction,
        inv.grandTotal,
        inv.netPayable,
        inv.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alasad_fbr_srb_tax_annexure_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Calculator Result
  const calcResults = useMemo(() => {
    let goodsAmount = 0;
    let servicesAmount = 0;

    if (calcType === 'mixed_turnkey') {
      goodsAmount = calcAmount * 0.70; // 70% materials
      servicesAmount = calcAmount * 0.30; // 30% construction labor/services
    } else if (calcType === 'pure_goods') {
      goodsAmount = calcAmount;
    } else {
      servicesAmount = calcAmount;
    }

    const fbrGst = (goodsAmount * 18) / 100;
    const srbSst = (servicesAmount * 13) / 100;

    // WHT sec 153:
    // Goods: 4.5% (filer) or 9% (non-filer)
    // Services / Contracts: 7.5% (filer) or 15% (non-filer)
    const goodsWhtRate = calcFilerStatus === 'filer' ? 4.5 : 9.0;
    const servicesWhtRate = calcFilerStatus === 'filer' ? 7.5 : 15.0;

    const goodsWht = (goodsAmount * goodsWhtRate) / 100;
    const servicesWht = (servicesAmount * servicesWhtRate) / 100;
    const totalWht = goodsWht + servicesWht;

    const invoiceGrandTotal = calcAmount + fbrGst + srbSst;
    const netCheckDisbursement = invoiceGrandTotal - totalWht;

    return {
      goodsAmount,
      servicesAmount,
      fbrGst,
      srbSst,
      totalWht,
      invoiceGrandTotal,
      netCheckDisbursement
    };
  }, [calcAmount, calcType, calcFilerStatus]);

  return (
    <div className={`space-y-6 pb-12 animate-fadeIn ${(selectedInvoiceForPrint || selectedRFQForPrint) ? 'print:space-y-0 print:pb-0' : ''}`}>
      <div className={`space-y-6 ${(selectedInvoiceForPrint || selectedRFQForPrint) ? 'no-print print:hidden' : ''}`}>
        {/* Top Header: Al Asad Corporate Tax Profile Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-5 rounded-2xl border border-blue-900/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              title={language === 'ur' ? 'تمام ٹیبس پر واپس جائیں' : 'Back to All Modules Hub'}
            >
              <ArrowLeft className="w-5 h-5 text-blue-400" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {language === 'ur' ? 'ٹیکس، انوائسز اور آر ایف کیو (FBR و SRB)' : 'Tax Compliance, Invoices & RFQs'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  Admin Only
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {language === 'ur'
                  ? 'سندھ ریونیو بورڈ (SRB 13%)، فیڈرل بورڈ آف ریونیو (FBR 18%)، ودہولڈنگ ٹیکس (Sec 153) اور RFQ کوٹیشنز'
                  : 'FBR GST 18%, SRB Sindh Sales Tax on Services 13%, Sec 153 WHT Deductions, and RFQ Bidding'}
              </p>
            </div>
          </div>

          {/* Company Registration Badges */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-950/60 text-blue-300 rounded border border-blue-800">
              <span className="text-slate-400">NTN:</span>
              <span className="font-bold">{COMPANY_TAX_PROFILE.ntn}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-800">
              <span className="text-slate-400">STRN:</span>
              <span className="font-bold">{COMPANY_TAX_PROFILE.strn}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-950/60 text-indigo-300 rounded border border-indigo-800">
              <span className="text-slate-400">SRB:</span>
              <span className="font-bold">{COMPANY_TAX_PROFILE.srb}</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSubTab === 'invoices'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'ٹیکس انوائسز (FBR/SRB)' : 'Tax Invoices'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-200">
                {taxInvoices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('rfqs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSubTab === 'rfqs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'آر ایف کیو اور کوٹیشنز (RFQs)' : 'RFQs & Tenders'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-200">
                {rfqs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSubTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'ٹیکس کیلکولیٹر' : 'Tax Rate Calculator'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'invoices' && (
              <>
                <button
                  onClick={exportTaxCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer shadow-sm"
                  title="Export FBR Annexure C CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ur' ? 'ایکسپورٹ FBR ریٹرن CSV' : 'Export FBR Annexure CSV'}</span>
                </button>
                <button
                  onClick={() => setIsNewInvoiceOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? '+ نئی ٹیکس انوائس' : '+ Generate Tax Invoice'}</span>
                </button>
              </>
            )}

            {activeSubTab === 'rfqs' && (
              <button
                onClick={() => setIsNewRFQOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? '+ نیا RFQ جاری کریں' : '+ Issue New RFQ'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gross Invoiced */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Billed Gross</p>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {formatCurrency(totalInvoicedGross, language)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{filteredInvoices.length} Official Invoices</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: FBR Sales Tax on Goods (18%) */}
        <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">FBR GST (18%) Goods</p>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(totalFbrGstCollected, language)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cement, Steel, Aggregates</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: SRB Sindh Services Tax (13%) */}
        <div className="bg-slate-900/90 border border-indigo-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">SRB SST (13%) Services</p>
            <div className="text-xl sm:text-2xl font-bold text-indigo-300 mt-1">
              {formatCurrency(totalSrbSstCollected, language)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sindh Revenue Board, Karachi</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: WHT Sec 153 Deductions */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">WHT Sec 153 (4.5% - 7.5%)</p>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
              {formatCurrency(totalWhtDeducted, language)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Income Tax Withholding at source</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: TAX INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Tax Breakdown Pie */}
            <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span>Tax Proportion (FBR vs SRB vs WHT)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Statutory deductions across active invoices</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                {taxDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {taxDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                        formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Tax Amount']}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No tax invoices recorded</div>
                )}
              </div>
            </div>

            {/* Chart 2: Project-Wise Tax Invoicing */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Project Invoiced Subtotal vs Taxes (Lakhs PKR)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Base contract value vs aggregate statutory taxes</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Subtotal
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> FBR/SRB Taxes
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTaxData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="L" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        `PKR ${val} Lakhs`,
                        name === 'subtotal' ? 'Contract Subtotal' : 'FBR & SRB Tax Sum'
                      ]}
                    />
                    <Bar dataKey="subtotal" name="subtotal" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="taxes" name="taxes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Search & Filter */}
          <div className="bg-slate-900/80 border border-blue-900/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search invoice #, client, NTN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* INVOICES TABLE */}
          <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Official Tax Invoice Ledger (Sales & Works)</h3>
              </div>
              <span className="text-xs text-slate-400">
                {filteredInvoices.length} invoices registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Client / Vendor</th>
                    <th className="py-3 px-4">Buyer NTN</th>
                    <th className="py-3 px-4 text-right">Subtotal (PKR)</th>
                    <th className="py-3 px-4 text-right">FBR GST (18%)</th>
                    <th className="py-3 px-4 text-right">SRB SST (13%)</th>
                    <th className="py-3 px-4 text-right">WHT Sec 153</th>
                    <th className="py-3 px-4 text-right font-bold text-white">Net Due (PKR)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => {
                      const proj = projects.find(p => p.id === inv.projectId);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                            {inv.invoiceNumber}
                            <span className="block text-[10px] text-slate-500 font-mono">
                              {proj?.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {inv.date}
                          </td>
                          <td className="py-3 px-4 font-medium text-white max-w-xs truncate" title={inv.clientOrVendorName}>
                            {inv.clientOrVendorName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                            {inv.clientNtn}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                            {inv.subtotal.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                            {inv.totalFbrGst.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-indigo-300 whitespace-nowrap">
                            {inv.totalSrbSst.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-400 whitespace-nowrap">
                            -{inv.totalWhtDeduction.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {inv.netPayable.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              inv.status === 'paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              inv.status === 'issued' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                                title="View & Print Official Tax Invoice"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                              </button>

                              {inv.status !== 'paid' && (
                                <button
                                  onClick={() => updateTaxInvoiceStatus(inv.id, 'paid')}
                                  className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] cursor-pointer"
                                  title="Mark as Paid"
                                >
                                  Paid
                                </button>
                              )}

                              <button
                                onClick={() => deleteTaxInvoice(inv.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500">
                        No tax invoices found. Click "+ Generate Tax Invoice" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RFQS & TENDERS */}
      {activeSubTab === 'rfqs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRFQs.map((rfq) => {
              const proj = projects.find(p => p.id === rfq.projectId);
              const totalQuotes = rfq.quotations.length;
              const lowestQuote = rfq.quotations.length > 0
                ? Math.min(...rfq.quotations.map(q => q.totalWithTax))
                : null;

              return (
                <div
                  key={rfq.id}
                  className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        {rfq.rfqNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        rfq.status === 'open' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        rfq.status === 'evaluation' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-3">
                      {rfq.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{proj?.name} ({proj?.location})</span>
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Estimated Budget:</span>
                        <span className="font-mono font-bold text-white">{formatCurrency(rfq.estimatedBudget, language)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Submission Deadline:</span>
                        <span className="font-mono text-amber-400">{rfq.submissionDeadline}</span>
                      </div>
                    </div>

                    {/* Line Items Summary */}
                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Scope of Items:</span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {rfq.lineItems.map(item => (
                          <li key={item.id} className="flex items-center justify-between text-[11px] bg-slate-950/40 px-2 py-1 rounded">
                            <span className="truncate max-w-[200px]">{item.description}</span>
                            <span className="font-mono text-slate-400">{item.quantity} {item.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quotations Status & Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">
                        {totalQuotes} Bid(s) Received
                      </span>
                      {lowestQuote && (
                        <span className="block text-[11px] text-emerald-400 font-mono">
                          Lowest: {formatCurrency(lowestQuote, language)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRFQForPrint(rfq)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                        title={language === 'ur' ? 'آر ایف کیو A4 پرنٹ دیکھیں' : 'View & Print RFQ (A4)'}
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Print A4</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRFQForQuotes(rfq);
                          setIsAddQuoteModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        + Submit Quote
                      </button>

                      <button
                        onClick={() => deleteRFQ(rfq.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete RFQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quotations List */}
                  {rfq.quotations.length > 0 && (
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-800/50">
                      <span className="text-[10px] uppercase font-mono text-slate-400">Received Vendor Bids:</span>
                      {rfq.quotations.map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between text-xs bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                          <div>
                            <span className="font-semibold text-slate-200">{quote.vendorName}</span>
                            <span className="text-[10px] text-emerald-400 ml-2 font-mono">
                              {quote.isFiler ? 'Active Filer' : 'Non-Filer'}
                            </span>
                          </div>
                          <div className="text-right font-mono font-semibold text-white">
                            {formatCurrency(quote.totalWithTax, language)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INTERACTIVE FBR & SRB TAX CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                <span>Construction Contract Tax Calculator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculate statutory FBR GST, SRB SST, and WHT deductions according to prevailing Pakistani tax codes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contract Base Amount (PKR)
              </label>
              <input
                type="number"
                min="10000"
                step="50000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contract Structure Type
              </label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="mixed_turnkey">Turnkey Civil Contract (70% Material Goods, 30% Construction Services)</option>
                <option value="pure_goods">Pure Material Supply (100% Goods: Rebar, Cement, Bricks) - FBR 18%</option>
                <option value="pure_services">Labor & Technical Services (100% Services: MEP, Concreting, Design) - SRB 13%</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supplier / Contractor Filer Status (Active Taxpayer List)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcFilerStatus('filer')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    calcFilerStatus === 'filer'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Active Filer (Standard Rates)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcFilerStatus('non_filer')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    calcFilerStatus === 'non_filer'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Non-Filer (100% Higher WHT)
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Tax Breakdown & Net Disbursement Schedule</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Sindh / Karachi Jurisdiction
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official computation according to Sales Tax Act 1990 and Sindh Sales Tax on Services Act 2011.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Contract Base Value:</span>
                <span className="font-mono font-bold text-white">PKR {calcAmount.toLocaleString()}</span>
              </div>

              {calcResults.goodsAmount > 0 && (
                <div className="flex items-center justify-between text-slate-400 pl-3 border-l-2 border-blue-500">
                  <span>Goods Component (Subject to FBR 18% GST):</span>
                  <span className="font-mono text-slate-200">PKR {calcResults.goodsAmount.toLocaleString()}</span>
                </div>
              )}

              {calcResults.servicesAmount > 0 && (
                <div className="flex items-center justify-between text-slate-400 pl-3 border-l-2 border-emerald-500">
                  <span>Services Component (Subject to SRB 13% SST):</span>
                  <span className="font-mono text-slate-200">PKR {calcResults.servicesAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-emerald-400">
                <span>+ FBR Sales Tax on Goods (18%):</span>
                <span className="font-mono font-semibold">+PKR {calcResults.fbrGst.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-indigo-300">
                <span>+ SRB Sindh Sales Tax on Services (13%):</span>
                <span className="font-mono font-semibold">+PKR {calcResults.srbSst.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-white font-semibold text-sm">
                <span>Official Gross Tax Invoice Value:</span>
                <span className="font-mono text-blue-400">PKR {calcResults.invoiceGrandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-amber-400">
                <span>- WHT Deduction at Source (Sec 153):</span>
                <span className="font-mono font-semibold">-PKR {calcResults.totalWht.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-emerald-400 font-bold text-base bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
                <span>Net Check Disbursed / Due:</span>
                <span className="font-mono text-lg">PKR {calcResults.netCheckDisbursement.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200">FBR & SRB Compliance Note: </span>
              In Pakistan, civil construction contracts involve both material supplies (governed by Federal FBR GST at 18%) and specialized services/labor (governed in Sindh by SRB SST at 13%). WHT under Section 153 must be deposited to the Federal treasury via CPR (Computerized Payment Receipt) within 7 days of deduction.
            </div>
          </div>
        </div>
      )}
      </div>

      {/* MODAL 1: GENERATE NEW TAX INVOICE */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-blue-800/50 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span>Generate Official FBR / SRB Tax Invoice</span>
              </h3>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Project Site</label>
                  <select
                    value={invProject}
                    onChange={(e) => setInvProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Buyer / Client Name</label>
                  <input
                    type="text"
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Buyer NTN</label>
                  <input
                    type="text"
                    value={invClientNtn}
                    onChange={(e) => setInvClientNtn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Buyer STRN (Sales Tax Reg)</label>
                  <input
                    type="text"
                    value={invClientStrn}
                    onChange={(e) => setInvClientStrn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Buyer SRB Registration #</label>
                  <input
                    type="text"
                    value={invClientSrb}
                    onChange={(e) => setInvClientSrb(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Invoice Line Items & Tax Class:</span>
                  <button
                    type="button"
                    onClick={() => setInvItems([...invItems, {
                      description: 'Construction Material or Execution Service',
                      itemType: 'goods',
                      quantity: 10,
                      unit: 'Units',
                      unitPrice: 5000,
                      whtRate: 4.5
                    }])}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    + Add Line Item
                  </button>
                </div>

                {invItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Item #{idx + 1}</span>
                      {invItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Description of Goods or Services"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...invItems];
                          updated[idx].description = e.target.value;
                          setInvItems(updated);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs"
                        required
                      />

                      <select
                        value={item.itemType}
                        onChange={(e) => {
                          const updated = [...invItems];
                          updated[idx].itemType = e.target.value as any;
                          updated[idx].whtRate = e.target.value === 'goods' ? 4.5 : 7.5;
                          setInvItems(updated);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs"
                      >
                        <option value="goods">Goods (FBR 18% GST, 4.5% WHT)</option>
                        <option value="services">Services (SRB 13% SST, 7.5% WHT)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...invItems];
                            updated[idx].quantity = Number(e.target.value);
                            setInvItems(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...invItems];
                            updated[idx].unit = e.target.value;
                            setInvItems(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Unit Price (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...invItems];
                            updated[idx].unitPrice = Number(e.target.value);
                            setInvItems(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">WHT % Rate</label>
                        <input
                          type="number"
                          step="0.5"
                          value={item.whtRate}
                          onChange={(e) => {
                            const updated = [...invItems];
                            updated[idx].whtRate = Number(e.target.value);
                            setInvItems(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Invoice Notes / IPC Reference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Interim Payment Certificate IPC-05 approved by resident consultant."
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINT / PREVIEW OFFICIAL TAX INVOICE */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block print:overflow-visible">
          <div className="printable-a4-document a4-print-document bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl p-8 my-8 print:p-0 print:m-0 print:w-full print:max-w-none print:min-w-full print:shadow-none print:rounded-none print:border-none">
            {/* Top Bar with Print & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Official Tax Invoice Document (A4)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice (A4)</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Invoice Header */}
            <div className="pt-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="Al Asad Logo" className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm" />
                <div>
                  <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">
                    AL ASAD CONSTRUCTORS (PVT) LTD
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">Civil Engineering & Turnkey Infrastructure Contractors</p>
                  <p className="text-[11px] text-slate-500">{COMPANY_TAX_PROFILE.registeredAddress}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded bg-blue-900 text-white text-xs font-bold tracking-wider uppercase mb-1">
                  TAX INVOICE
                </div>
                <div className="text-sm font-bold font-mono text-slate-800">{selectedInvoiceForPrint.invoiceNumber}</div>
                <div className="text-xs text-slate-500">Date: {selectedInvoiceForPrint.date}</div>
              </div>
            </div>

            {/* Tax Registrations Strip */}
            <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 text-xs font-mono">
              <div><span className="text-slate-500">NTN:</span> <strong>{selectedInvoiceForPrint.companyNtn}</strong></div>
              <div><span className="text-slate-500">STRN:</span> <strong>{selectedInvoiceForPrint.companyStrn}</strong></div>
              <div><span className="text-slate-500">SRB:</span> <strong>{selectedInvoiceForPrint.companySrb}</strong></div>
            </div>

            {/* Buyer Details */}
            <div className="mt-4 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500 uppercase font-semibold text-[10px]">Billed To (Buyer):</div>
              <div className="text-sm font-bold text-slate-900">{selectedInvoiceForPrint.clientOrVendorName}</div>
              <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
                <span>Buyer NTN: <strong>{selectedInvoiceForPrint.clientNtn}</strong></span>
                {selectedInvoiceForPrint.clientStrn && <span>STRN: <strong>{selectedInvoiceForPrint.clientStrn}</strong></span>}
                {selectedInvoiceForPrint.clientSrbNumber && <span>SRB: <strong>{selectedInvoiceForPrint.clientSrbNumber}</strong></span>}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Tax Applied</th>
                    <th className="p-2.5 text-right font-bold">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoiceForPrint.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium">{item.description}</td>
                      <td className="p-2.5 capitalize text-slate-600 text-[11px]">{item.itemType}</td>
                      <td className="p-2.5 text-center font-mono">{item.quantity} {item.unit}</td>
                      <td className="p-2.5 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        {item.fbrGstRate > 0 ? `FBR ${item.fbrGstRate}%` : `SRB ${item.srbSstRate}%`}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">{item.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="mt-4 flex justify-end">
              <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedInvoiceForPrint.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoiceForPrint.totalFbrGst > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>FBR Sales Tax (18%):</span>
                    <span className="font-mono font-semibold">+{selectedInvoiceForPrint.totalFbrGst.toLocaleString()}</span>
                  </div>
                )}
                {selectedInvoiceForPrint.totalSrbSst > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span>SRB Sindh Sales Tax (13%):</span>
                    <span className="font-mono font-semibold">+{selectedInvoiceForPrint.totalSrbSst.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-amber-700">
                  <span>WHT Deduction (Sec 153):</span>
                  <span className="font-mono font-semibold">-{selectedInvoiceForPrint.totalWhtDeduction.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-blue-950">
                  <span>Net Payable Amount:</span>
                  <span className="font-mono">PKR {selectedInvoiceForPrint.netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Signature & Seal */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <span>Prepared By (Accountant)</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <span>Authorized Director / Stamp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINT / PREVIEW OFFICIAL RFQ TENDER (A4) */}
      {selectedRFQForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block print:overflow-visible">
          <div className="printable-a4-document a4-print-document bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl p-8 my-8 print:p-0 print:m-0 print:w-full print:max-w-none print:min-w-full print:shadow-none print:rounded-none print:border-none">
            {/* Top Bar with Print & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Official Request for Quotation (RFQ) Tender Document (A4)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print RFQ (A4)</span>
                </button>
                <button
                  onClick={() => setSelectedRFQForPrint(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable RFQ Header */}
            <div className="pt-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="Al Asad Logo" className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm" />
                <div>
                  <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">
                    AL ASAD CONSTRUCTORS (PVT) LTD
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">Procurement & Tendering Department</p>
                  <p className="text-[11px] text-slate-500">{COMPANY_TAX_PROFILE.registeredAddress}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded bg-emerald-900 text-white text-xs font-bold tracking-wider uppercase mb-1">
                  REQUEST FOR QUOTATION
                </div>
                <div className="text-sm font-bold font-mono text-slate-800">{selectedRFQForPrint.rfqNumber}</div>
                <div className="text-xs text-slate-500">Issue Date: {selectedRFQForPrint.issueDate}</div>
                <div className="text-xs font-bold text-amber-700">Deadline: {selectedRFQForPrint.submissionDeadline}</div>
              </div>
            </div>

            {/* Tax Registrations Strip */}
            <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 text-xs font-mono">
              <div><span className="text-slate-500">NTN:</span> <strong>{COMPANY_TAX_PROFILE.ntn}</strong></div>
              <div><span className="text-slate-500">STRN:</span> <strong>{COMPANY_TAX_PROFILE.strn}</strong></div>
              <div><span className="text-slate-500">SRB:</span> <strong>{COMPANY_TAX_PROFILE.srb}</strong></div>
            </div>

            {/* Tender Scope Details */}
            <div className="mt-4 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500 uppercase font-semibold text-[10px]">Tender Scope & Site Details:</div>
              <div className="text-sm font-bold text-slate-900">{selectedRFQForPrint.title}</div>
              <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] pt-1">
                <span>Project: <strong>{projects.find(p => p.id === selectedRFQForPrint.projectId)?.name || selectedRFQForPrint.projectId}</strong></span>
                <span>Category: <strong className="uppercase">{selectedRFQForPrint.category.replace(/_/g, ' ')}</strong></span>
                <span>Budget: <strong>PKR {selectedRFQForPrint.estimatedBudget.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Scope Line Items Table */}
            <div className="mt-5 overflow-x-auto">
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-1.5">Required Bill of Quantities / Scope:</h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item #</th>
                    <th className="p-2.5">Material / Work Description</th>
                    <th className="p-2.5 text-center">Quantity</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5">Specification Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedRFQForPrint.lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-medium">{item.description}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="p-2.5 font-mono text-slate-600">{item.unit}</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">ASTM / BS Pakistan Compliant</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Received Bids Matrix */}
            {selectedRFQForPrint.quotations.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-1.5">Vendor Quotations / Bidding Matrix:</h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2">Vendor Name</th>
                      <th className="p-2">NTN / Filer</th>
                      <th className="p-2 text-right">Quoted Base</th>
                      <th className="p-2 text-right">FBR/SRB Tax</th>
                      <th className="p-2 text-right font-bold">Total with Tax (PKR)</th>
                      <th className="p-2 text-center">Lead Time</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedRFQForPrint.quotations.map((q) => (
                      <tr key={q.id}>
                        <td className="p-2 font-medium">{q.vendorName}</td>
                        <td className="p-2 font-mono text-[11px]">{q.vendorNtn || '-'} ({q.isFiler ? 'Filer' : 'Non-Filer'})</td>
                        <td className="p-2 text-right font-mono">{q.quotedAmount.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">{(q.fbrTax + q.srbTax).toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-blue-900">{q.totalWithTax.toLocaleString()}</td>
                        <td className="p-2 text-center font-mono">{q.leadTimeDays} days</td>
                        <td className="p-2 text-center uppercase font-bold text-[10px]">{q.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Tender Submission Terms & Conditions:</span>
              <p>{selectedRFQForPrint.termsAndConditions}</p>
              <p className="mt-1 text-slate-500">
                • Active Taxpayer List (ATL) FBR compliance required. Withholding tax under Section 153 applicable.
              </p>
            </div>

            {/* Signature & Seal */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500 print-avoid-break">
              <div className="text-center">
                <div className="w-44 border-b border-slate-400 mb-1"></div>
                <span>Procurement Officer</span>
              </div>
              <div className="text-center">
                <div className="w-44 border-b border-slate-400 mb-1"></div>
                <span>Resident Project Engineer (PEC Reg.)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ISSUE NEW RFQ */}
      {isNewRFQOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-800/50 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Issue Request for Quotation (RFQ)</span>
              </h3>
              <button
                onClick={() => setIsNewRFQOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRFQ} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">RFQ Number</label>
                  <input
                    type="text"
                    value={rfqNumber}
                    onChange={(e) => setRfqNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Project Site</label>
                  <select
                    value={rfqProject}
                    onChange={(e) => setRfqProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RFQ Title / Tender Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Ready Mix Concrete 4000 PSI or Structural Steel Supply"
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="ready_mix">Ready Mix Concrete</option>
                    <option value="steel_rebar">Grade 60 Steel Rebar</option>
                    <option value="civil_materials">Cement & Aggregates</option>
                    <option value="subcontract_labor">Subcontract Labor & Formwork</option>
                    <option value="finishes">Tiles, Paint & Finishes</option>
                    <option value="mep">MEP & Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={rfqDeadline}
                    onChange={(e) => setRfqDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Estimated Budget (PKR)</label>
                  <input
                    type="number"
                    value={rfqBudget}
                    onChange={(e) => setRfqBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Terms & Compliance Conditions</label>
                <textarea
                  rows={2}
                  value={rfqTerms}
                  onChange={(e) => setRfqTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRFQOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Publish RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBMIT QUOTATION TO RFQ */}
      {isAddQuoteModalOpen && selectedRFQForQuotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-blue-800/50 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Record Vendor Bid: {selectedRFQForQuotes.rfqNumber}
              </h3>
              <button
                onClick={() => setIsAddQuoteModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuoteSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Supplier / Contractor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Karachi ReadyMix Concretes Pvt Ltd"
                  value={quoteVendor}
                  onChange={(e) => setQuoteVendor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Supplier NTN</label>
                  <input
                    type="text"
                    placeholder="4819283-4"
                    value={quoteNtn}
                    onChange={(e) => setQuoteNtn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Filer Status</label>
                  <select
                    value={quoteIsFiler ? 'yes' : 'no'}
                    onChange={(e) => setQuoteIsFiler(e.target.value === 'yes')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="yes">Active Filer</option>
                    <option value="no">Non-Filer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Base Quoted Price (PKR)</label>
                  <input
                    type="number"
                    value={quoteBaseAmount}
                    onChange={(e) => setQuoteBaseAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Delivery Lead Time</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteLeadDays}
                    onChange={(e) => setQuoteLeadDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Estimated Tax (18% FBR / 13% SRB):</span>
                  <span className="font-mono text-slate-200">
                    PKR {Math.round(quoteBaseAmount * 0.18).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-slate-800">
                  <span>Total Bid Value (Inc. Tax):</span>
                  <span className="font-mono text-emerald-400">
                    PKR {Math.round(quoteBaseAmount * 1.18).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddQuoteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow cursor-pointer"
                >
                  Save Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
