-- =====================================================
-- ALQVIMIA RPA 2.0 - ESQUEMA DE BASE DE DATOS MySQL
-- =====================================================
-- Fecha: 2025
-- Descripcion: Schema completo para el sistema Alqvimia RPA
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS alqvimia_rpa
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE alqvimia_rpa;

-- =====================================================
-- TABLA: usuarios
-- Almacena información de usuarios del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    rol ENUM('admin', 'usuario', 'operador', 'viewer') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: configuraciones_sistema
-- Configuraciones globales del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS configuraciones_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    categoria VARCHAR(50) DEFAULT 'general',
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_clave (clave)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: configuraciones_usuario
-- Configuraciones personalizadas por usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS configuraciones_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tema VARCHAR(50) DEFAULT 'midnight-blue',
    idioma VARCHAR(10) DEFAULT 'es',
    notificaciones_email BOOLEAN DEFAULT TRUE,
    notificaciones_push BOOLEAN DEFAULT TRUE,
    sidebar_collapsed BOOLEAN DEFAULT FALSE,
    configuracion_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario (usuario_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: temas
-- Temas personalizados del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS temas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    es_personalizado BOOLEAN DEFAULT FALSE,
    variables_css JSON NOT NULL,
    preview_colors JSON,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: workflows
-- Flujos de trabajo/automatizaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) DEFAULT 'general',
    version VARCHAR(20) DEFAULT '1.0.0',
    estado ENUM('borrador', 'activo', 'pausado', 'archivado') DEFAULT 'borrador',
    pasos JSON NOT NULL,
    variables JSON,
    configuracion JSON,
    usuario_creador_id INT,
    ejecuciones_totales INT DEFAULT 0,
    ultima_ejecucion DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria),
    INDEX idx_estado (estado),
    FULLTEXT INDEX ft_busqueda (nombre, descripcion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: ejecuciones
-- Historial de ejecuciones de workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS ejecuciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_id INT NOT NULL,
    usuario_id INT,
    estado ENUM('pendiente', 'ejecutando', 'completado', 'error', 'cancelado') DEFAULT 'pendiente',
    inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fin DATETIME DEFAULT NULL,
    duracion_ms INT DEFAULT NULL,
    resultado JSON,
    logs TEXT,
    error_mensaje TEXT,
    progreso INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_workflow (workflow_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (inicio)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: plantillas_ia
-- Plantillas de IA disponibles
-- =====================================================
CREATE TABLE IF NOT EXISTS plantillas_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'fa-robot',
    tipo ENUM('gpt', 'claude', 'gemini', 'custom', 'openai', 'azure') DEFAULT 'gpt',
    modelo VARCHAR(100),
    configuracion JSON,
    prompt_sistema TEXT,
    activo BOOLEAN DEFAULT TRUE,
    es_premium BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: plantillas_agentes
-- Plantillas de agentes RPA
-- =====================================================
CREATE TABLE IF NOT EXISTS plantillas_agentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'fa-user-robot',
    categoria VARCHAR(50) DEFAULT 'general',
    capacidades JSON,
    configuracion_default JSON,
    activo BOOLEAN DEFAULT TRUE,
    es_premium BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: conexiones_mcp
-- Conexiones a servidores MCP
-- =====================================================
CREATE TABLE IF NOT EXISTS conexiones_mcp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    puerto INT DEFAULT 8080,
    protocolo ENUM('http', 'https', 'ws', 'wss') DEFAULT 'http',
    estado ENUM('conectado', 'desconectado', 'error') DEFAULT 'desconectado',
    ultimo_ping DATETIME DEFAULT NULL,
    configuracion JSON,
    credenciales_encriptadas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: variables_globales
-- Variables globales del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS variables_globales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json', 'secret') DEFAULT 'string',
    descripcion VARCHAR(255),
    es_secreta BOOLEAN DEFAULT FALSE,
    categoria VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nombre (nombre),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: acciones_grabadas
-- Acciones grabadas por el recorder
-- =====================================================
CREATE TABLE IF NOT EXISTS acciones_grabadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id VARCHAR(36) NOT NULL,
    tipo_accion VARCHAR(50) NOT NULL,
    selector TEXT,
    valor TEXT,
    coordenadas JSON,
    screenshot_path VARCHAR(255),
    metadata JSON,
    orden INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sesion (sesion_id),
    INDEX idx_tipo (tipo_accion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: sesiones_grabacion
-- Sesiones de grabación
-- =====================================================
CREATE TABLE IF NOT EXISTS sesiones_grabacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(150),
    descripcion TEXT,
    usuario_id INT,
    estado ENUM('grabando', 'pausado', 'finalizado') DEFAULT 'grabando',
    inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fin DATETIME DEFAULT NULL,
    total_acciones INT DEFAULT 0,
    convertido_a_workflow BOOLEAN DEFAULT FALSE,
    workflow_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: logs_sistema
-- Logs del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nivel ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
    categoria VARCHAR(50) DEFAULT 'general',
    mensaje TEXT NOT NULL,
    contexto JSON,
    usuario_id INT DEFAULT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nivel (nivel),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha (created_at),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: notificaciones
-- Notificaciones del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('info', 'success', 'warning', 'error', 'system') DEFAULT 'info',
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    url_accion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: sesiones_videoconferencia
-- Sesiones de videoconferencia
-- =====================================================
CREATE TABLE IF NOT EXISTS sesiones_videoconferencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(150),
    host_usuario_id INT,
    estado ENUM('programada', 'activa', 'finalizada', 'cancelada') DEFAULT 'programada',
    inicio_programado DATETIME,
    inicio_real DATETIME DEFAULT NULL,
    fin DATETIME DEFAULT NULL,
    duracion_minutos INT DEFAULT NULL,
    participantes_max INT DEFAULT 10,
    grabacion_activa BOOLEAN DEFAULT FALSE,
    transcripcion_activa BOOLEAN DEFAULT FALSE,
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_fecha (inicio_programado)
) ENGINE=InnoDB;

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Insertar temas predeterminados
INSERT INTO temas (nombre, slug, descripcion, es_predeterminado, variables_css, preview_colors) VALUES
('Midnight Blue', 'midnight-blue', 'Tema oscuro con acentos azules', TRUE,
 '{"primary-color": "#2563eb", "dark-bg": "#0f172a", "card-bg": "#1e293b"}',
 '{"primary": "#2563eb", "bg": "#0f172a", "accent": "#7c3aed"}'),
('Ocean Breeze', 'ocean-breeze', 'Tema oscuro con tonos de océano',  FALSE,
 '{"primary-color": "#0891b2", "dark-bg": "#042f2e", "card-bg": "#134e4a"}',
 '{"primary": "#0891b2", "bg": "#042f2e", "accent": "#2dd4bf"}'),
('Sunset Purple', 'sunset-purple', 'Tema oscuro con tonos púrpura', FALSE,
 '{"primary-color": "#a855f7", "dark-bg": "#1c1917", "card-bg": "#292524"}',
 '{"primary": "#a855f7", "bg": "#1c1917", "accent": "#ec4899"}'),
('Forest Green', 'forest-green', 'Tema oscuro con tonos verdes', FALSE,
 '{"primary-color": "#22c55e", "dark-bg": "#14532d", "card-bg": "#166534"}',
 '{"primary": "#22c55e", "bg": "#14532d", "accent": "#84cc16"}'),
('Ruby Red', 'ruby-red', 'Tema oscuro con acentos rojos', FALSE,
 '{"primary-color": "#e11d48", "dark-bg": "#1c1917", "card-bg": "#292524"}',
 '{"primary": "#e11d48", "bg": "#1c1917", "accent": "#f43f5e"}'),
('Golden Amber', 'golden-amber', 'Tema oscuro con tonos dorados', FALSE,
 '{"primary-color": "#f59e0b", "dark-bg": "#1c1917", "card-bg": "#292524"}',
 '{"primary": "#f59e0b", "bg": "#1c1917", "accent": "#eab308"}'),
('Cyberpunk Neon', 'cyberpunk-neon', 'Tema futurista con neones', FALSE,
 '{"primary-color": "#00f5d4", "dark-bg": "#0a0a0a", "card-bg": "#1a1a2e"}',
 '{"primary": "#00f5d4", "bg": "#0a0a0a", "accent": "#f72585"}'),
('Arctic Frost', 'arctic-frost', 'Tema claro y minimalista', FALSE,
 '{"primary-color": "#3b82f6", "dark-bg": "#f1f5f9", "card-bg": "#ffffff"}',
 '{"primary": "#3b82f6", "bg": "#f1f5f9", "accent": "#06b6d4"}'),
('Lavender Dreams', 'lavender-dreams', 'Tema oscuro con tonos lavanda', FALSE,
 '{"primary-color": "#8b5cf6", "dark-bg": "#18181b", "card-bg": "#27272a"}',
 '{"primary": "#8b5cf6", "bg": "#18181b", "accent": "#d946ef"}'),
('Volcanic Orange', 'volcanic-orange', 'Tema oscuro con tonos volcánicos', FALSE,
 '{"primary-color": "#ea580c", "dark-bg": "#1c1917", "card-bg": "#292524"}',
 '{"primary": "#ea580c", "bg": "#1c1917", "accent": "#dc2626"}');

-- Insertar plantillas de IA
INSERT INTO plantillas_ia (nombre, descripcion, icono, tipo, modelo, configuracion) VALUES
('GPT-4 Assistant', 'Asistente inteligente basado en GPT-4', 'fa-brain', 'gpt', 'gpt-4', '{"temperature": 0.7, "max_tokens": 2000}'),
('Claude Analyst', 'Analista de datos con Claude', 'fa-chart-line', 'claude', 'claude-3-opus', '{"temperature": 0.5, "max_tokens": 4000}'),
('Code Generator', 'Generador de código especializado', 'fa-code', 'gpt', 'gpt-4-turbo', '{"temperature": 0.2, "max_tokens": 3000}'),
('Document Processor', 'Procesador de documentos con IA', 'fa-file-alt', 'claude', 'claude-3-sonnet', '{"temperature": 0.3}'),
('Email Composer', 'Compositor de emails profesionales', 'fa-envelope', 'gpt', 'gpt-4', '{"temperature": 0.6}'),
('Data Extractor', 'Extractor de datos estructurados', 'fa-database', 'gpt', 'gpt-4-turbo', '{"temperature": 0.1}'),
('Translation Expert', 'Traductor multilingüe avanzado', 'fa-language', 'gpt', 'gpt-4', '{"temperature": 0.3}'),
('Summarizer Pro', 'Resumidor de textos largos', 'fa-compress-alt', 'claude', 'claude-3-haiku', '{"temperature": 0.4}'),
('Creative Writer', 'Escritor creativo para contenido', 'fa-pen-fancy', 'gpt', 'gpt-4', '{"temperature": 0.9}'),
('Q&A Expert', 'Experto en preguntas y respuestas', 'fa-question-circle', 'claude', 'claude-3-opus', '{"temperature": 0.5}'),
('Sentiment Analyzer', 'Analizador de sentimientos', 'fa-smile', 'gpt', 'gpt-4-turbo', '{"temperature": 0.2}'),
('Report Generator', 'Generador de reportes automáticos', 'fa-file-invoice', 'claude', 'claude-3-sonnet', '{"temperature": 0.4}');

-- Insertar plantillas de agentes
INSERT INTO plantillas_agentes (nombre, descripcion, icono, categoria, capacidades) VALUES
('Web Scraper Agent', 'Agente especializado en extracción de datos web', 'fa-spider', 'extraccion', '["scraping", "parsing", "data-extraction"]'),
('Form Filler Agent', 'Agente para autocompletar formularios', 'fa-edit', 'automatizacion', '["form-filling", "validation", "submission"]'),
('Email Automation Agent', 'Agente para gestión de correos', 'fa-mail-bulk', 'comunicacion', '["email-reading", "email-sending", "filtering"]'),
('File Manager Agent', 'Agente para gestión de archivos', 'fa-folder-open', 'archivos', '["file-move", "file-copy", "file-rename", "file-delete"]'),
('Excel Processor Agent', 'Agente para procesamiento de Excel', 'fa-file-excel', 'datos', '["excel-read", "excel-write", "formulas", "pivot-tables"]'),
('PDF Handler Agent', 'Agente para manipulación de PDFs', 'fa-file-pdf', 'documentos', '["pdf-read", "pdf-merge", "pdf-split", "pdf-extract"]'),
('Browser Navigator Agent', 'Agente para navegación web automatizada', 'fa-globe', 'navegacion', '["click", "type", "scroll", "wait", "screenshot"]'),
('API Integration Agent', 'Agente para integraciones API REST', 'fa-plug', 'integracion', '["api-get", "api-post", "api-put", "api-delete", "authentication"]'),
('Database Agent', 'Agente para operaciones de base de datos', 'fa-database', 'datos', '["query", "insert", "update", "delete", "backup"]'),
('Notification Agent', 'Agente para envío de notificaciones', 'fa-bell', 'comunicacion', '["slack", "teams", "email", "sms", "push"]'),
('Report Builder Agent', 'Agente para generación de reportes', 'fa-chart-bar', 'reportes', '["data-aggregation", "chart-generation", "pdf-export"]'),
('Monitoring Agent', 'Agente para monitoreo de sistemas', 'fa-eye', 'monitoreo', '["health-check", "alert", "log-analysis", "performance"]');

-- Insertar configuraciones del sistema por defecto
INSERT INTO configuraciones_sistema (clave, valor, tipo, categoria, descripcion) VALUES
('app_nombre', 'Alqvimia RPA 2.0', 'string', 'general', 'Nombre de la aplicación'),
('app_version', '2.0.0', 'string', 'general', 'Versión actual de la aplicación'),
('tema_default', 'midnight-blue', 'string', 'apariencia', 'Tema por defecto del sistema'),
('idioma_default', 'es', 'string', 'general', 'Idioma por defecto'),
('max_workflows_por_usuario', '50', 'number', 'limites', 'Máximo de workflows por usuario'),
('max_ejecuciones_paralelas', '5', 'number', 'ejecucion', 'Máximo de ejecuciones paralelas'),
('tiempo_sesion_minutos', '480', 'number', 'seguridad', 'Tiempo de sesión en minutos'),
('habilitar_registro', 'true', 'boolean', 'seguridad', 'Permitir registro de nuevos usuarios'),
('nivel_log', 'info', 'string', 'sistema', 'Nivel de logging del sistema'),
('backup_automatico', 'true', 'boolean', 'sistema', 'Habilitar backups automáticos'),
('intervalo_backup_horas', '24', 'number', 'sistema', 'Intervalo de backups en horas'),
('notificaciones_email', 'true', 'boolean', 'notificaciones', 'Habilitar notificaciones por email'),
('mcp_server_url', 'http://localhost:8080', 'string', 'mcp', 'URL del servidor MCP'),
('socket_reconexion_intentos', '5', 'number', 'conexion', 'Intentos de reconexión del socket'),
('recorder_screenshot', 'true', 'boolean', 'recorder', 'Capturar screenshots al grabar');

-- Insertar usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt.hash('admin123', 10)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@alqvimia.local', '$2b$10$KVr6lUq3Kb1ryug7c5aUlumatw.s6uSLRqg4TsiWfIf81uBQZI0b2', 'admin');

-- Insertar configuración del usuario admin
INSERT INTO configuraciones_usuario (usuario_id, tema, idioma) VALUES
(1, 'midnight-blue', 'es');

-- =====================================================
-- TABLA: configuraciones_ocr
-- Configuraciones de proveedores OCR
-- =====================================================
CREATE TABLE IF NOT EXISTS configuraciones_ocr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    provider ENUM('tesseract', 'azure', 'google', 'aws') DEFAULT 'tesseract',
    api_key_encrypted TEXT,
    endpoint VARCHAR(255),
    region VARCHAR(50),
    idiomas_preferidos JSON,
    configuracion_adicional JSON,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_provider (provider),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: documentos_procesados
-- Documentos procesados por IDP
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos_procesados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    usuario_id INT,
    tipo_documento ENUM('factura', 'contrato', 'orden_compra', 'formulario', 'recibo', 'identificacion', 'otro') DEFAULT 'otro',
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500),
    tamanio_bytes BIGINT,
    formato VARCHAR(20),
    datos_extraidos JSON,
    confianza_extraccion DECIMAL(5,2),
    estado ENUM('pendiente', 'procesando', 'completado', 'error') DEFAULT 'pendiente',
    ocr_provider VARCHAR(50),
    tiempo_procesamiento_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo_documento),
    INDEX idx_estado (estado),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: process_mining_logs
-- Logs para Process Mining
-- =====================================================
CREATE TABLE IF NOT EXISTS process_mining_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proceso_id VARCHAR(100) NOT NULL,
    caso_id VARCHAR(100) NOT NULL,
    actividad VARCHAR(255) NOT NULL,
    timestamp_inicio DATETIME NOT NULL,
    timestamp_fin DATETIME,
    recurso VARCHAR(100),
    costo DECIMAL(10,2),
    atributos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_proceso (proceso_id),
    INDEX idx_caso (caso_id),
    INDEX idx_actividad (actividad),
    INDEX idx_timestamp (timestamp_inicio)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: task_mining_sesiones
-- Sesiones de Task Mining
-- =====================================================
CREATE TABLE IF NOT EXISTS task_mining_sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    usuario_id INT,
    nombre VARCHAR(150),
    estado ENUM('grabando', 'pausado', 'analizando', 'completado') DEFAULT 'grabando',
    inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fin DATETIME,
    total_acciones INT DEFAULT 0,
    aplicaciones_detectadas JSON,
    patrones_identificados JSON,
    oportunidades_automatizacion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: agentes_autonomos
-- Agentes autónomos configurados
-- =====================================================
CREATE TABLE IF NOT EXISTS agentes_autonomos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    plantilla_id INT,
    usuario_creador_id INT,
    estado ENUM('activo', 'pausado', 'error', 'inactivo') DEFAULT 'inactivo',
    configuracion JSON,
    metricas JSON,
    ultima_ejecucion DATETIME,
    tareas_completadas INT DEFAULT 0,
    tasa_exito DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_agentes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_plantilla (plantilla_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: comunicaciones_mining
-- Datos de Communications Mining
-- =====================================================
CREATE TABLE IF NOT EXISTS comunicaciones_mining (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('email', 'chat', 'llamada', 'ticket') NOT NULL,
    fuente VARCHAR(100),
    remitente VARCHAR(255),
    destinatario VARCHAR(255),
    asunto VARCHAR(500),
    contenido TEXT,
    fecha_comunicacion DATETIME,
    sentimiento ENUM('positivo', 'neutral', 'negativo') DEFAULT 'neutral',
    puntuacion_sentimiento DECIMAL(3,2),
    topicos JSON,
    entidades_extraidas JSON,
    intencion VARCHAR(100),
    urgencia ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    tiempo_respuesta_minutos INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_sentimiento (sentimiento),
    INDEX idx_fecha (fecha_comunicacion),
    FULLTEXT INDEX ft_contenido (asunto, contenido)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: test_suites
-- Suites de pruebas automatizadas
-- =====================================================
CREATE TABLE IF NOT EXISTS test_suites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    usuario_id INT,
    tipo ENUM('unit', 'integration', 'e2e', 'regression') DEFAULT 'unit',
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: test_cases
-- Casos de prueba
-- =====================================================
CREATE TABLE IF NOT EXISTS test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suite_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    pasos JSON,
    resultado_esperado TEXT,
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (suite_id) REFERENCES test_suites(id) ON DELETE CASCADE,
    INDEX idx_suite (suite_id),
    INDEX idx_prioridad (prioridad)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: test_results
-- Resultados de ejecución de pruebas
-- =====================================================
CREATE TABLE IF NOT EXISTS test_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_case_id INT NOT NULL,
    suite_id INT NOT NULL,
    estado ENUM('passed', 'failed', 'skipped', 'error') NOT NULL,
    duracion_ms INT,
    mensaje_error TEXT,
    screenshots JSON,
    logs TEXT,
    ejecutado_por INT,
    fecha_ejecucion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (suite_id) REFERENCES test_suites(id) ON DELETE CASCADE,
    FOREIGN KEY (ejecutado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_test_case (test_case_id),
    INDEX idx_suite (suite_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_ejecucion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: archivos_codigo
-- Archivos del editor de código
-- =====================================================
CREATE TABLE IF NOT EXISTS archivos_codigo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    usuario_id INT,
    nombre VARCHAR(255) NOT NULL,
    extension VARCHAR(20),
    lenguaje VARCHAR(50),
    contenido LONGTEXT,
    carpeta_id INT,
    es_plantilla BOOLEAN DEFAULT FALSE,
    compartido BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_lenguaje (lenguaje)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: historial_ia
-- Historial de interacciones con IA
-- =====================================================
CREATE TABLE IF NOT EXISTS historial_ia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    plantilla_id INT,
    prompt TEXT NOT NULL,
    respuesta LONGTEXT,
    tokens_entrada INT,
    tokens_salida INT,
    tiempo_respuesta_ms INT,
    contexto JSON,
    satisfaccion INT CHECK (satisfaccion >= 1 AND satisfaccion <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_ia(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: carpetas_workflow
-- Carpetas para organizar workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS carpetas_workflow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    usuario_id INT,
    carpeta_padre_id INT,
    color VARCHAR(20) DEFAULT '#3b82f6',
    icono VARCHAR(50) DEFAULT 'fa-folder',
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (carpeta_padre_id) REFERENCES carpetas_workflow(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_padre (carpeta_padre_id)
) ENGINE=InnoDB;

-- Agregar columna de carpeta a workflows
ALTER TABLE workflows ADD COLUMN carpeta_id INT DEFAULT NULL;
ALTER TABLE workflows ADD FOREIGN KEY (carpeta_id) REFERENCES carpetas_workflow(id) ON DELETE SET NULL;

-- Insertar configuraciones adicionales
INSERT INTO configuraciones_sistema (clave, valor, tipo, categoria, descripcion) VALUES
('ocr_provider_default', 'tesseract', 'string', 'ocr', 'Proveedor OCR por defecto'),
('ocr_idiomas_default', '["es", "en", "pt"]', 'json', 'ocr', 'Idiomas OCR por defecto'),
('process_mining_enabled', 'true', 'boolean', 'ai', 'Habilitar Process Mining'),
('task_mining_enabled', 'true', 'boolean', 'ai', 'Habilitar Task Mining'),
('idp_enabled', 'true', 'boolean', 'ai', 'Habilitar IDP'),
('agentes_autonomos_max', '10', 'number', 'ai', 'Máximo de agentes autónomos'),
('test_suite_enabled', 'true', 'boolean', 'testing', 'Habilitar Test Suite'),
('communications_mining_enabled', 'true', 'boolean', 'ai', 'Habilitar Communications Mining'),
('idiomas_disponibles', '["es", "en", "pt"]', 'json', 'general', 'Idiomas disponibles en el sistema');

-- =====================================================
-- TABLA: programaciones_workflow
-- Programaciones (Scheduler) de workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS programaciones_workflow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    workflow_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo_programacion ENUM('once', 'daily', 'weekly', 'monthly', 'cron') DEFAULT 'once',
    expresion_cron VARCHAR(100),
    hora_ejecucion TIME,
    dias_semana JSON,
    dia_mes INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    ultima_ejecucion DATETIME,
    proxima_ejecucion DATETIME,
    ejecuciones_totales INT DEFAULT 0,
    ejecuciones_exitosas INT DEFAULT 0,
    ejecuciones_fallidas INT DEFAULT 0,
    notificar_email BOOLEAN DEFAULT FALSE,
    email_notificacion VARCHAR(255),
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_workflow (workflow_id),
    INDEX idx_activo (activo),
    INDEX idx_proxima (proxima_ejecucion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: agentes_exe
-- Ejecutables generados de agentes
-- =====================================================
CREATE TABLE IF NOT EXISTS agentes_exe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agente_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamanio_bytes BIGINT,
    version VARCHAR(20) DEFAULT '1.0.0',
    incluye_runtime BOOLEAN DEFAULT TRUE,
    auto_start BOOLEAN DEFAULT FALSE,
    iniciar_minimizado BOOLEAN DEFAULT TRUE,
    generar_logs BOOLEAN DEFAULT TRUE,
    icono_personalizado VARCHAR(500),
    checksum VARCHAR(64),
    generado_por INT,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_ejecucion DATETIME,
    ejecuciones_totales INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agente_id) REFERENCES agentes_autonomos(id) ON DELETE CASCADE,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_agente (agente_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: workflows_exportados
-- Historial de exportaciones de workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows_exportados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    formato ENUM('wfl', 'alqzip', 'json') DEFAULT 'wfl',
    tamanio_bytes BIGINT,
    workflows_incluidos INT DEFAULT 1,
    checksum VARCHAR(64),
    usuario_id INT,
    fecha_exportacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ruta_archivo VARCHAR(500),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_exportacion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: workflows_importados
-- Historial de importaciones de workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows_importados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre_archivo_original VARCHAR(255) NOT NULL,
    formato ENUM('wfl', 'alqzip', 'json') DEFAULT 'wfl',
    workflows_importados INT DEFAULT 1,
    usuario_id INT,
    fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    workflows_ids JSON,
    errores JSON,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_importacion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: elementos_grabados
-- Elementos capturados por el recorder con variables
-- =====================================================
CREATE TABLE IF NOT EXISTS elementos_grabados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id VARCHAR(36) NOT NULL,
    nombre_variable VARCHAR(100) NOT NULL,
    tipo_elemento VARCHAR(50),
    tipo_accion VARCHAR(50),
    selector_css TEXT,
    xpath TEXT,
    texto_elemento TEXT,
    coordenadas JSON,
    imagen_base64 LONGTEXT,
    ventana_handle VARCHAR(50),
    proceso_nombre VARCHAR(100),
    configuracion JSON,
    orden INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sesion (sesion_id),
    INDEX idx_variable (nombre_variable)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: archivos_wfl
-- Archivos .wfl guardados
-- =====================================================
CREATE TABLE IF NOT EXISTS archivos_wfl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    workflow_id INT,
    contenido_encoded LONGTEXT NOT NULL,
    checksum VARCHAR(64),
    version_formato VARCHAR(20) DEFAULT '2.0',
    tamanio_bytes BIGINT,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_workflow (workflow_id),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- Insertar configuraciones adicionales del scheduler y agentes
INSERT INTO configuraciones_sistema (clave, valor, tipo, categoria, descripcion) VALUES
('scheduler_enabled', 'true', 'boolean', 'scheduler', 'Habilitar programador de workflows'),
('scheduler_max_concurrent', '5', 'number', 'scheduler', 'Máximo de ejecuciones programadas concurrentes'),
('scheduler_retry_on_failure', 'true', 'boolean', 'scheduler', 'Reintentar ejecuciones fallidas'),
('scheduler_max_retries', '3', 'number', 'scheduler', 'Máximo de reintentos'),
('agents_exe_path', 'C:\\Alqvimia\\Agents', 'string', 'agents', 'Ruta por defecto para ejecutables'),
('agents_max_exe', '20', 'number', 'agents', 'Máximo de ejecutables por usuario'),
('export_format_default', 'wfl', 'string', 'export', 'Formato de exportación por defecto'),
('import_validate_checksum', 'true', 'boolean', 'import', 'Validar checksum al importar'),
('recorder_highlight_color', '#22c55e', 'string', 'recorder', 'Color de resaltado del recorder'),
('recorder_auto_variable_name', 'true', 'boolean', 'recorder', 'Generar nombres de variable automáticamente');

-- =====================================================
-- TABLA: api_keys_ia
-- API Keys encriptadas para servicios de IA
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    provider ENUM('anthropic', 'openai', 'google', 'azure', 'cohere', 'mistral') NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    nombre VARCHAR(100) DEFAULT 'Default',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_uso DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_provider (provider),
    INDEX idx_usuario (usuario_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: uso_api_ia
-- Tracking de uso de APIs de IA (tokens, costos)
-- =====================================================
CREATE TABLE IF NOT EXISTS uso_api_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    api_key_id INT,
    provider ENUM('anthropic', 'openai', 'google', 'azure', 'cohere', 'mistral') NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    endpoint VARCHAR(100),
    tokens_entrada INT DEFAULT 0,
    tokens_salida INT DEFAULT 0,
    tokens_total INT DEFAULT 0,
    costo_estimado DECIMAL(10, 6) DEFAULT 0,
    tiempo_respuesta_ms INT DEFAULT 0,
    estado ENUM('success', 'error', 'timeout') DEFAULT 'success',
    error_mensaje TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (api_key_id) REFERENCES api_keys_ia(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_provider (provider),
    INDEX idx_modelo (modelo),
    INDEX idx_fecha (created_at),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: costos_modelos_ia
-- Precios por token de cada modelo (actualizable)
-- =====================================================
CREATE TABLE IF NOT EXISTS costos_modelos_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider ENUM('anthropic', 'openai', 'google', 'azure', 'cohere', 'mistral') NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    costo_input_por_millon DECIMAL(10, 4) NOT NULL COMMENT 'Costo por millón de tokens de entrada en USD',
    costo_output_por_millon DECIMAL(10, 4) NOT NULL COMMENT 'Costo por millón de tokens de salida en USD',
    max_tokens INT DEFAULT 4096,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider_modelo (provider, modelo),
    INDEX idx_provider (provider)
) ENGINE=InnoDB;

-- Insertar precios de modelos de Anthropic (Enero 2025)
INSERT INTO costos_modelos_ia (provider, modelo, costo_input_por_millon, costo_output_por_millon, max_tokens) VALUES
('anthropic', 'claude-3-5-sonnet-20241022', 3.00, 15.00, 8192),
('anthropic', 'claude-3-5-haiku-20241022', 0.80, 4.00, 8192),
('anthropic', 'claude-3-opus-20240229', 15.00, 75.00, 4096),
('anthropic', 'claude-3-sonnet-20240229', 3.00, 15.00, 4096),
('anthropic', 'claude-3-haiku-20240307', 0.25, 1.25, 4096),
('openai', 'gpt-4-turbo', 10.00, 30.00, 4096),
('openai', 'gpt-4o', 5.00, 15.00, 4096),
('openai', 'gpt-4o-mini', 0.15, 0.60, 16384),
('openai', 'gpt-3.5-turbo', 0.50, 1.50, 4096);

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
