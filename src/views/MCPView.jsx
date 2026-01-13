import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import MCPDashboard from '../components/mcp/MCPDashboard'
import APITester from '../components/mcp/APITester'
import StorageExplorer from '../components/mcp/StorageExplorer'
import MessagingHub from '../components/mcp/MessagingHub'
import '../assets/css/mcp-dashboard.css'
import '../assets/css/api-tester.css'
import '../assets/css/storage-explorer.css'
import '../assets/css/messaging-hub.css'

function MCPView() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showAPITester, setShowAPITester] = useState(false)
  const [showStorageExplorer, setShowStorageExplorer] = useState(false)
  const [showMessagingHub, setShowMessagingHub] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState(null)
  const [showDocsModal, setShowDocsModal] = useState(false)
  const [docsConnector, setDocsConnector] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configConnector, setConfigConnector] = useState(null)
  const [configValues, setConfigValues] = useState({})

  // Configuraciones específicas por conector
  const connectorConfigs = {
    // === BASES DE DATOS ===
    PostgreSQL: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '5432', default: '5432', required: true },
        { name: 'database', label: 'Base de datos', type: 'text', placeholder: 'mydb', required: true },
        { name: 'username', label: 'Usuario', type: 'text', placeholder: 'postgres', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true },
        { name: 'ssl', label: 'SSL', type: 'checkbox', default: false }
      ],
      connectionString: (v) => `postgresql://${v.username}:***@${v.host}:${v.port}/${v.database}`
    },
    MySQL: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '3306', default: '3306', required: true },
        { name: 'database', label: 'Base de datos', type: 'text', placeholder: 'mydb', required: true },
        { name: 'username', label: 'Usuario', type: 'text', placeholder: 'root', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true }
      ],
      connectionString: (v) => `mysql://${v.username}:***@${v.host}:${v.port}/${v.database}`
    },
    MongoDB: {
      fields: [
        { name: 'connectionString', label: 'URI de conexión', type: 'text', placeholder: 'mongodb://localhost:27017', required: true },
        { name: 'database', label: 'Base de datos', type: 'text', placeholder: 'mydb', required: true },
        { name: 'authSource', label: 'Auth Source', type: 'text', placeholder: 'admin' },
        { name: 'replicaSet', label: 'Replica Set', type: 'text', placeholder: '' }
      ]
    },
    Redis: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '6379', default: '6379', required: true },
        { name: 'password', label: 'Contraseña', type: 'password' },
        { name: 'database', label: 'Database Index', type: 'number', placeholder: '0', default: '0' },
        { name: 'tls', label: 'TLS/SSL', type: 'checkbox', default: false }
      ]
    },
    SQLite: {
      fields: [
        { name: 'filepath', label: 'Ruta del archivo', type: 'text', placeholder: '/path/to/database.db', required: true },
        { name: 'readonly', label: 'Solo lectura', type: 'checkbox', default: false }
      ]
    },
    MariaDB: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '3306', default: '3306', required: true },
        { name: 'database', label: 'Base de datos', type: 'text', required: true },
        { name: 'username', label: 'Usuario', type: 'text', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true }
      ]
    },
    Oracle: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '1521', default: '1521', required: true },
        { name: 'serviceName', label: 'Service Name / SID', type: 'text', placeholder: 'ORCL', required: true },
        { name: 'username', label: 'Usuario', type: 'text', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true },
        { name: 'walletLocation', label: 'Wallet Location (Cloud)', type: 'text', placeholder: '/path/to/wallet' }
      ]
    },
    'SQL Server': {
      fields: [
        { name: 'server', label: 'Server', type: 'text', placeholder: 'localhost\\SQLEXPRESS', required: true },
        { name: 'port', label: 'Puerto', type: 'number', placeholder: '1433', default: '1433' },
        { name: 'database', label: 'Base de datos', type: 'text', required: true },
        { name: 'username', label: 'Usuario', type: 'text' },
        { name: 'password', label: 'Contraseña', type: 'password' },
        { name: 'trustedConnection', label: 'Windows Auth', type: 'checkbox', default: false },
        { name: 'encrypt', label: 'Encrypt', type: 'checkbox', default: true }
      ]
    },
    Cassandra: {
      fields: [
        { name: 'contactPoints', label: 'Contact Points', type: 'text', placeholder: 'localhost:9042', required: true },
        { name: 'localDataCenter', label: 'Local Data Center', type: 'text', placeholder: 'datacenter1', required: true },
        { name: 'keyspace', label: 'Keyspace', type: 'text', required: true },
        { name: 'username', label: 'Usuario', type: 'text' },
        { name: 'password', label: 'Contraseña', type: 'password' }
      ]
    },
    DynamoDB: {
      fields: [
        { name: 'region', label: 'AWS Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'sa-east-1'], required: true },
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { name: 'endpoint', label: 'Endpoint (Local)', type: 'text', placeholder: 'http://localhost:8000' }
      ]
    },

    // === APIs ===
    'REST API': {
      fields: [
        { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com/v1', required: true },
        { name: 'authType', label: 'Tipo de Auth', type: 'select', options: ['None', 'API Key', 'Bearer Token', 'Basic Auth', 'OAuth 2.0'], required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', showIf: 'authType=API Key' },
        { name: 'apiKeyHeader', label: 'Header Name', type: 'text', placeholder: 'X-API-Key', showIf: 'authType=API Key' },
        { name: 'bearerToken', label: 'Bearer Token', type: 'password', showIf: 'authType=Bearer Token' },
        { name: 'username', label: 'Usuario', type: 'text', showIf: 'authType=Basic Auth' },
        { name: 'password', label: 'Contraseña', type: 'password', showIf: 'authType=Basic Auth' }
      ]
    },
    GraphQL: {
      fields: [
        { name: 'endpoint', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
        { name: 'authType', label: 'Tipo de Auth', type: 'select', options: ['None', 'Bearer Token', 'API Key'] },
        { name: 'token', label: 'Token', type: 'password' },
        { name: 'wsEndpoint', label: 'WebSocket Endpoint', type: 'text', placeholder: 'wss://api.example.com/graphql' }
      ]
    },
    WebSocket: {
      fields: [
        { name: 'url', label: 'WebSocket URL', type: 'text', placeholder: 'wss://example.com/ws', required: true },
        { name: 'protocols', label: 'Subprotocols', type: 'text', placeholder: 'protocol1, protocol2' },
        { name: 'authToken', label: 'Auth Token', type: 'password' }
      ]
    },

    // === ALMACENAMIENTO ===
    'Amazon S3': {
      fields: [
        { name: 'region', label: 'AWS Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'sa-east-1'], required: true },
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { name: 'endpoint', label: 'Custom Endpoint', type: 'text', placeholder: 'Para S3-compatible' }
      ]
    },
    'Google Cloud Storage': {
      fields: [
        { name: 'projectId', label: 'Project ID', type: 'text', required: true },
        { name: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', required: true },
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true }
      ]
    },
    'Azure Blob': {
      fields: [
        { name: 'accountName', label: 'Storage Account Name', type: 'text', required: true },
        { name: 'accountKey', label: 'Account Key', type: 'password', required: true },
        { name: 'containerName', label: 'Container Name', type: 'text', required: true },
        { name: 'connectionString', label: 'O Connection String', type: 'password' }
      ]
    },
    Dropbox: {
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'appKey', label: 'App Key', type: 'text' },
        { name: 'appSecret', label: 'App Secret', type: 'password' }
      ]
    },
    OneDrive: {
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'common' },
        { name: 'redirectUri', label: 'Redirect URI', type: 'text' }
      ]
    },
    'Google Drive': {
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'refreshToken', label: 'Refresh Token', type: 'password' },
        { name: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea' }
      ]
    },

    // === MENSAJERÍA ===
    'WhatsApp Business': {
      fields: [
        { name: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
        { name: 'accessToken', label: 'Access Token (Meta)', type: 'password', required: true },
        { name: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true },
        { name: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'text' }
      ]
    },
    Slack: {
      fields: [
        { name: 'botToken', label: 'Bot Token (xoxb-...)', type: 'password', required: true },
        { name: 'appToken', label: 'App Token (xapp-...)', type: 'password' },
        { name: 'signingSecret', label: 'Signing Secret', type: 'password', required: true },
        { name: 'defaultChannel', label: 'Default Channel', type: 'text', placeholder: '#general' }
      ]
    },
    'Microsoft Teams': {
      fields: [
        { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'webhookUrl', label: 'Incoming Webhook URL', type: 'text' }
      ]
    },
    Telegram: {
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: '123456:ABC-DEF...' },
        { name: 'chatId', label: 'Default Chat ID', type: 'text' },
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text' }
      ]
    },
    Discord: {
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', required: true },
        { name: 'applicationId', label: 'Application ID', type: 'text', required: true },
        { name: 'guildId', label: 'Guild/Server ID', type: 'text' },
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text' }
      ]
    },
    'Twilio SMS': {
      fields: [
        { name: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { name: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { name: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1234567890', required: true },
        { name: 'messagingServiceSid', label: 'Messaging Service SID', type: 'text' }
      ]
    },
    SendGrid: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { name: 'fromName', label: 'From Name', type: 'text' }
      ]
    },
    Mailchimp: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'serverPrefix', label: 'Server Prefix (us1, us2...)', type: 'text', required: true },
        { name: 'listId', label: 'Default Audience/List ID', type: 'text' }
      ]
    },

    // === IA/ML ===
    'OpenAI GPT': {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'organization', label: 'Organization ID', type: 'text' },
        { name: 'model', label: 'Modelo por defecto', type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], default: 'gpt-4o' },
        { name: 'maxTokens', label: 'Max Tokens', type: 'number', default: '4096' },
        { name: 'temperature', label: 'Temperature', type: 'number', default: '0.7', step: '0.1' }
      ]
    },
    'Claude AI': {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'model', label: 'Modelo', type: 'select', options: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'], default: 'claude-3-5-sonnet-20241022' },
        { name: 'maxTokens', label: 'Max Tokens', type: 'number', default: '4096' }
      ]
    },
    'Google Gemini': {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'model', label: 'Modelo', type: 'select', options: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'], default: 'gemini-1.5-pro' },
        { name: 'projectId', label: 'Project ID (Vertex AI)', type: 'text' },
        { name: 'location', label: 'Location', type: 'text', default: 'us-central1' }
      ]
    },
    'Azure OpenAI': {
      fields: [
        { name: 'endpoint', label: 'Azure Endpoint', type: 'text', placeholder: 'https://xxx.openai.azure.com/', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'deploymentName', label: 'Deployment Name', type: 'text', required: true },
        { name: 'apiVersion', label: 'API Version', type: 'text', default: '2024-02-15-preview' }
      ]
    },
    'Hugging Face': {
      fields: [
        { name: 'apiToken', label: 'API Token', type: 'password', required: true },
        { name: 'model', label: 'Model ID', type: 'text', placeholder: 'mistralai/Mistral-7B-v0.1' },
        { name: 'inferenceEndpoint', label: 'Inference Endpoint', type: 'text' }
      ]
    },
    Ollama: {
      fields: [
        { name: 'baseUrl', label: 'Base URL', type: 'text', default: 'http://localhost:11434', required: true },
        { name: 'model', label: 'Modelo', type: 'text', placeholder: 'llama2, mistral, codellama...' }
      ]
    },
    LangChain: {
      fields: [
        { name: 'llmProvider', label: 'LLM Provider', type: 'select', options: ['OpenAI', 'Anthropic', 'Google', 'Azure', 'Ollama'], required: true },
        { name: 'apiKey', label: 'API Key del Provider', type: 'password', required: true },
        { name: 'langsmithApiKey', label: 'LangSmith API Key', type: 'password' },
        { name: 'langsmithProject', label: 'LangSmith Project', type: 'text' }
      ]
    },

    // === CRM/ERP ===
    Salesforce: {
      fields: [
        { name: 'loginUrl', label: 'Login URL', type: 'select', options: ['https://login.salesforce.com', 'https://test.salesforce.com'], default: 'https://login.salesforce.com' },
        { name: 'clientId', label: 'Consumer Key', type: 'text', required: true },
        { name: 'clientSecret', label: 'Consumer Secret', type: 'password', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password + Security Token', type: 'password', required: true }
      ]
    },
    HubSpot: {
      fields: [
        { name: 'accessToken', label: 'Private App Access Token', type: 'password', required: true },
        { name: 'portalId', label: 'Portal ID (Hub ID)', type: 'text' }
      ]
    },
    'Zoho CRM': {
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { name: 'datacenter', label: 'Data Center', type: 'select', options: ['us', 'eu', 'in', 'au', 'jp', 'cn'], default: 'us' }
      ]
    },
    SAP: {
      fields: [
        { name: 'host', label: 'SAP Host', type: 'text', required: true },
        { name: 'systemNumber', label: 'System Number', type: 'text', required: true },
        { name: 'client', label: 'Client', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'language', label: 'Language', type: 'text', default: 'EN' }
      ]
    },
    'Microsoft Dynamics': {
      fields: [
        { name: 'resourceUrl', label: 'Resource URL', type: 'text', placeholder: 'https://xxx.crm.dynamics.com', required: true },
        { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
      ]
    },
    NetSuite: {
      fields: [
        { name: 'accountId', label: 'Account ID', type: 'text', required: true, placeholder: 'TSTDRV123456' },
        { name: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
        { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
        { name: 'tokenId', label: 'Token ID', type: 'text', required: true },
        { name: 'tokenSecret', label: 'Token Secret', type: 'password', required: true },
        { name: 'realm', label: 'Realm (Account ID)', type: 'text' }
      ]
    },

    // === PAGOS ===
    Stripe: {
      fields: [
        { name: 'secretKey', label: 'Secret Key (sk_...)', type: 'password', required: true },
        { name: 'publishableKey', label: 'Publishable Key (pk_...)', type: 'text', required: true },
        { name: 'webhookSecret', label: 'Webhook Secret (whsec_...)', type: 'password' },
        { name: 'testMode', label: 'Modo Test', type: 'checkbox', default: true }
      ]
    },
    PayPal: {
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'], default: 'sandbox' },
        { name: 'webhookId', label: 'Webhook ID', type: 'text' }
      ]
    },
    MercadoPago: {
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'publicKey', label: 'Public Key', type: 'text', required: true },
        { name: 'testMode', label: 'Modo Test', type: 'checkbox', default: true }
      ]
    },
    Square: {
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'locationId', label: 'Location ID', type: 'text', required: true },
        { name: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'], default: 'sandbox' }
      ]
    },
    Conekta: {
      fields: [
        { name: 'apiKey', label: 'API Key (Private)', type: 'password', required: true },
        { name: 'publicKey', label: 'Public Key', type: 'text', required: true },
        { name: 'apiVersion', label: 'API Version', type: 'text', default: '2.0.0' }
      ]
    },

    // === AUTOMATIZACIÓN ===
    Zapier: {
      fields: [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true },
        { name: 'apiKey', label: 'API Key (NLA)', type: 'password' }
      ]
    },
    'Make (Integromat)': {
      fields: [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password' },
        { name: 'teamId', label: 'Team ID', type: 'text' }
      ]
    },
    'Power Automate': {
      fields: [
        { name: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'environmentId', label: 'Environment ID', type: 'text' }
      ]
    },
    n8n: {
      fields: [
        { name: 'baseUrl', label: 'n8n URL', type: 'text', placeholder: 'http://localhost:5678', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password' },
        { name: 'webhookPath', label: 'Webhook Path', type: 'text' }
      ]
    },
    UiPath: {
      fields: [
        { name: 'orchestratorUrl', label: 'Orchestrator URL', type: 'text', required: true },
        { name: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
        { name: 'clientId', label: 'Client ID (External App)', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password' },
        { name: 'userKey', label: 'User Key', type: 'password' }
      ]
    },

    // === MONITOREO ===
    Prometheus: {
      fields: [
        { name: 'url', label: 'Prometheus URL', type: 'text', placeholder: 'http://localhost:9090', required: true },
        { name: 'username', label: 'Username (Basic Auth)', type: 'text' },
        { name: 'password', label: 'Password', type: 'password' }
      ]
    },
    Grafana: {
      fields: [
        { name: 'url', label: 'Grafana URL', type: 'text', placeholder: 'http://localhost:3000', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'orgId', label: 'Organization ID', type: 'number', default: '1' }
      ]
    },
    Datadog: {
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'appKey', label: 'Application Key', type: 'password', required: true },
        { name: 'site', label: 'Site', type: 'select', options: ['datadoghq.com', 'datadoghq.eu', 'us3.datadoghq.com', 'us5.datadoghq.com'], default: 'datadoghq.com' }
      ]
    },
    'New Relic': {
      fields: [
        { name: 'apiKey', label: 'API Key (User Key)', type: 'password', required: true },
        { name: 'accountId', label: 'Account ID', type: 'text', required: true },
        { name: 'region', label: 'Region', type: 'select', options: ['US', 'EU'], default: 'US' }
      ]
    },
    Splunk: {
      fields: [
        { name: 'host', label: 'Splunk Host', type: 'text', required: true },
        { name: 'port', label: 'Management Port', type: 'number', default: '8089', required: true },
        { name: 'token', label: 'Auth Token', type: 'password', required: true },
        { name: 'index', label: 'Default Index', type: 'text', default: 'main' }
      ]
    },
    Elasticsearch: {
      fields: [
        { name: 'node', label: 'Node URL', type: 'text', placeholder: 'http://localhost:9200', required: true },
        { name: 'username', label: 'Username', type: 'text' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'apiKey', label: 'API Key (alternativo)', type: 'password' },
        { name: 'cloudId', label: 'Cloud ID (Elastic Cloud)', type: 'text' }
      ]
    }
  }

  const [connectors, setConnectors] = useState([
    // Bases de Datos
    { id: 1, name: 'PostgreSQL', type: 'database', icon: 'fa-database', status: 'connected', color: '#336791', description: 'Base de datos relacional avanzada' },
    { id: 2, name: 'MySQL', type: 'database', icon: 'fa-database', status: 'disconnected', color: '#4479A1', description: 'Base de datos relacional popular' },
    { id: 3, name: 'MongoDB', type: 'database', icon: 'fa-leaf', status: 'connected', color: '#47A248', description: 'Base de datos NoSQL documental' },
    { id: 4, name: 'Redis', type: 'database', icon: 'fa-bolt', status: 'connected', color: '#DC382D', description: 'Cache y store en memoria' },
    { id: 5, name: 'SQLite', type: 'database', icon: 'fa-database', status: 'disconnected', color: '#003B57', description: 'Base de datos embebida' },
    { id: 6, name: 'MariaDB', type: 'database', icon: 'fa-database', status: 'disconnected', color: '#003545', description: 'Fork de MySQL open source' },
    { id: 7, name: 'Oracle', type: 'database', icon: 'fa-database', status: 'connected', color: '#F80000', description: 'Base de datos empresarial' },
    { id: 8, name: 'SQL Server', type: 'database', icon: 'fa-microsoft', brand: true, status: 'connected', color: '#CC2927', description: 'Base de datos Microsoft' },
    { id: 9, name: 'Cassandra', type: 'database', icon: 'fa-eye', status: 'disconnected', color: '#1287B1', description: 'Base de datos distribuida' },
    { id: 10, name: 'DynamoDB', type: 'database', icon: 'fa-aws', brand: true, status: 'connected', color: '#4053D6', description: 'NoSQL de AWS' },

    // APIs
    { id: 11, name: 'REST API', type: 'api', icon: 'fa-cloud', status: 'connected', color: '#FF6B6B', description: 'Conexión RESTful genérica' },
    { id: 12, name: 'GraphQL', type: 'api', icon: 'fa-project-diagram', status: 'connected', color: '#E535AB', description: 'API con queries flexibles' },
    { id: 13, name: 'OpenAPI/Swagger', type: 'api', icon: 'fa-book', status: 'disconnected', color: '#85EA2D', description: 'Documentación y testing' },
    { id: 14, name: 'gRPC', type: 'api', icon: 'fa-network-wired', status: 'disconnected', color: '#244C5A', description: 'RPC de alto rendimiento' },
    { id: 15, name: 'SOAP', type: 'api', icon: 'fa-soap', status: 'disconnected', color: '#0078D4', description: 'Web services XML' },
    { id: 16, name: 'WebSocket', type: 'api', icon: 'fa-bolt', status: 'connected', color: '#010101', description: 'Comunicación bidireccional' },

    // Almacenamiento
    { id: 17, name: 'Amazon S3', type: 'storage', icon: 'fa-aws', brand: true, status: 'connected', color: '#FF9900', description: 'Almacenamiento en la nube AWS' },
    { id: 18, name: 'Google Cloud Storage', type: 'storage', icon: 'fa-google', brand: true, status: 'connected', color: '#4285F4', description: 'Almacenamiento GCP' },
    { id: 19, name: 'Azure Blob', type: 'storage', icon: 'fa-microsoft', brand: true, status: 'disconnected', color: '#0089D6', description: 'Almacenamiento Azure' },
    { id: 20, name: 'Dropbox', type: 'storage', icon: 'fa-dropbox', brand: true, status: 'connected', color: '#0061FF', description: 'Sincronización de archivos' },
    { id: 21, name: 'OneDrive', type: 'storage', icon: 'fa-microsoft', brand: true, status: 'connected', color: '#0078D4', description: 'Almacenamiento Microsoft' },
    { id: 22, name: 'Box', type: 'storage', icon: 'fa-box', status: 'disconnected', color: '#0061D5', description: 'Gestión empresarial de archivos' },
    { id: 23, name: 'Google Drive', type: 'storage', icon: 'fa-google-drive', brand: true, status: 'connected', color: '#34A853', description: 'Almacenamiento Google' },
    { id: 24, name: 'MinIO', type: 'storage', icon: 'fa-server', status: 'disconnected', color: '#C72C48', description: 'S3 compatible self-hosted' },

    // Mensajería
    { id: 25, name: 'WhatsApp Business', type: 'messaging', icon: 'fa-whatsapp', brand: true, status: 'connected', color: '#25D366', description: 'Mensajería empresarial' },
    { id: 26, name: 'Slack', type: 'messaging', icon: 'fa-slack', brand: true, status: 'disconnected', color: '#4A154B', description: 'Colaboración empresarial' },
    { id: 27, name: 'Microsoft Teams', type: 'messaging', icon: 'fa-microsoft', brand: true, status: 'connected', color: '#6264A7', description: 'Comunicación Microsoft' },
    { id: 28, name: 'Telegram', type: 'messaging', icon: 'fa-telegram', brand: true, status: 'connected', color: '#0088CC', description: 'Mensajería segura' },
    { id: 29, name: 'Discord', type: 'messaging', icon: 'fa-discord', brand: true, status: 'disconnected', color: '#5865F2', description: 'Comunicación por voz y texto' },
    { id: 30, name: 'Twilio SMS', type: 'messaging', icon: 'fa-sms', status: 'connected', color: '#F22F46', description: 'Mensajes de texto programables' },
    { id: 31, name: 'SendGrid', type: 'messaging', icon: 'fa-envelope', status: 'connected', color: '#1A82E2', description: 'Email transaccional' },
    { id: 32, name: 'Mailchimp', type: 'messaging', icon: 'fa-mailchimp', brand: true, status: 'disconnected', color: '#FFE01B', description: 'Email marketing' },

    // IA/ML
    { id: 33, name: 'OpenAI GPT', type: 'ai', icon: 'fa-robot', status: 'connected', color: '#412991', description: 'Modelos de lenguaje GPT' },
    { id: 34, name: 'Claude AI', type: 'ai', icon: 'fa-brain', status: 'connected', color: '#D77544', description: 'Asistente IA de Anthropic' },
    { id: 35, name: 'Google Gemini', type: 'ai', icon: 'fa-google', brand: true, status: 'connected', color: '#4285F4', description: 'IA multimodal de Google' },
    { id: 36, name: 'Azure OpenAI', type: 'ai', icon: 'fa-microsoft', brand: true, status: 'disconnected', color: '#0078D4', description: 'OpenAI en Azure' },
    { id: 37, name: 'Hugging Face', type: 'ai', icon: 'fa-smile', status: 'connected', color: '#FFD21E', description: 'Modelos open source' },
    { id: 38, name: 'AWS Bedrock', type: 'ai', icon: 'fa-aws', brand: true, status: 'disconnected', color: '#FF9900', description: 'IA fundacional AWS' },
    { id: 39, name: 'Ollama', type: 'ai', icon: 'fa-server', status: 'connected', color: '#000000', description: 'LLMs locales' },
    { id: 40, name: 'LangChain', type: 'ai', icon: 'fa-link', status: 'connected', color: '#1C3C3C', description: 'Framework para LLMs' },

    // CRM/ERP
    { id: 41, name: 'Salesforce', type: 'crm', icon: 'fa-salesforce', brand: true, status: 'connected', color: '#00A1E0', description: 'CRM líder del mercado' },
    { id: 42, name: 'HubSpot', type: 'crm', icon: 'fa-hubspot', brand: true, status: 'connected', color: '#FF7A59', description: 'CRM y marketing' },
    { id: 43, name: 'Zoho CRM', type: 'crm', icon: 'fa-address-book', status: 'disconnected', color: '#C8202B', description: 'CRM económico' },
    { id: 44, name: 'SAP', type: 'crm', icon: 'fa-industry', status: 'connected', color: '#0FAAFF', description: 'ERP empresarial' },
    { id: 45, name: 'Microsoft Dynamics', type: 'crm', icon: 'fa-microsoft', brand: true, status: 'disconnected', color: '#002050', description: 'ERP y CRM Microsoft' },
    { id: 46, name: 'Oracle ERP', type: 'crm', icon: 'fa-building', status: 'disconnected', color: '#F80000', description: 'Suite empresarial Oracle' },
    { id: 47, name: 'NetSuite', type: 'crm', icon: 'fa-chart-line', status: 'disconnected', color: '#0267C1', description: 'ERP en la nube' },

    // Pagos
    { id: 48, name: 'Stripe', type: 'payments', icon: 'fa-stripe', brand: true, status: 'connected', color: '#635BFF', description: 'Pagos online' },
    { id: 49, name: 'PayPal', type: 'payments', icon: 'fa-paypal', brand: true, status: 'connected', color: '#003087', description: 'Pagos digitales' },
    { id: 50, name: 'MercadoPago', type: 'payments', icon: 'fa-credit-card', status: 'connected', color: '#009EE3', description: 'Pagos en LATAM' },
    { id: 51, name: 'Square', type: 'payments', icon: 'fa-square', status: 'disconnected', color: '#006AFF', description: 'Pagos y POS' },
    { id: 52, name: 'Conekta', type: 'payments', icon: 'fa-money-bill-wave', status: 'disconnected', color: '#0D2E5C', description: 'Pagos en México' },

    // Automatización
    { id: 53, name: 'Zapier', type: 'automation', icon: 'fa-bolt', status: 'connected', color: '#FF4A00', description: 'Automatización sin código' },
    { id: 54, name: 'Make (Integromat)', type: 'automation', icon: 'fa-cogs', status: 'connected', color: '#6D00CC', description: 'Automatización visual' },
    { id: 55, name: 'Power Automate', type: 'automation', icon: 'fa-microsoft', brand: true, status: 'connected', color: '#0066FF', description: 'Automatización Microsoft' },
    { id: 56, name: 'n8n', type: 'automation', icon: 'fa-sitemap', status: 'disconnected', color: '#EA4B71', description: 'Workflow open source' },
    { id: 57, name: 'UiPath', type: 'automation', icon: 'fa-robot', status: 'connected', color: '#FA4616', description: 'RPA empresarial' },
    { id: 58, name: 'Automation Anywhere', type: 'automation', icon: 'fa-robot', status: 'disconnected', color: '#FF6900', description: 'RPA cognitiva' },

    // Monitoreo
    { id: 59, name: 'Prometheus', type: 'monitoring', icon: 'fa-fire', status: 'connected', color: '#E6522C', description: 'Monitoreo de métricas' },
    { id: 60, name: 'Grafana', type: 'monitoring', icon: 'fa-chart-area', status: 'connected', color: '#F46800', description: 'Visualización de datos' },
    { id: 61, name: 'Datadog', type: 'monitoring', icon: 'fa-dog', status: 'disconnected', color: '#632CA6', description: 'Observabilidad completa' },
    { id: 62, name: 'New Relic', type: 'monitoring', icon: 'fa-chart-bar', status: 'disconnected', color: '#008C99', description: 'APM y monitoreo' },
    { id: 63, name: 'Splunk', type: 'monitoring', icon: 'fa-search', status: 'connected', color: '#65A637', description: 'Análisis de logs' },
    { id: 64, name: 'Elasticsearch', type: 'monitoring', icon: 'fa-search-plus', status: 'connected', color: '#005571', description: 'Búsqueda y análisis' }
  ])

  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'Todos', icon: 'fa-th-large' },
    { id: 'database', label: 'Bases de Datos', icon: 'fa-database' },
    { id: 'api', label: 'APIs', icon: 'fa-cloud' },
    { id: 'storage', label: 'Almacenamiento', icon: 'fa-hdd' },
    { id: 'messaging', label: 'Mensajería', icon: 'fa-comments' },
    { id: 'ai', label: 'IA/ML', icon: 'fa-brain' },
    { id: 'crm', label: 'CRM/ERP', icon: 'fa-building' },
    { id: 'payments', label: 'Pagos', icon: 'fa-credit-card' },
    { id: 'automation', label: 'Automatización', icon: 'fa-cogs' },
    { id: 'monitoring', label: 'Monitoreo', icon: 'fa-chart-line' }
  ]

  const filteredConnectors = useMemo(() => {
    let result = connectors
    if (activeFilter !== 'all') {
      result = result.filter(c => c.type === activeFilter)
    }
    if (searchTerm) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return result
  }, [connectors, activeFilter, searchTerm])

  const stats = useMemo(() => ({
    total: connectors.length,
    connected: connectors.filter(c => c.status === 'connected').length,
    disconnected: connectors.filter(c => c.status === 'disconnected').length
  }), [connectors])

  // Abrir modal de configuración para conectar
  const openConfigModal = (connector) => {
    setConfigConnector(connector)
    // Inicializar valores con defaults
    const config = connectorConfigs[connector.name]
    if (config) {
      const initialValues = {}
      config.fields.forEach(field => {
        if (field.default !== undefined) {
          initialValues[field.name] = field.default
        }
      })
      setConfigValues(initialValues)
    } else {
      setConfigValues({})
    }
    setShowConfigModal(true)
  }

  // Manejar cambio de valores en el formulario de configuración
  const handleConfigChange = (fieldName, value) => {
    setConfigValues(prev => ({ ...prev, [fieldName]: value }))
  }

  // Validar y conectar
  const handleConnect = () => {
    const config = connectorConfigs[configConnector?.name]
    if (config) {
      // Validar campos requeridos
      const missingFields = config.fields
        .filter(f => f.required && !configValues[f.name])
        .map(f => f.label)

      if (missingFields.length > 0) {
        alert(`Faltan campos requeridos: ${missingFields.join(', ')}`)
        return
      }
    }

    // Actualizar conector con configuración
    setConnectors(connectors.map(c =>
      c.id === configConnector.id
        ? { ...c, status: 'connected', config: configValues }
        : c
    ))

    setShowConfigModal(false)

    // Abrir panel correspondiente según el tipo de conector
    const updatedConnector = { ...configConnector, status: 'connected', config: configValues }
    setTimeout(() => {
      setSelectedConnector(updatedConnector)
      if (configConnector.type === 'database') {
        setShowDashboard(true)
      } else if (configConnector.type === 'api') {
        setShowAPITester(true)
      } else if (configConnector.type === 'storage') {
        setShowStorageExplorer(true)
      } else if (configConnector.type === 'messaging') {
        setShowMessagingHub(true)
      }
    }, 300)
  }

  const toggleConnection = (id, openDashboardAfter = false) => {
    const connector = connectors.find(c => c.id === id)
    if (!connector) return

    // Si está desconectado, abrir modal de configuración
    if (connector.status !== 'connected') {
      openConfigModal(connector)
      return
    }

    // Si está conectado, desconectar
    setConnectors(connectors.map(c =>
      c.id === id
        ? { ...c, status: 'disconnected', config: null }
        : c
    ))
  }

  // Abrir dashboard del conector
  const openDashboard = (connector) => {
    setSelectedConnector(connector)
    // Cerrar todos los paneles primero
    setShowDashboard(false)
    setShowAPITester(false)
    setShowStorageExplorer(false)
    setShowMessagingHub(false)

    // Abrir el panel correspondiente según el tipo
    if (connector.type === 'api') {
      setShowAPITester(true)
    } else if (connector.type === 'storage') {
      setShowStorageExplorer(true)
    } else if (connector.type === 'messaging') {
      setShowMessagingHub(true)
    } else {
      setShowDashboard(true)
    }
  }

  // Mostrar documentación del conector
  const showDocumentation = (connector) => {
    setDocsConnector(connector)
    setShowDocsModal(true)
  }

  // Documentación por tipo de conector
  const getConnectorDocs = (connector) => {
    const docs = {
      database: {
        title: 'Conexión a Base de Datos',
        sections: [
          {
            title: 'Requisitos',
            content: `• Host/IP del servidor
• Puerto (por defecto: ${connector.name === 'PostgreSQL' ? '5432' : connector.name === 'MySQL' ? '3306' : connector.name === 'MongoDB' ? '27017' : '1433'})
• Usuario y contraseña
• Nombre de la base de datos`
          },
          {
            title: 'Cadena de Conexión',
            content: connector.name === 'PostgreSQL'
              ? 'postgresql://usuario:password@host:5432/database'
              : connector.name === 'MySQL'
              ? 'mysql://usuario:password@host:3306/database'
              : connector.name === 'MongoDB'
              ? 'mongodb://usuario:password@host:27017/database'
              : 'Server=host;Database=db;User Id=user;Password=pass;'
          },
          {
            title: 'Funcionalidades',
            content: `• Explorador de esquemas y tablas
• Editor SQL con autocompletado
• Ejecución de consultas
• Exportación de resultados
• Sugerencias de IA para optimización`
          }
        ]
      },
      api: {
        title: 'Conexión a API',
        sections: [
          {
            title: 'Configuración',
            content: `• URL base del endpoint
• Método de autenticación (API Key, OAuth, Bearer)
• Headers personalizados`
          },
          {
            title: 'Autenticación',
            content: `• API Key en header o query param
• OAuth 2.0 con client credentials
• Bearer token JWT`
          }
        ]
      },
      storage: {
        title: 'Almacenamiento en la Nube',
        sections: [
          {
            title: 'Credenciales',
            content: `• Access Key ID
• Secret Access Key
• Región / Endpoint
• Bucket / Container`
          }
        ]
      },
      ai: {
        title: 'Servicios de IA',
        sections: [
          {
            title: 'Configuración',
            content: `• API Key del proveedor
• Modelo a utilizar
• Parámetros (temperatura, max tokens)`
          }
        ]
      }
    }
    return docs[connector.type] || docs.api
  }

  return (
    <div className="view" id="mcp-view">
      <div className="view-header">
        <h2><i className="fas fa-plug"></i> MCP Conectores</h2>
        <p>Configura y gestiona tus conexiones con servicios externos</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-plug" style={{ fontSize: '1.5rem', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.total}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Conectores</div>
            </div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.connected}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Conectados</div>
            </div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-unlink" style={{ fontSize: '1.5rem', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.disconnected}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Desconectados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }}></i>
          <input
            type="text"
            placeholder="Buscar conectores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Agregar Conector
        </button>
      </div>

      {/* Category Filters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            style={{
              padding: '0.5rem 1rem',
              background: activeFilter === filter.id ? 'var(--primary-color)' : 'var(--bg-secondary)',
              border: `1px solid ${activeFilter === filter.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: '20px',
              color: activeFilter === filter.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            <i className={`fas ${filter.icon}`}></i>
            {filter.label}
            <span style={{
              background: activeFilter === filter.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
              padding: '0.125rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              {filter.id === 'all' ? connectors.length : connectors.filter(c => c.type === filter.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{
        marginBottom: '1rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        Mostrando {filteredConnectors.length} de {connectors.length} conectores
      </div>

      {/* Connectors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredConnectors.map(connector => (
          <div key={connector.id} style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: connector.color,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`} style={{
                  fontSize: '1.5rem',
                  color: 'white'
                }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{connector.name}</h4>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  color: connector.status === 'connected' ? 'var(--success-color)' : 'var(--text-secondary)'
                }}>
                  <i className="fas fa-circle" style={{ fontSize: '0.4rem' }}></i>
                  {connector.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            <p style={{
              margin: '0 0 1rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {connector.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {connector.status === 'connected' ? (
                <>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => openDashboard(connector)}
                    title="Abrir Dashboard"
                  >
                    <i className="fas fa-th-large"></i> Dashboard
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => toggleConnection(connector.id)}
                    title="Desconectar"
                  >
                    <i className="fas fa-unlink"></i>
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm btn-success"
                  style={{ flex: 1 }}
                  onClick={() => toggleConnection(connector.id, true)}
                  title={connector.type === 'database' ? 'Conectar y abrir Dashboard' : 'Conectar'}
                >
                  <i className="fas fa-plug"></i> Conectar
                  {connector.type === 'database' && (
                    <i className="fas fa-external-link-alt" style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}></i>
                  )}
                </button>
              )}
              <button
                className="btn btn-sm"
                onClick={() => showDocumentation(connector)}
                title="Ver documentación"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                <i className="fas fa-book"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)'
        }}>
          <i className="fas fa-plug" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
          <h3>No se encontraron conectores</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Add Connector Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '500px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-plus"></i> Agregar Nuevo Conector</h3>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><i className="fas fa-plug"></i> Nombre del Conector</label>
                <input type="text" className="form-control" placeholder="Ej: Mi Base de Datos" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-layer-group"></i> Tipo</label>
                <select className="form-control">
                  {filters.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-link"></i> URL de Conexión</label>
                <input type="text" className="form-control" placeholder="https://..." />
              </div>
              <div className="form-group">
                <label><i className="fas fa-key"></i> API Key (opcional)</label>
                <input type="password" className="form-control" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Descripción</label>
                <textarea className="form-control" rows={2} placeholder="Describe el conector..."></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="btn btn-success"><i className="fas fa-plug"></i> Conectar</button>
            </div>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocsModal && docsConnector && (
        <div className="modal-overlay" onClick={() => setShowDocsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '80vh' }}>
            <div className="modal-header" style={{ background: docsConnector.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className={`${docsConnector.brand ? 'fab' : 'fas'} ${docsConnector.icon}`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                <div>
                  <h3 style={{ margin: 0, color: 'white' }}>{docsConnector.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{docsConnector.description}</span>
                </div>
              </div>
              <button className="close-modal" onClick={() => setShowDocsModal(false)} style={{ color: 'white' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ overflow: 'auto' }}>
              {/* Quick Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: docsConnector.status === 'connected' ? '#10b981' : 'var(--text-muted)'
                }}>
                  <i className={`fas fa-${docsConnector.status === 'connected' ? 'check-circle' : 'times-circle'}`}></i>
                  <span>{docsConnector.status === 'connected' ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {filters.find(f => f.id === docsConnector.type)?.label}
                  </span>
                </div>
              </div>

              {/* Documentation Sections */}
              {getConnectorDocs(docsConnector).sections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    margin: '0 0 0.75rem',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: docsConnector.color }}></i>
                    {section.title}
                  </h4>
                  <div style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: section.title.includes('Conexión') ? "'Fira Code', monospace" : 'inherit'
                  }}>
                    {section.content}
                  </div>
                </div>
              ))}

              {/* Helpful Links */}
              <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.9rem',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-external-link-alt"></i>
                  Enlaces útiles
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-book"></i> Documentación oficial de {docsConnector.name}
                  </a>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-question-circle"></i> Guía de inicio rápido
                  </a>
                  <a href="#" style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-video"></i> Tutoriales en video
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDocsModal(false)}>
                Cerrar
              </button>
              {docsConnector.status === 'connected' && (
                <button className="btn btn-primary" onClick={() => {
                  setShowDocsModal(false)
                  openDashboard(docsConnector)
                }}>
                  <i className="fas fa-th-large"></i> Abrir Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && configConnector && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '85vh' }}>
            <div className="modal-header" style={{ background: configConnector.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className={`${configConnector.brand ? 'fab' : 'fas'} ${configConnector.icon}`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                <div>
                  <h3 style={{ margin: 0, color: 'white' }}>Configurar {configConnector.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{configConnector.description}</span>
                </div>
              </div>
              <button className="close-modal" onClick={() => setShowConfigModal(false)} style={{ color: 'white' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ overflow: 'auto', maxHeight: '60vh' }}>
              {connectorConfigs[configConnector.name] ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {connectorConfigs[configConnector.name].fields.map((field, idx) => {
                    // Manejar campos condicionales (showIf)
                    if (field.showIf) {
                      const [condField, condValue] = field.showIf.split('=')
                      if (configValues[condField] !== condValue) return null
                    }

                    return (
                      <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)'
                        }}>
                          {field.label}
                          {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            className="form-control"
                            value={configValues[field.name] || field.default || ''}
                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                            style={{
                              padding: '0.75rem',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <option value="">Seleccionar...</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={configValues[field.name] || false}
                              onChange={(e) => handleConfigChange(field.name, e.target.checked)}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {field.label}
                            </span>
                          </label>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="form-control"
                            placeholder={field.placeholder}
                            value={configValues[field.name] || ''}
                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                            rows={4}
                            style={{
                              padding: '0.75rem',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                              fontFamily: "'Fira Code', monospace",
                              fontSize: '0.85rem'
                            }}
                          />
                        ) : (
                          <input
                            type={field.type}
                            className="form-control"
                            placeholder={field.placeholder}
                            value={configValues[field.name] || ''}
                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                            step={field.step}
                            style={{
                              padding: '0.75rem',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        )}
                      </div>
                    )
                  })}

                  {/* Mostrar cadena de conexión si aplica */}
                  {connectorConfigs[configConnector.name].connectionString && Object.keys(configValues).length > 0 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-color)'
                    }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase'
                      }}>
                        <i className="fas fa-link"></i> Connection String
                      </label>
                      <code style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: configConnector.color,
                        wordBreak: 'break-all'
                      }}>
                        {connectorConfigs[configConnector.name].connectionString(configValues)}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <i className="fas fa-cog" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                  <p>Configuración genérica para {configConnector.name}</p>
                  <div className="form-group" style={{ textAlign: 'left', marginTop: '1rem' }}>
                    <label>URL de conexión</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://..."
                      value={configValues.url || ''}
                      onChange={(e) => handleConfigChange('url', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>API Key / Token</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={configValues.apiKey || ''}
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Tip de seguridad */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <i className="fas fa-shield-alt" style={{ color: '#f59e0b', marginTop: '2px' }}></i>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#f59e0b' }}>Seguridad:</strong> Las credenciales se almacenan de forma segura y nunca se comparten.
                  Asegúrate de usar tokens con los permisos mínimos necesarios.
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-success"
                onClick={handleConnect}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <i className="fas fa-plug"></i>
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MCP Dashboard */}
      {showDashboard && selectedConnector && (
        <MCPDashboard
          connector={selectedConnector}
          onClose={() => {
            setShowDashboard(false)
            setSelectedConnector(null)
          }}
          onOpenConfig={(connector) => {
            setShowDashboard(false)
            openConfigModal(connector)
          }}
        />
      )}

      {/* API Tester */}
      {showAPITester && selectedConnector && (
        <APITester
          connector={selectedConnector}
          onClose={() => {
            setShowAPITester(false)
            setSelectedConnector(null)
          }}
          onOpenConfig={(connector) => {
            setShowAPITester(false)
            openConfigModal(connector)
          }}
        />
      )}

      {/* Storage Explorer */}
      {showStorageExplorer && selectedConnector && (
        <StorageExplorer
          connector={selectedConnector}
          onClose={() => {
            setShowStorageExplorer(false)
            setSelectedConnector(null)
          }}
          onOpenConfig={(connector) => {
            setShowStorageExplorer(false)
            openConfigModal(connector)
          }}
        />
      )}

      {/* Messaging Hub */}
      {showMessagingHub && selectedConnector && (
        <MessagingHub
          connector={selectedConnector}
          onClose={() => {
            setShowMessagingHub(false)
            setSelectedConnector(null)
          }}
          onOpenConfig={(connector) => {
            setShowMessagingHub(false)
            openConfigModal(connector)
          }}
        />
      )}
    </div>
  )
}

export default MCPView
