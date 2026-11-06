const { test } = require('node:test');
const assert = require('node:assert/strict');
const { registerHooks } = require('node:module');

// Metro permite imports sin extensión. Node 24 necesita resolverlos en las pruebas.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@react-native-async-storage/async-storage') {
      return nextResolve(require('node:url').pathToFileURL(require('node:path').join(__dirname, 'storageMock.cjs')).href, context);
    }
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.js`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { contactoSchema, contactoVacio } = require('../src/schemas/contactoSchema.js');
const { loginSchema } = require('../src/schemas/loginSchema.js');
const { crearReservaSchema, reservaVacia } = require('../src/schemas/reservaSchema.js');
const { AMBIENTES } = require('../src/data/ambientes.js');
const { aISO, sumarDias } = require('../src/utils/fechas.js');
const { bloquesDelDia } = require('../src/utils/disponibilidad.js');
const { zodResolver } = require('@hookform/resolvers/zod');
const { createFormControl } = require('react-hook-form');
const { configureStore } = require('@reduxjs/toolkit');
const { default: reducer, agregarReserva, cancelarReserva, eliminarReserva, reemplazarTodas,
  selectEstadisticas } = require('../src/store/reservasSlice.js');

const contactoValido = {
  nombre: '  Ana Pérez  ', correo: '  ANA@URP.EDU.PE  ', celular: '987654321',
  tipo: 'consulta', calificacion: 4, mensaje: '  Quisiera conocer los horarios de atención.  ', aceptaTerminos: true,
};
const fecha = aISO(sumarDias(new Date(), 1));
const ambiente = AMBIENTES.find((a) => !a.mantenimiento && bloquesDelDia(a.id, fecha).some((b) => b.disponible));
const hora = bloquesDelDia(ambiente.id, fecha).find((b) => b.disponible).hora;
const reservaValida = { ...reservaVacia, ambienteId: ambiente.id, fecha, horas: [hora],
  nombreGrupo: '  Selección de Ingeniería  ', celular: '987654321', tipoActividad: 'entrenamiento',
  personas: 5, observaciones: '  Entrenamiento del equipo  ' };
const crearStore = () => configureStore({ reducer: { reservas: reducer },
  preloadedState: { reservas: { items: [] } } });
const camposConError = (resultado) => resultado.error.issues.map((issue) => issue.path[0]);

test('Contacto vacío muestra errores en los siete campos', () => {
  const resultado = contactoSchema.safeParse(contactoVacio);
  assert.equal(resultado.success, false);
  assert.deepEqual(new Set(camposConError(resultado)), new Set(Object.keys(contactoVacio)));
});

test('Contacto limpia texto y correo y conserva los tipos no textuales', () => {
  const datos = contactoSchema.parse(contactoValido);
  assert.equal(datos.nombre, 'Ana Pérez');
  assert.equal(datos.correo, 'ana@urp.edu.pe');
  assert.equal(datos.mensaje, 'Quisiera conocer los horarios de atención.');
  assert.equal(typeof datos.calificacion, 'number');
  assert.equal(typeof datos.aceptaTerminos, 'boolean');
});

test('Contacto rechaza formatos, longitudes, enums y tipos inválidos', () => {
  const invalidos = { nombre: ['ab', 'x'.repeat(81)], correo: ['sin-arroba', `${'x'.repeat(120)}@urp.edu.pe`],
    celular: ['98765432', '887654321', '9abcdefgh'], tipo: ['otro'], calificacion: [0, 6, 2.5, '4'],
    mensaje: ['corto', 'x'.repeat(501)], aceptaTerminos: [false, 'true'] };
  for (const [campo, valores] of Object.entries(invalidos)) {
    for (const valor of valores) {
      const resultado = contactoSchema.safeParse({ ...contactoValido, [campo]: valor });
      assert.equal(resultado.success, false, `${campo}=${valor}`);
      assert.ok(camposConError(resultado).includes(campo));
    }
  }
});

test('Login conserva la cuenta demo, valida código y no recorta contraseñas', () => {
  assert.equal(loginSchema.parse({ codigo: ' 2022101234 ', contrasena: 'urp2026' }).codigo, '2022101234');
  assert.equal(loginSchema.parse({ codigo: '2022101234', contrasena: ' clave ' }).contrasena, ' clave ');
  for (const codigo of ['', '123', '1234567890123', 'abcd']) {
    assert.equal(loginSchema.safeParse({ codigo, contrasena: 'urp2026' }).success, false);
  }
  assert.equal(loginSchema.safeParse({ codigo: '2022101234', contrasena: '123' }).success, false);
});

test('Reserva valida vacío, aforo, fecha real, límites de texto y bloques', () => {
  const schema = crearReservaSchema();
  assert.equal(schema.safeParse(reservaValida).success, true);
  const vacio = schema.safeParse(reservaVacia);
  for (const campo of ['ambienteId', 'fecha', 'horas', 'nombreGrupo', 'celular', 'tipoActividad']) {
    assert.ok(camposConError(vacio).includes(campo));
  }
  for (const cambio of [
    { personas: ambiente.capacidad + 1 }, { personas: 0 }, { personas: 1.5 }, { personas: '5' },
    { nombreGrupo: 'abc' }, { nombreGrupo: 'x'.repeat(61) }, { observaciones: 'x'.repeat(181) },
    { tipoActividad: 'otro' }, { fecha: '2026-02-30' }, { fecha: '2000-01-01' },
    { fecha: aISO(sumarDias(new Date(), 14)) }, { horas: [] }, { horas: [hora, hora] },
    { horas: ['99:00'] }, { horas: ['07:00', '08:00', '09:00', '10:00', '11:00'] },
    { ambienteId: 'no-existe' },
  ]) assert.equal(schema.safeParse({ ...reservaValida, ...cambio }).success, false, JSON.stringify(cambio));
  const mantenimiento = AMBIENTES.find((a) => a.mantenimiento);
  if (mantenimiento) assert.equal(schema.safeParse({ ...reservaValida, ambienteId: mantenimiento.id }).success, false);
});

test('Reserva rechaza un bloque ocupado en el catálogo', () => {
  const ocupado = bloquesDelDia(ambiente.id, fecha).find((b) => !b.disponible);
  assert.ok(ocupado);
  const resultado = crearReservaSchema().safeParse({ ...reservaValida, horas: [ocupado.hora] });
  assert.ok(camposConError(resultado).includes('horas'));
});

test('Resolver + handleSubmit impiden dispatch inválido y reset limpia el formulario', async () => {
  const store = crearStore();
  const form = createFormControl({ defaultValues: reservaVacia,
    resolver: zodResolver(crearReservaSchema(() => store.getState().reservas.items)) });
  let envios = 0;
  const guardar = form.handleSubmit((datos) => { envios += 1; store.dispatch(agregarReserva({ ...datos, tarifaPorHora: 40 })); });
  await guardar();
  assert.equal(envios, 0);
  assert.equal(store.getState().reservas.items.length, 0);
  form.reset(reservaValida);
  await guardar();
  assert.equal(envios, 1);
  const creada = store.getState().reservas.items[0];
  assert.equal(creada.nombreGrupo, 'Selección de Ingeniería');
  assert.equal(creada.observaciones, 'Entrenamiento del equipo');
  assert.equal(creada.celular, '987654321');
  assert.equal(creada.tipoActividad, 'entrenamiento');
  assert.equal(creada.monto, 40);
  assert.match(creada.codigo, /^URP-[A-Z2-9]{5}$/);
  form.reset(reservaVacia);
  await guardar();
  assert.equal(envios, 1);
});

test('El esquema consulta el store actualizado y no permite doble reserva ni el límite de tres', () => {
  const store = crearStore();
  const schema = crearReservaSchema(() => store.getState().reservas.items);
  assert.equal(schema.safeParse(reservaValida).success, true);
  const accion = agregarReserva(reservaValida);
  store.dispatch(accion);
  assert.ok(camposConError(schema.safeParse(reservaValida)).includes('horas'));
  store.dispatch(cancelarReserva({ id: accion.payload.id }));
  assert.equal(schema.safeParse(reservaValida).success, true);
  store.dispatch(reemplazarTodas(Array.from({ length: 3 }, (_, i) => ({ ...accion.payload, id: `res-${i}` }))));
  assert.ok(schema.safeParse(reservaValida).error.issues.some((issue) => issue.path.join('.') === 'root.limite'));
});

test('Redux mantiene cancelar, eliminar, estadísticas y rehidratar una lista vacía', () => {
  const store = crearStore();
  const accion = agregarReserva(reservaValida);
  store.dispatch(accion);
  assert.equal(selectEstadisticas(store.getState()).activas, 1);
  store.dispatch(cancelarReserva({ id: accion.payload.id, motivo: 'Prueba' }));
  assert.equal(selectEstadisticas(store.getState()).canceladas, 1);
  store.dispatch(eliminarReserva(accion.payload.id));
  assert.equal(store.getState().reservas.items.length, 0);
  store.dispatch(reemplazarTodas([accion.payload]));
  store.dispatch(reemplazarTodas([]));
  assert.deepEqual(store.getState().reservas.items, []);
});

test('Persistencia serializa y restaura campos nuevos y también una lista vacía', async () => {
  const { cargarReservas, suscribirPersistencia } = require('../src/store/persistencia.js');
  const store = crearStore();
  suscribirPersistencia(store);
  const accion = agregarReserva(crearReservaSchema().parse(reservaValida));
  store.dispatch(accion);
  const items = await cargarReservas();
  assert.equal(items[0].nombreGrupo, 'Selección de Ingeniería');
  assert.equal(items[0].celular, '987654321');
  assert.equal(items[0].tipoActividad, 'entrenamiento');
  store.dispatch(eliminarReserva(accion.payload.id));
  assert.deepEqual(await cargarReservas(), []);
});

test('Contacto: handleSubmit bloquea datos inválidos y reset vuelve a siete valores vacíos', async () => {
  const form = createFormControl({ defaultValues: contactoVacio, resolver: zodResolver(contactoSchema) });
  let envios = 0;
  const enviar = form.handleSubmit((datos) => { envios += 1; assert.equal(datos.correo, 'ana@urp.edu.pe'); });
  await enviar();
  assert.equal(envios, 0);
  form.reset(contactoValido);
  await enviar();
  assert.equal(envios, 1);
  form.reset(contactoVacio);
  await enviar();
  assert.equal(envios, 1);
});

test('El resolver devuelve el límite global en root y handleSubmit tampoco lo evita con teclado', async () => {
  const store = crearStore();
  for (let i = 0; i < 3; i++) store.dispatch(agregarReserva({ ...reservaValida, ambienteId: `otro-${i}` }));
  const form = createFormControl({ defaultValues: reservaValida,
    resolver: zodResolver(crearReservaSchema(() => store.getState().reservas.items)) });
  let envios = 0;
  let errorLimite;
  await form.handleSubmit(() => { envios += 1; }, (errores) => { errorLimite = errores.root.limite.message; })();
  assert.equal(envios, 0);
  assert.match(errorLimite, /3 reservas activas/);
});
