// src/schemas/authSchema.js - Esquemas Zod para autenticación (LAB-06)
import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().email('Ingresa un correo válido'),
  clave: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const registroSchema = loginSchema
  .extend({
    nombre: z.string().trim().min(2, 'Ingresa tu nombre'),
    confirmarClave: z.string(),
  })
  .refine((d) => d.clave === d.confirmarClave, {
    path: ['confirmarClave'],
    message: 'Las contraseñas no coinciden',
  });

export const loginVacio = {
  correo: '',
  clave: '',
};

export const registroVacio = {
  nombre: '',
  correo: '',
  clave: '',
  confirmarClave: '',
};
