// src/store/reservasSlice.js
// Slice de Redux Toolkit para la entidad principal: Reservas del CESPAR URP
import { createSlice, nanoid, createSelector } from '@reduxjs/toolkit';
import { aISO, sumarDias, horaAMinutos } from '../utils/fechas';
import { estadoEfectivo, estaActiva } from '../utils/reservas';

const CARACTERES_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarCodigo() {
  let sufijo = '';
  for (let i = 0; i < 5; i += 1) {
    sufijo += CARACTERES_CODIGO[Math.floor(Math.random() * CARACTERES_CODIGO.length)];
  }
  return `URP-${sufijo}`;
}

const hoy = new Date();

// Mínimo 3 datos iniciales para la entidad principal
const initialState = {
  items: [
    {
      id: 'res-demo-1',
      codigo: 'URP-8F2K4',
      ambienteId: 'grass-1',
      fecha: aISO(sumarDias(hoy, 1)),
      horas: ['18:00', '19:00'],
      personas: 14,
      observaciones: 'Entrenamiento interfacultades de Ingeniería',
      estado: 'confirmada',
      creadaEn: new Date(Date.now() - 86400000).toISOString(),
      monto: 80,
      motivoCancelacion: null,
      canceladaEn: null,
    },
    {
      id: 'res-demo-2',
      codigo: 'URP-3M9X1',
      ambienteId: 'multi-1',
      fecha: aISO(sumarDias(hoy, 3)),
      horas: ['10:00', '11:00'],
      personas: 35,
      observaciones: 'Torneo relámpago de vóley y básquet',
      estado: 'pendiente',
      creadaEn: new Date(Date.now() - 43200000).toISOString(),
      monto: 120,
      motivoCancelacion: null,
      canceladaEn: null,
    },
    {
      id: 'res-demo-3',
      codigo: 'URP-5P7L9',
      ambienteId: 'losa-1',
      fecha: aISO(sumarDias(hoy, -2)),
      horas: ['15:00', '16:00'],
      personas: 10,
      observaciones: 'Pichanga de confraternidad',
      estado: 'confirmada',
      creadaEn: new Date(Date.now() - 259200000).toISOString(),
      monto: 50,
      motivoCancelacion: null,
      canceladaEn: null,
    },
  ],
};

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {
    // Reducer para crear con prepare (genera id único, código URP y fecha ISO)
    agregarReserva: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ ambienteId, fecha, horas, personas, observaciones, nombreGrupo = '', celular = '',
        tipoActividad = '', tarifaPorHora = 0, requiereAprobacion = false }) {
        const horasOrdenadas = [...horas].sort((a, b) => horaAMinutos(a) - horaAMinutos(b));
        return {
          payload: {
            id: nanoid(),
            codigo: generarCodigo(),
            ambienteId,
            fecha,
            horas: horasOrdenadas,
            personas: personas || 1,
            nombreGrupo,
            celular,
            tipoActividad,
            observaciones: observaciones ? observaciones.trim() : '',
            estado: requiereAprobacion ? 'pendiente' : 'confirmada',
            creadaEn: new Date().toISOString(),
            monto: tarifaPorHora * horasOrdenadas.length,
            motivoCancelacion: null,
            canceladaEn: null,
          },
        };
      },
    },

    // Reducer para cambiar el estado (por ejemplo marcar como resuelto/confirmado)
    cambiarEstado(state, action) {
      const { id, estado } = action.payload;
      const reserva = state.items.find((r) => r.id === id);
      if (reserva) {
        reserva.estado = estado;
      }
    },

    // Reducer para cancelar reserva
    cancelarReserva(state, action) {
      const { id, motivo } = action.payload;
      const reserva = state.items.find((r) => r.id === id);
      if (reserva) {
        reserva.estado = 'cancelada';
        reserva.motivoCancelacion = motivo || 'Cancelada por el estudiante';
        reserva.canceladaEn = new Date().toISOString();
      }
    },

    // Reducer para eliminar reserva
    eliminarReserva(state, action) {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },

    // Reducer para hidratar desde AsyncStorage
    reemplazarTodas(state, action) {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      }
    },
  },
});

export const {
  agregarReserva,
  cambiarEstado,
  cancelarReserva,
  eliminarReserva,
  reemplazarTodas,
} = reservasSlice.actions;

// --- SELECTORES ---

// Lista completa de reservas
export const selectReservas = (state) => state.reservas.items;

// Selector por id
export const selectReservaPorId = (id) => (state) =>
  state.reservas.items.find((r) => r.id === id) || null;

// Selector derivado memoizado: reservas activas (confirmadas o pendientes)
export const selectReservasActivas = createSelector(
  [selectReservas],
  (items) => items.filter(estaActiva),
);

// Selector derivado: horas reservadas por mí para un ambiente y fecha
export const selectHorasReservadasPorMi = (ambienteId, fecha) => (state) => {
  const conjunto = new Set();
  state.reservas.items
    .filter(
      (r) =>
        r.ambienteId === ambienteId &&
        r.fecha === fecha &&
        estadoEfectivo(r) !== 'cancelada',
    )
    .forEach((r) => {
      r.horas.forEach((h) => conjunto.add(h));
    });
  return conjunto;
};

// Selector derivado memoizado: próxima reserva activa
export const selectProximaReserva = createSelector(
  [selectReservasActivas],
  (activas) => {
    if (activas.length === 0) return null;

    return [...activas].sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return horaAMinutos(a.horas[0]) - horaAMinutos(b.horas[0]);
    })[0];
  },
);

// Selector derivado memoizado: estadísticas globales (activas, horas, historial, etc.)
export const selectEstadisticas = createSelector(
  [selectReservas],
  (items) => {
    const activas = items.filter(estaActiva);
    const historial = items.filter((r) => estadoEfectivo(r) === 'finalizada');
    const canceladas = items.filter((r) => estadoEfectivo(r) === 'cancelada');

    const horasReservadas = activas.reduce((total, r) => total + r.horas.length, 0);

    return {
      total: items.length,
      activas: activas.length,
      historial: historial.length,
      canceladas: canceladas.length,
      horasReservadas,
    };
  },
);

export default reservasSlice.reducer;

