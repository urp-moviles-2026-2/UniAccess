// tests/lab06.test.cjs - Pruebas automatizadas para LAB-06 (Autenticación y Sesión)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { registerHooks } = require('node:module');

// Resolver para módulos nativos en Node 24
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@react-native-async-storage/async-storage') {
      return nextResolve(
        require('node:url').pathToFileURL(require('node:path').join(__dirname, 'storageMock.cjs')).href,
        context
      );
    }
    if (specifier === 'expo-secure-store') {
      return nextResolve(
        require('node:url').pathToFileURL(require('node:path').join(__dirname, 'secureStoreMock.cjs')).href,
        context
      );
    }
    if (specifier === 'react-native-url-polyfill/auto' || specifier.startsWith('react-native-url-polyfill')) {
      return nextResolve(
        require('node:url').pathToFileURL(require('node:path').join(__dirname, 'urlPolyfillMock.cjs')).href,
        context
      );
    }
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.js`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { loginSchema, registroSchema, loginVacio, registroVacio } = require('../src/schemas/authSchema.js');
const { aUsuario, mensajeDeAuth } = require('../src/services/auth.js');
const { configureStore } = require('@reduxjs/toolkit');
const { default: reservasReducer, agregarReserva, reemplazarTodas } = require('../src/store/reservasSlice.js');

test('authSchema: loginSchema valida correo, formato, min 8 caracteres y normaliza', () => {
  // Caso válido
  const valido = loginSchema.parse({
    correo: '  ESTUDIANTE@URP.EDU.PE  ',
    clave: '12345678',
  });
  assert.equal(valido.correo, 'estudiante@urp.edu.pe');
  assert.equal(valido.clave, '12345678');

  // Correo inválido
  const correoInvalido = loginSchema.safeParse({ correo: 'sin-arroba', clave: '12345678' });
  assert.equal(correoInvalido.success, false);
  assert.ok(correoInvalido.error.issues.some((i) => i.path[0] === 'correo'));

  // Contraseña menor a 8 caracteres
  const claveCorta = loginSchema.safeParse({ correo: 'estudiante@urp.edu.pe', clave: '1234567' });
  assert.equal(claveCorta.success, false);
  assert.equal(claveCorta.error.issues[0].message, 'Mínimo 8 caracteres');

  // Vacío
  const vacio = loginSchema.safeParse(loginVacio);
  assert.equal(vacio.success, false);
  assert.equal(vacio.error.issues.length, 2);
});

test('authSchema: registroSchema valida nombre, contraseña y coincidencia', () => {
  // Caso válido
  const valido = registroSchema.safeParse({
    nombre: '  Ana Pérez  ',
    correo: 'ana@urp.edu.pe',
    clave: 'claveSegura2026',
    confirmarClave: 'claveSegura2026',
  });
  assert.equal(valido.success, true);
  assert.equal(valido.data.nombre, 'Ana Pérez');

  // Nombre muy corto (< 2)
  const nombreCorto = registroSchema.safeParse({
    nombre: 'A',
    correo: 'ana@urp.edu.pe',
    clave: 'claveSegura2026',
    confirmarClave: 'claveSegura2026',
  });
  assert.equal(nombreCorto.success, false);
  assert.ok(nombreCorto.error.issues.some((i) => i.path[0] === 'nombre'));

  // Contraseñas no coinciden
  const noCoincide = registroSchema.safeParse({
    nombre: 'Ana Pérez',
    correo: 'ana@urp.edu.pe',
    clave: 'claveSegura2026',
    confirmarClave: 'otraClaveDistinta',
  });
  assert.equal(noCoincide.success, false);
  const errorConfirmar = noCoincide.error.issues.find((i) => i.path[0] === 'confirmarClave');
  assert.ok(errorConfirmar);
  assert.equal(errorConfirmar.message, 'Las contraseñas no coinciden');

  // Vacío
  const vacio = registroSchema.safeParse(registroVacio);
  assert.equal(vacio.success, false);
});

test('authService: aUsuario mapea correctamente el modelo de usuario de la app', () => {
  assert.equal(aUsuario(null), null);

  const rawUser = {
    id: 'user-uuid-123',
    email: 'claudio@urp.edu.pe',
    user_metadata: {
      nombre: 'Claudio Quello',
      codigo: '2021101234',
      escuela: 'Ingeniería Informática',
      ciclo: '2026-II',
    },
  };

  const usuario = aUsuario(rawUser);
  assert.equal(usuario.id, 'user-uuid-123');
  assert.equal(usuario.correo, 'claudio@urp.edu.pe');
  assert.equal(usuario.nombre, 'Claudio Quello');
  assert.equal(usuario.codigo, '2021101234');
  assert.equal(usuario.escuela, 'Ingeniería Informática');
  assert.equal(usuario.iniciales, 'CQ');
});

test('authService: mensajeDeAuth unifica credenciales para prevenir enumeración de usuarios', () => {
  // Credenciales erróneas
  assert.equal(
    mensajeDeAuth({ code: 'invalid_credentials' }),
    'Correo o contraseña incorrectos'
  );
  assert.equal(
    mensajeDeAuth({ message: 'Invalid login credentials' }),
    'Correo o contraseña incorrectos'
  );

  // Usuario ya registrado
  assert.equal(
    mensajeDeAuth({ code: 'user_already_exists' }),
    'No se pudo crear la cuenta. Si ya tienes una, inicia sesión'
  );
  assert.equal(
    mensajeDeAuth({ message: 'User already registered' }),
    'No se pudo crear la cuenta. Si ya tienes una, inicia sesión'
  );

  // Contraseña débil
  assert.equal(
    mensajeDeAuth({ code: 'weak_password' }),
    'La contraseña es muy débil'
  );

  // Error de conexión / red
  assert.equal(
    mensajeDeAuth({ name: 'AuthRetryableFetchError' }),
    'Sin conexión. Revisa tu internet e inténtalo de nuevo'
  );
  assert.equal(
    mensajeDeAuth({ message: 'Failed to fetch from network' }),
    'Sin conexión. Revisa tu internet e inténtalo de nuevo'
  );

  // Desconocido
  assert.equal(
    mensajeDeAuth(new Error('error inesperado')),
    'No pudimos completar la operación. Inténtalo de nuevo'
  );
});

test('Logout completo: vacía el store de Redux sin dejar rastro de reservas previas', () => {
  const store = configureStore({
    reducer: { reservas: reservasReducer },
    preloadedState: {
      reservas: {
        items: [
          { id: 'res-1', nombreGrupo: 'Grupo A' },
          { id: 'res-2', nombreGrupo: 'Grupo B' },
        ],
      },
    },
  });

  assert.equal(store.getState().reservas.items.length, 2);

  // Ejecución de la acción de limpieza que llama useCerrarSesion
  store.dispatch(reemplazarTodas([]));

  assert.equal(store.getState().reservas.items.length, 0);
  assert.deepEqual(store.getState().reservas.items, []);
});
