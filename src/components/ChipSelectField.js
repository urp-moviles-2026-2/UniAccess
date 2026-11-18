import React from 'react';
import { View, StyleSheet } from 'react-native';
import FormControl from './FormControl';
import ChipCategoria from './ChipCategoria';
import { spacing } from '../theme';

export default function ChipSelectField({ opciones, ...props }) {
  return (
    <FormControl {...props}>
      {({ value, onChange, onBlur, disabled }) => (
        <View style={styles.opciones}>
          {opciones.map((opcion) => (
            <ChipCategoria key={opcion.valor} etiqueta={opcion.etiqueta}
              activo={value === opcion.valor} deshabilitado={disabled}
              onBlur={onBlur} onPress={() => onChange(opcion.valor)} />
          ))}
        </View>
      )}
    </FormControl>
  );
}

const styles = StyleSheet.create({ opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm } });
