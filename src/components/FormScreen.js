import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import ContenedorPantalla from './ContenedorPantalla';

export default function FormScreen({ children }) {
  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ContenedorPantalla edges={['top', 'bottom']}>{children}</ContenedorPantalla>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ pantalla: { flex: 1 } });
