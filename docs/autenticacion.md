# Autenticación — UniAccess URP

## Servicio elegido

**Supabase Auth.** Nuestra aplicación necesita una base de datos relacional para gestionar reservas e incidencias de las áreas deportivas del CESPAR, y Supabase nos provee Postgres, API REST y autenticación en una plataforma unificada. Las políticas de Row Level Security (RLS) permiten que cada estudiante lea y cree únicamente sus propios registros directamente desde la app móvil sin requerir un backend intermediario. El equipo cuenta con experiencia previa en SQL y diseño relacional en cursos de la carrera.

---

## Flujos de Autenticación

| Flujo | Pantalla | Qué llama | Resultado |
|---|---|---|---|
| **Registro** | `src/app/registro.js` | `registrar({ nombre, correo, clave })` | Crea la cuenta en Supabase Auth, persiste la sesión y pasa el estado a `conSesion`. |
| **Login** | `src/app/login.js` | `iniciarSesion(correo, clave)` | Autentica contra Supabase; el listener actualiza `SesionContext` a `conSesion` y redirige a la navegación principal. |
| **Restaurar sesión** | `src/app/index.js` (Splash) | `escucharSesion(callback)` al montar la app | El SDK recupera los tokens de `expo-secure-store`; el estado pasa de `"cargando"` a `"conSesion"` o `"sinSesion"`. |
| **Logout** | `src/app/(tabs)/perfil.js` | `useCerrarSesion()` | Cierra sesión en Supabase (`signOut`), vacía el slice de reservas en Redux (`reemplazarTodas([])`) y elimina la persistencia en `AsyncStorage`. Vuelve a `/login`. |

---

## Dónde se guardan los tokens

- Los tokens de sesión (**Access Token** y **Refresh Token**) son almacenados de forma cifrada mediante el SDK de Supabase a través del módulo nativo **`expo-secure-store`** (implementado en `src/lib/supabase.js`).
- A diferencia de `AsyncStorage`, `SecureStore` aprovecha el **Keystore** (Android) y **Keychain** (iOS), protegiendo los tokens contra accesos no autorizados o extracción de copias de seguridad del sistema de archivos.
- La aplicación **nunca almacena contraseñas** del usuario.
- La renovación de tokens por expiración es controlada de forma transparente por el cliente de Supabase (`autoRefreshToken: true`).

---

## Recurso protegido por regla del servidor

- **Tabla:** `reportes` en Postgres (Supabase).
- **Mecanismo de seguridad:** **Row Level Security (RLS)** habilitado a nivel de motor de base de datos.
- **Políticas aplicadas:**
  - `SELECT`: `using (auth.uid() = user_id)` — el motor rechaza cualquier fila perteneciente a otro UID, impidiendo el acceso incluso si un usuario malicioso manipula las peticiones en el cliente.
  - `INSERT`: `with check (auth.uid() = user_id)` — garantiza que las nuevas filas queden estrictamente asociadas al identificador del usuario que envió el token JWT.
- **Pantalla:** *Mis reportes e incidencias* (`src/app/reportes.js`), accesible desde la sección *Perfil*.
