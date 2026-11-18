import { z } from 'zod';

export const TIPOS_MENSAJE = [
  { valor: 'sugerencia', etiqueta: 'Sugerencia' },
  { valor: 'error', etiqueta: 'Reportar error' },
  { valor: 'consulta', etiqueta: 'Consulta' },
];

export const celularSchema = z.string({ error: 'Ingresa tu celular' }).trim()
  .regex(/^9\d{8}$/, 'El celular debe tener 9 dígitos y empezar con 9');

export const contactoSchema = z.object({
  nombre: z.string({ error: 'Ingresa tu nombre' }).trim()
    .min(3, 'Escribe tu nombre completo (mínimo 3 caracteres)').max(80, 'Máximo 80 caracteres'),
  correo: z.string({ error: 'Ingresa tu correo' }).trim().toLowerCase()
    .email('Ingresa un correo válido').max(120, 'Máximo 120 caracteres'),
  celular: celularSchema,
  tipo: z.enum(['sugerencia', 'error', 'consulta'], { error: 'Elige el tipo de mensaje' }),
  calificacion: z.number({ error: 'Elige una calificación de 1 a 5 estrellas' })
    .int('Elige una calificación de 1 a 5 estrellas')
    .min(1, 'Elige una calificación de 1 a 5 estrellas')
    .max(5, 'Elige una calificación de 1 a 5 estrellas'),
  mensaje: z.string({ error: 'Escribe tu mensaje' }).trim()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)').max(500, 'Máximo 500 caracteres'),
  // La regla vive en el campo para mostrarla aun cuando el enum esté vacío.
  aceptaTerminos: z.boolean({ error: 'Indica si aceptas el uso de tus datos' }).refine((acepta) => acepta, {
    message: 'Debes aceptar el uso de tus datos para responderte',
  }),
});

export const contactoVacio = {
  nombre: '', correo: '', celular: '', tipo: '', calificacion: 0, mensaje: '', aceptaTerminos: false,
};
