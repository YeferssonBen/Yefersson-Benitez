import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { SLAStatus, PQRSStatus, PQRSType } from '../types';

export const SLABadge: React.FC<{ 
  status?: SLAStatus; 
  diasParaCierre?: number; 
  diasDesdeRecepcion?: number;
  esCerrado?: boolean;
}> = ({ status, diasParaCierre, diasDesdeRecepcion, esCerrado }) => {
  if (esCerrado || status === 'CUMPLIDO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>SLA Cumplido ({diasDesdeRecepcion ?? 0}d)</span>
      </span>
    );
  }

  if (status === 'VENCIDO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>SLA Vencido ({Math.abs(diasParaCierre ?? 0)}d mora)</span>
      </span>
    );
  }

  if (status === 'EN_RIESGO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>SLA Crítico ({diasParaCierre ?? 0}d restantes)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
      <Clock className="w-3.5 h-3.5 text-indigo-600" />
      <span>A Tiempo ({diasParaCierre ?? 0}d)</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: PQRSStatus }> = ({ status }) => {
  switch (status) {
    case 'ABIERTO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
          Abierto
        </span>
      );
    case 'EN_REVISION':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
          En revisión
        </span>
      );
    case 'PLAN_ACCION':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          Plan de acción
        </span>
      );
    case 'RESUELTO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
          Resuelto
        </span>
      );
    case 'CERRADO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          Cerrado
        </span>
      );
    default:
      return null;
  }
};

export const TypeBadge: React.FC<{ tipo: PQRSType }> = ({ tipo }) => {
  const map: Record<PQRSType, { label: string; color: string }> = {
    PETICION: { label: 'Petición', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    QUEJA: { label: 'Queja', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    RECLAMO: { label: 'Reclamo', color: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' },
    SUGERENCIA: { label: 'Sugerencia', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };
  const item = map[tipo] || { label: tipo, color: 'bg-slate-100 text-slate-800 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.color}`}>
      {item.label}
    </span>
  );
};
