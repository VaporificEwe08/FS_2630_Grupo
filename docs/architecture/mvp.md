# Primer incremento: reportes de residuos

## Propósito

Validar el flujo central de EcoBogotá+: una persona registra una incidencia de residuos en Bogotá y puede consultar su estado desde una aplicación web. La versión actual usa funciones Node.js y PostgreSQL para cuentas y reportes compartidos; la base Spring Boot se conserva de forma independiente. La actualización de estados por operadores sigue pendiente.

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
| Ubicación | Texto obligatorio; latitud y longitud opcionales y válidas si se incluyen. Limitarla a Bogotá queda por definir |
| Fecha de creación | Generada por el sistema |
| Estado | `RECIBIDO` al crear el reporte |
| Historial de estados | Estado, fecha y operador que hizo cada cambio |

La autenticación básica ya está implementada. Fotografía, mapa, notificaciones, estadísticas, detección de duplicados e IA siguen como objetivos posteriores.

## Criterios de aceptación

- Una solicitud válida crea un reporte con identificador, fecha y estado `RECIBIDO`.
- Una solicitud sin tipo, ubicación o descripción, o con coordenadas inválidas, devuelve errores comprensibles y no guarda el reporte.
- La lista permite encontrar el reporte recién creado y el detalle muestra sus datos.
- La gestión de estados por operador requiere una fase posterior y un mecanismo de autorización.
- El flujo se puede ejecutar y verificar localmente con instrucciones reproducibles y pruebas automáticas.

## Orden de trabajo propuesto

1. Definir quién operará la gestión de estados y elegir la tecnología del frontend web. **Interfaz web elegida; operador pendiente.**
2. Crear el proyecto backend Java 17 / Spring Boot con una prueba de arranque y CI real. **Base completada.**
3. Implementar el modelo, la persistencia y la API del flujo de reportes. **Cuentas, creación y lectura completadas en Node.js/PostgreSQL.**
4. Construir la interfaz web del flujo y probarlo de punta a punta. **Completado para registro y publicación.**
5. Añadir fotografías, gestión de estados, mapa y demás objetivos por incrementos.

## Decisiones pendientes

- **Interfaz:** se eligió una aplicación web en navegador para el MVP. Falta escoger su tecnología.
- **Operación:** definir quién puede cambiar estados y cómo se identifica antes de habilitarlo públicamente.
- **Ubicación:** definir el nivel de precisión requerido y la forma de validar que el punto pertenece a Bogotá.
- **Despliegue:** Vercel para la web y las funciones Node.js; PostgreSQL administrado para producción y Docker Compose para desarrollo local. La conexión de producción se configura con `DATABASE_URL`.
