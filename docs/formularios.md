# Inventario de formularios — UniAccess URP

Inventario definido antes de implementar los formularios del LAB-05. Los mensajes de esta tabla corresponden a los esquemas de `src/schemas/`.

| Formulario / pantalla | Campo | Regla | Mensaje de error | Destino |
|---|---|---|---|---|
| Nueva reserva `/reserva/nueva` | ambienteId | Ambiente existente y habilitado | Elige un ambiente disponible | slice `reservas` |
| Nueva reserva | fecha | Fecha real, desde hoy hasta 13 días después | Elige una fecha dentro de los próximos 14 días | slice `reservas` |
| Nueva reserva | horas | 1 a 4 bloques distintos del catálogo, futuros, disponibles y sin cruce con reservas propias | Elige entre 1 y 4 bloques / El horario ya no está disponible; vuelve a elegir | slice `reservas` |
| Nueva reserva | nombreGrupo | Texto limpio, de 5 a 60 caracteres | El nombre del grupo debe tener al menos 5 caracteres / Máximo 60 caracteres | slice `reservas` |
| Nueva reserva | celular | Texto de 9 dígitos, empieza con 9 | El celular debe tener 9 dígitos y empezar con 9 | slice `reservas` |
| Nueva reserva | tipoActividad | entrenamiento, campeonato o recreacion | Elige el tipo de actividad | slice `reservas` |
| Nueva reserva | personas | Número entero entre 1 y el aforo | Indica al menos una persona / No superes el aforo de {capacidad} personas | slice `reservas` |
| Nueva reserva | observaciones | Opcional, texto limpio de hasta 180 caracteres | Máximo 180 caracteres | slice `reservas` |
| Nueva reserva | límite global | Menos de 3 reservas activas, comprobado también al enviar desde el teclado | Ya tienes 3 reservas activas; cancela una para continuar | Error del formulario; no despacha |
| Login `/login` | codigo | Texto limpio de 4 a 12 dígitos | El código debe tener entre 4 y 12 dígitos | `SesionContext` |
| Login | contrasena | Entre 4 y 72 caracteres; no se recorta ni transforma | Mínimo 4 caracteres / Máximo 72 caracteres | `SesionContext`, validación local de demostración |
| Contacto `/contacto` | nombre | Texto limpio de 3 a 80 caracteres | Escribe tu nombre completo (mínimo 3 caracteres) / Máximo 80 caracteres | Envío simulado, confirmación con `Alert` |
| Contacto | correo | Correo válido, limpio y en minúsculas, máximo 120 | Ingresa un correo válido / Máximo 120 caracteres | Envío simulado; API futura |
| Contacto | celular | Texto de 9 dígitos, empieza con 9 | El celular debe tener 9 dígitos y empezar con 9 | Envío simulado; API futura |
| Contacto | tipo | sugerencia, error o consulta | Elige el tipo de mensaje | Envío simulado; API futura |
| Contacto | calificacion | Número entero entre 1 y 5 | Elige una calificación de 1 a 5 estrellas | Envío simulado; API futura |
| Contacto | mensaje | Texto limpio de 10 a 500 caracteres | Cuéntanos un poco más (mínimo 10 caracteres) / Máximo 500 caracteres | Envío simulado; API futura |
| Contacto | aceptaTerminos | Booleano verdadero mediante `refine` | Debes aceptar el uso de tus datos para responderte | Solo consentimiento del envío simulado |
| Explorar `/explorar` | búsqueda, categoría | Filtros locales opcionales; no crean ni envían datos | No aplica | Estado local, filtra catálogo |
| Ambiente `/ambiente/[id]` | fecha, bloques | Preselección de fecha y hasta 4 bloques; el esquema de reserva los revalida al confirmar | Errores visibles en Nueva reserva | Parámetros de navegación a Nueva reserva |
| Perfil `/perfil` | notificaciones, recordatorios | Preferencias booleanas locales del LAB-04 | No aplica | Estado local de demostración |

## Formularios implementados en este lab

1. **Nueva reserva** (entidad principal): React Hook Form y Zod, cinco campos editables más la selección previa. Solo `handleSubmit` despacha datos válidos; `reset()` antes de `router.back()` y confirmación con acceso al comprobante.
2. **Contacto y feedback**: siete campos, accesible desde Perfil, envío simulado de 800 ms, confirmación y `reset()`.
3. **Login**: migrado también para quitar el estado por campo y centralizar sus reglas, conservando la cuenta de demostración del LAB-04. No constituye el segundo formulario de cinco campos.

`FormField` es el único enlace de los campos de texto con `Controller` y reutiliza `CampoTexto` del LAB-02. `FormControl` enlaza controles no textuales (chips, cantidad, estrellas y consentimiento) mediante `Controller`. No hay contraseñas ni datos de contacto escritos en consola. Contacto no transmite ni persiste datos todavía.

Todos usan `mode: 'onBlur'` y `reValidateMode: 'onChange'`. Un campo que ya muestra error se revalida además al cambiar con `trigger(name)`; esto permite corregirlo sin esperar otro blur, incluso antes del primer envío. Referencias combinadas conservan tanto el salto de teclado como el foco automático del primer campo erróneo.
