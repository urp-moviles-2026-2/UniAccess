// src/app/registro.js
// Registro de nuevos estudiantes en UniAccess URP con Supabase Auth (LAB-06)
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
import { registroSchema, registroVacio } from '../schemas/authSchema';
import FormField from '../components/FormField';
import BotonPrincipal from '../components/BotonPrincipal';
import Aviso from '../components/Aviso';

export default function PantallaRegistro() {
  const { registrar } = useSesion();

  const correoRef = useRef(null);
  const claveRef = useRef(null);
  const confirmarClaveRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: registroVacio,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const manejarRegistro = async ({ nombre, correo, clave }) => {
    clearErrors('root');
    try {
      await registrar({ nombre, correo, clave });
      reset();
      // Si Supabase inicia sesión inmediatamente, el estado cambiará a 'conSesion'
      router.replace('/(tabs)/inicio');
    } catch (error) {
      setError('root', { message: mensajeDeAuth(error) });
    }
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
              <Ionicons name="person-add" size={28} color={colors.textInverted} />
            </View>
            <Text style={styles.titulo}>Crear cuenta</Text>
            <Text style={styles.subtitulo}>
              Regístrate para reservar canchas y espacios deportivos en el CESPAR.
            </Text>
          </View>

          {Boolean(errors.root) && (
            <Aviso tono="error" texto={errors.root.message} style={styles.aviso} />
          )}

          <FormField
            control={control}
            trigger={trigger}
            name="nombre"
            label="Nombre y apellido"
            placeholder="Ej. Ana Pérez"
            icono="person-outline"
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => correoRef.current?.focus()}
          />

          <FormField
            ref={correoRef}
            control={control}
            trigger={trigger}
            name="correo"
            label="Correo electrónico"
            placeholder="Ej. ana.perez@urp.edu.pe"
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
            autoComplete="new-password"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmarClaveRef.current?.focus()}
          />

          <FormField
            ref={confirmarClaveRef}
            control={control}
            trigger={trigger}
            name="confirmarClave"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            icono="shield-checkmark-outline"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="send"
            submitBehavior="blurAndSubmit"
            onSubmitEditing={handleSubmit(manejarRegistro)}
          />

          <BotonPrincipal
            texto={isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            icono="checkmark-circle-outline"
            tamano="lg"
            cargando={isSubmitting}
            deshabilitado={isSubmitting}
            onPress={handleSubmit(manejarRegistro)}
            style={styles.boton}
          />

          <View style={styles.filaLogin}>
            <Text style={styles.textoPregunta}>¿Ya tienes una cuenta?</Text>
            <Pressable
              disabled={isSubmitting}
              onPress={() => router.replace('/login')}
              style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.textoEnlace}>Inicia sesión</Text>
            </Pressable>
          </View>

          <View style={[styles.tarjetaSeguridad, shadows.sm]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.textoSeguridad}>
              Tus credenciales son cifradas por Supabase Auth. La aplicación nunca almacena tu contraseña en texto plano.
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
    width: 60,
    height: 60,
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
  filaLogin: {
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
  tarjetaSeguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  textoSeguridad: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
