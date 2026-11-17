# 🧪 LAB-06 - Autenticación en el Proyecto Final con un Servicio de Identidad

> **Semana 12** - IF-1103 Sistemas Móviles y Plataformas Menores

---

## 📋 Información General

| Campo | Detalle |
|-------|---------|
| 🗓️ Semana | 12 - 14/11/2026 |
| ⏱️ Duración estimada | 4 horas |
| 👤 Modalidad | Grupal (equipo del proyecto final), en la rama `lab-06` del repositorio del proyecto |
| ⏳ Fecha límite de entrega | viernes 20/11/2026 - 23:59 |
| 📤 Entrega | Sub-issue en el hilo [#24](https://github.com/urp-moviles-2026-2/.github-private/issues/24) |
| 🏆 Puntaje | 20 pts |

---

## 🎯 Objetivos

Al completar este laboratorio, el equipo podrá:

- [ ] **Elegir un servicio de identidad** para su app y justificar la decisión
- [ ] Configurar el SDK del servicio con **claves públicas en `.env`**, sin secretos en el repositorio
- [ ] Aislar el proveedor en una **capa de servicio** (`src/services/auth.js`) para que las pantallas no lo conozcan
- [ ] Implementar **registro, login y logout** reales con los formularios validados del LAB-05
- [ ] Mantener la **sesión persistente**: al reabrir la app el usuario sigue dentro, con un tercer estado "cargando"
- [ ] **Proteger pantallas** con la navegación condicional del LAB-04
- [ ] Consumir **un recurso protegido**: datos que pertenecen al usuario y que el servidor no entrega a nadie más
- [ ] Trabajar en equipo en el repositorio de su proyecto final, en la rama `lab-06`

---

## 🛠️ Qué vas a construir

La **autenticación de verdad** de su app. Desde el LAB-04 el login acepta cualquier correo y la "sesión" se
pierde al cerrar la app. Al terminar este laboratorio un usuario se registra, inicia sesión contra un
servicio de identidad, cierra la app, la vuelve a abrir y sigue dentro; las pantallas privadas no existen sin
sesión, y al menos una pantalla muestra datos que son solo suyos.

> 💡 **Qué servicio usar.** El que el equipo prefiera: **Firebase Authentication**, **Supabase Auth**,
> **Clerk**, **Auth0**, **AWS Cognito** u otro servicio de identidad con plan gratuito. Todos resuelven por
> ustedes el hashing de contraseñas, los tokens y su renovación. Este enunciado trae el código completo para
> **Supabase** y **Firebase**; si eligen otro, sigan su guía oficial para Expo y cumplan los mismos
> requisitos. Los equipos que ya tienen una **API propia con JWT** pueden usarla, implementando el flujo de
> la clase (SecureStore, interceptor de refresh y `GET /me`).

### Requisitos

| # | Requisito | Detalle |
|---|-----------|---------|
| 1 | **Decisión documentada** en `docs/autenticacion.md` | Servicio elegido y **justificación en tres líneas** (backend que ya tienen, tipo de datos, experiencia del equipo). Tabla de flujos (registro, login, restaurar sesión, logout) y **dónde quedan guardados los tokens** |
| 2 | **Configuración sin secretos** | SDK instalado, proyecto creado en la consola del servicio y claves **públicas** en `.env` con prefijo `EXPO_PUBLIC_`. `.env` en `.gitignore` y un `.env.example` con los nombres de las variables. Ninguna clave secreta (service role, admin SDK, client secret) en la app |
| 3 | **Capa de servicio** `src/services/auth.js` | Es el **único** archivo que importa el SDK de autenticación. Exporta `registrar`, `iniciarSesion`, `cerrarSesion`, `escucharSesion` y `mensajeDeAuth(error)`. Mapea el usuario del proveedor al modelo de la app (`id`, `correo`, `nombre`) |
| 4 | **Login y registro** | Dos pantallas con `useForm` + `zodResolver` y el `FormField` del LAB-05. Registro con confirmar contraseña. Botón deshabilitado mientras `isSubmitting`. **Mensaje único** para credenciales incorrectas ("Correo o contraseña incorrectos"); errores de red con mensaje propio. Enlace entre ambas pantallas |
| 5 | **Sesión persistente** | `SesionContext` con tres estados: `"cargando"`, `"sinSesion"` y `"conSesion"`. Al abrir la app se muestra un splash mientras el SDK restaura la sesión; cerrar y reabrir la app **no** pide login. La renovación del token la hace el SDK |
| 6 | **Pantallas protegidas** | El stack raíz del LAB-04 sigue usando `if`: sin sesión solo existen Login y Registro; con sesión, el resto. Sin `navigate()` manual después del login |
| 7 | **Logout completo** | "Cerrar sesión" en Perfil cierra la sesión en el servicio y **limpia el store, la persistencia y la caché**. Al entrar con otra cuenta no aparece nada del usuario anterior |
| 8 | **Un recurso protegido** | Al menos una pantalla ("Mis reportes", "Mis pedidos", "Mi perfil"...) que pide **datos propios del usuario** al servidor. La protección está en una **regla del servidor** (RLS en Supabase, reglas de seguridad en Firestore, o el token verificado por su API), no solo en un filtro de la app |
| 9 | **Sin regresiones** | Todo lo del LAB-04, el LAB-05 y la actividad de la S11 sigue funcionando: store, formularios, lista con sus tres estados |

> 👥 **Trabajo en equipo:** el laboratorio es grupal. Todo el equipo trabaja en la misma rama `lab-06` del
> repositorio del proyecto final, creada desde `lab-05`. Acuerden **primero** el servicio y escriban
> `docs/autenticacion.md`. Reparto sugerido: una persona la configuración del servicio y `auth.js`, otra las
> pantallas de login y registro, otra el Context, la navegación y el recurso protegido. **Todos los
> integrantes deben aportar commits** a la rama. No se integra a `main` como parte de este laboratorio.
>
> 🔑 Un integrante crea el proyecto en la consola del servicio e invita al resto. Las claves públicas se
> comparten por el canal del equipo y cada quien las pone en su `.env` local.

---

## 🧭 Paso a paso

> 💡 **Cómo leer esta guía:** cada paso explica **qué** hacer y **por qué**. El código largo está plegado:
> hagan clic en la línea que empieza con "Ver código" para desplegarlo. Abran solo el de su servicio
> (Supabase o Firebase).

| Paso | Qué hacen | Archivo principal |
|------|-----------|-------------------|
| 1 | Crear la rama del equipo | - |
| 2 | Elegir el servicio y justificarlo | `docs/autenticacion.md` |
| 3 | Crear el proyecto e instalar el SDK | `src/lib/supabase.js` o `src/lib/firebase.js` |
| 4 | Escribir la capa de servicio | `src/services/auth.js` |
| 5 | Agregar el estado de carga a la sesión | `src/context/SesionContext.js` |
| 6 | Proteger las pantallas y mostrar el splash | `App.js` |
| 7 | Conectar login y registro | `src/screens/LoginScreen.js` y `RegistroScreen.js` |
| 8 | Proteger un recurso en el servidor | `src/services/reportes.js` |
| 9 | Logout que limpia el store | `src/hooks/useCerrarSesion.js` |
| 10 | Probar el flujo completo | - |
| 11 | Subir los cambios a la rama | - |

### Paso 1 - Creen la rama del equipo

Un integrante crea la rama a partir de `lab-05` y la sube:

```bash
git checkout lab-05 && git pull
git checkout -b lab-06
git push -u origin lab-06
```

El resto del equipo se cambia a esa rama:

```bash
git fetch
git checkout lab-06
```

### Paso 2 - Elijan el servicio y documenten la decisión

Usen la tabla del [Bloque 05 de la clase](../README.md#no-construyas-la-autenticación-desde-cero) para
comparar. Escriban `docs/autenticacion.md` antes de programar:

<details>
<summary><b>Ver plantilla de <code>docs/autenticacion.md</code></b></summary>

```markdown
# Autenticación - [Nombre del proyecto]

## Servicio elegido

**Supabase Auth.** Nuestra app necesita una base de datos relacional para los reportes y Supabase nos da
Postgres, API REST y autenticación en el mismo proyecto. Las políticas RLS nos permiten que cada usuario
vea solo sus reportes sin escribir un backend. Dos integrantes ya usaron SQL en otros cursos.

## Flujos

| Flujo | Pantalla | Qué llama | Resultado |
|-------|----------|-----------|-----------|
| Registro | Registro | `registrar({ nombre, correo, clave })` | Crea la cuenta y deja la sesión iniciada |
| Login | Login | `iniciarSesion(correo, clave)` | Sesión iniciada; el stack cambia a Main |
| Restaurar sesión | Splash | `escucharSesion(callback)` al abrir la app | `conSesion` o `sinSesion` |
| Logout | Perfil | `cerrarSesion()` + limpieza del store | Vuelve a Login |

## Dónde se guardan los tokens

Access token y refresh token los guarda el SDK de Supabase en `expo-secure-store` (ver `src/lib/supabase.js`).
La app nunca guarda la contraseña.

## Recurso protegido

Tabla `reportes` con RLS: cada usuario lee y crea solo las filas con su `user_id`. Pantalla: "Mis reportes".
```

</details>

### Paso 3 - Creen el proyecto e instalen el SDK

Sigan **una** de las dos opciones (u otra guía oficial si eligieron otro servicio).

#### Opción A - Supabase

1. Creen un proyecto en [supabase.com](https://supabase.com/dashboard). En **Project Settings > API** copien
   la **Project URL** y la clave pública (**anon** o **publishable**).
2. En **Authentication > Sign In / Providers > Email**, para el laboratorio pueden desactivar
   **Confirm email**. Si la dejan activa, el registro no inicia sesión hasta confirmar el correo y deben
   mostrar el mensaje "Revisa tu correo para confirmar la cuenta".

```bash
npx expo install @supabase/supabase-js expo-secure-store react-native-url-polyfill
```

```bash
# .env  (y .env en .gitignore)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

<details>
<summary><b>Ver código: <code>src/lib/supabase.js</code></b></summary>

```js
// src/lib/supabase.js
import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

const almacenSeguro = {                          // la sesión va a SecureStore, no a AsyncStorage
  getItem: (clave) => SecureStore.getItemAsync(clave),
  setItem: (clave, valor) => SecureStore.setItemAsync(clave, valor),
  removeItem: (clave) => SecureStore.deleteItemAsync(clave),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: almacenSeguro,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

</details>

> ⚠️ SecureStore tiene un límite de 2 KB por valor y la sesión de Supabase (dos tokens más los datos del
> usuario) puede superarlo: verán una advertencia en la consola. Si aparece, usen el adaptador
> `LargeSecureStore` de la [guía de Supabase para Expo](https://supabase.com/docs/guides/auth/quickstarts/react-native):
> cifra la sesión, guarda la clave en SecureStore y el valor cifrado en AsyncStorage. Anoten en
> `docs/autenticacion.md` cuál de los dos usaron.

#### Opción B - Firebase Authentication

1. Creen un proyecto en la [consola de Firebase](https://console.firebase.google.com/), agreguen una
   **app web** (`</>`) y copien el objeto `firebaseConfig`.
2. En **Authentication > Sign-in method** habiliten **Correo electrónico/contraseña**.

```bash
npx expo install firebase @react-native-async-storage/async-storage
```

```bash
# .env  (y .env en .gitignore)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mi-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mi-proyecto
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

<details>
<summary><b>Ver código: <code>src/lib/firebase.js</code></b></summary>

```js
// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

// Sin esta persistencia la sesión solo vive en memoria y se pierde al cerrar la app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

</details>

> ℹ️ El SDK de Firebase para JavaScript funciona en Expo Go y su persistencia documentada en React Native es
> AsyncStorage. En clase vimos que los tokens van mejor en SecureStore: si eligen Firebase, **expliquen esta
> diferencia en `docs/autenticacion.md`** (qué guarda el SDK, dónde y qué riesgo tiene). Como mejora opcional
> pueden pasar a `getReactNativePersistence` un adaptador sobre SecureStore con `getItem`, `setItem` y
> `removeItem`; recuerden que las claves de SecureStore solo aceptan letras, números, `.`, `-` y `_`.

#### Otros servicios

| Servicio | Guía oficial para Expo |
|----------|------------------------|
| Clerk | [clerk.com/docs/quickstarts/expo](https://clerk.com/docs/quickstarts/expo) - guarda los tokens con su `tokenCache` sobre SecureStore |
| Auth0 | [auth0.com/docs/quickstart/native/react-native-expo](https://auth0.com/docs/quickstart/native/react-native-expo) - requiere development build |
| AWS Cognito | [docs.amplify.aws/react-native/build-a-backend/auth](https://docs.amplify.aws/react-native/build-a-backend/auth/) |

> ⚠️ Verifiquen **antes de elegir** que el SDK funcione con su forma de correr la app. Supabase, Firebase
> (SDK JS) y Clerk con correo y contraseña funcionan en Expo Go; otros necesitan un development build.

### Paso 4 - Escriban la capa de servicio

`src/services/auth.js` es el **único** archivo que conoce al proveedor. Las pantallas y el Context importan
estas funciones, nunca el SDK. Si un día cambian de servicio, solo cambia este archivo.

<details>
<summary><b>Ver código: <code>src/services/auth.js</code> - versión Supabase</b></summary>

```js
// src/services/auth.js - versión Supabase
import { supabase } from "../lib/supabase";

// El modelo de usuario de NUESTRA app. La UI nunca ve el objeto del proveedor.
const aUsuario = (u) =>
  u ? { id: u.id, correo: u.email, nombre: u.user_metadata?.nombre ?? u.email.split("@")[0] } : null;

export async function registrar({ nombre, correo, clave }) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: clave,
    options: { data: { nombre } },
  });
  if (error) throw error;
  return aUsuario(data.user);
}

export async function iniciarSesion(correo, clave) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
  if (error) throw error;
  return aUsuario(data.user);
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Avisa la sesión inicial al suscribirse y cada cambio posterior. Devuelve la función para desuscribirse.
export function escucharSesion(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => callback(aUsuario(sesion?.user)));
  return () => data.subscription.unsubscribe();
}

// Token de acceso vigente, para el interceptor de Axios (Paso 8)
export async function obtenerToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function mensajeDeAuth(error) {
  if (error?.code === "invalid_credentials") return "Correo o contraseña incorrectos";
  if (error?.code === "user_already_exists") return "No se pudo crear la cuenta. Si ya tienes una, inicia sesión";
  if (error?.code === "weak_password") return "La contraseña es muy débil";
  if (error?.name === "AuthRetryableFetchError") return "Sin conexión. Revisa tu internet e inténtalo de nuevo";
  return "No pudimos completar la operación. Inténtalo de nuevo";
}
```

</details>

<details>
<summary><b>Ver código: <code>src/services/auth.js</code> - versión Firebase</b></summary>

```js
// src/services/auth.js - versión Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const aUsuario = (u) =>
  u ? { id: u.uid, correo: u.email, nombre: u.displayName ?? u.email.split("@")[0] } : null;

export async function registrar({ nombre, correo, clave }) {
  const { user } = await createUserWithEmailAndPassword(auth, correo, clave);
  await updateProfile(user, { displayName: nombre });
  return aUsuario(user);
}

export async function iniciarSesion(correo, clave) {
  const { user } = await signInWithEmailAndPassword(auth, correo, clave);
  return aUsuario(user);
}

export const cerrarSesion = () => signOut(auth);

export function escucharSesion(callback) {
  return onAuthStateChanged(auth, (u) => callback(aUsuario(u)));   // ya devuelve la función para desuscribirse
}

export const obtenerToken = async () => (auth.currentUser ? auth.currentUser.getIdToken() : null);

export function mensajeDeAuth(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos";
    case "auth/email-already-in-use":
      return "No se pudo crear la cuenta. Si ya tienes una, inicia sesión";
    case "auth/weak-password":
      return "La contraseña es muy débil";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu internet e inténtalo de nuevo";
    default:
      return "No pudimos completar la operación. Inténtalo de nuevo";
  }
}
```

</details>

> 📌 **Un solo mensaje para credenciales incorrectas.** No distingan "el correo no existe" de "la contraseña
> está mal": eso le dice a un atacante qué cuentas existen (enumeración de usuarios).

### Paso 5 - Agreguen el tercer estado al Context de sesión

No creen un Context nuevo: es el `SesionContext` del LAB-04. Ahora el usuario ya no lo pone la pantalla de
login, sino el servicio: el Context **escucha** la sesión y la app reacciona.

<details>
<summary><b>Ver código: <code>src/context/SesionContext.js</code></b></summary>

```jsx
// src/context/SesionContext.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/auth";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState("cargando");     // "cargando" | "sinSesion" | "conSesion"

  useEffect(() => {
    // Al abrir la app el SDK restaura la sesión guardada y avisa aquí
    return authService.escucharSesion((u) => {
      setUsuario(u);
      setEstado(u ? "conSesion" : "sinSesion");
    });
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      estado,
      estaLogueado: estado === "conSesion",
      iniciarSesion: authService.iniciarSesion,
      registrar: authService.registrar,
      cerrarSesion: authService.cerrarSesion,
    }),
    [usuario, estado]
  );

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  return ctx;
}
```

</details>

Fíjense en lo que **no** hay: `iniciarSesion` no llama a `setUsuario`. Cuando el login termina bien, el SDK
emite el cambio de sesión, `escucharSesion` lo recibe y el estado pasa a `"conSesion"`. Una sola fuente de
verdad para login, registro, restaurar sesión, token vencido y logout.

### Paso 6 - Protejan las pantallas y muestren el splash

El `App.js` del LAB-04 ya condiciona el stack raíz con `if`. Solo cambian tres cosas: los hooks leen el
`estado`, se agrega la pantalla de Registro al grupo sin sesión, y mientras el estado es `"cargando"` se
muestra un splash en lugar de la navegación.

<details>
<summary><b>Ver código: <code>App.js</code></b></summary>

```jsx
// App.js
import { View, ActivityIndicator } from "react-native";
// ...imports del LAB-04
import RegistroScreen from "./src/screens/RegistroScreen";

const useEstaLogueado = () => useSesion().estado === "conSesion";
const useNoEstaLogueado = () => useSesion().estado === "sinSesion";

const RootStack = createNativeStackNavigator({
  screens: {
    Main: { if: useEstaLogueado, screen: Tabs, options: { headerShown: false } },
    CrearReporte: { if: useEstaLogueado, screen: CrearReporteScreen, options: { presentation: "modal", title: "Nuevo reporte" } },
    Login: { if: useNoEstaLogueado, screen: LoginScreen, options: { headerShown: false } },
    Registro: { if: useNoEstaLogueado, screen: RegistroScreen, options: { title: "Crear cuenta" } },
  },
});

const Navigation = createStaticNavigation(RootStack);

function Raiz() {
  const { estado } = useSesion();
  if (estado === "cargando") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <Navigation />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SesionProvider>
        <Raiz />
      </SesionProvider>
    </Provider>
  );
}
```

</details>

> ℹ️ Sin el estado `"cargando"` la app abre en Login medio segundo y luego salta a la pantalla principal. Es
> el error número 2 de la clase.
>
> ℹ️ Si su equipo usa **Expo Router**, el equivalente es `Stack.Protected guard={estaLogueado}` en el
> `_layout` raíz (SDK 53+) o un `<Redirect href="/login" />` en el layout de la carpeta protegida.

### Paso 7 - Conecten login y registro

Las pantallas usan el esquema y el `FormField` del LAB-05. Lo nuevo es el `onSubmit`: llama al servicio y, si
falla, pone el mensaje en `root`.

<details>
<summary><b>Ver código: <code>src/schemas/authSchema.js</code></b></summary>

```js
// src/schemas/authSchema.js
import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Ingresa un correo válido"),
  clave: z.string().min(8, "Mínimo 8 caracteres"),
});

export const registroSchema = loginSchema
  .extend({
    nombre: z.string().trim().min(2, "Ingresa tu nombre"),
    confirmarClave: z.string(),
  })
  .refine((d) => d.clave === d.confirmarClave, {
    path: ["confirmarClave"],
    message: "Las contraseñas no coinciden",
  });
```

</details>

<details>
<summary><b>Ver código: <code>src/screens/LoginScreen.js</code></b></summary>

```jsx
// src/screens/LoginScreen.js
import { Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useSesion } from "../context/SesionContext";
import { mensajeDeAuth } from "../services/auth";
import { loginSchema } from "../schemas/authSchema";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";

export default function LoginScreen() {
  const { iniciarSesion } = useSesion();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", clave: "" },
    mode: "onBlur",
  });

  const onSubmit = async ({ correo, clave }) => {
    try {
      await iniciarSesion(correo, clave);     // sin navigate(): el stack cambia solo
    } catch (error) {
      setError("root", { message: mensajeDeAuth(error) });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
      <FormField control={control} name="correo" label="Correo"
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <FormField control={control} name="clave" label="Contraseña"
        secureTextEntry autoCapitalize="none" autoComplete="current-password" />

      {errors.root && <Text style={{ color: "crimson" }}>{errors.root.message}</Text>}

      <PrimaryButton
        title={isSubmitting ? "Ingresando..." : "Ingresar"}
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
      <Text onPress={() => navigation.navigate("Registro")}>¿No tienes cuenta? Regístrate</Text>
    </View>
  );
}
```

</details>

`RegistroScreen` es igual, con `registroSchema`, los campos `nombre` y `confirmarClave`, y
`await registrar({ nombre, correo, clave })` en el `onSubmit`. Usen el color de error de su tema en lugar
de `crimson`.

| Detalle | Por qué |
|---------|---------|
| `secureTextEntry` y `autoCapitalize="none"` | La contraseña no se ve y el teclado no cambia la primera letra |
| `autoComplete="email"` / `"current-password"` / `"new-password"` | El gestor de contraseñas del teléfono ofrece guardar y completar |
| `isSubmitting` en el botón | Evita el doble toque, que en un registro crea dos peticiones |
| Sin `navigate()` tras el login | El estado pasa a `"conSesion"`, el grupo sin sesión desaparece y React Navigation hace la transición |

### Paso 8 - Protejan un recurso con una regla del servidor

Hasta aquí la app sabe **quién** es el usuario. Falta que el **servidor** lo use para decidir qué entrega.
Elijan una entidad de su app que tenga dueño (reportes, pedidos, reservas, favoritos) y hagan que cada
usuario vea solo lo suyo.

#### Con Supabase: Row Level Security

En el **SQL Editor** de Supabase:

<details>
<summary><b>Ver SQL: tabla <code>reportes</code> y políticas RLS</b></summary>

```sql
create table if not exists reportes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id),
  titulo      text not null,
  descripcion text,
  categoria   text,
  creado_en   timestamptz not null default now()
);

alter table reportes enable row level security;

create policy "cada usuario lee sus reportes"
  on reportes for select using (auth.uid() = user_id);

create policy "cada usuario crea sus reportes"
  on reportes for insert with check (auth.uid() = user_id);
```

</details>

<details>
<summary><b>Ver código: <code>src/services/reportes.js</code> - versión Supabase</b></summary>

```js
// src/services/reportes.js
import { supabase } from "../lib/supabase";

const aReporte = (r) => ({ id: r.id, titulo: r.titulo, descripcion: r.descripcion ?? "", categoria: r.categoria ?? "otro" });

export async function getMisReportes() {
  // No hay "where user_id = ...": la política RLS ya filtra por el usuario del token
  const { data, error } = await supabase.from("reportes").select("*").order("creado_en", { ascending: false });
  if (error) throw error;
  return data.map(aReporte);
}

export async function crearReporte(reporte) {
  const { data, error } = await supabase.from("reportes").insert(reporte).select().single();
  if (error) throw error;
  return aReporte(data);
}
```

</details>

#### Con Firebase: reglas de seguridad de Firestore

En **Firestore Database > Reglas**:

<details>
<summary><b>Ver reglas de seguridad de Firestore</b></summary>

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reportes/{id} {
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

</details>

<details>
<summary><b>Ver código: <code>src/services/reportes.js</code> - versión Firebase</b></summary>

```js
// src/services/reportes.js
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { auth } from "../lib/firebase";

const db = getFirestore();

export async function getMisReportes() {
  // La consulta debe pedir solo lo que la regla permite; si no, Firestore la rechaza completa
  const q = query(collection(db, "reportes"), where("userId", "==", auth.currentUser.uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function crearReporte(reporte) {
  const ref = await addDoc(collection(db, "reportes"), { ...reporte, userId: auth.currentUser.uid });
  return { id: ref.id, ...reporte };
}
```

</details>

#### Con una API propia: el token en el interceptor

Si su app consume una API REST propia con la instancia de Axios de la S11, el interceptor de request adjunta
el token del servicio de identidad y la API lo verifica en cada petición:

```js
// src/services/api.js
import { obtenerToken } from "./auth";

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

En los tres casos, la pantalla usa el mismo patrón de la S11: `useFetch(getMisReportes)` (o `useQuery`) con
loading, error, vacío y datos.

> ✅ **La prueba que vale:** creen dos cuentas. Con la cuenta A creen un elemento; entren con la cuenta B y
> verifiquen que **no** aparece. Si aparece, la protección está solo en la app.

### Paso 9 - Logout que limpia todo

Cerrar la sesión en el servicio no basta: el store de Redux, su persistencia en AsyncStorage y la caché de
TanStack Query (si la usan) todavía tienen los datos del usuario anterior.

<details>
<summary><b>Ver código: <code>src/hooks/useCerrarSesion.js</code></b></summary>

```jsx
// src/hooks/useCerrarSesion.js
import { useDispatch } from "react-redux";
import { useSesion } from "../context/SesionContext";
import { reemplazarTodos } from "../store/reportesSlice";

export function useCerrarSesion() {
  const { cerrarSesion } = useSesion();
  const dispatch = useDispatch();

  return async () => {
    await cerrarSesion();              // el SDK borra los tokens y avisa: estado -> "sinSesion"
    dispatch(reemplazarTodos([]));     // vacía el slice; la persistencia del LAB-04 guarda el slice vacío
    // queryClient.clear();            // si usan TanStack Query
  };
}
```

</details>

```jsx
// En la pantalla de Perfil
const { usuario } = useSesion();
const cerrarSesion = useCerrarSesion();

// <Text>{usuario.nombre}</Text> <Text>{usuario.correo}</Text>
// <PrimaryButton title="Cerrar sesión" onPress={cerrarSesion} />
```

Repitan el `dispatch` de limpieza por cada slice que tenga datos del usuario.

### Paso 10 - Prueben el flujo completo

Abran la app en el teléfono y verifiquen:

- [ ] Registrar una cuenta nueva deja al usuario dentro de la app (o muestra "Revisa tu correo" si dejaron la confirmación activa)
- [ ] Registrar un correo que ya existe muestra un mensaje y no rompe la app
- [ ] Login con contraseña incorrecta y login con un correo inexistente muestran **el mismo** mensaje
- [ ] Mientras se envía, el botón dice "Ingresando..." y está deshabilitado
- [ ] Con el Wi-Fi apagado, el login muestra un mensaje de conexión, no un error técnico
- [ ] Después del login la app pasa a la pantalla principal sin `navigate()` y el botón "atrás" no vuelve al login
- [ ] **Cerrar la app por completo y reabrirla** muestra el splash y entra directo, sin pedir login
- [ ] Perfil muestra el nombre y el correo del usuario real
- [ ] La pantalla del recurso protegido muestra solo los datos de la cuenta activa (prueba de las dos cuentas)
- [ ] "Cerrar sesión" vuelve al login; al entrar con la otra cuenta no aparece nada del usuario anterior
- [ ] En el repositorio no hay `.env`, sí hay `.env.example`, y ninguna clave secreta aparece en el código
- [ ] Todo lo del LAB-04, el LAB-05 y la S11 sigue funcionando

### Paso 11 - Suban sus cambios a la rama

```bash
git pull
git add .
git commit -m "LAB-06: servicio de autenticación y sesión persistente"
git push
```

La entrega del equipo es la rama `lab-06` del repositorio del proyecto final. Verifiquen en GitHub que la rama
tiene los commits de todos los integrantes y que `.env` **no** se subió.

### ✅ Reto opcional

Elijan uno, cuando todo lo anterior funcione:

- **Login social:** "Continuar con Google" (y Apple si tienen Mac) con `expo-auth-session` y el método del
  SDK que canjea el id token (`signInWithIdToken` en Supabase, `signInWithCredential` en Firebase)
- **Biometría:** al reabrir la app con sesión guardada, pedir Face ID o huella con
  `expo-local-authentication` antes de mostrar la pantalla principal, con alternativa si el teléfono no la tiene
- **Recuperar contraseña:** enlace "¿Olvidaste tu contraseña?" que envía el correo de recuperación del servicio

---

## 🏆 Entregables

Creen un **sub-issue** en el hilo [#24 - LAB-06 Entrega](https://github.com/urp-moviles-2026-2/.github-private/issues/24): dentro del issue ubiquen la sección `Sub-issues`, hagan clic en el botón `+` que aparece a su derecha y elijan la opción `Create sub-issue`.

**Título:** `LAB-06 - [Nombre del proyecto final]`

Un solo sub-issue por equipo, con los datos de todos los integrantes.

| # | Evidencia | Descripción |
|---|-----------|-------------|
| 1 | Integrantes | Nombre, correo y usuario de GitHub de cada integrante, y qué parte hizo cada uno (servicio y `auth.js`, login y registro, Context, navegación y recurso protegido) |
| 2 | Servicio elegido | Qué servicio de identidad usaron y el enlace a `docs/autenticacion.md` |
| 3 | Repositorio | Enlace a la rama `lab-06` en el repositorio del proyecto final |
| 4 | Video de 45 segundos | Desde el teléfono: login, cerrar la app por completo, reabrirla con la sesión viva, el recurso protegido y logout. Arrastren el video al sub-issue |
| 5 | Capturas | (a) login con credenciales incorrectas y su mensaje, (b) la lista de usuarios en la consola del servicio, (c) la regla del servidor que protege el recurso (política RLS o reglas de Firestore) |
| 6 | Dificultades | Qué problemas encontraron y cómo los resolvieron |

> 💡 Cierren el sub-issue cuando la entrega esté completa. Las dudas van como comentario en el hilo #24, no en su sub-issue.
>
> ⚠️ En las capturas y el video no muestren claves ni contraseñas reales. Usen cuentas de prueba.

---

## ❓ Preguntas de Reflexión _(incluir en el sub-issue del equipo)_

1. ¿Qué servicio de identidad eligieron y qué descartaron? ¿Qué tendrían que cambiar en su código si mañana migran a otro, y qué archivos no se tocarían?
2. ¿Dónde quedan guardados los tokens en su app y quién los renueva? ¿Qué pasaría si estuvieran en AsyncStorage y alguien extrae un backup del teléfono?
3. ¿Por qué `iniciarSesion` no llama a `setUsuario` ni a `navigate()`? Describan qué ocurre entre que el usuario toca "Ingresar" y aparece la pantalla principal.
4. La clave pública del servicio está en el bundle de la app y cualquiera puede extraerla. ¿Qué impide que alguien la use para leer los datos de otro usuario? ¿Cómo lo comprobaron?

---

## 📊 Rúbrica de Evaluación

| Criterio | Puntaje |
|----------|---------|
| `docs/autenticacion.md`: servicio elegido, justificación, flujos y dónde se guardan los tokens | 2 pts |
| Configuración: SDK, claves públicas en `.env` con `EXPO_PUBLIC_`, `.env.example`, ningún secreto en el repositorio | 2 pts |
| `src/services/auth.js` como única capa que conoce al proveedor: `registrar`, `iniciarSesion`, `cerrarSesion`, `escucharSesion`, mapeo del usuario y `mensajeDeAuth` | 3 pts |
| Login y registro con React Hook Form y Zod: mensaje único para credenciales incorrectas, error en `root`, botón deshabilitado mientras envía | 3 pts |
| Sesión persistente: `SesionContext` con tres estados, splash mientras carga y la app reabre sin pedir login | 3 pts |
| Pantallas protegidas con `if` en el stack raíz, sin `navigate()` manual, y logout que limpia store, persistencia y caché | 3 pts |
| Recurso protegido por una regla del servidor, verificado con dos cuentas | 2 pts |
| Rama `lab-06` en el repositorio del proyecto, creada desde `lab-05`, con commits claros de todos los integrantes y sin regresiones | 1 pt |
| Sub-issue completo: integrantes, servicio, enlace a la rama, video, capturas, dificultades y reflexión | 1 pt |
| **Total** | **20 pts** |

---

## 🆘 ¿Necesitas ayuda?

- 💬 Comenta en el hilo [#24](https://github.com/urp-moviles-2026-2/.github-private/issues/24)
- 📧 Escribe a: ronald.requena@urp.edu.pe

**Problemas frecuentes**

| Síntoma | Causa probable |
|---------|----------------|
| `supabaseUrl is required` o `auth/invalid-api-key` | Las variables de `.env` no cargaron: revisen el prefijo `EXPO_PUBLIC_` y reinicien con `npx expo start -c` |
| La app abre en Login y luego salta a la pantalla principal | Falta el estado `"cargando"` o `Raiz` no muestra el splash mientras dura |
| Al reabrir la app siempre pide login | El SDK no tiene dónde persistir la sesión: falta `storage` en `createClient` (Supabase) o `initializeAuth` con `getReactNativePersistence` (Firebase) |
| `Firebase: Error (auth/already-initialized)` | `initializeAuth` se ejecutó dos veces por el recargado en caliente: recarguen la app completa o exporten `auth` desde un solo módulo |
| El registro funciona pero el usuario no entra (Supabase) | "Confirm email" está activo: confirmen desde el correo o desactívenlo para el lab |
| `Email rate limit exceeded` (Supabase) | Demasiados registros seguidos con confirmación por correo: desactiven "Confirm email" o esperen |
| Advertencia `Value being stored in SecureStore is larger than 2048 bytes` | La sesión no cabe en un valor de SecureStore: usen el adaptador `LargeSecureStore` de la guía de Supabase |
| La lista del recurso protegido llega vacía y sin error (Supabase) | RLS está activo y falta la política de `select`, o las filas se crearon sin `user_id` |
| `Missing or insufficient permissions` (Firestore) | La consulta no filtra por `userId`, o el documento se creó sin ese campo |
| `new row violates row-level security policy` | Falta la política de `insert`, o envían un `user_id` distinto al del usuario logueado |
| Después del logout siguen apareciendo datos del usuario anterior | No se vació el slice ni la caché: revisen `useCerrarSesion` |
| `useSesion debe usarse dentro de <SesionProvider>` | `Raiz` o `Navigation` quedaron fuera del `SesionProvider` en `App.js` |
| `Network request failed` solo en el teléfono | El teléfono no tiene internet, o la URL del proyecto en `.env` está mal copiada |
| Se subió el `.env` al repositorio | Agréguenlo a `.gitignore`, `git rm --cached .env` y **regeneren las claves** en la consola del servicio |
| `git push` rechazado | Otro integrante subió cambios antes: `git pull` y vuelvan a intentar |

---

⬅️ [Volver a la Semana 12](../README.md)
