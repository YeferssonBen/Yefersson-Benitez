import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Layout, 
  Clock, 
  Copy, 
  Check, 
  Code2, 
  FileCode, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  SQL_SCHEMA_DDL, 
  NOSQL_SCHEMA_JSON, 
  BACKEND_API_MATRIX, 
  SLA_EXPLANATION_MARKDOWN 
} from '../data/architectureDocumentation';
import { 
  getColombianHolidays, 
  addBusinessDays, 
  calculateBusinessDaysBetween, 
  isNonWorkingDay,
  SLA_RULES 
} from '../utils/slaCalculator';
import { PQRSType } from '../types';

export const ArchitectureViewer: React.FC = () => {
  const [activeArchTab, setActiveArchTab] = useState<'sql' | 'nosql' | 'backend' | 'frontend' | 'sla_calculator'>('sql');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // SLA Live Playground State
  const [demoDate, setDemoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [demoType, setDemoType] = useState<PQRSType>('PETICION');
  const [demoYear, setDemoYear] = useState<number>(new Date().getFullYear());

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // SLA Playground Calculations
  const startDate = new Date(demoDate + 'T08:00:00');
  const daysSLA = SLA_RULES[demoType].diasHabiles;
  const deadlineDate = addBusinessDays(startDate, daysSLA);
  const today = new Date();
  const businessDaysElapsed = calculateBusinessDaysBetween(startDate, today);
  const holidaysYear = getColombianHolidays(demoYear);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-[#0F172A] text-white rounded-xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Code2 className="w-3.5 h-3.5" /> Arquitectura de Software & Diseño Técnico
          </span>
          <h1 className="text-3xl font-extrabold font-serif tracking-tight text-white">
            Documentación de Arquitectura Promotora Sierra Morena
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Especificación exhaustiva del modelo de datos relacional y documental, contratos de API RESTful con Node.js/Express, árbol de componentes React y motor matemático de cálculo de SLA con días hábiles y feriados colombianos (Ley 1755 / Ley Emiliani).
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-6">
          <button
            onClick={() => setActiveArchTab('sql')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeArchTab === 'sql' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Modelo SQL Relacional</span>
          </button>

          <button
            onClick={() => setActiveArchTab('nosql')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeArchTab === 'nosql' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. Esquema NoSQL</span>
          </button>

          <button
            onClick={() => setActiveArchTab('backend')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeArchTab === 'backend' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Arquitectura Backend REST</span>
          </button>

          <button
            onClick={() => setActiveArchTab('frontend')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeArchTab === 'frontend' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>4. Arquitectura Frontend React</span>
          </button>

          <button
            onClick={() => setActiveArchTab('sla_calculator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeArchTab === 'sla_calculator' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>5. Motor de SLA & Feriados (Playground)</span>
          </button>
        </div>
      </div>

      {/* 1. SQL DDL SCHEMA */}
      {activeArchTab === 'sql' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Esquema de Base de Datos Relacional (PostgreSQL / SQL DDL)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Estructurado por Fases 1 a 4 con llaves primarias UUID, índices B-Tree, restricciones CHECK de identidad y triggers de radicado único.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(SQL_SCHEMA_DDL, 'sql')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'sql' ? 'Copiado' : 'Copiar DDL SQL'}</span>
            </button>
          </div>

          <pre className="bg-[#0F172A] text-emerald-400 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            <code>{SQL_SCHEMA_DDL}</code>
          </pre>
        </div>
      )}

      {/* 2. NoSQL SCHEMA */}
      {activeArchTab === 'nosql' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                Modelo NoSQL Documental (MongoDB / Firestore JSON Schema)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Estructura de documento desnormalizada para alta velocidad de lectura, con subdocumentos embebidos para bitácoras y gestión.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(NOSQL_SCHEMA_JSON, 'nosql')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              {copiedSection === 'nosql' ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'nosql' ? 'Copiado' : 'Copiar JSON Schema'}</span>
            </button>
          </div>

          <pre className="bg-[#0F172A] text-teal-300 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            <code>{NOSQL_SCHEMA_JSON}</code>
          </pre>
        </div>
      )}

      {/* 3. BACKEND API REST SPEC */}
      {activeArchTab === 'backend' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Matriz de Endpoints RESTful (Express / Node.js)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Diseño de API REST bajo principios Richardson Nivel 2 con validación de payloads y cálculo de SLA en middleware.
            </p>
          </div>

          <div className="space-y-4">
            {BACKEND_API_MATRIX.map((api, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      api.metodo === 'POST' ? 'bg-indigo-100 text-indigo-800' :
                      api.metodo === 'GET' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {api.metodo}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">{api.endpoint}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {api.fase}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {api.rol}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{api.descripcion}</p>

                {api.bodyEjemplo && (
                  <div className="mt-2">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Payload JSON de ejemplo:</span>
                    <pre className="bg-[#0F172A] text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-40">
                      <code>{api.bodyEjemplo}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FRONTEND ARCHITECTURE */}
      {activeArchTab === 'frontend' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-600" />
              Arquitectura del Frontend (React + TypeScript + Tailwind)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Desglose de la estructura de componentes modulares, flujo de datos unidireccional y roles de usuario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Component Tree */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
              <span className="font-bold text-slate-900 font-sans text-xs uppercase tracking-wider block">Jerarquía de Componentes</span>
              
              <div className="space-y-1.5 text-slate-700 pl-2 border-l-2 border-indigo-500">
                <p className="font-bold text-indigo-700">App.tsx (State Orchestrator & Router)</p>
                <p className="pl-4 text-slate-800">├── Navbar.tsx (Identidad Sierra Morena & Switcher)</p>
                <p className="pl-4 text-slate-800">├── LocatarioPortal.tsx (Portal Arrendatario)</p>
                <p className="pl-8 text-slate-500">├── FormularioRadicacion (Fase 1: 4 Pasos)</p>
                <p className="pl-8 text-slate-500">├── RastreoTicket (Timeline y Estado)</p>
                <p className="pl-4 text-slate-800">├── AdminDashboard.tsx (Consola SAC)</p>
                <p className="pl-8 text-slate-500">├── KPICards & Metrics</p>
                <p className="pl-8 text-slate-500">├── FilterBar & Multi-criteria Search</p>
                <p className="pl-8 text-slate-500">├── TableView / KanbanView</p>
                <p className="pl-4 text-slate-800">├── TicketDetailModal.tsx</p>
                <p className="pl-8 text-slate-500">├── Fase 1 & 2 Viewer (Datos Caso)</p>
                <p className="pl-8 text-slate-500">├── Fase 3 Editor (Corrección, Causa Raíz, Plan)</p>
                <p className="pl-8 text-slate-500">├── Fase 4 Bitácora & Cierre Formal</p>
                <p className="pl-4 text-slate-800">└── ArchitectureViewer.tsx (Visor Técnico)</p>
              </div>
            </div>

            {/* State Management */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900 font-sans text-xs uppercase tracking-wider block">Flujo de Estados y Reactividad</span>
              <ul className="space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Enriquecimiento Dinámico de SLA:</strong> Cada ticket recibido se procesa con el hook matemático de días hábiles colombianos, calculando en caliente mora o días restantes.</li>
                <li><strong>Patrón de Formulario Reactivo:</strong> Validación en cliente de Habeas Data e identidad antes de emitir la llamada POST a la API REST.</li>
                <li><strong>Inmutabilidad en Bitácora:</strong> Cada actualización de estado o seguimiento genera un nodo append-only en el arreglo de eventos para auditoría.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* 5. SLA MOTOR & PLAYGROUND */}
      {activeArchTab === 'sla_calculator' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Simulador Interactivo de SLA y Feriados de Colombia
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pruebe el algoritmo en tiempo real seleccionando una fecha de radicación y observe el descuento de fines de semana y festivos (Ley Emiliani).
            </p>
          </div>

          {/* Playground Controls */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Radicación (Simulada)</label>
              <input
                type="date"
                value={demoDate}
                onChange={(e) => setDemoDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Situación PQRS</label>
              <select
                value={demoType}
                onChange={(e) => setDemoType(e.target.value as PQRSType)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="PETICION">Petición (15 Días Hábiles)</option>
                <option value="QUEJA">Queja (15 Días Hábiles)</option>
                <option value="RECLAMO">Reclamo (15 Días Hábiles)</option>
                <option value="SUGERENCIA">Sugerencia (10 Días Hábiles)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Año de Festivos</label>
              <input
                type="number"
                value={demoYear}
                onChange={(e) => setDemoYear(Number(e.target.value))}
                min={2020}
                max={2035}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Fecha Límite Prevista (SLA)</span>
              <span className="text-sm font-extrabold text-slate-900 block mt-1">
                {deadlineDate.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-[11px] text-indigo-700 mt-1 block font-mono">
                Plazo: {daysSLA} días hábiles (excluye fines de semana y festivos)
              </span>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Días Hábiles Transcurridos (vs Hoy)</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">
                {businessDaysElapsed} días
              </span>
              <span className="text-[11px] text-blue-700 mt-1 block">
                Calculado con exclusión estricta de días no laborables
              </span>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl border border-slate-300">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Total Festivos en Colombia ({demoYear})</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">
                {holidaysYear.length} días festivos
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Calculados mediante algoritmo de Pascua + Ley 51/1983
              </span>
            </div>
          </div>

          {/* Feriados List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Calendario de Festivos Detectados ({demoYear}):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {holidaysYear.map(h => (
                <div key={h} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono text-[11px] text-slate-700">
                  {h}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
