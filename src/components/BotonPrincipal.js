// src/components/BotonPrincipal.js
// Componente de Acción: Botón reutilizable para acciones principales y secundarias
import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

export default function BotonPrincipal({
  texto,
  onPress,
  variante = 'primario', // 'primario' | 'secundario' | 'borde' | 'peligro' | 'fantasma'
  tamano = 'md', // 'sm' | 'md' | 'lg'
  icono,
  deshabilitado = false,
  cargando = false,
  style,
}) {
  const inactivo = deshabilitado || cargando;
  const colorTexto = variante === 'borde' || variante === 'fantasma'
    ? colors.primary
    : colors.textInverted;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo }}
      style={({ pressed }) => [
        styles.base,
        styles[`tamano_${tamano}`],
        styles[`variante_${variante}`],
        pressed && !inactivo && styles[`presionado_${variante}`],
        deshabilitado && styles.deshabilitado,
        style,
      ]}
    >
      {cargando ? (
        <View style={styles.contenido}>
          <ActivityIndicator size="small" color={colorTexto} style={styles.icono} />
          <Text style={[styles.textoBase, styles[`textoTamano_${tamano}`], styles[`textoVariante_${variante}`]]}>{texto}</Text>
        </View>
      ) : (
        <View style={styles.contenido}>
          {Boolean(icono) && (
            <Ionicons
              name={icono}
              size={tamano === 'sm' ? 15 : 18}
              color={deshabilitado ? colors.disabledText : colorTexto}
              style={styles.icono}
            />
          )}
          <Text
            style={[
              styles.textoBase,
              styles[`textoTamano_${tamano}`],
              styles[`textoVariante_${variante}`],
              deshabilitado && styles.textoDeshabilitado,
            ]}
          >
            {texto}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: {
    marginRight: spacing.sm,
  },
  // Tamaños
  tamano_sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  tamano_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tamano_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  // Variantes de color
  variante_primario: {
    backgroundColor: colors.primary,
  },
  variante_secundario: {
    backgroundColor: colors.secondary,
  },
  variante_borde: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variante_fantasma: {
    backgroundColor: colors.primaryLight,
  },
  variante_peligro: {
    backgroundColor: colors.occupied,
  },
  // Estados al presionar
  presionado_primario: {
    backgroundColor: colors.primaryDark,
  },
  presionado_secundario: {
    opacity: 0.85,
  },
  presionado_borde: {
    backgroundColor: colors.primaryLight,
  },
  presionado_fantasma: {
    opacity: 0.75,
  },
  presionado_peligro: {
    opacity: 0.85,
  },
  // Estado deshabilitado
  deshabilitado: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    opacity: 0.6,
  },
  // Textos
  textoBase: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  textoTamano_sm: {
    fontSize: fontSize.sm,
  },
  textoTamano_md: {
    fontSize: fontSize.md,
  },
  textoTamano_lg: {
    fontSize: fontSize.lg,
  },
  textoVariante_primario: {
    color: colors.textInverted,
  },
  textoVariante_secundario: {
    color: colors.textInverted,
  },
  textoVariante_borde: {
    color: colors.primary,
  },
  textoVariante_fantasma: {
    color: colors.primaryDark,
  },
  textoVariante_peligro: {
    color: colors.textInverted,
  },
  textoDeshabilitado: {
    color: colors.disabledText,
  },
});
