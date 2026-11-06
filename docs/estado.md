# Mapa de estado - UniAccess URP

## Clasificación

| Dato                 | Tipo    | Dónde vive             | Quién lo lee                                   | Quién lo modifica            |
|----------------------|---------|------------------------|------------------------------------------------|------------------------------|
| Texto del buscador   | Local   | `useState` en Explorar | Explorar                                       | Explorar                     |
| Filtro de categoría  | Local   | `useState` en Explorar | Explorar                                       | Explorar, Inicio             |
| Selección de horario | Local   | `useState` en Ambiente | Ambiente                                       | Ambiente                     |
| Usuario logueado     | Context | `SesionContext`        | Perfil, Inicio, Stack raíz                     | Login, Perfil (cerrar sesión)|
| Reservas             | Store   | slice `reservas`       | Inicio, Explorar, Mis Reservas, Perfil, Detalle | Nueva Reserva, Mis Reservas  |

## Forma del store

```json
{
  "reservas": {
    "items": [
      {
        "id": "res-1",
        "codigo": "URP-8F2K4",
        "ambienteId": "grass-1",
        "fecha": "2026-11-07",
        "horas": ["18:00", "19:00"],
        "personas": 14,
        "nombreGrupo": "Selección de Ingeniería",
        "celular": "987654321",
        "tipoActividad": "entrenamiento",
        "observaciones": "Entrenamiento de Ingeniería",
        "estado": "confirmada",
        "monto": 80,
        "creadaEn": "2026-11-06T10:00:00.000Z"
      }
    ]
  }
}
```

## Acciones del slice `reservas`

| Acción            | Payload                                        | Efecto                                                |
|-------------------|------------------------------------------------|-------------------------------------------------------|
| `agregarReserva`  | `{ ambienteId, fecha, horas, personas, ... }` | Agrega al inicio con id, código URP y fecha generados |
| `cambiarEstado`   | `{ id, estado }`                               | Cambia el estado de una reserva                       |
| `cancelarReserva` | `{ id, motivo }`                               | Marca la reserva como cancelada con motivo y fecha    |
| `eliminarReserva` | `id`                                           | Quita la reserva de la lista permanentemente          |
| `reemplazarTodas` | `items[]`                                      | Hidrata el store desde AsyncStorage al iniciar        |

## Selectores

* `selectReservas`: Lista completa de reservas en el store.
* `selectReservaPorId(id)`: Obtiene una reserva específica por su ID.
* `selectReservasActivas`: Filtra las reservas en estado pendiente o confirmada.
* `selectProximaReserva`: La reserva activa más próxima cronológicamente.
* `selectEstadisticas`: Conteo global de activas, historial, canceladas y horas totales.

## Cambios del LAB-05

Los campos de Nueva reserva, Login y Contacto viven en React Hook Form (`useForm`), sin `useState` por campo. Las reglas viven en `src/schemas/` y `handleSubmit` entrega los datos transformados antes de crear una reserva o iniciar sesión.

Nueva reserva agrega `nombreGrupo`, `celular` y `tipoActividad` al payload de `agregarReserva`. El prepare conserva estos campos y la persistencia existente serializa el objeto completo con la misma clave `reservas/v1`. El comprobante muestra esos valores si existen; las reservas antiguas y demo siguen funcionando sin migración.

Contacto no agrega un slice: sus siete campos viven solo en el formulario; se simula un envío de 800 ms, se confirma con Alert y se ejecuta `reset()`. Los datos no se guardan ni se escriben en consola; una API se integrará en una semana posterior. Login usa `SesionContext` y AsyncStorage como antes, evitando agregar la contraseña demo a las nuevas sesiones persistidas.

Se admite hidratar `[]` para conservar la lista vacía después de eliminar todas las reservas. Perfil lee `historial` para el contador de reservas cumplidas.
