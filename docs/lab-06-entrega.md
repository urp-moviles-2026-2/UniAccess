# LAB-06 - UniAccess URP
Entrega de Autenticación en el Proyecto Final con Servicio de Identidad

Documento preparado para el sub-issue de entrega en el hilo #24 del repositorio del curso.

## 1. Integrantes del grupo y aportes

- Claudio Fernando Quello Yapu
  - Correo: claudioquello5@gmail.com
  - Usuario GitHub: ClaudioURP
  - Aporte: Configuración del proyecto en Supabase, cliente src/lib/supabase.js, funciones de src/services/auth.js y hook de cierre de sesión useCerrarSesion.js.

- Giussephe Astudillo Navarro
  - Correo: giusephe.an@gmail.com
  - Usuario GitHub: Dav1d963
  - Aporte: Implementación de las pantallas de Login y Registro con React Hook Form, y los esquemas de validación Zod en authSchema.js.

- Jorge Sebastián Suárez Arango
  - Correo: 202112441@urp.edu.pe
  - Usuario GitHub: sebastia16
  - Aporte: Integración de los 3 estados en SesionContext, pantalla splash de carga y la pantalla del recurso protegido con RLS (src/app/reportes.js).

## 2. Servicio elegido

Elegimos Supabase Auth.
- La justificación técnica y el detalle de flujos están en docs/autenticacion.md.
- Las sentencias SQL para crear la tabla y las políticas RLS están en docs/supabase_schema.sql.

## 3. Repositorio

- Rama de trabajo: lab-06
- Enlace al repositorio: https://github.com/urp-moviles-2026-2/UniAccess/tree/lab-06
- Rama base desde donde se creó: lab-05

## 4. Preguntas de reflexión

### Pregunta 1: ¿Qué servicio de identidad eligieron y qué descartaron? ¿Qué tendrían que cambiar en su código si mañana migran a otro, y qué archivos no se tocarían?

Elegimos Supabase Auth porque para nuestro proyecto de reservas del CESPAR necesitábamos una base de datos relacional (Postgres) para guardar las canchas, los reportes y las reservas. Supabase ya nos da la base de datos, la autenticación y las políticas RLS todo junto en un solo lugar.
Descartamos Firebase porque es NoSQL y para reservas con horarios nos convenía más un modelo relacional en tablas SQL. También descartamos Clerk y Auth0 porque pedían configuraciones más complicadas o development builds en Expo.

Si mañana quisiéramos cambiar de servicio (por ejemplo a Firebase o una API propia):
- Solo tendríamos que modificar src/lib/supabase.js (para cambiar el cliente) y src/services/auth.js (para adaptar las funciones registrar, iniciarSesion, cerrarSesion y escucharSesion).
- No tendríamos que tocar ninguna de las pantallas (ni login, ni registro, ni perfil), ni los componentes, ni los esquemas de Zod, ni SesionContext, porque la capa de servicios aísla toda la lógica y la app no sabe qué servicio se usa por debajo.

### Pregunta 2: ¿Dónde quedan guardados los tokens en su app y quién los renueva? ¿Qué pasaría si estuvieran en AsyncStorage y alguien extrae un backup del teléfono?

Los tokens (access token y refresh token) se guardan en el celular usando expo-secure-store, que usa el Keystore en Android y el Keychain en iOS con cifrado de hardware. La renovación del access token la hace automáticamente el SDK de Supabase en segundo plano cada vez que está por vencer, usando el refresh token sin que el usuario tenga que hacer nada.

Si los guardáramos en AsyncStorage, los tokens quedarían en texto plano dentro del almacenamiento del teléfono. Si alguien le saca un backup al celular o si el celular está rooteado, podrían copiar el token y entrar a la cuenta del alumno sin saber su contraseña.

### Pregunta 3: ¿Por qué iniciarSesion no llama a setUsuario ni a navigate()? Describan qué ocurre entre que el usuario toca "Ingresar" y aparece la pantalla principal.

No llama a setUsuario ni a navigate() directamente para que el estado de la sesión tenga una sola fuente de verdad y no dependa de cada pantalla.

El flujo que ocurre es:
1. El usuario presiona el botón "Ingresar".
2. React Hook Form y Zod validan que el correo y la contraseña tengan el formato correcto, deshabilitan el botón y muestran "Ingresando...".
3. Se llama a iniciarSesion en auth.js, que manda los datos a Supabase.
4. Supabase valida la cuenta y devuelve los tokens, guardándolos en SecureStore.
5. El SDK de Supabase dispara el evento onAuthStateChange.
6. Como SesionContext está escuchando ese evento con escucharSesion, recibe el usuario y cambia el estado a "conSesion".
7. La navegación de Expo Router detecta automáticamente el cambio de estado y muestra la pantalla principal (/inicio), sin necesidad de hacer un navigate() a mano.

### Pregunta 4: La clave pública del servicio está en el bundle de la app y cualquiera puede extraerla. ¿Qué impide que alguien la use para leer los datos de otro usuario? ¿Cómo lo comprobaron?

Lo que impide que alguien lea datos de otros es el Row Level Security (RLS) configurado directamente en la base de datos Postgres de Supabase.
La clave anon que está en el .env es pública, pero cuando alguien hace una consulta a la tabla reportes, la base de datos revisa el token JWT del usuario que hace la petición. La política dice:
auth.uid() = user_id
Esto significa que Postgres solo devuelve las filas donde el user_id coincide exactamente con el ID del usuario que inició sesión. Si alguien intenta consultar los reportes de otro alumno, la base de datos simplemente le devuelve una lista vacía.

Lo comprobamos creando dos cuentas de prueba distintas: creamos un reporte con la primera cuenta, cerramos sesión, entramos con la segunda cuenta y verificamos que el reporte anterior no aparecía en la lista.

## 5. Evidencias para adjuntar en la entrega

- Video de 45 segundos: grabado desde el celular mostrando login, cerrar la app completamente, reabrirla mostrando que la sesión sigue viva, pantalla de reportes con RLS y el cierre de sesión.
- Captura de login con error: pantalla mostrando el mensaje "Correo o contraseña incorrectos" al poner datos falsos.
- Captura de consola de Supabase (usuarios): vista de Authentication > Users con los usuarios creados de prueba.
- Captura de consola de Supabase (reglas RLS): vista de Database > Tables > reportes mostrando las políticas de lectura e inserción.
