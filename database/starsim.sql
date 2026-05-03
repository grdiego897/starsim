-- ============================================================
-- StarSim — Script de creación de base de datos
-- Motor: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS starsim;
CREATE DATABASE starsim
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE starsim;

-- ------------------------------------------------------------
-- Organizaciones espaciales (SpaceX, NASA, etc.)
-- ------------------------------------------------------------
CREATE TABLE entidades (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255)    NOT NULL,
    logo_path       VARCHAR(500)    NULL,
    description     TEXT            NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_entidades_name (name),
    UNIQUE KEY uk_entidades_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Usuarios del sistema. Cada usuario pertenece a una entidad.
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password        VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt',
    role            ENUM('admin','operator','viewer') NOT NULL DEFAULT 'operator',
    entidad_id      BIGINT UNSIGNED NOT NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_email (email),
    INDEX idx_usuarios_entidad (entidad_id),

    CONSTRAINT fk_usuarios_entidad
        FOREIGN KEY (entidad_id) REFERENCES entidades (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Programas espaciales. Creados por un usuario.
-- ------------------------------------------------------------
CREATE TABLE programas (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_programas_name (name),

    CONSTRAINT fk_programas_created_by
        FOREIGN KEY (created_by) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Relación N:M entre entidades y programas.
-- ------------------------------------------------------------
CREATE TABLE entidad_programa (
    entidad_id      BIGINT UNSIGNED NOT NULL,
    programa_id     BIGINT UNSIGNED NOT NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (entidad_id, programa_id),

    CONSTRAINT fk_ep_entidad
        FOREIGN KEY (entidad_id) REFERENCES entidades (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ep_programa
        FOREIGN KEY (programa_id) REFERENCES programas (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Puertos espaciales de lanzamiento. Coordenadas de panel.js.
-- ------------------------------------------------------------
CREATE TABLE puertos_espaciales (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(255)    NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    latitude        DECIMAL(10,7)   NOT NULL,
    longitude       DECIMAL(10,7)   NOT NULL,
    country         VARCHAR(100)    NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_puertos_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Vehículos: naves (ship) y cohetes (booster).
-- max_payload_leo_t solo aplica a boosters; en naves es NULL.
-- ------------------------------------------------------------
CREATE TABLE vehiculos (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    type                ENUM('ship','booster') NOT NULL,
    slug                VARCHAR(255)    NOT NULL,
    display_name        VARCHAR(255)    NOT NULL,
    max_payload_leo_t   DECIMAL(8,2)    NULL COMMENT 'Solo boosters; naves = NULL',
    created_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_vehiculos_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Destinos de misión (órbitas, estaciones, superficie lunar, etc.)
-- ------------------------------------------------------------
CREATE TABLE destinos (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(255)    NOT NULL,
    display_name    VARCHAR(255)    NOT NULL,
    image_path      VARCHAR(500)    NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_destinos_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Capacidad de carga (t) por combinación vehículo–destino.
-- Datos de mision.js (CAPACITIES map).
-- ------------------------------------------------------------
CREATE TABLE vehiculo_destino_capacidades (
    vehiculo_id     BIGINT UNSIGNED NOT NULL,
    destino_id      BIGINT UNSIGNED NOT NULL,
    carga_maxima_t  DECIMAL(8,2)    NOT NULL COMMENT 'Toneladas métricas',

    PRIMARY KEY (vehiculo_id, destino_id),

    CONSTRAINT fk_vdc_vehiculo
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_vdc_destino
        FOREIGN KEY (destino_id) REFERENCES destinos (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Zonas de aterrizaje. Pertenecen a un puerto espacial.
-- ------------------------------------------------------------
CREATE TABLE zonas_aterrizaje (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug                VARCHAR(255)    NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    type                ENUM('tower','droneship') NOT NULL,
    puerto_espacial_id  BIGINT UNSIGNED NOT NULL,
    created_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_zonas_slug (slug),

    CONSTRAINT fk_zonas_puerto
        FOREIGN KEY (puerto_espacial_id) REFERENCES puertos_espaciales (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Misiones espaciales. Tabla central del sistema.
-- masa_carga_t es un caché calculado desde elementos_carga.
-- deleted_at permite soft deletes (Laravel).
-- ------------------------------------------------------------
CREATE TABLE misiones (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name                    VARCHAR(255)    NOT NULL,
    status                  ENUM('programado','confirmado','hold','cancelado') NOT NULL DEFAULT 'programado',
    programa_id             BIGINT UNSIGNED NULL,
    created_by              BIGINT UNSIGNED NOT NULL,
    nave_id                 BIGINT UNSIGNED NOT NULL,
    booster_id              BIGINT UNSIGNED NOT NULL,
    puerto_espacial_id      BIGINT UNSIGNED NOT NULL,
    destino_id              BIGINT UNSIGNED NOT NULL,
    zona_aterrizaje_id      BIGINT UNSIGNED NULL,
    tipo_carga              ENUM('Cargo','Crew','Fuel') NOT NULL,
    masa_carga_t            DECIMAL(8,2)    NULL COMMENT 'Caché: suma de elementos_carga',
    fecha_lanzamiento       DATETIME        NOT NULL,
    objetivos_principales   TEXT            NULL,
    objetivos_secundarios   TEXT            NULL,
    duracion                VARCHAR(20)     NULL COMMENT 'Formato MM/DD/HH/mm',
    tripulacion             INT UNSIGNED    NULL DEFAULT 0,
    created_at              TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP       NULL COMMENT 'Soft delete (Laravel)',

    PRIMARY KEY (id),
    UNIQUE KEY uk_misiones_name (name),
    INDEX idx_misiones_status (status),
    INDEX idx_misiones_created_by (created_by),
    INDEX idx_misiones_programa (programa_id),
    INDEX idx_misiones_fecha (fecha_lanzamiento),

    CONSTRAINT fk_misiones_programa
        FOREIGN KEY (programa_id) REFERENCES programas (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_created_by
        FOREIGN KEY (created_by) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_nave
        FOREIGN KEY (nave_id) REFERENCES vehiculos (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_booster
        FOREIGN KEY (booster_id) REFERENCES vehiculos (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_puerto
        FOREIGN KEY (puerto_espacial_id) REFERENCES puertos_espaciales (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_destino
        FOREIGN KEY (destino_id) REFERENCES destinos (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_misiones_zona_aterrizaje
        FOREIGN KEY (zona_aterrizaje_id) REFERENCES zonas_aterrizaje (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Ítems de carga individuales de una misión.
-- masa_t con 3 decimales (resolución de 1 kg).
-- ------------------------------------------------------------
CREATE TABLE elementos_carga (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    mision_id       BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    masa_t          DECIMAL(8,3)    NOT NULL COMMENT 'Precisión kg (3 decimales)',
    cantidad        INT UNSIGNED    NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_elementos_carga_mision (mision_id),

    CONSTRAINT fk_elementos_mision
        FOREIGN KEY (mision_id) REFERENCES misiones (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Registros meteorológicos por misión y puerto.
-- codigo_clima: código WMO de Open-Meteo (0-99).
-- ------------------------------------------------------------
CREATE TABLE registros_clima (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    mision_id           BIGINT UNSIGNED NOT NULL,
    puerto_espacial_id  BIGINT UNSIGNED NOT NULL,
    temperatura_c       DECIMAL(5,2)    NULL,
    viento_kmh          DECIMAL(6,2)    NULL,
    precipitacion_mm    DECIMAL(6,2)    NULL,
    codigo_clima        INT             NULL COMMENT 'Código WMO Open-Meteo (0-99)',
    categoria           ENUM('despejado','nublado','precipitaciones') NOT NULL,
    viabilidad          ENUM('go','hold','cancelado') NOT NULL,
    registrado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_registros_clima_mision (mision_id),

    CONSTRAINT fk_clima_mision
        FOREIGN KEY (mision_id) REFERENCES misiones (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_clima_puerto
        FOREIGN KEY (puerto_espacial_id) REFERENCES puertos_espaciales (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA — Catálogos estáticos
-- ============================================================

INSERT INTO entidades (name, slug, description) VALUES
    ('NASA',         'nasa',         'National Aeronautics and Space Administration'),
    ('ESA',          'esa',          'European Space Agency'),
    ('SpaceX',       'spacex',       'Space Exploration Technologies Corp.'),
    ('Axiom',        'axiom',        'Axiom Space'),
    ('Vast',         'vast',         'Vast Space'),
    ('Eutelsat',     'eutelsat',     'Eutelsat Communications'),
    ('JAXA',         'jaxa',         'Japan Aerospace Exploration Agency'),
    ('CSA',          'csa',          'Canadian Space Agency');

-- Coordenadas de portCities en panel.js
INSERT INTO puertos_espaciales (slug, name, latitude, longitude, country) VALUES
    ('starbase',    'Starbase',                           25.9970000,  -97.1570000,  'USA'),
    ('cape',        'Cape Canaveral',                     28.3922000,  -80.6077000,  'USA'),
    ('vandenberg',  'Vandenberg Space Force Base',        34.7420000, -120.5724000,  'USA'),
    ('kourou',      'Centre Spatial Guyanais (Kourou)',    5.2360000,  -52.7690000,  'Francia (Guyana Francesa)'),
    ('azores',      'Spaceport Azores',                   38.7650000,  -27.0945000,  'Portugal');

-- 3 naves + 3 boosters
INSERT INTO vehiculos (type, slug, display_name, max_payload_leo_t) VALUES
    ('ship',    'starship',       'Starship',        NULL),
    ('ship',    'dragon',         'Dragon',          NULL),
    ('ship',    'falcon-fairing', 'Falcon Fairing',  NULL),
    ('booster', 'superheavy',     'Super Heavy',     150.00),
    ('booster', 'falcon9',        'Falcon 9',         22.80),
    ('booster', 'falconheavy',    'Falcon Heavy',     63.80);

INSERT INTO destinos (slug, display_name, image_path) VALUES
    ('leo',          'Low Earth Orbit (LEO)',  NULL),
    ('haven',        'Haven-1',               NULL),
    ('axiom',        'Axiom Station',         NULL),
    ('orbital-reef', 'Orbital Reef',          NULL),
    ('gateway',      'Gateway (NRHO)',        NULL),
    ('luna',         'Superficie Lunar',      NULL),
    ('terminus',     'Terminus (Marte)',       NULL);

INSERT INTO zonas_aterrizaje (slug, name, type, puerto_espacial_id) VALUES
    ('1',           'Landing Zone 1',                        'tower',     (SELECT id FROM puertos_espaciales WHERE slug = 'cape')),
    ('mechazilla',  'Mechazilla',                            'tower',     (SELECT id FROM puertos_espaciales WHERE slug = 'starbase')),
    ('ytml',        'YTML (You will Thank Me Later)',         'tower',     (SELECT id FROM puertos_espaciales WHERE slug = 'starbase')),
    ('ocisly',      'OCISLY (Of Course I Still Love You)',   'droneship', (SELECT id FROM puertos_espaciales WHERE slug = 'cape')),
    ('jrti',        'JRTI (Just Read The Instructions)',      'droneship', (SELECT id FROM puertos_espaciales WHERE slug = 'vandenberg')),
    ('asog',        'ASOG (A Shortfall of Gravitas)',         'droneship', (SELECT id FROM puertos_espaciales WHERE slug = 'cape'));

-- Capacidades de carga por booster+destino. Fuente: CAPACITIES en mision.js.

-- Super Heavy
INSERT INTO vehiculo_destino_capacidades (vehiculo_id, destino_id, carga_maxima_t) VALUES
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'leo'),          150.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'haven'),        100.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'axiom'),        100.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'orbital-reef'), 100.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'gateway'),       50.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'luna'),          50.00),
    ((SELECT id FROM vehiculos WHERE slug = 'superheavy'), (SELECT id FROM destinos WHERE slug = 'terminus'),     100.00);

-- Falcon 9
INSERT INTO vehiculo_destino_capacidades (vehiculo_id, destino_id, carga_maxima_t) VALUES
    ((SELECT id FROM vehiculos WHERE slug = 'falcon9'), (SELECT id FROM destinos WHERE slug = 'leo'),          22.80),
    ((SELECT id FROM vehiculos WHERE slug = 'falcon9'), (SELECT id FROM destinos WHERE slug = 'haven'),        10.00),
    ((SELECT id FROM vehiculos WHERE slug = 'falcon9'), (SELECT id FROM destinos WHERE slug = 'axiom'),        10.00),
    ((SELECT id FROM vehiculos WHERE slug = 'falcon9'), (SELECT id FROM destinos WHERE slug = 'orbital-reef'), 10.00);

-- Falcon Heavy
INSERT INTO vehiculo_destino_capacidades (vehiculo_id, destino_id, carga_maxima_t) VALUES
    ((SELECT id FROM vehiculos WHERE slug = 'falconheavy'), (SELECT id FROM destinos WHERE slug = 'leo'),          63.80),
    ((SELECT id FROM vehiculos WHERE slug = 'falconheavy'), (SELECT id FROM destinos WHERE slug = 'haven'),        30.00),
    ((SELECT id FROM vehiculos WHERE slug = 'falconheavy'), (SELECT id FROM destinos WHERE slug = 'axiom'),        30.00),
    ((SELECT id FROM vehiculos WHERE slug = 'falconheavy'), (SELECT id FROM destinos WHERE slug = 'orbital-reef'), 30.00),
    ((SELECT id FROM vehiculos WHERE slug = 'falconheavy'), (SELECT id FROM destinos WHERE slug = 'gateway'),      15.00);


SET FOREIGN_KEY_CHECKS = 1;
