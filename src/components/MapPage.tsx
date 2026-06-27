import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Layers, 
  Maximize2, 
  Search, 
  Filter, 
  Activity, 
  AlertCircle, 
  Info,
  ChevronRight,
  Droplets,
  ShieldAlert,
  Trash2
} from 'lucide-react';

interface SavedPin {
  lat: number;
  lon: number;
  lead_ppb: number;
  timestamp: string;
  status: string;
}

export const MapPage: React.FC = () => {
  const [pins, setPins] = useState<SavedPin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('detected_leads') || '[]');
    setPins(saved);
  }, []);

  const clearData = () => {
    if (confirm("Are you sure you want to clear all detection data?")) {
      localStorage.removeItem('detected_leads');
      setPins([]);
    }
  };

  const highestLead = pins.length > 0 ? Math.max(...pins.map(p => p.lead_ppb)) : 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden pt-20">
      {/* Sidebar: Map Controls */}
      <aside className="w-full md:w-80 border-r border-slate-800 p-6 flex flex-col gap-8 bg-background-dark/50 overflow-y-auto">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">MAPPING CONTROLS</h3>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                placeholder="ZIP_CODE_OR_CITY"
              />
            </div>
            <button className="w-full flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors text-[10px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>LAYER: CONTAMINATION</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">DATA OVERVIEW</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Detections</span>
              <span className="text-xl font-mono font-bold text-primary">{pins.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Highest Lead Level</span>
              <span className="text-xl font-mono font-bold text-red-500">{highestLead.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">ppb</span></span>
            </div>
            <button 
              onClick={clearData}
              className="w-full flex items-center justify-center gap-2 p-2 rounded border border-red-500/20 text-red-500/70 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">HOT ZONE LEGEND</h3>
          <div className="space-y-3">
            {[
              { label: 'CRITICAL (>15 µg/dL)', color: 'bg-red-500' },
              { label: 'HIGH (5-15 µg/dL)', color: 'bg-orange-500' },
              { label: 'ELEVATED (3.5-5 µg/dL)', color: 'bg-yellow-500' },
              { label: 'SAFE (<3.5 µg/dL)', color: 'bg-green-500' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`}></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Map View */}
      <section className="flex-1 relative bg-slate-900 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 grayscale opacity-40 contrast-125">
          <img 
            src="https://picsum.photos/seed/detroit-map/1920/1080?blur=2" 
            alt="Detroit Map" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Map Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {pins.map((pin, i) => (
            <motion.div 
              key={i}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ 
                left: `${((pin.lon + 180) / 360) * 100}%`, 
                top: `${((90 - pin.lat) / 180) * 100}%` 
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: i * 0.05 }}
            >
              <div className="relative group">
                <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${pin.lead_ppb > 45 ? 'bg-red-500' : pin.lead_ppb > 10 ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                <MapPin className={`w-6 h-6 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] ${pin.lead_ppb > 45 ? 'text-red-500' : pin.lead_ppb > 10 ? 'text-orange-500' : 'text-yellow-500'}`} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 glass-effect p-3 rounded-xl border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className={`text-[10px] font-bold uppercase mb-1 ${pin.lead_ppb > 45 ? 'text-red-500' : 'text-primary'}`}>{pin.status}</p>
                  <p className="text-xs font-bold font-mono">LAT: {pin.lat.toFixed(4)}</p>
                  <p className="text-xs font-bold font-mono">LON: {pin.lon.toFixed(4)}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase">Lead Level:</span>
                    <span className="text-xs font-bold font-mono">{pin.lead_ppb.toFixed(1)} ppb</span>
                  </div>
                  <p className="text-[8px] text-slate-600 mt-1">{new Date(pin.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map Controls Floating */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <button className="p-3 bg-background-dark/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-primary transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-background-dark/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-primary transition-colors">
            <Layers className="w-5 h-5" />
          </button>
          <div className="h-px w-full bg-slate-700 my-1"></div>
          <button className="p-3 bg-background-dark/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-primary transition-colors">
            <AlertCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row gap-4">
          <div className="glass-effect p-4 rounded-xl flex-1 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Public Health Surveillance</p>
              <p className="text-lg font-bold">Regional Lead Contamination Map</p>
            </div>
            <div className="ml-auto hidden lg:flex gap-8">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Avg Toxicity</p>
                <p className="text-sm font-bold text-yellow-500">{(pins.reduce((acc, p) => acc + p.lead_ppb, 0) / (pins.length || 1)).toFixed(1)} ppb</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Risk Level</p>
                <p className="text-sm font-bold text-primary">{pins.length > 0 ? (highestLead > 45 ? 'CRITICAL' : 'MODERATE') : 'SAFE'}</p>
              </div>
            </div>
          </div>
          <button className="bg-primary text-background-dark px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform">
            <ShieldAlert className="w-5 h-5" />
            DEPLOY RESPONSE TEAM
          </button>
        </div>
      </section>
    </div>
  );
};
