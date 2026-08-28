import { PQRS } from '../types';
import { addBusinessDays } from '../utils/slaCalculator';

const baseDate = new Date('2026-08-20T08:30:00Z');

export const INITIAL_PQRS_DATA: PQRS[] = [
  {
    id: 'pqrs-101',
    radicado: 'PSM-202608-0001',
    fechaRadicacion: '2026-08-18T09:15:00Z',
    solicitante: {
      esAnonimo: false,
      nombreCompleto: 'María Fernanda Restrepo',
      tipoDocumento: 'NIT',
      numeroIdentificacion: '901.445.221-8',
      clienteMarca: 'Boutique Esencia Viva',
      numeroLocal: 'Local 112 - Plaza Central',
      telefono: '+57 310 987 6543',
      email: 'gerencia@esenciaviva.com.co',
      autorizacionHabeasData: true
    },
    tipo: 'RECLAMO',
    categoria: 'MANTENIMIENTO',
    asunto: 'Filtración recurrente en conducto de aire acondicionado central',
    descripcion: 'Desde el pasado lunes se presenta goteo constante sobre el exhibidor de prendas de seda en el local 112. Se requiere intervención urgente del equipo técnico del centro comercial antes de que se presenten daños mayores en la mercancía.',
    adjuntos: [
      {
        id: 'att-1',
        nombre: 'foto_goteo_exhibidor.jpg',
        tamano: 2450000,
        tipo: 'image/jpeg',
        fechaSubida: '2026-08-18T09:15:00Z'
      },
      {
        id: 'att-2',
        nombre: 'informe_humedad_preliminar.pdf',
        tamano: 1120000,
        tipo: 'application/pdf',
        fechaSubida: '2026-08-18T09:15:00Z'
      }
    ],
    estado: 'PLAN_ACCION',
    prioridad: 'ALTA',
    gestion: {
      correccionRealizada: 'Se procedió al cierre temporal de la válvula sectorial de condensados y se colocó bandeja recolectora con manguera de desagüe auxiliar.',
      causasIdentificadas: 'Desajuste en la abrazadera del sifón de drenaje y sedimentación acumulada por polvo ambiental en el ducto superior.',
      planAccion: 'Sustitución de abrazaderas metálicas por modelo de alta presión, limpieza química de serpentines y sellado hermético con membrana elastomérica.',
      responsableArea: 'Dirección de Operaciones e Infraestructura',
      responsableNombre: 'Ing. Carlos Mendoza',
      fechaCierrePrevista: addBusinessDays(new Date('2026-08-18T09:15:00Z'), 15).toISOString(),
      diasHabilesSLA: 15
    },
    seguimientos: [
      {
        id: 'seg-1',
        fecha: '2026-08-18T09:30:00Z',
        agenteNombre: 'Sistema Automatizado SAC',
        agenteCargo: 'Plataforma Digital',
        comentario: 'Radicación exitosa de la PQRS. Notificación remitida al correo electrónico registrado.',
        tipoEvento: 'CREACION',
        estadoNuevo: 'ABIERTO'
      },
      {
        id: 'seg-2',
        fecha: '2026-08-18T14:20:00Z',
        agenteNombre: 'Liliana Patricia Gómez',
        agenteCargo: 'Coordinadora de Servicio al Cliente',
        comentario: 'Caso validado y clasificado con prioridad Alta. Trasladado a la Dirección de Operaciones.',
        tipoEvento: 'CAMBIO_ESTADO',
        estadoAnterior: 'ABIERTO',
        estadoNuevo: 'EN_REVISION'
      },
      {
        id: 'seg-3',
        fecha: '2026-08-19T11:00:00Z',
        agenteNombre: 'Ing. Carlos Mendoza',
        agenteCargo: 'Jefe de Mantenimiento',
        comentario: 'Visita técnica realizada en sitio junto con el administrador del local. Se formuló plan de acción correctivo y se inició consecución de repuestos.',
        tipoEvento: 'PLAN_ACCION',
        estadoAnterior: 'EN_REVISION',
        estadoNuevo: 'PLAN_ACCION'
      }
    ]
  },
  {
    id: 'pqrs-102',
    radicado: 'PSM-202608-0002',
    fechaRadicacion: '2026-08-22T10:45:00Z',
    solicitante: {
      esAnonimo: false,
      nombreCompleto: 'Juan Camilo Osorio',
      tipoDocumento: 'CC',
      numeroIdentificacion: '1.020.334.890',
      clienteMarca: 'Restaurante Fuego & Sabor',
      numeroLocal: 'Local 301 - Terraza Gourmet',
      telefono: '+57 300 234 5678',
      email: 'administracion@fuegoycor.com',
      autorizacionHabeasData: true
    },
    tipo: 'PETICION',
    categoria: 'SEGURIDAD',
    asunto: 'Solicitud de ampliación de horario de descargue logístico matutino',
    descripcion: 'Solicitamos formalmente autorización para que nuestros proveedores de carnes y mariscos refrigerados puedan ingresar a la bahía de carga desde las 05:30 AM los días viernes y sábados, garantizando la cadena de frío para el servicio de almuerzo.',
    adjuntos: [],
    estado: 'EN_REVISION',
    prioridad: 'MEDIA',
    gestion: {
      responsableArea: 'Seguridad y Logística',
      responsableNombre: 'Capitán (R) Jorge Henao',
      fechaCierrePrevista: addBusinessDays(new Date('2026-08-22T10:45:00Z'), 15).toISOString(),
      diasHabilesSLA: 15
    },
    seguimientos: [
      {
        id: 'seg-201',
        fecha: '2026-08-22T10:45:00Z',
        agenteNombre: 'Sistema Automatizado SAC',
        agenteCargo: 'Plataforma Digital',
        comentario: 'Radicación creada y asignada a la jefatura de seguridad para evaluación de factibilidad operativa.',
        tipoEvento: 'CREACION',
        estadoNuevo: 'ABIERTO'
      },
      {
        id: 'seg-202',
        fecha: '2026-08-24T08:15:00Z',
        agenteNombre: 'Jorge Henao',
        agenteCargo: 'Director de Seguridad',
        comentario: 'Revisando disponibilidad del personal de vigilancia en esclusa 2 para coordinar apertura de portones.',
        tipoEvento: 'CAMBIO_ESTADO',
        estadoAnterior: 'ABIERTO',
        estadoNuevo: 'EN_REVISION'
      }
    ]
  },
  {
    id: 'pqrs-103',
    radicado: 'PSM-202608-0003',
    fechaRadicacion: '2026-08-25T16:00:00Z',
    solicitante: {
      esAnonimo: true,
      clienteMarca: 'Locatario Pasillo Occidental',
      autorizacionHabeasData: true
    },
    tipo: 'SUGERENCIA',
    categoria: 'ASEO',
    asunto: 'Instalación de puntos ecológicos de reciclaje en pasillo 4',
    descripcion: 'Sugerimos instalar estaciones de separación de residuos sólidos (aprovechables y no aprovechables) cerca a las bancas de descanso del pasillo occidental, para incentivar la cultura ambiental entre visitantes.',
    adjuntos: [],
    estado: 'ABIERTO',
    prioridad: 'BAJA',
    gestion: {
      responsableArea: 'Gestión Ambiental y Aseo',
      responsableNombre: 'Laura Morales',
      fechaCierrePrevista: addBusinessDays(new Date('2026-08-25T16:00:00Z'), 10).toISOString(),
      diasHabilesSLA: 10
    },
    seguimientos: [
      {
        id: 'seg-301',
        fecha: '2026-08-25T16:00:00Z',
        agenteNombre: 'Sistema Automatizado SAC',
        agenteCargo: 'Plataforma Digital',
        comentario: 'Radicación anónima registrada en el sistema.',
        tipoEvento: 'CREACION',
        estadoNuevo: 'ABIERTO'
      }
    ]
  },
  {
    id: 'pqrs-104',
    radicado: 'PSM-202608-0004',
    fechaRadicacion: '2026-08-05T08:00:00Z',
    solicitante: {
      esAnonimo: false,
      nombreCompleto: 'Claudia Milena Vargas',
      tipoDocumento: 'NIT',
      numeroIdentificacion: '900.671.309-1',
      clienteMarca: 'Óptica Visión Clara',
      numeroLocal: 'Local 145',
      telefono: '+57 315 789 0123',
      email: 'adm@visionclara.com',
      autorizacionHabeasData: true
    },
    tipo: 'QUEJA',
    categoria: 'INFRAESTRUCTURA',
    asunto: 'Falla en puerta automática de acceso norte y ruido molesto',
    descripcion: 'El sensor de la puerta automática de acceso norte se descalibró y emite un pitido continuo de alarma que interfiere con la atención a pacientes en nuestra óptica.',
    adjuntos: [],
    estado: 'CERRADO',
    prioridad: 'MEDIA',
    gestion: {
      correccionRealizada: 'Se procedió al cambio del sensor óptico infrarrojo y lubricación de rodamientos de la corredera.',
      causasIdentificadas: 'Fin de vida útil del sensor fotoeléctrico por alto tráfico peatonal.',
      planAccion: 'Mantenimiento preventivo bimensual programado con la empresa contratista de accesos automáticos.',
      responsableArea: 'Operaciones',
      responsableNombre: 'Ing. Carlos Mendoza',
      fechaCierrePrevista: '2026-08-26T17:00:00Z',
      diasHabilesSLA: 15
    },
    seguimientos: [
      {
        id: 'seg-401',
        fecha: '2026-08-05T08:00:00Z',
        agenteNombre: 'Sistema Automatizado SAC',
        agenteCargo: 'Plataforma Digital',
        comentario: 'Radicación creada.',
        tipoEvento: 'CREACION',
        estadoNuevo: 'ABIERTO'
      },
      {
        id: 'seg-402',
        fecha: '2026-08-06T10:00:00Z',
        agenteNombre: 'Liliana Patricia Gómez',
        agenteCargo: 'SAC',
        comentario: 'Técnico de puertas automáticas atendió el requerimiento.',
        tipoEvento: 'CAMBIO_ESTADO',
        estadoAnterior: 'ABIERTO',
        estadoNuevo: 'RESUELTO'
      },
      {
        id: 'seg-403',
        fecha: '2026-08-08T15:30:00Z',
        agenteNombre: 'Liliana Patricia Gómez',
        agenteCargo: 'Coordinadora SAC',
        comentario: 'Se contactó a la administradora de Óptica Visión Clara quien confirmó resolución completa del ruido y funcionamiento óptimo.',
        tipoEvento: 'CIERRE',
        estadoAnterior: 'RESUELTO',
        estadoNuevo: 'CERRADO'
      }
    ],
    cierre: {
      fechaCierreReal: '2026-08-08T15:30:00Z',
      agenteCierre: 'Liliana Patricia Gómez - Coordinadora SAC',
      resultadoGestion: 'Repuesto cambiado a satisfacción. Locatario validó solución sin inconvenientes acústicos.',
      conformeLocatario: true
    }
  }
];
