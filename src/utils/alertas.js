import { Alert, Platform } from 'react-native';

// React Native Web no implementa Alert.alert. Conservamos confirmación en la vista web.
export function mostrarConfirmacion(titulo, mensaje, botones) {
  if (Platform.OS === 'web') {
    globalThis.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje, botones);
}
