import { ConstructionTask, DailySiteLog, MaterialLedgerItem, Project, SnagItem, LaborEntry, AccountTransaction, TaxInvoice, RFQDocument } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    code: 'CP-102',
    name: 'Al-Rehman Commercial Plaza (G+6)',
    nameUrdu: 'الرحمان کمرشل پلازہ (G+6)',
    client: 'Rehman Developers & Investments',
    location: 'Gulberg III, Main Boulevard, Lahore',
    projectManager: 'Engr. Tariq Mehmood',
    status: 'in_progress',
    currentPhase: 'structure',
    budget: 85000000,
    spent: 42150000,
    budgetAlertThreshold: 80,
    estimatedCostBreakdown: {
      material: 42000000,
      labor: 18000000,
      subcontractor: 14000000,
      machinery: 5000000,
      fuel: 3500000,
      overheads: 2500000
    },
    startDate: '2026-03-01',
    targetEndDate: '2027-04-30',
    bannerImage: '/src/assets/images/construction_commercial_site_1793460327058.jpg',
    description: '7-story commercial retail and office complex with two basement parking decks, post-tensioned RCC frame, and glass curtain wall façade.'
  },
  {
    id: 'proj-02',
    code: 'VR-504',
    name: 'Clifton Block 4 Luxury Contemporary Villa',
    nameUrdu: 'کلفٹن بلاک ۴ لگژری ولا، کراچی',
    client: 'Malik Zeeshan Farooq',
    location: 'Street 19, Clifton Block 4, Karachi, Sindh, Pakistan',
    projectManager: 'Ar. Hamza Siddiqui',
    status: 'in_progress',
    currentPhase: 'finishing',
    budget: 38000000,
    spent: 31160000, // Consumed 82.0% - triggers Alert Threshold (75% or 80%)
    budgetAlertThreshold: 75,
    estimatedCostBreakdown: {
      material: 18000000,
      labor: 8500000,
      subcontractor: 6500000,
      machinery: 2000000,
      fuel: 1500000,
      overheads: 1500000
    },
    startDate: '2026-01-15',
    targetEndDate: '2026-11-30',
    bannerImage: '/src/assets/images/construction_residential_villa_1793460328341.jpg',
    description: '1 Kanal modern minimalist residence featuring thermal insulated cavities, double glazed aluminum windows, and Spanish porcelain tile flooring.'
  },
  {
    id: 'proj-03',
    code: 'IND-88',
    name: 'Green Valley Logistics Distribution Shed',
    nameUrdu: 'گرین ویلی لاجسٹکس شیڈ',
    client: 'Silk Road Freight Systems',
    location: 'M-2 Motorway Industrial Zone, Sheikhupura',
    projectManager: 'Engr. Noman Ali',
    status: 'planned',
    currentPhase: 'foundation',
    budget: 120000000,
    spent: 18500000,
    budgetAlertThreshold: 85,
    estimatedCostBreakdown: {
      material: 65000000,
      labor: 24000000,
      subcontractor: 18000000,
      machinery: 7000000,
      fuel: 3500000,
      overheads: 2500000
    },
    startDate: '2026-08-01',
    targetEndDate: '2027-08-15',
    bannerImage: '/src/assets/images/construction_site_plan_1793460328422.jpg',
    description: '45,000 sq ft industrial pre-engineered steel warehouse with heavy duty floor slabs for high-bay forklift storage.'
  }
];

export const INITIAL_TASKS: ConstructionTask[] = [
  // Commercial Plaza Tasks
  {
    id: 'task-101',
    projectId: 'proj-01',
    title: '4th Floor Slab Rebar Tying & Cover Block Placement',
    titleUrdu: 'چوتھی منزل کے سلیب پر سریے کی بندھائی اور کور بلاکس',
    phase: 'structure',
    status: 'in_progress',
    priority: 'critical',
    contractor: 'Shahid Steel Fixers Associates',
    trade: 'Steel Fixing & Rebar',
    crewSize: 14,
    progressPercentage: 75,
    startDate: '2026-10-24',
    dueDate: '2026-11-04',
    estimatedCost: 1850000,
    actualCost: 1720000,
    checklist: [
      { id: 'c1', text: 'Verify Grade 60 steel bar sizes per structural drawings S-08', completed: true },
      { id: 'c2', text: 'Stagger top lap splices at zero-moment locations', completed: true },
      { id: 'c3', text: 'Place 25mm concrete cover blocks under bottom mesh', completed: true },
      { id: 'c4', text: 'Coordinate with MEP team for plumbing and electrical sleeve sleeves', completed: false },
      { id: 'c5', text: 'Resident structural engineer inspection sign-off', completed: false }
    ],
    notes: 'Slab pour is scheduled for coming Thursday at 6:00 AM once batching plant delivery is booked.'
  },
  {
    id: 'task-102',
    projectId: 'proj-01',
    title: 'Conduit Piping & Junction Boxes for 4th Floor Slab',
    titleUrdu: 'چوتھی منزل پر بجلی کے پائپ اور باکسز کی تنصیب',
    phase: 'mep',
    status: 'in_progress',
    priority: 'high',
    contractor: 'Al-Hadi Electricians & Engineers',
    trade: 'Electrical MEP',
    crewSize: 6,
    progressPercentage: 60,
    startDate: '2026-10-27',
    dueDate: '2026-11-03',
    estimatedCost: 450000,
    checklist: [
      { id: 'e1', text: 'Install 25mm PVC medium conduit per electrical drawing E-04', completed: true },
      { id: 'e2', text: 'Tie conduits with binding wire to rebar to avoid displacement', completed: true },
      { id: 'e3', text: 'Seal all fan hooks and junction boxes with thermocol/tape', completed: false }
    ],
    notes: 'Ensure PVC conduits are strictly protected while steel fixers walk over top mesh.'
  },
  {
    id: 'task-103',
    projectId: 'proj-01',
    title: '3rd Floor Exterior AAC Block Masonry',
    titleUrdu: 'تیسری منزل کی بیرونی دیواروں پر بلاک چنائی',
    phase: 'masonry',
    status: 'inspection',
    priority: 'medium',
    contractor: 'Bismillah Civil Builders',
    trade: 'Masonry',
    crewSize: 8,
    progressPercentage: 95,
    startDate: '2026-10-12',
    dueDate: '2026-10-30',
    actualCost: 1250000,
    estimatedCost: 1300000,
    checklist: [
      { id: 'm1', text: 'Ensure plumb line verticality and wall ties every 3 layers', completed: true },
      { id: 'm2', text: 'Apply polyurethane foam expansion gap at column junctions', completed: true },
      { id: 'm3', text: 'Site QA check for mortar bond strength', completed: false }
    ],
    notes: 'Ready for consultant engineer inspection before applying internal rough plaster.'
  },
  {
    id: 'task-104',
    projectId: 'proj-01',
    title: 'Ready-Mix Concrete Pour (C30/37) for 4th Floor Slab',
    titleUrdu: 'چوتھی منزل سلیب کی کنکریٹ پورنگ',
    phase: 'structure',
    status: 'backlog',
    priority: 'critical',
    contractor: 'Pak Concrete ReadyMix Solutions',
    trade: 'Concrete & Pouring',
    crewSize: 18,
    progressPercentage: 0,
    startDate: '2026-11-05',
    dueDate: '2026-11-06',
    estimatedCost: 4200000,
    checklist: [
      { id: 'p1', text: 'Reserve 18 transit mixers (approx 140 m3)', completed: false },
      { id: 'p2', text: 'Verify 3 concrete vibrator needles in working condition on site', completed: false },
      { id: 'p3', text: 'Prepare slump cone test kit and cast 12 test cubes for 7/28 day crush tests', completed: false },
      { id: 'p4', text: 'Arrange night illumination towers if pour extends past sunset', completed: false }
    ],
    notes: 'Traffic police NOC obtained for heavy concrete pumps on Main Boulevard from 07:00 PM.'
  },
  {
    id: 'task-105',
    projectId: 'proj-01',
    title: 'Basement Plumbing Sump Pit Pumps & Drainage',
    titleUrdu: 'بیسمنٹ میں سمپ پمپ اور نکاسی آب کی تنصیب',
    phase: 'mep',
    status: 'completed',
    priority: 'high',
    contractor: 'HydroTech Sanitary Services',
    trade: 'Plumbing',
    crewSize: 4,
    progressPercentage: 100,
    startDate: '2026-09-15',
    dueDate: '2026-10-05',
    actualEndDate: '2026-10-04',
    estimatedCost: 780000,
    actualCost: 755000,
    checklist: [
      { id: 'pl1', text: 'Dual submersible effluent pumps installed with float switches', completed: true },
      { id: 'pl2', text: 'Hydrostatic pressure test of discharge pipes up to 6 bar', completed: true },
      { id: 'pl3', text: 'Test run with generator backup power connection', completed: true }
    ],
    notes: 'Completed successfully without any leaks or motor issues.'
  },
  {
    id: 'task-106',
    projectId: 'proj-01',
    title: 'Fire Sprinkler Riser Piping & Standpipe Pressure Testing',
    titleUrdu: 'فائر فائٹنگ پائپ لائن اور پریشر ٹیسٹنگ',
    phase: 'mep',
    status: 'delayed',
    priority: 'high',
    contractor: 'FlameGuard Safety Engineering',
    trade: 'Fire Fighting',
    crewSize: 5,
    progressPercentage: 40,
    startDate: '2026-10-05',
    dueDate: '2026-10-25',
    estimatedCost: 1100000,
    checklist: [
      { id: 'f1', text: 'Mount 4-inch black mild steel seamless riser pipes', completed: true },
      { id: 'f2', text: 'Receive delayed shipment of UL-listed grooved couplings', completed: false },
      { id: 'f3', text: 'Conduct 2-hour hydrostatic leak test at 200 psi', completed: false }
    ],
    notes: 'Delayed due to port clearance of specialized grooved pipe couplings; supplier expects arrival by Nov 3.'
  },

  // Villa Tasks
  {
    id: 'task-201',
    projectId: 'proj-02',
    title: 'Master Bathroom Waterproofing & Flood Testing (48 Hours)',
    titleUrdu: 'ماسٹر باتھ روم کی واٹر پروفنگ اور 48 گھنٹے پانی ٹیسٹ',
    phase: 'finishing',
    status: 'in_progress',
    priority: 'critical',
    contractor: 'SealMaster Waterproofing Co.',
    trade: 'Waterproofing',
    crewSize: 3,
    progressPercentage: 80,
    startDate: '2026-10-29',
    dueDate: '2026-11-02',
    estimatedCost: 220000,
    checklist: [
      { id: 'wp1', text: 'Clean surface and round off all 90-degree internal fillets', completed: true },
      { id: 'wp2', text: 'Apply 2 coats of elastomeric polymer modified cementitious membrane', completed: true },
      { id: 'wp3', text: 'Pond water 50mm deep and monitor for 48 hours with zero seepage', completed: false }
    ],
    notes: 'Water ponding started yesterday morning; no dampness observed underneath.'
  },
  {
    id: 'task-202',
    projectId: 'proj-02',
    title: 'Kitchen & Wardrobe Pre-Wiring and Distribution Board',
    titleUrdu: 'باورچی خانے اور الماریوں کی برقی وائرنگ',
    phase: 'mep',
    status: 'completed',
    priority: 'medium',
    contractor: 'SmartLiving Electricals',
    trade: 'Electrical MEP',
    crewSize: 4,
    progressPercentage: 100,
    startDate: '2026-10-10',
    dueDate: '2026-10-22',
    actualEndDate: '2026-10-21',
    estimatedCost: 350000,
    actualCost: 340000,
    checklist: [
      { id: 'sw1', text: 'Pull 7/0.029 cables for induction hobs and ovens', completed: true },
      { id: 'sw2', text: 'Install smart home automation neutral wires at all switch points', completed: true },
      { id: 'sw3', text: 'Test RCCB earth leakage protection breaker', completed: true }
    ],
    notes: 'Signed off by owner Malik Zeeshan.'
  },
  {
    id: 'task-203',
    projectId: 'proj-02',
    title: 'Imported Marble (Botticino Fancy) Floor Grinding & Polishing',
    titleUrdu: 'بوٹیسینو ماربل فرش کی کٹائی اور پالش',
    phase: 'finishing',
    status: 'backlog',
    priority: 'medium',
    contractor: 'Lahore Marble Artisans',
    trade: 'Flooring',
    crewSize: 5,
    progressPercentage: 0,
    startDate: '2026-11-08',
    dueDate: '2026-11-20',
    estimatedCost: 890000,
    checklist: [
      { id: 'mb1', text: 'Inspect slab dryness and level floor bed', completed: false },
      { id: 'mb2', text: 'Lay marble with uniform 1mm paper joint with matching Italian epoxy grout', completed: false },
      { id: 'mb3', text: 'Initial 60-grit diamond pad grinding', completed: false },
      { id: 'mb4', text: 'Curing and final crystallization buffing', completed: false }
    ],
    notes: 'To begin as soon as ceiling gypsum board work is primed.'
  },

  // Warehouse Tasks
  {
    id: 'task-301',
    projectId: 'proj-03',
    title: 'Raft Foundation Soil Compaction Test & Field Density Report',
    titleUrdu: 'بنیاد کی مٹی کی کمپیکشن اور ٹیسٹنگ',
    phase: 'excavation',
    status: 'completed',
    priority: 'critical',
    contractor: 'GeoTech Testing Laboratories',
    trade: 'Geotechnical',
    crewSize: 3,
    progressPercentage: 100,
    startDate: '2026-09-01',
    dueDate: '2026-09-12',
    actualEndDate: '2026-09-11',
    estimatedCost: 450000,
    actualCost: 450000,
    checklist: [
      { id: 'gt1', text: 'Run 12 core cutter sand cone density tests across plot', completed: true },
      { id: 'gt2', text: 'Confirm 95% Modified Proctor density achieved with vibro-roller', completed: true },
      { id: 'gt3', text: 'Submit soil certification report to client', completed: true }
    ],
    notes: 'Achieved 96.2% compaction density. Cleared for lean concrete blind layer.'
  },
  {
    id: 'task-302',
    projectId: 'proj-03',
    title: 'Anchor Bolt Layout & Pedestal Rebar for PEB Steel Columns',
    titleUrdu: 'اسٹیل شیڈ کے کالمز کے لیے اینکر بولٹس اور پیڈسٹل',
    phase: 'foundation',
    status: 'in_progress',
    priority: 'critical',
    contractor: 'Peshawar Steel & Formwork Team',
    trade: 'Steel Fixing & Civil',
    crewSize: 11,
    progressPercentage: 55,
    startDate: '2026-10-18',
    dueDate: '2026-11-10',
    estimatedCost: 3100000,
    checklist: [
      { id: 'ab1', text: 'Total Station laser alignment check for centerlines within ±2mm', completed: true },
      { id: 'ab2', text: 'Fabricate steel template jigs for holding 32mm high-tensile anchor bolts', completed: true },
      { id: 'ab3', text: 'Pour high-strength 4000 psi concrete pedestals', completed: false }
    ],
    notes: 'Critical path task. Delivery of pre-engineered steel columns expected in 2 weeks.'
  }
];

export const INITIAL_DAILY_LOGS: DailySiteLog[] = [
  {
    id: 'log-01',
    projectId: 'proj-01',
    date: '2026-10-31',
    supervisor: 'Sub-Engr. Bilal Aslam',
    weather: 'sunny',
    temperatureC: 28,
    workersCount: [
      { trade: 'Steel Fixers (سریا والے)', count: 14 },
      { trade: 'Shuttering Carpenters (شٹرنگ مستری)', count: 8 },
      { trade: 'Masons (چنائی مستری)', count: 6 },
      { trade: 'General Labourers (عام مزدور)', count: 18 },
      { trade: 'Electricians (بجلی والے)', count: 4 }
    ],
    workSummary: 'Continued rebar tie work on 4th floor slab. Shuttering checked and reinforced with extra steel props in beam intersections. PVC electrical pipes laid on east wing.',
    delaysOrObstacles: 'Tower crane motor had minor grease leakage in morning, repaired within 45 minutes.',
    safetyIncidentsCount: 0,
    materialsReceived: [
      { material: 'Deformed Steel Bars (Grade 60)', quantity: '18 Metric Tons', supplier: 'Mughal Steel Mills' },
      { material: 'PVC Electrical Conduits (25mm)', quantity: '40 Bundles (4000 Rft)', supplier: 'Popular Pipes' }
    ]
  },
  {
    id: 'log-02',
    projectId: 'proj-01',
    date: '2026-10-30',
    supervisor: 'Sub-Engr. Bilal Aslam',
    weather: 'sunny',
    temperatureC: 30,
    workersCount: [
      { trade: 'Steel Fixers', count: 12 },
      { trade: 'Shuttering Carpenters', count: 9 },
      { trade: 'Masons', count: 6 },
      { trade: 'General Labourers', count: 16 }
    ],
    workSummary: 'Beam reinforcement completed. Bottom mat rebar placed. Scaffolding safety tags updated.',
    delaysOrObstacles: 'No major delays.',
    safetyIncidentsCount: 0,
    materialsReceived: [
      { material: 'Ordinary Portland Cement (OPC)', quantity: '400 Bags', supplier: 'Bestway Cement' }
    ]
  },
  {
    id: 'log-03',
    projectId: 'proj-02',
    date: '2026-10-31',
    supervisor: 'Ar. Hamza Siddiqui',
    weather: 'sunny',
    temperatureC: 24,
    workersCount: [
      { trade: 'Waterproofing Applicators', count: 3 },
      { trade: 'Painters / Putty Workers', count: 5 },
      { trade: 'Plumbers', count: 2 },
      { trade: 'Helpers', count: 4 }
    ],
    workSummary: '2nd coat of waterproofing membrane applied to master bedroom bathroom. Wall putty sanding underway in ground floor lounge.',
    delaysOrObstacles: 'None. Work progressing on schedule.',
    safetyIncidentsCount: 0,
    materialsReceived: [
      { material: 'SikaTop 107 Waterproofing Kits', quantity: '12 Sets', supplier: 'Sika Pakistan' },
      { material: 'Gypsum Wall Putty', quantity: '25 Bags', supplier: 'Diamond Paints' }
    ]
  }
];

export const INITIAL_MATERIALS: MaterialLedgerItem[] = [
  {
    id: 'mat-01',
    projectId: 'proj-01',
    materialName: 'Deformed Steel Rebar 60 Grade (16mm, 20mm, 25mm)',
    category: 'steel',
    quantity: 18,
    unit: 'Metric Tons',
    ratePerUnit: 255000,
    totalAmount: 4590000,
    supplier: 'Mughal Steel Corporation',
    invoiceNo: 'MUG-99821',
    date: '2026-10-31',
    status: 'received'
  },
  {
    id: 'mat-02',
    projectId: 'proj-01',
    materialName: 'Ordinary Portland Cement (OPC 53 Grade)',
    category: 'cement',
    quantity: 800,
    unit: 'Bags (50kg)',
    ratePerUnit: 1420,
    totalAmount: 1136000,
    supplier: 'Bestway Cement Distributors',
    invoiceNo: 'BW-5524',
    date: '2026-10-28',
    status: 'received'
  },
  {
    id: 'mat-03',
    projectId: 'proj-01',
    materialName: 'Chenab Coarse River Sand (ریت)',
    category: 'aggregates',
    quantity: 3200,
    unit: 'Cubic Feet (Cu.ft)',
    ratePerUnit: 78,
    totalAmount: 249600,
    supplier: 'Ravi Sand & Gravel Carriers',
    invoiceNo: 'RS-102',
    date: '2026-10-25',
    status: 'consumed'
  },
  {
    id: 'mat-04',
    projectId: 'proj-01',
    materialName: 'Margalla Crushed Stone Aggregate 3/4" (بجری)',
    category: 'aggregates',
    quantity: 4500,
    unit: 'Cubic Feet (Cu.ft)',
    ratePerUnit: 125,
    totalAmount: 562500,
    supplier: 'Taxila Quarry Works',
    invoiceNo: 'TQ-4011',
    date: '2026-10-24',
    status: 'received'
  },
  {
    id: 'mat-05',
    projectId: 'proj-02',
    materialName: 'Sika Waterproofing Chemical Membrane',
    category: 'finishing',
    quantity: 24,
    unit: 'Sets',
    ratePerUnit: 8500,
    totalAmount: 204000,
    supplier: 'Sika Official Distributor',
    invoiceNo: 'SIK-802',
    date: '2026-10-29',
    status: 'received'
  },
  {
    id: 'mat-06',
    projectId: 'proj-02',
    materialName: 'Botticino Fancy Italian Marble Slabs',
    category: 'finishing',
    quantity: 3800,
    unit: 'Sq. Feet',
    ratePerUnit: 520,
    totalAmount: 1976000,
    supplier: 'Capital Marble Imports',
    invoiceNo: 'CMI-1102',
    date: '2026-10-20',
    status: 'ordered'
  }
];

export const INITIAL_SNAGS: SnagItem[] = [
  {
    id: 'snag-01',
    projectId: 'proj-01',
    title: 'Honeycomb visible on 3rd floor column C-09 base after formwork stripping',
    locationDetails: '3rd Floor South-East Grid 4C',
    severity: 'critical',
    status: 'in_progress',
    assignedContractor: 'Pak Concrete & Shahid Shuttering',
    reportedDate: '2026-10-28',
    notes: 'Structural engineer instructed pressure grouting with non-shrink structural repair mortar (SikaGrout-214).'
  },
  {
    id: 'snag-02',
    projectId: 'proj-01',
    title: 'Damaged safety catch net along North facade at 2nd floor level',
    locationDetails: 'North Elevation facing Street',
    severity: 'moderate',
    status: 'resolved',
    assignedContractor: 'Site Safety Officer',
    reportedDate: '2026-10-26',
    resolvedDate: '2026-10-27',
    notes: 'Replaced with new 100mm heavy duty nylon fall protection netting.'
  },
  {
    id: 'snag-03',
    projectId: 'proj-02',
    title: 'Minor hairline crack on guest bedroom window lintel plaster',
    locationDetails: '1st Floor Guest Room East Wall',
    severity: 'minor',
    status: 'open',
    assignedContractor: 'Bismillah Civil Builders',
    reportedDate: '2026-10-30',
    notes: 'Open joint with V-groove and seal with fiberglass mesh tape before final coat of emulsion.'
  }
];

export const INITIAL_LABOR: LaborEntry[] = [
  {
    id: 'lab-01',
    projectId: 'proj-01',
    date: '2026-10-31',
    workerName: 'Ustad Tariq Mehmood',
    designation: 'Head Mason (Master Raj Mistri)',
    age: 39,
    education: 'Matriculation (TEVTA Trade Certified)',
    trade: 'Masons (Raj Mistri)',
    headcount: 8,
    hoursPerDay: 8,
    dailyWageRate: 2800,
    totalWage: 22400,
    allowances: { transport: 4000, food: 6000, accommodation: 5000 },
    monthlyGross: 87800, // (2800 * 26) + 15000
    deductions: { advance: 5000, other: 1000 },
    netPayable: 81800,
    contractor: 'Bismillah Civil Builders',
    shift: 'day',
    status: 'present',
    notes: 'Block masonry work on 3rd floor commercial retail units'
  },
  {
    id: 'lab-02',
    projectId: 'proj-01',
    date: '2026-10-31',
    workerName: 'Shahid Iqbal Gujjar',
    designation: 'Formwork & Shuttering Foreman',
    age: 44,
    education: 'DAE Civil Technology',
    trade: 'Shuttering Carpenters',
    headcount: 14,
    hoursPerDay: 8,
    dailyWageRate: 2600,
    totalWage: 36400,
    allowances: { transport: 3500, food: 6000, accommodation: 5000 },
    monthlyGross: 82100, // (2600 * 26) + 14500
    deductions: { advance: 8000, other: 1200 },
    netPayable: 72900,
    contractor: 'Shahid Formwork & Scaffolding',
    shift: 'day',
    status: 'present',
    notes: '4th floor slab formwork staging & marine plywood decking'
  },
  {
    id: 'lab-03',
    projectId: 'proj-01',
    date: '2026-10-31',
    workerName: 'Abdul Rasheed Niazi',
    designation: 'Lead Steel Fixer & Bar Bender',
    age: 33,
    education: 'Matric (Technical Vocational Diploma)',
    trade: 'Steel Fixers (Bar Benders)',
    headcount: 12,
    hoursPerDay: 8,
    dailyWageRate: 2700,
    totalWage: 32400,
    allowances: { transport: 3500, food: 6000, accommodation: 4500 },
    monthlyGross: 84200, // (2700 * 26) + 14000
    deductions: { advance: 4000, other: 800 },
    netPayable: 79400,
    contractor: 'Pak Rebar Specialists',
    shift: 'day',
    status: 'present',
    notes: 'Column cage fabrication & 4th floor main beam stirrups'
  },
  {
    id: 'lab-04',
    projectId: 'proj-01',
    date: '2026-10-31',
    workerName: 'Ghulam Murtaza',
    designation: 'Labor Jamadar & Site Helper Lead',
    age: 28,
    education: 'Middle (8th Grade)',
    trade: 'General Labor & Helpers (Mazdoor)',
    headcount: 22,
    hoursPerDay: 8,
    dailyWageRate: 1500,
    totalWage: 33000,
    allowances: { transport: 2500, food: 5000, accommodation: 4000 },
    monthlyGross: 50500, // (1500 * 26) + 11500
    deductions: { advance: 3000, other: 500 },
    netPayable: 47000,
    contractor: 'City Labor Suppliers',
    shift: 'day',
    status: 'present',
    notes: 'Material handling, concrete batching assistance, and debris clearing'
  },
  {
    id: 'lab-05',
    projectId: 'proj-01',
    date: '2026-10-31',
    workerName: 'Engr. Farhan Ali',
    designation: 'Senior MEP Electrical Technician',
    age: 31,
    education: 'DAE Electrical (Sindh Board of Technical Education)',
    trade: 'Electricians & Conduit Installers',
    headcount: 4,
    hoursPerDay: 8,
    dailyWageRate: 2900,
    totalWage: 11600,
    allowances: { transport: 4500, food: 6000, accommodation: 6000 },
    monthlyGross: 91900, // (2900 * 26) + 16500
    deductions: { advance: 6000, other: 1500 },
    netPayable: 84400,
    contractor: 'Alpha Electro-Mechanical',
    shift: 'day',
    status: 'present',
    notes: 'PVC conduit laying in slab reinforcement before pouring'
  },
  {
    id: 'lab-06',
    projectId: 'proj-02',
    date: '2026-10-31',
    workerName: 'Muhammad Zeeshan',
    designation: 'Master Tile & Granite Craftsman',
    age: 35,
    education: 'Intermediate (FA) & Interior Finishes',
    trade: 'Tile & Marble Masons',
    headcount: 6,
    hoursPerDay: 8,
    dailyWageRate: 3000,
    totalWage: 18000,
    allowances: { transport: 4000, food: 6000, accommodation: 5000 },
    monthlyGross: 93000, // (3000 * 26) + 15000
    deductions: { advance: 5000, other: 1000 },
    netPayable: 87000,
    contractor: 'Karachi Fine Finishes',
    shift: 'day',
    status: 'present',
    notes: 'Porcelain floor tiles installation in living room & drawing hall'
  },
  {
    id: 'lab-07',
    projectId: 'proj-02',
    date: '2026-10-31',
    workerName: 'Shabbir Ahmed',
    designation: 'Finishing Painter & Surface Polish In-charge',
    age: 41,
    education: 'Matriculation',
    trade: 'Painters & Wall Polishers',
    headcount: 5,
    hoursPerDay: 8,
    dailyWageRate: 2400,
    totalWage: 12000,
    allowances: { transport: 3000, food: 5500, accommodation: 4500 },
    monthlyGross: 75400, // (2400 * 26) + 13000
    deductions: { advance: 3500, other: 700 },
    netPayable: 71200,
    contractor: 'Master Touch Coatings',
    shift: 'day',
    status: 'present',
    notes: 'Primer application & wall putty scraping on 1st floor bedrooms'
  },
  {
    id: 'lab-08',
    projectId: 'proj-02',
    date: '2026-10-31',
    workerName: 'Naseem Akhtar',
    designation: 'General Helper & Material Handler',
    age: 23,
    education: 'Middle School Pass',
    trade: 'General Helpers',
    headcount: 6,
    hoursPerDay: 8,
    dailyWageRate: 1500,
    totalWage: 9000,
    allowances: { transport: 2500, food: 5000, accommodation: 4000 },
    monthlyGross: 50500, // (1500 * 26) + 11500
    deductions: { advance: 2000, other: 400 },
    netPayable: 48100,
    contractor: 'City Labor Suppliers',
    shift: 'day',
    status: 'present',
    notes: 'Tile adhesive mixing and cleaning'
  },
  {
    id: 'lab-09',
    projectId: 'proj-03',
    date: '2026-10-31',
    workerName: 'Ustad Shaukat Ali',
    designation: 'Heavy Excavator & Crane Operator',
    age: 46,
    education: 'HTV Commercial Driving License & Heavy Mach. Cert',
    trade: 'Heavy Equipment Operators',
    headcount: 3,
    hoursPerDay: 8,
    dailyWageRate: 3500,
    totalWage: 10500,
    allowances: { transport: 5000, food: 7000, accommodation: 6000 },
    monthlyGross: 109000, // (3500 * 26) + 18000
    deductions: { advance: 10000, other: 2000 },
    netPayable: 97000,
    contractor: 'Sindh Earthmovers & Transport',
    shift: 'day',
    status: 'present',
    notes: 'Excavator & loader operators for warehouse column footings'
  },
  {
    id: 'lab-10',
    projectId: 'proj-03',
    date: '2026-10-31',
    workerName: 'Engr. Bilal Hashmi',
    designation: 'Chief Land Surveyor & Total Station Specialist',
    age: 32,
    education: 'B.Tech Civil Engineering / GPS Surveying Cert',
    trade: 'Surveyors & Total Station Team',
    headcount: 2,
    hoursPerDay: 8,
    dailyWageRate: 3200,
    totalWage: 6400,
    allowances: { transport: 5000, food: 6000, accommodation: 6000 },
    monthlyGross: 100200, // (3200 * 26) + 17000
    deductions: { advance: 5000, other: 1500 },
    netPayable: 93700,
    contractor: 'Al Asad In-House Engineering',
    shift: 'day',
    status: 'present',
    notes: 'Grid boundary benchmarking and datum level verification'
  }
];

export const INITIAL_ACCOUNTS: AccountTransaction[] = [
  {
    id: 'acc-01',
    projectId: 'proj-01',
    voucherNo: 'VOC-2026-088',
    date: '2026-10-29',
    category: 'material',
    title: '500 Bags Lucky OPC Cement Bulk Delivery',
    recipientOrVendor: 'Lucky Cement Depot Karachi',
    amount: 690000,
    paymentMode: 'bank_transfer',
    status: 'paid',
    invoiceRef: 'INV-LC-9921',
    notes: 'Delivered directly to site silo batching area'
  },
  {
    id: 'acc-02',
    projectId: 'proj-01',
    voucherNo: 'VOC-2026-089',
    date: '2026-10-30',
    category: 'material',
    title: '25 Metric Tons Grade-60 Deformed Steel Rebar',
    recipientOrVendor: 'Amreli / Mughal Steels Distributor',
    amount: 6625000,
    paymentMode: 'bank_transfer',
    status: 'paid',
    invoiceRef: 'MS-8812',
    notes: 'Mill test certificates verified by structural consultant'
  },
  {
    id: 'acc-03',
    projectId: 'proj-01',
    voucherNo: 'VOC-2026-090',
    date: '2026-10-31',
    category: 'labor',
    title: 'Weekly Labor Wage Payout (Masons & Shuttering Crew)',
    recipientOrVendor: 'Bismillah Civil & Shahid Contractors',
    amount: 532000,
    paymentMode: 'cash',
    status: 'paid',
    invoiceRef: 'LAB-W44',
    notes: 'Disbursed according to site supervisor biometric muster roll'
  },
  {
    id: 'acc-04',
    projectId: 'proj-01',
    voucherNo: 'VOC-2026-091',
    date: '2026-10-25',
    category: 'machinery',
    title: 'Mobile Concrete Boom Pump Rental (36m) 2 Days',
    recipientOrVendor: 'Al-Madina Heavy Equipment Hire',
    amount: 240000,
    paymentMode: 'cheque',
    status: 'paid',
    invoiceRef: 'AME-441',
    notes: 'Used for continuous 3rd floor slab casting'
  },
  {
    id: 'acc-05',
    projectId: 'proj-02',
    voucherNo: 'VOC-2026-092',
    date: '2026-10-27',
    category: 'material',
    title: 'Spanish Porcelain Floor Tiles (60x120cm) 3,800 sq ft',
    recipientOrVendor: 'Capital Marble & Ceramics',
    amount: 1976000,
    paymentMode: 'bank_transfer',
    status: 'paid',
    invoiceRef: 'CMI-1102',
    notes: 'Imported first quality glazed tiles'
  },
  {
    id: 'acc-06',
    projectId: 'proj-02',
    voucherNo: 'VOC-2026-093',
    date: '2026-10-29',
    category: 'subcontractor',
    title: 'Aluminum & Double Glazing Window Advance (30%)',
    recipientOrVendor: 'TechnoGlass Karachi',
    amount: 850000,
    paymentMode: 'bank_transfer',
    status: 'paid',
    invoiceRef: 'TG-ADV-01',
    notes: 'Shop drawings approved by resident architect'
  },
  {
    id: 'acc-07',
    projectId: 'proj-02',
    voucherNo: 'VOC-2026-094',
    date: '2026-10-30',
    category: 'labor',
    title: 'Tile Fixing & Wall Putty Crew Wages',
    recipientOrVendor: 'Karachi Fine Finishes Crew',
    amount: 210000,
    paymentMode: 'cash',
    status: 'paid',
    invoiceRef: 'LAB-V02',
    notes: 'Bi-weekly payment cleared by project manager'
  },
  {
    id: 'acc-08',
    projectId: 'proj-03',
    voucherNo: 'VOC-2026-095',
    date: '2026-10-20',
    category: 'machinery',
    title: 'CAT 320D Excavator & 3 Dumper Trucks Rental (10 Days)',
    recipientOrVendor: 'Sindh Earthmovers & Transport',
    amount: 1150000,
    paymentMode: 'bank_transfer',
    status: 'paid',
    invoiceRef: 'SEM-901',
    notes: 'Foundation pit excavation & soil removal'
  },
  {
    id: 'acc-09',
    projectId: 'proj-03',
    voucherNo: 'VOC-2026-096',
    date: '2026-10-24',
    category: 'fuel',
    title: 'Diesel Supply for Site Heavy Machinery (3,000 Liters)',
    recipientOrVendor: 'PSO Commercial Fuel Depot',
    amount: 855000,
    paymentMode: 'cheque',
    status: 'paid',
    invoiceRef: 'PSO-3312',
    notes: 'Delivered in mobile fuel bowser with gravity meter receipt'
  },
  {
    id: 'acc-10',
    projectId: 'proj-01',
    voucherNo: 'VOC-2026-097',
    date: '2026-11-01',
    category: 'overheads',
    title: 'Site Water Bowsers & Portable Generator Maintenance',
    recipientOrVendor: 'City Site Utilities Service',
    amount: 125000,
    paymentMode: 'cash',
    status: 'pending',
    invoiceRef: 'CSU-11',
    notes: 'Monthly billing for site water supply & 60kVA generator servicing'
  }
];

export const COMPANY_TAX_PROFILE = {
  name: 'Al Asad Constructors (Pvt) Ltd',
  ntn: '7492104-7',
  strn: '3277876123456',
  srb: 'S3277876-1',
  pecNumber: 'C-3/18492',
  registeredAddress: 'Suit 402, Executive Tower, Main Clifton Road, Karachi, Sindh, Pakistan',
  fbrStatus: 'Active Filer',
  srbStatus: 'Active Registered Provider'
};

export const INITIAL_TAX_INVOICES: TaxInvoice[] = [
  {
    id: 'inv-01',
    invoiceNumber: 'AAC-INV-2026-001',
    rfqRef: 'AAC-RFQ-2026-042',
    projectId: 'proj-01',
    date: '2026-10-25',
    dueDate: '2026-11-15',
    clientOrVendorName: 'Rehman Developers & Investments',
    clientNtn: '3847291-2',
    clientStrn: '3277876543210',
    clientSrbNumber: 'S3847291-5',
    companyNtn: '7492104-7',
    companyStrn: '3277876123456',
    companySrb: 'S3277876-1',
    invoiceType: 'sale',
    status: 'issued',
    notes: 'Interim Payment Certificate (IPC-04) for RCC 3rd Floor Slab Casting and Column Works.',
    items: [
      {
        id: 'item-01',
        description: 'Post-Tensioned RCC Structural Frame Casting & Concreting Works (Class 1:2:4)',
        itemType: 'services',
        quantity: 1,
        unit: 'Job Lot',
        unitPrice: 4500000,
        totalAmount: 4500000,
        fbrGstRate: 0,
        fbrGstAmount: 0,
        srbSstRate: 13,
        srbSstAmount: 585000,
        whtRate: 7.5,
        whtAmount: 337500,
        netAmount: 4747500
      },
      {
        id: 'item-02',
        description: 'ASTM A615 Grade-60 Deformed High-Yield Rebar Supply (Direct Site Batch)',
        itemType: 'goods',
        quantity: 20,
        unit: 'Metric Ton',
        unitPrice: 265000,
        totalAmount: 5300000,
        fbrGstRate: 18,
        fbrGstAmount: 954000,
        srbSstRate: 0,
        srbSstAmount: 0,
        whtRate: 4.5,
        whtAmount: 238500,
        netAmount: 6015500
      }
    ],
    subtotal: 9800000,
    totalFbrGst: 954000,
    totalSrbSst: 585000,
    totalWhtDeduction: 576000,
    grandTotal: 11339000,
    netPayable: 10763000
  },
  {
    id: 'inv-02',
    invoiceNumber: 'AAC-INV-2026-002',
    rfqRef: 'AAC-RFQ-2026-045',
    projectId: 'proj-02',
    date: '2026-10-28',
    dueDate: '2026-11-20',
    clientOrVendorName: 'Malik Zeeshan Farooq (Clifton Villa)',
    clientNtn: '2948175-9',
    companyNtn: '7492104-7',
    companyStrn: '3277876123456',
    companySrb: 'S3277876-1',
    invoiceType: 'sale',
    status: 'paid',
    notes: 'Clifton Villa Premium Italian Porcelain Tile Flooring & Base Plaster Works Bill.',
    items: [
      {
        id: 'item-03',
        description: 'Spanish Porcelain Floor Tile Fixing & Grouting Labor Services',
        itemType: 'services',
        quantity: 3800,
        unit: 'Sq Ft',
        unitPrice: 180,
        totalAmount: 684000,
        fbrGstRate: 0,
        fbrGstAmount: 0,
        srbSstRate: 13,
        srbSstAmount: 88920,
        whtRate: 7.5,
        whtAmount: 51300,
        netAmount: 721620
      },
      {
        id: 'item-04',
        description: 'First Quality Glazed Tiles (60x120cm) & Tile Polymer Bond Adhesive',
        itemType: 'goods',
        quantity: 3800,
        unit: 'Sq Ft',
        unitPrice: 520,
        totalAmount: 1976000,
        fbrGstRate: 18,
        fbrGstAmount: 355680,
        srbSstRate: 0,
        srbSstAmount: 0,
        whtRate: 4.5,
        whtAmount: 88920,
        netAmount: 2242760
      }
    ],
    subtotal: 2660000,
    totalFbrGst: 355680,
    totalSrbSst: 88920,
    totalWhtDeduction: 140220,
    grandTotal: 3104600,
    netPayable: 2964380
  }
];

export const INITIAL_RFQS: RFQDocument[] = [
  {
    id: 'rfq-01',
    rfqNumber: 'AAC-RFQ-2026-042',
    projectId: 'proj-01',
    title: 'Ready-Mix Concrete (Class A, 4000 PSI) for 4th Floor Slab Pour',
    category: 'ready_mix',
    issueDate: '2026-10-20',
    submissionDeadline: '2026-11-05',
    status: 'evaluation',
    estimatedBudget: 3800000,
    termsAndConditions: 'All slump tests must comply with ASTM C143. Cylinder test samples (7, 14, 28 days) required. Supplier must be active FBR filer with valid NTN/STRN.',
    lineItems: [
      {
        id: 'rfq-line-1',
        description: 'Ready Mix Concrete 4000 PSI at 28 days with water reducing admixture',
        specification: 'OPC Lucky/Bestway, Margalla aggregate max 20mm, Chenab sand',
        quantity: 260,
        unit: 'Cu. Meters',
        estimatedRate: 13500,
        taxCategory: 'fbr_goods_18'
      },
      {
        id: 'rfq-line-2',
        description: 'Mobile Concrete Boom Pump (36m) Service & Pouring Operation',
        specification: 'Continuous pour 12-hour window with dual pipeline setup',
        quantity: 2,
        unit: 'Shifts',
        estimatedRate: 145000,
        taxCategory: 'srb_services_13'
      }
    ],
    quotations: [
      {
        id: 'quot-01',
        vendorName: 'Karachi ReadyMix Concretes Pvt Ltd',
        vendorNtn: '4819283-4',
        isFiler: true,
        quotedAmount: 3680000,
        fbrTax: 610200,
        srbTax: 37700,
        totalWithTax: 4327900,
        leadTimeDays: 2,
        status: 'pending'
      },
      {
        id: 'quot-02',
        vendorName: 'Indus Concrete Solutions',
        vendorNtn: '5829103-1',
        isFiler: true,
        quotedAmount: 3850000,
        fbrTax: 639000,
        srbTax: 39000,
        totalWithTax: 4528000,
        leadTimeDays: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'rfq-02',
    rfqNumber: 'AAC-RFQ-2026-045',
    projectId: 'proj-02',
    title: 'Double Glazed Thermal Aluminum Windows & Curtain Wall Profiles',
    category: 'finishes',
    issueDate: '2026-10-26',
    submissionDeadline: '2026-11-10',
    status: 'open',
    estimatedBudget: 2800000,
    termsAndConditions: 'Powder-coated 2mm structural aluminum section with Saint-Gobain 6mm+12mm air space+6mm tinted tempered glass.',
    lineItems: [
      {
        id: 'rfq-line-3',
        description: 'Thermal break aluminum casement & sliding window units fabrication & supply',
        specification: 'Chawla/Prime aluminum sections, architectural charcoal matte finish',
        quantity: 1450,
        unit: 'Sq Ft',
        estimatedRate: 1550,
        taxCategory: 'fbr_goods_18'
      },
      {
        id: 'rfq-line-4',
        description: 'Site Installation, silicone weather sealing, and acoustic testing',
        specification: 'Dow Corning structural sealant with 5-year water leakage warranty',
        quantity: 1450,
        unit: 'Sq Ft',
        estimatedRate: 380,
        taxCategory: 'srb_services_13'
      }
    ],
    quotations: []
  }
];
