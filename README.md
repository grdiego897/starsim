# Starsim

Simulador de misiones espaciales con planificación, gestión y seguimiento de operaciones para distintas agencias (SpaceX, NASA, ESA, Blue Origin). Arquitectura desacoplada: SPA en Vanilla JS contra una API REST en Laravel 11.

> 🇪🇸 Documentación en español a continuación · 🇬🇧 [English version below](#english)

---

## Estructura del repositorio

```
starsim/
├── backend/         # API Laravel 11 (Sail + MySQL 8.4 + Sanctum)
├── frontend/        # SPA Vanilla JS (HTML/CSS/JS, Spline 3D)
├── database/        # Volcado SQL inicial (starsim.sql)
├── CRUD_README.md   # Detalle técnico del CRUD de misiones
└── starsim_erd.md   # Diagrama entidad-relación
```

## 🚀 Funcionalidades principales

- **Gestión de misiones:** CRUD completo de misiones espaciales, vehículos, cargas y destinos.
- **Roles y permisos** (middleware `role:` sobre Sanctum):
  - `admin`: control total, gestión de usuarios y entidades.
  - `operator`: crea, edita y elimina misiones de su entidad.
  - `viewer`: solo lectura; las operaciones de escritura devuelven `403`.
- **Entidades (agencias):** SpaceX, NASA, ESA, Blue Origin… La entidad del usuario condiciona estética y datos visibles.
- **Módulos del frontend:**
  - `panel.html` — dashboard con charts, countdown y meteorología.
  - `program.html` — gestor de programas y misiones por entidad.
  - `mision.html` — editor de misión (cargas, vehículo, destino).
  - `constelacion.html` — visualización de la constelación de satélites desplegados.
  - `configAvanzada.html` — ajustes avanzados (velocidad de simulación, información orbital, etc.).
  - `components/configModal.html` — modal de configuración rápida y perfil.

## 🧱 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS puro + Vanilla JS (hash routing `#`, `fetch` async, [Spline 3D](https://spline.design/)) |
| Backend | [Laravel 11](https://laravel.com) sirviendo JSON sobre HTTP |
| Auth | [Laravel Sanctum](https://laravel.com/docs/sanctum) (tokens Bearer) |
| Base de datos | MySQL 8.4 (normalizada — ver `starsim_erd.md`) |
| Entorno | Docker via [Laravel Sail](https://laravel.com/docs/sail) |

---

## ⚙️ Instalación

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y corriendo.
- Un servidor estático para el frontend (recomendado: *Live Server* en VSCode).

### 1. Instalar dependencias del backend

Desde la carpeta `backend/`, instala los paquetes de Composer usando el contenedor oficial (no requiere PHP ni Composer locales):

```bash
docker run --rm -v "$($PWD):/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs
```

### 2. Levantar los contenedores

Primera vez (compila la imagen de Sail, requiere internet):

```bash
docker compose up -d --build
```

Veces siguientes:

```bash
docker compose up -d
```

### 3. Generar la clave de aplicación

```bash
docker compose exec laravel.test php artisan key:generate
```

### 4. Cargar la base de datos

**Opción A — Volcado SQL** (`database/starsim.sql`):

PowerShell (Windows):
```powershell
Get-Content ..\database\starsim.sql | docker compose exec -T mysql mysql -usail -ppassword
```

Bash (Linux/Mac):
```bash
docker compose exec -T mysql mysql -usail -ppassword < ../database/starsim.sql
```

**Opción B — Migraciones + seeders** (regenera todo desde Laravel; ver `CRUD_README.md`):
```bash
docker compose exec laravel.test php artisan migrate:fresh --seed
```

### 5. Levantar el frontend

1. Abre la carpeta `frontend/` en tu editor.
2. Lanza `frontend/login.html` con Live Server (clic derecho → *Open with Live Server*).
3. El frontend correrá en `http://127.0.0.1:5500` (o similar) y consultará al backend en `http://127.0.0.1`.

---

## 👥 Usuarios de prueba

Estos usuarios son cargados por los seeders / volcado SQL:

| Email | Contraseña | Rol | Entidad |
|---|---|---|---|
| `admin@starsim.io` | `admin123` | admin | SpaceX |
| `operator@starsim.io` | `operator123` | operator | SpaceX |
| `operator.nasa@starsim.io` | `operator123` | operator | NASA |
| `operator.esa@starsim.io` | `operator123` | operator | ESA |
| `viewer@starsim.io` | `viewer123` | viewer | SpaceX |

> **Permisos:** `admin` accede a todo. `operator` solo puede crear/editar/eliminar misiones de su entidad. `viewer` recibe `403 Forbidden` ante cualquier escritura.

---

## 🛰️ Endpoints principales

Base: `http://127.0.0.1/api` · Autenticación: header `Authorization: Bearer <token>`.

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/login` | público |
| `POST` | `/logout` | autenticado |
| `GET` `PATCH` | `/me`, `/me/avatar` | autenticado |
| `GET` | `/misiones`, `/misiones/{id}` | autenticado (incluido `viewer`) |
| `POST` `PUT` `PATCH` `DELETE` | `/misiones[...]` | `admin`, `operator` |
| `GET` `POST` `PUT` | `/usuarios[...]` | `admin` |
| `GET` | `/entidades` | `admin` |

El detalle de payloads y formato de respuesta vive en [`CRUD_README.md`](./CRUD_README.md).

---

## 🧪 Pruebas

Los tests de backend son pruebas de Feature (HTTP + base de datos) y Unit. Usan **SQLite en memoria** configurado en `phpunit.xml`, por lo que **no requieren Docker** para ejecutarse.

```bash
# Desde backend/ — con Sail (Docker levantado):
docker compose exec laravel.test php artisan test

# Sin Docker, si tienes PHP y Composer instalados localmente:
php artisan test
```

Suites disponibles:

| Suite | Archivos | Qué cubre |
|---|---|---|
| Feature | `AuthTest`, `MisionCrudTest`, `UsuarioCrudTest`, `EntidadTest` | Endpoints REST, roles y permisos |
| Unit | `ExampleTest` | Lógica aislada |

Para ejecutar solo una suite:

```bash
docker compose exec laravel.test php artisan test --testsuite=Feature
docker compose exec laravel.test php artisan test --testsuite=Unit
```

Para ejecutar un archivo concreto:

```bash
docker compose exec laravel.test php artisan test tests/Feature/MisionCrudTest.php
```

---

## ▶️ Arranque diario

1. Abre Docker Desktop.
2. Desde `backend/`: `docker compose up -d`.
3. Lanza `frontend/login.html` con Live Server.

Para detener sin perder datos:
```bash
docker compose stop
```

---

<a id="english"></a>

# StarSim · English

Space-mission simulator with planning, management, and tracking for multiple agencies (SpaceX, NASA, ESA, Blue Origin). Decoupled architecture: Vanilla JS SPA against a Laravel 11 REST API.

## Repository layout

```
starsim/
├── backend/         # Laravel 11 API (Sail + MySQL 8.4 + Sanctum)
├── frontend/        # Vanilla JS SPA (HTML/CSS/JS, Spline 3D)
├── database/        # Initial SQL dump (starsim.sql)
├── CRUD_README.md   # Mission CRUD technical reference
└── starsim_erd.md   # Entity-relationship diagram
```

## Highlights

- Full CRUD for missions, vehicles, payloads and destinations.
- Role-based access (`admin` / `operator` / `viewer`) enforced by a Sanctum-backed `role:` middleware.
- Per-entity scoping (each operator manages missions for their own agency).
- Frontend modules: dashboard, program manager, mission editor, **satellite constellation view**, **advanced settings**, quick-config modal.

## Stack

Vanilla JS SPA (hash routing, `fetch`, [Spline 3D](https://spline.design/)) · Laravel 11 + Sanctum · MySQL 8.4 · Docker via [Laravel Sail](https://laravel.com/docs/sail).

## Install

Requirements: Docker Desktop and a static server for the frontend (Live Server recommended).

From `backend/`:

```bash
# 1. Install Composer dependencies via container
docker run --rm -v "$($PWD):/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs

# 2. Start containers (first run uses --build)
docker compose up -d --build

# 3. Generate app key
docker compose exec laravel.test php artisan key:generate

# 4a. Load the bundled SQL dump
docker compose exec -T mysql mysql -usail -ppassword < ../database/starsim.sql
# 4b. ...or run migrations + seeders
docker compose exec laravel.test php artisan migrate:fresh --seed
```

Then open `frontend/login.html` with Live Server.

## Test users

| Email | Password | Role | Entity |
|---|---|---|---|
| `admin@starsim.io` | `admin123` | admin | SpaceX |
| `operator@starsim.io` | `operator123` | operator | SpaceX |
| `operator.nasa@starsim.io` | `operator123` | operator | NASA |
| `operator.esa@starsim.io` | `operator123` | operator | ESA |
| `viewer@starsim.io` | `viewer123` | viewer | SpaceX |

`viewer` is read-only — any write request returns `403 Forbidden`.

## Tests

Backend tests are Feature (HTTP + DB) and Unit tests. They use an **in-memory SQLite** database (configured in `phpunit.xml`) — **Docker is not required** to run them.

```bash
# From backend/ — with Sail (Docker running):
docker compose exec laravel.test php artisan test

# Without Docker (requires local PHP + Composer):
php artisan test
```

Available suites:

| Suite | Files | Coverage |
|---|---|---|
| Feature | `AuthTest`, `MisionCrudTest`, `UsuarioCrudTest`, `EntidadTest` | REST endpoints, roles, permissions |
| Unit | `ExampleTest` | Isolated logic |

Run a single suite or file:

```bash
docker compose exec laravel.test php artisan test --testsuite=Feature
docker compose exec laravel.test php artisan test tests/Feature/MisionCrudTest.php
```

## Daily start

```bash
# from backend/
docker compose up -d        # start
docker compose stop         # stop (keeps MySQL data)
```

Then open `frontend/login.html` with Live Server. See [`CRUD_README.md`](./CRUD_README.md) for API details and [`starsim_erd.md`](./starsim_erd.md) for the data model.
