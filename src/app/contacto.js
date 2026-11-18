import React, { useRef } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSesion } from '../context/SesionContext';
import { contactoSchema, contactoVacio, TIPOS_MENSAJE } from '../schemas/contactoSchema';
import { colors, fontSize, spacing } from '../theme';
import FormScreen from '../components/FormScreen';
import FormField from '../components/FormField';
import FormControl from '../components/FormControl';
import ChipSelectField from '../components/ChipSelectField';
import StarRating from '../components/StarRating';
import EncabezadoPantalla from '../components/EncabezadoPantalla';
import BotonPrincipal from '../components/BotonPrincipal';
import Aviso from '../components/Aviso';
import { mostrarConfirmacion } from '../utils/alertas';

export default function PantallaContacto() {
  const { usuario, cargando } = useSesion();
  const correoRef = useRef(null);
  const celularRef = useRef(null);
  const mensajeRef = useRef(null);
  const enviandoRef = useRef(false);
  const { control, handleSubmit, reset, trigger, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(contactoSchema),
    defaultValues: contactoVacio,
    mode: 'onBlur', reValidateMode: 'onChange',
  });

  if (cargando) return null;
  if (!usuario) return <Redirect href="/login" />;

  const enviar = async (datos) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    try {
      // Simulación del LAB-05. No se transmite ni registra información personal.
      await new Promise((resolve) => setTimeout(resolve, 800));
      mostrarConfirmacion('¡Gracias por tu mensaje!',
        `Envío de prueba completado para ${datos.correo}. Cuando habilitemos el servicio, podremos responderte por ese medio.`);
      reset();
    } finally {
      enviandoRef.current = false;
    }
  };
  const enviarFormulario = handleSubmit(enviar);
  const field = { control, trigger };

  return (
    <FormScreen>
      <EncabezadoPantalla titulo="Contacto y feedback" subtitulo="Ayúdanos a mejorar UniAccess"
        mostrarVolver onVolver={() => router.back()} />
      <Aviso tono="info" titulo="Queremos escucharte"
        texto="Comparte una sugerencia, consulta o problema. Este envío es una demostración y todavía no llega a CESPAR."
        style={styles.aviso} />
      <FormField {...field} name="nombre" label="Nombre completo" placeholder="Tu nombre y apellidos"
        autoCapitalize="words" returnKeyType="next" submitBehavior="submit"
        onSubmitEditing={() => correoRef.current?.focus()} />
      <FormField {...field} ref={correoRef} name="correo" label="Correo" placeholder="nombre@urp.edu.pe"
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => celularRef.current?.focus()} />
      <FormField {...field} ref={celularRef} name="celular" label="Celular" placeholder="987654321"
        keyboardType="number-pad" autoCapitalize="none" autoCorrect={false} maxLength={9}
        returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => mensajeRef.current?.focus()} />
      <ChipSelectField {...field} name="tipo" label="Tipo de mensaje" opciones={TIPOS_MENSAJE} />
      <FormControl {...field} name="calificacion" label="¿Cómo calificas la app?">
        {(props) => <StarRating {...props} />}
      </FormControl>
      <FormControl {...field} name="aceptaTerminos">
        {({ value, onChange, onBlur, disabled }) => (
          <View style={styles.consentimiento}>
            <Switch accessibilityLabel="Acepto el uso de mis datos para responderme" value={value}
              onValueChange={onChange} onBlur={onBlur} disabled={disabled} trackColor={{ true: colors.primary }} />
            <Text style={styles.textoConsentimiento}>Acepto que usen mis datos para responderme.</Text>
          </View>
        )}
      </FormControl>
      <FormField {...field} ref={mensajeRef} name="mensaje" label="Mensaje" placeholder="Cuéntanos cómo podemos ayudarte…"
        multiline numberOfLines={5} maxLength={500} returnKeyType="send" blurOnSubmit submitBehavior="blurAndSubmit"
        onSubmitEditing={enviarFormulario} ayuda="Entre 10 y 500 caracteres. No incluyas contraseñas." />
      <BotonPrincipal texto={isSubmitting ? 'Enviando...' : 'Enviar mensaje'} icono="send-outline"
        tamano="lg" cargando={isSubmitting} deshabilitado={isSubmitting} onPress={enviarFormulario} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  aviso: { marginBottom: spacing.lg },
  consentimiento: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textoConsentimiento: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm },
});
