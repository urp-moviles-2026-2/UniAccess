import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

// Controles no textuales: se valida al seleccionar y también al perder el foco.
export default function FormControl({ control, name, label, trigger, children }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error }, formState: { isSubmitting } }) => (
        <View style={[styles.campo, error && styles.campoError]}>
          {label && <Text style={styles.etiqueta}>{label}</Text>}
          <View pointerEvents={isSubmitting ? 'none' : 'auto'}>
            {children({
              value: field.value,
              onChange: (value) => {
                field.onChange(value);
                field.onBlur();
                if (error) void trigger?.(name);
              },
              onBlur: field.onBlur,
              disabled: isSubmitting,
            })}
          </View>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  campo: { gap: spacing.sm, marginBottom: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  campoError: { borderColor: colors.occupied },
  etiqueta: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  error: { color: colors.occupiedText, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
