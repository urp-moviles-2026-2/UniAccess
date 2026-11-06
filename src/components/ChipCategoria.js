// src/components/ChipCategoria.js
// Componente de Acción / Filtro: Chip para filtrar categorías de instalaciones o servicios
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

export default function ChipCategoria({
  etiqueta,
  activo = false,
  conteo,
  onPress,
  onBlur,
  deshabilitado = false,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      onBlur={onBlur}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityState={{ selected: activo, disabled: deshabilitado }}
      style={({ pressed }) => [
        styles.chip,
        activo ? styles.chipActivo : styles.chipInactivo,
        pressed && styles.presionado,
        style,
      ]}
    >
      <Text style={[styles.etiqueta, activo ? styles.etiquetaActiva : styles.etiquetaInactiva]}>
        {etiqueta}
      </Text>
      {conteo !== undefined && (
        <View style={[styles.contador, activo ? styles.contadorActivo : styles.contadorInactivo]}>
          <Text style={[styles.contadorTexto, activo ? styles.contadorTextoActivo : styles.contadorTextoInactivo]}>
            {conteo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipInactivo: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presionado: {
    opacity: 0.8,
  },
  etiqueta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  etiquetaInactiva: {
    color: colors.textSecondary,
  },
  etiquetaActiva: {
    color: colors.textInverted,
    fontWeight: fontWeight.semibold,
  },
  contador: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  contadorInactivo: {
    backgroundColor: colors.surfaceSubtle,
  },
  contadorActivo: {
    backgroundColor: colors.primaryDark,
  },
  contadorTexto: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  contadorTextoInactivo: {
    color: colors.textSecondary,
  },
  contadorTextoActivo: {
    color: colors.textInverted,
  },
});
