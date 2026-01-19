/**
 * Plantillas de Programacion para Agentes Alqvimia RPA 2.0
 *
 * Define las configuraciones de scheduling predeterminadas
 * para cada tipo de agente SAT y Retail
 */

const scheduleTemplates = {
  // ==================== AGENTES SAT ====================

  sat_buzon_tributario: {
    id: 'schedule_sat_buzon',
    nombre: 'Monitoreo Buzon Tributario',
    agente: 'sat-buzon-tributario',
    workflow: 'wf_sat_buzon_tributario',
    descripcion: 'Monitoreo 24/7 del Buzon Tributario SAT',
    tipo: 'recurring',
    configuracion: {
      frequency: 'hourly',
      interval: 1,
      runAt: '00:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 300000, // 5 minutos
      timeout: 300000,    // 5 minutos
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: false, // Corre 24/7
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      horaInicio: '00:00',
      horaFin: '23:59'
    }
  },

  sat_cfdi_asistente: {
    id: 'schedule_sat_cfdi',
    nombre: 'Asistente CFDI 4.0',
    agente: 'sat-cfdi-asistente',
    workflow: 'wf_sat_cfdi_asistente',
    descripcion: 'Validacion pre-timbrado y seguimiento de complementos de pago',
    tipo: 'recurring',
    configuracion: {
      frequency: 'daily',
      runAt: '08:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 600000, // 10 minutos
      timeout: 180000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
      horaInicio: '08:00',
      horaFin: '18:00'
    }
  },

  sat_calendario_fiscal: {
    id: 'schedule_sat_calendario',
    nombre: 'Calendario Fiscal Inteligente',
    agente: 'sat-calendario-fiscal',
    workflow: 'wf_sat_calendario_fiscal',
    descripcion: 'Recordatorios personalizados de obligaciones fiscales',
    tipo: 'recurring',
    configuracion: {
      frequency: 'daily',
      runAt: '07:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 300000,
      timeout: 60000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [1, 2, 3, 4, 5],
      horaInicio: '07:00',
      horaFin: '09:00'
    }
  },

  sat_diot: {
    id: 'schedule_sat_diot',
    nombre: 'Administrador DIOT',
    agente: 'sat-diot',
    workflow: 'wf_sat_diot',
    descripcion: 'Validacion y generacion de DIOT mensual',
    tipo: 'recurring',
    configuracion: {
      frequency: 'monthly',
      dayOfMonth: 20,
      runAt: '09:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 600000,
      timeout: 300000,
      notifyOnError: true,
      notifyOnSuccess: true
    },
    horarioActivo: {
      enabled: false
    }
  },

  sat_contabilidad_electronica: {
    id: 'schedule_sat_contabilidad',
    nombre: 'Gestor Contabilidad Electronica',
    agente: 'sat-contabilidad-electronica',
    workflow: 'wf_sat_contabilidad_electronica',
    descripcion: 'Generacion y validacion de balanzas de comprobacion',
    tipo: 'recurring',
    configuracion: {
      frequency: 'monthly',
      dayOfMonth: 1,
      runAt: '08:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 600000,
      timeout: 300000,
      notifyOnError: true,
      notifyOnSuccess: true
    },
    horarioActivo: {
      enabled: false
    }
  },

  // ==================== AGENTES RETAIL ====================

  retail_atencion_clientes: {
    id: 'schedule_retail_atencion',
    nombre: 'Atencion a Clientes 24/7',
    agente: 'retail-atencion-clientes',
    workflow: 'wf_retail_atencion_clientes',
    descripcion: 'Chatbot omnicanal para atencion de clientes',
    tipo: 'webhook',
    configuracion: {
      triggerEvent: 'message_received',
      channels: ['whatsapp', 'web'],
      enabled: true
    },
    opciones: {
      retryOnFailure: false,
      timeout: 30000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: false // 24/7
    }
  },

  retail_seguimiento_pedidos: {
    id: 'schedule_retail_pedidos',
    nombre: 'Seguimiento de Pedidos',
    agente: 'retail-seguimiento-pedidos',
    workflow: 'wf_retail_seguimiento_pedidos',
    descripcion: 'Monitoreo automatico de estados de pedidos',
    tipo: 'recurring',
    configuracion: {
      frequency: 'interval',
      interval: 15,
      unit: 'minutes',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 60000,
      timeout: 120000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      horaInicio: '06:00',
      horaFin: '23:00'
    }
  },

  retail_carritos_abandonados: {
    id: 'schedule_retail_carritos',
    nombre: 'Recuperacion Carritos Abandonados',
    agente: 'retail-carritos-abandonados',
    workflow: 'wf_retail_carritos_abandonados',
    descripcion: 'Deteccion y recuperacion de carritos abandonados',
    tipo: 'recurring',
    configuracion: {
      frequency: 'hourly',
      runAt: '00:30',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 300000,
      timeout: 180000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      horaInicio: '08:00',
      horaFin: '22:00'
    }
  },

  retail_prenomina: {
    id: 'schedule_retail_prenomina',
    nombre: 'Validacion Prenomina',
    agente: 'retail-prenomina',
    workflow: 'wf_retail_prenomina',
    descripcion: 'Validacion automatica de prenomina quincenal',
    tipo: 'recurring',
    configuracion: {
      frequency: 'biweekly',
      daysOfMonth: [1, 16],
      runAt: '06:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 600000,
      timeout: 300000,
      notifyOnError: true,
      notifyOnSuccess: true
    },
    horarioActivo: {
      enabled: false
    }
  },

  retail_ejecutivo_analisis: {
    id: 'schedule_retail_ejecutivo',
    nombre: 'Agente Ejecutivo de Analisis',
    agente: 'retail-ejecutivo-analisis',
    workflow: 'wf_retail_ejecutivo_analisis',
    descripcion: 'Consultas de negocio en lenguaje natural',
    tipo: 'on_demand',
    configuracion: {
      triggerEvent: 'user_query',
      enabled: true
    },
    opciones: {
      timeout: 60000,
      notifyOnError: false,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [1, 2, 3, 4, 5],
      horaInicio: '07:00',
      horaFin: '20:00'
    }
  },

  retail_apertura_cierre: {
    id: 'schedule_retail_apertura_cierre',
    nombre: 'Checklist Apertura/Cierre',
    agente: 'retail-apertura-cierre',
    workflow: 'wf_retail_apertura_cierre',
    descripcion: 'Verificacion automatizada de apertura y cierre de tiendas',
    tipo: 'recurring',
    configuracion: {
      frequency: 'daily',
      runAt: ['06:00', '22:00'], // Apertura y cierre
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 300000,
      timeout: 180000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: false
    }
  },

  retail_inventario: {
    id: 'schedule_retail_inventario',
    nombre: 'Conciliacion de Inventarios',
    agente: 'retail-inventario',
    workflow: 'wf_retail_inventario',
    descripcion: 'Validacion automatica de inventarios contra ERP',
    tipo: 'recurring',
    configuracion: {
      frequency: 'daily',
      runAt: '23:00',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 3,
      retryDelay: 600000,
      timeout: 600000, // 10 minutos
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: false
    }
  },

  retail_surtido_anaqueles: {
    id: 'schedule_retail_surtido',
    nombre: 'Surtido de Anaqueles',
    agente: 'retail-surtido-anaqueles',
    workflow: 'wf_retail_surtido_anaqueles',
    descripcion: 'Alertas de resurtido por nivel de inventario',
    tipo: 'recurring',
    configuracion: {
      frequency: 'interval',
      interval: 4,
      unit: 'hours',
      timezone: 'America/Mexico_City',
      enabled: true
    },
    opciones: {
      retryOnFailure: true,
      maxRetries: 2,
      retryDelay: 300000,
      timeout: 120000,
      notifyOnError: true,
      notifyOnSuccess: false
    },
    horarioActivo: {
      enabled: true,
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      horaInicio: '06:00',
      horaFin: '22:00'
    }
  }
};

/**
 * Obtener todas las plantillas de schedule
 * @returns {Array} Lista de plantillas
 */
function getAllScheduleTemplates() {
  return Object.values(scheduleTemplates);
}

/**
 * Obtener plantillas por categoria
 * @param {string} categoria - 'sat' o 'retail'
 * @returns {Array} Plantillas filtradas
 */
function getSchedulesByCategory(categoria) {
  return Object.values(scheduleTemplates).filter(t =>
    t.agente.startsWith(categoria)
  );
}

/**
 * Obtener plantilla por ID de agente
 * @param {string} agenteId - ID del agente
 * @returns {Object|null} Plantilla o null
 */
function getScheduleByAgent(agenteId) {
  return Object.values(scheduleTemplates).find(t =>
    t.agente === agenteId
  ) || null;
}

/**
 * Obtener plantillas por tipo de trigger
 * @param {string} tipo - 'recurring', 'webhook', 'on_demand'
 * @returns {Array} Plantillas filtradas
 */
function getSchedulesByType(tipo) {
  return Object.values(scheduleTemplates).filter(t => t.tipo === tipo);
}

/**
 * Crear configuracion de cron desde plantilla
 * @param {Object} template - Plantilla de schedule
 * @returns {string} Expresion cron
 */
function templateToCron(template) {
  const config = template.configuracion;

  switch (config.frequency) {
    case 'hourly':
      const minute = config.runAt ? parseInt(config.runAt.split(':')[1]) : 0;
      return `${minute} * * * *`;

    case 'daily':
      const [hour, min] = (config.runAt || '00:00').split(':');
      return `${parseInt(min)} ${parseInt(hour)} * * *`;

    case 'monthly':
      const [mHour, mMin] = (config.runAt || '00:00').split(':');
      return `${parseInt(mMin)} ${parseInt(mHour)} ${config.dayOfMonth} * *`;

    case 'biweekly':
      const [bHour, bMin] = (config.runAt || '00:00').split(':');
      return `${parseInt(bMin)} ${parseInt(bHour)} 1,16 * *`;

    case 'interval':
      if (config.unit === 'minutes') {
        return `*/${config.interval} * * * *`;
      } else if (config.unit === 'hours') {
        return `0 */${config.interval} * * *`;
      }
      return '0 * * * *';

    default:
      return '0 * * * *';
  }
}

/**
 * Validar configuracion de horario activo
 * @param {Object} template - Plantilla de schedule
 * @param {Date} date - Fecha a validar
 * @returns {boolean} Si esta dentro del horario activo
 */
function isWithinActiveHours(template, date = new Date()) {
  const horario = template.horarioActivo;

  if (!horario.enabled) {
    return true; // Sin restriccion de horario
  }

  const diaSemana = date.getDay();
  if (!horario.diasSemana.includes(diaSemana)) {
    return false;
  }

  const horaActual = date.getHours() * 60 + date.getMinutes();
  const [inicioH, inicioM] = horario.horaInicio.split(':').map(Number);
  const [finH, finM] = horario.horaFin.split(':').map(Number);

  const inicio = inicioH * 60 + inicioM;
  const fin = finH * 60 + finM;

  return horaActual >= inicio && horaActual <= fin;
}

module.exports = {
  scheduleTemplates,
  getAllScheduleTemplates,
  getSchedulesByCategory,
  getScheduleByAgent,
  getSchedulesByType,
  templateToCron,
  isWithinActiveHours
};
