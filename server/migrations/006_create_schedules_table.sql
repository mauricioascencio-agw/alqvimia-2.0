-- =====================================================
-- ALQVIMIA RPA 2.0 - Migración: Tabla de Schedules
-- Fecha: 2025-01-13
-- Descripción: Crea las tablas para el programador de tareas
-- =====================================================

-- Tabla principal de schedules
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    agente_id INT,
    workflow_id INT,
    tipo ENUM('recurring', 'webhook', 'on_demand', 'one_time') DEFAULT 'recurring',
    configuracion JSON,
    opciones JSON,
    horario_activo JSON,
    cron_expression VARCHAR(100),
    estado ENUM('activo', 'inactivo', 'pausado', 'error') DEFAULT 'activo',
    template_id VARCHAR(100),
    proxima_ejecucion DATETIME,
    ultima_ejecucion DATETIME,
    ejecuciones_totales INT DEFAULT 0,
    ejecuciones_exitosas INT DEFAULT 0,
    ejecuciones_fallidas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (agente_id) REFERENCES agentes(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,

    INDEX idx_schedules_estado (estado),
    INDEX idx_schedules_agente (agente_id),
    INDEX idx_schedules_workflow (workflow_id),
    INDEX idx_schedules_tipo (tipo),
    INDEX idx_schedules_proxima (proxima_ejecucion)
);

-- Tabla de ejecuciones de schedules
CREATE TABLE IF NOT EXISTS schedule_executions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    tipo ENUM('automatico', 'manual', 'webhook') DEFAULT 'automatico',
    estado ENUM('pendiente', 'ejecutando', 'completado', 'fallido', 'cancelado') DEFAULT 'pendiente',
    inicio DATETIME,
    fin DATETIME,
    duracion_ms INT,
    resultado JSON,
    logs TEXT,
    error_mensaje TEXT,
    triggered_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,

    INDEX idx_schedule_exec_schedule (schedule_id),
    INDEX idx_schedule_exec_estado (estado),
    INDEX idx_schedule_exec_inicio (inicio)
);

-- Tabla de configuraciones de notificaciones de schedules
CREATE TABLE IF NOT EXISTS schedule_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    evento ENUM('on_start', 'on_success', 'on_failure', 'on_warning') NOT NULL,
    canal ENUM('email', 'whatsapp', 'webhook', 'slack') NOT NULL,
    destinatario VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,

    INDEX idx_schedule_notif_schedule (schedule_id)
);

-- Insertar schedules predeterminados basados en plantillas SAT
INSERT INTO schedules (uuid, nombre, descripcion, tipo, configuracion, opciones, horario_activo, cron_expression, estado, template_id) VALUES
(UUID(), 'Monitoreo Buzon Tributario', 'Monitoreo 24/7 del Buzon Tributario SAT', 'recurring',
 '{"frequency":"hourly","interval":1,"timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":3,"retryDelay":300000,"timeout":300000,"notifyOnError":true}',
 '{"enabled":false}',
 '0 * * * *', 'inactivo', 'schedule_sat_buzon'),

(UUID(), 'Asistente CFDI 4.0', 'Validacion pre-timbrado y seguimiento de complementos de pago', 'recurring',
 '{"frequency":"daily","runAt":"08:00","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":2,"retryDelay":600000,"timeout":180000,"notifyOnError":true}',
 '{"enabled":true,"diasSemana":[1,2,3,4,5],"horaInicio":"08:00","horaFin":"18:00"}',
 '0 8 * * *', 'inactivo', 'schedule_sat_cfdi'),

(UUID(), 'Calendario Fiscal Inteligente', 'Recordatorios personalizados de obligaciones fiscales', 'recurring',
 '{"frequency":"daily","runAt":"07:00","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":2,"retryDelay":300000,"timeout":60000,"notifyOnError":true}',
 '{"enabled":true,"diasSemana":[1,2,3,4,5],"horaInicio":"07:00","horaFin":"09:00"}',
 '0 7 * * *', 'inactivo', 'schedule_sat_calendario'),

(UUID(), 'Administrador DIOT', 'Validacion y generacion de DIOT mensual', 'recurring',
 '{"frequency":"monthly","dayOfMonth":20,"runAt":"09:00","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":3,"retryDelay":600000,"timeout":300000,"notifyOnError":true,"notifyOnSuccess":true}',
 '{"enabled":false}',
 '0 9 20 * *', 'inactivo', 'schedule_sat_diot'),

(UUID(), 'Gestor Contabilidad Electronica', 'Generacion y validacion de balanzas de comprobacion', 'recurring',
 '{"frequency":"monthly","dayOfMonth":1,"runAt":"08:00","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":3,"retryDelay":600000,"timeout":300000,"notifyOnError":true,"notifyOnSuccess":true}',
 '{"enabled":false}',
 '0 8 1 * *', 'inactivo', 'schedule_sat_contabilidad');

-- Insertar schedules predeterminados para Retail
INSERT INTO schedules (uuid, nombre, descripcion, tipo, configuracion, opciones, horario_activo, cron_expression, estado, template_id) VALUES
(UUID(), 'Atencion a Clientes 24/7', 'Chatbot omnicanal para atencion de clientes', 'webhook',
 '{"triggerEvent":"message_received","channels":["whatsapp","web"],"enabled":true}',
 '{"retryOnFailure":false,"timeout":30000,"notifyOnError":true}',
 '{"enabled":false}',
 NULL, 'inactivo', 'schedule_retail_atencion'),

(UUID(), 'Seguimiento de Pedidos', 'Monitoreo automatico de estados de pedidos', 'recurring',
 '{"frequency":"interval","interval":15,"unit":"minutes","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":2,"retryDelay":60000,"timeout":120000,"notifyOnError":true}',
 '{"enabled":true,"diasSemana":[0,1,2,3,4,5,6],"horaInicio":"06:00","horaFin":"23:00"}',
 '*/15 * * * *', 'inactivo', 'schedule_retail_pedidos'),

(UUID(), 'Recuperacion Carritos Abandonados', 'Deteccion y recuperacion de carritos abandonados', 'recurring',
 '{"frequency":"hourly","runAt":"00:30","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":2,"retryDelay":300000,"timeout":180000,"notifyOnError":true}',
 '{"enabled":true,"diasSemana":[0,1,2,3,4,5,6],"horaInicio":"08:00","horaFin":"22:00"}',
 '30 * * * *', 'inactivo', 'schedule_retail_carritos'),

(UUID(), 'Validacion Prenomina', 'Validacion automatica de prenomina quincenal', 'recurring',
 '{"frequency":"biweekly","daysOfMonth":[1,16],"runAt":"06:00","timezone":"America/Mexico_City","enabled":true}',
 '{"retryOnFailure":true,"maxRetries":3,"retryDelay":600000,"timeout":300000,"notifyOnError":true,"notifyOnSuccess":true}',
 '{"enabled":false}',
 '0 6 1,16 * *', 'inactivo', 'schedule_retail_prenomina');
