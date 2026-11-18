# Navegación — UniAccess URP

Expo Router descubre las pantallas en `src/app/`. El Stack raíz conserva Redux, el proveedor de sesión y el área segura.

| Ruta | Entrada | Salida / función |
|---|---|---|
| `/` | Abrir la app | Espera la sesión persistida y deriva a Login o Inicio |
| `/login` | Sin sesión / cerrar sesión | Login validado con Zod → `/inicio`; `reset()` tras ingreso |
| `/inicio` | Tab Inicio | Resumen, deportes y comprobante de próxima reserva |
| `/explorar` | Tab Explorar / búsqueda en Inicio | Catálogo y filtros locales → `/ambiente/[id]` |
| `/ambiente/[id]` | Tarjeta de ambiente | Fecha y horarios → `/reserva/nueva?ambienteId=…&fecha=…&horas=…` |
| `/reserva/nueva` | Continuar con un bloque elegido | Valida selección y datos del grupo; dispatch, `reset()`, `router.back()` y confirmación. El Alert nativo permite abrir el comprobante |
| `/reservas` | Tab Mis reservas | Listado del store → `/reserva/[id]` |
| `/reserva/[id]` | Listado o Alert de nueva reserva | QR, nuevos datos de contacto y actividad, cancelación y eliminación |
| `/perfil` | Tab Perfil | Sesión, estadísticas, preferencias y ayuda |
| `/contacto` | Perfil → Información y ayuda → **Contacto y feedback** | Siete campos validados, simulación de envío, confirmación y `reset()`. Volver regresa a Perfil |
| `/catalogo` | Perfil → Biblioteca de componentes | Componentes del LAB-02 |

Las tabs exigen sesión. Las nuevas pantallas de formulario también comprueban sesión antes de mostrar datos. En Nueva reserva, una selección incompleta ofrece volver a Explorar; una selección vencida o inválida muestra el error y permite volver a elegir horario. En web se usa un diálogo del navegador para las confirmaciones porque React Native Web no implementa `Alert.alert`.

## Teclado

- Login: código → contraseña → enviar.
- Reserva: nombre del grupo → celular → observaciones → enviar.
- Contacto: nombre → correo → celular → mensaje → enviar. Los chips, estrellas y consentimiento se eligen antes de ese último campo.
- `FormScreen` reúne `KeyboardAvoidingView`, área segura y el ScrollView de `ContenedorPantalla`, con `keyboardShouldPersistTaps="handled"`. Login conserva su contenedor equivalente.
- En iOS algunos teclados numéricos no muestran tecla Siguiente: también se puede tocar el campo siguiente o el botón de envío. La disposición con teclado virtual se debe comprobar en el teléfono.
