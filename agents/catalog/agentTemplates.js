/**
 * ALQVIMIA RPA 2.0 - Catálogo de Plantillas de Agentes
 * Definiciones completas para crear agentes desde la UI
 */

export const agentTemplates = {
  // ============================================
  // AGENTES SAT - CUMPLIMIENTO FISCAL
  // ============================================

  'sat-buzon-tributario': {
    id: 'sat-buzon-tributario',
    name: 'Asistente de Buzón Tributario',
    category: 'fiscal-sat',
    description: 'Monitoreo 24/7 del Buzón Tributario con alertas automáticas vía WhatsApp',
    icon: 'mailbox',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Multas de $3,850 a $11,540 MXN por no monitorear notificaciones SAT',
    businessValue: 'Evita multas y pérdida de plazos para responder requerimientos del SAT',
    capabilities: [
      'Monitoreo 24/7 del Buzón Tributario',
      'Alertas automáticas vía WhatsApp cuando llegan notificaciones',
      'Recordatorios de plazos para responder requerimientos',
      'Clasificación de notificaciones por urgencia',
      'Integración con Zoho/sistemas contables',
      'Respuestas automáticas para acuses de recibo'
    ],
    requirements: [
      { type: 'credential', name: 'RFC del contribuyente', required: true },
      { type: 'credential', name: 'e.firma (FIEL) o CIEC', required: true },
      { type: 'integration', name: 'WhatsApp Business API', required: false },
      { type: 'integration', name: 'Zoho CRM/Books', required: false }
    ],
    deliverables: [
      'Monitoreo automatizado del buzón',
      'Sistema de alertas multicanal',
      'Dashboard de notificaciones',
      'Historial y reportes de compliance'
    ],
    defaultConfig: {
      checkIntervalMinutes: 60,
      whatsappEnabled: true,
      emailEnabled: true,
      urgencyLevels: {
        CRITICAL: 3,
        HIGH: 7,
        MEDIUM: 15,
        LOW: 30
      }
    },
    agentFile: 'sat/BuzonTributarioAgent.js',
    defaultPort: 4350
  },

  'sat-cfdi-asistente': {
    id: 'sat-cfdi-asistente',
    name: 'Asistente CFDI 4.0 y Complemento de Pagos',
    category: 'fiscal-sat',
    description: 'Validación pre-timbrado y recordatorios para complementos de pago',
    icon: 'file-invoice',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Incumplimiento en emisión de complementos de pago (día 10 del mes)',
    businessValue: 'Evita errores de timbrado y multas por complementos de pago tardíos',
    capabilities: [
      'Recordatorios automáticos 5 días antes del día 10',
      'Validación pre-timbrado de datos fiscales (RFC, régimen, CP)',
      'Identificación de facturas pendientes de complemento',
      'Generación automática de reportes de facturas a crédito',
      'Alertas de cancelaciones CFDI fuera de plazo',
      'FAQ inteligente sobre errores comunes CFDI 4.0'
    ],
    requirements: [
      { type: 'integration', name: 'Conexión con PAC/Facturador', required: true },
      { type: 'integration', name: 'Sistema de facturación', required: true },
      { type: 'data', name: 'Dataset de errores CFDI 4.0', required: false }
    ],
    deliverables: [
      'Validador de datos fiscales',
      'Sistema de seguimiento de facturas a crédito',
      'Alertas y recordatorios automatizados',
      'FAQ inteligente de errores'
    ],
    defaultConfig: {
      reminderDaysBefore: 5,
      autoValidateOnTimbrado: true
    },
    agentFile: 'sat/CFDIAsistenteAgent.js',
    defaultPort: 4351
  },

  'sat-contabilidad-electronica': {
    id: 'sat-contabilidad-electronica',
    name: 'Gestor de Contabilidad Electrónica',
    category: 'fiscal-sat',
    description: 'Recordatorios y verificación para envío de balanzas de comprobación',
    icon: 'calculator',
    technologies: ['APA', 'RPA'],
    problemSolved: 'Personas morales deben enviar contabilidad electrónica los primeros 3 días del segundo mes posterior',
    businessValue: 'Automatiza el proceso de envío de contabilidad electrónica al SAT',
    capabilities: [
      'Recordatorios automáticos para envío de balanzas',
      'Verificación de completitud de información',
      'Integración con sistemas contables (CONTPAQi, Aspel)',
      'Generación automática de XML de balanza',
      'Seguimiento de acuses de recepción',
      'Dashboard de compliance por mes'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema contable (CONTPAQi, Aspel, etc.)', required: true },
      { type: 'credential', name: 'e.firma para envío', required: true }
    ],
    deliverables: [
      'Conectores con ERPs contables',
      'Calendario SAT automatizado',
      'Dashboard de compliance mensual'
    ],
    defaultConfig: {
      dueDayMoral: 3,
      dueDayFisica: 5,
      reminderDaysBefore: 5
    },
    agentFile: 'sat/ContabilidadElectronicaAgent.js',
    defaultPort: 4352
  },

  'sat-diot': {
    id: 'sat-diot',
    name: 'Administrador de DIOT',
    category: 'fiscal-sat',
    description: 'Validación y recordatorios para la Declaración Informativa de Operaciones con Terceros',
    icon: 'file-text',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Multas de $9,430 a $18,860 MXN por no presentar DIOT (ahora con 54 campos obligatorios)',
    businessValue: 'Automatiza la validación y presentación de la DIOT',
    capabilities: [
      'Recordatorio mensual 5 días antes del fin de mes',
      'Validación de archivo .TXT antes de carga',
      'Detector de errores comunes (RFC, tasas)',
      'Generación de reportes de operaciones con proveedores',
      'Integración con sistemas de compras',
      'Tutorial interactivo para nueva plataforma DIOT 2025'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema de compras/cuentas por pagar', required: true },
      { type: 'data', name: 'Catálogo de proveedores con RFC', required: true }
    ],
    deliverables: [
      'Dataset de errores DIOT',
      'Validador de formato .TXT',
      'Generador automático de reportes'
    ],
    defaultConfig: {
      reminderDaysBefore: 5,
      validateBeforeUpload: true
    },
    agentFile: 'sat/DIOTAgent.js',
    defaultPort: 4353
  },

  'sat-calendario-fiscal': {
    id: 'sat-calendario-fiscal',
    name: 'Calendario Fiscal Inteligente',
    category: 'fiscal-sat',
    description: 'Dashboard personalizado de obligaciones fiscales con recordatorios automáticos',
    icon: 'calendar',
    technologies: ['APA', 'IA'],
    problemSolved: 'Pérdida de fechas límite de múltiples obligaciones (ISR, IVA, IEPS, DIOT, etc.)',
    businessValue: 'Centraliza todas las obligaciones fiscales en un solo lugar con recordatorios proactivos',
    capabilities: [
      'Dashboard personalizado según régimen fiscal',
      'Recordatorios automáticos vía WhatsApp/Email',
      'Checklist mensual de cumplimiento',
      'Alertas especiales para fechas críticas',
      'Integración con Google Calendar/Outlook',
      'Reportes de cumplimiento para dirección'
    ],
    requirements: [
      { type: 'data', name: 'RFC y régimen fiscal del contribuyente', required: true },
      { type: 'integration', name: 'Calendario Google/Outlook', required: false }
    ],
    deliverables: [
      'Motor de reglas fiscales por régimen',
      'Integración con calendarios',
      'Dashboard de compliance anual'
    ],
    defaultConfig: {
      reminderDays: [7, 3, 1],
      channels: ['whatsapp', 'email']
    },
    agentFile: 'sat/CalendarioFiscalAgent.js',
    defaultPort: 4354
  },

  // ============================================
  // AGENTES RETAIL
  // ============================================

  'retail-analisis-ejecutivo': {
    id: 'retail-analisis-ejecutivo',
    name: 'Agente Ejecutivo de Análisis',
    category: 'retail',
    description: 'Permite a directores consultar el negocio en lenguaje natural',
    icon: 'chart-bar',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Directores necesitan navegar múltiples dashboards para obtener información',
    businessValue: 'Director Virtual que interpreta datos en tiempo real sin necesidad de analistas',
    capabilities: [
      'Consultas en lenguaje natural',
      'Traducción automática a queries BI',
      'Generación de dashboards dinámicos',
      'Conexión con Power BI / Zoho Analytics',
      'Análisis de ventas, merma, quiebre por tienda'
    ],
    requirements: [
      { type: 'integration', name: 'Power BI / Zoho Analytics', required: true },
      { type: 'integration', name: 'API de ERP/POS', required: true },
      { type: 'data', name: 'Diccionario de negocio', required: true }
    ],
    deliverables: [
      'Motor semántico por cliente',
      'Diccionario de negocio',
      'Conectores BI',
      'Panel analítico de volumetría'
    ],
    defaultConfig: {
      supportedBI: ['powerbi', 'zoho', 'metabase'],
      nlpModel: 'gpt-4'
    },
    agentFile: 'retail/AnalisisEjecutivoAgent.js',
    defaultPort: 4361
  },

  'retail-atencion-clientes': {
    id: 'retail-atencion-clientes',
    name: 'Agente de Atención a Clientes',
    category: 'retail',
    description: 'Chatbot omnicanal 24/7 para atención de dudas y soporte',
    icon: 'message-circle',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Alta carga del call center con preguntas repetitivas',
    businessValue: 'Reduce hasta 40% la carga del call center, mejora NPS y tiempos de respuesta',
    capabilities: [
      'Atención 24/7 por WhatsApp y Web',
      'Respuesta a FAQs automatizada',
      'Consulta de status de pedidos',
      'Información de horarios y políticas',
      'Gestión de devoluciones',
      'Escalado inteligente a humanos'
    ],
    requirements: [
      { type: 'integration', name: 'WhatsApp Business API', required: true },
      { type: 'data', name: 'Catálogo de FAQs', required: true },
      { type: 'integration', name: 'Sistema de pedidos/OMS', required: false }
    ],
    deliverables: [
      'Chat omnicanal WA + Web',
      'Base de conocimiento',
      'Flujos configurables'
    ],
    defaultConfig: {
      channels: ['whatsapp', 'web'],
      autoEscalateOnNegativeSentiment: true
    },
    agentFile: 'retail/AtencionClientesAgent.js',
    defaultPort: 4360
  },

  'retail-seguimiento-pedidos': {
    id: 'retail-seguimiento-pedidos',
    name: 'Seguimiento Automático de Pedidos',
    category: 'retail',
    description: 'Envía actualizaciones automáticas del estado de pedidos',
    icon: 'truck',
    technologies: ['RPA', 'IA', 'APA'],
    problemSolved: 'Miles de llamadas de "¿dónde va mi pedido?"',
    businessValue: 'Reduce llamadas al call center y mejora la experiencia del cliente',
    capabilities: [
      'Notificaciones proactivas de estado',
      'Mensajes en lenguaje natural',
      'Conexión con OMS/ERP',
      'Múltiples canales (WhatsApp, SMS, Email)',
      'Tracking en tiempo real'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema OMS/ERP', required: true },
      { type: 'integration', name: 'WhatsApp Business API', required: false }
    ],
    deliverables: [
      'Conector OMS',
      'Flujos de estados',
      'Notificaciones proactivas'
    ],
    defaultConfig: {
      states: ['preparando', 'en_ruta', 'en_punto_entrega', 'entregado'],
      notifyOnStateChange: true
    },
    agentFile: 'retail/SeguimientoPedidosAgent.js',
    defaultPort: 4362
  },

  'retail-carritos-abandonados': {
    id: 'retail-carritos-abandonados',
    name: 'Agente de Carritos Abandonados',
    category: 'retail',
    description: 'Detecta carritos abandonados y envía recordatorios personalizados',
    icon: 'shopping-cart',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Pérdida de ventas por carritos abandonados',
    businessValue: 'Aumenta conversión hasta 20% sin gastar más en ads',
    capabilities: [
      'Detección automática de abandono',
      'Recordatorios personalizados',
      'Recomendaciones IA de productos',
      'Incentivos dinámicos (cupones)',
      'Segmentación de perfiles'
    ],
    requirements: [
      { type: 'integration', name: 'Plataforma e-commerce', required: true },
      { type: 'integration', name: 'WhatsApp/Email', required: true }
    ],
    deliverables: [
      'Detector de abandono',
      'Motor de recomendaciones',
      'Sistema de incentivos'
    ],
    defaultConfig: {
      abandonTimeout: 30, // minutos
      maxReminders: 3,
      incentiveOnSecondReminder: true
    },
    agentFile: 'retail/CarritosAbandonadosAgent.js',
    defaultPort: 4363
  },

  'retail-prenomina': {
    id: 'retail-prenomina',
    name: 'Validación de Prenómina Automática',
    category: 'retail',
    description: 'Analiza horas, retardos e incidencias antes del timbrado de nómina',
    icon: 'clock',
    technologies: ['RPA', 'IA', 'APA'],
    problemSolved: 'Errores en nómina detectados después del timbrado',
    businessValue: 'Reduce tiempo de revisión hasta 70%',
    capabilities: [
      'Lectura automática de archivos de asistencia',
      'Detección de anomalías con IA',
      'Reglas por tienda/contrato',
      'Validación pre-timbrado',
      'Reportes de incidencias'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema de control de asistencia', required: true },
      { type: 'integration', name: 'Sistema de nómina', required: true }
    ],
    deliverables: [
      'Lector de archivos de asistencia',
      'Motor de reglas por contrato',
      'Dashboard de anomalías'
    ],
    defaultConfig: {
      validateBeforeTimbrado: true,
      anomalyThreshold: 0.8
    },
    agentFile: 'retail/PrenominaAgent.js',
    defaultPort: 4364
  },

  'retail-soporte-piso': {
    id: 'retail-soporte-piso',
    name: 'Agente de Soporte Interno a Piso de Venta',
    category: 'retail',
    description: 'Asistente para empleados de tienda sobre políticas, procedimientos y POS',
    icon: 'help-circle',
    technologies: ['IA', 'RPA', 'APA'],
    problemSolved: 'Personal de tienda sin acceso rápido a información operativa',
    businessValue: 'Reduce tiempos de capacitación y errores operativos',
    capabilities: [
      'Consultas de políticas y procedimientos',
      'Guía de operación de caja/POS',
      'Soporte técnico básico',
      'Roles diferenciados (gerente/cajero)',
      'Base de conocimiento actualizable'
    ],
    requirements: [
      { type: 'data', name: 'Manual de políticas y procedimientos', required: true },
      { type: 'data', name: 'Guías de operación POS', required: true }
    ],
    deliverables: [
      'Asistente de consulta',
      'Base de conocimiento',
      'Integración con chat interno'
    ],
    defaultConfig: {
      roles: ['gerente', 'cajero', 'vendedor'],
      multiTenant: true
    },
    agentFile: 'retail/SoportePisoAgent.js',
    defaultPort: 4365
  },

  'retail-checklists': {
    id: 'retail-checklists',
    name: 'Checklists Automáticos de Apertura/Cierre',
    category: 'retail',
    description: 'Checklist digital con captura de evidencia foto/video',
    icon: 'check-square',
    technologies: ['IA', 'RPA', 'APA'],
    problemSolved: 'Falta de evidencia y seguimiento en procesos de apertura/cierre',
    businessValue: 'Asegura cumplimiento de procesos y genera evidencia auditable',
    capabilities: [
      'Checklists digitales por tienda',
      'Captura de evidencia foto/video',
      'Análisis de fotos con IA',
      'Generación de reportes automáticos',
      'Alertas de incumplimiento'
    ],
    requirements: [
      { type: 'data', name: 'Definición de checklists por formato', required: true },
      { type: 'integration', name: 'Almacenamiento de evidencias', required: true }
    ],
    deliverables: [
      'App de checklist',
      'Motor de análisis visual',
      'Dashboard de cumplimiento'
    ],
    defaultConfig: {
      requirePhotoEvidence: true,
      analyzePhotosWithAI: true
    },
    agentFile: 'retail/ChecklistsAgent.js',
    defaultPort: 4366
  },

  'retail-alta-baja-personal': {
    id: 'retail-alta-baja-personal',
    name: 'Alta/Baja de Personal Automatizada',
    category: 'retail',
    description: 'Automatiza la creación y desactivación de accesos en múltiples sistemas',
    icon: 'user-plus',
    technologies: ['RPA', 'APA', 'IA'],
    problemSolved: 'Proceso manual de alta/baja en múltiples sistemas',
    businessValue: 'Reduce tiempo de onboarding y mejora seguridad en bajas',
    capabilities: [
      'Alta automática en Correo, POS, ERP, HRIS',
      'Baja coordinada de accesos',
      'Matriz de roles automática',
      'Validación de documentos con IA',
      'Auditoría de accesos'
    ],
    requirements: [
      { type: 'integration', name: 'Active Directory / Google Workspace', required: true },
      { type: 'integration', name: 'Sistema de nómina/HRIS', required: true },
      { type: 'integration', name: 'POS/ERP', required: true }
    ],
    deliverables: [
      'Flujo automatizado de onboarding',
      'Flujo de offboarding',
      'Dashboard de accesos'
    ],
    defaultConfig: {
      systems: ['email', 'pos', 'erp', 'hris'],
      validateDocuments: true
    },
    agentFile: 'retail/AltaBajaPersonalAgent.js',
    defaultPort: 4367
  },

  'retail-reposicion-anaquel': {
    id: 'retail-reposicion-anaquel',
    name: 'Reposición Automática de Anaquel (CEDIS)',
    category: 'retail',
    description: 'Genera pedidos automáticos basados en ventas, stock y reglas del cliente',
    icon: 'package',
    technologies: ['IA', 'APA', 'RPA'],
    problemSolved: 'Quiebre de inventario por reposición tardía',
    businessValue: 'Optimiza inventario y reduce quiebre de stock',
    capabilities: [
      'Predicción de demanda con IA',
      'Reglas comerciales configurables',
      'Generación automática de pedidos',
      'Integración con ERP para órdenes',
      'Dashboard de abasto'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema ERP', required: true },
      { type: 'data', name: 'Histórico de ventas', required: true },
      { type: 'data', name: 'Inventario actual', required: true }
    ],
    deliverables: [
      'Motor predictivo de demanda',
      'Generador de órdenes automático',
      'Dashboard de abasto'
    ],
    defaultConfig: {
      predictionHorizon: 7, // días
      safetyStockDays: 3
    },
    agentFile: 'retail/ReposicionAnaqueAgent.js',
    defaultPort: 4368
  },

  'retail-conciliacion-inventarios': {
    id: 'retail-conciliacion-inventarios',
    name: 'Conciliación Inventarios ERP/WMS/POS',
    category: 'retail',
    description: 'Cruza información de múltiples sistemas para detectar diferencias',
    icon: 'layers',
    technologies: ['RPA', 'IA', 'APA'],
    problemSolved: 'Diferencias de inventario no detectadas entre sistemas',
    businessValue: 'Reduce merma desconocida y mejora precisión de inventario',
    capabilities: [
      'Extracción automática de ERP, WMS, POS',
      'Detección de anomalías con IA',
      'Reglas de tolerancia configurables',
      'Reportes por tienda/SKU',
      'Alertas de diferencias críticas'
    ],
    requirements: [
      { type: 'integration', name: 'Sistema ERP', required: true },
      { type: 'integration', name: 'Sistema WMS', required: false },
      { type: 'integration', name: 'Sistema POS', required: true }
    ],
    deliverables: [
      'Extractor multi-sistema',
      'Motor de conciliación',
      'Dashboard de diferencias'
    ],
    defaultConfig: {
      tolerancePercentage: 2,
      runFrequency: 'daily'
    },
    agentFile: 'retail/ConciliacionInventariosAgent.js',
    defaultPort: 4369
  }
}

// Categorías de agentes
export const agentCategories = {
  'fiscal-sat': {
    id: 'fiscal-sat',
    name: 'Cumplimiento SAT',
    description: 'Agentes para cumplimiento de obligaciones fiscales mexicanas',
    icon: 'file-text',
    color: '#dc3545'
  },
  'retail': {
    id: 'retail',
    name: 'Retail y Comercio',
    description: 'Agentes para operaciones de retail y comercio',
    icon: 'shopping-bag',
    color: '#28a745'
  },
  'rrhh': {
    id: 'rrhh',
    name: 'Recursos Humanos',
    description: 'Agentes para gestión de capital humano',
    icon: 'users',
    color: '#007bff'
  },
  'finanzas': {
    id: 'finanzas',
    name: 'Finanzas',
    description: 'Agentes para procesos financieros y contables',
    icon: 'dollar-sign',
    color: '#6f42c1'
  }
}

// Obtener agentes por categoría
export function getAgentsByCategory(category) {
  return Object.values(agentTemplates).filter(a => a.category === category)
}

// Obtener todos los agentes
export function getAllAgents() {
  return Object.values(agentTemplates)
}

// Obtener agente por ID
export function getAgentById(id) {
  return agentTemplates[id]
}

export default {
  agentTemplates,
  agentCategories,
  getAgentsByCategory,
  getAllAgents,
  getAgentById
}
