/**
 * ALQVIMIA RPA 2.0 - Agent Marketplace
 * Centro de descarga, instalación y gestión de agentes modulares
 */

import { useState, useEffect } from 'react'

function AgentMarketplace({ onClose }) {
  // Estado principal
  const [activeTab, setActiveTab] = useState('marketplace') // marketplace, installed, running
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState(null)

  // Estado de operaciones
  const [installing, setInstalling] = useState({})
  const [downloadProgress, setDownloadProgress] = useState({})

  // Estado de modales
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [agentToConfig, setAgentToConfig] = useState(null)

  // Categorías de agentes
  const categories = [
    { id: 'all', name: 'Todos', icon: 'fa-th-large' },
    { id: 'database', name: 'Bases de Datos', icon: 'fa-database' },
    { id: 'api', name: 'APIs & Integraciones', icon: 'fa-plug' },
    { id: 'messaging', name: 'Mensajería', icon: 'fa-comments' },
    { id: 'ai', name: 'IA & ML', icon: 'fa-brain' },
    { id: 'payments', name: 'Pagos', icon: 'fa-credit-card' },
    { id: 'storage', name: 'Almacenamiento', icon: 'fa-hdd' },
    { id: 'automation', name: 'Automatización', icon: 'fa-robot' },
    { id: 'crm', name: 'CRM & ERP', icon: 'fa-users' },
    { id: 'monitoring', name: 'Monitoreo', icon: 'fa-chart-line' }
  ]

  // Catálogo de agentes disponibles
  const [agents, setAgents] = useState([
    // Database Agents
    {
      id: 'agent-mysql',
      name: 'MySQL Agent',
      category: 'database',
      version: '2.0.0',
      description: 'Agente para conexión, queries y gestión de bases de datos MySQL/MariaDB',
      author: 'Alqvimia Team',
      downloads: 15420,
      rating: 4.8,
      size: '12.4 MB',
      icon: 'fa-database',
      color: '#4479A1',
      status: 'installed',
      installed: true,
      running: true,
      port: 4101,
      capabilities: ['query', 'schema', 'backup', 'restore', 'monitoring', 'transactions'],
      requirements: ['Node.js 18+', 'MySQL Client'],
      config: {
        host: 'localhost',
        port: 3307,
        database: 'alqvimia_rpa'
      }
    },
    {
      id: 'agent-postgresql',
      name: 'PostgreSQL Agent',
      category: 'database',
      version: '2.0.0',
      description: 'Agente completo para PostgreSQL con soporte para extensiones, replicación y funciones',
      author: 'Alqvimia Team',
      downloads: 12350,
      rating: 4.9,
      size: '14.2 MB',
      icon: 'fa-database',
      color: '#336791',
      status: 'installed',
      installed: true,
      running: false,
      port: 4102,
      capabilities: ['query', 'schema', 'backup', 'replication', 'extensions', 'functions', 'triggers'],
      requirements: ['Node.js 18+', 'PostgreSQL Client']
    },
    {
      id: 'agent-mongodb',
      name: 'MongoDB Agent',
      category: 'database',
      version: '2.0.0',
      description: 'Agente para bases de datos NoSQL MongoDB con aggregations, índices y watch',
      author: 'Alqvimia Team',
      downloads: 8920,
      rating: 4.7,
      size: '11.8 MB',
      icon: 'fa-leaf',
      color: '#47A248',
      status: 'installed',
      installed: true,
      running: false,
      port: 4103,
      capabilities: ['find', 'aggregate', 'insert', 'update', 'delete', 'indexes', 'watch'],
      requirements: ['Node.js 18+', 'MongoDB']
    },
    {
      id: 'agent-redis',
      name: 'Redis Agent',
      category: 'database',
      version: '1.0.5',
      description: 'Agente para Redis cache/store con pub/sub, streams y estructuras de datos',
      author: 'Alqvimia Team',
      downloads: 7650,
      rating: 4.6,
      size: '8.2 MB',
      icon: 'fa-bolt',
      color: '#DC382D',
      status: 'installed',
      installed: true,
      running: false,
      port: 4104,
      capabilities: ['get', 'set', 'hash', 'list', 'set', 'sorted-set', 'pub-sub', 'streams'],
      requirements: ['Node.js 18+', 'Redis Server']
    },
    {
      id: 'agent-sqlite',
      name: 'SQLite Agent',
      category: 'database',
      version: '1.0.0',
      description: 'Agente para bases de datos SQLite embebidas',
      author: 'Alqvimia Team',
      downloads: 5230,
      rating: 4.5,
      size: '6.4 MB',
      icon: 'fa-database',
      color: '#003B57',
      status: 'available',
      installed: false,
      running: false,
      capabilities: ['query', 'schema', 'backup', 'transactions'],
      requirements: ['Node.js 18+']
    },

    // API Agents
    {
      id: 'agent-rest',
      name: 'REST API Agent',
      category: 'api',
      version: '2.0.0',
      description: 'Cliente HTTP completo con soporte para OAuth, rate limiting y retry',
      author: 'Alqvimia Team',
      downloads: 25680,
      rating: 4.9,
      size: '8.5 MB',
      icon: 'fa-cloud',
      color: '#FF6B6B',
      status: 'installed',
      installed: true,
      running: true,
      port: 4201,
      capabilities: ['http-client', 'oauth', 'webhooks', 'rate-limit', 'cache', 'retry'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-graphql',
      name: 'GraphQL Agent',
      category: 'api',
      version: '1.5.2',
      description: 'Cliente GraphQL con introspección, subscriptions y cache inteligente',
      author: 'Alqvimia Team',
      downloads: 6780,
      rating: 4.6,
      size: '9.2 MB',
      icon: 'fa-project-diagram',
      color: '#E535AB',
      status: 'available',
      installed: false,
      running: false,
      port: 4202,
      capabilities: ['queries', 'mutations', 'subscriptions', 'introspection'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-websocket',
      name: 'WebSocket Agent',
      category: 'api',
      version: '1.3.0',
      description: 'Agente para comunicación bidireccional en tiempo real',
      author: 'Alqvimia Team',
      downloads: 5430,
      rating: 4.5,
      size: '6.8 MB',
      icon: 'fa-bolt',
      color: '#10B981',
      status: 'available',
      installed: false,
      running: false,
      port: 4203,
      capabilities: ['connect', 'subscribe', 'broadcast', 'rooms'],
      requirements: ['Node.js 18+']
    },

    // Messaging Agents
    {
      id: 'agent-whatsapp',
      name: 'WhatsApp Business Agent',
      category: 'messaging',
      version: '2.0.0',
      description: 'Integración completa con WhatsApp Business API para mensajería masiva',
      author: 'Alqvimia Team',
      downloads: 18920,
      rating: 4.8,
      size: '15.6 MB',
      icon: 'fa-whatsapp',
      iconBrand: true,
      color: '#25D366',
      status: 'installed',
      installed: true,
      running: true,
      port: 4301,
      capabilities: ['send', 'receive', 'templates', 'media', 'webhooks', 'bulk', 'contacts'],
      requirements: ['Node.js 18+', 'WhatsApp Business Account']
    },
    {
      id: 'agent-telegram',
      name: 'Telegram Bot Agent',
      category: 'messaging',
      version: '2.0.0',
      description: 'Bot de Telegram con comandos, inline queries, keyboards y media',
      author: 'Alqvimia Team',
      downloads: 9450,
      rating: 4.7,
      size: '10.2 MB',
      icon: 'fa-telegram',
      iconBrand: true,
      color: '#0088CC',
      status: 'installed',
      installed: true,
      running: false,
      port: 4302,
      capabilities: ['messages', 'commands', 'inline', 'keyboards', 'media', 'groups', 'channels', 'polls'],
      requirements: ['Node.js 18+', 'Telegram Bot Token']
    },
    {
      id: 'agent-slack',
      name: 'Slack Agent',
      category: 'messaging',
      version: '2.0.0',
      description: 'Integración con Slack para mensajes, canales, modals y slash commands',
      author: 'Alqvimia Team',
      downloads: 7820,
      rating: 4.6,
      size: '11.4 MB',
      icon: 'fa-slack',
      iconBrand: true,
      color: '#4A154B',
      status: 'installed',
      installed: true,
      running: false,
      port: 4304,
      capabilities: ['messages', 'channels', 'users', 'files', 'reactions', 'threads', 'blocks', 'modals', 'slash-commands'],
      requirements: ['Node.js 18+', 'Slack App']
    },
    {
      id: 'agent-email',
      name: 'Email Agent',
      category: 'messaging',
      version: '2.0.0',
      description: 'Envío de emails con SMTP, templates HTML y attachments',
      author: 'Alqvimia Team',
      downloads: 12340,
      rating: 4.5,
      size: '9.8 MB',
      icon: 'fa-envelope',
      color: '#1A82E2',
      status: 'installed',
      installed: true,
      running: false,
      port: 4303,
      capabilities: ['send', 'send-html', 'templates', 'attachments', 'bulk', 'tracking'],
      requirements: ['Node.js 18+', 'SMTP Server']
    },
    {
      id: 'agent-discord',
      name: 'Discord Bot Agent',
      category: 'messaging',
      version: '1.0.0',
      description: 'Bot de Discord con comandos, embeds, reactions y voice',
      author: 'Alqvimia Team',
      downloads: 6520,
      rating: 4.5,
      size: '12.1 MB',
      icon: 'fa-discord',
      iconBrand: true,
      color: '#5865F2',
      status: 'available',
      installed: false,
      running: false,
      port: 4305,
      capabilities: ['messages', 'commands', 'embeds', 'reactions', 'voice', 'threads'],
      requirements: ['Node.js 18+', 'Discord Bot Token']
    },
    {
      id: 'agent-twilio',
      name: 'Twilio SMS Agent',
      category: 'messaging',
      version: '1.0.0',
      description: 'Envío de SMS y llamadas con Twilio',
      author: 'Alqvimia Team',
      downloads: 5890,
      rating: 4.6,
      size: '8.5 MB',
      icon: 'fa-sms',
      color: '#F22F46',
      status: 'available',
      installed: false,
      running: false,
      port: 4306,
      capabilities: ['sms', 'mms', 'voice', 'verify', 'lookup'],
      requirements: ['Node.js 18+', 'Twilio Account']
    },

    // AI Agents
    {
      id: 'agent-openai',
      name: 'OpenAI GPT Agent',
      category: 'ai',
      version: '2.0.0',
      description: 'Integración con GPT-4o, DALL-E 3, Whisper, embeddings y vision',
      author: 'Alqvimia Team',
      downloads: 28450,
      rating: 4.9,
      size: '18.2 MB',
      icon: 'fa-robot',
      color: '#412991',
      status: 'installed',
      installed: true,
      running: true,
      port: 4401,
      capabilities: ['chat', 'completion', 'embeddings', 'images', 'speech', 'vision', 'functions', 'assistants'],
      requirements: ['Node.js 18+', 'OpenAI API Key']
    },
    {
      id: 'agent-claude',
      name: 'Claude AI Agent',
      category: 'ai',
      version: '2.0.0',
      description: 'Integración con Claude 3.5 de Anthropic para chat, vision y tools',
      author: 'Alqvimia Team',
      downloads: 15680,
      rating: 4.8,
      size: '16.5 MB',
      icon: 'fa-brain',
      color: '#D77544',
      status: 'installed',
      installed: true,
      running: false,
      port: 4402,
      capabilities: ['chat', 'completion', 'vision', 'tools', 'streaming', 'system-prompts'],
      requirements: ['Node.js 18+', 'Anthropic API Key']
    },
    {
      id: 'agent-gemini',
      name: 'Google Gemini Agent',
      category: 'ai',
      version: '1.0.0',
      description: 'Integración con Google Gemini Pro para chat multimodal',
      author: 'Alqvimia Team',
      downloads: 8920,
      rating: 4.6,
      size: '14.2 MB',
      icon: 'fa-google',
      iconBrand: true,
      color: '#4285F4',
      status: 'available',
      installed: false,
      running: false,
      port: 4403,
      capabilities: ['chat', 'vision', 'embeddings', 'function-calling'],
      requirements: ['Node.js 18+', 'Google AI API Key']
    },
    {
      id: 'agent-ollama',
      name: 'Ollama Local LLM Agent',
      category: 'ai',
      version: '1.2.0',
      description: 'Ejecuta modelos LLM localmente con Ollama (Llama, Mistral, etc)',
      author: 'Alqvimia Team',
      downloads: 8920,
      rating: 4.7,
      size: '8.4 MB',
      icon: 'fa-server',
      color: '#000000',
      status: 'available',
      installed: false,
      running: false,
      port: 4404,
      capabilities: ['chat', 'embeddings', 'local-models', 'streaming'],
      requirements: ['Ollama installed']
    },
    {
      id: 'agent-huggingface',
      name: 'Hugging Face Agent',
      category: 'ai',
      version: '1.0.0',
      description: 'Acceso a miles de modelos de ML en Hugging Face Hub',
      author: 'Alqvimia Team',
      downloads: 6540,
      rating: 4.5,
      size: '10.8 MB',
      icon: 'fa-smile',
      color: '#FFD21E',
      status: 'available',
      installed: false,
      running: false,
      port: 4405,
      capabilities: ['inference', 'embeddings', 'nlp', 'vision', 'audio'],
      requirements: ['Node.js 18+', 'Hugging Face API Key']
    },

    // Payments Agents
    {
      id: 'agent-stripe',
      name: 'Stripe Payment Agent',
      category: 'payments',
      version: '2.0.0',
      description: 'Integración completa con Stripe para pagos, suscripciones y checkout',
      author: 'Alqvimia Team',
      downloads: 14230,
      rating: 4.8,
      size: '12.5 MB',
      icon: 'fa-credit-card',
      color: '#635BFF',
      status: 'installed',
      installed: true,
      running: false,
      port: 4501,
      capabilities: ['charges', 'customers', 'subscriptions', 'invoices', 'products', 'prices', 'checkout', 'refunds', 'webhooks'],
      requirements: ['Node.js 18+', 'Stripe API Key']
    },
    {
      id: 'agent-paypal',
      name: 'PayPal Agent',
      category: 'payments',
      version: '1.0.0',
      description: 'Integración con PayPal para pagos y checkout',
      author: 'Alqvimia Team',
      downloads: 8760,
      rating: 4.5,
      size: '10.2 MB',
      icon: 'fa-paypal',
      iconBrand: true,
      color: '#003087',
      status: 'available',
      installed: false,
      running: false,
      port: 4502,
      capabilities: ['payments', 'checkout', 'subscriptions', 'refunds', 'webhooks'],
      requirements: ['Node.js 18+', 'PayPal API Credentials']
    },
    {
      id: 'agent-mercadopago',
      name: 'MercadoPago Agent',
      category: 'payments',
      version: '1.0.0',
      description: 'Integración con MercadoPago para pagos en LATAM',
      author: 'Alqvimia Team',
      downloads: 6540,
      rating: 4.6,
      size: '9.8 MB',
      icon: 'fa-money-bill-wave',
      color: '#009EE3',
      status: 'available',
      installed: false,
      running: false,
      port: 4503,
      capabilities: ['payments', 'checkout', 'qr', 'subscriptions', 'refunds'],
      requirements: ['Node.js 18+', 'MercadoPago Access Token']
    },

    // Storage Agents
    {
      id: 'agent-s3',
      name: 'Amazon S3 Agent',
      category: 'storage',
      version: '2.0.0',
      description: 'Gestión de archivos en Amazon S3 con presigned URLs y lifecycle',
      author: 'Alqvimia Team',
      downloads: 11230,
      rating: 4.7,
      size: '10.8 MB',
      icon: 'fa-aws',
      iconBrand: true,
      color: '#FF9900',
      status: 'installed',
      installed: true,
      running: false,
      port: 4601,
      capabilities: ['upload', 'download', 'list', 'delete', 'copy', 'presigned-urls', 'buckets', 'metadata'],
      requirements: ['Node.js 18+', 'AWS Credentials']
    },
    {
      id: 'agent-gcs',
      name: 'Google Cloud Storage Agent',
      category: 'storage',
      version: '1.0.0',
      description: 'Almacenamiento en Google Cloud Storage',
      author: 'Alqvimia Team',
      downloads: 7890,
      rating: 4.6,
      size: '11.2 MB',
      icon: 'fa-google',
      iconBrand: true,
      color: '#4285F4',
      status: 'available',
      installed: false,
      running: false,
      port: 4602,
      capabilities: ['upload', 'download', 'list', 'signed-urls', 'buckets'],
      requirements: ['Node.js 18+', 'Google Service Account']
    },
    {
      id: 'agent-azure-blob',
      name: 'Azure Blob Storage Agent',
      category: 'storage',
      version: '1.0.0',
      description: 'Almacenamiento en Azure Blob Storage',
      author: 'Alqvimia Team',
      downloads: 6540,
      rating: 4.5,
      size: '10.5 MB',
      icon: 'fa-microsoft',
      iconBrand: true,
      color: '#0078D4',
      status: 'available',
      installed: false,
      running: false,
      port: 4603,
      capabilities: ['upload', 'download', 'list', 'sas-tokens', 'containers'],
      requirements: ['Node.js 18+', 'Azure Connection String']
    },
    {
      id: 'agent-gdrive',
      name: 'Google Drive Agent',
      category: 'storage',
      version: '1.3.0',
      description: 'Sincronización y gestión de archivos en Google Drive',
      author: 'Alqvimia Team',
      downloads: 9870,
      rating: 4.6,
      size: '11.2 MB',
      icon: 'fa-google-drive',
      iconBrand: true,
      color: '#34A853',
      status: 'available',
      installed: false,
      running: false,
      port: 4604,
      capabilities: ['upload', 'download', 'share', 'sync', 'search'],
      requirements: ['Node.js 18+', 'Google OAuth']
    },
    {
      id: 'agent-dropbox',
      name: 'Dropbox Agent',
      category: 'storage',
      version: '1.0.0',
      description: 'Integración con Dropbox para sincronización de archivos',
      author: 'Alqvimia Team',
      downloads: 5430,
      rating: 4.4,
      size: '9.8 MB',
      icon: 'fa-dropbox',
      iconBrand: true,
      color: '#0061FF',
      status: 'available',
      installed: false,
      running: false,
      port: 4605,
      capabilities: ['upload', 'download', 'share', 'sync', 'search'],
      requirements: ['Node.js 18+', 'Dropbox App']
    },

    // Automation Agents
    {
      id: 'agent-scheduler',
      name: 'Task Scheduler Agent',
      category: 'automation',
      version: '1.8.0',
      description: 'Programador de tareas con cron, intervalos y triggers de eventos',
      author: 'Alqvimia Team',
      downloads: 19870,
      rating: 4.8,
      size: '7.2 MB',
      icon: 'fa-clock',
      color: '#F59E0B',
      status: 'installed',
      installed: true,
      running: true,
      port: 4701,
      capabilities: ['cron', 'intervals', 'triggers', 'retries', 'queues'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-scraper',
      name: 'Web Scraper Agent',
      category: 'automation',
      version: '1.5.0',
      description: 'Extracción de datos web con Puppeteer y selectores inteligentes',
      author: 'Alqvimia Team',
      downloads: 14560,
      rating: 4.6,
      size: '45.8 MB',
      icon: 'fa-spider',
      color: '#8B5CF6',
      status: 'available',
      installed: false,
      running: false,
      port: 4702,
      capabilities: ['scrape', 'screenshot', 'pdf', 'automation', 'stealth'],
      requirements: ['Node.js 18+', 'Chromium']
    },
    {
      id: 'agent-workflow',
      name: 'Workflow Engine Agent',
      category: 'automation',
      version: '2.0.0',
      description: 'Motor de workflows visuales con nodos, condiciones y loops',
      author: 'Alqvimia Team',
      downloads: 22340,
      rating: 4.9,
      size: '14.6 MB',
      icon: 'fa-sitemap',
      color: '#EC4899',
      status: 'installed',
      installed: true,
      running: true,
      port: 4703,
      capabilities: ['visual-editor', 'conditions', 'loops', 'parallel', 'subflows'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-n8n',
      name: 'n8n Connector Agent',
      category: 'automation',
      version: '1.0.0',
      description: 'Conecta con workflows de n8n para automatizaciones complejas',
      author: 'Alqvimia Team',
      downloads: 4560,
      rating: 4.5,
      size: '8.2 MB',
      icon: 'fa-link',
      color: '#EA4B71',
      status: 'available',
      installed: false,
      running: false,
      port: 4704,
      capabilities: ['trigger', 'webhook', 'execute', 'sync'],
      requirements: ['Node.js 18+', 'n8n Instance']
    },

    // CRM Agents
    {
      id: 'agent-salesforce',
      name: 'Salesforce Agent',
      category: 'crm',
      version: '1.0.0',
      description: 'Integración con Salesforce CRM para leads, contactos y oportunidades',
      author: 'Alqvimia Team',
      downloads: 8920,
      rating: 4.7,
      size: '14.5 MB',
      icon: 'fa-salesforce',
      iconBrand: true,
      color: '#00A1E0',
      status: 'available',
      installed: false,
      running: false,
      port: 4801,
      capabilities: ['leads', 'contacts', 'accounts', 'opportunities', 'reports', 'soql'],
      requirements: ['Node.js 18+', 'Salesforce Connected App']
    },
    {
      id: 'agent-hubspot',
      name: 'HubSpot Agent',
      category: 'crm',
      version: '1.0.0',
      description: 'Integración con HubSpot CRM, Marketing y Sales',
      author: 'Alqvimia Team',
      downloads: 7650,
      rating: 4.6,
      size: '12.3 MB',
      icon: 'fa-hubspot',
      iconBrand: true,
      color: '#FF7A59',
      status: 'available',
      installed: false,
      running: false,
      port: 4802,
      capabilities: ['contacts', 'companies', 'deals', 'tickets', 'emails', 'workflows'],
      requirements: ['Node.js 18+', 'HubSpot API Key']
    },

    // Monitoring Agents
    {
      id: 'agent-metrics',
      name: 'Metrics Collector Agent',
      category: 'monitoring',
      version: '1.2.0',
      description: 'Recolección de métricas del sistema, aplicaciones y servicios',
      author: 'Alqvimia Team',
      downloads: 7650,
      rating: 4.5,
      size: '8.9 MB',
      icon: 'fa-chart-bar',
      color: '#06B6D4',
      status: 'installed',
      installed: true,
      running: true,
      port: 4901,
      capabilities: ['system', 'custom', 'prometheus', 'alerts', 'dashboards'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-logs',
      name: 'Log Aggregator Agent',
      category: 'monitoring',
      version: '1.1.5',
      description: 'Centralización y análisis de logs de todos los agentes',
      author: 'Alqvimia Team',
      downloads: 6540,
      rating: 4.4,
      size: '9.4 MB',
      icon: 'fa-file-alt',
      color: '#64748B',
      status: 'available',
      installed: false,
      running: false,
      port: 4902,
      capabilities: ['collect', 'parse', 'search', 'alerts', 'retention'],
      requirements: ['Node.js 18+']
    },
    {
      id: 'agent-prometheus',
      name: 'Prometheus Agent',
      category: 'monitoring',
      version: '1.0.0',
      description: 'Exporta métricas en formato Prometheus para monitoreo',
      author: 'Alqvimia Team',
      downloads: 5430,
      rating: 4.5,
      size: '7.8 MB',
      icon: 'fa-fire',
      color: '#E6522C',
      status: 'available',
      installed: false,
      running: false,
      port: 4903,
      capabilities: ['metrics', 'scrape', 'alerts', 'recording-rules'],
      requirements: ['Node.js 18+', 'Prometheus Server']
    }
  ])

  // Agentes instalados
  const installedAgents = agents.filter(a => a.installed)
  const runningAgents = agents.filter(a => a.running)

  // Filtrar agentes
  const getFilteredAgents = () => {
    let result = [...agents]

    if (activeTab === 'installed') {
      result = result.filter(a => a.installed)
    } else if (activeTab === 'running') {
      result = result.filter(a => a.running)
    }

    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.capabilities.some(c => c.toLowerCase().includes(term))
      )
    }

    return result
  }

  // Instalar agente
  const installAgent = async (agent) => {
    setInstalling(prev => ({ ...prev, [agent.id]: true }))
    setDownloadProgress(prev => ({ ...prev, [agent.id]: 0 }))

    // Simular descarga
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200))
      setDownloadProgress(prev => ({ ...prev, [agent.id]: i }))
    }

    // Actualizar estado
    setAgents(prev => prev.map(a =>
      a.id === agent.id
        ? { ...a, installed: true, status: 'installed' }
        : a
    ))

    setInstalling(prev => ({ ...prev, [agent.id]: false }))
    setDownloadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[agent.id]
      return newProgress
    })
  }

  // Desinstalar agente
  const uninstallAgent = (agent) => {
    if (agent.running) {
      stopAgent(agent)
    }
    setAgents(prev => prev.map(a =>
      a.id === agent.id
        ? { ...a, installed: false, running: false, status: 'available' }
        : a
    ))
  }

  // Iniciar agente
  const startAgent = (agent) => {
    setAgents(prev => prev.map(a =>
      a.id === agent.id
        ? { ...a, running: true, status: 'running' }
        : a
    ))
  }

  // Detener agente
  const stopAgent = (agent) => {
    setAgents(prev => prev.map(a =>
      a.id === agent.id
        ? { ...a, running: false, status: 'installed' }
        : a
    ))
  }

  // Abrir configuración
  const openConfig = (agent) => {
    setAgentToConfig(agent)
    setShowConfigModal(true)
  }

  // Renderizar tarjeta de agente
  const renderAgentCard = (agent) => {
    const isInstalling = installing[agent.id]
    const progress = downloadProgress[agent.id]

    return (
      <div key={agent.id} className={`agent-card ${agent.running ? 'running' : ''}`}>
        <div className="agent-header">
          <div className="agent-icon" style={{ background: agent.color }}>
            <i className={`${agent.iconBrand ? 'fab' : 'fas'} ${agent.icon}`}></i>
          </div>
          <div className="agent-status-badge">
            {agent.running ? (
              <span className="status running"><i className="fas fa-circle"></i> Ejecutando</span>
            ) : agent.installed ? (
              <span className="status installed"><i className="fas fa-check"></i> Instalado</span>
            ) : (
              <span className="status available"><i className="fas fa-download"></i> Disponible</span>
            )}
          </div>
        </div>

        <div className="agent-info">
          <h3>{agent.name}</h3>
          <span className="agent-version">v{agent.version}</span>
          <p className="agent-description">{agent.description}</p>

          <div className="agent-meta">
            <span><i className="fas fa-download"></i> {agent.downloads.toLocaleString()}</span>
            <span><i className="fas fa-star"></i> {agent.rating}</span>
            <span><i className="fas fa-weight"></i> {agent.size}</span>
          </div>

          <div className="agent-capabilities">
            {agent.capabilities.slice(0, 4).map(cap => (
              <span key={cap} className="capability">{cap}</span>
            ))}
            {agent.capabilities.length > 4 && (
              <span className="capability more">+{agent.capabilities.length - 4}</span>
            )}
          </div>
        </div>

        {isInstalling && (
          <div className="install-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>Instalando... {progress}%</span>
          </div>
        )}

        <div className="agent-actions">
          {agent.running ? (
            <>
              <button className="btn btn-danger" onClick={() => stopAgent(agent)}>
                <i className="fas fa-stop"></i> Detener
              </button>
              <button className="btn btn-secondary" onClick={() => openConfig(agent)}>
                <i className="fas fa-cog"></i>
              </button>
              <button className="btn btn-secondary" onClick={() => setShowLogsModal(true)}>
                <i className="fas fa-terminal"></i>
              </button>
            </>
          ) : agent.installed ? (
            <>
              <button className="btn btn-success" onClick={() => startAgent(agent)}>
                <i className="fas fa-play"></i> Iniciar
              </button>
              <button className="btn btn-secondary" onClick={() => openConfig(agent)}>
                <i className="fas fa-cog"></i>
              </button>
              <button className="btn btn-secondary" onClick={() => uninstallAgent(agent)}>
                <i className="fas fa-trash"></i>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => installAgent(agent)}
              disabled={isInstalling}
            >
              <i className="fas fa-download"></i> Instalar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="agent-marketplace-overlay">
      <div className="agent-marketplace">
        {/* Header */}
        <div className="marketplace-header">
          <div className="header-title">
            <i className="fas fa-store"></i>
            <div>
              <h2>Agent Marketplace</h2>
              <span>Descarga, instala y gestiona agentes modulares</span>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="value">{agents.length}</span>
              <span className="label">Disponibles</span>
            </div>
            <div className="stat">
              <span className="value">{installedAgents.length}</span>
              <span className="label">Instalados</span>
            </div>
            <div className="stat highlight">
              <span className="value">{runningAgents.length}</span>
              <span className="label">Ejecutando</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="marketplace-tabs">
          <button
            className={`tab ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            <i className="fas fa-store"></i> Marketplace
          </button>
          <button
            className={`tab ${activeTab === 'installed' ? 'active' : ''}`}
            onClick={() => setActiveTab('installed')}
          >
            <i className="fas fa-box"></i> Instalados
            <span className="badge">{installedAgents.length}</span>
          </button>
          <button
            className={`tab ${activeTab === 'running' ? 'active' : ''}`}
            onClick={() => setActiveTab('running')}
          >
            <i className="fas fa-play-circle"></i> En Ejecución
            <span className="badge running">{runningAgents.length}</span>
          </button>
        </div>

        <div className="marketplace-content">
          {/* Sidebar - Categorías */}
          <div className="marketplace-sidebar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar agentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="categories">
              <h4>Categorías</h4>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <i className={`fas ${cat.icon}`}></i>
                  <span>{cat.name}</span>
                  <span className="count">
                    {cat.id === 'all'
                      ? agents.length
                      : agents.filter(a => a.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h4>Acciones Rápidas</h4>
              <button className="action-btn">
                <i className="fas fa-sync"></i> Actualizar Todo
              </button>
              <button className="action-btn">
                <i className="fas fa-play"></i> Iniciar Todos
              </button>
              <button className="action-btn danger">
                <i className="fas fa-stop"></i> Detener Todos
              </button>
            </div>
          </div>

          {/* Main - Grid de Agentes */}
          <div className="marketplace-main">
            <div className="agents-header">
              <h3>
                {activeTab === 'marketplace' && 'Agentes Disponibles'}
                {activeTab === 'installed' && 'Agentes Instalados'}
                {activeTab === 'running' && 'Agentes en Ejecución'}
              </h3>
              <span className="count">{getFilteredAgents().length} agentes</span>
            </div>

            <div className="agents-grid">
              {getFilteredAgents().length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-box-open"></i>
                  <h3>No hay agentes</h3>
                  <p>No se encontraron agentes que coincidan con tu búsqueda</p>
                </div>
              ) : (
                getFilteredAgents().map(agent => renderAgentCard(agent))
              )}
            </div>
          </div>
        </div>

        {/* Config Modal */}
        {showConfigModal && agentToConfig && (
          <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
            <div className="modal-content agent-config-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ background: agentToConfig.color }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`${agentToConfig.iconBrand ? 'fab' : 'fas'} ${agentToConfig.icon}`}></i>
                  <div>
                    <h3>{agentToConfig.name}</h3>
                    <span>Configuración del agente</span>
                  </div>
                </div>
                <button className="close-modal" onClick={() => setShowConfigModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {/* Agent Status */}
                <div className="config-section">
                  <h4>Estado</h4>
                  <div className="status-info">
                    <div className="status-item">
                      <span className="label">Estado:</span>
                      <span className={`value ${agentToConfig.running ? 'running' : ''}`}>
                        {agentToConfig.running ? 'Ejecutando' : 'Detenido'}
                      </span>
                    </div>
                    {agentToConfig.port && (
                      <div className="status-item">
                        <span className="label">Puerto:</span>
                        <span className="value">{agentToConfig.port}</span>
                      </div>
                    )}
                    <div className="status-item">
                      <span className="label">Versión:</span>
                      <span className="value">v{agentToConfig.version}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Config */}
                <div className="config-section">
                  <h4>Configuración de Conexión</h4>
                  {agentToConfig.config ? (
                    <div className="config-fields">
                      {Object.entries(agentToConfig.config).map(([key, value]) => (
                        <div key={key} className="form-group">
                          <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                          <input
                            type={key.includes('password') || key.includes('secret') ? 'password' : 'text'}
                            className="form-control"
                            defaultValue={value}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-config">Este agente no requiere configuración adicional</p>
                  )}
                </div>

                {/* Capabilities */}
                <div className="config-section">
                  <h4>Capacidades</h4>
                  <div className="capabilities-grid">
                    {agentToConfig.capabilities.map(cap => (
                      <div key={cap} className="capability-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="config-section">
                  <h4>Requisitos</h4>
                  <ul className="requirements-list">
                    {agentToConfig.requirements.map(req => (
                      <li key={req}><i className="fas fa-check"></i> {req}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-save"></i> Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Modal */}
        {showLogsModal && (
          <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
            <div className="modal-content logs-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-terminal"></i> Logs del Agente</h3>
                <button className="close-modal" onClick={() => setShowLogsModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="logs-container">
                  <div className="log-line info">[2024-12-28 10:32:15] INFO: Agent started on port 4101</div>
                  <div className="log-line info">[2024-12-28 10:32:16] INFO: Connected to database</div>
                  <div className="log-line success">[2024-12-28 10:32:17] SUCCESS: Health check passed</div>
                  <div className="log-line info">[2024-12-28 10:35:22] INFO: Received query request</div>
                  <div className="log-line info">[2024-12-28 10:35:23] INFO: Query executed in 45ms</div>
                  <div className="log-line warn">[2024-12-28 10:40:01] WARN: High memory usage detected</div>
                  <div className="log-line info">[2024-12-28 10:45:00] INFO: Scheduled cleanup completed</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary">
                  <i className="fas fa-download"></i> Exportar Logs
                </button>
                <button className="btn btn-secondary">
                  <i className="fas fa-trash"></i> Limpiar
                </button>
                <button className="btn btn-primary" onClick={() => setShowLogsModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentMarketplace
