# EcoBogotá+

## Descripción

EcoAlerta Bogotá es una plataforma web diseñada para mejorar la comunicación entre la ciudadanía y las entidades encargadas de la recolección de residuos sólidos.

La aplicación permite a cualquier ciudadano reportar de manera rápida incidencias relacionadas con basura no recogida, contenedores llenos, escombros y otros problemas mediante fotografías, geolocalización y descripciones.

El objetivo es facilitar el seguimiento de los reportes y proporcionar información útil para optimizar la gestión de residuos en la ciudad.


---

## Equipo del Proyecto
| Nombre        | Rol                   | GitHub / Perfil |
|--------------|-----------------------|-----------------|
| Pablo Alfonso Jimenez Becerra | Scrum Master & Product Owner         | [@PythonK1ller](https://github.com/PythonK1ller) |
| Carlos Ney Bernal | DevOps engineer & Configuration Manager         | [@VaporificEwe08](https://github.com/VaporificEwe08) |
| Lilian Andrea Chaparro Rodriguez | QA lead & Sprint Planner        | github.com/usuario3 |

---

## Tecnologías Utilizadas
- **Frontend:** JavaFX
- **Backend:** Java – Spring Boot
- **Base de Datos:** PostgreSQL
- **IA / Data Science:** Python, Pandas, Scikit-learn
- **DevOps:** GitHub Actions, Docker, SonarQube
- **Control de versiones:** Git

---

## Estructura del Proyecto
```text
project-name/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── conf/
│   ├── config.yaml
│   └── settings.json
├── docs/
│   ├── api/
│   ├── architecture/
│   └── user_guide/
├── jupyter/
│   ├── notebooks/
│   │   ├── exploration.ipynb
│   │   └── analysis.ipynb
│   └── datasets/
│       ├── data1.csv
│       └── data2.csv
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── test.sh
├── src/
│   ├── main/
│   │   ├── java/ (o python/, etc. según el lenguaje)
│   │   └── resources/
│   ├── test/
│   │   ├── java/ (o python/, etc. según el lenguaje)
│   │   └── resources/
├── temp/
│   ├── temp_file.txt
│   └── temp_data/
│       ├── temp1.tmp
│       └── temp2.tmp
├── .gitignore
├── README.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── Dockerfile
├── docker-compose.yml
└── Makefile
```
---

## Instalación y Ejecución
**Requisitos**
- Docker y Docker Compose
- Git
- Java 17+
- Python 3.10+

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

# Características

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

## Ejecución con Docker
```text
docker-compose up --build
```

## Ejecución de pruebas
```text
docker-compose run backend mvn test
docker-compose run ai-model pytest
```

---

## Contexto Académico
- **Asignatura:** Fundamentos de Ingeniería de Software
- **Docente:** Fabrazio Bolaño Lopez
- **Contacto:** fbolanol@javeriana.edu.co

---

## Contacto

**Equipo de desarrollo:**

**Pablo Alfonso Jimenez Becerra**  
Estudiante de Ingenieria de Sistemas, Pontificia Universidad Javeriana  
📧 jimenezb_p@javeriana.edu.co  

**Carlos Ney Bernal**  
Estudiante de Ingeniería en Sistemas, Pontificia Universidad Javeriana  
📧 neycarlos@javeriana.edu.co  

**Lilian Andrea Chaparro Rodriguez**
Estudiante de Ingenieria en Sistemas, Pontifia Universidad Javeriana
📧 chaparrorlandrea@javeriana.edu.co
--- 

## Licencia
Proyecto desarrollado con fines académicos.