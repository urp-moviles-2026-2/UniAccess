// src/context/SesionContext.js - Contexto de sesión para UniAccess URP (LAB-06)
// Maneja los 3 estados: "cargando", "sinSesion", "conSesion" a través de authService
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'sinSesion' | 'conSesion'

  useEffect(() => {
    // Al abrir la app, el SDK restaura la sesión persistida desde SecureStore y notifica aquí
    const desuscribir = authService.escucharSesion((u) => {
      setUsuario(u);
      setEstado(u ? 'conSesion' : 'sinSesion');
    });

    return () => {
      if (typeof desuscribir === 'function') {
        desuscribir();
      }
    };
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      estado,
      cargando: estado === 'cargando',
      estaLogueado: estado === 'conSesion',
      iniciarSesion: authService.iniciarSesion,
      registrar: authService.registrar,
      cerrarSesion: authService.cerrarSesion,
    }),
    [usuario, estado]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return ctx;
}
