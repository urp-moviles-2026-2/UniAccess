# UniAccess URP

App de reservas de ambientes deportivos del CESPAR, construida con Expo Router, React Native, Context de sesión, Redux Toolkit y AsyncStorage.

## Ejecutar

Con Node.js y npm disponibles:

```sh
npm ci
npm start
```

Abrir el proyecto en Expo Go para **SDK 58** y escanear el QR. PC y teléfono deben poder comunicarse en la misma red. `npm run web` abre la versión web. La cuenta de prueba es código `2022101234` y contraseña `urp2026`; es acceso de demostración, sin autenticación con la universidad.

Se actualizó desde SDK 57 para coincidir con Expo Go del iPhone utilizado en las pruebas del laboratorio. React, React Native y los módulos de Expo se alinean con las versiones recomendadas por SDK 58. `web.output: 'single'` conserva la versión web como SPA, sin introducir renderizado en servidor.

## LAB-05

- [Inventario de formularios](docs/formularios.md): Nueva reserva, Contacto y login.
- [Mapa de navegación](docs/navegacion.md).
- [Mapa de estado](docs/estado.md).
- [Evidencias del iPhone](docs/evidencias/README.md): capturas recibidas y dos casos de envío vacío pendientes.
- [Preparación de entrega y reflexión](docs/lab-05-entrega.md): incluye las evidencias y datos del equipo pendientes.

La rama `lab-05` parte de `lab-04`; no se integra a `main` como parte del laboratorio. Contacto realiza un envío simulado y no transmite datos a un servidor.

## Verificar

Las pruebas usan el runner integrado de **Node 24 o posterior**, sin instalar otro framework:

```sh
npm test
npm run check:web
npm run check:android
npm run check:ios
```

La exportación Android verifica Metro y Hermes; no genera un APK ni reemplaza las pruebas en el teléfono. Los tests comprueban esquemas, mensajes de obligatorios, limpieza de texto, resolver + handleSubmit antes del dispatch, reset, cruces, aforo, límite de reservas y acciones del store.
