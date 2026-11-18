// src/components/CampoTexto.js
// Componente de Entrada: Campo de texto etiquetado con validación visual
import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

const CampoTexto = forwardRef(function CampoTexto({
  etiqueta,
  valor,
  onChangeText,
  placeholder,
  icono,
  error,
  multiline = false,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  maxLength,
  ayuda,
  style,
  onBlur,
  onFocus,
  ...inputProps
}, ref) {
  const [enfocado, setEnfocado] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);

  return (
    <View style={[styles.contenedor, style]}>
      {Boolean(etiqueta) && <Text style={styles.etiqueta}>{etiqueta}</Text>}

      <View
        style={[
          styles.caja,
          multiline && styles.cajaMultilinea,
          enfocado && styles.cajaEnfocada,
          Boolean(error) && styles.cajaError,
        ]}
      >
        {Boolean(icono) && (
          <Ionicons
            name={icono}
            size={18}
            color={enfocado ? colors.primary : colors.textMuted}
            style={[styles.icono, multiline && styles.iconoMultilinea]}
          />
        )}
        <TextInput
          {...inputProps}
          ref={ref}
          accessibilityLabel={inputProps.accessibilityLabel || etiqueta}
          value={valor}
          onChangeText={onChangeText}
          onFocus={(evento) => { setEnfocado(true); onFocus?.(evento); }}
          onBlur={(evento) => { setEnfocado(false); onBlur?.(evento); }}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !mostrarClave}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          style={[styles.input, multiline && styles.inputMultilinea]}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setMostrarClave((actual) => !actual)}
            hitSlop={spacing.sm}
            style={styles.mostrarClave}
          >
            <Ionicons name={mostrarClave ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {Boolean(ayuda) && !error && <Text style={styles.ayuda}>{ayuda}</Text>}
    </View>
  );
});

export default CampoTexto;

const styles = StyleSheet.create({
  mostrarClave: { padding: spacing.sm },
  contenedor: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  cajaMultilinea: {
    height: 96,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  cajaEnfocada: {
    borderColor: colors.borderFocus,
  },
  cajaError: {
    borderColor: colors.occupied,
  },
  icono: {
    marginRight: spacing.sm,
  },
  iconoMultilinea: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },
  inputMultilinea: {
    height: '100%',
    textAlignVertical: 'top',
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.occupiedText,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  ayuda: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
