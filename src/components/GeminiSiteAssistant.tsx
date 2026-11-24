import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations } from '../utils/translations';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  ExternalLink,
  Trash2,
  RefreshCw,
  Compass,
  HardHat,
  Calculator,
  Search,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Building2,
  X,
  Maximize2,
  Minimize2,
  LocateFixed,
  KeyRound,
  Map as MapIcon,
  MessageSquare,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingChunks?: Array<{
    maps?: {
      uri?: string;
      title?: string;
      placeAnswerSources?: {
        reviewSnippets?: Array<{
          reviewText?: string;
        }>;
      };
    };
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  webSearchQueries?: string[];
}

interface GeminiSiteAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

// Live Gemini key is stored ONLY on the user's own device (localStorage).
// It is never hardcoded, never sent anywhere except Google's Gemini API,
// and never written to the repo. Without a key the built-in offline
// Site Engine answers instead, so the chat never dead-ends with a 405.
const GEMINI_KEY_STORAGE = 'alasad_gemini_api_key';
const GEMINI_MODEL = 'gemini-3.8-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const GeminiSiteAssistant: React.FC<GeminiSiteAssistantProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const { language, activeProjectId, projects } = useProject();
  const t = translations[language];

  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [keyInput, setKeyInput] = useState('');
  const [showKeyRow, setShowKeyRow] = useState(false);
  const [keyNotice, setKeyNotice] = useState('');
  const [view, setView] = useState<'chat' | 'map'>('chat');
  const [mapProjectId, setMapProjectId] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const hasKey = (() => {
      try {
        return Boolean(localStorage.getItem(GEMINI_KEY_STORAGE));
      } catch {
        return false;
      }
    })();
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: hasKey
          ? (language === 'ur'
            ? `السلام علیکم! میں **الاسد سائٹ انٹیلیجنس اے آئی** ہوں۔ میں سول انجینئرنگ کیلکولیشنز، میٹریل ایسٹیمیشن، سائٹ سیفٹی اور گوگل میپس گراؤنڈنگ (Google Maps Grounding) کے ذریعے قریبی سیمنٹ، سریا، ریت کے پلانٹس اور کواریاں تلاش کرنے میں آپ کی مدد کر سکتا ہوں۔`
            : `Hello! I am the **Al Asad Site Intelligence AI**, powered by Gemini 3.8 Flash with Google Maps Grounding.\n\nI can assist you with real-time civil engineering calculations, batching plant coordinates, ASTM/PBC standards, material supply logistics, and site safety audits across all Al Asad Constructors project sites.`)
          : (language === 'ur'
            ? `السلام علیکم! میں **الاسد سائٹ انٹیلیجنس اے آئی** ہوں (Offline Site Engine)۔\n\nمیں ابھی آپ کو کنکریٹ/سریا کا حساب، شٹرنگ کے اوقات، کیورنگ، سیفٹی چیک لسٹ اور آپ کے پراجیکٹس کی صورتحال بتا سکتا ہوں — بغیر کسی سرور کے۔\n\nLive Gemini جواب اور قریبی پلانٹس/سپلائرز کی تلاش کے لیے اوپر Key بٹن سے اپنی مفت Gemini API key شامل کریں۔`
            : `Hello! I am the **Al Asad Site Intelligence AI** (Offline Site Engine).\n\nRight now I can calculate concrete & steel quantities, formwork stripping times, curing, safety checklists and your project status — with no server needed.\n\nFor live Gemini answers and nearby plant/supplier lookup, add your free Gemini API key with the Key button above.`),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'granted' | 'denied'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-detect user location if available
      detectLocation();
      if (initialPrompt && initialPrompt.trim() !== '') {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('granted');
      },
      (err) => {
        console.warn('Geolocation access denied or unavailable:', err);
        // Fallback default: Karachi, Sindh, Pakistan coordinates for Al Asad core HQ
        setUserLocation({ latitude: 24.8607, longitude: 67.0011 });
        setLocationStatus('granted');
      },
      { timeout: 8000 }
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectContext = activeProject
    ? `Active Project: ${activeProject.name} (${activeProject.location}), Phase: ${activeProject.currentPhase}, Budget: ${activeProject.budget} PKR, Spent: ${activeProject.spent} PKR`
    : `Multiple active sites across Karachi, Sindh, Pakistan. Total portfolio: ${projects.length} civil construction projects.`;

  // ------------------------------------------------------------------
  // Built-in Offline Site Engine
  // Answers from the app's own project data + standard civil
  // engineering figures. No network, no key, no invented places.
  // ------------------------------------------------------------------
  const buildOfflineAnswer = (rawPrompt: string): string => {
    const q = rawPrompt.toLowerCase();
    const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
    const pickNum = (re: RegExp): number | null => {
      const m = q.match(re);
      return m ? parseFloat(m[1].replace(/,/g, '')) : null;
    };

    // Greetings
    if (/\b(hi|hello|hey|salam|salaam|aoa|good\s(morning|afternoon|evening))\b/.test(q) || q.trim() === 'hi') {
      const projLine = activeProject
        ? `\n\n**Active project:** ${activeProject.name} — ${activeProject.location} (${activeProject.currentPhase}, budget PKR ${fmt(activeProject.budget)}, spent PKR ${fmt(activeProject.spent)}).`
        : '';
      return language === 'ur'
        ? `وعلیکم السلام! میں **الاسد سائٹ انٹیلیجنس اے آئی** ہوں۔ میں آپ کی مدد کر سکتا ہوں:\n\n• **کنکریٹ کا حساب** — مثال: "2000 sq ft slab 6 inch 1:2:4"\n• **سریا (Steel)** — وزن فی میٹر، ٹنیج، لیپ لینتھ\n• **شٹرنگ/کیورنگ** — سٹرپنگ کے اوقات، کیورنگ کی مدت\n• **پراجیکٹس** — "projects" لکھیں، تمام سائٹس کی فہرست ملے گی\n• **سیفٹی** — PPE اور سائٹ سیفٹی چیک لسٹ${projLine}`
        : `Hello! I am the **Al Asad Site Intelligence AI**. I can help you with:\n\n• **Concrete estimate** — try: "2000 sq ft slab 6 inch 1:2:4"\n• **Steel (rebar)** — weight per metre, tonnage, lap length\n• **Formwork / curing** — stripping times, curing duration\n• **Projects** — type "projects" for the full site list\n• **Safety** — PPE and site safety checklist${projLine}`;
    }

    // Project list / status (real data only)
    if (/\b(project|projects|site|sites|portfolio)\b/.test(q)) {
      const lines = projects.map((p, i) => {
        const pct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
        return `${i + 1}. **${p.name}**\n   ${p.location} — ${p.currentPhase}, ${p.status}, budget PKR ${fmt(p.budget)}, spent PKR ${fmt(p.spent)} (${pct}% used)`;
      });
      return `**Al Asad Constructors — ${projects.length} projects:**\n\n${lines.join('\n\n')}\n\nType a project name for its budget, or open the **Map** tab above to see the site on Google Maps.`;
    }

    // Active project budget
    if (/\b(budget|spent|kharcha|cost)\b/.test(q) && activeProject) {
      const pct = activeProject.budget > 0 ? Math.round((activeProject.spent / activeProject.budget) * 100) : 0;
      return `**${activeProject.name}** (${activeProject.location})\n\n• Phase: ${activeProject.currentPhase}\n• Status: ${activeProject.status}\n• Budget: PKR ${fmt(activeProject.budget)}\n• Spent: PKR ${fmt(activeProject.spent)} (${pct}% used)\n• Balance: PKR ${fmt(activeProject.budget - activeProject.spent)}\n\nFull breakdown is on the Executive Overview / Accounts tabs.`;
    }

    // Concrete estimate — parse area + thickness + mix
    if (/\b(concrete|slab|mix|cement|1\s*:\s*2\s*:\s*4|1\s*:\s*1\.5\s*:\s*3)\b/.test(q)) {
      const area = pickNum(/([\d,]+(?:\.\d+)?)\s*(sq\s*ft|sqft|square\s*feet|ft2|ft²)/);
      const thickIn = pickNum(/([\d,]+(?:\.\d+)?)\s*(inch|inches|in\b|")/);
      const mixM = q.match(/1\s*:\s*([\d.]+)\s*:\s*([\d.]+)/);
      const mix = mixM ? [1, parseFloat(mixM[1]), parseFloat(mixM[2])] : [1, 2, 4];
      const totalParts = mix[0] + mix[1] + mix[2];

      if (area && thickIn) {
        const wetCft = (area * thickIn) / 12;
        const dryCft = wetCft * 1.54;
        const cementCft = dryCft * (mix[0] / totalParts);
        const sandCft = dryCft * (mix[1] / totalParts);
        const aggCft = dryCft * (mix[2] / totalParts);
        const bags = cementCft / 1.25; // 1 bag = 1.25 cft
        const wetM3 = wetCft * 0.0283168;
        const steelKg = wetM3 * 110; // slab ~100–120 kg/m3
        const waterL = bags * 50 * 0.5; // w/c 0.50
        return `**Concrete estimate — ${fmt(area)} sq ft, ${thickIn}" thick, mix 1:${mix[1]}:${mix[2]}**\n\n• Wet volume: **${fmt(wetCft)} cft** (${fmt(wetM3)} m³)\n• Dry volume (×1.54): ${fmt(dryCft)} cft\n• **Cement: ${fmt(Math.ceil(bags))} bags (50 kg)**\n• **Sand: ${fmt(sandCft)} cft**\n• **Crush (aggregate): ${fmt(aggCft)} cft**\n• **Steel (est. @110 kg/m³): ${fmt(steelKg / 1000)} tonnes**\n• Water (w/c 0.50): ~${fmt(waterL)} litres\n\nStandard estimate — confirm with the approved mix design before ordering.`;
      }

      return `**Concrete mix proportions (per 1 m³)**\n\n• **1:2:4** — Cement 6.5 bags, Sand 0.44 m³, Crush 0.88 m³\n• **1:1.5:3** — Cement 8 bags, Sand 0.42 m³, Crush 0.84 m³\n• **1:1:2** — Cement 10.5 bags, Sand 0.37 m³, Crush 0.74 m³\n\nFor an exact estimate send area + thickness, e.g. "2000 sq ft slab 6 inch 1:2:4". Water–cement ratio 0.45–0.50 for normal RCC work.`;
    }

    // Steel / rebar
    if (/\b(steel|rebar|sariya|tonnage|grade\s*60)\b/.test(q)) {
      return `**Steel reinforcement — ASTM A615 Grade 60 (420 MPa)**\n\nWeight per metre (d²/162):\n• 10 mm — 0.62 kg/m\n• 12 mm — 0.89 kg/m\n• 16 mm — 1.58 kg/m\n• 20 mm — 2.47 kg/m\n• 25 mm — 3.85 kg/m\n\n• Lap length (tension): **50 × bar diameter**\n• Slab steel: ~100–120 kg per m³ of concrete\n• Beam/column: ~150–200 kg per m³\n\nAlways check mill test certificates and rib pattern before accepting delivery. Live supplier locations need the Gemini key (Key button above).`;
    }

    // Formwork stripping
    if (/\b(formwork|shuttering|stripping|de-shutter|deshutter)\b/.test(q)) {
      return `**Formwork stripping times (normal conditions)**\n\n• Columns & walls (vertical): **16–24 hours**\n• Slab soffit (props remain): **7 days**\n• Beam soffit: **7 days**\n• Cantilever slabs: **14 days**\n• Props under slabs: **7–14 days** (longer spans need 21 days)\n\nStrip only after cube strength reaches the specified value, and follow the project specification / PBC — these are standard practice times.`;
    }

    // Curing
    if (/\b(cur(e|ing)|curing)\b/.test(q)) {
      return `**Curing**\n\n• Minimum: **7 days** water curing for OPC concrete\n• Recommended for slabs: **10–14 days**\n• Keep the surface continuously moist (ponding, wet hessian or curing compound)\n• Hot weather: start curing as soon as the surface can take water without damage\n\nProper curing is the cheapest way to reach design strength.`;
    }

    // Honeycombing / cracks
    if (/\b(honeycomb|crack|defect|leak)\b/.test(q)) {
      return `**Honeycombing & cracks — quick guide**\n\n• **Honeycombing:** poor compaction / stiff mix / leaking formwork → chip out loose concrete, clean, and repair with non-shrink grout or epoxy mortar.\n• **Shrinkage cracks:** rapid drying — improve curing, use control joints.\n• **Cold joints:** pour delay — roughen the surface, apply bonding agent before the next pour.\n\nReport any structural crack (wide, through-slab, or growing) to the site engineer before repair.`;
    }

    // Safety
    if (/\b(safety|ppe|osha|helmet|hazard)\b/.test(q)) {
      return `**Site safety checklist**\n\n• PPE: helmet, safety shoes, gloves, hi-vis vest — eye protection for cutting/grinding\n• Scaffolding: guardrails, toe boards, daily inspection\n• Excavation: shoring for depth over 1.5 m, barricades, no spoil at the edge\n• Electrical: no bare wires, ELCB on site supply\n• Lifting: certified slings, no one under a suspended load\n\nLog incidents in the Daily Log Tracker the same day.`;
    }

    // Nearby plants / suppliers — live data needs the key; be honest
    if (/\b(ready.?mix|rmc|batching|plant|supplier|quarry|nearby|nearest|locate|find)\b/.test(q)) {
      return `**Nearby plants & suppliers**\n\nLive place search (Google Maps Grounding) needs the Gemini API key — add it with the **Key** button above and I will list real batching plants, cement warehouses and quarries with Maps links.\n\nMeanwhile, when choosing an RMC plant, check:\n• Transit time under **90 minutes** from batching to pour\n• Slump at site matches the mix design\n• Cube test results for the last 3 pours\n• Batching plant calibration certificate\n\nProject sites are on the **Map** tab above.`;
    }

    // Default — capabilities
    return `I can help with (offline engine):\n\n• **"Hi"** — greeting + active project summary\n• **"2000 sq ft slab 6 inch 1:2:4"** — cement bags, sand, crush, steel\n• **"steel"** — rebar weight table & lap length\n• **"formwork"** — stripping times\n• **"curing" / "safety" / "honeycomb"** — site guides\n• **"projects"** — all Al Asad sites with budget & phase\n\nFor live Gemini answers and nearby places, add your free Gemini API key (Key button above).`;
  };

  // ------------------------------------------------------------------
  // Live Gemini (direct browser call — no backend needed)
  // Same model + Maps grounding as the old server endpoint.
  // ------------------------------------------------------------------
  const callGemini = async (
    history: Array<{ role: string; content: string }>,
    key: string
  ): Promise<{ text: string; groundingChunks: ChatMessage['groundingChunks']; webSearchQueries: string[] }> => {
    const systemInstruction = `You are "Al Asad Site Intelligence AI", the chief digital civil engineer and geospatial logistics copilot for "Al Asad Constructors".

Your core duties:
1. Construction Engineering & Site Technical Calculations: concrete mix proportions (1:2:4 Nominal, 1:1.5:3 RCC, C20, C25, C30, C35 pump mixes), water-cement ratio, slump test interpretation, cube compressive strength; steel reinforcement estimation (tonnage, cut-and-bend schedules, lap lengths for deformed rebar ASTM A615 Grade 60); brickwork, plastering, waterproofing membranes, thermal insulation, shuttering stripping periods, curing duration.
2. Geospatial Site Logistics & Google Maps Grounding: accurately locate nearby Ready-Mix Concrete (RMC) batching plants, cement distribution warehouses, sand sources, crush aggregate quarries, steel rerolling mills, and heavy machinery rentals in Karachi, Lahore, Islamabad, Rawalpindi, Peshawar and across Pakistan.
3. Quality & Snag Management: defect troubleshooting (honeycombing, cold joints, shrinkage cracks, efflorescence, level discrepancies); OSHA & Pakistan Building Code (PBC) safety checklist, PPE compliance, scaffold safety.
4. Current Active Project Context: ${projectContext}.

Formatting & Tone: authoritative, polite, clear civil engineering guidance. Use crisp Markdown with bullet points, numbered calculation steps, and bold key terms. Use bilingual engineering terminology where natural (e.g. Concrete / کنکریٹ, Steel / سریا, Formwork / شٹرنگ).`;

    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      tools: [{ googleMaps: {} }],
    };
    if (userLocation) {
      body.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude },
        },
      };
    }

    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `Gemini responded with status ${res.status}`);
    }
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter((p: any) => typeof p?.text === 'string')
      .map((p: any) => p.text)
      .join('\n')
      .trim();
    const gm = data?.candidates?.[0]?.groundingMetadata || {};
    return {
      text,
      groundingChunks: gm.groundingChunks || [],
      webSearchQueries: gm.webSearchQueries || [],
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || inputValue).trim();
    if (!promptText || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation payload
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let botText = '';
      let groundingChunks: ChatMessage['groundingChunks'] = [];
      let webSearchQueries: string[] = [];
      let geminiNote = '';

      if (apiKey) {
        try {
          const r = await callGemini(payloadMessages, apiKey);
          botText = r.text || '';
          groundingChunks = r.groundingChunks;
          webSearchQueries = r.webSearchQueries;
        } catch (gErr: any) {
          geminiNote = `⚠️ Live Gemini jawab nahi de saka (${String(gErr?.message || 'error').slice(0, 120)}). Neeche Offline Site Engine se jawab hai — key check karein ya thodi der baad dobara koshish karein.`;
        }
      }

      if (!botText) {
        botText = buildOfflineAnswer(promptText);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: geminiNote ? `${geminiNote}\n\n${botText}` : botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: groundingChunks || [],
        webSearchQueries: webSearchQueries || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ur'
          ? `معذرت! پیغام بھیجتے وقت مسئلہ پیش آیا: ${err.message || 'کنکشن کی خرابی'}. دوبارہ کوشش کریں۔`
          : `Sorry, something went wrong while sending: ${err.message || 'connection error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = () => {
    const key = keyInput.trim();
    if (!key) {
      setKeyNotice('Please paste a key first.');
      return;
    }
    try {
      localStorage.setItem(GEMINI_KEY_STORAGE, key);
    } catch {
      setKeyNotice('Could not save the key on this device.');
      return;
    }
    setApiKey(key);
    setKeyInput('');
    setKeyNotice('Key saved on this device. Live Gemini is now active.');
  };

  const clearApiKey = () => {
    try {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setApiKey('');
    setKeyInput('');
    setKeyNotice('Key removed. Offline Site Engine is active.');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: language === 'ur'
          ? 'گفتگو ری سیٹ کر دی گئی۔ آپ نیا سوال پوچھ سکتے ہیں!'
          : 'Conversation cleared. How can I assist your construction engineering team today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const samplePrompts = [
    {
      title: language === 'ur' ? 'قریبی ریڈی مکس کنکریٹ پلانٹس' : 'Nearest Ready-Mix Concrete',
      icon: MapPin,
      prompt: 'Find nearest Ready-Mix Concrete (RMC) batching plants in Karachi, Sindh with contact info and coordinates.',
    },
    {
      title: language === 'ur' ? 'سلیب 1:2:4 میٹریل حساب' : '1:2:4 Slab Concrete Estimate',
      icon: Calculator,
      prompt: 'Calculate exact cement bags, Chenab sand (cu ft), Margalla crush (cu ft), and Grade 60 steel tonnage for a 2,000 sq ft RCC roof slab (6 inch thick, 1:2:4 mix).',
    },
    {
      title: language === 'ur' ? 'سٹیل سریا مارکیٹ اور ملز' : 'Steel Rebar Suppliers',
      icon: Building2,
      prompt: 'Locate certified ASTM A615 Grade 60 deformed steel rebar distributors and rolling mills near Karachi, Sindh with Google Maps locations.',
    },
    {
      title: language === 'ur' ? 'شٹرنگ اور ڈی شٹرنگ چیک لسٹ' : 'Formwork Stripping Checklist',
      icon: HardHat,
      prompt: 'Provide official civil engineering standard stripping times for columns, beam soffits, and cantilever slabs with daily inspection checklist.',
    },
  ];

  // Map view — real project sites only (location text from project records).
  // Projects carry no coordinates, so the map is driven by the recorded
  // location string via Google Maps embed — no invented coordinates.
  const mapProject = projects.find(p => p.id === mapProjectId) || activeProject || projects[0];
  const mapQuery = mapProject ? mapProject.location : 'Karachi, Sindh, Pakistan';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-slate-950 border border-blue-600/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-full h-[92dvh] max-h-[900px] sm:h-[92vh] max-w-5xl'
            : 'w-full h-[78dvh] max-h-[680px] sm:h-[82vh] sm:max-h-[780px] max-w-3xl'
        }`}
      >
        {/* Top Header - Al Asad Royal Blue & Emerald Branding */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-slate-950 via-blue-950/80 to-slate-950 border-b border-blue-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Al Asad"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-wide truncate">
                  {language === 'ur' ? 'الاسد سائٹ انٹیلیجنس اے آئی' : 'Al Asad Site Intelligence AI'}
                </h3>
                {apiKey ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                    Gemini 3.8 Flash
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5 text-slate-300" />
                    Offline Engine
                  </span>
                )}
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  Maps Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="truncate">Civil Engineering & Geospatial Assistant</span>
                <span className="text-slate-600 shrink-0">•</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
                  <LocateFixed className="w-3 h-3" />
                  {userLocation ? 'GPS Site Grounding Active' : 'Locating Site...'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setView(view === 'chat' ? 'map' : 'chat')}
              className={`p-2 rounded-lg transition-colors ${view === 'map' ? 'text-emerald-300 bg-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              title={view === 'map' ? 'Back to chat' : 'Show site map'}
            >
              {view === 'map' ? <MessageSquare className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowKeyRow(!showKeyRow)}
              className={`p-2 rounded-lg transition-colors ${apiKey ? 'text-emerald-300' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              title={apiKey ? 'Gemini API key saved — tap to change' : 'Add Gemini API key for live AI'}
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors hidden sm:block"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API key row — key lives only on this device, never in the repo */}
        {showKeyRow && (
          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={apiKey ? 'Key saved — paste a new key to replace it' : 'Paste your Gemini API key here'}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={saveApiKey}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shrink-0"
              >
                Save
              </button>
              {apiKey && (
                <button
                  onClick={clearApiKey}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {apiKey
                ? 'Live Gemini is active on this device. '
                : 'No key saved — the Offline Site Engine answers. '}
              Free key: <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google AI Studio</a> → Get API key. The key is stored only in this browser and is never uploaded.
            </p>
            {keyNotice && <p className="text-[11px] text-emerald-400 mt-1">{keyNotice}</p>}
          </div>
        )}

        {view === 'chat' ? (
          <>
            {/* Quick Suggestion Pills */}
            <div className="px-4 py-2.5 sm:px-5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Quick Prompts:
              </span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-blue-900/40 hover:text-blue-300 hover:border-blue-500/40 border border-slate-700/60 transition-all whitespace-nowrap cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <p.icon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>

            {/* Conversation Thread - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-900/30 mt-1">
                        <HardHat className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-lg ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10 text-[11px] opacity-75 font-mono">
                        <span className="font-semibold">
                          {isUser ? (language === 'ur' ? 'آپ' : 'Site Engineer') : 'Al Asad AI Engine'}
                        </span>
                        <span className="text-[10px]">{m.timestamp}</span>
                      </div>

                      {/* Message Body with Markdown formatting */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap select-text font-sans break-words">
                        {m.content}
                      </div>

                      {/* Maps Grounding Links & Review Snippets */}
                      {m.groundingChunks && m.groundingChunks.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-800 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Google Maps Verified Places & Sources:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {m.groundingChunks.map((chunk, idx) => {
                              const mapItem = chunk.maps;
                              const webItem = chunk.web;
                              const targetUri = mapItem?.uri || webItem?.uri;
                              const title = mapItem?.title || webItem?.title || `Location Source #${idx + 1}`;
                              const snippet = mapItem?.placeAnswerSources?.reviewSnippets?.[0]?.reviewText;

                              if (!targetUri) return null;

                              return (
                                <a
                                  key={idx}
                                  href={targetUri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex flex-col p-2.5 rounded-xl bg-slate-950/80 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-500/50 transition-all text-xs"
                                >
                                  <div className="flex items-center justify-between gap-2 font-medium text-blue-300 group-hover:text-blue-200">
                                    <span className="truncate flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span className="truncate">{title}</span>
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-300 shrink-0" />
                                  </div>
                                  {snippet && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                                      "{snippet}"
                                    </p>
                                  )}
                                  <span className="text-[10px] text-slate-500 mt-1 truncate">
                                    {targetUri}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Copy Button */}
                      <div className="mt-2.5 pt-1 flex justify-end">
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800/80 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 text-xs font-bold text-slate-300">
                        SE
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-700/80 flex items-center justify-center shrink-0 animate-pulse">
                    <HardHat className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>Al Asad Site Intelligence is querying civil engineering models & Google Maps...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    placeholder={
                      language === 'ur'
                        ? 'سول انجینئرنگ حساب، سائٹ نقشہ یا میٹریل کے متعلق پوچھیں...'
                        : 'Ask about concrete mix, steel tonnage, nearby quarries, or batching plants...'
                    }
                    className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="h-11 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <span>{language === 'ur' ? 'ارسال' : 'Send'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                <span>{apiKey ? 'Powered by Gemini 3.8 Flash & Google Maps Grounding' : 'Offline Site Engine • Live Gemini ke liye API key add karein'}</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Al Asad Constructors Civil Intelligence
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Site Map view — real project locations from app data */}
            <div className="px-4 py-2.5 sm:px-5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
                <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                Project Sites:
              </span>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setMapProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    mapProject && p.id === mapProject.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700/60'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 bg-slate-900">
              <iframe
                key={mapQuery}
                title={`Map — ${mapProject ? mapProject.name : 'Al Asad site'}`}
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
              {mapProject && (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{mapProject.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{mapProject.location}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {mapProject.currentPhase} • {mapProject.status} • Budget PKR {mapProject.budget.toLocaleString('en-US')} • Spent PKR {mapProject.spent.toLocaleString('en-US')}
                    </p>
                  </div>
                  <a
                    href={mapOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    Open in Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              <p className="text-[11px] text-slate-500 mt-2">
                Map Google Maps se hai; site ki location project record se li gayi hai (koi coordinate invent nahi kiya gaya).
                {userLocation ? ` GPS: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}.` : ''}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
