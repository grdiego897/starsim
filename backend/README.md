# StarSim · Backend

API REST en **Laravel 13** que expone JSON sobre HTTP a la SPA del frontend. Autenticación por tokens Bearer con Laravel Sanctum, control de acceso por rol con middleware propio (`role:`) y persistencia en MySQL 8.4. Todo el entorno corre en Docker via Laravel Sail.

> Este README documenta el backend de forma completa: stack, estructura, autenticación, modelo de datos, endpoints, payloads de request/response, validaciones, tests y comandos habituales. Para la guía de instalación de extremo a extremo ver el [README principal](../README.md). Para el diagrama entidad-relación ver [`starsim_erd.md`](../starsim_erd.md).

---

## Índice

1. [Stack](#stack)
2. [Estructura](#estructura)
3. [Autenticación y roles](#autenticación-y-roles)
4. [Modelo de datos](#modelo-de-datos)
5. [Endpoints](#endpoints)
6. [Payloads de misiones](#payloads-de-misiones)
7. [Payloads de usuarios](#payloads-de-usuarios)
8. [Configuración (`.env`)](#configuración-env)
9. [Comandos habituales](#comandos-habituales)
10. [Tests](#tests)
11. [Cómo añadir un endpoint](#cómo-añadir-un-endpoint)
12. [Notas](#notas)

---

## Stack

| Capa | Versión |
|---|---|
| PHP | 8.3+ (runtime Sail 8.5) |
| Laravel | 13.x |
| Sanctum | 4.x |
| MySQL | 8.4 |
| Entorno | Docker via [Laravel Sail](https://laravel.com/docs/sail) |
| Tests | PHPUnit 12 |

## Estructura

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # AuthController, MisionController,
│   │   │                       # UsuarioController, EntidadController
│   │   ├── Middleware/         # CheckRole (alias 'role')
│   │   └── Resources/          # MisionResource (transformación de salida)
│   ├── Models/                 # Usuario, Entidad, Programa, Mision,
│   │                           # Vehiculo, Destino, PuertoEspacial,
│   │                           # ZonaAterrizaje
│   └── Providers/
├── bootstrap/
│   └── app.php                 # Routing + alias 'role' + Sanctum stateful
├── config/                     # Configuración estándar de Laravel
├── database/
│   ├── factories/              # Factories para todas las entidades
│   ├── migrations/             # Schema (ver §Modelo de datos)
│   └── seeders/                # Datos base + usuarios de prueba
├── routes/
│   ├── api.php                 # Endpoints REST consumidos por el frontend
│   ├── web.php                 # Vacío (no se sirven vistas Blade)
│   └── console.php
├── storage/                    # Logs, caché de Laravel
├── tests/
│   ├── Feature/                # AuthTest, UsuarioCrudTest,
│   │                           # EntidadTest, MisionCrudTest
│   └── Unit/
├── compose.yaml                # Servicios Docker (laravel.test + mysql)
├── composer.json
└── .env.example
```

## Autenticación y roles

- **Sanctum (token Bearer).** `POST /api/login` devuelve `{ token, user }`. Toda ruta protegida exige la cabecera `Authorization: Bearer <token>`.
- **Modelo de usuario:** `App\Models\Usuario` (tabla `usuarios`, no `users`). Tiene `role ∈ {admin, operator, viewer}` y pertenece a una `Entidad` (SpaceX, NASA, ESA, Blue Origin…).
- **Middleware `role:`** (`app/Http/Middleware/CheckRole.php`, registrado como alias en `bootstrap/app.php`) responde `403` si el usuario autenticado no está en la lista de roles permitidos:

```php
Route::middleware('role:admin,operator')->group(fn () => ...);
Route::middleware('role:admin')->group(fn () => ...);
```

| Rol | Puede |
|---|---|
| `admin` | Todo: gestión de usuarios, entidades y misiones de cualquier entidad |
| `operator` | CRUD de misiones (la misión queda atada a su `entidad_id` automáticamente) |
| `viewer` | Solo lectura: cualquier escritura responde `403` |

### Usuarios sembrados para pruebas

| Email | Contraseña | Rol | Entidad |
|---|---|---|---|
| `admin@starsim.io` | `admin123` | admin | SpaceX |
| `operator@starsim.io` | `operator123` | operator | SpaceX |
| `operator.nasa@starsim.io` | `operator123` | operator | NASA |
| `operator.esa@starsim.io` | `operator123` | operator | ESA |
| `viewer@starsim.io` | `viewer123` | viewer | SpaceX |

## Modelo de datos

Las migraciones (en `database/migrations/`) construyen el esquema en este orden:

| # | Tabla | Notas |
|---|---|---|
| 1 | `entidades` | Agencias (SpaceX, NASA, ESA, Blue Origin…). `slug` único. |
| 2 | `usuarios` | `role`, `entidad_id`. |
| 3 | `programas` | Programas espaciales. |
| 4 | `entidad_programa` | Pivote N:M (un programa puede ser compartido por varias entidades). |
| 5 | `puertos_espaciales` | Bases de lanzamiento. |
| 6 | `vehiculos` | Naves y boosters (mismo modelo, diferenciado por uso). |
| 7 | `destinos` | LEO, GTO, Luna, Marte… |
| 8 | `zonas_aterrizaje` | `type ∈ {tower, droneship}`. |
| 9 | `vehiculo_destino_capacidades` | Capacidad de carga (t) por par vehículo/destino. |
| 10 | `misiones` | Entidad central. Columna `shell` añadida 2026-05-12. Borrado lógico (`deleted_at`). |

Los seeders cargan datos de catálogo reales (6 entidades, 5 usuarios, 5 puertos, 6 vehículos, 7 destinos, 6 zonas de aterrizaje, capacidades de carga). Diagrama completo en [`starsim_erd.md`](../starsim_erd.md).

## Endpoints

Base: `http://127.0.0.1/api` · Definidos en `routes/api.php`.

### Públicas

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/login` | Devuelve `{ token, user }` Sanctum |

### Autenticadas (cualquier rol)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/logout` | Revoca el token actual |
| `GET` | `/me` | Datos del usuario autenticado (incluye `entidad` anidada) |
| `PATCH` | `/me` | Actualiza nombre / email / contraseña propias |
| `GET` | `/misiones` | Lista de misiones con relaciones precargadas |
| `GET` | `/misiones/{id}` | Detalle de una misión |

### Escritura de misiones (`admin`, `operator`)

| Método | Ruta | Notas |
|---|---|---|
| `POST` | `/misiones` | `201` con la misión creada |
| `PUT` | `/misiones/{id}` | Reemplazo completo |
| `PATCH` | `/misiones/{id}/status` | Solo cambia el estado |
| `DELETE` | `/misiones/{id}` | Borrado lógico (`soft delete`) |

### Gestión (`admin`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/usuarios` | Listado de usuarios con su entidad |
| `POST` | `/usuarios` | Crea usuario (requiere `admin_password`) |
| `PUT` | `/usuarios/{id}` | Edita usuario (requiere `admin_password`) |
| `GET` | `/entidades` | Listado de entidades |

Las respuestas de error siguen el formato `{ "message": "..." }` con códigos HTTP estándar (`401` no autenticado, `403` rol insuficiente, `404` recurso ausente, `422` validación, `500` error interno). Las validaciones devuelven además `{ "errors": { campo: [mensajes] } }`.

## Payloads de misiones

`MisionResource` serializa la misión con un formato compatible con el almacenamiento histórico del frontend (`{ id, name, launches: [...] }`). El frontend siempre envía **un único lanzamiento por misión**.

### Request — `POST /api/misiones` y `PUT /api/misiones/{id}`

```json
{
  "name": "Starlink Group 12-3",
  "program": "Starlink",
  "status": "programado",
  "launches": [
    {
      "destination": "leo",
      "ship": "dragon-2",
      "booster": "falcon-9",
      "cargoType": "Cargo",
      "cargoMass": "15.6 t",
      "port": "cape-canaveral-slc-40",
      "launchDate": "2026-06-15T14:30",
      "landingType": "droneship",
      "landingId": "of-course-i-still-love-you",
      "shell": "S2",
      "advancedConfig": {
        "objectivesMain": "Despliegue de 23 satélites Starlink v2",
        "objectivesSecondary": "Recuperación de la primera etapa",
        "duration": "01:25",
        "crew": "0",
        "cargo": [
          { "name": "Starlink v2", "qty": 23, "mass": 0.295 }
        ]
      }
    }
  ]
}
```

#### Reglas de validación (resumen)

| Campo | Reglas |
|---|---|
| `name` | `required`, `string`, `max:255`, único en `misiones.name` ignorando borradas |
| `program` | `nullable`, `string`, `max:255` (se autocrea en `programas` con `firstOrCreate`) |
| `status` | `nullable`, uno de `programado`, `confirmado`, `hold`, `cancelado` |
| `launches[0].destination` | `nullable`, debe existir en `destinos.slug` |
| `launches[0].ship` | `nullable`, debe existir en `vehiculos.slug` |
| `launches[0].booster` | `nullable`, debe existir en `vehiculos.slug` |
| `launches[0].cargoType` | `nullable`, uno de `Cargo`, `Crew`, `Fuel` |
| `launches[0].port` | `nullable`, debe existir en `puertos_espaciales.slug` |
| `launches[0].launchDate` | `required`, `date` |
| `launches[0].landingType` | `nullable`, uno de `tower`, `droneship` |
| `launches[0].landingId` | `nullable`, debe existir en `zonas_aterrizaje.slug` |
| `launches[0].shell` | `nullable`, uno de `S1`..`S5` |
| `advancedConfig.duration` | `nullable`, `string`, `max:20` |
| `advancedConfig.cargo` | `nullable`, `array` (cada item: `name`, `qty`, `mass`) |

- En `store` la entidad y el creador se asignan automáticamente: `entidad_id = user.entidad_id`, `created_by = user.id`.
- `masa_carga_t` se calcula automáticamente sumando `qty * mass` del array `cargo`; si no llega `cargo`, se extrae el número de `cargoMass` (`"15.6 t"` → `15.6`).
- Los `slug` entrantes se resuelven a `*_id` mediante `slugToId(...)` antes de persistir.
- Todo el `store`/`update` se ejecuta dentro de `DB::transaction(...)`.

### Request — `PATCH /api/misiones/{id}/status`

```json
{ "status": "confirmado" }
```

Valores aceptados: `programado`, `confirmado`, `hold`, `cancelado`.

### Response — formato unificado

```json
{
  "data": {
    "id": "12",
    "name": "Starlink Group 12-3",
    "status": "programado",
    "program": "Starlink",
    "programId": 4,
    "entidadId": 1,
    "entidad": { "id": 1, "name": "SpaceX", "slug": "spacex" },
    "createdBy": 2,
    "createdAt": "2026-05-15T10:32:11.000000Z",
    "updatedAt": "2026-05-15T10:32:11.000000Z",
    "launchDate": "2026-06-15T14:30",
    "port": "cape-canaveral-slc-40",
    "shell": "S2",
    "launches": [
      {
        "id": "12",
        "destination": "leo",
        "ship": "dragon-2",
        "booster": "falcon-9",
        "cargoType": "Cargo",
        "cargoMass": "15.6 t",
        "port": "cape-canaveral-slc-40",
        "launchDate": "2026-06-15T14:30",
        "landingType": "droneship",
        "landingId": "of-course-i-still-love-you",
        "shell": "S2",
        "createdAt": "2026-05-15T10:32:11.000000Z",
        "advancedConfig": {
          "objectivesMain": "Despliegue de 23 satélites Starlink v2",
          "objectivesSecondary": "Recuperación de la primera etapa",
          "duration": "01:25",
          "crew": "0",
          "cargo": [{ "name": "Starlink v2", "qty": 23, "mass": 0.295 }]
        }
      }
    ]
  }
}
```

`GET /api/misiones` devuelve un `AnonymousResourceCollection`: `{ "data": [ {misión}, ... ] }`, ordenado por `created_at DESC`.

## Payloads de usuarios

### `GET /api/me`

```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@starsim.io",
    "role": "admin",
    "entidad": { "id": 1, "name": "SpaceX", "slug": "spacex" }
  }
}
```

### `PATCH /api/me`

```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@starsim.io",
  "current_password": "actual",
  "password": "nuevaSegura1",
  "password_confirmation": "nuevaSegura1"
}
```

- `current_password` solo es obligatoria si se cambia `email` o `password`.
- Si cambia el email, **se rotan todos los tokens** del usuario y la respuesta incluye un `token` nuevo para no expulsarlo.

### `POST /api/usuarios` (admin)

```json
{
  "name": "Operario NASA",
  "email": "op.nasa@starsim.io",
  "password": "operator123",
  "role": "operator",
  "entidad_id": 2,
  "admin_password": "admin123"
}
```

`admin_password` es la contraseña del administrador que ejecuta la acción y se valida contra su hash. `password` se hashea automáticamente vía cast del modelo.

### `PUT /api/usuarios/{id}` (admin)

Mismo payload que `store` salvo que todos los campos son `sometimes`. `entidad_id` puede llegar como `null` explícito para desasignar. `admin_password` sigue siendo obligatoria.

## Configuración (`.env`)

`.env.example` trae los valores por defecto. Claves relevantes:

| Clave | Valor típico |
|---|---|
| `APP_URL` | `http://127.0.0.1` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `mysql` (nombre del servicio en `compose.yaml`) |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `starsim` / `sail` / `password` |
| `SANCTUM_STATEFUL_DOMAINS` | dominio del frontend (Live Server, p.ej. `127.0.0.1:5500`) |

Tras editar `.env`:
```bash
docker compose exec laravel.test php artisan config:clear
```

## Comandos habituales

Asumiendo los contenedores ya levantados (`docker compose up -d` desde esta carpeta):

```bash
# Reset completo: migraciones + seeders desde cero
docker compose exec laravel.test php artisan migrate:fresh --seed

# Sólo migraciones nuevas
docker compose exec laravel.test php artisan migrate

# Tinker (REPL)
docker compose exec laravel.test php artisan tinker

# Limpiar cachés
docker compose exec laravel.test php artisan config:clear
docker compose exec laravel.test php artisan cache:clear

# Logs en vivo
docker compose exec laravel.test php artisan pail
```

## Tests

Suite PHPUnit 12 con tests de Feature que ejercitan los endpoints reales contra una base de datos de testing aislada (creada automáticamente por Sail).

```bash
# Toda la suite
docker compose exec laravel.test php artisan test

# Un único archivo
docker compose exec laravel.test php artisan test tests/Feature/MisionCrudTest.php

# Un único método (filtro por nombre)
docker compose exec laravel.test php artisan test --filter=test_admin_puede_crear_mision
```

Cobertura actual:

| Archivo | Qué verifica |
|---|---|
| `tests/Feature/AuthTest.php` | Login, logout, `/me`, actualización de perfil, rotación de token al cambiar email |
| `tests/Feature/UsuarioCrudTest.php` | CRUD de usuarios, exigencia de `admin_password`, restricción al rol `admin` |
| `tests/Feature/EntidadTest.php` | Listado de entidades restringido a `admin` |
| `tests/Feature/MisionCrudTest.php` | CRUD completo, validaciones, matriz de permisos (admin / operator / viewer), `updateStatus`, soft delete |

## Cómo añadir un endpoint

1. Crear/editar el controlador en `app/Http/Controllers/Api/`.
2. Si la salida es un modelo Eloquent con formato fijo, usar un `Resource` en `app/Http/Resources/`.
3. Registrar la ruta en `routes/api.php` dentro del grupo `auth:sanctum` y, si aplica, dentro del subgrupo `role:...`.
4. Añadir test en `tests/Feature/` cubriendo la matriz de roles (admin / operator / viewer).

## Notas

- `routes/web.php` está vacío a propósito: el frontend es una SPA estática independiente y no usa Blade.
- El alias `role` se registra en `bootstrap/app.php` (Laravel 11+ ya no usa `app/Http/Kernel.php`).
- Borrado de misiones es **soft delete**: `deleted_at` se setea y los listados filtran automáticamente. La unicidad de `name` ignora filas borradas.
- El `MisionController` envuelve `store`/`update`/`updateStatus`/`destroy` en `try/catch` con `Log::error(...)` para que los errores inesperados respondan `500` controlado.
- `Programa` se autocrea con `firstOrCreate(['name' => ...])` al guardar una misión, evitando un endpoint dedicado.
