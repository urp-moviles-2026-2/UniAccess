// src/app/login.js
// Inicio de sesión de UniAccess URP con Supabase Auth (LAB-06)
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
import { mensajeDeAuth } from '../services/auth';
import { loginSchema, loginVacio } from '../schemas/authSchema';
import FormField from '../components/FormField';
import BotonPrincipal from '../components/BotonPrincipal';
import Aviso from '../components/Aviso';

export default function PantallaLogin() {
  const { iniciarSesion } = useSesion();
  const claveRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginVacio,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const manejarIngreso = async ({ correo, clave }) => {
    clearErrors('root');
    try {
      await iniciarSesion(correo, clave);
      reset();
      router.replace('/(tabs)/inicio');
    } catch (error) {
      setError('root', { message: mensajeDeAuth(error) });
    }
  };

  const rellenarPrueba = () => {
    reset({
      correo: 'estudiante@urp.edu.pe',
      clave: 'urp2026-cespar',
    });
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
              Inicia sesión con tu cuenta institucional para reservar ambientes del CESPAR.
            </Text>
          </View>

          {Boolean(errors.root) && (
            <Aviso tono="error" texto={errors.root.message} style={styles.aviso} />
          )}

          <FormField
            control={control}
            trigger={trigger}
            name="correo"
            label="Correo electrónico"
            placeholder="Ej. estudiante@urp.edu.pe"
            icono="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => claveRef.current?.focus()}
          />

          <FormField
            ref={claveRef}
            control={control}
            trigger={trigger}
            name="clave"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            icono="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            returnKeyType="send"
            submitBehavior="blurAndSubmit"
            onSubmitEditing={handleSubmit(manejarIngreso)}
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

          <View style={styles.filaRegistro}>
            <Text style={styles.textoPregunta}>¿No tienes una cuenta aún?</Text>
            <Pressable
              disabled={isSubmitting}
              onPress={() => router.push('/registro')}
              style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.textoEnlace}>Regístrate aquí</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={rellenarPrueba}
            style={styles.enlaceDemo}
          >
            <Text style={styles.textoEnlaceDemo}>Rellenar datos de prueba</Text>
          </Pressable>

          <View style={[styles.tarjetaInfo, shadows.sm]}>
            <View style={styles.filaInfo}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              <Text style={styles.tituloInfo}>Autenticación segura (LAB-06)</Text>
            </View>
            <Text style={styles.textoInfo}>
              Sesión gestionada mediante Supabase Auth con tokens seguros guardados en SecureStore.
              Las credenciales incorrectas muestran un mensaje genérico para evitar enumeración de usuarios.
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
    paddingTop: spacing.xl,
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
    paddingHorizontal: spacing.md,
  },
  aviso: {
    marginBottom: spacing.lg,
  },
  boton: {
    marginTop: spacing.sm,
  },
  filaRegistro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  textoPregunta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  enlace: {
    paddingVertical: spacing.xs,
  },
  textoEnlace: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  enlaceDemo: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  textoEnlaceDemo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  tarjetaInfo: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  tituloInfo: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  textoInfo: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
