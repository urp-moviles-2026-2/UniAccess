import { z } from 'zod';

export const loginSchema = z.object({
  codigo: z.string({ error: 'Ingresa tu código universitario' }).trim()
    .regex(/^\d{4,12}$/, 'El código debe tener entre 4 y 12 dígitos'),
  contrasena: z.string({ error: 'Ingresa tu contraseña' })
    .min(4, 'Mínimo 4 caracteres').max(72, 'Máximo 72 caracteres'),
});

export const loginVacio = { codigo: '', contrasena: '' };
