import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  Search, 
  HelpCircle, 
  AlertCircle, 
  Paperclip, 
  Building2, 
  Lock, 
  Eye, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { PQRSType, PQRSCategory, DocType, PQRS } from '../types';
import { SLA_RULES } from '../utils/slaCalculator';
import { SLABadge, StatusBadge, TypeBadge } from './SLABadge';

interface LocatarioPortalProps {
  onRadicarPQRS: (data: any) => Promise<PQRS>;
  onConsultarPQRS: (radicado: string) => Promise<PQRS | null>;
}

export const LocatarioPortal: React.FC<LocatarioPortalProps> = ({ onRadicarPQRS, onConsultarPQRS }) => {
  const [subTab, setSubTab] = useState<'radicar' | 'consultar'>('radicar');

  // Form State (Fase 1)
  const [esAnonimo, setEsAnonimo] = useState<boolean>(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<DocType>('NIT');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [clienteMarca, setClienteMarca] = useState('');
  const [numeroLocal, setNumeroLocal] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [autorizacionHabeasData, setAutorizacionHabeasData] = useState(true);

  // Caso
  const [tipo, setTipo] = useState<PQRSType>('PETICION');
  const [categoria, setCategoria] = useState<PQRSCategory>('MANTENIMIENTO');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjuntos, setAdjuntos] = useState<{ id: string; nombre: string; tamano: number; tipo: string }[]>([]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [radicacionExitosa, setRadicacionExitosa] = useState<PQRS | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search State
  const [busquedaRadicado, setBusquedaRadicado] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [ticketConsultado, setTicketConsultado] = useState<PQRS | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f: File, i: number) => ({
        id: `att-${Date.now()}-${i}`,
        nombre: f.name,
        tamano: f.size,
        tipo: f.type || 'application/octet-stream'
      }));
      setAdjuntos([...adjuntos, ...newFiles]);
    }
  };

  const removeAdjunto = (id: string) => {
    setAdjuntos(adjuntos.filter(a => a.id !== id));
  };

  const handleSubmitRadicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!esAnonimo && !autorizacionHabeasData) {
      setErrorMessage('Debe autorizar el tratamiento de datos personales para continuar con la radicación.');
      return;
    }

    if (!asunto.trim() || !descripcion.trim()) {
      setErrorMessage('Por favor ingrese el asunto y la descripción detallada de su caso.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevoCaso = await onRadicarPQRS({
        solicitante: {
          esAnonimo,
          nombreCompleto: esAnonimo ? undefined : nombreCompleto,
          tipoDocumento: esAnonimo ? undefined : tipoDocumento,
          numeroIdentificacion: esAnonimo ? undefined : numeroIdentificacion,
          clienteMarca: esAnonimo ? 'Anónimo' : clienteMarca,
          numeroLocal: esAnonimo ? undefined : numeroLocal,
          telefono: esAnonimo ? undefined : telefono,
          email: esAnonimo ? undefined : email,
          autorizacionHabeasData
        },
        tipo,
        categoria,
        asunto,
        descripcion,
        adjuntos
      });

      setRadicacionExitosa(nuevoCaso);
      // Reset form
      setAsunto('');
      setDescripcion('');
      setAdjuntos([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la radicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busquedaRadicado.trim()) return;

    setIsSearching(true);
    setSearchNotFound(false);
    setTicketConsultado(null);

    try {
      const found = await onConsultarPQRS(busquedaRadicado.trim());
      if (found) {
        setTicketConsultado(found);
      } else {
        setSearchNotFound(true);
      }
    } catch {
      setSearchNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero / Header Card */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Building2 className="w-3.5 h-3.5" /> Portal Oficial de Arrendatarios y Locatarios
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ventanilla Virtual de PQRS
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Promotora Sierra Morena dispone de este canal formal para la recepción, trámite, seguimiento y resolución ágil de sus requerimientos, quejas, sugerencias y peticiones de mantenimiento.
          </p>

          {/* Subtabs selector */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { setSubTab('radicar'); setRadicacionExitosa(null); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
                subTab === 'radicar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Radicar Nueva PQRS</span>
            </button>

            <button
              onClick={() => setSubTab('consultar')}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
                subTab === 'consultar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar Estado por Radicado</span>
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: RADICACIÓN DE NUEVA PQRS */}
      {subTab === 'radicar' && (
        <div>
          {radicacionExitosa ? (
            /* Confirmation Card */
            <div className="bg-white rounded-xl p-8 border border-emerald-200 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Radicación Exitosa</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Su PQRS ha sido registrada</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Guarde su número de radicado para hacer seguimiento al estado de su solicitud.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left space-y-3 font-mono">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-sans">Número de Radicado:</span>
                  <span className="font-bold text-lg text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                    {radicacionExitosa.radicado}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-sans">Fecha y Hora:</span>
                  <span className="text-slate-800">{new Date(radicacionExitosa.fechaRadicacion).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-sans">Tipo de Caso:</span>
                  <span className="text-slate-800 font-bold">{radicacionExitosa.tipo}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-sans">Tiempo Legal de Respuesta (SLA):</span>
                  <span className="text-emerald-700 font-bold">{radicacionExitosa.gestion.diasHabilesSLA} días hábiles</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setBusquedaRadicado(radicacionExitosa.radicado);
                    setSubTab('consultar');
                    onConsultarPQRS(radicacionExitosa.radicado).then(t => setTicketConsultado(t));
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ver Estado en Tiempo Real</span>
                </button>

                <button
                  onClick={() => setRadicacionExitosa(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition"
                >
                  Radicar Otra PQRS
                </button>
              </div>
            </div>
          ) : (
            /* Formulario Completo Fase 1 */
            <form onSubmit={handleSubmitRadicacion} className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
              
              <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-800 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Formulario de Radicación Digital (Fase 1)</h2>
                  <p className="text-xs text-slate-400">Complete los campos requeridos según la Ley 1755 de 2015</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Paso 1 de 1
                </span>
              </div>

              {errorMessage && (
                <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-8">
                
                {/* 1. SELECCIÓN DE IDENTIDAD */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
                      Manejo de Identidad del Solicitante
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label 
                      onClick={() => setEsAnonimo(false)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                        !esAnonimo ? 'border-indigo-600 bg-indigo-50/40 text-slate-900' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="identidad"
                        checked={!esAnonimo}
                        onChange={() => setEsAnonimo(false)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-sm block">Radicación Nominativa (Identificada)</span>
                        <p className="text-xs text-slate-500 mt-1">Recomendado. Permite recibir notificaciones directas por email y respuesta personalizada.</p>
                      </div>
                    </label>

                    <label 
                      onClick={() => setEsAnonimo(true)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                        esAnonimo ? 'border-indigo-600 bg-indigo-50/40 text-slate-900' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="identidad"
                        checked={esAnonimo}
                        onChange={() => setEsAnonimo(true)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-sm block">Radicación Anónima</span>
                        <p className="text-xs text-slate-500 mt-1">No se registrarán datos personales. Deberá consultar el estado usando únicamente el número de radicado.</p>
                      </div>
                    </label>
                  </div>

                  {/* Campos Nominativos */}
                  {!esAnonimo && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo del Solicitante / Representante *</label>
                          <input
                            type="text"
                            value={nombreCompleto}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                            placeholder="Ej. María Fernanda Restrepo"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required={!esAnonimo}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento *</label>
                          <select
                            value={tipoDocumento}
                            onChange={(e) => setTipoDocumento(e.target.value as DocType)}
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="NIT">NIT (Empresa / Local)</option>
                            <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                            <option value="CE">Cédula de Extranjería (C.E.)</option>
                            <option value="PASAPORTE">Pasaporte</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Número de Identificación *</label>
                          <input
                            type="text"
                            value={numeroIdentificacion}
                            onChange={(e) => setNumeroIdentificacion(e.target.value)}
                            placeholder="Ej. 900.845.221-8"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required={!esAnonimo}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Cliente / Marca Comercial *</label>
                          <input
                            type="text"
                            value={clienteMarca}
                            onChange={(e) => setClienteMarca(e.target.value)}
                            placeholder="Ej. Boutique Esencia Viva"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required={!esAnonimo}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Número de Local / Módulo</label>
                          <input
                            type="text"
                            value={numeroLocal}
                            onChange={(e) => setNumeroLocal(e.target.value)}
                            placeholder="Ej. Local 214 - Piso 2"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / Celular de Contacto</label>
                          <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej. +57 312 456 7890"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (Para Notificaciones)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej. administracion@milocalsierramorena.com"
                            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Consentimiento Habeas Data */}
                      <div className="pt-2">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autorizacionHabeasData}
                            onChange={(e) => setAutorizacionHabeasData(e.target.checked)}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-600 leading-normal">
                            <strong>Autorización de Tratamiento de Datos Personales:</strong> Autorizo a Promotora Sierra Morena para almacenar y procesar mis datos de contacto con la finalidad exclusiva de dar trámite y respuesta a esta PQRS, conforme a la Ley 1581 de 2012 y política de privacidad.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. DETALLES DEL CASO */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
                    Detalles del Caso y Situación Presentada
                  </h3>

                  {/* Selector de Tipo P/Q/R/S */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'] as PQRSType[]).map((t) => {
                      const rule = SLA_RULES[t];
                      const isSelected = tipo === t;
                      return (
                        <div
                          key={t}
                          onClick={() => setTipo(t)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900">{t}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {rule.diasHabiles}d hábiles
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                            {rule.descripcion}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Categoría de la Situación *</label>
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value as PQRSCategory)}
                        className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="MANTENIMIENTO">Mantenimiento y Reparaciones</option>
                        <option value="SEGURIDAD">Seguridad y Control de Accesos</option>
                        <option value="ASEO">Aseo y Manejo de Residuos</option>
                        <option value="INFRAESTRUCTURA">Infraestructura y Áreas Comunes</option>
                        <option value="FACTURACION_COBROS">Facturación y Cuotas de Administración</option>
                        <option value="CONVIVENCIA">Convivencia y Ruidos</option>
                        <option value="LOCACIONES_COMERCIALES">Locaciones Comerciales</option>
                        <option value="OTRO">Otro Requerimiento</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asunto / Título Resumido *</label>
                      <input
                        type="text"
                        value={asunto}
                        onChange={(e) => setAsunto(e.target.value)}
                        placeholder="Ej. Fuga de agua en ducto de aire acondicionado"
                        className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descripción de la Situación Presentada *
                    </label>
                    <textarea
                      rows={5}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describa de forma clara y detallada los hechos, fechas, ubicación exacta dentro del centro comercial y cualquier impacto ocasionado en su actividad comercial..."
                      className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* 3. INFORMACIÓN ANEXA / EVIDENCIAS */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
                    Información Anexa (Archivos / Fotos de Prueba)
                  </h3>

                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center transition bg-slate-50/50">
                    <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">
                      Arrastre y suelte sus archivos o haga clic para examinar
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Formatos soportados: JPG, PNG, PDF, DOCX (Máx. 10MB por archivo)
                    </p>
                    
                    <input
                      type="file"
                      id="fileUploadInput"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUploadInput"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Seleccionar Archivos
                    </label>
                  </div>

                  {adjuntos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {adjuntos.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{att.nombre}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] text-slate-400">{(att.tamano / 1024).toFixed(0)} KB</span>
                            <button
                              type="button"
                              onClick={() => removeAdjunto(att.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Form Actions Footer */}
              <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Radicación protegida bajo cifrado TLS y política de calidad Sierra Morena.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Radicando en el sistema...' : 'Radicar PQRS Oficialmente'}</span>
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* VISTA 2: CONSULTAR ESTADO POR RADICADO */}
      {subTab === 'consultar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Rastreo y Seguimiento de PQRS</h2>
            <p className="text-xs text-slate-500 mb-6">
              Ingrese el número de radicado suministrado al momento de la creación (ej. PSM-202608-0001) para ver la trazabilidad en tiempo real.
            </p>

            <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                value={busquedaRadicado}
                onChange={(e) => setBusquedaRadicado(e.target.value)}
                placeholder="Ej. PSM-202608-0001"
                className="flex-1 text-sm rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                required
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Consultando...' : 'Buscar Radicado'}</span>
              </button>
            </form>

            {searchNotFound && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No se encontró ninguna PQRS con el radicado ingresado. Verifique el número e intente de nuevo.</span>
              </div>
            )}
          </div>

          {/* Resultado de Consulta */}
          {ticketConsultado && (
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in slide-in-from-bottom-3">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xl font-bold text-slate-900">{ticketConsultado.radicado}</span>
                    <TypeBadge tipo={ticketConsultado.tipo} />
                    <StatusBadge status={ticketConsultado.estado} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{ticketConsultado.asunto}</p>
                </div>
                <div>
                  <SLABadge 
                    status={ticketConsultado.estadoSLA}
                    diasParaCierre={ticketConsultado.diasParaCierreHabiles}
                    diasDesdeRecepcion={ticketConsultado.diasDesdeRecepcionHabiles}
                    esCerrado={ticketConsultado.estado === 'CERRADO'}
                  />
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Fecha de Radicación:</span>
                  <span className="font-bold text-slate-900">{new Date(ticketConsultado.fechaRadicacion).toLocaleString('es-CO')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Días Hábiles Transcurridos:</span>
                  <span className="font-bold text-indigo-700">{ticketConsultado.diasDesdeRecepcionHabiles ?? 0} días</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Área Asignada:</span>
                  <span className="font-bold text-slate-900">{ticketConsultado.gestion?.responsableArea || 'En evaluación por SAC'}</span>
                </div>
              </div>

              {/* Línea de Tiempo de Bitácora */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Línea de Tiempo y Trazabilidad del Caso
                </h3>

                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4">
                  {ticketConsultado.seguimientos.map((seg, idx) => (
                    <div key={seg.id || idx} className="relative pl-6">
                      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{seg.agenteNombre} ({seg.agenteCargo})</span>
                          <span className="text-slate-400 font-mono">{new Date(seg.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p className="text-slate-600">{seg.comentario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Si está cerrado */}
              {ticketConsultado.estado === 'CERRADO' && ticketConsultado.cierre && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Resolución y Cierre Final</span>
                  </div>
                  <p className="text-emerald-950">{ticketConsultado.cierre.resultadoGestion}</p>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Cerrado por: {ticketConsultado.cierre.agenteCierre} el {new Date(ticketConsultado.cierre.fechaCierreReal || '').toLocaleString('es-CO')}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
