// src/services/auth.js - Capa de servicio de autenticación con Supabase
// Es el ÚNICO archivo de la app que importa el cliente de Supabase.
import { supabase } from '../lib/supabase';

// Modelo de usuario de la app: la UI nunca ve el objeto crudo del proveedor.
export const aUsuario = (u) => {
  if (!u) return null;
  const nombre = u.user_metadata?.nombre || u.email?.split('@')[0] || 'Estudiante URP';
  const partes = nombre.trim().split(/\s+/);
  const iniciales = ((partes[0]?.[0] || 'U') + (partes[1]?.[0] || '')).toUpperCase();
  const codigo = u.user_metadata?.codigo || (u.email ? u.email.split('@')[0] : '20261001');

  return {
    id: u.id,
    correo: u.email,
    nombre,
    codigo,
    escuela: u.user_metadata?.escuela || 'Facultad de Ingeniería',
    ciclo: u.user_metadata?.ciclo || '2026-II',
    iniciales,
  };
};

export async function registrar({ nombre, correo, clave }) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: clave,
    options: {
      data: { nombre },
    },
  });
  if (error) throw error;
  return aUsuario(data.user);
}

export async function iniciarSesion(correo, clave) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave,
  });
  if (error) throw error;
  return aUsuario(data.user);
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Avisa la sesión inicial al suscribirse y cada cambio posterior. Devuelve la función para desuscribirse.
export function escucharSesion(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    callback(aUsuario(sesion?.user));
  });
  return () => {
    if (data?.subscription?.unsubscribe) {
      data.subscription.unsubscribe();
    }
  };
}

// Token de acceso vigente, para peticiones con autorización o interceptores
export async function obtenerToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

// Mensajes amigables para el usuario, protegiendo contra enumeración de usuarios
export function mensajeDeAuth(error) {
  const codigo = error?.code || '';
  const mensaje = (error?.message || '').toLowerCase();

  if (codigo === 'invalid_credentials' || mensaje.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos';
  }
  if (codigo === 'user_already_exists' || mensaje.includes('already registered')) {
    return 'No se pudo crear la cuenta. Si ya tienes una, inicia sesión';
  }
  if (codigo === 'weak_password' || mensaje.includes('password') && mensaje.includes('weak')) {
    return 'La contraseña es muy débil';
  }
  if (error?.name === 'AuthRetryableFetchError' || mensaje.includes('fetch') || mensaje.includes('network')) {
    return 'Sin conexión. Revisa tu internet e inténtalo de nuevo';
  }
  return 'No pudimos completar la operación. Inténtalo de nuevo';
}
