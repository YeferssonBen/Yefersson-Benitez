import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LocatarioPortal } from './components/LocatarioPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { TicketDetailModal } from './components/TicketDetailModal';
import { PQRS, MetricasDashboard } from './types';
import { INITIAL_PQRS_DATA } from './data/mockData';
import { calculatePQRSMetrics } from './utils/slaCalculator';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'locatario' | 'admin' | 'arquitectura'>('admin');
  const [tickets, setTickets] = useState<PQRS[]>([]);
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<PQRS | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/pqrs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTickets(json.data);
        }
      } else {
        // Fallback to local enrichment
        setTickets(INITIAL_PQRS_DATA.map(t => {
          const m = calculatePQRSMetrics(t);
          return {
            ...t,
            diasDesdeRecepcionHabiles: m.diasDesdeRecepcion,
            diasParaCierreHabiles: m.diasParaCierre,
            estadoSLA: m.estadoSLA
          };
        }));
      }
    } catch {
      // Fallback
      setTickets(INITIAL_PQRS_DATA.map(t => {
        const m = calculatePQRSMetrics(t);
        return {
          ...t,
          diasDesdeRecepcionHabiles: m.diasDesdeRecepcion,
          diasParaCierreHabiles: m.diasParaCierre,
          estadoSLA: m.estadoSLA
        };
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetricas = async () => {
    try {
      const res = await fetch('/api/metricas');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMetricas(json.data);
        }
      }
    } catch (e) {
      console.warn('Could not fetch metricas from API, using client calculations', e);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchMetricas();
  }, []);

  // Radicar PQRS (Fase 1)
  const handleRadicarPQRS = async (formData: any): Promise<PQRS> => {
    const res = await fetch('/api/pqrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al radicar PQRS');
    }

    const data = await res.json();
    await fetchTickets();
    await fetchMetricas();
    return data.data;
  };

  // Consultar PQRS por Radicado
  const handleConsultarPQRS = async (radicado: string): Promise<PQRS | null> => {
    const res = await fetch(`/api/pqrs/${encodeURIComponent(radicado)}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data || null;
  };

  // Actualizar Gestión y Análisis (Fase 3)
  const handleUpdateGestion = async (id: string, gestionData: any) => {
    const res = await fetch(`/api/pqrs/${id}/gestion`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gestionData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al actualizar gestión');
    }

    const data = await res.json();
    setSelectedTicket(data.data);
    await fetchTickets();
    await fetchMetricas();
  };

  // Agregar Seguimiento (Fase 4)
  const handleAddSeguimiento = async (id: string, seguimientoData: any) => {
    const res = await fetch(`/api/pqrs/${id}/seguimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seguimientoData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al agregar seguimiento');
    }

    const data = await res.json();
    setSelectedTicket(data.data);
    await fetchTickets();
    await fetchMetricas();
  };

  // Cerrar Caso Formalmente (Fase 4)
  const handleCerrarTicket = async (id: string, cierreData: any) => {
    const res = await fetch(`/api/pqrs/${id}/cerrar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cierreData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al cerrar ticket');
    }

    const data = await res.json();
    setSelectedTicket(data.data);
    await fetchTickets();
    await fetchMetricas();
  };

  // Reiniciar Demo
  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      await fetchTickets();
      await fetchMetricas();
      setSelectedTicket(null);
    } catch (e) {
      console.error(e);
    }
  };

  const openTicketsCount = tickets.filter(t => t.estado !== 'CERRADO').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top App Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        openTicketsCount={openTicketsCount}
      />

      {/* Main Views Container */}
      <main className="flex-1 pb-16">
        {currentTab === 'locatario' && (
          <LocatarioPortal 
            onRadicarPQRS={handleRadicarPQRS}
            onConsultarPQRS={handleConsultarPQRS}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard 
            tickets={tickets}
            metricas={metricas}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onRefresh={() => { fetchTickets(); fetchMetricas(); }}
            onResetDemo={handleResetDemo}
          />
        )}

        {currentTab === 'arquitectura' && (
          <ArchitectureViewer />
        )}
      </main>

      {/* Global Ticket Management Modal (Fase 1, 2, 3 y 4) */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateGestion={handleUpdateGestion}
          onAddSeguimiento={handleAddSeguimiento}
          onCerrarTicket={handleCerrarTicket}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Promotora Sierra Morena • Sistema de Gestión de PQRS</span>
          <span className="font-mono text-slate-400">Cumplimiento Ley 1755 de 2015 & Ley 1581 de 2012</span>
        </div>
      </footer>

    </div>
  );
}
