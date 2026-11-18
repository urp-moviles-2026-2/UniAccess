// src/app/reportes.js
// Recurso protegido por Row Level Security (RLS) en Supabase (LAB-06)
// Cada estudiante solo puede leer e insertar sus propios reportes de incidencias en el CESPAR.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, fontSize, fontWeight, radius, spacing, shadows } from '../theme';
import { getMisReportes, crearReporte } from '../services/reportes';
import { useSesion } from '../context/SesionContext';
import ContenedorPantalla from '../components/ContenedorPantalla';
import EncabezadoPantalla from '../components/EncabezadoPantalla';
import BotonPrincipal from '../components/BotonPrincipal';
import CampoTexto from '../components/CampoTexto';
import EstadoVacio from '../components/EstadoVacio';
import Aviso from '../components/Aviso';

export default function PantallaReportes() {
  const { usuario } = useSesion();
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Modal para nuevo reporte
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('infraestructura');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const items = await getMisReportes();
      setReportes(items);
    } catch (err) {
      console.warn('Error al cargar reportes protegidos:', err);
      setError('No se pudieron obtener los reportes del servidor. Comprobar la conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrear = async () => {
    if (!titulo.trim()) {
      setErrorForm('Ingresa un título para el reporte');
      return;
    }
    setErrorForm('');
    setGuardando(true);
    try {
      const nuevo = await crearReporte({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
      });
      setReportes((prev) => [nuevo, ...prev]);
      setTitulo('');
      setDescripcion('');
      setModalVisible(false);
      Alert.alert('Reporte registrado', 'La incidencia fue guardada exitosamente en la base de datos con RLS.');
    } catch (err) {
      console.warn('Error al crear reporte protegido:', err);
      setErrorForm('Error al guardar en el servidor. Verifica las políticas RLS.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ContenedorPantalla edges={['top', 'bottom']}>
      <View style={styles.filaVolver}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.botonVolver, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.textoVolver}>Volver</Text>
        </Pressable>
      </View>

      <EncabezadoPantalla
        titulo="Mis reportes"
        subtitulo="Incidencias y solicitudes protegidas por RLS"
      />

      <View style={[styles.tarjetaRLS, shadows.sm]}>
        <View style={styles.cabeceraRLS}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text style={styles.tituloRLS}>Regla del servidor (RLS activa)</Text>
        </View>
        <Text style={styles.textoRLS}>
          La consulta no usa un filtro manual en el cliente; el motor Postgres de Supabase
          comprueba <Text style={styles.codigo}>auth.uid() = user_id</Text> y solo retorna los
          registros pertenecientes a <Text style={styles.bold}>{usuario?.correo || 'la cuenta autenticada'}</Text>.
        </Text>
      </View>

      <View style={styles.filaAccion}>
        <Text style={styles.conteo}>
          {reportes.length} {reportes.length === 1 ? 'reporte registrado' : 'reportes registrados'}
        </Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [styles.botonNuevo, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="add" size={18} color={colors.textInverted} />
          <Text style={styles.textoBotonNuevo}>Nuevo reporte</Text>
        </Pressable>
      </View>

      {/* Estados visuales: Cargando | Error | Vacío | Lista */}
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.textoCargando}>Consultando datos protegidos...</Text>
        </View>
      ) : error ? (
        <View style={styles.seccionEstado}>
          <Aviso tono="error" texto={error} style={styles.aviso} />
          <BotonPrincipal
            texto="Reintentar"
            icono="refresh-outline"
            variante="borde"
            onPress={cargarDatos}
            style={styles.botonReintentar}
          />
        </View>
      ) : reportes.length === 0 ? (
        <EstadoVacio
          icono="document-text-outline"
          titulo="Sin reportes registrados"
          mensaje="Aún no has enviado incidencias sobre las canchas o áreas deportivas del CESPAR."
          botonTexto="Crear primer reporte"
          onBotonPress={() => setModalVisible(true)}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
        >
          {reportes.map((item) => (
            <View key={item.id} style={[styles.tarjetaReporte, shadows.sm]}>
              <View style={styles.cabeceraReporte}>
                <Text style={styles.tituloReporte}>{item.titulo}</Text>
                <View style={styles.insigniaCategoria}>
                  <Text style={styles.textoCategoria}>{item.categoria}</Text>
                </View>
              </View>
              {Boolean(item.descripcion) && (
                <Text style={styles.descripcionReporte}>{item.descripcion}</Text>
              )}
              <View style={styles.pieReporte}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={styles.fechaReporte}>
                  {new Date(item.creadoEn).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal para crear nuevo reporte */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={[styles.cajaModal, shadows.lg]}>
            <View style={styles.cabeceraModal}>
              <Text style={styles.tituloModal}>Nuevo reporte de incidencia</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [styles.botonCerrarModal, pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {Boolean(errorForm) && (
              <Aviso tono="error" texto={errorForm} style={styles.avisoModal} />
            )}

            <CampoTexto
              etiqueta="Título de la incidencia"
              placeholder="Ej. Red deteriorada en cancha de tenis"
              valor={titulo}
              onChangeText={setTitulo}
              autoCapitalize="sentences"
            />

            <CampoTexto
              etiqueta="Descripción"
              placeholder="Detalla la situación encontrada en el ambiente..."
              valor={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            <View style={styles.filaCategorias}>
              {['infraestructura', 'limpieza', 'iluminacion', 'otro'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  style={[
                    styles.chipCat,
                    categoria === cat && styles.chipCatActivo,
                  ]}
                >
                  <Text
                    style={[
                      styles.textoChipCat,
                      categoria === cat && styles.textoChipCatActivo,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.accionesModal}>
              <BotonPrincipal
                texto={guardando ? 'Guardando...' : 'Enviar reporte (RLS)'}
                icono="cloud-upload-outline"
                cargando={guardando}
                deshabilitado={guardando}
                onPress={handleCrear}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ContenedorPantalla>
  );
}

const styles = StyleSheet.create({
  filaVolver: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  textoVolver: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  tarjetaRLS: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cabeceraRLS: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  tituloRLS: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  textoRLS: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  codigo: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  bold: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  filaAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  conteo: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  botonNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  textoBotonNuevo: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textInverted,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  textoCargando: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  seccionEstado: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  aviso: {
    width: '100%',
    marginBottom: spacing.md,
  },
  botonReintentar: {
    alignSelf: 'center',
    minWidth: 140,
  },
  lista: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  tarjetaReporte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cabeceraReporte: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tituloReporte: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  insigniaCategoria: {
    backgroundColor: colors.surfaceHover || '#F3F4F6',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textoCategoria: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  descripcionReporte: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  pieReporte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  fechaReporte: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cajaModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cabeceraModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloModal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  botonCerrarModal: {
    padding: spacing.xs,
  },
  avisoModal: {
    marginBottom: spacing.xs,
  },
  filaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipCat: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  chipCatActivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  textoChipCat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  textoChipCatActivo: {
    color: colors.textInverted,
    fontWeight: fontWeight.bold,
  },
  accionesModal: {
    marginTop: spacing.sm,
  },
});
