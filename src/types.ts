export type PQRSType = 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA';

export type PQRSStatus = 
  | 'ABIERTO'
  | 'EN_REVISION'
  | 'PLAN_ACCION'
  | 'RESUELTO'
  | 'CERRADO';

export type DocType = 'CC' | 'NIT' | 'CE' | 'PASAPORTE';

export type PQRSCategory = 
  | 'MANTENIMIENTO'
  | 'SEGURIDAD'
  | 'ASEO'
  | 'INFRAESTRUCTURA'
  | 'FACTURACION_COBROS'
  | 'CONVIVENCIA'
  | 'LOCACIONES_COMERCIALES'
  | 'OTRO';

export type SLAStatus = 'A_TIEMPO' | 'EN_RIESGO' | 'VENCIDO' | 'CUMPLIDO';

export interface Solicitante {
  esAnonimo: boolean;
  nombreCompleto?: string;
  tipoDocumento?: DocType;
  numeroIdentificacion?: string;
  clienteMarca?: string; // Nombre del local / marca
  numeroLocal?: string;  // Número de local comercial o módulo
  telefono?: string;
  email?: string;
  autorizacionHabeasData: boolean;
}

export interface AdjuntoArchivo {
  id: string;
  nombre: string;
  tamano: number; // en bytes
  tipo: string;
  url?: string;
  fechaSubida: string;
}

export interface GestionAnalisis {
  correccionRealizada?: string; // Acciones inmediatas
  causasIdentificadas?: string; // Por qué ocurrió
  planAccion?: string;         // Pasos detallados mediano/largo plazo
  responsableArea?: string;    // Ej: Operaciones, Seguridad, Jurídica
  responsableNombre?: string;  // Funcionario asignado
  fechaCierrePrevista?: string; // SLA estimado (ISO String)
  diasHabilesSLA: number;      // 15, 10, etc.
}

export interface SeguimientoItem {
  id: string;
  fecha: string;
  agenteNombre: string;
  agenteCargo: string;
  comentario: string;
  tipoEvento: 'CREACION' | 'CAMBIO_ESTADO' | 'ASIGNACION' | 'PLAN_ACCION' | 'SEGUIMIENTO' | 'CIERRE';
  estadoAnterior?: PQRSStatus;
  estadoNuevo?: PQRSStatus;
}

export interface CierreInfo {
  fechaCierreReal?: string;
  agenteCierre?: string;
  resultadoGestion?: string;
  conformeLocatario?: boolean;
}

export interface PQRS {
  id: string;
  radicado: string; // Ej: PSM-202608-0042
  fechaRadicacion: string; // ISO String
  solicitante: Solicitante;
  tipo: PQRSType;
  categoria: PQRSCategory;
  asunto: string;
  descripcion: string;
  adjuntos: AdjuntoArchivo[];
  estado: PQRSStatus;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  
  // Fase 3
  gestion: GestionAnalisis;
  
  // Fase 4
  seguimientos: SeguimientoItem[];
  cierre?: CierreInfo;
  
  // Métricas calculadas
  diasDesdeRecepcionHabiles?: number;
  diasParaCierreHabiles?: number;
  estadoSLA?: SLAStatus;
}

export interface SLARule {
  tipo: PQRSType;
  diasHabiles: number;
  descripcion: string;
  normativaReferencia: string;
}

export interface MetricasDashboard {
  total: number;
  abiertas: number;
  enRevision: number;
  planAccion: number;
  resueltas: number;
  cerradas: number;
  cumplimientoSLA: {
    aTiempo: number;
    enRiesgo: number;
    vencidos: number;
    cumplidos: number;
    porcentajeCumplimiento: number;
  };
  distribucionTipo: Record<PQRSType, number>;
  distribucionCategoria: Record<PQRSCategory, number>;
  promedioDiasCierre: number;
}
