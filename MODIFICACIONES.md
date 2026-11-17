# Modificaciones Realizadas — LAB-06 (Autenticación y RLS)
**Proyecto:** UniAccess URP — Sistema de Reserva de Áreas Deportivas CESPAR  
**Rama:** `lab-06` (creada a partir de `lab-05`)

---

## 📌 Resumen General de Cambios

En este laboratorio se reemplazó el sistema de login simulado de versiones anteriores por un **sistema de autenticación robusto y persistente** conectado a **Supabase Auth** y una base de datos relacional **PostgreSQL**, incorporando seguridad por **Row Level Security (RLS)** y almacenamiento cifrado de tokens en dispositivos móviles.

---

## 1. Configuración del Servicio y Seguridad
- **SDK Oficial:** Se instalaron `@supabase/supabase-js`, `expo-secure-store` y `react-native-url-polyfill`.
- **Protección de Secretos:** 
  - Se configuró `.gitignore` para excluir estrictamente `.env`.
  - Se creó `.env.example` con los nombres de variables públicas requeridas (`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
  - No se expone ninguna clave secreta de administración (`service_role`).
- **Almacenamiento Adaptativo (`src/lib/supabase.js`):**
  - En móviles (iOS/Android) almacena la sesión en hardware seguro mediante `expo-secure-store` (Keychain/Keystore).
  - En entorno web de desarrollo conmuta a `AsyncStorage` para compatibilidad en navegadores.

---

## 2. Capa de Servicios Aislada
- **`src/services/auth.js`:**
  - Único punto de contacto con el SDK de Supabase. Las vistas nunca interactúan directamente con el cliente del proveedor.
  - Métodos exportados: `registrar`, `iniciarSesion`, `cerrarSesion`, `escucharSesion`, `obtenerToken` y `mensajeDeAuth`.
  - Mapeo `aUsuario`: normaliza el usuario de Supabase al modelo interno de UniAccess (`id`, `correo`, `nombre`, `codigo`, `escuela`, `ciclo`, `iniciales`).
  - `mensajeDeAuth`: unifica las credenciales erróneas en el mensaje `"Correo o contraseña incorrectos"` para prevenir la enumeración de cuentas.

---

## 3. Sesión Persistente y Tres Estados
- **`src/context/SesionContext.js`:**
  - Implementa los tres estados oficiales: `"cargando"`, `"sinSesion"` y `"conSesion"`.
  - Escucha reactivamente los eventos de sesión (`onAuthStateChange`) para mantener una única fuente de verdad.
- **Splash Screen (`src/app/index.js`):**
  - Muestra la pantalla de bienvenida y spinner mientras el SDK restaura la sesión persistida en SecureStore, evitando parpadeos al iniciar la app.
- **Logout Completo (`src/hooks/useCerrarSesion.js`):**
  - Cierra la sesión en Supabase.
  - Vacía el store de Redux (`reemplazarTodas([])`).
  - Limpia la persistencia en `AsyncStorage`.

---

## 4. Pantallas y Formularios Validados
- **`src/schemas/authSchema.js`:**
  - `loginSchema`: validación estricta de correo institucional y contraseña mínima de 8 caracteres.
  - `registroSchema`: añade validación de nombre y confirmación exacta de contraseña.
- **`src/app/login.js`:**
  - Formulario migrado a React Hook Form + ZodResolver con campos para correo y contraseña.
  - Botón bloqueado con indicador visual durante el envío (`isSubmitting`).
  - Enlace directo a la pantalla de registro.
- **`src/app/registro.js`:**
  - Nueva pantalla de registro para estudiantes con validación en tiempo real.
- **`src/app/(tabs)/perfil.js`:**
  - Muestra datos dinámicos del estudiante autenticado y acceso al recurso protegido.

---

## 5. Recurso Protegido en el Servidor (PostgreSQL con RLS)
- **`docs/supabase_schema.sql`:**
  - DDL de la tabla `reportes` (incidencias de canchas deportivas) con políticas RLS activadas:
    - `SELECT`: `using (auth.uid() = user_id)`
    - `INSERT`: `with check (auth.uid() = user_id)`
- **`src/services/reportes.js`:**
  - Consumo directo de la tabla protegida sin necesidad de filtrado manual en el cliente.
- **`src/app/reportes.js`:**
  - Pantalla con los 4 estados de UI (cargando, error, vacío y lista) y modal para registrar nuevas incidencias.

---

## 6. Documentación y Pruebas Unitarias
- **`docs/autenticacion.md`:** Decisión técnica, flujos, seguridad de tokens y especificación del recurso protegido.
- **`docs/lab-06-entrega.md`:** Documento consolidado con respuestas a las 4 preguntas de reflexión y guía de evidencias.
- **`tests/lab06.test.cjs`:** 5 nuevas pruebas automatizadas que verifican esquemas de autenticación, mapeo de usuario, mensajes de seguridad y limpieza del store en logout.
- **Total de pruebas:** **17 pruebas pasando** (12 de regresión del LAB-05 + 5 del LAB-06).
