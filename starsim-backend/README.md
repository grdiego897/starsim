# StarSim

StarSim es un simulador de misiones espaciales que permite planificar, gestionar y dar seguimiento a operaciones de diferentes entidades (SpaceX, NASA, ESA, Blue Origin). La plataforma ofrece una experiencia inmersiva gestionando elementos de carga, vehículos, destinos y registros meteorológicos.

## 🚀 Funcionalidades Principales

*   **Gestión de Misiones:** Creación y modificación de misiones espaciales con diferentes vehículos y cargas.
*   **Roles y Permisos:** 
    *   `admin`: Control total del simulador y gestión de usuarios.
    *   `operator`: Creación y edición operativa de misiones (CRUD).
    *   `viewer`: Modo solo lectura y seguimiento (telemetría/estadísticas).
*   **Integración Organizacional:** Los usuarios están atados a distintas *Entidades* (Agencias) que condicionan la estética y funciones expuestas en su panel.
*   **Interfaz Dinámica 3D:** Uso de modelos interactivos y simulaciones integradas directamente en el frontend usando Spline.

## Stack Tecnológico

El proyecto cuenta con una arquitectura desacoplada:

1.  **Frontend (SPA):** HTML, CSS puro y Vanilla JavaScript. Enrutamiento mediante hashes (`#`) simulando una Single Page Application, con consumos asíncronos mediante `fetch`. Modelado 3D mediante Spline 3D.
2.  **Backend (API REST):** [Laravel 11](https://laravel.com), sirviendo endpoints en JSON.
3.  **Base de Datos:** MySQL 8.4, totalmente normalizada contemplando relaciones entre vehículos, capacidades, programas y misiones.
4.  **Entorno y Seguridad:** Docker ([Laravel Sail](https://laravel.com/docs/sail)) para la portabilidad del servidor, y autenticación gestionada a través de Sanctum basado en tokens.

---

## Instalación y Puesta en Marcha

Sigue estos pasos si deseas instalar y hacer funcionar el proyecto en tu máquina local. 

### Prerrequisitos
*   Tener instalado [Docker](https://www.docker.com/products/docker-desktop) Desktop (y funcionando).
*   Un servidor local para el frontend (Ej: *Live Server* en VSCode).

### Paso 1: Clonar y configurar Backend (Laravel)

1. Abre un terminal y dirígete a la carpeta `starsim-backend` (donde reside este README).
2. Copia el archivo `.env.example` y renómbralo a `.env`.
3. Levanta y construye los contenedores de Docker (PHP + MySQL) mediante Sail (este paso tomará varios minutos la primera vez mientras compila la imagen):
   ```bash
   docker compose up -d --build
   ```
4. Instala las dependencias de Composer:
   ```bash
   docker compose exec laravel.test composer install
   ```
5. Genera la clave de aplicación de Laravel:
   ```bash
   docker compose exec laravel.test php artisan key:generate
   ```
6. Importa la base de datos (y los usuarios de prueba). Suponiendo que el archivo SQL se encuentra en la carpeta padre superior (`database/starsim.sql`):
   **En Windows (PowerShell):**
   ```powershell
   Get-Content ..\database\starsim.sql | docker compose exec -T mysql mysql -usail -ppassword
   ```
   **En Linux/Mac:**
   ```bash
   docker compose exec -T mysql mysql -usail -ppassword < ../database/starsim.sql
   ```

### Paso 2: Ejecutar el Frontend

1. Abre el directorio principal `starsim` en tu editor de código (fuera de la carpeta del backend).
2. Lanza el archivo `login.html` mediante un servidor estático (Si usas VSCode, basta con click derecho -> **Open with Live Server**).
3. Asegúrate de que el frontend está corriendo (por lo general en `http://127.0.0.1:5500` o superior).

### Paso 3: Iniciar Sesión

Una vez tengas la interfaz local visible en tu navegador y el puerto 80 del backend respondiendo sin problemas, puedes usar nuestros usuarios de prueba precargados para interactuar con la plataforma:

| Rol | Email (Usuario) | Contraseña |
|---|---|---|
| Administrador | `admin@starsim.io` | `admin123` |
| Operador | `operator@starsim.io` | `admin123` |
| Espectador | `viewer@starsim.io` | `admin123` |

(Aún no se reflejan, en el backend se registran como tal. En el futuro se implementará en la interfaz. Sin autorización funcional actualmente)
***Nota de permisos:** Dependiendo con qué usuario ingreses, el sistema te aplicará restricciones distintas.*
*   *El `admin` tiene permiso en todos los apartados globales.*
*   *El `operator` solo puede crear/editar/eliminar misiones de su respectiva Entidad (rutas protegidas con middleware `role:admin,operator`).*
*   *El `viewer` solo goza de acceso por lectura (`GET`). Cualquier intento de guardar cambios le devolverá un error **403 (Prohibido)**.*

Las llamadas de red desde JavaScript están configuradas para consultar automáticamente al backend localizado en `http://127.0.0.1`, completando el proceso de tokenización al entrar.

---

## Arrancar el Proyecto

1. Asegúrate de tener **Docker Desktop** abierto.
2. Levanta los contenedores en segundo plano desde el directorio `starsim-backend`:
   ```bash
   docker compose up -d
   ```
3. Lanza el Frontend con el *Live Server* de tu editor abriendo el directorio `starsim` y desplegando el archivo `login.html`.
4. ¡Listo! Ya puedes iniciar sesión y usar la aplicación.

Para detener los servidores sin perder los datos de tu base de MySQL, simplemente ejecuta:
```bash
docker compose stop
```
