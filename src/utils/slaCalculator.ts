import { PQRSType, PQRS, SLAStatus } from '../types';

/**
 * Reglas estándar de SLA según normativa colombiana (Ley 1755 de 2015)
 * y políticas de calidad de Promotora Sierra Morena.
 */
export const SLA_RULES: Record<PQRSType, { diasHabiles: number; descripcion: string; baseLegal: string }> = {
  PETICION: {
    diasHabiles: 15,
    descripcion: 'Peticiones de interés general o particular y consultas operativas.',
    baseLegal: 'Ley 1755 de 2015, Art. 14'
  },
  QUEJA: {
    diasHabiles: 15,
    descripcion: 'Manifestación de inconformidad por prestación irregular de servicios.',
    baseLegal: 'Ley 1755 de 2015, Art. 14'
  },
  RECLAMO: {
    diasHabiles: 15,
    descripcion: 'Exigencia formal por incumplimiento de acuerdos contractuales o de administración.',
    baseLegal: 'Ley 1755 de 2015, Art. 14'
  },
  SUGERENCIA: {
    diasHabiles: 10,
    descripcion: 'Propuestas de mejora para la copropiedad y áreas comunes.',
    baseLegal: 'Manual de Servicio al Cliente Sierra Morena'
  }
};

/**
 * Calcula el Domingo de Pascua para un año dado usando el algoritmo de Gauss / Butcher
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed (Marzo=2, Abril=3)
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Traslada una fecha al siguiente lunes si aplica por Ley Emiliani (Ley 51 de 1983)
 */
function moveToNextMonday(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  if (dayOfWeek === 1) return new Date(date); // Ya es lunes
  const daysToAdd = (8 - dayOfWeek) % 7;
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
  return nextMonday;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Genera el listado completo de días festivos en Colombia para un año
 */
export function getColombianHolidays(year: number): string[] {
  const holidays: Set<string> = new Set();

  // 1. Festivos Fijos (No se trasladan)
  holidays.add(`${year}-01-01`); // Año Nuevo
  holidays.add(`${year}-05-01`); // Día del Trabajo
  holidays.add(`${year}-07-20`); // Grito de Independencia
  holidays.add(`${year}-08-07`); // Batalla de Boyacá
  holidays.add(`${year}-12-08`); // Inmaculada Concepción
  holidays.add(`${year}-12-25`); // Navidad

  // 2. Festivos con Ley Emiliani (Se trasladan al siguiente lunes)
  const emilianiFixed = [
    new Date(year, 0, 6),   // Reyes Magos (6 Ene)
    new Date(year, 2, 19),  // San José (19 Mar)
    new Date(year, 5, 29),  // San Pedro y San Pablo (29 Jun)
    new Date(year, 7, 15),  // Asunción de la Virgen (15 Ago)
    new Date(year, 9, 12),  // Día de la Raza (12 Oct)
    new Date(year, 10, 1),  // Todos los Santos (1 Nov)
    new Date(year, 10, 11), // Independencia de Cartagena (11 Nov)
  ];

  emilianiFixed.forEach(d => {
    holidays.add(formatDateKey(moveToNextMonday(d)));
  });

  // 3. Festivos dependientes de Semana Santa
  const easter = getEasterSunday(year);
  
  // Jueves Santo: Pascua - 3 días
  const maundyThursday = new Date(easter);
  maundyThursday.setDate(easter.getDate() - 3);
  holidays.add(formatDateKey(maundyThursday));

  // Viernes Santo: Pascua - 2 días
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.add(formatDateKey(goodFriday));

  // Ascensión del Señor: Pascua + 43 días trasladado al lunes
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 43);
  holidays.add(formatDateKey(moveToNextMonday(ascension)));

  // Corpus Christi: Pascua + 64 días trasladado al lunes
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 64);
  holidays.add(formatDateKey(moveToNextMonday(corpusChristi)));

  // Sagrado Corazón: Pascua + 71 días trasladado al lunes
  const sacredHeart = new Date(easter);
  sacredHeart.setDate(easter.getDate() + 71);
  holidays.add(formatDateKey(moveToNextMonday(sacredHeart)));

  return Array.from(holidays).sort();
}

/**
 * Valida si un día específico es fin de semana (Sábado/Domingo) o feriado oficial
 */
export function isNonWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // 0 = Domingo, 6 = Sábado
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }
  const holidays = getColombianHolidays(date.getFullYear());
  const dateKey = formatDateKey(date);
  return holidays.includes(dateKey);
}

/**
 * Calcula la cantidad de días hábiles entre dos fechas (excluye fecha inicio si es el día de radicación y cuenta los días transcurridos completos)
 */
export function calculateBusinessDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (start.getTime() === end.getTime()) {
    return 0;
  }

  const isForward = end >= start;
  let current = new Date(start);
  let count = 0;

  if (isForward) {
    // Avanzar día a día
    current.setDate(current.getDate() + 1);
    while (current <= end) {
      if (!isNonWorkingDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  } else {
    // Conteo regresivo (días pasados / vencimiento)
    current.setDate(current.getDate() - 1);
    while (current >= end) {
      if (!isNonWorkingDay(current)) {
        count++;
      }
      current.setDate(current.getDate() - 1);
    }
    return -count;
  }
}

/**
 * Suma N días hábiles a una fecha dada respetando fines de semana y festivos
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  let added = 0;

  while (added < businessDays) {
    current.setDate(current.getDate() + 1);
    if (!isNonWorkingDay(current)) {
      added++;
    }
  }

  // Establecer hora de corte al final de la jornada laboral (17:00:00)
  current.setHours(17, 0, 0, 0);
  return current;
}

/**
 * Calcula las métricas automáticas de Fase 2 y SLA para un ticket de PQRS
 */
export function calculatePQRSMetrics(pqrs: PQRS, currentDate: Date = new Date()): {
  diasDesdeRecepcion: number;
  diasParaCierre: number;
  estadoSLA: SLAStatus;
  fechaPrevistaSLA: string;
} {
  const fechaRadicacion = new Date(pqrs.fechaRadicacion);
  const diasSLA = pqrs.gestion?.diasHabilesSLA || SLA_RULES[pqrs.tipo]?.diasHabiles || 15;
  
  // Calcular fecha de cierre prevista si no fue sobreescrita manualmente
  let fechaPrevista: Date;
  if (pqrs.gestion?.fechaCierrePrevista) {
    fechaPrevista = new Date(pqrs.gestion.fechaCierrePrevista);
  } else {
    fechaPrevista = addBusinessDays(fechaRadicacion, diasSLA);
  }

  // Si ya está cerrada, calcular contra la fecha de cierre real
  if (pqrs.estado === 'CERRADO' && pqrs.cierre?.fechaCierreReal) {
    const fechaCierre = new Date(pqrs.cierre.fechaCierreReal);
    const diasTranscurridos = calculateBusinessDaysBetween(fechaRadicacion, fechaCierre);
    const diasDiferencia = calculateBusinessDaysBetween(fechaCierre, fechaPrevista);
    const cumplio = diasDiferencia >= 0;

    return {
      diasDesdeRecepcion: diasTranscurridos,
      diasParaCierre: 0,
      estadoSLA: cumplio ? 'CUMPLIDO' : 'VENCIDO',
      fechaPrevistaSLA: fechaPrevista.toISOString()
    };
  }

  // Si está abierta/en gestión:
  const diasDesdeRecepcion = calculateBusinessDaysBetween(fechaRadicacion, currentDate);
  const diasParaCierre = calculateBusinessDaysBetween(currentDate, fechaPrevista);

  let estadoSLA: SLAStatus = 'A_TIEMPO';
  if (diasParaCierre < 0) {
    estadoSLA = 'VENCIDO';
  } else if (diasParaCierre <= 2) {
    estadoSLA = 'EN_RIESGO';
  } else {
    estadoSLA = 'A_TIEMPO';
  }

  return {
    diasDesdeRecepcion,
    diasParaCierre,
    estadoSLA,
    fechaPrevistaSLA: fechaPrevista.toISOString()
  };
}
