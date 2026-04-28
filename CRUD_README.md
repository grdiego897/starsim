# CRUD de Misiones

## Para reiniciar la BBDD
docker compose exec laravel.test php artisan migrate:fresh --seed

## Lo que se implementó

### Backend Laravel
- **14 migraciones** → tablas: `entidades`, `usuarios`, `programas`, `entidad_programa`, `puertos_espaciales`, `vehiculos`, `destinos`, `zonas_aterrizaje`, `vehiculo_destino_capacidades`, `misiones`
- **8 modelos** Eloquent con relaciones
- **7 seeders** con datos de catálogo reales (6 entidades, 5 usuarios, 5 puertos, 6 vehículos, 7 destinos, 6 zonas de aterrizaje)
- **MisionController** con CRUD completo (`index`, `show`, `store`, `update`, `updateStatus`, `destroy`)
- **MisionResource** que serializa al formato `{ id, name, launches: [{...}] }` compatible con el frontend
- **Middleware CheckRole** para proteger rutas de escritura (solo admin + operator)
- **Rutas API** protegidas con Sanctum

### Frontend JS
- **missionService.js** — reescrito para usar API REST con Bearer token y caché en memoria
- **mision.js** — `async/await`, protección doble envío, errores visuales
- **program.js** — `async/await`, estados de loading/error
- **panel.js** — `async/await`, charts, countdown, weather

## Resumen de la integración

1. **Corrección de migraciones**: Se ajustó la tabla `sessions` para que no dependa de una tabla `users` inexistente (usamos `usuarios`).
2. **Despliegue de Base de Datos**: Se ejecutó el comando `php artisan migrate:fresh --seed` dentro de Docker Sail para inicializar todo el ecosistema.
3. **Validación End-to-End**:
   - Login: `POST /api/login` → devuelve token + usuario
   - Listar: `GET /api/misiones` → `{"data":[]}`
   - Crear: `POST /api/misiones` → HTTP 201 con misión completa
   - Listar tras crear → la misión aparece correctamente con su array de lanzamientos
   - Autenticación 401 sin token → funcionando correctamente

## Usuarios disponibles para pruebas

| Email | Contraseña | Rol | Entidad |
|---|---|---|---|
| `admin@starsim.io` | `admin123` | admin | SpaceX |
| `operator@starsim.io` | `operator123` | operator | SpaceX |
| `operator.nasa@starsim.io` | `operator123` | operator | NASA |
| `operator.esa@starsim.io` | `operator123` | operator | ESA |
| `viewer@starsim.io` | `viewer123` | viewer | SpaceX |

