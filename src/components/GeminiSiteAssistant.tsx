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
  LocateFixed
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

export const GeminiSiteAssistant: React.FC<GeminiSiteAssistantProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const { language, activeProjectId, projects } = useProject();
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: language === 'ur'
          ? `السلام علیکم! میں **الاسد سائٹ انٹیلیجنس اے آئی** ہوں۔ میں سول انجینئرنگ کیلکولیشنز، میٹریل ایسٹیمیشن، سائٹ سیفٹی اور گوگل میپس گراؤنڈنگ (Google Maps Grounding) کے ذریعے قریبی سیمنٹ، سریا، ریت کے پلانٹس اور کواریاں تلاش کرنے میں آپ کی مدد کر سکتا ہوں۔`
          : `Hello! I am the **Al Asad Site Intelligence AI**, powered by Gemini 3.8 Flash with Google Maps Grounding.\n\nI can assist you with real-time civil engineering calculations, batching plant coordinates, ASTM/PBC standards, material supply logistics, and site safety audits across all Al Asad Constructors project sites.`,
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
      // Build conversation payload for backend server
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          userLocation: userLocation,
          projectContext: projectContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'Received empty response from Gemini.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks || [],
        webSearchQueries: data.webSearchQueries || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const isQuota = String(err.message).includes('429') || String(err.message).includes('RESOURCE_EXHAUSTED');
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isQuota
          ? (language === 'ur'
              ? '⚠️ **اے پی آئی کوٹہ کی حد (Quota Limit Exceeded)**: جیمنائی ماڈل کے لیے درخواستوں کا کوٹہ عارضی طور پر مکمل ہو گیا ہے۔ براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں یا Settings > Secrets میں بلنگ فعال کلید (Paid API Key) منتخب کریں۔'
              : '⚠️ **API Quota Limit Reached (429)**: The Gemini API request quota has been temporarily exhausted. Please wait a moment before trying again or ensure a billing-enabled API key is selected in Settings > Secrets.')
          : (language === 'ur'
              ? `معذرت! پیغام بھیجتے وقت مسئلہ پیش آیا: ${err.message || 'کنکشن کی خرابی'}. براہ کرم یقینی بنائیں کہ GEMINI_API_KEY سیٹنگز میں درست ہے۔`
              : `Error communicating with Gemini Site Intelligence: ${err.message || 'Network error'}.`),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`bg-slate-950 border border-blue-600/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? 'w-full h-[95vh] max-w-6xl' 
            : 'w-full h-[88vh] max-w-4xl'
        }`}
      >
        {/* Top Header - Al Asad Royal Blue & Emerald Branding */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-blue-950/80 to-slate-950 border-b border-blue-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="Al Asad" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {language === 'ur' ? 'الاسد سائٹ انٹیلیجنس اے آئی' : 'Al Asad Site Intelligence AI'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  Gemini 3.8 Flash
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  Maps Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Civil Engineering & Geospatial Assistant</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <LocateFixed className="w-3 h-3" />
                  {userLocation ? 'GPS Site Grounding Active' : 'Locating Site...'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
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
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
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
            <span>Powered by Gemini 3.8 Flash & Google Maps Grounding</span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Al Asad Constructors Civil Intelligence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
