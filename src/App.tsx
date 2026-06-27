import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SimulationPage } from './components/SimulationPage';
import { MapPage } from './components/MapPage';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentPage, setCurrentPage] = useState('simulation');

  const renderPage = () => {
    switch (currentPage) {
      case 'simulation':
        return <SimulationPage />;
      case 'map':
        return <MapPage />;
      default:
        return <SimulationPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 selection:bg-primary/30 selection:text-primary">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col min-h-screen"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="border-t border-slate-800 py-12 px-6 bg-background-dark/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-primary uppercase">NAVI</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Molecular-level lead detection and public health surveillance platform. Protecting the next generation through signal science.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-100">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => setCurrentPage('simulation')} className="hover:text-primary transition-colors">Simulations</button></li>
              <li><button onClick={() => setCurrentPage('map')} className="hover:text-primary transition-colors">Hot Zone Map</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-100">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Whitepapers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-100">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Support Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sales Inquiry</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">© 2024 NAVI Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
