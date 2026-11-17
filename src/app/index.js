// src/app/index.js
// Pantalla de arranque: muestra el splash mientras el SDK restaura la sesión persistente (LAB-06)
// y luego deriva a la aplicación o al login según el estado de la sesión.
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import { useSesion } from '../context/SesionContext';

export default function PantallaInicial() {
  const { estado, cargando } = useSesion();

  // Mientras el estado sea "cargando", se muestra la pantalla de splash
  // evitando el parpadeo de entrar a login por medio segundo
  if (cargando || estado === 'cargando') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.logo}>
          <Ionicons name="calendar" size={34} color={colors.textInverted} />
        </View>
        <Text style={styles.marca}>UniAccess</Text>
        <Text style={styles.subtitulo}>Reserva de ambientes CESPAR</Text>
        <Text style={styles.universidad}>Universidad Ricardo Palma</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.indicador} />
      </View>
    );
  }

  // Redirección reactiva según haya sesión activa
  return <Redirect href={estado === 'conSesion' ? '/inicio' : '/login'} />;
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: radius.xxl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  marca: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  universidad: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  indicador: {
    marginTop: spacing.xxl,
  },
});
