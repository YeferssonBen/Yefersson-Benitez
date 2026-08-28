import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileText, 
  Layers, 
  UserCheck, 
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  Building,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { PQRS, PQRSStatus, PQRSType, PQRSCategory, SLAStatus, MetricasDashboard } from '../types';
import { SLABadge, StatusBadge, TypeBadge } from './SLABadge';

interface AdminDashboardProps {
  tickets: PQRS[];
  metricas: MetricasDashboard | null;
  onSelectTicket: (ticket: PQRS) => void;
  onRefresh: () => void;
  onResetDemo: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  metricas,
  onSelectTicket,
  onRefresh,
  onResetDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [filterCategoria, setFilterCategoria] = useState<string>('TODOS');
  const [filterSLA, setFilterSLA] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'tabla' | 'kanban'>('tabla');

  // Filter logic
  const filteredTickets = tickets.filter(item => {
    if (filterEstado !== 'TODOS' && item.estado !== filterEstado) return false;
    if (filterTipo !== 'TODOS' && item.tipo !== filterTipo) return false;
    if (filterCategoria !== 'TODOS' && item.categoria !== filterCategoria) return false;
    if (filterSLA !== 'TODOS' && item.estadoSLA !== filterSLA) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchRadicado = item.radicado.toLowerCase().includes(q);
      const matchAsunto = item.asunto.toLowerCase().includes(q);
      const matchCliente = item.solicitante.clienteMarca?.toLowerCase().includes(q);
      const matchNombre = item.solicitante.nombreCompleto?.toLowerCase().includes(q);
      const matchLocal = item.solicitante.numeroLocal?.toLowerCase().includes(q);
      return matchRadicado || matchAsunto || matchCliente || matchNombre || matchLocal;
    }

    return true;
  });

  const kanbanColumns: { status: PQRSStatus; label: string; color: string; dot: string }[] = [
    { status: 'ABIERTO', label: '1. Abierto (Fase 1/2)', color: 'border-t-blue-500 bg-blue-50/30', dot: 'bg-blue-500' },
    { status: 'EN_REVISION', label: '2. En Revisión SAC', color: 'border-t-purple-500 bg-purple-50/30', dot: 'bg-purple-500' },
    { status: 'PLAN_ACCION', label: '3. Plan de Acción (Fase 3)', color: 'border-t-amber-500 bg-amber-50/30', dot: 'bg-amber-500' },
    { status: 'RESUELTO', label: '4. Resuelto', color: 'border-t-teal-500 bg-teal-50/30', dot: 'bg-teal-500' },
    { status: 'CERRADO', label: '5. Cerrado (Fase 4)', color: 'border-t-slate-400 bg-slate-100/50', dot: 'bg-slate-400' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner with Service Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Consola de Servicio al Cliente & Gestión de PQRS
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Control de tiempos legales (Ley 1755), formulación de planes de acción (Fase 3) y bitácora de seguimiento (Fase 4).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
            title="Refrescar lista y métricas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={onResetDemo}
            className="px-3.5 py-2.5 text-xs font-semibold bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg transition shadow-sm"
          >
            Reiniciar Demo
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Total Casos</p>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metricas?.total ?? tickets.length}</span>
          <span className="text-[10px] text-slate-400">Radicaciones globales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/30 shadow-sm">
          <p className="text-blue-600 text-[10px] uppercase font-bold tracking-tighter">Abiertas / Nuevas</p>
          <span className="text-2xl font-bold text-blue-950 mt-1 block">{metricas?.abiertas ?? 0}</span>
          <span className="text-[10px] text-blue-500">Por clasificar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30 shadow-sm">
          <p className="text-amber-600 text-[10px] uppercase font-bold tracking-tighter">Plan de Acción</p>
          <span className="text-2xl font-bold text-amber-950 mt-1 block">{metricas?.planAccion ?? 0}</span>
          <span className="text-[10px] text-amber-600">Fase 3 en ejecución</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <p className="text-emerald-600 text-[10px] uppercase font-bold tracking-tighter">% Cumplimiento SLA</p>
          <span className="text-2xl font-bold text-emerald-950 mt-1 block">
            {metricas?.cumplimientoSLA?.porcentajeCumplimiento ?? 100}%
          </span>
          <span className="text-[10px] text-emerald-600">Dentro del término legal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30 shadow-sm">
          <p className="text-rose-600 text-[10px] uppercase font-bold tracking-tighter">SLA Vencido</p>
          <span className="text-2xl font-bold text-rose-950 mt-1 block">{metricas?.cumplimientoSLA?.vencidos ?? 0}</span>
          <span className="text-[10px] text-rose-500">En mora de respuesta</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Promedio Cierre</p>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">{metricas?.promedioDiasCierre ?? 3.5}d</span>
          <span className="text-[10px] text-slate-400">Días hábiles promedio</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por radicado, local, marca o asunto..."
              className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            
            {/* Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="PLAN_ACCION">Plan de acción</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>

            {/* Tipo */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="PETICION">Peticiones (15d)</option>
              <option value="QUEJA">Quejas (15d)</option>
              <option value="RECLAMO">Reclamos (15d)</option>
              <option value="SUGERENCIA">Sugerencias (10d)</option>
            </select>

            {/* Categoría */}
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="TODOS">Todas las Categorías</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="SEGURIDAD">Seguridad</option>
              <option value="ASEO">Aseo</option>
              <option value="INFRAESTRUCTURA">Infraestructura</option>
              <option value="FACTURACION_COBROS">Facturación</option>
              <option value="CONVIVENCIA">Convivencia</option>
            </select>

            {/* SLA Status */}
            <select
              value={filterSLA}
              onChange={(e) => setFilterSLA(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="TODOS">Todos los SLA</option>
              <option value="A_TIEMPO">A Tiempo</option>
              <option value="EN_RIESGO">En Riesgo (≤2d)</option>
              <option value="VENCIDO">Vencidos (Mora)</option>
              <option value="CUMPLIDO">Cumplidos</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden ml-auto p-0.5 bg-slate-100">
              <button
                onClick={() => setViewMode('tabla')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'tabla' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* VIEW: TABLA */}
      {viewMode === 'tabla' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Radicado</th>
                  <th className="py-3.5 px-4">Locatario / Marca</th>
                  <th className="py-3.5 px-4">Tipo & Categoría</th>
                  <th className="py-3.5 px-4">Asunto / Descripción</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Semáforo SLA</th>
                  <th className="py-3.5 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="hover:bg-indigo-50/30 cursor-pointer transition"
                    >
                      {/* Radicado & Fecha */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block text-xs">{ticket.radicado}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ticket.fechaRadicacion).toLocaleDateString('es-CO')}
                        </span>
                      </td>

                      {/* Locatario */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block truncate max-w-[150px]">
                          {ticket.solicitante.clienteMarca}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {ticket.solicitante.esAnonimo ? 'Anónimo' : ticket.solicitante.nombreCompleto}
                        </span>
                      </td>

                      {/* Tipo & Categoria */}
                      <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                        <TypeBadge tipo={ticket.tipo} />
                        <span className="text-[10px] text-slate-500 block font-medium">
                          {ticket.categoria}
                        </span>
                      </td>

                      {/* Asunto */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block truncate">{ticket.asunto}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ticket.descripcion}</span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={ticket.estado} />
                        {ticket.gestion?.responsableArea && (
                          <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[130px]">
                            {ticket.gestion.responsableArea}
                          </span>
                        )}
                      </td>

                      {/* SLA */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SLABadge 
                          status={ticket.estadoSLA}
                          diasParaCierre={ticket.diasParaCierreHabiles}
                          diasDesdeRecepcion={ticket.diasDesdeRecepcionHabiles}
                          esCerrado={ticket.estado === 'CERRADO'}
                        />
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectTicket(ticket); }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-bold text-xs transition border border-indigo-200"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron casos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: KANBAN */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanColumns.map(col => {
            const colTickets = filteredTickets.filter(t => t.estado === col.status);
            return (
              <div key={col.status} className={`rounded-xl border-t-4 ${col.color} p-4 border border-slate-200 shadow-sm flex flex-col`}>
                
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{ticket.radicado}</span>
                        <TypeBadge tipo={ticket.tipo} />
                      </div>

                      <h4 className="font-semibold text-xs text-slate-800 line-clamp-2">{ticket.asunto}</h4>
                      
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-medium text-indigo-700 truncate max-w-[110px]">
                          {ticket.solicitante.clienteMarca}
                        </span>
                        <span>{new Date(ticket.fechaRadicacion).toLocaleDateString('es-CO')}</span>
                      </div>

                      <div className="pt-1">
                        <SLABadge 
                          status={ticket.estadoSLA}
                          diasParaCierre={ticket.diasParaCierreHabiles}
                          diasDesdeRecepcion={ticket.diasDesdeRecepcionHabiles}
                          esCerrado={ticket.estado === 'CERRADO'}
                        />
                      </div>
                    </div>
                  ))}

                  {colTickets.length === 0 && (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                      Sin casos en esta fase
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
