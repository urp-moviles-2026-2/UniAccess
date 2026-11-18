# Verificación del LAB-05

Fecha de revisión: 6 de noviembre de 2026.

## Compatibilidad con Expo Go del iPhone

La primera conexión del teléfono mostró Expo Go para SDK 58 y proyecto para SDK 57. Se actualizó el proyecto a **Expo 58.0.23**, **React Native 0.88.1**, **React 19.3.0** y **Expo Router 58.0.30**, junto con los módulos nativos recomendados. Se conserva `web.output: 'single'` para mantener la SPA del proyecto.

Después de actualizar: **20/20 comprobaciones de Expo Doctor aprobadas**, **12/12 pruebas del laboratorio aprobadas** y exportaciones de **iOS, Android y web aprobadas**. La exportación iOS genera bytecode Hermes; no reemplaza la comprobación final en el iPhone. El servidor se reinició con SDK 58 para repetir el escaneo del QR.

La conexión exigió iniciar sesión en Expo CLI y Expo Go con la misma cuenta. Se completó el acceso oficial de Expo en el navegador, se verificó la cuenta mediante `expo whoami` y se reinició el servidor con acceso de red para servir el proyecto autenticado. El usuario confirmó que UniAccess abrió en su iPhone y aportó las evidencias descritas abajo.

## Comprobaciones realizadas en PC

- **12 pruebas automatizadas aprobadas** mediante `npm test` (Node 24): esquemas, todos los obligatorios de Contacto, formatos, transformaciones, aforo y fechas, disponibilidad, `zodResolver` + `handleSubmit` antes del dispatch, reset de ambos formularios, cruce de bloques, límite de tres reservas, acciones Redux y persistencia con un doble de AsyncStorage.
- **Exportación web aprobada**: Metro genera el bundle sin errores.
- **Exportación Android aprobada**: Metro y Hermes generan bytecode. Esta comprobación no es una instalación ni ejecución en teléfono.
- **Prueba manual web** con viewport de 390 × 844: login vacío muestra errores; Enter pasa de código a contraseña; credenciales demo permiten ingresar.
- Perfil muestra el contador de cumplidas y abre Contacto.
- Contacto vacío muestra siete errores; correo inválido y celular corto muestran su mensaje; al corregir se limpian. Se verificaron estrellas y consentimiento. El botón muestra Enviando… y se bloquea durante el envío simulado. Después se limpian todos los campos.
- Nueva reserva vacía muestra errores de grupo, celular y actividad sin crear una reserva; celular de ocho dígitos se rechaza. El salto de foco funciona entre los campos de texto.
- Una reserva válida se envió desde el último campo con Enter, volvió a Ambiente y marcó el bloque como reservado. El comprobante mostró grupo, celular, actividad, observaciones limpias y código QR. Después de recargar se restauró esa misma reserva.
- La sesión de demostración persistió al recargar. No se observaron errores de consola durante el flujo web comprobado.
- `git diff --check` no reportó errores de espacios.

## Evidencias recibidas del iPhone

El usuario proporcionó nueve archivos: dos duplicados exactos y siete capturas únicas. Se conservaron los originales sin modificar en [el índice de evidencias](evidencias/README.md).

- Reserva: selección de bloques, error específico para un celular que empieza con 8 y comprobante confirmado con los nuevos datos del grupo.
- Contacto: errores específicos de correo y celular; datos de prueba con cuatro estrellas y consentimiento; Alert nativo de agradecimiento con los campos restablecidos detrás.
- Biblioteca de componentes del LAB-02, como evidencia complementaria.

## Pendiente en dispositivo y entrega

- Teclado virtual Android/iOS: botones Siguiente/Enviar, desplazamiento con teclado abierto y botón de envío alcanzable.
- Cancelación y cierre de sesión desde el teléfono.
- Capturas de Nueva reserva enviada vacía y Contacto enviado vacío, con todos sus errores obligatorios. Los cuatro casos restantes de la rúbrica ya tienen evidencia del iPhone.
- Confirmar todos los datos y los aportes del equipo; commits reales desde las cuentas de los integrantes.
- Crear y completar el sub-issue bajo #23 cuando exista acceso al repositorio privado del curso.

El resultado actual cubre la implementación, las verificaciones de PC y los casos del iPhone descritos con sus capturas. No se afirma que se hayan realizado las pruebas todavía pendientes ni que el sub-issue de entrega haya sido publicado.
