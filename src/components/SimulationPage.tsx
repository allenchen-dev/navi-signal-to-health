import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  RefreshCcw,
  ChevronRight,
  Baby,
  ShieldAlert,
  ClipboardCheck,
  MapPin,
  Send,
  Loader2,
  Hospital,
  ShieldCheck,
  Info,
  Settings,
  BookOpen,
  History
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const V_STEPS = Array.from({ length: 100 }, (_, i) => -1.0 + (i * 0.01));

const PEAK_MAP = {
  "No Lead Detected": 1.2,
  "Moderate Level": 8.5,
  "High Level (Toxic)": 25.0,
  "Critical Level": 50.0
};

type DemoCase = keyof typeof PEAK_MAP;

export const SimulationPage: React.FC = () => {
  const [demoCase, setDemoCase] = useState<DemoCase>("Moderate Level");
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<{ potential: number, current: number }[]>([]);
  const [scanIndex, setScanIndex] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [peakVal, setPeakVal] = useState(0);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [scanHistory, setScanHistory] = useState<{ timestamp: string, mode: string, peak: number }[]>([]);
  
  // AI Advisor State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('scan_history') || '[]');
    setScanHistory(savedHistory);
  }, []);

  const getStatus = (val: number) => {
    if (val > 45) return { label: "CRITICAL (EMERGENCY)", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50" };
    if (val > 10) return { label: "HIGH EXPOSURE", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/50" };
    if (val > 3.5) return { label: "ELEVATED", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/50" };
    return { label: "LOW/SAFE", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50" };
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError(false);
        },
        () => {
          setLocationError(true);
        }
      );
    } else {
      setLocationError(true);
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanDone(false);
    setScanData([]);
    setScanIndex(0);
    setPeakVal(0);
  };

  const onScanComplete = (finalData: { potential: number, current: number }[]) => {
    const maxPeak = Math.max(...finalData.map(d => d.current));
    setPeakVal(maxPeak);
    
    const newEntry = {
      timestamp: new Date().toLocaleTimeString(),
      mode: demoCase,
      peak: maxPeak
    };
    const updatedHistory = [newEntry, ...scanHistory].slice(0, 5);
    setScanHistory(updatedHistory);
    localStorage.setItem('scan_history', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    if (isScanning && scanIndex < V_STEPS.length) {
      const timer = setTimeout(() => {
        const v = V_STEPS[scanIndex];
        const targetPeak = PEAK_MAP[demoCase];
        const noise = (Math.random() * 0.4) - 0.2;
        const spike = Math.abs(v - (-0.45)) < 0.05 ? (targetPeak + (Math.random() * 2 - 1)) : 0;
        const current = noise + spike;

        const newDataPoint = { potential: parseFloat(v.toFixed(2)), current: parseFloat(current.toFixed(2)) };
        setScanData(prev => [...prev, newDataPoint]);
        setScanIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timer);
    } else if (isScanning && scanIndex >= V_STEPS.length) {
      setIsScanning(false);
      setScanDone(true);
      onScanComplete(scanData);
    }
  }, [isScanning, scanIndex, demoCase, scanData]);

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const prompt = customPrompt || input;
    if (!prompt.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const status = getStatus(peakVal).label;
      const context = `User scanned water. Result: ${peakVal.toFixed(2)}uA. Status: ${status}. Location: ${location ? `${location.lat}, ${location.lon}` : 'Unknown'}.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `System: ${context}\nUser: ${prompt}`,
      });

      setMessages([...newMessages, { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: 'assistant', content: "Error connecting to AI advisor. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveToMap = () => {
    if (!location) return;
    const pin = {
      lat: location.lat,
      lon: location.lon,
      lead_ppb: peakVal * 2.5,
      timestamp: new Date().toISOString(),
      status: getStatus(peakVal).label
    };
    const existing = JSON.parse(localStorage.getItem('detected_leads') || '[]');
    localStorage.setItem('detected_leads', JSON.stringify([...existing, pin]));
    alert("Pinned! Dashboard updated for health officials.");
  };

  const statusInfo = getStatus(peakVal);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-slate-800 p-6 flex flex-col gap-8 bg-background-dark/50 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-100">Project Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Simulation Scenarios</label>
              <select 
                value={demoCase}
                onChange={(e) => setDemoCase(e.target.value as DemoCase)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-primary outline-none"
              >
                {Object.keys(PEAK_MAP).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Past Test Runs</h4>
              </div>
              {scanHistory.length === 0 ? (
                <p className="text-[10px] text-slate-600 italic">No history found.</p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((run, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900/50 border border-slate-800 text-[10px]">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{run.timestamp}</span>
                        <span className="font-bold text-primary">{run.peak.toFixed(1)} µA</span>
                      </div>
                      <div className="text-slate-500 truncate">{run.mode}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-slate-200">Blood Lead Level (BLL) Guide</h4>
              </div>
              <p className="text-[10px] text-slate-500 mb-4">Based on CDC Reference Values</p>
              <ul className="space-y-3">
                <li className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-green-500">Low (&lt; 3.5 µg/dL):</span> Normal range; no safe level exists.
                </li>
                <li className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-yellow-500">Elevated (3.5–10 µg/dL):</span> CDC Action Level. Investigation required.
                </li>
                <li className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-orange-500">High (10–45 µg/dL):</span> Significant exposure. Medical monitoring needed.
                </li>
                <li className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-red-500">Critical (&gt; 45 µg/dL):</span> <span className="font-black">Medical Emergency.</span> Requires Chelation Therapy.
                </li>
              </ul>
            </div>

            <button 
              onClick={() => {
                setScanDone(false);
                setScanData([]);
                setMessages([]);
                setPeakVal(0);
                localStorage.removeItem('scan_history');
                setScanHistory([]);
              }}
              className="w-full py-2 border border-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset App Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col gap-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-black tracking-tight">Signal-to-Health: Lead Detector</h1>
            </div>
            <p className="text-slate-500">Translating electrochemical signals into actionable health data.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!location ? (
              <button 
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-xs font-bold hover:bg-yellow-500/20 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Get Location
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Location Active: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </div>
            )}
          </div>
        </header>

        {!location && !locationError && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-500 mb-2">Action Required: Enable Location</h2>
              <p className="text-slate-400 max-w-md mx-auto">To unlock <span className="text-slate-200 font-bold">Hospital Search</span> and <span className="text-slate-200 font-bold">Hot Zone Mapping</span>, please click the button above and allow location access.</p>
            </div>
          </div>
        )}

        {/* Graph Section */}
        <div className="glass-effect rounded-2xl p-8 flex flex-col gap-6 relative min-h-[400px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Potential (Voltage)</span>
                <span className="text-2xl font-mono font-bold">{scanData.length > 0 ? scanData[scanData.length - 1].potential.toFixed(2) : '-1.00'}V</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current (µA)</span>
                <span className="text-2xl font-mono font-bold text-primary">{scanData.length > 0 ? scanData[scanData.length - 1].current.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            
            {!isScanning && !scanDone && (
              <button 
                onClick={startScan}
                className="px-8 py-3 bg-primary text-background-dark font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                START NEW WATER SCAN
              </button>
            )}
          </div>

          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0db9f2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0db9f2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis 
                  dataKey="potential" 
                  type="number" 
                  domain={[-1.0, 0]} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Potential (Voltage)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Current (µA)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background-dark border border-primary/30 p-2 rounded shadow-xl">
                          <p className="text-[10px] font-mono text-primary">V: {payload[0].payload.potential}V</p>
                          <p className="text-[10px] font-mono text-slate-300">I: {payload[0].value}µA</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#0db9f2" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {scanDone && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className={`p-8 rounded-2xl border ${statusInfo.border} ${statusInfo.bg} flex flex-col gap-6`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Analysis Result</h3>
                    <p className={`text-3xl font-black ${statusInfo.color}`}>{statusInfo.label}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Peak Current (Ipeak)</h3>
                    <p className="text-3xl font-mono font-bold text-slate-100">{peakVal.toFixed(2)} <span className="text-sm font-normal text-slate-500">µA</span></p>
                  </div>
                </div>

                {peakVal > 3.5 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-700/30">
                    <button 
                      onClick={() => handleSendMessage(undefined, "What are the immediate precautions I should take for this lead level?")}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                    >
                      <ShieldAlert className="w-4 h-4 text-yellow-500" />
                      Immediate Precautions
                    </button>
                    <button 
                      onClick={() => handleSendMessage(undefined, "Find the nearest hospitals capable of lead poisoning treatment.")}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                    >
                      <Hospital className="w-4 h-4 text-primary" />
                      Find Nearest Hospital
                    </button>
                  </div>
                )}

                {location && (
                  <button 
                    onClick={saveToMap}
                    className="w-full py-4 bg-primary/10 border border-primary/30 rounded-xl text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Save to Public Health Map
                  </button>
                )}
              </div>

              {/* AI Advisor Chat */}
              <div className="glass-effect rounded-2xl flex flex-col h-[500px] overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-primary/5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Health Advisor</h3>
                    <p className="text-[10px] text-slate-500">Powered by Gemini AI</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                      <Info className="w-8 h-8 mb-4" />
                      <p className="text-sm">Ask about your results, health impacts, or next steps.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-background-dark font-medium' : 'bg-slate-800 text-slate-200'}`}>
                        <div className="markdown-body">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 p-3 rounded-2xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-slate-400">Analyzing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 flex gap-2">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your results..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="p-2 bg-primary text-background-dark rounded-xl disabled:opacity-50 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
