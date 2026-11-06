import { z } from 'zod';
import { obtenerAmbiente } from '../data/ambientes';
import { BLOQUES_HORARIOS, bloqueDisponible } from '../utils/disponibilidad';
import { aISO, hoyISO, sumarDias } from '../utils/fechas';
import { estaActiva, estadoEfectivo, MAX_RESERVAS_ACTIVAS } from '../utils/reservas';
import { celularSchema } from './contactoSchema';

export const TIPOS_ACTIVIDAD = [
  { valor: 'entrenamiento', etiqueta: 'Entrenamiento' },
  { valor: 'campeonato', etiqueta: 'Campeonato' },
  { valor: 'recreacion', etiqueta: 'Recreación' },
];

export const reservaVacia = {
  ambienteId: '', fecha: '', horas: [], nombreGrupo: '', celular: '', tipoActividad: '',
  personas: 1, observaciones: '',
};

// Lee el store al validar, no una captura antigua al abrir la pantalla.
export const crearReservaSchema = (obtenerReservas = () => []) => z.object({
  ambienteId: z.string({ error: 'Elige un ambiente disponible' }).refine(
    (id) => Boolean(obtenerAmbiente(id)) && !obtenerAmbiente(id).mantenimiento,
    'Elige un ambiente disponible',
  ),
  fecha: z.string({ error: 'Elige una fecha válida' }).refine((fecha) => {
    const date = new Date(`${fecha}T12:00:00`);
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(date.getTime()) &&
      aISO(date) === fecha && fecha >= hoyISO() && fecha <= aISO(sumarDias(new Date(), 13));
  }, 'Elige una fecha dentro de los próximos 14 días'),
  horas: z.array(z.enum(BLOQUES_HORARIOS, { error: 'Elige un bloque horario válido' }), {
    error: 'Elige entre 1 y 4 bloques',
  }).min(1, 'Elige entre 1 y 4 bloques').max(4, 'Elige entre 1 y 4 bloques')
    .refine((horas) => new Set(horas).size === horas.length, 'No repitas un bloque horario'),
  nombreGrupo: z.string({ error: 'Ingresa el nombre del grupo' }).trim()
    .min(5, 'El nombre del grupo debe tener al menos 5 caracteres').max(60, 'Máximo 60 caracteres'),
  celular: celularSchema,
  tipoActividad: z.enum(['entrenamiento', 'campeonato', 'recreacion'], {
    error: 'Elige el tipo de actividad',
  }),
  personas: z.number({ error: 'Indica el número de personas' })
    .int('El número de personas debe ser entero').min(1, 'Indica al menos una persona'),
  observaciones: z.string({ error: 'Escribe observaciones válidas' }).trim().max(180, 'Máximo 180 caracteres'),
}).superRefine((datos, ctx) => {
  const ambiente = obtenerAmbiente(datos.ambienteId);
  const reservas = obtenerReservas();
  if (ambiente && datos.personas > ambiente.capacidad) {
    ctx.addIssue({ code: 'custom', path: ['personas'], message: `No superes el aforo de ${ambiente.capacidad} personas` });
  }
  if (reservas.filter(estaActiva).length >= MAX_RESERVAS_ACTIVAS) {
    ctx.addIssue({ code: 'custom', path: ['root', 'limite'], message: 'Ya tienes 3 reservas activas; cancela una para continuar' });
  }
  const cruce = reservas.some((r) => r.ambienteId === datos.ambienteId &&
    r.fecha === datos.fecha && estadoEfectivo(r) !== 'cancelada' &&
    r.horas.some((hora) => datos.horas.includes(hora)));
  if (cruce || datos.horas.some((hora) => !bloqueDisponible(datos.ambienteId, datos.fecha, hora))) {
    ctx.addIssue({ code: 'custom', path: ['horas'], message: 'El horario ya no está disponible; vuelve a elegir' });
  }
});
