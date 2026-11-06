// src/app/ambiente/[id].js
// Detalle del ambiente: ficha técnica, fecha, horarios disponibles y resumen
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing, shadows } from '../../theme';
import { selectReservas } from '../../store/reservasSlice';
import { obtenerAmbiente, obtenerCategoria } from '../../data/ambientes';
import { bloquesDelDia } from '../../utils/disponibilidad';
import { generarDias, formatearFechaLarga, rangoHorario, hoyISO } from '../../utils/fechas';
import { requiereAprobacion, estadoEfectivo } from '../../utils/reservas';
import ImagenAmbiente from '../../components/ImagenAmbiente';
import BotonIcono from '../../components/BotonIcono';
import InsigniaEstado from '../../components/InsigniaEstado';
import ElementoInfo from '../../components/ElementoInfo';
import EncabezadoSeccion from '../../components/EncabezadoSeccion';
import SelectorFecha from '../../components/SelectorFecha';
import SelectorHorario from '../../components/SelectorHorario';
import BotonPrincipal from '../../components/BotonPrincipal';
import Aviso from '../../components/Aviso';
import EstadoVacio from '../../components/EstadoVacio';

const MAX_BLOQUES_POR_RESERVA = 4;

export default function PantallaAmbiente() {
  const { id } = useLocalSearchParams();
  const reservas = useSelector(selectReservas);

  const horasReservadasPorMi = (ambienteId, fechaConsulta) => {
    const conjunto = new Set();
    reservas
      .filter(
        (r) =>
          r.ambienteId === ambienteId &&
          r.fecha === fechaConsulta &&
          estadoEfectivo(r) !== 'cancelada',
      )
      .forEach((r) => r.horas.forEach((h) => conjunto.add(h)));
    return conjunto;
  };

  const ambiente = obtenerAmbiente(id);
  const dias = useMemo(() => generarDias(14), []);
  const [fecha, setFecha] = useState(hoyISO());
  const [seleccionados, setSeleccionados] = useState([]);
  useFocusEffect(useCallback(() => { setSeleccionados([]); }, []));

  if (!ambiente) {
    return (
      <SafeAreaView style={styles.area} edges={['top']}>
        <View style={styles.sinAmbiente}>
          <EstadoVacio
            icono="alert-circle-outline"
            titulo="Ambiente no encontrado"
            texto="El ambiente que buscas ya no está disponible en el catálogo del CESPAR."
            accionTexto="Volver al listado"
            onAccion={() => router.replace('/explorar')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoria = obtenerCategoria(ambiente.categoria);
  const bloquesBase = bloquesDelDia(ambiente.id, fecha);
  const misReservasDelDia = Array.from(horasReservadasPorMi(ambiente.id, fecha));

  // Los bloques que el estudiante ya reservó se marcan como no disponibles
  const bloques = bloquesBase.map((bloque) => ({
    ...bloque,
    disponible: bloque.disponible && !misReservasDelDia.includes(bloque.hora),
  }));

  const libres = bloques.filter((bloque) => bloque.disponible).length;
  const total = ambiente.tarifaPorHora * seleccionados.length;
  const enMantenimiento = Boolean(ambiente.mantenimiento);

  const alternarBloque = (hora) => {
    setSeleccionados((previos) => {
      if (previos.includes(hora)) return previos.filter((item) => item !== hora);
      if (previos.length >= MAX_BLOQUES_POR_RESERVA) {
        Alert.alert(
          'Límite de bloques',
          `Solo puedes reservar hasta ${MAX_BLOQUES_POR_RESERVA} horas seguidas en una misma solicitud.`,
        );
        return previos;
      }
      return [...previos, hora];
    });
  };

  const continuar = () => {
    router.push({
      pathname: '/reserva/nueva',
      params: {
        ambienteId: ambiente.id,
        fecha,
        horas: seleccionados.join(','),
      },
    });
  };

  return (
    <View style={styles.area}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <ImagenAmbiente url={ambiente.imagen} icono={categoria.icono} altura={228}>
          <SafeAreaView edges={['top']} style={styles.capaSuperior}>
            <BotonIcono
              icono="arrow-back"
              variante="sobreImagen"
              onPress={() => router.back()}
              accessibilityLabel="Volver"
            />
          </SafeAreaView>

          <View style={styles.insigniaFlotante}>
            <InsigniaEstado
              estado={enMantenimiento ? 'mantenimiento' : libres > 0 ? 'disponible' : 'ocupado'}
              etiqueta={enMantenimiento ? 'Mantenimiento' : libres > 0 ? `${libres} horarios libres` : 'Sin horarios hoy'}
            />
          </View>
        </ImagenAmbiente>

        <View style={styles.cuerpo}>
          <Text style={styles.categoria}>{categoria.etiqueta}</Text>
          <Text style={styles.titulo}>{ambiente.nombre}</Text>

          <View style={styles.ficha}>
            <ElementoInfo
              direccion="columna"
              icono="people-outline"
              etiqueta="Aforo"
              valor={`${ambiente.capacidad} personas`}
            />
            <ElementoInfo
              direccion="columna"
              icono="layers-outline"
              etiqueta="Superficie"
              valor={ambiente.superficie}
            />
            <ElementoInfo
              direccion="columna"
              icono="cash-outline"
              etiqueta="Tarifa"
              valor={`S/ ${ambiente.tarifaPorHora}/h`}
            />
          </View>

          <Text style={styles.descripcion}>{ambiente.descripcion}</Text>

          <ElementoInfo
            icono="location-outline"
            etiqueta="Ubicación"
            valor={ambiente.ubicacion}
            style={styles.ubicacion}
          />

          <View style={styles.servicios}>
            {ambiente.servicios.map((servicio) => (
              <View key={servicio} style={styles.chipServicio}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                <Text style={styles.textoServicio}>{servicio}</Text>
              </View>
            ))}
          </View>

          {enMantenimiento && (
            <Aviso
              tono="alerta"
              titulo="Ambiente en mantenimiento"
              texto="Este ambiente no admite reservas por el momento. Vuelve a intentarlo cuando CESPAR habilite los horarios."
              style={styles.avisoMantenimiento}
            />
          )}

          <View style={styles.seccionFecha}>
            <EncabezadoSeccion titulo="Elige la fecha" subtitulo={formatearFechaLarga(fecha)} />
            <SelectorFecha
              dias={dias}
              fechaSeleccionada={fecha}
              onChange={(nuevaFecha) => {
                setFecha(nuevaFecha);
                setSeleccionados([]);
              }}
            />
          </View>

          <View style={[styles.seccion, enMantenimiento && styles.seccionBloqueada]}>
            <EncabezadoSeccion
              titulo="Bloques de una hora"
              subtitulo={`${libres} de ${bloques.length} bloques disponibles`}
            />

            {libres === 0 && !enMantenimiento ? (
              <EstadoVacio
                icono="time-outline"
                titulo="Sin horarios disponibles"
                texto="No quedan bloques libres para esta fecha. Prueba con otro día."
              />
            ) : (
              <SelectorHorario
                horarios={bloques}
                multiple
                seleccionados={seleccionados}
                onToggle={alternarBloque}
                horariosReservados={misReservasDelDia}
              />
            )}
          </View>

          <View style={styles.seccion}>
            <EncabezadoSeccion titulo="Resumen" />
            <View style={[styles.tarjetaResumen, shadows.sm]}>
              <FilaResumen
                etiqueta="Bloques elegidos"
                valor={seleccionados.length ? rangoHorario(seleccionados) : 'Ninguno'}
              />
              <FilaResumen
                etiqueta="Duración"
                valor={`${seleccionados.length} ${seleccionados.length === 1 ? 'hora' : 'horas'}`}
              />
              <FilaResumen etiqueta="Tarifa por hora" valor={`S/ ${ambiente.tarifaPorHora}`} />
              <FilaResumen etiqueta="Total estimado" valor={`S/ ${total}`} destacado conBorde={false} />
            </View>

            {requiereAprobacion(ambiente) && (
              <Aviso
                tono="alerta"
                titulo="Requiere aprobación de CESPAR"
                texto="Los ambientes de gran aforo se confirman luego de la revisión de la coordinación de deportes."
                style={styles.avisoReserva}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.pieFijo}>
        <View style={styles.resumenPie}>
          <Text style={styles.etiquetaPie}>Total</Text>
          <Text style={styles.montoPie}>S/ {total}</Text>
        </View>
        <BotonPrincipal
          texto={seleccionados.length ? 'Continuar' : 'Elige un horario'}
          icono="arrow-forward"
          deshabilitado={seleccionados.length === 0 || enMantenimiento}
          onPress={continuar}
          style={styles.botonPie}
        />
      </SafeAreaView>
    </View>
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
  area: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sinAmbiente: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  contenido: {
    paddingBottom: spacing.xxxl,
  },
  capaSuperior: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  insigniaFlotante: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
  },
  cuerpo: {
    padding: spacing.lg,
  },
  categoria: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  titulo: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  ficha: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descripcion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.lg,
  },
  ubicacion: {
    marginTop: spacing.lg,
  },
  servicios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chipServicio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
  },
  textoServicio: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  avisoMantenimiento: {
    marginTop: spacing.lg,
  },
  seccionFecha: {
    marginTop: spacing.xl,
  },
  seccion: {
    marginTop: spacing.xl,
  },
  seccionBloqueada: {
    opacity: 0.5,
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
  avisoReserva: {
    marginTop: spacing.md,
  },
  pieFijo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resumenPie: {
    flex: 1,
  },
  etiquetaPie: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  montoPie: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  botonPie: {
    flexShrink: 0,
    paddingHorizontal: spacing.xl,
  },
});
