# Modificaciones del LAB-06

Proyecto: UniAccess URP
Rama: lab-06

En este laboratorio implementamos la autenticación real en el proyecto usando Supabase Auth y Postgres, reemplazando el login de prueba que teníamos en los laboratorios anteriores. También dejamos la sesión persistente con SecureStore y configuramos un recurso protegido con Row Level Security (RLS).

## Cambios realizados en el código

1. Configuración de Supabase y variables de entorno
- Instalamos las dependencias oficiales: @supabase/supabase-js, expo-secure-store y react-native-url-polyfill.
- Configuramos el archivo .env con las variables públicas EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.
- Agregamos .env al archivo .gitignore para que no se suban credenciales al repositorio y creamos .env.example como plantilla.
- En src/lib/supabase.js inicializamos el cliente con un adaptador que guarda los tokens en SecureStore en teléfonos móviles (y con soporte para navegadores web).

2. Capa de servicio de autenticación (src/services/auth.js)
- Es el único archivo de la app que se conecta con el SDK de Supabase.
- Exporta las funciones principales: registrar, iniciarSesion, cerrarSesion, escucharSesion y mensajeDeAuth.
- Implementamos la función aUsuario para mapear la respuesta de Supabase a los datos que usa la app (id, correo, nombre, código, escuela, ciclo e iniciales).
- Se unificó el mensaje de error para credenciales incorrectas en "Correo o contraseña incorrectos" para no revelar si una cuenta existe o no.

3. Esquemas de validación Zod (src/schemas/authSchema.js)
- Creamos loginSchema con validación de correo y contraseña mínima de 8 caracteres.
- Creamos registroSchema extendiendo el login para validar además el nombre y que ambas contraseñas coincidan.

4. Estado de sesión persistente (src/context/SesionContext.js y src/app/index.js)
- SesionContext ahora maneja tres estados: cargando, sinSesion y conSesion.
- Al abrir la app se suscribe a escucharSesion. Mientras el SDK recupera la sesión desde SecureStore, la pantalla inicial muestra un indicador de carga (splash) para evitar parpadeos. Si hay sesión activa pasa directo a inicio, y si no, va a login.

5. Pantallas de Login y Registro
- src/app/login.js: conectada a React Hook Form y Zod. El botón se bloquea mientras envía y muestra "Ingresando...". Si falla, muestra el error general arriba. Incluye enlace para registrarse.
- src/app/registro.js: pantalla nueva con campos de nombre, correo, contraseña y confirmación. Si el registro es exitoso, entra a la app.

6. Cierre de sesión (src/hooks/useCerrarSesion.js)
- Cierra la sesión en Supabase.
- Limpia el slice de reservas en Redux (reemplazarTodas([])) y borra la persistencia en AsyncStorage.
- Se conectó al botón de cerrar sesión en la pantalla de perfil.

7. Recurso protegido por regla de servidor (RLS)
- En docs/supabase_schema.sql dejamos las sentencias para crear la tabla reportes en Postgres y activar Row Level Security (RLS) con las políticas:
  - cada usuario lee sus reportes: auth.uid() = user_id
  - cada usuario crea sus reportes: auth.uid() = user_id
- En src/services/reportes.js creamos las funciones getMisReportes y crearReporte. La consulta no usa un filtro manual de usuario porque Postgres aplica la regla RLS automáticamente según el token.
- Creamos la pantalla src/app/reportes.js accesible desde Perfil, con sus estados de cargando, error, lista vacía, lista de reportes y modal para crear una nueva incidencia.

8. Pruebas automatizadas
- Creamos tests/lab06.test.cjs para probar los esquemas de validación, el mapeo de usuario, los mensajes de error y la limpieza del store.
- Con npm test pasan las 17 pruebas unitarias sin regresiones.
