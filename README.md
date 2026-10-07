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
- **Backend propuesto:** Java 17 y Spring Boot.
- **Base de datos propuesta:** PostgreSQL.
- **Tecnologías previstas para fases posteriores:** Python, Pandas, Scikit-learn, Docker y SonarQube.
- **Control de versiones:** Git

Estas tecnologías describen la dirección prevista. Hay una demo estática del frontend, pero todavía no hay backend ni persistencia compartida. El [alcance del primer incremento](docs/architecture/mvp.md) separa el MVP de las funciones posteriores.

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
├── README.md
├── CHANGELOG.md
└── BOILERPLATE.md
```
`app/` contiene una demo funcional en el navegador. `src/main/` todavía no tiene backend. Los archivos de CI/CD y las plantillas de GitHub están vacíos.
---

## Estado de ejecución

Para presentar la demo web, desde la raíz del repositorio ejecuta:

```bash
python3 -m http.server 8000 --directory app
```

Luego abre `http://localhost:8000`. La demo permite crear reportes y filtrarlos por estado. Muestra tres casos ficticios iniciales y guarda los reportes nuevos únicamente en el almacenamiento de ese navegador. No envía datos a una entidad ni modifica estados. Para reiniciar los casos de ejemplo, borra los datos de este sitio en el navegador.

Todavía no existe un backend, un proyecto compilable ni una configuración de Docker.

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
