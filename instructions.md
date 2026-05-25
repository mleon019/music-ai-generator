# TFG — Generación automática de música y partituras con IA

Instrucciones para la implementación asistida con GitHub Copilot.
Lee este archivo completo antes de generar cualquier código.

---

## Descripción del proyecto

Aplicación web que permite generar composiciones musicales en formato MusicXML mediante modelos de lenguaje (Groq), visualizarlas como partitura en el navegador con OSMD, y gestionar un historial personal de composiciones para usuarios autenticados. El desarrollo sigue un ciclo iterativo-incremental con cinco iteraciones.

---

## Stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | Vanilla JS + Vite | SPA sin framework |
| Renderizado | OpenSheetMusicDisplay (OSMD) | Partitura en el navegador |
| Comunicación | Fetch API | Llamadas al backend |
| Backend | Node.js + Express | API REST |
| Autenticación | JWT + bcrypt | Registro e inicio de sesión (I3) |
| Testing | Jest + Supertest | Tests de rutas y lógica |
| Base de datos | PostgreSQL | Persistencia |
| Driver BD | node-postgres (`pg`) | Sin ORM |
| IA | Groq API (`groq-sdk`) | Generación de MusicXML |
| Validación XML | libxmljs2 + XSD MusicXML 4.0 | Validación formal del XML generado |
| Formato musical | MusicXML | Intercambio frontend ↔ backend |
| CI | GitHub Actions | Lint, tests y build automáticos |
| Contenedores | Docker + Docker Compose | Entorno reproducible |
| Despliegue (I5) | Azure Cloud | Nube |

---

## Estructura de carpetas

```
/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js          # Punto de entrada, router SPA
│       ├── api.js           # Wrapper de Fetch API
│       ├── components/
│       │   ├── form.js      # Formulario de configuración musical
│       │   ├── score.js     # Integración OSMD
│       │   └── auth.js      # Login / registro
│       └── pages/
│           ├── home.js
│           ├── generate.js
│           └── history.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # POST /api/auth/register, POST /api/auth/login
│   │   │   ├── scores.js        # POST /api/scores/generate, GET /api/scores, DELETE /api/scores/:id
│   │   │   └── health.js        # GET /api/health
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── scoresController.js
│   │   ├── services/
│   │   │   ├── groqService.js   # Llama a Groq y devuelve MusicXML crudo
│   │   │   └── xmlService.js    # Valida MusicXML con libxmljs2 + XSD
│   │   ├── middleware/
│   │   │   ├── auth.js          # Verificación de JWT
│   │   │   └── errorHandler.js  # Manejo centralizado de errores
│   │   ├── db/
│   │   │   ├── pool.js          # Conexión pg Pool
│   │   │   └── migrations/      # Archivos SQL numerados (001_init.sql, …)
│   ├── server.js             # Arranque del servidor Express
│   ├── app.js               # Configuración de Express y middlewares
│   └── tests/
│
├── schema/
│   └── musicxml.xsd       # XSD oficial de MusicXML 4.0
│
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── .github/
    └── workflows/
        └── ci.yml
```

El proyecto seguirá una estrucutra modular moderna: carpetas organizadas dentro de src/ con el punto de entrada en server.js. Organización de carpetas por tipo donde el código se agrupa por responsabilidad técnica con carpetas como /routes, /controllers, /models. Configuración centralizada: Creamos un archivo, por ejemplo src/config/index.js, que: Carga las variables desde .env, las valida, les da valores por defecto si faltan y Eexpone un único objeto config para que toda la app lo use.


---

## Base de datos (PostgreSQL)

Usa SQL plano con `node-postgres`. Sin ORM. Las migraciones son archivos `.sql` numerados que se ejecutan en orden.

```sql
-- 001_init.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  config JSONB NOT NULL,        -- parámetros del formulario (tonalidad, tempo, etc.)
  musicxml TEXT NOT NULL,       -- contenido MusicXML completo
  created_at TIMESTAMPTZ DEFAULT now()
);
```

La columna `config` almacena los parámetros del formulario (tonalidad, compás, tempo, instrumentos, duración) como JSON. La columna `musicxml` guarda el XML completo generado y validado.

---

## API REST

Todas las rutas con prefijo `/api`. Las rutas protegidas requieren cabecera `Authorization: Bearer <token>`.

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro de nuevo usuario |
| POST | `/api/auth/login` | No | Login, devuelve JWT |
| PATCH | `/api/auth/profile` | Si | Actualizar nombre u otros datos del perfil |
| DELETE | `/api/auth/account` | Si | Eliminar cuenta del usuario |
| POST | `/api/scores/generate` | Opcional | Genera y guarda una nueva partitura (si hay sesion iniciada) |
| POST | `/api/scores/regenerate` | Opcional | Genera de nuevo y actualiza una partitura existente (si hay sesion iniciada) |
| GET | `/api/scores` | Sí | Lista partituras del usuario |
| GET | `/api/scores/:id` | Sí | Obtiene una partitura |
| PATCH | `/api/scores/:id` | Sí | Cambiar el título de una partitura |
| DELETE | `/api/scores/:id` | Sí | Elimina una partitura |
| DELETE | `/api/scores` | Sí | Elimina todas las partituras asociadas al usuario |
| GET | `/api/health` | No | Health check |

El endpoint `POST /api/scores/generate` recibe un objeto `config` con los parámetros musicales, construye un prompt para Groq, valida el MusicXML devuelto con libxmljs2 y lo persiste si hay sesion iniciada. Devuelve el MusicXML válido al frontend.

El endpoint `POST /api/scores/regenerate` recibe el `id` de la partitura actual (si hay sesion iniciada) junto con el objeto `config`, genera un nuevo musicxml, si hay sesion iniciada actualiza el registro actual modificando los campos `musicxml` y `created_at`. Devuelve el MusicXML válido al frontend.

---

## Flujo de generación de partituras

```
Frontend (formulario)
  → POST /api/scores/generate { config }
    → groqService: elegir modelo + construir prompt + llamar Groq API
      → extraer bloque MusicXML de la respuesta del LLM
        → xmlService: validar con libxmljs2 contra musicxml.xsd
          → si inválido: reintentar hasta 2 veces con feedback del error cambiando de modelo
          → si error 429: reintentar cambiando de modelo
          → si válido y sesion iniciada: persistir en BD
            → devolver MusicXML al frontend
              → OSMD renderiza la partitura
```

---

## Autenticación JWT

- Registro: hash de contraseña con `bcrypt` (cost factor 12), guardar en `users`.
- Login: comparar hash, firmar JWT con `jsonwebtoken` (expiración 24h).
- Middleware `auth.js`: verificar JWT en cabecera, adjuntar `req.user` con `{ id, email }`.
- La clave secreta JWT se lee de la variable de entorno `JWT_SECRET`.

---

## Variables de entorno

```
# backend/.env (no incluir en el repositorio)
PORT=3000
DATABASE_URL=postgresql://user:password@db:5432/tfg
JWT_SECRET=cambiar_en_produccion
GROQ_API_KEY=gsk_...

# frontend (en vite.config.js o .env)
VITE_API_BASE_URL=http://localhost:3000
```

---

## Iteraciones

En cada iteración se ampliará la cobertura de la contenerización en Docker, los tests y el pipeline CI.

### I1 — Núcleo de generación (MVP interno)

- Endpoint `POST /api/scores/generate` con prompt estático.
- `groqService` llama a Groq y extrae MusicXML.
- `xmlService` valida con libxmljs2.
- Responde con el MusicXML crudo (sin persistencia aún).
- Tests básicos de Jest para el servicio de validación.
- Docker Compose funcional con backend.

### I2 — Renderizado y formulario (MVP visible)

- Frontend SPA con Vite y página de generación.
- Formulario: tonalidad, compás, tempo, instrumento, número de compases.
- OSMD renderiza el MusicXML recibido del backend.
- El user prompt final a Groq se construye dinámicamente desde los parámetros del formulario.

> Al finalizar I2 se obtiene el **Producto Mínimo Viable**: generar y visualizar partituras desde el navegador.

### I3 — Usuarios y persistencia

- Levantar PostgreSQL con Docker
- Tabla `users` y tabla `scores` en PostgreSQL.
- Endpoints de registro y login con JWT + bcrypt.
- Middleware de autenticación en rutas de partituras.
- `POST /api/scores/generate` persiste el resultado en `scores`.
- `GET /api/scores` devuelve el historial del usuario autenticado.
- Frontend: páginas de login, registro e historial.

### I4 — Exportación y mejoras

- Exportación de MusicXML (descarga de archivo `.musicxml`).
- Exportación a otros formatos (MIDI, WAV)
- Mejoras de UX: mensajes de error claros, estado de carga, responsive.
- Ampliación de tests y cobertura.
- Mejoras de accesibilidad y rendimiento.

### I5 — Despliegue en Azure

- Publicar imágenes Docker en Azure Container Registry.
- Desplegar backend y frontend en Azure Container Apps.
- Configurar Azure Database for PostgreSQL Flexible Server.
- Variables de entorno gestionadas desde Azure portal o Key Vault.

---

## Convenciones de código

- ES Modules (`import`/`export`) en frontend; CommonJS (`require`) en backend con Node 20.
- `async`/`await` para toda la asincronía. Sin callbacks.
- Errores del servidor con formato `{ error: "mensaje" }` y código HTTP apropiado.
- Variables de entorno siempre por `process.env`, nunca hardcodeadas.
- Los archivos de migración SQL se nombran `NNN_descripcion.sql` y son idempotentes.
- El XSD de MusicXML se carga una sola vez al arrancar el servidor y se reutiliza en todas las validaciones.

---

## Estructura de prompt

Se utiliza la siguiente estructura de conversación multi-turn:

- **System Prompt**: Define el rol del modelo y el formato de respuesta (JSON).
- **User Prompt (1)**: Primer ejemplo few-shot con requisitos musicales.
- **Assistant Prompt (1)**: Respuesta ideal en formato MusicXML.
- **User Prompt (2)**: Segundo ejemplo few-shot con requisitos musicales.
- **Assistant Prompt (2)**: Respuesta ideal en formato MusicXML.
- **User Prompt Final**: Petición real basada en el formulario del usuario.

El system prompt y los ejemplos few-shot se leen desde archivos .md y .musicxml. El user prompt final se construye dinamicamente con los parametros del formulario de configuración.