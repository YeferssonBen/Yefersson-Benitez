import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PQRS_DATA } from './src/data/mockData';
import { PQRS, PQRSStatus, PQRSType, PQRSCategory, MetricasDashboard } from './src/types';
import { calculatePQRSMetrics, addBusinessDays, SLA_RULES, getColombianHolidays } from './src/utils/slaCalculator';

// In-memory data store for the live server instance
let pqrsStore: PQRS[] = JSON.parse(JSON.stringify(INITIAL_PQRS_DATA));

function enrichPQRS(item: PQRS): PQRS {
  const metrics = calculatePQRSMetrics(item);
  return {
    ...item,
    diasDesdeRecepcionHabiles: metrics.diasDesdeRecepcion,
    diasParaCierreHabiles: metrics.diasParaCierre,
    estadoSLA: metrics.estadoSLA
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // ==========================================
  // BACKEND REST API ENDPOINTS
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'PQRS Sierra Morena API', timestamp: new Date().toISOString() });
  });

  // 1. List PQRS with search and filters
  app.get('/api/pqrs', (req, res) => {
    const { estado, tipo, categoria, slaStatus, search } = req.query;

    let results = pqrsStore.map(enrichPQRS);

    if (estado && typeof estado === 'string' && estado !== 'TODOS') {
      results = results.filter(item => item.estado === estado);
    }

    if (tipo && typeof tipo === 'string' && tipo !== 'TODOS') {
      results = results.filter(item => item.tipo === tipo);
    }

    if (categoria && typeof categoria === 'string' && categoria !== 'TODOS') {
      results = results.filter(item => item.categoria === categoria);
    }

    if (slaStatus && typeof slaStatus === 'string' && slaStatus !== 'TODOS') {
      results = results.filter(item => item.estadoSLA === slaStatus);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(item => 
        item.radicado.toLowerCase().includes(q) ||
        item.asunto.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        (item.solicitante.nombreCompleto && item.solicitante.nombreCompleto.toLowerCase().includes(q)) ||
        (item.solicitante.clienteMarca && item.solicitante.clienteMarca.toLowerCase().includes(q)) ||
        (item.solicitante.numeroIdentificacion && item.solicitante.numeroIdentificacion.includes(q))
      );
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.fechaRadicacion).getTime() - new Date(a.fechaRadicacion).getTime());

    res.json({ success: true, count: results.length, data: results });
  });

  // 2. Get Single PQRS by ID or Radicado
  app.get('/api/pqrs/:idOrRadicado', (req, res) => {
    const { idOrRadicado } = req.params;
    const item = pqrsStore.find(
      p => p.id === idOrRadicado || p.radicado.toLowerCase() === idOrRadicado.toLowerCase()
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'PQRS no encontrada con el identificador o radicado suministrado.' });
    }

    res.json({ success: true, data: enrichPQRS(item) });
  });

  // 3. Create PQRS (Fase 1: Radicación Locatario + Fase 2: Metadatos automáticos)
  app.post('/api/pqrs', (req, res) => {
    try {
      const { solicitante, tipo, categoria, asunto, descripcion, adjuntos, prioridad } = req.body;

      if (!tipo || !categoria || !asunto || !descripcion) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para radicar la PQRS.' });
      }

      if (!solicitante || (!solicitante.esAnonimo && (!solicitante.nombreCompleto || !solicitante.numeroIdentificacion))) {
        return res.status(400).json({ success: false, message: 'Para radicaciones nominativas se requiere nombre e identificación.' });
      }

      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate next sequential number for current month
      const currentMonthCount = pqrsStore.filter(p => p.radicado.includes(`PSM-${yearMonth}`)).length;
      const sequence = String(currentMonthCount + 1).padStart(4, '0');
      const radicado = `PSM-${yearMonth}-${sequence}`;

      const diasSLA = SLA_RULES[tipo as PQRSType]?.diasHabiles || 15;
      const fechaCierrePrevista = addBusinessDays(now, diasSLA).toISOString();

      const newPQRS: PQRS = {
        id: `pqrs-${Date.now()}`,
        radicado,
        fechaRadicacion: now.toISOString(),
        solicitante: {
          esAnonimo: Boolean(solicitante.esAnonimo),
          nombreCompleto: solicitante.esAnonimo ? undefined : solicitante.nombreCompleto,
          tipoDocumento: solicitante.esAnonimo ? undefined : solicitante.tipoDocumento || 'CC',
          numeroIdentificacion: solicitante.esAnonimo ? undefined : solicitante.numeroIdentificacion,
          clienteMarca: solicitante.clienteMarca || (solicitante.esAnonimo ? 'Anónimo' : 'No especificado'),
          numeroLocal: solicitante.numeroLocal || '',
          telefono: solicitante.esAnonimo ? undefined : solicitante.telefono,
          email: solicitante.esAnonimo ? undefined : solicitante.email,
          autorizacionHabeasData: Boolean(solicitante.autorizacionHabeasData)
        },
        tipo: tipo as PQRSType,
        categoria: categoria as PQRSCategory,
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        adjuntos: Array.isArray(adjuntos) ? adjuntos : [],
        estado: 'ABIERTO',
        prioridad: prioridad || 'MEDIA',
        gestion: {
          diasHabilesSLA: diasSLA,
          fechaCierrePrevista
        },
        seguimientos: [
          {
            id: `seg-${Date.now()}-1`,
            fecha: now.toISOString(),
            agenteNombre: 'Sistema Automatizado SAC',
            agenteCargo: 'Plataforma Digital Sierra Morena',
            comentario: `PQRS radicada exitosamente bajo el radicado ${radicado}. Plazo legal de respuesta: ${diasSLA} días hábiles.`,
            tipoEvento: 'CREACION',
            estadoNuevo: 'ABIERTO'
          }
        ]
      };

      pqrsStore.unshift(newPQRS);

      res.status(201).json({
        success: true,
        message: 'PQRS radicada satisfactoriamente con número único.',
        data: enrichPQRS(newPQRS)
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error al procesar la radicación: ' + error.message });
    }
  });

  // 4. Update Gestión y Análisis (Fase 3: Servicio al Cliente)
  app.patch('/api/pqrs/:id/gestion', (req, res) => {
    const { id } = req.params;
    const { 
      correccionRealizada, 
      causasIdentificadas, 
      planAccion, 
      responsableArea, 
      responsableNombre, 
      fechaCierrePrevista,
      nuevoEstado,
      agenteNombre,
      agenteCargo
    } = req.body;

    const index = pqrsStore.findIndex(p => p.id === id || p.radicado === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'PQRS no encontrada.' });
    }

    const item = pqrsStore[index];
    const estadoAnterior = item.estado;

    item.gestion = {
      ...item.gestion,
      correccionRealizada: correccionRealizada !== undefined ? correccionRealizada : item.gestion.correccionRealizada,
      causasIdentificadas: causasIdentificadas !== undefined ? causasIdentificadas : item.gestion.causasIdentificadas,
      planAccion: planAccion !== undefined ? planAccion : item.gestion.planAccion,
      responsableArea: responsableArea !== undefined ? responsableArea : item.gestion.responsableArea,
      responsableNombre: responsableNombre !== undefined ? responsableNombre : item.gestion.responsableNombre,
      fechaCierrePrevista: fechaCierrePrevista || item.gestion.fechaCierrePrevista
    };

    if (nuevoEstado && nuevoEstado !== item.estado) {
      item.estado = nuevoEstado as PQRSStatus;
    }

    // Agregar seguimiento automático del cambio de gestión
    item.seguimientos.push({
      id: `seg-${Date.now()}`,
      fecha: new Date().toISOString(),
      agenteNombre: agenteNombre || 'Servicio al Cliente',
      agenteCargo: agenteCargo || 'Gestor SAC',
      comentario: `Actualización de gestión (Fase 3): ${correccionRealizada ? 'Corrección registrada. ' : ''}${planAccion ? 'Plan de acción formulado. ' : ''}${responsableArea ? 'Área asignada: ' + responsableArea : ''}`,
      tipoEvento: 'PLAN_ACCION',
      estadoAnterior,
      estadoNuevo: item.estado
    });

    pqrsStore[index] = item;
    res.json({ success: true, message: 'Gestión y análisis actualizado con éxito.', data: enrichPQRS(item) });
  });

  // 5. Add Seguimiento Bitácora (Fase 4: Seguimiento continuo)
  app.post('/api/pqrs/:id/seguimiento', (req, res) => {
    const { id } = req.params;
    const { agenteNombre, agenteCargo, comentario, nuevoEstado, tipoEvento } = req.body;

    if (!comentario) {
      return res.status(400).json({ success: false, message: 'El comentario de seguimiento es obligatorio.' });
    }

    const index = pqrsStore.findIndex(p => p.id === id || p.radicado === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'PQRS no encontrada.' });
    }

    const item = pqrsStore[index];
    const estadoAnterior = item.estado;

    if (nuevoEstado && nuevoEstado !== item.estado) {
      item.estado = nuevoEstado as PQRSStatus;
    }

    item.seguimientos.push({
      id: `seg-${Date.now()}`,
      fecha: new Date().toISOString(),
      agenteNombre: agenteNombre || 'Agente de Servicio',
      agenteCargo: agenteCargo || 'Analista SAC',
      comentario: comentario.trim(),
      tipoEvento: tipoEvento || (nuevoEstado ? 'CAMBIO_ESTADO' : 'SEGUIMIENTO'),
      estadoAnterior,
      estadoNuevo: item.estado
    });

    pqrsStore[index] = item;
    res.json({ success: true, message: 'Seguimiento registrado exitosamente.', data: enrichPQRS(item) });
  });

  // 6. Close Ticket (Fase 4: Cierre formal y resultado)
  app.patch('/api/pqrs/:id/cerrar', (req, res) => {
    const { id } = req.params;
    const { agenteCierre, resultadoGestion, conformeLocatario } = req.body;

    if (!resultadoGestion) {
      return res.status(400).json({ success: false, message: 'Debe ingresar el resultado o conclusión de la gestión para cerrar el caso.' });
    }

    const index = pqrsStore.findIndex(p => p.id === id || p.radicado === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'PQRS no encontrada.' });
    }

    const item = pqrsStore[index];
    const estadoAnterior = item.estado;

    item.estado = 'CERRADO';
    item.cierre = {
      fechaCierreReal: new Date().toISOString(),
      agenteCierre: agenteCierre || 'Coordinación Servicio al Cliente',
      resultadoGestion: resultadoGestion.trim(),
      conformeLocatario: conformeLocatario !== undefined ? Boolean(conformeLocatario) : true
    };

    item.seguimientos.push({
      id: `seg-${Date.now()}`,
      fecha: new Date().toISOString(),
      agenteNombre: agenteCierre || 'Coordinación SAC',
      agenteCargo: 'Cierre de Caso',
      comentario: `Caso cerrado formalmente. Resultado: ${resultadoGestion}`,
      tipoEvento: 'CIERRE',
      estadoAnterior,
      estadoNuevo: 'CERRADO'
    });

    pqrsStore[index] = item;
    res.json({ success: true, message: 'Caso de PQRS cerrado exitosamente.', data: enrichPQRS(item) });
  });

  // 7. Get General Metrics Dashboard
  app.get('/api/metricas', (req, res) => {
    const items = pqrsStore.map(enrichPQRS);

    const total = items.length;
    const abiertas = items.filter(i => i.estado === 'ABIERTO').length;
    const enRevision = items.filter(i => i.estado === 'EN_REVISION').length;
    const planAccion = items.filter(i => i.estado === 'PLAN_ACCION').length;
    const resueltas = items.filter(i => i.estado === 'RESUELTO').length;
    const cerradas = items.filter(i => i.estado === 'CERRADO').length;

    const aTiempo = items.filter(i => i.estadoSLA === 'A_TIEMPO').length;
    const enRiesgo = items.filter(i => i.estadoSLA === 'EN_RIESGO').length;
    const vencidos = items.filter(i => i.estadoSLA === 'VENCIDO').length;
    const cumplidos = items.filter(i => i.estadoSLA === 'CUMPLIDO').length;

    const baseCumplimiento = total > 0 ? ((aTiempo + cumplidos) / total) * 100 : 100;

    const distribucionTipo: Record<PQRSType, number> = {
      PETICION: items.filter(i => i.tipo === 'PETICION').length,
      QUEJA: items.filter(i => i.tipo === 'QUEJA').length,
      RECLAMO: items.filter(i => i.tipo === 'RECLAMO').length,
      SUGERENCIA: items.filter(i => i.tipo === 'SUGERENCIA').length,
    };

    const distribucionCategoria: Record<PQRSCategory, number> = {
      MANTENIMIENTO: items.filter(i => i.categoria === 'MANTENIMIENTO').length,
      SEGURIDAD: items.filter(i => i.categoria === 'SEGURIDAD').length,
      ASEO: items.filter(i => i.categoria === 'ASEO').length,
      INFRAESTRUCTURA: items.filter(i => i.categoria === 'INFRAESTRUCTURA').length,
      FACTURACION_COBROS: items.filter(i => i.categoria === 'FACTURACION_COBROS').length,
      CONVIVENCIA: items.filter(i => i.categoria === 'CONVIVENCIA').length,
      LOCACIONES_COMERCIALES: items.filter(i => i.categoria === 'LOCACIONES_COMERCIALES').length,
      OTRO: items.filter(i => i.categoria === 'OTRO').length,
    };

    // Promedio de días de cierre en cerradas
    const cerradasItems = items.filter(i => i.estado === 'CERRADO' && i.diasDesdeRecepcionHabiles !== undefined);
    const sumaDias = cerradasItems.reduce((acc, curr) => acc + (curr.diasDesdeRecepcionHabiles || 0), 0);
    const promedioDiasCierre = cerradasItems.length > 0 ? Number((sumaDias / cerradasItems.length).toFixed(1)) : 3.5;

    const metricas: MetricasDashboard = {
      total,
      abiertas,
      enRevision,
      planAccion,
      resueltas,
      cerradas,
      cumplimientoSLA: {
        aTiempo,
        enRiesgo,
        vencidos,
        cumplidos,
        porcentajeCumplimiento: Math.round(baseCumplimiento)
      },
      distribucionTipo,
      distribucionCategoria,
      promedioDiasCierre
    };

    res.json({ success: true, data: metricas });
  });

  // 8. SLA Config & Holidays info
  app.get('/api/sla-config', (req, res) => {
    const currentYear = new Date().getFullYear();
    const holidays = getColombianHolidays(currentYear);
    res.json({
      success: true,
      rules: SLA_RULES,
      year: currentYear,
      holidaysCount: holidays.length,
      holidays
    });
  });

  // Reset Demo
  app.post('/api/reset-demo', (req, res) => {
    pqrsStore = JSON.parse(JSON.stringify(INITIAL_PQRS_DATA));
    res.json({ success: true, message: 'Datos de demostración reiniciados.' });
  });

  // ==========================================
  // VITE MIDDLEWARE INTEGRATION
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Promotora Sierra Morena] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
