// src/app/reserva/nueva.js
// Paso final del flujo: revisión de datos, aforo y confirmación de la reserva
import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearReservaSchema, reservaVacia, TIPOS_ACTIVIDAD } from '../../schemas/reservaSchema';

import { colors, fontSize, fontWeight, radius, spacing, shadows } from '../../theme';
import { useSesion } from '../../context/SesionContext';
import { agregarReserva, selectEstadisticas } from '../../store/reservasSlice';
import { obtenerAmbiente, obtenerCategoria } from '../../data/ambientes';
import { formatearFechaLarga, rangoHorario, ordenarHoras } from '../../utils/fechas';
import { requiereAprobacion, MAX_RESERVAS_ACTIVAS } from '../../utils/reservas';
import ContenedorPantalla from '../../components/ContenedorPantalla';
import EncabezadoPantalla from '../../components/EncabezadoPantalla';
import EncabezadoSeccion from '../../components/EncabezadoSeccion';
import ImagenAmbiente from '../../components/ImagenAmbiente';
import ElementoInfo from '../../components/ElementoInfo';
import SelectorCantidad from '../../components/SelectorCantidad';
import FormScreen from '../../components/FormScreen';
import FormField from '../../components/FormField';
import FormControl from '../../components/FormControl';
import ChipSelectField from '../../components/ChipSelectField';
import BotonPrincipal from '../../components/BotonPrincipal';
import Aviso from '../../components/Aviso';
import EstadoVacio from '../../components/EstadoVacio';
import { mostrarConfirmacion } from '../../utils/alertas';

export default function PantallaNuevaReserva() {
  const { ambienteId, fecha, horas } = useLocalSearchParams();
  const dispatch = useDispatch();
  const store = useStore();
  const estadisticas = useSelector(selectEstadisticas);
  const { usuario, cargando } = useSesion();

  const ambiente = obtenerAmbiente(ambienteId);
  const listaHoras = typeof horas === 'string' && horas.length ? ordenarHoras(horas.split(',')) : [];

  const celularRef = useRef(null);
  const observacionesRef = useRef(null);
  const enviandoRef = useRef(false);
  const { control, handleSubmit, reset, trigger, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(crearReservaSchema(() => store.getState().reservas.items), undefined, { mode: 'sync' }),
    defaultValues: { ...reservaVacia, ambienteId: typeof ambienteId === 'string' ? ambienteId : '',
      fecha: typeof fecha === 'string' ? fecha : '', horas: listaHoras,
      personas: ambiente ? Math.min(10, ambiente.capacidad) : 1 },
    mode: 'onBlur', reValidateMode: 'onChange',
  });
  const field = { control, trigger };

  if (cargando) return null;
  if (!usuario) return <Redirect href="/login" />;

  if (!ambiente || listaHoras.length === 0) {
    return (
      <ContenedorPantalla edges={['top']}>
        <EncabezadoPantalla
          titulo="Nueva reserva"
          mostrarVolver
          onVolver={() => router.back()}
        />
        <View style={styles.sinDatos}>
          <EstadoVacio
            icono="alert-circle-outline"
            titulo="Selección incompleta"
            texto="Necesitas elegir un ambiente y al menos un bloque horario para continuar."
            accionTexto="Elegir horario"
            onAccion={() => router.replace('/explorar')}
          />
        </View>
      </ContenedorPantalla>
    );
  }

  const categoria = obtenerCategoria(ambiente.categoria);
  const total = ambiente.tarifaPorHora * listaHoras.length;
  const limiteAlcanzado = estadisticas.activas >= MAX_RESERVAS_ACTIVAS;
  const esperaAprobacion = requiereAprobacion(ambiente);

  const confirmar = async (datos) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    const accion = agregarReserva({
      ...datos,
      tarifaPorHora: ambiente.tarifaPorHora,
      requiereAprobacion: esperaAprobacion,
    });
    dispatch(accion);
    reset();
    router.back();
    mostrarConfirmacion(esperaAprobacion ? 'Solicitud registrada' : 'Reserva confirmada',
      `${datos.nombreGrupo}: tu reserva ${accion.payload.codigo} ya aparece en Mis reservas.`, [
        { text: 'Aceptar' },
        { text: 'Ver comprobante', onPress: () => router.push(`/reserva/${accion.payload.id}`) },
      ]);
  };
  const enviarFormulario = handleSubmit(confirmar);

  return (
    <FormScreen>
      <EncabezadoPantalla
        titulo="Confirmar reserva"
        subtitulo="Revisa los datos antes de solicitar tu bloque"
        mostrarVolver
        onVolver={() => router.back()}
      />

      <View style={styles.tarjetaAmbiente}>
        <ImagenAmbiente
          url={ambiente.imagen}
          icono={categoria.icono}
          altura={120}
          style={styles.imagenAmbiente}
        />
        <View style={styles.datosAmbiente}>
          <Text style={styles.nombreAmbiente}>{ambiente.nombre}</Text>
          <ElementoInfo icono="location-outline" etiqueta="Ubicación" valor={ambiente.ubicacion} />
        </View>
      </View>

      <View style={styles.seccion}>
        <EncabezadoSeccion titulo="Detalle del bloque" />
        {errors.ambienteId && <Aviso tono="error" texto={errors.ambienteId.message} />}
        {errors.fecha && <Aviso tono="error" texto={errors.fecha.message} />}
        {errors.horas && <Aviso tono="error" texto={errors.horas.message || 'Elige un bloque horario válido'} />}
        {(errors.ambienteId || errors.fecha || errors.horas) && (
          <BotonPrincipal texto="Volver a elegir horario" variante="borde" onPress={() => router.back()} />
        )}
        <View style={[styles.tarjetaResumen, shadows.sm]}>
          <FilaResumen etiqueta="Fecha" valor={typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? formatearFechaLarga(fecha) : 'Selecciona una fecha válida'} />
          <FilaResumen etiqueta="Horario" valor={rangoHorario(listaHoras)} />
          <FilaResumen
            etiqueta="Duración"
            valor={`${listaHoras.length} ${listaHoras.length === 1 ? 'hora' : 'horas'}`}
          />
          <FilaResumen etiqueta="Tarifa por hora" valor={`S/ ${ambiente.tarifaPorHora}`} />
          <FilaResumen etiqueta="Total" valor={`S/ ${total}`} destacado conBorde={false} />
        </View>
      </View>

      {esperaAprobacion && (
        <Aviso
          tono="alerta"
          titulo="Sujeta a aprobación"
          texto="Un coordinador del CESPAR revisará tu solicitud antes de emitir el comprobante definitivo."
          style={styles.aviso}
        />
      )}

      {limiteAlcanzado && (
        <Aviso
          tono="error"
          titulo="Límite de reservas activas"
          texto={`Ya tienes ${estadisticas.activas} reservas activas. Cancela una para poder solicitar una nueva.`}
          style={styles.aviso}
        />
      )}
      {errors.root?.limite && <Aviso tono="error" texto={errors.root.limite.message} style={styles.aviso} />}

      <View style={styles.seccion}>
        <EncabezadoSeccion titulo="Datos del grupo" />
        <FormField {...field} name="nombreGrupo" label="Nombre del grupo" placeholder="Ej. Selección de Ingeniería"
          autoCapitalize="words" maxLength={60} returnKeyType="next" submitBehavior="submit"
          onSubmitEditing={() => celularRef.current?.focus()} />
        <FormField {...field} ref={celularRef} name="celular" label="Celular de contacto" placeholder="987654321"
          keyboardType="number-pad" autoCapitalize="none" autoCorrect={false} maxLength={9}
          returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => observacionesRef.current?.focus()} />
        <ChipSelectField {...field} name="tipoActividad" label="Tipo de actividad" opciones={TIPOS_ACTIVIDAD} />
        <FormControl {...field} name="personas">
          {({ value, onChange }) => <SelectorCantidad etiqueta="Número de jugadores" valor={value}
            onChange={onChange} minimo={1} maximo={ambiente.capacidad} sufijo="personas" />}
        </FormControl>

        <FormField {...field}
          ref={observacionesRef} name="observaciones" label="Observaciones para CESPAR (opcional)"
          placeholder="Ej. Campeonato interno de Ingeniería, requerimos arcos adicionales."
          icono="create-outline"
          multiline
          maxLength={180}
          returnKeyType="send"
          blurOnSubmit
          submitBehavior="blurAndSubmit"
          onSubmitEditing={enviarFormulario}
          ayuda={`Solicitante: ${usuario?.nombre} · ${usuario?.codigo}`}
          style={styles.campoObservaciones}
        />
      </View>

      <BotonPrincipal
        texto={isSubmitting ? 'Guardando...' : esperaAprobacion ? 'Enviar solicitud' : 'Confirmar reserva'}
        icono="checkmark-circle-outline"
        tamano="lg"
        cargando={isSubmitting}
        deshabilitado={limiteAlcanzado || isSubmitting}
        onPress={enviarFormulario}
      />

      <Text style={styles.avisoCancelacion}>
        Puedes cancelar sin costo hasta 4 horas antes del inicio del bloque.
      </Text>
    </FormScreen>
  );
}

function FilaResumen({ etiqueta, valor, destacado = false, conBorde = true }) {
  return (
    <View style={[styles.filaResumen, conBorde && styles.filaResumenBorde]}>
      <Text style={styles.etiquetaResumen}>{etiqueta}</Text>
      <Text style={[styles.valorResumen, destacado && styles.valorResumenDestacado]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sinDatos: {
    marginTop: spacing.xl,
  },
  tarjetaAmbiente: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  imagenAmbiente: {
    height: 120,
  },
  datosAmbiente: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  nombreAmbiente: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  tarjetaResumen: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  filaResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  filaResumenBorde: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  etiquetaResumen: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  valorResumen: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  valorResumenDestacado: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
  aviso: {
    marginBottom: spacing.lg,
  },
  campoObservaciones: {
    marginTop: spacing.md,
  },
  avisoCancelacion: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
