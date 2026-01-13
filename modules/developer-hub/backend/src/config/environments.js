/**
 * Developer Hub - Environment Configurations
 * DEV / QA / PROD
 */

export const environments = {
  development: {
    id: 'dev',
    name: 'Development',
    shortName: 'DEV',
    color: '#22c55e', // green
    icon: 'code',
    description: 'Entorno de desarrollo local',
    database: {
      host: process.env.DEV_DB_HOST || 'localhost',
      port: process.env.DEV_DB_PORT || 3306,
      name: process.env.DEV_DB_NAME || 'alqvimia_dev',
      user: process.env.DEV_DB_USER || 'dev_user',
      password: process.env.DEV_DB_PASSWORD || 'dev_password'
    },
    api: {
      baseUrl: process.env.DEV_API_URL || 'http://localhost:4000',
      timeout: 30000
    },
    features: {
      hotReload: true,
      debugMode: true,
      mockData: true,
      logging: 'verbose',
      errorDetails: true
    },
    limits: {
      maxExecutions: 1000,
      maxAgents: 10,
      maxWorkflows: 50
    }
  },

  qa: {
    id: 'qa',
    name: 'Quality Assurance',
    shortName: 'QA',
    color: '#f59e0b', // amber
    icon: 'flask',
    description: 'Entorno de pruebas y staging',
    database: {
      host: process.env.QA_DB_HOST || 'qa-db.alqvimia.local',
      port: process.env.QA_DB_PORT || 3306,
      name: process.env.QA_DB_NAME || 'alqvimia_qa',
      user: process.env.QA_DB_USER || 'qa_user',
      password: process.env.QA_DB_PASSWORD || ''
    },
    api: {
      baseUrl: process.env.QA_API_URL || 'https://qa-api.alqvimia.com',
      timeout: 30000
    },
    features: {
      hotReload: false,
      debugMode: true,
      mockData: false,
      logging: 'debug',
      errorDetails: true
    },
    limits: {
      maxExecutions: 10000,
      maxAgents: 25,
      maxWorkflows: 100
    }
  },

  production: {
    id: 'prod',
    name: 'Production',
    shortName: 'PROD',
    color: '#ef4444', // red
    icon: 'rocket',
    description: 'Entorno de producción',
    database: {
      host: process.env.PROD_DB_HOST || 'prod-db.alqvimia.com',
      port: process.env.PROD_DB_PORT || 3306,
      name: process.env.PROD_DB_NAME || 'alqvimia_prod',
      user: process.env.PROD_DB_USER || 'prod_user',
      password: process.env.PROD_DB_PASSWORD || ''
    },
    api: {
      baseUrl: process.env.PROD_API_URL || 'https://api.alqvimia.com',
      timeout: 15000
    },
    features: {
      hotReload: false,
      debugMode: false,
      mockData: false,
      logging: 'info',
      errorDetails: false
    },
    limits: {
      maxExecutions: -1, // unlimited
      maxAgents: -1,
      maxWorkflows: -1
    }
  },

  test: {
    id: 'test',
    name: 'Test',
    shortName: 'TEST',
    color: '#8b5cf6', // purple
    icon: 'vial',
    description: 'Entorno de tests automatizados',
    database: {
      host: 'localhost',
      port: 3306,
      name: 'alqvimia_test',
      user: 'test_user',
      password: 'test_password'
    },
    api: {
      baseUrl: 'http://localhost:4000',
      timeout: 5000
    },
    features: {
      hotReload: false,
      debugMode: true,
      mockData: true,
      logging: 'silent',
      errorDetails: true
    },
    limits: {
      maxExecutions: 100,
      maxAgents: 5,
      maxWorkflows: 10
    }
  }
}

export const getCurrentEnvironment = () => {
  const env = process.env.NODE_ENV || 'development'
  return environments[env] || environments.development
}

export const getEnvironmentById = (id) => {
  return Object.values(environments).find(e => e.id === id)
}

export default environments
