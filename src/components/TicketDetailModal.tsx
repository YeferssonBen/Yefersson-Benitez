import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  Paperclip, 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  FileCheck,
  Printer,
  ChevronRight,
  ArrowRight,
  Info
} from 'lucide-react';
import { PQRS, PQRSStatus, PQRSType } from '../types';
import { SLABadge, StatusBadge, TypeBadge } from './SLABadge';
import { SLA_RULES } from '../utils/slaCalculator';

interface TicketDetailModalProps {
  ticket: PQRS | null;
  onClose: () => void;
  onUpdateGestion: (id: string, gestionData: any) => Promise<void>;
  onAddSeguimiento: (id: string, seguimientoData: any) => Promise<void>;
  onCerrarTicket: (id: string, cierreData: any) => Promise<void>;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateGestion,
  onAddSeguimiento,
  onCerrarTicket
}) => {
  if (!ticket) return null;

  const [activeTab, setActiveTab] = useState<'resumen' | 'gestion_fase3' | 'seguimiento_fase4' | 'cierre'>('resumen');
  
  // Phase 3 Form State
  const [correccionRealizada, setCorreccionRealizada] = useState(ticket.gestion?.correccionRealizada || '');
  const [causasIdentificadas, setCausasIdentificadas] = useState(ticket.gestion?.causasIdentificadas || '');
  const [planAccion, setPlanAccion] = useState(ticket.gestion?.planAccion || '');
  const [responsableArea, setResponsableArea] = useState(ticket.gestion?.responsableArea || 'Operaciones e Infraestructura');
  const [responsableNombre, setResponsableNombre] = useState(ticket.gestion?.responsableNombre || '');
  const [nuevoEstadoGestion, setNuevoEstadoGestion] = useState<PQRSStatus>(ticket.estado);
  const [isSubmittingGestion, setIsSubmittingGestion] = useState(false);

  // Phase 4 Seguimiento State
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [agenteNombre, setAgenteNombre] = useState('Liliana Patricia Gómez');
  const [agenteCargo, setAgenteCargo] = useState('Coordinadora de Servicio al Cliente');
  const [cambioEstadoSeguimiento, setCambioEstadoSeguimiento] = useState<PQRSStatus>(ticket.estado);
  const [isSubmittingSeguimiento, setIsSubmittingSeguimiento] = useState(false);

  // Phase 4 Cierre State
  const [resultadoGestion, setResultadoGestion] = useState(ticket.cierre?.resultadoGestion || '');
  const [conformeLocatario, setConformeLocatario] = useState(ticket.cierre?.conformeLocatario ?? true);
  const [agenteCierre, setAgenteCierre] = useState(ticket.cierre?.agenteCierre || 'Liliana Patricia Gómez - SAC Sierra Morena');
  const [isSubmittingCierre, setIsSubmittingCierre] = useState(false);

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveGestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGestion(true);
    try {
      await onUpdateGestion(ticket.id, {
        correccionRealizada,
        causasIdentificadas,
        planAccion,
        responsableArea,
        responsableNombre,
        nuevoEstado: nuevoEstadoGestion,
        agenteNombre,
        agenteCargo
      });
      showNotification('Fase 3: Gestión y Análisis actualizada correctamente.');
    } catch (err: any) {
      showNotification('Error al guardar gestión: ' + err.message, 'error');
    } finally {
      setIsSubmittingGestion(false);
    }
  };

  const handleSaveSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setIsSubmittingSeguimiento(true);
    try {
      await onAddSeguimiento(ticket.id, {
        agenteNombre,
        agenteCargo,
        comentario: nuevoComentario,
        nuevoEstado: cambioEstadoSeguimiento,
        tipoEvento: cambioEstadoSeguimiento !== ticket.estado ? 'CAMBIO_ESTADO' : 'SEGUIMIENTO'
      });
      setNuevoComentario('');
      showNotification('Seguimiento añadido a la bitácora.');
    } catch (err: any) {
      showNotification('Error al registrar seguimiento: ' + err.message, 'error');
    } finally {
      setIsSubmittingSeguimiento(false);
    }
  };

  const handleCierreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultadoGestion.trim()) {
      showNotification('Debe detallar el resultado de la gestión para cerrar.', 'error');
      return;
    }

    setIsSubmittingCierre(true);
    try {
      await onCerrarTicket(ticket.id, {
        agenteCierre,
        resultadoGestion,
        conformeLocatario
      });
      showNotification('PQRS cerrada formalmente.');
    } catch (err: any) {
      showNotification('Error al cerrar caso: ' + err.message, 'error');
    } finally {
      setIsSubmittingCierre(false);
    }
  };

  const fechaRad = new Date(ticket.fechaRadicacion);
  const fechaPrev = ticket.gestion?.fechaCierrePrevista ? new Date(ticket.gestion.fechaCierrePrevista) : null;
  const fechaCierreReal = ticket.cierre?.fechaCierreReal ? new Date(ticket.cierre.fechaCierreReal) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold">
              PSM
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-bold font-mono tracking-tight text-white">{ticket.radicado}</h2>
                <TypeBadge tipo={ticket.tipo} />
                <StatusBadge status={ticket.estado} />
              </div>
              <p className="text-xs text-slate-300 truncate max-w-lg mt-0.5">{ticket.asunto}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              title="Imprimir resumen oficial de PQRS"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Alert Banner if notification exists */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            <span>{notification.text}</span>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Quick Dynamic Metrics Bar (Fase 2) */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-700">Radicado:</strong> {fechaRad.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-700">Días transcurridos:</strong> <span className="font-bold text-slate-900">{ticket.diasDesdeRecepcionHabiles ?? 0}</span> días hábiles</span>
            </div>
            {fechaPrev && (
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span><strong className="text-slate-700">Límite SLA:</strong> {fechaPrev.toLocaleDateString('es-CO')}</span>
              </div>
            )}
          </div>
          <div>
            <SLABadge 
              status={ticket.estadoSLA} 
              diasParaCierre={ticket.diasParaCierreHabiles}
              diasDesdeRecepcion={ticket.diasDesdeRecepcionHabiles}
              esCerrado={ticket.estado === 'CERRADO'}
            />
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'resumen'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fase 1 & 2: Radicación</span>
          </button>

          <button
            onClick={() => setActiveTab('gestion_fase3')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'gestion_fase3'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Fase 3: Gestión y Análisis</span>
          </button>

          <button
            onClick={() => setActiveTab('seguimiento_fase4')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'seguimiento_fase4'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fase 4: Bitácora ({ticket.seguimientos?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('cierre')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'cierre'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Fase 4: Cierre y Resultado</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: RESUMEN FASE 1 & FASE 2 */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              
              {/* Locatario / Solicitante Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Datos del Solicitante / Locatario (Fase 1)
                </h3>
                
                {ticket.solicitante.esAnonimo ? (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esta PQRS fue radicada de manera <strong>Anónima</strong>. No se almacenaron datos personales conforme a la política de protección de datos.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Nombre Completo:</span>
                      <span className="font-semibold text-slate-900">{ticket.solicitante.nombreCompleto || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Identificación:</span>
                      <span className="font-semibold text-slate-900">{ticket.solicitante.tipoDocumento} {ticket.solicitante.numeroIdentificacion || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Cliente / Marca / Local:</span>
                      <span className="font-semibold text-indigo-600">{ticket.solicitante.clienteMarca} {ticket.solicitante.numeroLocal && `(${ticket.solicitante.numeroLocal})`}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Teléfono / Celular:</span>
                      <span className="font-semibold text-slate-900">{ticket.solicitante.telefono || 'No registrado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Correo Electrónico:</span>
                      <span className="font-semibold text-slate-900">{ticket.solicitante.email || 'No registrado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Habeas Data:</span>
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Autorizado
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalle de la Situación */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Detalles del Caso Radicado
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Tipo de Situación:</span>
                    <span className="font-bold text-slate-900">{ticket.tipo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Categoría:</span>
                    <span className="font-bold text-slate-900">{ticket.categoria}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Descripción de la Situación Presentada:</span>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-xs whitespace-pre-wrap leading-relaxed font-sans">
                    {ticket.descripcion}
                  </div>
                </div>

                {/* Adjuntos */}
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2">Información Anexa / Evidencias Fotográficas ({ticket.adjuntos?.length || 0}):</span>
                  {ticket.adjuntos && ticket.adjuntos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ticket.adjuntos.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{att.nombre}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">{(att.tamano / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No se adjuntaron archivos o imágenes en esta radicación.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GESTIÓN Y ANÁLISIS (FASE 3) */}
          {activeTab === 'gestion_fase3' && (
            <form onSubmit={handleSaveGestion} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Fase 3: Gestión y Análisis (Servicio al Cliente)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registre las acciones inmediatas, análisis de causa raíz y formulación del plan de acción para el locatario.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área Responsable Asignada
                  </label>
                  <select
                    value={responsableArea}
                    onChange={(e) => setResponsableArea(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Dirección de Operaciones e Infraestructura">Dirección de Operaciones e Infraestructura</option>
                    <option value="Seguridad y Control de Pérdidas">Seguridad y Control de Pérdidas</option>
                    <option value="Gestión Ambiental y Aseo">Gestión Ambiental y Aseo</option>
                    <option value="Facturación y Cartera">Facturación y Cartera</option>
                    <option value="Administración de Copropiedad">Administración de Copropiedad</option>
                    <option value="Comité de Convivencia">Comité de Convivencia</option>
                    <option value="Comercial y Arrendamientos">Comercial y Arrendamientos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Funcionario / Líder Responsable
                  </label>
                  <input
                    type="text"
                    value={responsableNombre}
                    onChange={(e) => setResponsableNombre(e.target.value)}
                    placeholder="Ej. Ing. Roberto Salcedo / Laura Morales"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Corrección Realizada (Acciones Inmediatas de Contención)
                </label>
                <textarea
                  rows={3}
                  value={correccionRealizada}
                  onChange={(e) => setCorreccionRealizada(e.target.value)}
                  placeholder="Describa qué medidas provisionales o inmediatas se tomaron apenas se recibió la PQRS..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Causas Identificadas (Análisis Causa Raíz)
                </label>
                <textarea
                  rows={3}
                  value={causasIdentificadas}
                  onChange={(e) => setCausasIdentificadas(e.target.value)}
                  placeholder="Explique por qué se originó la novedad (análisis técnico, fallas de proceso, desgaste natural, etc.)..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Plan de Acción (Pasos Detallados de Solución Definitiva)
                </label>
                <textarea
                  rows={3}
                  value={planAccion}
                  onChange={(e) => setPlanAccion(e.target.value)}
                  placeholder="Detalle el cronograma o actividades a ejecutar para prevenir la recurrencia..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actualizar Estado del Ticket
                  </label>
                  <select
                    value={nuevoEstadoGestion}
                    onChange={(e) => setNuevoEstadoGestion(e.target.value as PQRSStatus)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_REVISION">En revisión</option>
                    <option value="PLAN_ACCION">Plan de acción formulado</option>
                    <option value="RESUELTO">Resuelto (Listo para cierre)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGestion}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSubmittingGestion ? 'Guardando...' : 'Guardar Gestión y Análisis (Fase 3)'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SEGUIMIENTO Y BITÁCORA (FASE 4) */}
          {activeTab === 'seguimiento_fase4' && (
            <div className="space-y-6">
              
              {/* Form to add new follow-up */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  Registrar Nuevo Seguimiento / Evento
                </h3>
                
                <form onSubmit={handleSaveSeguimiento} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Agente</label>
                      <input
                        type="text"
                        value={agenteNombre}
                        onChange={(e) => setAgenteNombre(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo / Rol</label>
                      <input
                        type="text"
                        value={agenteCargo}
                        onChange={(e) => setAgenteCargo(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cambiar Estado (Opcional)</label>
                      <select
                        value={cambioEstadoSeguimiento}
                        onChange={(e) => setCambioEstadoSeguimiento(e.target.value as PQRSStatus)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="ABIERTO">Abierto</option>
                        <option value="EN_REVISION">En revisión</option>
                        <option value="PLAN_ACCION">Plan de acción</option>
                        <option value="RESUELTO">Resuelto</option>
                        <option value="CERRADO">Cerrado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Comentario o Resumen de Gestión</label>
                    <textarea
                      rows={2}
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      placeholder="Ingrese los detalles del contacto, visita técnica o avance..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingSeguimiento}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingSeguimiento ? 'Registrando...' : 'Añadir a la Bitácora'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Timeline of follow-ups */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Historial de Trazabilidad y Bitácora
                </h3>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                  {ticket.seguimientos?.map((seg, idx) => {
                    const segDate = new Date(seg.fecha);
                    return (
                      <div key={seg.id || idx} className="relative pl-6">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                        
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-slate-900">{seg.agenteNombre}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                                {seg.agenteCargo}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {segDate.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed mt-1">{seg.comentario}</p>
                          
                          {seg.estadoNuevo && (
                            <div className="mt-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              <span>Estado: {seg.estadoNuevo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CIERRE Y RESULTADO (FASE 4) */}
          {activeTab === 'cierre' && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  Fase 4: Seguimiento y Cierre Definitivo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formalice la finalización del caso, registre el resultado de la gestión y la constancia de conformidad.
                </p>
              </div>

              {ticket.estado === 'CERRADO' && ticket.cierre ? (
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Caso Cerrado Exitosamente</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-emerald-900 pt-2 border-t border-emerald-200/60">
                    <div>
                      <span className="font-semibold block text-emerald-700 text-[10px] uppercase tracking-wider">Fecha de Cierre Real:</span>
                      <span className="font-mono">{fechaCierreReal ? fechaCierreReal.toLocaleString('es-CO') : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-emerald-700 text-[10px] uppercase tracking-wider">Agente que Cerró:</span>
                      <span>{ticket.cierre.agenteCierre}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold block text-emerald-700 text-[10px] uppercase tracking-wider">Resultado de la Gestión:</span>
                      <p className="mt-1 bg-white/80 p-3 rounded-lg border border-emerald-200/80">{ticket.cierre.resultadoGestion}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-emerald-700 text-[10px] uppercase tracking-wider">Conformidad del Locatario:</span>
                      <span>{ticket.cierre.conformeLocatario ? '✓ Conforme a satisfacción' : '✗ Con inconformidades pendientes'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCierreSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quien realiza el seguimiento / Cierre (Agente)
                      </label>
                      <input
                        type="text"
                        value={agenteCierre}
                        onChange={(e) => setAgenteCierre(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fecha de Cierre Real
                      </label>
                      <input
                        type="text"
                        value={new Date().toLocaleDateString('es-CO') + ' (Automática)'}
                        disabled
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-100 text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Resultado de la Gestión (Comentarios de Cierre y Conclusión)
                    </label>
                    <textarea
                      rows={4}
                      value={resultadoGestion}
                      onChange={(e) => setResultadoGestion(e.target.value)}
                      placeholder="Especifique cómo se dio solución definitiva al caso, fecha de visita de verificación y acuerdos pactados con el locatario..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="conformeLocatarioCheck"
                      checked={conformeLocatario}
                      onChange={(e) => setConformeLocatario(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="conformeLocatarioCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                      El locatario / arrendatario manifestó su <strong>conformidad y satisfacción</strong> con la solución brindada.
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingCierre}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{isSubmittingCierre ? 'Procesando Cierre...' : 'Cerrar PQRS Formalmente'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Promotora Sierra Morena • Gestión de Calidad ISO 9001 / SLA Ley 1755</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition text-xs uppercase tracking-wider"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
