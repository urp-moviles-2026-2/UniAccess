// src/lib/supabase.js
// Cliente de Supabase configurado con almacenamiento seguro en SecureStore (LAB-06)
// En teléfonos móviles (iOS/Android) almacena la sesión en SecureStore (Keychain/Keystore).
// En navegador web utiliza AsyncStorage (localStorage del navegador).
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Detección universal del entorno de ejecución (Web vs Nativo/Node)
const esNavegadorWeb = typeof window !== 'undefined' && Boolean(window.document);

const almacenSeguro = {
  getItem: async (clave) => {
    if (esNavegadorWeb) {
      return AsyncStorage.getItem(clave);
    }
    const fn = SecureStore.getItemAsync || SecureStore.default?.getItemAsync;
    if (typeof fn === 'function') {
      try {
        return await fn(clave);
      } catch (e) {
        return AsyncStorage.getItem(clave);
      }
    }
    return AsyncStorage.getItem(clave);
  },
  setItem: async (clave, valor) => {
    if (esNavegadorWeb) {
      return AsyncStorage.setItem(clave, valor);
    }
    const fn = SecureStore.setItemAsync || SecureStore.default?.setItemAsync;
    if (typeof fn === 'function') {
      try {
        await fn(clave, valor);
        return;
      } catch (e) {
        return AsyncStorage.setItem(clave, valor);
      }
    }
    return AsyncStorage.setItem(clave, valor);
  },
  removeItem: async (clave) => {
    if (esNavegadorWeb) {
      return AsyncStorage.removeItem(clave);
    }
    const fn = SecureStore.deleteItemAsync || SecureStore.default?.deleteItemAsync;
    if (typeof fn === 'function') {
      try {
        await fn(clave);
        return;
      } catch (e) {
        return AsyncStorage.removeItem(clave);
      }
    }
    return AsyncStorage.removeItem(clave);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: almacenSeguro,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
