// src/app/login.js
// Inicio de sesión del estudiante URP
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing, shadows } from '../theme';
import { useSesion } from '../context/SesionContext';
import { USUARIO_DEMO } from '../data/usuario';
import FormField from '../components/FormField';
import { loginSchema, loginVacio } from '../schemas/loginSchema';
import BotonPrincipal from '../components/BotonPrincipal';
import Aviso from '../components/Aviso';

export default function PantallaLogin() {
  const { iniciarSesion } = useSesion();
  const contrasenaRef = useRef(null);
  const enviandoRef = useRef(false);
  const { control, handleSubmit, reset, setError, clearErrors, trigger,
    formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(loginSchema), defaultValues: loginVacio,
    mode: 'onBlur', reValidateMode: 'onChange',
  });

  const manejarIngreso = async (datos) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    clearErrors('root');
    try {
      const resultado = await iniciarSesion(datos);
      if (!resultado.ok) {
        setError('root.sesion', { message: resultado.mensaje });
        return;
      }
      reset();
      router.replace('/inicio');
    } finally {
      enviandoRef.current = false;
    }
  };

  const usarCredencialesDemo = () => {
    reset({ codigo: USUARIO_DEMO.codigo, contrasena: USUARIO_DEMO.contrasena });
  };

  return (
    <SafeAreaView style={styles.area} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.area}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cabecera}>
            <View style={styles.logo}>
              <Ionicons name="calendar" size={30} color={colors.textInverted} />
            </View>
            <Text style={styles.titulo}>UniAccess URP</Text>
            <Text style={styles.subtitulo}>
              Reserva los ambientes deportivos del CESPAR desde tu celular.
            </Text>
          </View>

          {errors.root?.sesion && <Aviso tono="error" texto={errors.root.sesion.message} style={styles.aviso} />}

          <FormField
            control={control} trigger={trigger} name="codigo" label="Código universitario"
            placeholder="Ej. 2022101234"
            icono="id-card-outline"
            keyboardType="number-pad"
            autoCapitalize="none"
            maxLength={12}
            autoCorrect={false}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => contrasenaRef.current?.focus()}
          />

          <FormField
            ref={contrasenaRef} control={control} trigger={trigger} name="contrasena" label="Contraseña"
            placeholder="Ingresa tu contraseña"
            icono="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={72}
            returnKeyType="send"
            submitBehavior="blurAndSubmit"
            onSubmitEditing={handleSubmit(manejarIngreso)}
            ayuda="Acceso de demostración: mínimo 4 caracteres."
          />

          <BotonPrincipal
            texto={isSubmitting ? 'Ingresando...' : 'Ingresar'}
            icono="log-in-outline"
            tamano="lg"
            cargando={isSubmitting}
            deshabilitado={isSubmitting}
            onPress={handleSubmit(manejarIngreso)}
            style={styles.boton}
          />

          <Pressable disabled={isSubmitting} onPress={usarCredencialesDemo} style={styles.enlaceDemo}>
            <Text style={styles.textoEnlaceDemo}>Usar credenciales de prueba</Text>
          </Pressable>

          <View style={[styles.tarjetaDemo, shadows.sm]}>
            <Text style={styles.tituloDemo}>Cuenta de demostración</Text>
            <Text style={styles.textoDemo}>
              Código: {USUARIO_DEMO.codigo}
              {'\n'}
              Contraseña: {USUARIO_DEMO.contrasena}
            </Text>
            <Text style={styles.notaDemo}>
              Cualquier código de 4 a 12 dígitos y una contraseña de 4 caracteres o más
              permiten ingresar mientras la app no esté conectada a la base de datos de la URP.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  cabecera: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xxl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitulo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  aviso: {
    marginBottom: spacing.lg,
  },
  boton: {
    marginTop: spacing.sm,
  },
  enlaceDemo: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  textoEnlaceDemo: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  tarjetaDemo: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  tituloDemo: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textoDemo: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  notaDemo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
});
