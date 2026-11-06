// src/app/_layout.js
// Layout raíz: Redux Store Provider, Context de Sesión y navegación de pila
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { store } from '../store';
import { reemplazarTodas } from '../store/reservasSlice';
import { cargarReservas, suscribirPersistencia } from '../store/persistencia';
import { SesionProvider } from '../context/SesionContext';

// Se suscribe la persistencia una sola vez fuera del componente
suscribirPersistencia(store);

export default function LayoutRaiz() {
  useEffect(() => {
    // Hidrata el store desde AsyncStorage al iniciar la aplicación
    cargarReservas().then((items) => {
      if (Array.isArray(items)) {
        store.dispatch(reemplazarTodas(items));
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SesionProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ambiente/[id]" />
            <Stack.Screen name="reserva/nueva" />
            <Stack.Screen name="reserva/[id]" />
            <Stack.Screen name="catalogo" />
            <Stack.Screen name="contacto" />
          </Stack>
        </SesionProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
