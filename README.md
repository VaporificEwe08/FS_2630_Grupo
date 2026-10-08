# EcoBogotá+

## Descripción

EcoBogotá+ es un proyecto de plataforma web para mejorar la comunicación entre la ciudadanía y las entidades encargadas de la recolección de residuos sólidos.

La aplicación prevista permitirá a cualquier ciudadano reportar incidencias relacionadas con basura no recogida, contenedores llenos, escombros y otros problemas mediante fotografías, geolocalización y descripciones.

El objetivo es facilitar el seguimiento de los reportes y proporcionar información útil para optimizar la gestión de residuos en la ciudad.


---

## Equipo del Proyecto
| Nombre        | Rol                   | GitHub / Perfil |
|--------------|-----------------------|-----------------|
| Pablo Alfonso Jimenez Becerra | Scrum Master & Product Owner         | [@PythonK1ller](https://github.com/PythonK1ller) |
| Carlos Ney Bernal | DevOps engineer & Configuration Manager         | [@VaporificEwe08](https://github.com/VaporificEwe08) |
| Lilian Andrea Chaparro Rodriguez | QA lead & Sprint Planner        | [@chaparrorodriguezlilianandrea-ux](https://github.com/chaparrorodriguezlilianandrea-ux) |

---

## Tecnologías Utilizadas
- **Interfaz del MVP:** web en navegador; la tecnología de frontend aún no está elegida.
- **Backend inicial:** Java 17 y Spring Boot.
- **Base de datos propuesta:** PostgreSQL.
- **Tecnologías previstas para fases posteriores:** Python, Pandas, Scikit-learn, Docker y SonarQube.
- **Control de versiones:** Git

Hay una demo estática del frontend y una base ejecutable del backend. La API solo ofrece una comprobación de salud; los reportes de la demo todavía no se comparten ni se guardan en el backend. El [alcance del primer incremento](docs/architecture/mvp.md) separa el MVP de las funciones posteriores.

---

## Estructura del Proyecto
```text
FS_2630_Grupo/
├── .github/
│   ├── ISSUE/
│   ├── PULL_REQUEST.md
│   └── workflows/
├── app/                 # Demo web estática
├── conf/
├── docs/
│   ├── api/
│   ├── architecture/
│   └── user_guide/
├── src/
│   ├── main/
│   └── test/
├── temp/
├── .mvn/
├── mvnw
├── pom.xml
├── README.md
├── CHANGELOG.md
└── BOILERPLATE.md
```
`app/` contiene una demo funcional en el navegador y `src/main/` contiene el inicio del backend Spring Boot. CI ejecuta pruebas del frontend y backend; CD y las plantillas de GitHub siguen vacíos.
---

## Estado de ejecución

Para presentar la demo web, desde la raíz del repositorio ejecuta:

```bash
python3 -m http.server 8000 --directory app
```

Luego abre `http://localhost:8000`. La demo permite crear reportes con un código local, buscarlos por código, ubicación o descripción, filtrarlos por estado y abrir su historial. Al crear uno, puedes añadir latitud y longitud manualmente o pulsar **Usar mi ubicación**; el navegador pedirá permiso solo al pulsar ese botón. Las coordenadas son opcionales en la demo y se muestran en el detalle si se proporcionaron. Se validan los rangos globales de latitud y longitud, pero todavía no se comprueba si el punto pertenece a Bogotá. En el detalle puedes simular los avances `Recibido → En gestión → Resuelto`. Muestra tres casos ficticios iniciales y guarda los reportes y cambios únicamente en el almacenamiento de ese navegador. El código de seguimiento funciona solo dentro de esta demo local: no consulta un servicio compartido. No envía datos a una entidad ni incluye autenticación de operadores. Para reiniciar los casos de ejemplo, borra los datos de este sitio en el navegador.

Para iniciar el backend con Java 17, desde otra terminal en la raíz del repositorio ejecuta:

```bash
./mvnw spring-boot:run
```

La ruta `http://localhost:8080/api/health` responde `{"status":"ok"}` cuando la API está lista. Por ahora la demo web sigue funcionando de forma independiente; aún no existe una API de reportes ni una configuración de Docker.

Para ejecutar las pruebas automáticas necesitas Node.js 24 o superior y Java 17:

```bash
node --check app/app.js
node --test tests/frontend.test.cjs
./mvnw test
```

El flujo de CI ejecuta estas mismas comprobaciones en cada push y solicitud de cambio. El wrapper `mvnw` descarga Maven y las dependencias la primera vez que se utiliza.

---

## Clonar el repositorio
```text
git clone https://github.com/VaporificEwe08/FS_2630_Grupo.git
cd FS_2630_Grupo
```
---
# Problema

Actualmente los canales de reporte presentan limitaciones como:

- Experiencia de usuario poco intuitiva.
- Procesos largos para realizar un reporte.
- Escaso seguimiento del estado de las solicitudes.
- Baja visibilidad de los problemas reportados.

---

# Objetivo General

Desarrollar una plataforma web que permita a los ciudadanos reportar incidencias relacionadas con residuos sólidos mediante geolocalización, fotografías y descripciones, facilitando el seguimiento de los casos y apoyando la toma de decisiones de las entidades responsables.

---

# Objetivos Específicos

- Permitir la creación de reportes georreferenciados.
- Mostrar los reportes en un mapa interactivo.
- Gestionar el estado de cada incidencia.
- Reducir reportes duplicados.
- Generar estadísticas sobre las zonas con mayor número de incidencias.

---

# Funcionalidades previstas

- Registro e inicio de sesión.
- Reporte de incidencias.
- Geolocalización.
- Carga de fotografías.
- Mapa interactivo.
- Historial de reportes.
- Panel administrativo.
- Gestión de estados.
- Notificaciones.

---

## Contexto Académico
- **Asignatura:** Fundamentos de Ingeniería de Software
- **Docente:** Fabrazio Bolaño Lopez
- **Contacto:** fbolanol@javeriana.edu.co

---

## Contacto

**Equipo de desarrollo:**

**Pablo Alfonso Jimenez Becerra**  
Estudiante de Ingeniería en Sistemas, Pontificia Universidad Javeriana    
📧 jimenezb_p@javeriana.edu.co  

**Carlos Ney Bernal**  
Estudiante de Ingeniería en Sistemas, Pontificia Universidad Javeriana  
📧 neycarlos@javeriana.edu.co  

**Lilian Andrea Chaparro Rodriguez**  
Estudiante de Ingeniería en Sistemas, Pontificia Universidad Javeriana  
📧 chaparrorlandrea@javeriana.edu.co 

--- 

## Licencia
Proyecto desarrollado con fines académicos.
