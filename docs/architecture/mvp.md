# Primer incremento: reportes de residuos

## Propósito

Validar el flujo central de EcoBogotá+: una persona registra una incidencia de residuos en Bogotá y puede consultar su estado desde una aplicación web. El repositorio contiene una demo estática con almacenamiento local, historial y cambios de estado simulados para presentar la interfaz, además de una base Spring Boot con una ruta de salud. El flujo de reportes aún debe implementarse en el backend con persistencia y control de acceso.

## Alcance funcional

1. **Crear un reporte.** El ciudadano indica tipo de incidencia, descripción y ubicación. La fecha, el identificador y el estado inicial se generan en el sistema.
2. **Consultar reportes.** Mostrar una lista y el detalle de cada reporte, con su ubicación y estado actual.
3. **Actualizar el estado.** Un operador cambia el estado de un reporte y registra cuándo ocurrió el cambio.

Tipos iniciales: `BASURA_NO_RECOGIDA`, `CONTENEDOR_LLENO`, `ESCOMBROS` y `OTRO`. Estados iniciales: `RECIBIDO`, `EN_GESTION` y `RESUELTO`. Un reporte nuevo comienza en `RECIBIDO`; el operador puede avanzar a `EN_GESTION` y luego a `RESUELTO`. Las reglas de reapertura quedan para otro incremento.

## Datos mínimos

| Campo | Regla inicial |
| --- | --- |
| Identificador | Único y generado por el sistema |
| Tipo | Uno de los tipos definidos |
| Descripción | Texto obligatorio |
| Ubicación | Latitud y longitud válidas; el mecanismo para limitarla a Bogotá queda por definir |
| Fecha de creación | Generada por el sistema |
| Estado | `RECIBIDO` al crear el reporte |
| Historial de estados | Estado, fecha y operador que hizo cada cambio |

La fotografía, autenticación, mapa, notificaciones, estadísticas, detección de duplicados e IA son objetivos posteriores. Se mantienen en la visión del producto, pero no son requisitos para validar este primer flujo.

## Criterios de aceptación

- Una solicitud válida crea un reporte con identificador, fecha y estado `RECIBIDO`.
- Una solicitud sin tipo, descripción o coordenadas válidas devuelve errores comprensibles y no guarda el reporte.
- La lista permite encontrar el reporte recién creado y el detalle muestra sus datos.
- El operador puede avanzar el estado según el flujo definido; cada cambio aparece en el historial.
- Un cambio de estado inválido se rechaza sin alterar el historial.
- El flujo se puede ejecutar y verificar localmente con instrucciones reproducibles y pruebas automáticas.

## Orden de trabajo propuesto

1. Definir quién operará la gestión de estados y elegir la tecnología del frontend web.
2. Crear el proyecto backend Java 17 / Spring Boot con una prueba de arranque y CI real. **Base completada.**
3. Implementar el modelo, la persistencia y la API del flujo de reportes.
4. Construir la interfaz web del flujo y probarlo de punta a punta.
5. Añadir fotografías, cuentas, mapa y demás objetivos por incrementos.

## Decisiones pendientes

- **Interfaz:** se eligió una aplicación web en navegador para el MVP. Falta escoger su tecnología.
- **Operación:** definir quién puede cambiar estados y cómo se identifica antes de habilitarlo públicamente.
- **Ubicación:** definir el nivel de precisión requerido y la forma de validar que el punto pertenece a Bogotá.
- **Despliegue:** definir el entorno objetivo antes de configurar Docker o CD.
