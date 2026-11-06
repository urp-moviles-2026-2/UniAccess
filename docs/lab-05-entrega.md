# LAB-05 — UniAccess URP

Documento de preparación de la entrega. **No representa una entrega cerrada:** faltan los usuarios GitHub de Claudio y Jorge, confirmar aportes individuales, las evidencias del teléfono y publicar el sub-issue.

## Integrantes

| Integrante | Correo | GitHub | Aporte real al LAB-05 |
|---|---|---|---|
| Giussephe Astudillo Navarro | giusephe.an@gmail.com | Dav1d963 | Implementación y revisión asistidas con Codex; confirmar alcance personal |
| Claudio Fernando Quello Yapu | claudioquello5@gmail.com | Pendiente | Pendiente de confirmar |
| Jorge Sebastián Suárez Arango | 202112441@urp.edu.pe | Pendiente | Pendiente de confirmar |

El equipo indica que realizó trabajo interno repartiendo laboratorios anteriores. Se debe describir ese trabajo tal como ocurrió y completar la revisión del LAB-05. No se atribuyen commits a personas que no los hicieron.

Reparto **propuesto** para la revisión final: Giussephe revisa esquemas y `FormField`; Claudio revisa nueva reserva, store y persistencia; Jorge revisa Contacto, navegación y evidencias. Cada uno debe ejecutar su revisión, corregir o documentar hallazgos y aportar desde su cuenta a `lab-05`.

## Repositorio

- Rama: https://github.com/urp-moviles-2026-2/UniAccess/tree/lab-05
- Base: `lab-04`, commit `962a09e` (coincidía con `main` al iniciar).
- Inventario: `docs/formularios.md`.
- Esquemas: `src/schemas/loginSchema.js`, `reservaSchema.js`, `contactoSchema.js`.
- Pantallas: Login, Nueva reserva y Contacto y feedback.
- Navegación: `docs/navegacion.md`.
- Estado: `docs/estado.md`.
- Pruebas: `npm test`, `npm run check:web`, `npm run check:android`, `npm run check:ios`.

## Capturas del teléfono pendientes

Guardar las capturas reales en `docs/evidencias/` y adjuntarlas al sub-issue. Las capturas web de revisión no reemplazan las que pide el profesor desde el teléfono.

| Evidencia | Pasos |
|---|---|
| Reserva vacía | Entrar con la cuenta demo. Inicio → cancha → horario disponible → Continuar. No completar grupo, celular ni actividad; tocar Confirmar. Capturar los tres errores. Fecha y aforo ya tienen selección válida |
| Reserva inválida | Grupo válido, celular `98765432` y actividad elegida. Salir del celular; capturar su mensaje. Corregir a nueve dígitos y comprobar que desaparece |
| Reserva correcta | Completar grupo y celular de prueba válidos. Confirmar, capturar Alert y abrir Mis reservas o Ver comprobante. Capturar grupo, contacto, actividad y código |
| Contacto vacío | Perfil → Contacto y feedback → Enviar mensaje sin llenar nada. Capturar los siete errores; puede requerir dos capturas por el scroll |
| Contacto inválido | Escribir correo `sin-arroba`, salir del campo y capturar su error; probar también celular de ocho dígitos |
| Contacto correcto | Nombre, correo de prueba válido, celular de nueve dígitos que empiece con 9, tipo, estrellas, consentimiento y mensaje de al menos 10 caracteres. Capturar Enviando… y el Alert. Confirmar que queda vacío |
| Sin regresiones | Reabrir la app: conserva sesión y reserva. Cancelar desde el comprobante. Cerrar sesión. Ingresar nuevamente. Verificar lista, detalle y preferencias |

Además comprobar teclado virtual en **ambos formularios**: Siguiente cambia el foco, Enviar envía desde el último texto y el botón se puede alcanzar mediante scroll con el teclado abierto. El botón queda deshabilitado durante `isSubmitting`.

## Dificultades y soluciones

1. `CampoTexto` no reenviaba `ref`, `onBlur` ni props del teclado. Se añadió `forwardRef`, se conservaron los estilos de foco y se conectaron ambas referencias (RHF y la del salto al siguiente input).
2. La validación manual del login y el estado local por campo se trasladaron a esquemas y `useForm`. Se conserva la contraseña demo de siete caracteres; la regla del proyecto sigue siendo mínimo cuatro, documentada explícitamente.
3. El consentimiento de Contacto no mostraba su error con el enum vacío al usar un refine global. Se llevó `refine` al booleano para que todos los obligatorios muestren su mensaje al enviar vacío; hay una prueba que verifica los siete errores.
4. `reValidateMode: 'onChange'` se aplica después del primer envío. Para corregir un error mostrado antes de enviar se llama `trigger(name)` al cambiar un campo que ya tenga error, manteniendo `mode: 'onBlur'`.
5. Los parámetros de navegación podían quedar vencidos o cruzarse con una reserva. El esquema reconsulta el store al confirmar, valida aforo, mantenimiento, fecha, bloques disponibles y límite de reservas activas.
6. Se corrigieron dos fallos previos: el contador de cumplidas de Perfil usaba `finalizadas` en lugar de `historial`; la hidratación descartaba una lista persistida vacía.
7. `Alert.alert` es vacío en React Native Web. Las confirmaciones usan el Alert nativo en teléfono y un diálogo del navegador en web. El envío de Contacto continúa siendo una simulación de 800 ms; no tiene API ni almacena datos.

8. El iPhone tenía Expo Go para SDK 58 y el proyecto usaba SDK 57. Se actualizaron Expo, React Native y sus dependencias a las versiones compatibles con SDK 58; Expo Doctor aprobó 20 comprobaciones y las 12 pruebas del laboratorio siguieron pasando. Después se inició sesión en Expo CLI con la misma cuenta de Expo Go y se reinició el servidor. El usuario confirmó la apertura de UniAccess en su iPhone; faltan las capturas y la revisión detallada de los formularios en el dispositivo.

## Reflexión

Estas respuestas describen la implementación. El equipo debe complementar la pregunta 3 con lo observado en el teléfono antes de entregar.

**1. ¿Qué validaciones eran manuales y cuáles se descubrieron?**

El contexto de sesión revisaba campos vacíos y longitud mínima de contraseña mediante `if`; Nueva reserva enviaba el estado local y confiaba en la selección previa. Ahora el código universitario usa `regex`, la contraseña `min/max`, y la reserva valida grupo, celular, actividad, personas y observaciones. Al hacer el inventario se hicieron explícitos el aforo, las longitudes máximas, los bloques no repetidos, las fechas dentro del selector, los cruces y el límite de tres reservas activas. Contacto agrega email, enum, número entero y consentimiento booleano con refine.

**2. ¿Por qué Controller y no register?**

El TextInput de React Native entrega el texto mediante `onChangeText` y no funciona como un input HTML registrado de forma no controlada. Controller adapta `value`, `onChange`, `onBlur` y `ref`. `FormField` traduce ese contrato al componente del LAB-02, muestra el error y permite que RHF enfoque el primer campo inválido. Los controles no textuales entregan números o booleanos mediante sus eventos específicos.

**3. ¿Qué diferencia hay entre los modos?**

`onChange` valida al escribir, `onBlur` al abandonar el campo y `onSubmit` al intentar enviar. En los tres formularios se eligió `onBlur` para evitar mensajes mientras se empieza a escribir, con revalidación `onChange` tras enviar y `trigger` para limpiar errores ya visibles. La prueba web verificó mensajes y corrección; **pendiente describir la experiencia observada en el teléfono** con su teclado virtual.

**4. ¿Dónde limpiar datos y qué pasa si la API tiene otras reglas?**

El esquema es el límite de entrada del formulario: `trim()` limpia nombre, grupo y mensaje; correo además usa `toLowerCase()`. Se despachan los datos que entrega `handleSubmit`, no valores locales previos. La contraseña no se recorta. La API de la S11 deberá validar y normalizar de nuevo porque el cliente no es una barrera de seguridad. Si sus reglas difieren, se alinean los esquemas con el contrato de la API y sus errores se muestran por campo mediante `setError`. El reducer conserva la estructura serializable del estado y compatibilidad con reservas antiguas.

## Publicar la entrega

Título: **LAB-05 - UniAccess URP**. En el issue padre [#23](https://github.com/urp-moviles-2026-2/.github-private/issues/23), usar Sub-issues → Create sub-issue. Copiar integrantes confirmados, rama, capturas, dificultades y reflexión. Revisar que la rama tenga commits de cada integrante y cerrar solamente cuando esté completo. No integrar en `main` para este laboratorio.

La conexión de GitHub de esta sesión devolvió **404** al leer el issue privado #23. Se necesita acceso a ese repositorio para publicarlo; no se creó un issue suelto como sustituto.
