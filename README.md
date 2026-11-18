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
- **Interfaz del MVP:** HTML, CSS y JavaScript en navegador.
- **API desplegable en Vercel:** funciones Node.js.
- **Base de datos:** PostgreSQL; Docker Compose para desarrollo local.
- **Backend Java:** base Spring Boot conservada para desarrollo posterior.
- **Tecnologías previstas para fases posteriores:** Python, Pandas, Scikit-learn, Docker y SonarQube.
- **Control de versiones:** Git

La web permite crear cuentas, iniciar sesión, publicar reportes y consultar los 100 más recientes. Los datos se guardan en PostgreSQL y se comparten entre visitantes. Los reportes comienzan en estado `Recibido`; la gestión por operadores sigue pendiente. El [alcance del primer incremento](docs/architecture/mvp.md) describe la visión original.

---

## Estructura del Proyecto
```text
FS_2630_Grupo/
├── .github/
│   ├── ISSUE/
│   ├── PULL_REQUEST.md
│   └── workflows/
├── api/                 # Funciones Node.js para Vercel
├── app/                 # Interfaz web
├── lib/                 # PostgreSQL, sesiones y HTTP
├── scripts/             # Servidor local
├── compose.yaml         # PostgreSQL local
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
`src/main/` conserva el inicio del backend Spring Boot, separado de la API Node.js que usa esta versión web. CI prueba la API con PostgreSQL y ejecuta las pruebas Java.
---

## Estado de ejecución

Para ejecutar la web y PostgreSQL localmente, desde la raíz del repositorio ejecuta:

```bash
docker compose up -d db
cp .env.example .env
npm ci
set -a; . ./.env; set +a
npm start
```

Abre `http://localhost:3000`. Crea una cuenta con correo y contraseña de al menos 8 caracteres. La sesión dura siete días; las contraseñas se guardan con `scrypt` y las sesiones usan cookies `HttpOnly`. Puedes publicar un reporte con ubicación, descripción y coordenadas opcionales, buscarlo y ver su detalle desde otro navegador. Las coordenadas se hacen públicas con el reporte. La base se inicializa automáticamente al primer acceso. No publiques información personal ni reportes reales para una entidad: este es un prototipo académico.

Para detener la base: `docker compose down`. El volumen conserva los datos. No uses `down -v` si quieres conservarlos. Si cambias `POSTGRES_PASSWORD` en Compose, cambia también la contraseña de `DATABASE_URL` en `.env` antes de iniciar la app.

## Publicar en Vercel

1. Haz `git push` de este commit a GitHub.
2. En Vercel, importa `VaporificEwe08/FS_2630_Grupo` como proyecto nuevo. Usa la raíz del repositorio; `vercel.json` selecciona `app/` como salida y Vercel detecta las funciones de `api/`.
3. En **Storage / Marketplace**, agrega PostgreSQL administrado (por ejemplo Neon) y conéctalo al proyecto. Asegúrate de que la cadena de conexión esté disponible como `DATABASE_URL` para **Production** y, si vas a probar previews, para **Preview**. Si la integración ofrece otro nombre, crea `DATABASE_URL` con su cadena de conexión. No copies la URL en Git ni en el navegador.
4. Despliega o vuelve a desplegar el proyecto después de configurar la variable. Abre la URL `*.vercel.app` y comprueba `/api/health`, luego crea una cuenta y un reporte.

El PostgreSQL de `compose.yaml` solo funciona en tu equipo; Vercel necesita una base accesible desde sus funciones. Vercel no ejecuta este Compose como base de datos pública. El esquema se crea automáticamente en la primera solicitud a la API. Si aparece `Servicio temporalmente no disponible`, revisa `DATABASE_URL` y los logs de funciones en Vercel.

Para iniciar el backend con Java 17, desde otra terminal en la raíz del repositorio ejecuta:

```bash
./mvnw spring-boot:run
```

La ruta `http://localhost:8080/api/health` responde `{"status":"ok"}` en Spring Boot. Este servicio Java es independiente de la web desplegada en Vercel.

Para ejecutar las pruebas automáticas necesitas Node.js 24 o superior y Java 17:

```bash
node --check app/app.js
npm test
./mvnw test
```

`npm test` ejecuta el flujo completo con PostgreSQL si `DATABASE_URL` está configurada; en CI se levanta una instancia temporal. El wrapper `mvnw` descarga Maven y las dependencias la primera vez que se utiliza.

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
