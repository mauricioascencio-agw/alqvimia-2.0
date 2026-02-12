-- =====================================================
-- ALQVIMIA RPA 2.0 - Migración: Dashboard Creator
-- Fecha: 2026-02-06
-- Descripción: Tablas para dashboards, widgets y permisos por rol
-- =====================================================

-- Tabla principal de dashboards
CREATE TABLE IF NOT EXISTS dashboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    usuario_id INT NOT NULL,
    tipo ENUM('personal', 'compartido', 'minisite') DEFAULT 'personal',
    widgets JSON,
    configuracion JSON,
    estado ENUM('activo', 'inactivo', 'borrador') DEFAULT 'borrador',
    slug VARCHAR(100) UNIQUE,
    roles_acceso JSON,
    compartido_con JSON,
    orden INT DEFAULT 0,
    visitas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    INDEX idx_dashboards_usuario (usuario_id),
    INDEX idx_dashboards_tipo (tipo),
    INDEX idx_dashboards_estado (estado),
    INDEX idx_dashboards_slug (slug)
);

-- Tabla normalizada de widgets (fase 2, para widgets reutilizables)
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    dashboard_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200),
    configuracion JSON,
    posicion JSON,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,

    INDEX idx_widgets_dashboard (dashboard_id),
    INDEX idx_widgets_tipo (tipo)
);

-- Permisos de dashboard por rol
CREATE TABLE IF NOT EXISTS dashboard_permisos_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol VARCHAR(50) NOT NULL UNIQUE,
    puede_ver BOOLEAN DEFAULT TRUE,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_compartir BOOLEAN DEFAULT FALSE,
    puede_crear_minisite BOOLEAN DEFAULT FALSE,
    max_dashboards INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permisos por defecto
INSERT INTO dashboard_permisos_roles (rol, puede_ver, puede_crear, puede_editar, puede_compartir, puede_crear_minisite, max_dashboards) VALUES
('admin', TRUE, TRUE, TRUE, TRUE, TRUE, 999),
('usuario', TRUE, TRUE, TRUE, TRUE, FALSE, 10),
('operador', TRUE, FALSE, FALSE, FALSE, FALSE, 3),
('viewer', TRUE, FALSE, FALSE, FALSE, FALSE, 1)
ON DUPLICATE KEY UPDATE rol = rol;
