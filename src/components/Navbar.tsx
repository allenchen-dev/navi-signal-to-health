import React from 'react';
import { 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Map as MapIcon, 
  LayoutDashboard, 
  History, 
  BookOpen, 
  Settings, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'simulation', label: 'Simulations', icon: Droplets },
    { id: 'map', label: 'Hot Zone Map', icon: MapIcon },
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onPageChange('simulation')}
        >
          <div className="text-primary">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 uppercase">NAVI</h2>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                currentPage === item.id ? "text-primary border-b-2 border-primary pb-1" : "text-slate-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20">
            <Search className="w-4 h-4 text-primary mr-2" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder-slate-500 w-32 lg:w-48" 
              placeholder="Search data..."
            />
          </div>
          <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            className="md:hidden p-2 text-slate-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden hidden sm:block">
            <img 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ3fwJkTEfoQXEiDFqtyjJC8ZAu286zvQfIy2OKbC6F9dPFZdpaCccmWtR6OguNJ17G2z5WKAbv2TdidiCz5S8M4uZzjPifFvc1kDfS_rPiHkp6mvyehNskGKxqJ0hxF7eTLvxxkqSAy4wHNoOKfCEVFlpQLTA3_8JQ653hgMQgf2djC43nIoOT0ampkfFLfVvS9s48-_4SrsNyIDZanDj64imgo30uxVyr2izXiSIaopcCmQhdSmKnf1ekXL2SXRzrt4338yo3jKD"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background-dark border-b border-primary/10 p-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsMenuOpen(false);
              }}
              className={cn(
                "text-left px-4 py-2 rounded-lg transition-colors",
                currentPage === item.id ? "bg-primary/10 text-primary" : "text-slate-300 hover:bg-slate-800"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
