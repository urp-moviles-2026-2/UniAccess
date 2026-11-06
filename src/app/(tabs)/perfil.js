// src/app/(tabs)/perfil.js
// Sección Perfil: datos del estudiante, estadísticas, preferencias y sesión
import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing, shadows } from '../../theme';
import { useSesion } from '../../context/SesionContext';
import { selectEstadisticas } from '../../store/reservasSlice';
import { HORARIO_ATENCION_CESPAR, REGLAMENTO_CESPAR } from '../../data/usuario';
import ContenedorPantalla from '../../components/ContenedorPantalla';
import EncabezadoPantalla from '../../components/EncabezadoPantalla';
import EncabezadoSeccion from '../../components/EncabezadoSeccion';
import BotonPrincipal from '../../components/BotonPrincipal';
import InsigniaEstado from '../../components/InsigniaEstado';

export default function PantallaPerfil() {
  const { usuario, cerrarSesion } = useSesion();
  const estadisticas = useSelector(selectEstadisticas);

  const [notificaciones, setNotificaciones] = useState(true);
  const [recordatorios, setRecordatorios] = useState(true);

  const verReglamento = () => {
    Alert.alert(
      'Reglamento del CESPAR',
      REGLAMENTO_CESPAR.map((norma, indice) => `${indice + 1}. ${norma}`).join('\n\n'),
    );
  };

  const verHorarios = () => {
    Alert.alert(
      'Horario de atención',
      HORARIO_ATENCION_CESPAR.map((fila) => `${fila.dia}: ${fila.horario}`).join('\n'),
    );
  };

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta de UniAccess URP?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await cerrarSesion();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ContenedorPantalla edges={['top']}>
      <EncabezadoPantalla titulo="Mi perfil" subtitulo="Datos académicos y preferencias" />

      <View style={[styles.tarjetaEstudiante, shadows.sm]}>
        <View style={styles.filaEstudiante}>
          <View style={styles.avatar}>
            <Text style={styles.textoAvatar}>{usuario?.iniciales}</Text>
          </View>
          <View style={styles.datosEstudiante}>
            <Text style={styles.nombre}>{usuario?.nombre}</Text>
            <Text style={styles.dato}>Código {usuario?.codigo}</Text>
            <Text style={styles.dato}>{usuario?.escuela}</Text>
            <Text style={styles.dato}>{usuario?.correo}</Text>
          </View>
        </View>

        <View style={styles.filaInsignia}>
          <InsigniaEstado estado="confirmada" etiqueta="Carnet vigente" />
          <Text style={styles.semestre}>{usuario?.ciclo}</Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <EncabezadoSeccion titulo="Mi actividad" />
        <View style={styles.filaEstadisticas}>
          <View style={[styles.tile, shadows.sm]}>
            <Text style={styles.valorTile}>{estadisticas.activas}</Text>
            <Text style={styles.etiquetaTile}>Reservas activas</Text>
          </View>
          <View style={[styles.tile, shadows.sm]}>
            <Text style={styles.valorTile}>{estadisticas.horasReservadas}</Text>
            <Text style={styles.etiquetaTile}>Horas reservadas</Text>
          </View>
          <View style={[styles.tile, shadows.sm]}>
            <Text style={styles.valorTile}>{estadisticas.historial}</Text>
            <Text style={styles.etiquetaTile}>Cumplidas</Text>
          </View>
        </View>
      </View>

      <View style={styles.seccion}>
        <EncabezadoSeccion titulo="Preferencias" />
        <View style={[styles.tarjetaOpciones, shadows.sm]}>
          <View style={styles.filaOpcion}>
            <Ionicons name="notifications-outline" size={19} color={colors.primary} />
            <Text style={styles.textoOpcion}>Notificaciones de reservas</Text>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={[styles.filaOpcion, styles.filaOpcionBorde]}>
            <Ionicons name="alarm-outline" size={19} color={colors.primary} />
            <Text style={styles.textoOpcion}>Recordatorio 1 hora antes</Text>
            <Switch
              value={recordatorios}
              onValueChange={setRecordatorios}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>
      </View>

      <View style={styles.seccion}>
        <EncabezadoSeccion titulo="Información y ayuda" />
        <View style={[styles.tarjetaOpciones, shadows.sm]}>
          <OpcionLista icono="chatbubble-ellipses-outline" texto="Contacto y feedback"
            onPress={() => router.push('/contacto')} />
          <OpcionLista
            icono="qr-code-outline"
            texto="Biblioteca de componentes (LAB-02)"
            onPress={() => router.push('/catalogo')}
            conBorde
          />
          <OpcionLista
            icono="time-outline"
            texto="Horario de atención CESPAR"
            onPress={verHorarios}
            conBorde
          />
          <OpcionLista icono="shield-checkmark-outline" texto="Reglamento CESPAR" onPress={verReglamento} conBorde />
          <OpcionLista
            icono="information-circle-outline"
            texto="Versión de la aplicación"
            valor="1.0.0"
            conBorde
          />
        </View>
      </View>

      <BotonPrincipal
        texto="Cerrar sesión"
        icono="log-out-outline"
        variante="borde"
        onPress={confirmarCierre}
      />

      <Text style={styles.pie}>
        UniAccess · Universidad Ricardo Palma{'\n'}Ambientes administrados por el CESPAR
      </Text>
    </ContenedorPantalla>
  );
}

function OpcionLista({ icono, texto, valor, onPress, conBorde = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.filaOpcion,
        conBorde && styles.filaOpcionBorde,
        pressed && onPress && styles.filaOpcionPresionada,
      ]}
    >
      <Ionicons name={icono} size={19} color={colors.primary} />
      <Text style={styles.textoOpcion}>{texto}</Text>
      {Boolean(valor) && <Text style={styles.valorOpcion}>{valor}</Text>}
      {Boolean(onPress) && (
        <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjetaEstudiante: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  filaEstudiante: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatar: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textInverted,
  },
  datosEstudiante: {
    flex: 1,
  },
  nombre: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  dato: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  filaInsignia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  semestre: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  seccion: {
    marginBottom: spacing.xl,
  },
  filaEstadisticas: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  valorTile: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  etiquetaTile: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  tarjetaOpciones: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  filaOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  filaOpcionBorde: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  filaOpcionPresionada: {
    opacity: 0.6,
  },
  textoOpcion: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  valorOpcion: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  pie: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 17,
  },
});
