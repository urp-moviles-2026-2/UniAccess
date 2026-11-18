// src/services/reportes.js - Consumo del recurso protegido con Row Level Security (RLS) en Supabase (LAB-06)
import { supabase } from '../lib/supabase';

const aReporte = (r) => ({
  id: r.id,
  titulo: r.titulo,
  descripcion: r.descripcion ?? '',
  categoria: r.categoria ?? 'infraestructura',
  creadoEn: r.creado_en ?? new Date().toISOString(),
});

/**
 * Obtiene los reportes del usuario actual.
 * Nota: No requiere "where user_id = ...", ya que la política RLS
 * 'cada usuario lee sus reportes' en Supabase filtra automáticamente
 * en el motor de base de datos según el UID del token JWT.
 */
export async function getMisReportes() {
  const { data, error } = await supabase
    .from('reportes')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data || []).map(aReporte);
}

/**
 * Registra un nuevo reporte en la tabla protegida.
 * El campo user_id se asigna automáticamente a auth.uid() en Postgres
 * y es validado por la política RLS 'cada usuario crea sus reportes'.
 */
export async function crearReporte({ titulo, descripcion, categoria }) {
  const { data, error } = await supabase
    .from('reportes')
    .insert([
      {
        titulo,
        descripcion,
        categoria: categoria || 'infraestructura',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return aReporte(data);
}
