# ALQVIMIA RPA 2.0 - Propuesta de Negocio Enterprise

## Resumen Ejecutivo

**Alqvimia RPA** es una plataforma completa de automatización inteligente que combina:
- RPA (Robotic Process Automation)
- Agentes de IA autónomos
- Integraciones MCP (Model Context Protocol)
- Process Mining y Task Mining
- Procesamiento Inteligente de Documentos (IDP)

### Modelo de Negocio: SaaS + On-Premise + Marketplace

---

## 1. ARQUITECTURA DE PRODUCTOS

### 1.1 Líneas de Producto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ALQVIMIA ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   ALQVIMIA   │  │   ALQVIMIA   │  │   ALQVIMIA   │  │   ALQVIMIA   │    │
│  │   AUTOMATE   │  │    AGENTS    │  │   CONNECT    │  │  ENTERPRISE  │    │
│  │              │  │              │  │              │  │              │    │
│  │  RPA Studio  │  │  AI Agents   │  │    MCP Hub   │  │  Full Suite  │    │
│  │  Workflows   │  │  Marketplace │  │ Integrations │  │  + Support   │    │
│  │  Scheduler   │  │  Custom Dev  │  │   100+ APIs  │  │  + Training  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      ALQVIMIA CLOUD PLATFORM                         │    │
│  │  • Orquestador Central  • Dashboard Unificado  • Analytics          │    │
│  │  • Billing & Licensing  • Agent Registry       • Execution Logs     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes Distribuibles

| Componente | Formato | Descripción |
|------------|---------|-------------|
| **Alqvimia Studio** | Instalador .exe/.msi | IDE completo de automatización |
| **Alqvimia Robot** | Ejecutable standalone | Runner de workflows sin UI |
| **Alqvimia Agent** | Microservicio | Agente específico (DB, AI, etc.) |
| **Alqvimia Orchestrator** | Servidor | Coordinador central en la nube |

---

## 2. PLANES Y PRECIOS

### 2.1 Modelo de Suscripción

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLANES DE SUSCRIPCIÓN                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│     STARTER     │   PROFESSIONAL  │    BUSINESS     │     ENTERPRISE      │
│    $49/mes      │    $149/mes     │    $399/mes     │    Personalizado    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ • 1 Robot       │ • 3 Robots      │ • 10 Robots     │ • Ilimitados        │
│ • 5 Workflows   │ • 25 Workflows  │ • 100 Workflows │ • Ilimitados        │
│ • 1,000 exec/mes│ • 10,000 exec   │ • 50,000 exec   │ • Ilimitadas        │
│ • 3 Agentes MCP │ • 10 Agentes    │ • 25 Agentes    │ • Todos             │
│ • Community     │ • Email Support │ • Priority      │ • Dedicated CSM     │
│ • -             │ • Scheduler     │ • Process Mining│ • On-Premise        │
│ • -             │ • -             │ • API Access    │ • Custom Dev        │
│ • -             │ • -             │ • SSO/LDAP      │ • SLA 99.9%         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

### 2.2 Modelo Pay-Per-Use (Adicional)

| Recurso | Precio | Descripción |
|---------|--------|-------------|
| Ejecución extra | $0.01 | Por ejecución de workflow |
| Agente IA (GPT/Claude) | $0.05 | Por llamada a API de IA |
| Almacenamiento | $0.10/GB | Storage adicional |
| Robot adicional | $29/mes | Por robot extra |
| Agente Premium | $19/mes | Por agente especializado |

### 2.3 Marketplace de Agentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT MARKETPLACE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GRATUITOS (incluidos en plan)          PREMIUM (pago único o suscripción)  │
│  ├── MySQL Agent                        ├── SAP Connector      $299/mes     │
│  ├── REST API Agent                     ├── Salesforce Agent   $199/mes     │
│  ├── Email Agent                        ├── Oracle EBS Agent   $399/mes     │
│  ├── Scheduler Agent                    ├── SAP S/4HANA        $499/mes     │
│  └── Basic AI Agent                     ├── ServiceNow Agent   $249/mes     │
│                                         └── Custom Agent Dev   $2,000+      │
│                                                                              │
│  COMMUNITY (desarrollados por terceros)                                      │
│  ├── 70% para el desarrollador                                              │
│  └── 30% comisión plataforma                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Orquestador Central

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ALQVIMIA ORCHESTRATOR                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   License   │    │   Agent     │    │  Execution  │    │   Billing   │  │
│  │   Manager   │    │  Registry   │    │   Engine    │    │   Gateway   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │          │
│  ┌──────┴──────────────────┴──────────────────┴──────────────────┴──────┐  │
│  │                         MESSAGE BUS (Redis/RabbitMQ)                  │  │
│  └──────┬──────────────────┬──────────────────┬──────────────────┬──────┘  │
│         │                  │                  │                  │          │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐  │
│  │  Analytics  │    │    Logs     │    │   Alerts    │    │   Reports   │  │
│  │   Engine    │    │ Aggregator  │    │   Manager   │    │  Generator  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
              │  Client   │   │  Client   │   │  Client   │
              │  Site A   │   │  Site B   │   │  Site C   │
              │           │   │           │   │           │
              │ ┌───────┐ │   │ ┌───────┐ │   │ ┌───────┐ │
              │ │Robots │ │   │ │Robots │ │   │ │Robots │ │
              │ │Agents │ │   │ │Agents │ │   │ │Agents │ │
              │ └───────┘ │   │ └───────┘ │   │ └───────┘ │
              └───────────┘   └───────────┘   └───────────┘
```

### 3.2 Sistema de Licenciamiento

```javascript
// Estructura de Licencia
{
  "licenseId": "ALQ-2024-XXXX-XXXX",
  "type": "professional",
  "organization": {
    "id": "org_123",
    "name": "Empresa ABC",
    "taxId": "RFC123456789"
  },
  "limits": {
    "robots": 3,
    "workflows": 25,
    "executionsPerMonth": 10000,
    "agents": ["mysql", "rest-api", "email", "scheduler", "openai"],
    "features": ["scheduler", "api-access", "email-support"]
  },
  "billing": {
    "plan": "professional",
    "amount": 149.00,
    "currency": "USD",
    "interval": "monthly",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx",
    "zohoCustomerId": "zcrm_xxx"
  },
  "validity": {
    "issuedAt": "2024-12-28T00:00:00Z",
    "expiresAt": "2025-01-28T00:00:00Z",
    "autoRenew": true
  },
  "signature": "SHA256_SIGNATURE_HERE"
}
```

### 3.3 Flujo de Pagos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Cliente                   Alqvimia                    Pasarelas             │
│     │                         │                            │                 │
│     │  1. Selecciona Plan     │                            │                 │
│     │ ───────────────────────>│                            │                 │
│     │                         │                            │                 │
│     │  2. Checkout Session    │  3. Create Payment Intent  │                 │
│     │ <───────────────────────│ ──────────────────────────>│                 │
│     │                         │                            │                 │
│     │  4. Redirect to Payment │                            │                 │
│     │ ───────────────────────────────────────────────────> │                 │
│     │                         │                            │                 │
│     │                         │   5. Webhook: Paid         │                 │
│     │                         │ <──────────────────────────│                 │
│     │                         │                            │                 │
│     │  6. Activate License    │   7. Sync to Zoho CRM      │                 │
│     │ <───────────────────────│ ──────────────────────────>│                 │
│     │                         │                            │                 │
│     │  8. Download Installer  │                            │                 │
│     │ <───────────────────────│                            │                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. INTEGRACIÓN DE PAGOS

### 4.1 Stripe (Pagos Internacionales)

```javascript
// Planes en Stripe
const stripePlans = {
  starter: {
    productId: 'prod_alqvimia_starter',
    prices: {
      monthly: 'price_starter_monthly',  // $49/mes
      yearly: 'price_starter_yearly'      // $470/año (20% desc)
    }
  },
  professional: {
    productId: 'prod_alqvimia_pro',
    prices: {
      monthly: 'price_pro_monthly',       // $149/mes
      yearly: 'price_pro_yearly'          // $1,430/año
    }
  },
  business: {
    productId: 'prod_alqvimia_business',
    prices: {
      monthly: 'price_business_monthly',  // $399/mes
      yearly: 'price_business_yearly'     // $3,830/año
    }
  }
}
```

### 4.2 Zoho (CRM + Facturación LATAM)

```javascript
// Integración Zoho
const zohoIntegration = {
  // Zoho CRM - Gestión de clientes
  crm: {
    modules: ['Leads', 'Contacts', 'Accounts', 'Deals', 'Products'],
    customFields: {
      'Contacts': ['License_Type', 'Plan', 'Robots_Count', 'Expiry_Date'],
      'Deals': ['Stripe_Subscription_ID', 'MRR', 'Churn_Risk']
    }
  },

  // Zoho Books/Invoice - Facturación México
  books: {
    taxes: {
      'MX': { iva: 16, retIva: 0, retIsr: 0 },
      'MX_PERSONA_MORAL': { iva: 16, retIva: 10.67, retIsr: 10 }
    },
    cfdi: {
      usoCfdi: 'G03', // Gastos en general
      formaPago: '04', // Tarjeta de crédito
      metodoPago: 'PUE' // Pago en una sola exhibición
    }
  },

  // Zoho Subscriptions - Suscripciones recurrentes
  subscriptions: {
    syncWithStripe: true,
    dunningManagement: true,
    invoiceAutomation: true
  }
}
```

### 4.3 Pasarelas Adicionales (LATAM)

| Pasarela | Región | Uso |
|----------|--------|-----|
| **Stripe** | Global | Tarjetas internacionales, suscripciones |
| **MercadoPago** | LATAM | Tarjetas locales, OXXO, transferencias |
| **Conekta** | México | SPEI, OXXO, tarjetas mexicanas |
| **PayPal** | Global | Alternativa a tarjetas |
| **Zoho Checkout** | Global | Integración nativa con Zoho |

---

## 5. SISTEMA DE PROYECTOS Y LOGS

### 5.1 Estructura de Proyecto

```
proyecto_cliente/
├── .alqvimia/
│   ├── config.json           # Configuración del proyecto
│   ├── license.json          # Licencia encriptada
│   └── credentials.enc       # Credenciales encriptadas
├── workflows/
│   ├── proceso_facturacion.wfl
│   ├── sincronizacion_erp.wfl
│   └── reporte_diario.wfl
├── agents/
│   ├── mysql-agent/          # Agente de BD configurado
│   └── email-agent/          # Agente de email configurado
├── logs/
│   ├── 2024-12/
│   │   ├── executions.log
│   │   ├── errors.log
│   │   └── audit.log
│   └── archives/
├── data/
│   ├── inputs/
│   ├── outputs/
│   └── temp/
└── reports/
    ├── execution_summary.html
    └── analytics_dashboard.html
```

### 5.2 Sistema de Logs Centralizado

```javascript
// Estructura de Log de Ejecución
{
  "executionId": "exec_abc123",
  "projectId": "proj_xyz",
  "workflowId": "wf_facturacion",
  "organizationId": "org_123",

  "execution": {
    "startedAt": "2024-12-28T10:00:00Z",
    "completedAt": "2024-12-28T10:05:32Z",
    "duration": 332000, // ms
    "status": "completed",
    "triggeredBy": "scheduler"
  },

  "steps": [
    {
      "stepId": 1,
      "action": "database.query",
      "agent": "mysql-agent",
      "startedAt": "2024-12-28T10:00:01Z",
      "duration": 245,
      "status": "success",
      "input": { "query": "SELECT * FROM facturas WHERE status = 'pending'" },
      "output": { "rowCount": 15 }
    },
    // ... más pasos
  ],

  "metrics": {
    "stepsTotal": 12,
    "stepsSuccess": 12,
    "stepsFailed": 0,
    "dataProcessed": "2.4 MB",
    "apiCalls": 45,
    "cost": 0.15 // USD
  },

  "resources": {
    "cpu": "12%",
    "memory": "256 MB",
    "network": "1.2 MB"
  }
}
```

### 5.3 Dashboard de Analytics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ALQVIMIA ANALYTICS DASHBOARD                            [Org: Empresa ABC] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   12,450    │  │    98.5%    │  │    $1,245   │  │   3.2 hrs   │        │
│  │ Executions  │  │Success Rate │  │   Savings   │  │  Time Saved │        │
│  │  this month │  │             │  │  this month │  │  per day    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  EXECUTIONS BY WORKFLOW            │  │  AGENT USAGE                   │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓ Facturación (45%)   │  │  MySQL     ████████████ 2,340  │ │
│  │  ▓▓▓▓▓▓▓▓ Sincronización (32%)     │  │  REST API  ████████ 1,890      │ │
│  │  ▓▓▓▓ Reportes (18%)               │  │  Email     ████ 890            │ │
│  │  ▓▓ Otros (5%)                     │  │  OpenAI    ██ 234              │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  RECENT EXECUTIONS                                          [View All]│   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  ● Facturación Diaria        10:05:32    ✓ Success    32s    $0.02   │   │
│  │  ● Sync ERP                  09:45:00    ✓ Success    2m 15s $0.08   │   │
│  │  ● Reporte Ventas            09:00:00    ✓ Success    45s    $0.03   │   │
│  │  ○ Backup Automático         08:30:00    ✗ Failed     --     $0.01   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. GENERACIÓN DE EJECUTABLES

### 6.1 Tipos de Ejecutables

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **Alqvimia Studio** | IDE completo con UI | Desarrollo y diseño |
| **Alqvimia Robot** | Runner sin UI | Ejecución en servidores |
| **Alqvimia Agent** | Microservicio individual | Despliegue distribuido |
| **Alqvimia Portable** | Versión USB/portátil | Demos y pruebas |

### 6.2 Proceso de Generación

```javascript
// build-exe.js
const buildConfig = {
  // Electron para Studio (UI)
  studio: {
    builder: 'electron-builder',
    platforms: ['win', 'mac', 'linux'],
    output: {
      win: 'AlqvimiaStudio-Setup-{version}.exe',
      mac: 'AlqvimiaStudio-{version}.dmg',
      linux: 'AlqvimiaStudio-{version}.AppImage'
    },
    signing: {
      win: 'EV Code Signing Certificate',
      mac: 'Apple Developer ID'
    }
  },

  // pkg para Robot (Node.js sin UI)
  robot: {
    builder: 'pkg',
    targets: ['node18-win-x64', 'node18-linux-x64', 'node18-macos-x64'],
    output: 'alqvimia-robot-{platform}',
    assets: ['workflows/**', 'agents/**', 'config/**']
  },

  // Docker para Agents
  agents: {
    builder: 'docker',
    baseImage: 'node:18-alpine',
    registry: 'registry.alqvimia.com',
    images: [
      'alqvimia/agent-mysql',
      'alqvimia/agent-openai',
      'alqvimia/agent-email',
      // ... más agentes
    ]
  }
}
```

### 6.3 Sistema de Actualización

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UPDATE SYSTEM                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Client                    Update Server              CDN                    │
│    │                            │                       │                    │
│    │  1. Check for updates      │                       │                    │
│    │ ──────────────────────────>│                       │                    │
│    │                            │                       │                    │
│    │  2. Version manifest       │                       │                    │
│    │ <──────────────────────────│                       │                    │
│    │                            │                       │                    │
│    │  3. Download delta update  │                       │                    │
│    │ ─────────────────────────────────────────────────> │                    │
│    │                            │                       │                    │
│    │  4. Verify signature       │                       │                    │
│    │ ─────────────────────────> │                       │                    │
│    │                            │                       │                    │
│    │  5. Apply update           │                       │                    │
│    │ (restart)                  │                       │                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. OFERTA DE SERVICIOS CONFIGURABLE

### 7.1 Módulos Activables por Cliente

```javascript
// Configuración de servicios por organización
const organizationServices = {
  organizationId: "org_123",

  // Módulos habilitados
  modules: {
    rpaStudio: true,           // Diseñador de workflows
    rpaRobot: true,            // Ejecución de workflows
    agentMarketplace: true,    // Acceso al marketplace
    processsMining: false,     // Descubrimiento de procesos
    taskMining: false,         // Captura de tareas
    idp: false,                // Procesamiento de documentos
    testAutomation: true,      // Pruebas automatizadas
    analytics: true,           // Dashboard de métricas
    api: true                  // Acceso a API
  },

  // Agentes habilitados
  agents: {
    included: ['mysql', 'rest-api', 'email', 'scheduler'],
    premium: ['openai', 'claude'],
    blocked: ['sap', 'salesforce']
  },

  // Límites
  limits: {
    robots: 3,
    workflows: 25,
    executionsPerMonth: 10000,
    storageGb: 10,
    retentionDays: 90
  },

  // Branding (White Label)
  branding: {
    enabled: false,
    logo: null,
    colors: null,
    domain: null
  }
}
```

### 7.2 Panel de Administración de Servicios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DE SERVICIOS                      [Organización: Empresa ABC]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MÓDULOS DISPONIBLES                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  [✓] RPA Studio          [✓] RPA Robot           [✓] Agent Marketplace │ │
│  │  [ ] Process Mining      [ ] Task Mining         [ ] IDP               │ │
│  │  [✓] Test Automation     [✓] Analytics           [✓] API Access        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  AGENTES HABILITADOS                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  INCLUIDOS EN PLAN          PREMIUM (costo adicional)    BLOQUEADOS    │ │
│  │  ☑ MySQL Agent              ☑ OpenAI GPT Agent           ☐ SAP Agent   │ │
│  │  ☑ REST API Agent           ☑ Claude AI Agent            ☐ Salesforce  │ │
│  │  ☑ Email Agent              ☐ HubSpot Agent              ☐ Oracle EBS  │ │
│  │  ☑ Scheduler Agent          ☐ Stripe Agent                             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  LÍMITES DE USO                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Robots:     [3  ] / 10 máx     Workflows:   [25 ] / 100 máx          │ │
│  │  Ejecuciones:[10000] / mes      Storage:     [10 ] GB                  │ │
│  │  Retención:  [90  ] días        API Calls:   [5000] / día              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Guardar Cambios ]  [ Previsualizar Factura ]  [ Notificar al Cliente ]   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. MODELO DE INGRESOS PROYECTADO

### 8.1 Escenarios de Crecimiento

| Métrica | Año 1 | Año 2 | Año 3 |
|---------|-------|-------|-------|
| Clientes Starter | 100 | 300 | 600 |
| Clientes Professional | 30 | 100 | 250 |
| Clientes Business | 10 | 40 | 100 |
| Clientes Enterprise | 2 | 10 | 25 |
| **MRR** | $12,590 | $50,840 | $142,550 |
| **ARR** | $151,080 | $610,080 | $1,710,600 |

### 8.2 Fuentes de Ingreso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REVENUE STREAMS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SUSCRIPCIONES (70%)                                                         │
│  ├── Starter:      $4,900/mes   (100 clientes × $49)                        │
│  ├── Professional: $4,470/mes   (30 clientes × $149)                        │
│  ├── Business:     $3,990/mes   (10 clientes × $399)                        │
│  └── Enterprise:   ~$5,000/mes  (2 clientes × ~$2,500)                      │
│                                                                              │
│  PAY-PER-USE (15%)                                                           │
│  ├── Ejecuciones extra: ~$1,500/mes                                         │
│  ├── AI API calls:      ~$800/mes                                           │
│  └── Storage adicional: ~$200/mes                                           │
│                                                                              │
│  MARKETPLACE (10%)                                                           │
│  ├── Agentes Premium:    ~$1,000/mes                                        │
│  └── Comisión terceros:  ~$300/mes                                          │
│                                                                              │
│  SERVICIOS (5%)                                                              │
│  ├── Implementación:     ~$500/mes                                          │
│  ├── Capacitación:       ~$200/mes                                          │
│  └── Desarrollo custom:  ~$400/mes                                          │
│                                                                              │
│  TOTAL MRR AÑO 1: ~$23,260                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. IMPLEMENTACIÓN TÉCNICA

### 9.1 Roadmap de Desarrollo

```
FASE 1: FUNDAMENTOS (4 semanas)
├── Orquestador Central
│   ├── License Manager
│   ├── Agent Registry
│   └── Execution Engine
├── Sistema de Billing
│   ├── Integración Stripe
│   ├── Integración Zoho
│   └── Portal de cliente
└── Generador de Ejecutables
    ├── Studio (Electron)
    ├── Robot (pkg)
    └── Agents (Docker)

FASE 2: MONETIZACIÓN (3 semanas)
├── Marketplace
│   ├── Catálogo de agentes
│   ├── Sistema de compras
│   └── Distribución automática
├── Planes y Límites
│   ├── Enforcement de límites
│   ├── Upgrade flows
│   └── Dunning management
└── Analytics
    ├── Usage tracking
    ├── Billing reports
    └── Customer dashboard

FASE 3: ESCALA (4 semanas)
├── Multi-tenancy
│   ├── Aislamiento de datos
│   ├── Custom domains
│   └── White labeling
├── Enterprise Features
│   ├── SSO/SAML
│   ├── Audit logs
│   └── SLA monitoring
└── API Pública
    ├── REST API
    ├── Webhooks
    └── SDK
```

### 9.2 Estructura de Base de Datos Adicional

```sql
-- Tablas adicionales para el sistema de negocio

-- Organizaciones/Tenants
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    tax_id VARCHAR(50),
    country VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial'
);

-- Licencias
CREATE TABLE licenses (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    license_key VARCHAR(100) UNIQUE,
    plan ENUM('starter', 'professional', 'business', 'enterprise'),
    limits JSON,
    features JSON,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    signature TEXT
);

-- Suscripciones
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    stripe_subscription_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    zoho_subscription_id VARCHAR(100),
    plan VARCHAR(50),
    status VARCHAR(50),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE
);

-- Uso y métricas
CREATE TABLE usage_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    metric_type VARCHAR(50), -- executions, api_calls, storage, etc.
    value DECIMAL(15,4),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_org_type_date (organization_id, metric_type, recorded_at)
);

-- Facturas
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    stripe_invoice_id VARCHAR(100),
    zoho_invoice_id VARCHAR(100),
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    status VARCHAR(50),
    period_start DATE,
    period_end DATE,
    due_date DATE,
    paid_at TIMESTAMP,
    invoice_pdf_url TEXT
);

-- Agentes instalados por organización
CREATE TABLE organization_agents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    agent_id VARCHAR(100),
    version VARCHAR(20),
    installed_at TIMESTAMP,
    license_type ENUM('included', 'premium', 'marketplace'),
    expires_at TIMESTAMP,
    config JSON
);

-- Proyectos
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    settings JSON
);

-- Ejecuciones detalladas
CREATE TABLE execution_logs (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id),
    workflow_id VARCHAR(36),
    organization_id VARCHAR(36),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50),
    trigger_type VARCHAR(50),
    steps JSON,
    metrics JSON,
    cost DECIMAL(10,4),
    INDEX idx_org_date (organization_id, started_at)
);
```

---

## 10. PRÓXIMOS PASOS

### Inmediato (Esta semana)
1. ✅ Análisis de arquitectura actual
2. ⬜ Crear estructura del Orquestador
3. ⬜ Implementar License Manager
4. ⬜ Configurar Stripe Products/Prices

### Corto plazo (2 semanas)
1. ⬜ Portal de cliente (registro, login, dashboard)
2. ⬜ Integración Zoho CRM
3. ⬜ Sistema de facturación México (CFDI)
4. ⬜ Generador de ejecutables

### Mediano plazo (1 mes)
1. ⬜ Marketplace funcional
2. ⬜ Analytics y reportes
3. ⬜ Documentación y API pública
4. ⬜ Beta con primeros clientes

---

## RESUMEN EJECUTIVO

**Alqvimia RPA 2.0** está posicionado para ser una solución completa de automatización:

| Aspecto | Propuesta |
|---------|-----------|
| **Modelo** | SaaS + On-Premise + Marketplace |
| **Planes** | $49 - $399/mes + Enterprise |
| **Diferenciadores** | Agentes modulares, IA integrada, Process Mining |
| **Mercado** | LATAM + Global |
| **Pagos** | Stripe (global) + Zoho (LATAM) |
| **Tecnología** | Node.js, React, Electron, Docker |

**Proyección Año 1:** $150K - $280K ARR
**Proyección Año 3:** $1.5M - $2M ARR

---

*Documento generado: 2024-12-28*
*Versión: 1.0*
