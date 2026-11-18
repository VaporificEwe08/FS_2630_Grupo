# Registro de cambios

Este archivo registra cambios reales del proyecto. Las funcionalidades futuras están descritas en el [README](README.md) y el [alcance del primer incremento](docs/architecture/mvp.md).

## Sin publicar

- Se añadieron roles administradores para dos cuentas existentes, cambios de estado protegidos en la API y un historial persistente de cada reporte.
- Se añadió la vista **Mis reportes** para consultar todos los reportes de la cuenta autenticada.
- Se conectó la web a PostgreSQL mediante funciones Node.js, con registro, inicio y cierre de sesión y reportes públicos persistentes.
- Se agregó Docker Compose para PostgreSQL local, configuración de Vercel y pruebas de integración en CI.
- Se retiraron los casos ficticios y la simulación local de estados de la interfaz pública.
- Se creó la base del backend Spring Boot con una ruta de salud y una prueba HTTP; CI ahora ejecuta las pruebas Java.
- Se añadió captura opcional de coordenadas manuales o por geolocalización del navegador en la demo.
- Se activó CI para comprobar la sintaxis y probar los flujos de la demo web con Node.js.
- Se añadieron códigos locales de seguimiento y búsqueda por código, ubicación o descripción en la demo.
- Se añadió el detalle de cada reporte, un historial de estados y la simulación local de su avance.
- Se añadió una demo web estática para crear y filtrar reportes locales durante la presentación.
- Se definió el alcance inicial del flujo de reportes y sus criterios de aceptación.
- Se eligió una interfaz web en navegador para el MVP.
- Se corrigió el README para reflejar la estructura y el estado actual del repositorio.
- Se añadió un `.gitignore` para archivos generados y configuraciones locales.

## Inicio del repositorio (agosto de 2026)

- Se creó la documentación inicial y la estructura de directorios del proyecto.
