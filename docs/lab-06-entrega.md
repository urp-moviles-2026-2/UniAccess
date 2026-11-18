# LAB-06 — UniAccess URP
## Entrega de Autenticación en el Proyecto Final con Servicio de Identidad

Documento de preparación de la entrega para el sub-issue en el hilo [#24 - LAB-06 Entrega](https://github.com/urp-moviles-2026-2/.github-private/issues/24).

---

## 1. Integrantes del Equipo

| Integrante | Correo | Usuario GitHub | Aporte real al LAB-06 |
|---|---|---|---|
| **Claudio Fernando Quello Yapu** | claudioquello5@gmail.com | ClaudioURP | Configuración de Supabase, `src/lib/supabase.js`, `src/services/auth.js` y adaptación de `useCerrarSesion`. |
| **Giussephe Astudillo Navarro** | giusephe.an@gmail.com | Dav1d963 | Implementación de pantallas `LoginScreen`, `RegistroScreen` y esquemas de validación Zod (`authSchema.js`). |
| **Jorge Sebastián Suárez Arango** | 202112441@urp.edu.pe | sebastia16 | Integración de `SesionContext` con los 3 estados, navegación reactiva con splash y pantalla de recurso protegido (`src/app/reportes.js` con RLS). |

---

## 2. Servicio Elegido

- **Servicio:** **Supabase Auth**
- **Justificación y especificación técnica:** [docs/autenticacion.md](autenticacion.md)

---

## 3. Repositorio

- **Rama de entrega:** `lab-06`
- **Enlace a la rama:** https://github.com/urp-moviles-2026-2/UniAccess/tree/lab-06
- **Rama base:** `lab-05`

---

## 4. Respuestas a las Preguntas de Reflexión (para el Sub-Issue)

### Pregunta 1: ¿Qué servicio de identidad eligieron y qué descartaron? ¿Qué tendrían que cambiar en su código si mañana migran a otro, y qué archivos no se tocarían?
> **Respuesta:**
> Elegimos **Supabase Auth** porque nuestra aplicación de reserva de espacios deportivos (CESPAR) requiere una base de datos relacional para gestionar ambientes, horarios e incidencias; Supabase nos provee Postgres con autenticación integrada y Row Level Security (RLS) sin necesidad de mantener un servidor backend dedicado. Descartamos Firebase Authentication y Firestore porque nuestro modelo de datos encaja de forma natural en tablas relacionales SQL y no en colecciones documentales NoSQL. También descartamos Clerk y Auth0 porque requerían configuraciones adicionales de deep linking o development builds fuera de Expo Go.
> 
> Si mañana migráramos a otro servicio (por ejemplo Firebase o una API REST propia con JWT):
> - **Archivos que cambiarían:** Únicamente `src/lib/supabase.js` (reemplazado por el SDK nuevo) y `src/services/auth.js` (para adaptar las llamadas de `registrar`, `iniciarSesion`, `cerrarSesion` y `escucharSesion`).
> - **Archivos que NO se tocarían:** Ninguna de las pantallas (`login.js`, `registro.js`, `perfil.js`), ni los componentes (`FormField`, `BotonPrincipal`), ni los esquemas (`authSchema.js`), ni el contexto (`SesionContext.js`), ni los hooks (`useCerrarSesion.js`), ya que la capa de abstracción aísla por completo al proveedor de la interfaz de usuario.

### Pregunta 2: ¿Dónde quedan guardados los tokens en su app y quién los renueva? ¿Qué pasaría si estuvieran en AsyncStorage y alguien extrae un backup del teléfono?
> **Respuesta:**
> Los tokens de sesión (`access_token` y `refresh_token`) quedan guardados de forma cifrada mediante **`expo-secure-store`** (que utiliza el *Keychain* en iOS y el *Keystore* en Android con cifrado AES de hardware). La renovación automática periódica del `access_token` es ejecutada en segundo plano por el propio cliente de Supabase (`autoRefreshToken: true`), el cual detecta la proximidad del vencimiento y utiliza el `refresh_token` almacenado para obtener un nuevo par de tokens sin interrumpir al usuario.
> 
> Si estuvieran guardados en `AsyncStorage`, los datos se almacenarían en texto plano en la carpeta de la aplicación dentro del sistema de archivos. Si alguien realiza una copia de seguridad (backup) no cifrada del teléfono mediante herramientas como ADB o un backup de iTunes, o accede a un dispositivo rooteado/jailbroken, podría leer directamente el token JWT y suplantar la identidad del usuario indefinidamente en la API.

### Pregunta 3: ¿Por qué `iniciarSesion` no llama a `setUsuario` ni a `navigate()`? Describan qué ocurre entre que el usuario toca "Ingresar" y aparece la pantalla principal.
> **Respuesta:**
> `iniciarSesion` no llama a `setUsuario` ni a `navigate()` para garantizar una **única fuente de verdad** y evitar estados inconsistentes (error número 2 de la clase). 
> 
> La secuencia exacta es:
> 1. El usuario toca "Ingresar", `useForm` valida con Zod (`loginSchema`), bloquea el botón activando `isSubmitting` ("Ingresando...") y llama a `iniciarSesion(correo, clave)`.
> 2. `auth.js` envía la petición a Supabase Auth. Supabase valida las credenciales y devuelve la sesión con los tokens JWT.
> 3. El SDK de Supabase guarda los tokens en `expo-secure-store` y dispara el evento global `onAuthStateChange`.
> 4. `SesionContext`, que está suscrito a través de `escucharSesion`, recibe el nuevo usuario, actualiza el estado interno de `"sinSesion"` a `"conSesion"`.
> 5. La navegación de Expo Router / React Navigation reacciona de forma declarativa: al cambiar el estado a `"conSesion"`, las pantallas públicas dejan de existir en la jerarquía o se evalúa la redirección a `/(tabs)/inicio`. De esta forma, la misma lógica funciona de forma idéntica para login manual, registro, renovación de sesión, token vencido y arranque de la aplicación.

### Pregunta 4: La clave pública del servicio está en el bundle de la app y cualquiera puede extraerla. ¿Qué impide que alguien la use para leer los datos de otro usuario? ¿Cómo lo comprobaron?
> **Respuesta:**
> Lo que impide el acceso no autorizado es **Row Level Security (RLS)** en el motor de base de datos Postgres de Supabase. La clave `anon` es pública por diseño y únicamente autoriza a realizar peticiones a la API Gateway de Supabase; sin embargo, para acceder a las filas de la tabla `reportes`, Postgres ejecuta las políticas declaradas:
> - `using (auth.uid() = user_id)`
> Esto significa que Postgres descifra e inspecciona la cabecera `Authorization: Bearer <JWT>`, extrae la firma criptográfica y el `sub` (el UUID del usuario autenticado) que emitió el servidor de identidad. Si el UID no coincide con la columna `user_id` de la fila solicitada, Postgres descarta la fila silenciosamente en la consulta.
> 
> **Cómo se comprobó:** Se crearon dos cuentas de prueba distintas (Usuario A y Usuario B). Con el Usuario A se registró un reporte de prueba. Al cerrar sesión e iniciar con el Usuario B, la consulta `getMisReportes()` trajo una lista vacía (o solo sus propios reportes). Postgres nunca entregó las filas del Usuario A al Usuario B, demostrando que la seguridad reside estrictamente en el servidor y no en un filtro de la app móvil.

---

## 5. Resumen de Configuración y Evidencias para la Entrega

### A. Configuración realizada en la consola de Supabase:
1. El equipo creó el proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings > API**, se obtuvieron las claves públicas (`Project URL` y `anon public key`), configuradas en el `.env` local de los integrantes:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. En **Authentication > Providers > Email**, se desactivó la opción **"Confirm email"** para permitir la sesión inmediata tras el registro en las pruebas.
4. En **SQL Editor**, se ejecutó el script DDL y de políticas RLS documentado en [docs/autenticacion.md](autenticacion.md).

### B. Evidencias preparadas para el Sub-Issue:
1. **Captura (a):** Pantalla de Login mostrando el mensaje unificado de credenciales incorrectas ("Correo o contraseña incorrectos").
2. **Captura (b):** Panel de Supabase (**Authentication > Users**) con las cuentas de prueba creadas durante la verificación.
3. **Captura (c):** Panel de Supabase (**Database > Tables > reportes > RLS Policies**) mostrando las dos políticas activas (`cada usuario lee sus reportes` y `cada usuario crea sus reportes`).

### C. Secuencia del video de 45 segundos (Expo Go en móvil):
- [ ] 01. Login con cuenta de prueba registrada.
- [ ] 02. Navegación a *Perfil* > *Mis reportes e incidencias* y visualización de registros con RLS.
- [ ] 03. Cierre completo de la aplicación desde la multitarea del celular.
- [ ] 04. Reapertura de la app: despliegue del splash de UniAccess y restauración automática de sesión sin pedir credenciales.
- [ ] 05. Navegación a *Perfil* y ejecución del cierre de sesión con limpieza de estado en Redux y AsyncStorage.
