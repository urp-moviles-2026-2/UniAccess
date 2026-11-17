// src/lib/supabase.js
// Cliente de Supabase configurado con almacenamiento seguro en SecureStore (LAB-06)
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// La sesión se almacena de forma segura en SecureStore en lugar de AsyncStorage
const almacenSeguro = {
  getItem: (clave) => {
    const fn = SecureStore.getItemAsync || SecureStore.default?.getItemAsync;
    return typeof fn === 'function' ? fn(clave) : Promise.resolve(null);
  },
  setItem: (clave, valor) => {
    const fn = SecureStore.setItemAsync || SecureStore.default?.setItemAsync;
    return typeof fn === 'function' ? fn(clave, valor) : Promise.resolve();
  },
  removeItem: (clave) => {
    const fn = SecureStore.deleteItemAsync || SecureStore.default?.deleteItemAsync;
    return typeof fn === 'function' ? fn(clave) : Promise.resolve();
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
