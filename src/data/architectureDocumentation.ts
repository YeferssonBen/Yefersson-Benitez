export const SQL_SCHEMA_DDL = `-- ============================================================================
-- PROMOTORA SIERRA MORENA - ESQUEMA DE BASE DE DATOS RELACIONAL (POSTGRESQL / SQL)
-- Módulo: Sistema Integral de Gestión de PQRS (Servicio al Cliente)
-- ============================================================================

-- 1. EXTENSIONES Y DOMINIOS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tipo_pqrs_enum AS ENUM ('PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA');
CREATE TYPE estado_pqrs_enum AS ENUM ('ABIERTO', 'EN_REVISION', 'PLAN_ACCION', 'RESUELTO', 'CERRADO');
CREATE TYPE prioridad_enum AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');
CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'NIT', 'CE', 'PASAPORTE');
CREATE TYPE categoria_pqrs_enum AS ENUM (
    'MANTENIMIENTO', 
    'SEGURIDAD', 
    'ASEO', 
    'INFRAESTRUCTURA', 
    'FACTURACION_COBROS', 
    'CONVIVENCIA', 
    'LOCACIONES_COMERCIALES', 
    'OTRO'
);
CREATE TYPE tipo_evento_bitacora AS ENUM (
    'CREACION', 
    'CAMBIO_ESTADO', 
    'ASIGNACION', 
    'PLAN_ACCION', 
    'SEGUIMIENTO', 
    'CIERRE'
);

-- ============================================================================
-- 2. TABLA: SOLICITANTES (Manejo de identidad y Habeas Data - Fase 1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    es_anonimo BOOLEAN NOT NULL DEFAULT FALSE,
    nombre_completo VARCHAR(255),
    tipo_documento tipo_documento_enum,
    numero_identificacion VARCHAR(50),
    cliente_marca VARCHAR(150), -- Nombre comercial de la marca o locatario
    numero_local VARCHAR(50),  -- Local, isla o bodega en Sierra Morena
    telefono VARCHAR(30),
    email VARCHAR(150),
    autorizacion_habeas_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_solicitante_identidad CHECK (
        (es_anonimo = TRUE) OR 
        (es_anonimo = FALSE AND nombre_completo IS NOT NULL AND numero_identificacion IS NOT NULL AND autorizacion_habeas_data = TRUE)
    )
);

CREATE INDEX idx_solicitantes_doc ON solicitantes(numero_identificacion);
CREATE INDEX idx_solicitantes_marca ON solicitantes(cliente_marca);

-- ============================================================================
-- 3. TABLA PRINCIPAL: PQRS_TICKETS (Fase 1 y Fase 2: Datos del caso y sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pqrs_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    radicado VARCHAR(30) UNIQUE NOT NULL, -- Ej: PSM-202608-0042
    solicitante_id UUID NOT NULL REFERENCES solicitantes(id) ON DELETE RESTRICT,
    tipo tipo_pqrs_enum NOT NULL,
    categoria categoria_pqrs_enum NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado estado_pqrs_enum NOT NULL DEFAULT 'ABIERTO',
    prioridad prioridad_enum NOT NULL DEFAULT 'MEDIA',
    
    -- Metadatos automáticos de sistema (Fase 2)
    fecha_radicacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dias_habiles_sla INTEGER NOT NULL DEFAULT 15,
    fecha_cierre_prevista TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_cierre_real TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pqrs_radicado ON pqrs_tickets(radicado);
CREATE INDEX idx_pqrs_estado ON pqrs_tickets(estado);
CREATE INDEX idx_pqrs_tipo ON pqrs_tickets(tipo);
CREATE INDEX idx_pqrs_categoria ON pqrs_tickets(categoria);
CREATE INDEX idx_pqrs_fecha_radicacion ON pqrs_tickets(fecha_radicacion);
CREATE INDEX idx_pqrs_cierre_previsto ON pqrs_tickets(fecha_cierre_prevista);

-- ============================================================================
-- 4. TABLA: GESTION_ANALISIS (Fase 3: Backend - Servicio al Cliente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gestion_analisis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pqrs_id UUID UNIQUE NOT NULL REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    correccion_realizada TEXT, -- Acciones inmediatas ejecutadas
    causas_identificadas TEXT,  -- Análisis causa raíz (ej. 5 porqués / Ishikawa)
    plan_accion TEXT,           -- Solución a mediano / largo plazo
    responsable_area VARCHAR(100), -- Ej: Dirección de Operaciones, Seguridad, Jurídica
    responsable_nombre VARCHAR(150), -- Funcionario o líder asignado
    fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. TABLA: SEGUIMIENTOS_BITACORA (Fase 4: Seguimiento y trazabilidad continua)
-- ============================================================================
CREATE TABLE IF NOT EXISTS seguimientos_bitacora (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pqrs_id UUID NOT NULL REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    agente_nombre VARCHAR(150) NOT NULL,
    agente_cargo VARCHAR(100) NOT NULL,
    tipo_evento tipo_evento_bitacora NOT NULL DEFAULT 'SEGUIMIENTO',
    estado_anterior estado_pqrs_enum,
    estado_nuevo estado_pqrs_enum,
    comentario TEXT NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seguimientos_pqrs ON seguimientos_bitacora(pqrs_id);
CREATE INDEX idx_seguimientos_fecha ON seguimientos_bitacora(fecha_registro);

-- ============================================================================
-- 6. TABLA: CIERRES_EVALUACION (Fase 4: Cierre formal y resultado)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cierres_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pqrs_id UUID UNIQUE NOT NULL REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    agente_cierre VARCHAR(150) NOT NULL,
    resultado_gestion TEXT NOT NULL,
    conforme_locatario BOOLEAN DEFAULT TRUE,
    fecha_cierre TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. TABLA: ADJUNTOS_EVIDENCIA (Fase 1: Fotos, actas y documentos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS adjuntos_evidencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pqrs_id UUID NOT NULL REFERENCES pqrs_tickets(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_url TEXT NOT NULL,
    subido_por VARCHAR(100) DEFAULT 'LOCATARIO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. TABLA: CALENDARIO_FERIADOS_COLOMBIA (Soporte cálculo SLA Días Hábiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feriados_calendario (
    fecha DATE PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL,
    es_emiliani BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE
);

-- Función para generar radicado secuencial único (Ej: PSM-202608-0001)
CREATE OR REPLACE FUNCTION generar_numero_radicado()
RETURNS TRIGGER AS $$
DECLARE
    mes_anio VARCHAR(6);
    siguiente_num INT;
    nuevo_radicado VARCHAR(30);
BEGIN
    mes_anio := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    SELECT COALESCE(COUNT(*), 0) + 1 INTO siguiente_num
    FROM pqrs_tickets
    WHERE TO_CHAR(fecha_radicacion, 'YYYYMM') = mes_anio;
    
    nuevo_radicado := 'PSM-' || mes_anio || '-' || LPAD(siguiente_num::TEXT, 4, '0');
    NEW.radicado := nuevo_radicado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_radicado
BEFORE INSERT ON pqrs_tickets
FOR EACH ROW
WHEN (NEW.radicado IS NULL OR NEW.radicado = '')
EXECUTE FUNCTION generar_numero_radicado();
`;

export const NOSQL_SCHEMA_JSON = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Coleccion_PQRS_SierraMorena",
  "description": "Documento completo de PQRS en MongoDB / Cloud Firestore",
  "type": "object",
  "required": ["_id", "radicado", "fechaRadicacion", "estado", "tipo", "categoria", "solicitante"],
  "properties": {
    "_id": { "type": "string", "description": "ObjectId único de MongoDB o ID de Documento Firestore" },
    "radicado": { "type": "string", "example": "PSM-202608-0042" },
    "fechaRadicacion": { "type": "string", "format": "date-time" },
    "estado": { "type": "string", "enum": ["ABIERTO", "EN_REVISION", "PLAN_ACCION", "RESUELTO", "CERRADO"] },
    "prioridad": { "type": "string", "enum": ["BAJA", "MEDIA", "ALTA", "URGENTE"] },
    "tipo": { "type": "string", "enum": ["PETICION", "QUEJA", "RECLAMO", "SUGERENCIA"] },
    "categoria": { "type": "string", "enum": ["MANTENIMIENTO", "SEGURIDAD", "ASEO", "INFRAESTRUCTURA", "FACTURACION_COBROS", "CONVIVENCIA", "LOCACIONES_COMERCIALES", "OTRO"] },
    "asunto": { "type": "string" },
    "descripcion": { "type": "string" },
    
    "solicitante": {
      "type": "object",
      "required": ["esAnonimo", "autorizacionHabeasData"],
      "properties": {
        "esAnonimo": { "type": "boolean" },
        "nombreCompleto": { "type": "string" },
        "tipoDocumento": { "type": "string", "enum": ["CC", "NIT", "CE", "PASAPORTE"] },
        "numeroIdentificacion": { "type": "string" },
        "clienteMarca": { "type": "string" },
        "numeroLocal": { "type": "string" },
        "telefono": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "autorizacionHabeasData": { "type": "boolean" }
      }
    },

    "adjuntos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "nombre": { "type": "string" },
          "tamano": { "type": "number" },
          "tipo": { "type": "string" },
          "url": { "type": "string" }
        }
      }
    },

    "gestion": {
      "type": "object",
      "properties": {
        "correccionRealizada": { "type": "string" },
        "causasIdentificadas": { "type": "string" },
        "planAccion": { "type": "string" },
        "responsableArea": { "type": "string" },
        "responsableNombre": { "type": "string" },
        "diasHabilesSLA": { "type": "integer", "default": 15 },
        "fechaCierrePrevista": { "type": "string", "format": "date-time" }
      }
    },

    "seguimientos": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "fecha", "agenteNombre", "comentario", "tipoEvento"],
        "properties": {
          "id": { "type": "string" },
          "fecha": { "type": "string", "format": "date-time" },
          "agenteNombre": { "type": "string" },
          "agenteCargo": { "type": "string" },
          "comentario": { "type": "string" },
          "tipoEvento": { "type": "string" },
          "estadoAnterior": { "type": "string" },
          "estadoNuevo": { "type": "string" }
        }
      }
    },

    "cierre": {
      "type": "object",
      "properties": {
        "fechaCierreReal": { "type": "string", "format": "date-time" },
        "agenteCierre": { "type": "string" },
        "resultadoGestion": { "type": "string" },
        "conformeLocatario": { "type": "boolean" }
      }
    }
  }
}`;

export const BACKEND_API_MATRIX = [
  {
    metodo: 'POST',
    endpoint: '/api/pqrs',
    fase: 'Fase 1 & 2',
    rol: 'Locatario / Público',
    descripcion: 'Radicación de nueva PQRS. Autogenera número de radicado y calcula fecha estimada de SLA.',
    bodyEjemplo: `{
  "solicitante": {
    "esAnonimo": false,
    "nombreCompleto": "Carlos Andrés Montoya",
    "tipoDocumento": "NIT",
    "numeroIdentificacion": "900.823.112-4",
    "clienteMarca": "Café Sierra Gourmet",
    "numeroLocal": "Local 204 - Nivel 2",
    "telefono": "+57 312 456 7890",
    "email": "gerencia@cafesierra.com",
    "autorizacionHabeasData": true
  },
  "tipo": "RECLAMO",
  "categoria": "MANTENIMIENTO",
  "asunto": "Filtración persistente en cubierta de aire acondicionado",
  "descripcion": "Desde hace 48 horas se presenta goteo sobre el área de caja registradora...",
  "adjuntos": []
}`
  },
  {
    metodo: 'GET',
    endpoint: '/api/pqrs',
    fase: 'Fase 2, 3, 4',
    rol: 'Administración',
    descripcion: 'Listado con paginación, filtros multicriterio (estado, categoría, tipo, estado SLA) y ordenación.',
    parametros: 'query: { estado, tipo, categoria, slaStatus, search, page, limit }'
  },
  {
    metodo: 'GET',
    endpoint: '/api/pqrs/:radicadoOrId',
    fase: 'Fase 1, 2, 3, 4',
    rol: 'Locatario / Admin',
    descripcion: 'Consulta detallada de un caso con métricas dinámicas de días hábiles transcurridos y restantes.'
  },
  {
    metodo: 'PATCH',
    endpoint: '/api/pqrs/:id/gestion',
    fase: 'Fase 3: Gestión y Análisis',
    rol: 'Servicio al Cliente',
    descripcion: 'Registra acciones inmediatas, análisis de causas raíz, plan de acción y responsable asignado.',
    bodyEjemplo: `{
  "correccionRealizada": "Se cerró la válvula matriz y se colocó impermeabilizante provisional.",
  "causasIdentificadas": "Obstrucción en bajante de condensados por residuos de polvillo de obra contigua.",
  "planAccion": "Cambio total del tramo de tubería PVC de 1.5 pulgadas y sellado térmico programado.",
  "responsableArea": "Mantenimiento e Infraestructura",
  "responsableNombre": "Ing. Roberto Salcedo",
  "nuevoEstado": "PLAN_ACCION"
}`
  },
  {
    metodo: 'POST',
    endpoint: '/api/pqrs/:id/seguimiento',
    fase: 'Fase 4: Seguimiento',
    rol: 'Servicio al Cliente',
    descripcion: 'Añade una entrada a la bitácora inmutable de trazabilidad y notifica cambios al locatario.',
    bodyEjemplo: `{
  "agenteNombre": "Carolina Vélez",
  "agenteCargo": "Coordinadora de Calidad y SAC",
  "comentario": "Se realizó visita técnica con el contratista. Se aprueba presupuesto de repuesto.",
  "tipoEvento": "SEGUIMIENTO"
}`
  },
  {
    metodo: 'PATCH',
    endpoint: '/api/pqrs/:id/cerrar',
    fase: 'Fase 4: Cierre',
    rol: 'Servicio al Cliente',
    descripcion: 'Cierra formalmente el caso, fija la fecha de cierre real y registra comentarios concluyentes.',
    bodyEjemplo: `{
  "agenteCierre": "Carolina Vélez",
  "resultadoGestion": "Tubería sustituida con éxito y pruebas hidrostáticas sin fugas. Locatario firma recibido a satisfacción.",
  "conformeLocatario": true
}`
  },
  {
    metodo: 'GET',
    endpoint: '/api/metricas',
    fase: 'Dashboard Analítico',
    rol: 'Gerencia y SAC',
    descripcion: 'Indicadores clave de rendimiento (KPIs): % cumplimiento SLA, tiempos promedio de resolución, casos por categoría.'
  }
];

export const SLA_EXPLANATION_MARKDOWN = `
### Lógica Matemática y Regulatoria de Tiempos (SLA)

#### 1. Marco Normativo y Reglas de Negocio
* **Ley 1755 de 2015 (Colombia):** Regula el derecho fundamental de petición. Establece que los términos se cuentan en **días hábiles** (excluyendo sábados, domingos y festivos oficiales).
  - Peticiones de interés general/particular: **15 días hábiles**.
  - Quejas y Reclamos: **15 días hábiles**.
  - Peticiones de información o documentos: **10 días hábiles**.
  - Sugerencias / Mejoras: **10 días hábiles** (Políticas de Servicio Promotora Sierra Morena).
  - Casos urgentes de Seguridad / Riesgo Físico: **3 días hábiles**.

#### 2. Descuento de Feriados Oficiales (Ley Emiliani - Ley 51 de 1983)
El motor de cálculo implementa:
1. **Festivos Fijos:** 1 de Enero, 1 de Mayo, 20 de Julio, 7 de Agosto, 8 de Diciembre, 25 de Diciembre.
2. **Festivos Trasladados al Lunes (Ley Emiliani):** Reyes Magos, San José, San Pedro y San Pablo, Asunción de la Virgen, Día de la Raza, Todos los Santos, Independencia de Cartagena.
3. **Festivos Móviles de Pascua (Semana Santa):** Jueves Santo, Viernes Santo, Ascensión del Señor, Corpus Christi y Sagrado Corazón.

#### 3. Fórmulas de Cálculo Dinámico
- **Días desde la Recepción ($D_{rec}$):**
  $$\\text{Días Transcurridos} = \\sum_{t=\\text{Fecha Radicación}}^{\\text{Fecha Actual}} [\\text{esDíaHábil}(t)]$$
- **Días para el Cierre ($D_{rem}$):**
  $$\\text{Días Restantes} = \\sum_{t=\\text{Fecha Actual}}^{\\text{Fecha Prevista SLA}} [\\text{esDíaHábil}(t)]$$
  *(Si la fecha actual supera la fecha prevista, el resultado es negativo, indicando días de mora).*
- **Semáforo de SLA:**
  - **A Tiempo (Verde):** $D_{rem} > 2$ días hábiles.
  - **En Riesgo (Amarillo):** $0 \\le D_{rem} \\le 2$ días hábiles.
  - **Vencido (Rojo):** $D_{rem} < 0$ días hábiles.
  - **Cumplido (Azul / Esmeralda):** Resuelto/Cerrado dentro del plazo contractual.
`;
