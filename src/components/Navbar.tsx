import React from 'react';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  Code2, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'locatario' | 'admin' | 'arquitectura';
  setCurrentTab: (tab: 'locatario' | 'admin' | 'arquitectura') => void;
  openTicketsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openTicketsCount }) => {
  return (
    <header className="bg-[#0F172A] border-b border-slate-700/50 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo e Identidad Corporativa */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight uppercase text-white font-sans">
                  SIERRA MORENA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v2.4 Pro
                </span>
              </div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">
                Gestión Integral de PQRS • Ley 1755
              </p>
            </div>
          </div>

          {/* Navegación por Perfiles / Vistas */}
          <nav className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
            <button
              id="tab-locatario-btn"
              onClick={() => setCurrentTab('locatario')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                currentTab === 'locatario'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${currentTab === 'locatario' ? 'bg-white' : 'bg-slate-600'}`} />
              <FileText className="w-3.5 h-3.5" />
              <span>Portal Locatario</span>
            </button>

            <button
              id="tab-admin-btn"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 relative ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${currentTab === 'admin' ? 'bg-white' : 'bg-slate-600'}`} />
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Servicio al Cliente</span>
              {openTicketsCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold leading-none text-white bg-rose-500 rounded-full shadow-sm">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              id="tab-arquitectura-btn"
              onClick={() => setCurrentTab('arquitectura')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                currentTab === 'arquitectura'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${currentTab === 'arquitectura' ? 'bg-white' : 'bg-slate-600'}`} />
              <Code2 className="w-3.5 h-3.5" />
              <span>Arquitectura & SLA</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
