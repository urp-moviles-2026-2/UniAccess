# Autenticación - UniAccess URP

## Servicio elegido

Elegimos Supabase Auth. Nuestra aplicación necesita una base de datos relacional para guardar las reservas de canchas y los reportes de incidencias del CESPAR, y Supabase nos da Postgres y autenticación en un mismo servicio. Además, con las políticas de Row Level Security (RLS) podemos hacer que cada alumno vea únicamente sus propios reportes sin necesidad de programar un backend completo desde cero. En el grupo ya teníamos experiencia usando SQL y bases de datos relacionales en otros cursos de la universidad.

## Flujos de la app

- Registro (src/app/registro.js): Llama a registrar({ nombre, correo, clave }) en el servicio de autenticación. Crea la cuenta en Supabase y deja la sesión iniciada para que entre directo a la app.
- Login (src/app/login.js): Llama a iniciarSesion(correo, clave). Valida las credenciales con Supabase; al ser correctas, el listener de la sesión actualiza el estado a conSesion y pasa a la pantalla principal.
- Restaurar sesión (src/app/index.js): Al abrir la aplicación, la pantalla de inicio llama a escucharSesion. El SDK de Supabase revisa si hay tokens válidos guardados en SecureStore. Mientras revisa muestra un splash de carga y luego decide si manda a inicio o a login.
- Logout (src/app/(tabs)/perfil.js): Usa el hook useCerrarSesion, que hace signOut en Supabase, vacía el slice de reservas en Redux y borra los datos guardados en AsyncStorage para que no queden datos del alumno anterior.

## Dónde se guardan los tokens

Los tokens de acceso y de renovación (access token y refresh token) se guardan en el celular mediante el módulo expo-secure-store, que está configurado en src/lib/supabase.js.
SecureStore usa el Keychain en iOS y el Keystore en Android, por lo que quedan protegidos con cifrado del sistema operativo y no en texto plano. La aplicación nunca guarda la contraseña del alumno. La renovación del token cuando expira la hace el mismo SDK en segundo plano.

## Recurso protegido

- Tabla: reportes en la base de datos Postgres de Supabase.
- Regla de protección: Row Level Security (RLS) activado en la tabla.
- Políticas creadas:
  - Para leer (select): auth.uid() = user_id
  - Para insertar (insert): auth.uid() = user_id
- Pantalla donde se usa: "Mis reportes e incidencias" (src/app/reportes.js), a la que se entra desde la sección Perfil.
