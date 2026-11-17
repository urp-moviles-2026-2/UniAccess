// src/hooks/useCerrarSesion.js - Logout completo que limpia servicio, store y persistencia (LAB-06)
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSesion } from '../context/SesionContext';
import { reemplazarTodas } from '../store/reservasSlice';

export function useCerrarSesion() {
  const { cerrarSesion } = useSesion();
  const dispatch = useDispatch();

  return async () => {
    // 1. Cierra la sesión en el servicio de identidad (Supabase borra tokens de SecureStore)
    await cerrarSesion();

    // 2. Vacía el store de Redux para que no queden datos en memoria
    dispatch(reemplazarTodas([]));

    // 3. Limpia la persistencia en AsyncStorage
    try {
      await AsyncStorage.removeItem('uniaccess:reservas');
    } catch (error) {
      console.warn('Error al limpiar persistencia local de reservas:', error);
    }
  };
}

export default useCerrarSesion;
