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

---
---
---

# PLAN DE TRABAJO: ALQVIMIA RPA 2.0 vs COMPETENCIA

## Objetivo: Superar a UiPath, Automation Anywhere, Blue Prism y Rocketbot en áreas clave

### Basado en el Análisis Competitivo Exhaustivo (Febrero 2026)

**Período:** Febrero 2026 - Diciembre 2026 (11 meses)
**Metodología:** Sprints de 2 semanas, releases mensuales

---

## RESUMEN DEL GAP COMPETITIVO (Qué nos falta)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SCORING ACTUAL (sobre 10)                                                       │
│                                                                                  │
│  Alqvimia   ████████████████████░░░░░░░░  6.5/10  ← CERRAR GAPS PARA LLEGAR A 8 │
│  UiPath     █████████████████████████░░░  8.2/10  ← LÍDER ABSOLUTO               │
│  Autom.Any  ████████████████████████░░░░  7.5/10  ← CLOUD-NATIVE LEADER          │
│  Blue Prism ██████████████████████░░░░░░  6.8/10  ← EN DECLIVE                   │
│  Rocketbot  ████████████░░░░░░░░░░░░░░░░  3.8/10  ← YA SUPERADO                  │
│                                                                                  │
│  META DIC 2026: ALQVIMIA → 8.5/10 (Superar a todos excepto UiPath core)         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Gaps Críticos Identificados (ordenados por impacto):

| # | Gap | Impacto | UiPath | AA | BP | Alqvimia HOY |
|---|-----|---------|--------|----|----|--------------|
| 1 | Escalabilidad (multi-nodo) | CRÍTICO | 10 | 10 | 9 | 3 |
| 2 | Certificaciones seguridad | CRÍTICO | 10 | 8 | 8 | 0 |
| 3 | Process Mining | ALTO | 10 | 5 | 7 | 0 |
| 4 | Orquestador avanzado | ALTO | 10 | 9 | 9 | 5 |
| 5 | SSO/MFA/SAML | ALTO | 10 | 9 | 9 | 4 |
| 6 | Comunidad y docs | ALTO | 10 | 7 | 7 | 1 |
| 7 | Healing/Auto-repair | MEDIO | 8 | 0 | 0 | 0 |
| 8 | Mobile app | MEDIO | 7 | 7 | 3 | 3 |
| 9 | Marketplace externo | MEDIO | 10 | 7 | 7 | 2 |
| 10 | Generación de ejecutables | ALTO | 10 | 10 | 10 | 0 |

---

## PLAN DE TRABAJO MENSUAL (Feb - Dic 2026)

---

### FASE 1: FUNDAMENTOS ENTERPRISE (Feb - Mar 2026)
**Objetivo:** Cerrar los gaps de seguridad y escalabilidad que bloquean ventas enterprise

---

#### MES 1: FEBRERO 2026 — Seguridad Enterprise + Orquestador

**Sprint 1 (Feb 3-14): Autenticación Enterprise**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Implementar SSO con SAML 2.0 (Azure AD, Okta, OneLogin) | P0 | 5 días | Backend |
| Implementar MFA (TOTP, Google Authenticator, SMS) | P0 | 3 días | Backend |
| RBAC avanzado: roles, permisos granulares por recurso | P0 | 4 días | Full-stack |
| Session management: tokens JWT con refresh, revocación | P1 | 2 días | Backend |
| Audit trail completo: quién hizo qué, cuándo, dónde | P0 | 3 días | Backend |
| Encriptación at-rest para credenciales (AES-256) | P0 | 2 días | Backend |
| UI de administración de usuarios y roles | P1 | 3 días | Frontend |

**Sprint 2 (Feb 17-28): Orquestador v2**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Cola de ejecución con prioridades (Redis/Bull) | P0 | 4 días | Backend |
| Ejecución paralela de workflows (workers pool) | P0 | 5 días | Backend |
| Triggers avanzados: webhook, email, file watcher, API | P0 | 4 días | Backend |
| Retry automático con backoff exponencial | P1 | 2 días | Backend |
| Queue monitoring dashboard en tiempo real | P1 | 3 días | Frontend |
| Logs estructurados con niveles (Winston/Pino) | P1 | 2 días | Backend |

**Entregable Feb:** Alqvimia con SSO, MFA, RBAC, audit trail y orquestador con colas

---

#### MES 2: MARZO 2026 — Escalabilidad + Ejecutables

**Sprint 3 (Mar 3-14): Arquitectura Multi-nodo**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Refactorizar a microservicios: API Gateway + Workers | P0 | 5 días | Backend |
| Worker pool distribuido con PM2 Cluster o BullMQ | P0 | 4 días | Backend |
| Load balancer con health checks | P0 | 2 días | DevOps |
| Shared state con Redis (sessions, locks, cache) | P0 | 3 días | Backend |
| Base de datos: connection pooling + read replicas | P1 | 2 días | Backend |
| Docker Compose multi-servicio (api, worker, scheduler, redis) | P0 | 3 días | DevOps |
| Kubernetes manifests (deployment, service, ingress) | P2 | 3 días | DevOps |

**Sprint 4 (Mar 17-28): Generación de Ejecutables**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Electron builder para Alqvimia Studio (Win/Mac/Linux) | P0 | 5 días | Full-stack |
| Auto-updater (electron-updater + CDN) | P1 | 3 días | Full-stack |
| Alqvimia Robot CLI: ejecutor sin UI (pkg) | P0 | 4 días | Backend |
| Instalador .exe/.msi con firma digital | P1 | 2 días | DevOps |
| Sistema de licencias offline (firma RSA) | P0 | 3 días | Backend |
| CI/CD para builds automáticos (GitHub Actions) | P1 | 2 días | DevOps |

**Entregable Mar:** Alqvimia escalable (multi-nodo), ejecutable standalone, robot CLI

---

### FASE 2: INTELIGENCIA Y DISCOVERY (Abr - Jun 2026)
**Objetivo:** Cerrar el gap de IA avanzada y Process Mining que nos separa de UiPath

---

#### MES 3: ABRIL 2026 — Process Mining + Task Mining

**Sprint 5 (Abr 1-11): Process Mining v1**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Importador de event logs (CSV, XES, DB queries) | P0 | 4 días | Backend |
| Motor de Process Mining: descubrimiento de procesos | P0 | 5 días | Backend |
| Visualización de process maps (flujo + frecuencia) | P0 | 5 días | Frontend |
| Detección de cuellos de botella y variantes | P1 | 3 días | Backend |
| KPIs de proceso: lead time, throughput, rework rate | P1 | 2 días | Backend |
| Dashboard de Process Mining integrado | P0 | 3 días | Frontend |

**Sprint 6 (Abr 14-25): Task Mining v1**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Agente desktop de captura (clicks, keystrokes, apps) | P0 | 5 días | Desktop |
| Detección de patrones repetitivos con ML | P1 | 5 días | Backend/ML |
| Generación automática de workflow skeleton | P1 | 4 días | Backend |
| Vista de análisis de tareas capturadas | P1 | 3 días | Frontend |
| Exportar tarea descubierta → workflow Alqvimia | P1 | 2 días | Full-stack |

**Entregable Abr:** Process Mining funcional + Task Mining básico (EXCLUSIVO vs Rocketbot, competitivo vs BP)

---

#### MES 4: MAYO 2026 — IA Avanzada + Healing

**Sprint 7 (May 1-14): Healing Agents + Self-repair**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Detector de selectores rotos (CSS/XPath changes) | P0 | 4 días | Backend |
| Sugerencia automática de selectors alternativos | P0 | 4 días | Backend |
| Retry inteligente con variaciones de selector | P1 | 3 días | Backend |
| Auto-screenshot en fallo + análisis visual con IA | P1 | 3 días | Backend |
| Dashboard de "salud" de workflows (fragility score) | P1 | 3 días | Frontend |
| Notificaciones proactivas de workflows en riesgo | P2 | 2 días | Full-stack |

**Sprint 8 (May 15-30): Natural Language to Automation**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| "Describe tu proceso" → generación de workflow con LLM | P0 | 5 días | Backend |
| Prompt engineering para traducciones precisas NL→Steps | P0 | 3 días | Backend |
| Preview visual antes de crear (confirm & edit) | P1 | 3 días | Frontend |
| Mejorar IA Dashboard: sugerencias contextuales | P1 | 3 días | Full-stack |
| Autopilot para debugging de workflows fallidos | P1 | 3 días | Backend |
| Asistente conversacional integrado en Studio | P2 | 3 días | Full-stack |

**Entregable May:** Healing agents (PRIMERO que AA y BP), NL-to-Automation mejorado

---

#### MES 5: JUNIO 2026 — IDP Avanzado + Computer Vision

**Sprint 9 (Jun 2-13): Document Understanding v2**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Clasificación automática de documentos (factura, contrato, ID) | P0 | 4 días | Backend |
| Extracción de campos con modelos pre-entrenados | P0 | 5 días | Backend |
| Validation station: revisión humana en el loop | P0 | 4 días | Full-stack |
| Entrenamiento de modelos custom por cliente | P1 | 3 días | Backend |
| Soporte multi-idioma en OCR (ES, EN, PT, FR) | P1 | 2 días | Backend |
| Integración con Google Vision, AWS Textract, Azure Form Recognizer | P1 | 3 días | Backend |

**Sprint 10 (Jun 16-27): Computer Vision + Image Automation**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Detección de elementos UI por imagen (template matching) | P1 | 4 días | Backend |
| Computer Vision para apps sin API (Citrix, VDI mejorado) | P1 | 5 días | Backend |
| Anchor-based element location (relativo a otros elementos) | P1 | 3 días | Backend |
| Recording visual: grabar acciones con screenshots anotados | P1 | 4 días | Full-stack |

**Entregable Jun:** IDP competitivo con UiPath, Computer Vision para legacy apps

---

### FASE 3: PLATAFORMA Y COMERCIALIZACIÓN (Jul - Sep 2026)
**Objetivo:** Marketplace, comunidad, documentación y cloud managed

---

#### MES 6: JULIO 2026 — Marketplace + API Pública

**Sprint 11 (Jul 1-11): Marketplace v1**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Portal de marketplace: browse, search, filter, ratings | P0 | 5 días | Full-stack |
| Sistema de publicación de componentes por terceros | P0 | 4 días | Backend |
| Instalación one-click de componentes/templates | P0 | 3 días | Full-stack |
| Sistema de reviews y ratings | P1 | 2 días | Full-stack |
| Revenue sharing: 70% developer / 30% plataforma | P1 | 3 días | Backend |
| SDK para developers externos | P1 | 4 días | Backend |

**Sprint 12 (Jul 14-25): API Pública + Webhooks**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| REST API pública documentada (OpenAPI/Swagger) | P0 | 4 días | Backend |
| API Keys + rate limiting + quotas | P0 | 3 días | Backend |
| Webhooks configurables (workflow completed, failed, etc.) | P0 | 3 días | Backend |
| SDK JavaScript/Python para integración programática | P1 | 4 días | Backend |
| Portal de documentación API interactivo | P1 | 3 días | Frontend |

**Entregable Jul:** Marketplace funcional, API pública, SDK para developers

---

#### MES 7: AGOSTO 2026 — Documentación + Comunidad + Mobile

**Sprint 13 (Ago 1-15): Documentación y Training**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Portal de documentación completo (Docusaurus/GitBook) | P0 | 5 días | Docs |
| Video tutoriales: 20+ videos de funcionalidades core | P0 | 8 días | Docs |
| Guías de inicio rápido por caso de uso (10+ guías) | P0 | 4 días | Docs |
| Documentación de API con ejemplos por endpoint | P1 | 3 días | Docs |
| Base de conocimiento de errores comunes + soluciones | P1 | 2 días | Docs |

**Sprint 14 (Ago 18-29): Comunidad + Mobile App**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Foro de comunidad (Discourse o custom) | P1 | 4 días | Full-stack |
| Portal de feature requests y votación | P1 | 3 días | Full-stack |
| App móvil / PWA: monitoreo de ejecuciones | P1 | 5 días | Mobile |
| App móvil: trigger de workflows desde teléfono | P2 | 3 días | Mobile |
| Notificaciones push de fallos y alertas | P1 | 2 días | Mobile |
| Blog técnico con artículos de automatización | P2 | 3 días | Marketing |

**Entregable Ago:** Documentación completa, comunidad online, app móvil/PWA

---

#### MES 8: SEPTIEMBRE 2026 — Cloud Managed + Multi-tenancy

**Sprint 15 (Sep 1-12): Cloud Platform**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Alqvimia Cloud: hosting managed en AWS/Azure | P0 | 5 días | DevOps |
| Onboarding SaaS: registro → trial → workspace | P0 | 4 días | Full-stack |
| Multi-tenancy: aislamiento de datos por organización | P0 | 5 días | Backend |
| Custom domains por tenant | P2 | 2 días | DevOps |
| Auto-scaling con Kubernetes HPA | P1 | 3 días | DevOps |

**Sprint 16 (Sep 15-26): Billing + Licensing**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Integración Stripe: planes, suscripciones, cobros | P0 | 4 días | Backend |
| Portal de cliente: facturación, plan, uso | P0 | 4 días | Full-stack |
| Enforcement de límites por plan | P0 | 3 días | Backend |
| Upgrade/downgrade flows | P1 | 2 días | Full-stack |
| Pasarelas LATAM: MercadoPago, Conekta | P1 | 3 días | Backend |
| Facturación México: CFDI 4.0 + Zoho Books | P1 | 3 días | Backend |

**Entregable Sep:** Alqvimia Cloud lanzado, billing funcional, SaaS operativo

---

### FASE 4: ENTERPRISE + CERTIFICACIONES (Oct - Dic 2026)
**Objetivo:** Alcanzar nivel enterprise con certificaciones y features avanzados

---

#### MES 9: OCTUBRE 2026 — Enterprise Features

**Sprint 17 (Oct 1-10): Governance + Compliance**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Centro de governance: políticas de ejecución, aprobaciones | P0 | 5 días | Full-stack |
| Data Loss Prevention: detección de datos sensibles en logs | P1 | 3 días | Backend |
| Retention policies: auto-purge de logs/data | P1 | 2 días | Backend |
| Export de audit logs para SIEM (Splunk, ELK) | P1 | 3 días | Backend |
| Clasificación de workflows por sensitivity level | P2 | 2 días | Full-stack |

**Sprint 18 (Oct 13-24): White Label + SLA**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| White-label: logo, colores, dominio customizables | P1 | 4 días | Full-stack |
| SLA monitoring: uptime, response time, error rate | P1 | 3 días | Backend |
| Disaster recovery: backup automático + restore | P0 | 4 días | DevOps |
| Test automation framework para workflows | P1 | 4 días | QA |
| Environments: dev → staging → production pipeline | P1 | 3 días | Full-stack |

**Entregable Oct:** Governance center, white-label, DR, test automation

---

#### MES 10: NOVIEMBRE 2026 — Certificaciones + Programa de Partners

**Sprint 19 (Nov 1-14): Preparación SOC 2 + ISO**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Documentar políticas de seguridad (access control, encryption) | P0 | 5 días | Security |
| Penetration testing + remediación de vulnerabilidades | P0 | 5 días | Security |
| Implementar controles SOC 2 Type 1 requeridos | P0 | 5 días | Backend |
| Contratar auditoría SOC 2 (iniciar proceso) | P0 | 1 día | Management |
| Documentar controles ISO 27001 | P1 | 4 días | Security |
| GDPR compliance toolkit para clientes EU | P1 | 3 días | Legal/Backend |

**Sprint 20 (Nov 17-28): Programa de Partners + Training**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Programa de certificación Alqvimia Developer | P1 | 5 días | Training |
| Plataforma e-learning con cursos y exámenes | P1 | 5 días | Full-stack |
| Programa de partners: tiers, beneficios, registro | P1 | 3 días | Business |
| Partner portal con materiales de venta y demos | P1 | 3 días | Marketing |
| Casos de éxito documentados (3+ clientes) | P1 | 3 días | Marketing |

**Entregable Nov:** SOC 2 en proceso, programa de training, partner program

---

#### MES 11: DICIEMBRE 2026 — Polish + Launch

**Sprint 21 (Dic 1-12): Testing + Optimización**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Load testing: 100+ workflows concurrentes | P0 | 3 días | QA |
| Performance optimization del frontend (bundle size, lazy load) | P1 | 3 días | Frontend |
| E2E testing suite completa (Cypress/Playwright) | P0 | 5 días | QA |
| Security audit final + fixes | P0 | 3 días | Security |
| UX review completo + ajustes | P1 | 3 días | UX |

**Sprint 22 (Dic 15-26): Launch + GTM**

| Tarea | Prioridad | Esfuerzo | Responsable |
|-------|-----------|----------|-------------|
| Landing page con pricing, features, comparativa | P0 | 4 días | Marketing |
| Onboarding optimizado: signup → first workflow < 10 min | P0 | 3 días | Full-stack |
| Demo automatizada interactiva | P1 | 3 días | Marketing |
| Press release + outreach a analistas (Gartner, Forrester) | P1 | 2 días | PR |
| Launch de Alqvimia 3.0 Enterprise | P0 | 1 día | All |

**Entregable Dic:** Alqvimia 3.0 Enterprise lanzado, competitivo en todos los frentes

---

## TIMELINE VISUAL

```
2026  Feb    Mar    Abr    May    Jun    Jul    Ago    Sep    Oct    Nov    Dic
      ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
      │▓▓▓▓▓▓▓▓▓▓▓▓│      │      │      │      │      │      │      │      │
      │ SEGURIDAD  │      │      │      │      │      │      │      │      │
      │ SSO/MFA    │      │      │      │      │      │      │      │      │
      │ ORQUESTADOR│      │      │      │      │      │      │      │      │
      │            │▓▓▓▓▓▓│      │      │      │      │      │      │      │
      │            │ESCALA│      │      │      │      │      │      │      │
      │            │ .EXE │      │      │      │      │      │      │      │
      │            │      │▓▓▓▓▓▓▓▓▓▓▓▓▓│      │      │      │      │      │
      │            │      │PROCESS MINE │      │      │      │      │      │
      │            │      │TASK MINING  │      │      │      │      │      │
      │            │      │             │▓▓▓▓▓▓│      │      │      │      │
      │            │      │             │HEALING│      │      │      │      │
      │            │      │             │NL→RPA │      │      │      │      │
      │            │      │             │      │▓▓▓▓▓▓│      │      │      │
      │            │      │             │      │ IDP  │      │      │      │
      │            │      │             │      │VISION│      │      │      │
      │            │      │             │      │      │▓▓▓▓▓▓│      │      │
      │            │      │             │      │      │MARKET│      │      │
      │            │      │             │      │      │ API  │      │      │
      │            │      │             │      │      │      │▓▓▓▓▓▓│      │
      │            │      │             │      │      │      │ DOCS │      │
      │            │      │             │      │      │      │MOBILE│      │
      │            │      │             │      │      │      │      │▓▓▓▓▓▓│
      │            │      │             │      │      │      │      │CLOUD │
      │            │      │             │      │      │      │      │SAAS  │
      │            │      │             │      │      │      │      │      │▓▓▓▓▓▓▓▓▓▓▓▓│
      │            │      │             │      │      │      │      │      │ENTERPRISE  │
      │            │      │             │      │      │      │      │      │CERTS+LAUNCH│
      ├──────┴──────┼──────┴─────────────┼──────┴──────┼──────┴──────┼──────┴──────┤
      │  FASE 1     │     FASE 2         │   FASE 3    │   FASE 3    │   FASE 4    │
      │ Fundamentos │  Inteligencia      │ Plataforma  │ Plataforma  │ Enterprise  │
      │  Enterprise │   & Discovery      │   & Comercio│   & Comercio│ & Certs     │
      └─────────────┴────────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## KPIs DE PROGRESO MENSUAL

| Mes | Scoring Target | Features Clave | Métrica de Éxito |
|-----|---------------|----------------|------------------|
| Feb | 6.5 → 7.0 | SSO, MFA, RBAC, Audit Trail, Orquestador v2 | Login con Azure AD funcional |
| Mar | 7.0 → 7.3 | Multi-nodo, Ejecutables, Robot CLI | 50+ workflows concurrentes |
| Abr | 7.3 → 7.6 | Process Mining, Task Mining | Process map visualizado |
| May | 7.6 → 7.8 | Healing Agents, NL→Automation | Auto-fix de selector roto |
| Jun | 7.8 → 8.0 | IDP v2, Computer Vision | Factura extraída con 95%+ accuracy |
| Jul | 8.0 → 8.1 | Marketplace, API Pública | 10+ componentes en marketplace |
| Ago | 8.1 → 8.2 | Docs, Comunidad, Mobile | 20+ video tutoriales publicados |
| Sep | 8.2 → 8.3 | Cloud SaaS, Billing | 5+ clientes en cloud |
| Oct | 8.3 → 8.4 | Governance, White-label, DR | DR test exitoso |
| Nov | 8.4 → 8.5 | SOC 2 iniciado, Training platform | Auditoría SOC 2 contratada |
| Dic | 8.5 | Launch 3.0, Landing, Demos | Alqvimia 3.0 Enterprise live |

---
---
---

# PROYECTO DE REQUERIMIENTOS NUEVOS

## Clasificación de Prioridades

```
P0 = CRÍTICO    → Bloquea ventas enterprise / gap competitivo severo
P1 = ALTO       → Diferenciador importante / esperado por el mercado
P2 = MEDIO      → Nice-to-have competitivo / mejora significativa
P3 = BAJO       → Futuro / innovación / diferenciador no urgente
```

---

## GRUPO 1: SEGURIDAD Y COMPLIANCE (P0 - CRÍTICO)

> **Justificación:** Sin estas features, Alqvimia NO puede venderse a empresas medianas/grandes.
> UiPath (10/10), AA (9/10), BP (9/10) vs Alqvimia (4/10)

### 1.1 Autenticación Enterprise

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| SEC-001 | SSO con SAML 2.0 (Azure AD, Okta, Google Workspace) | P0 | Alta | S1 |
| SEC-002 | SSO con OpenID Connect (OIDC) | P0 | Alta | S1 |
| SEC-003 | MFA con TOTP (Google Authenticator, Authy) | P0 | Media | S1 |
| SEC-004 | MFA con SMS (Twilio) | P1 | Media | S1 |
| SEC-005 | MFA con email (código de verificación) | P1 | Baja | S1 |
| SEC-006 | Password policies: complejidad, expiración, historial | P0 | Baja | S1 |
| SEC-007 | Account lockout tras N intentos fallidos | P0 | Baja | S1 |
| SEC-008 | Session timeout configurable por organización | P1 | Baja | S1 |
| SEC-009 | IP whitelisting por organización | P1 | Media | S3 |

### 1.2 RBAC y Permisos

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| SEC-010 | Roles predefinidos: Admin, Developer, Operator, Viewer, Auditor | P0 | Media | S1 |
| SEC-011 | Permisos granulares: por workflow, por carpeta, por acción | P0 | Alta | S1 |
| SEC-012 | Grupos de usuarios con herencia de permisos | P1 | Media | S3 |
| SEC-013 | Segregación de duties (aprobación de otro usuario para ejecutar) | P1 | Alta | S17 |
| SEC-014 | API de gestión de usuarios y roles | P1 | Media | S12 |

### 1.3 Audit Trail y Compliance

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| SEC-015 | Audit log inmutable: todas las acciones de usuario | P0 | Alta | S2 |
| SEC-016 | Audit log de ejecuciones: input/output de cada step | P0 | Media | S2 |
| SEC-017 | Exportar audit logs a SIEM (Splunk, ELK, Datadog) | P1 | Media | S17 |
| SEC-018 | Retention policies configurables para logs | P1 | Baja | S17 |
| SEC-019 | Compliance reports auto-generados (quién accedió qué) | P1 | Media | S17 |
| SEC-020 | Data masking en logs (ocultar datos sensibles) | P0 | Media | S17 |

### 1.4 Encriptación y Credenciales

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| SEC-021 | Encriptación at-rest AES-256 para credenciales | P0 | Media | S1 |
| SEC-022 | Credential vault centralizado con acceso por roles | P0 | Alta | S1 |
| SEC-023 | Integración con HashiCorp Vault | P2 | Media | S17 |
| SEC-024 | Integración con Azure Key Vault | P2 | Media | S17 |
| SEC-025 | Integración con AWS Secrets Manager | P2 | Media | S17 |
| SEC-026 | Rotación automática de credenciales | P2 | Alta | S17 |

### 1.5 Certificaciones (Proceso)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| SEC-027 | Implementar controles SOC 2 Type 1 | P0 | Muy Alta | S19 |
| SEC-028 | Contratar auditoría SOC 2 | P0 | N/A | S19 |
| SEC-029 | Documentar controles ISO 27001 | P1 | Alta | S19 |
| SEC-030 | GDPR compliance toolkit | P1 | Media | S19 |
| SEC-031 | HIPAA compliance (BAA templates) | P2 | Media | S19 |

**Total requerimientos Grupo 1: 31**

---

## GRUPO 2: ESCALABILIDAD Y ARQUITECTURA (P0 - CRÍTICO)

> **Justificación:** Alqvimia single-server no puede manejar workloads enterprise.
> UiPath (miles de robots), AA (cloud-native), BP (enterprise) vs Alqvimia (1 server)

### 2.1 Arquitectura Multi-nodo

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ARC-001 | API Gateway centralizado (Express + middleware) | P0 | Alta | S3 |
| ARC-002 | Worker pool distribuido con BullMQ/Redis | P0 | Muy Alta | S3 |
| ARC-003 | Load balancer con health checks y failover | P0 | Media | S3 |
| ARC-004 | Shared state con Redis (sessions, cache, locks) | P0 | Media | S3 |
| ARC-005 | Connection pooling para MySQL | P0 | Baja | S3 |
| ARC-006 | Read replicas para consultas de reporting | P2 | Media | S3 |

### 2.2 Containerización y Orquestación

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ARC-007 | Docker Compose multi-servicio (api, workers, scheduler, redis) | P0 | Media | S3 |
| ARC-008 | Kubernetes manifests (deployment, service, ingress, HPA) | P1 | Alta | S3 |
| ARC-009 | Helm chart para despliegue simplificado | P2 | Media | S15 |
| ARC-010 | Auto-scaling basado en cola de ejecución | P1 | Alta | S15 |
| ARC-011 | Health monitoring con Prometheus + Grafana | P1 | Media | S15 |

### 2.3 Orquestador Avanzado

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ARC-012 | Cola de ejecución con prioridades | P0 | Alta | S2 |
| ARC-013 | Ejecución paralela de N workflows simultáneos | P0 | Alta | S2 |
| ARC-014 | Triggers: webhook, file watcher, email, API, schedule | P0 | Alta | S2 |
| ARC-015 | Retry automático con backoff exponencial | P0 | Media | S2 |
| ARC-016 | Dead letter queue para workflows que fallan N veces | P1 | Media | S2 |
| ARC-017 | Queue dashboard: pending, running, completed, failed | P0 | Media | S2 |
| ARC-018 | Workflow dependencies: A→B→C (encadenamiento) | P1 | Alta | S12 |
| ARC-019 | Parallel execution de branches dentro de un workflow | P1 | Muy Alta | S12 |
| ARC-020 | Resource locking: prevenir ejecución simultánea del mismo workflow | P0 | Media | S2 |

### 2.4 Ejecutables y Distribución

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ARC-021 | Alqvimia Studio como app Electron (Win/Mac/Linux) | P0 | Muy Alta | S4 |
| ARC-022 | Auto-updater integrado (delta updates) | P1 | Alta | S4 |
| ARC-023 | Alqvimia Robot CLI: ejecutor headless | P0 | Alta | S4 |
| ARC-024 | Instalador .exe/.msi con firma de código (code signing) | P1 | Media | S4 |
| ARC-025 | Sistema de licencias offline con firma RSA | P0 | Alta | S4 |
| ARC-026 | CI/CD pipeline para builds automáticos por plataforma | P1 | Media | S4 |

**Total requerimientos Grupo 2: 26**

---

## GRUPO 3: INTELIGENCIA ARTIFICIAL AVANZADA (P1 - ALTO)

> **Justificación:** IA es el mayor diferenciador futuro del mercado RPA.
> UiPath (10/10), AA (8/10) vs Alqvimia (6/10) — debemos llegar a 8.5/10

### 3.1 Healing Agents (Self-Repair)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-001 | Detector de selectores rotos (CSS/XPath mutados) | P0 | Alta | S7 |
| AI-002 | Generación de selectores alternativos con heurísticas | P0 | Alta | S7 |
| AI-003 | Retry con variaciones de selector (fuzzy matching) | P0 | Alta | S7 |
| AI-004 | Auto-screenshot en fallo + análisis visual | P1 | Media | S7 |
| AI-005 | Fragility score por workflow (probabilidad de fallo) | P1 | Media | S7 |
| AI-006 | Notificaciones proactivas de workflows en riesgo | P2 | Baja | S7 |
| AI-007 | Auto-fix sin intervención humana (modo healing) | P1 | Muy Alta | S7 |

### 3.2 Natural Language to Automation

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-008 | Input en lenguaje natural → workflow completo | P0 | Muy Alta | S8 |
| AI-009 | Prompt templates optimizados por tipo de proceso | P1 | Media | S8 |
| AI-010 | Preview visual del workflow antes de crear | P0 | Media | S8 |
| AI-011 | Edición interactiva: "agrega un paso de..." | P1 | Alta | S8 |
| AI-012 | Detección de intent: ¿qué quiere automatizar el usuario? | P2 | Alta | S8 |

### 3.3 Document Understanding v2 (IDP)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-013 | Clasificación automática de documentos (invoice, receipt, ID, contract) | P0 | Alta | S9 |
| AI-014 | Extracción de campos con modelos pre-entrenados | P0 | Muy Alta | S9 |
| AI-015 | Validation station: UI para revisión humana | P0 | Alta | S9 |
| AI-016 | Training de modelos custom con datos del cliente | P1 | Muy Alta | S9 |
| AI-017 | Multi-idioma en OCR/IDP (ES, EN, PT, FR, DE) | P1 | Media | S9 |
| AI-018 | Integración Google Vision API | P1 | Media | S9 |
| AI-019 | Integración AWS Textract | P1 | Media | S9 |
| AI-020 | Integración Azure Form Recognizer | P1 | Media | S9 |
| AI-021 | Métricas de accuracy por modelo y tipo de documento | P1 | Media | S9 |

### 3.4 Asistente IA (Copilot)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-022 | Chat asistente dentro del Studio (panel lateral) | P1 | Alta | S8 |
| AI-023 | Sugerencias de siguiente paso al diseñar workflow | P2 | Alta | S8 |
| AI-024 | Autopilot para debugging: explica por qué falló | P1 | Alta | S8 |
| AI-025 | Generación de test cases para workflows | P2 | Alta | S18 |
| AI-026 | Optimización de workflows: detectar redundancias | P2 | Media | S18 |

### 3.5 Process Mining

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-027 | Importador de event logs (CSV, XES, DB) | P0 | Media | S5 |
| AI-028 | Motor de descubrimiento de procesos (Alpha Algorithm) | P0 | Muy Alta | S5 |
| AI-029 | Visualización de process maps (BPMN-like) | P0 | Alta | S5 |
| AI-030 | Detección de cuellos de botella | P1 | Alta | S5 |
| AI-031 | Análisis de variantes de proceso | P1 | Alta | S5 |
| AI-032 | KPIs: lead time, throughput, rework rate, automation rate | P1 | Media | S5 |
| AI-033 | Conformance checking: real vs ideal | P2 | Muy Alta | S5 |
| AI-034 | Exportar proceso descubierto → workflow Alqvimia | P1 | Alta | S5 |

### 3.6 Task Mining

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-035 | Agente desktop de captura (clicks, keystrokes, apps usadas) | P1 | Muy Alta | S6 |
| AI-036 | Detección de patrones repetitivos con ML | P1 | Muy Alta | S6 |
| AI-037 | Agrupación de tareas en procesos | P1 | Alta | S6 |
| AI-038 | Generación de workflow skeleton desde tarea capturada | P1 | Alta | S6 |
| AI-039 | Dashboard de tareas descubiertas con potencial de automatización | P1 | Media | S6 |

### 3.7 Computer Vision

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| AI-040 | Template matching para detección de UI elements | P1 | Alta | S10 |
| AI-041 | Anchor-based element location | P1 | Alta | S10 |
| AI-042 | OCR en tiempo real para aplicaciones sin API | P1 | Alta | S10 |
| AI-043 | Recording visual con screenshots anotados | P1 | Alta | S10 |

**Total requerimientos Grupo 3: 43**

---

## GRUPO 4: PLATAFORMA Y COMERCIALIZACIÓN (P1 - ALTO)

> **Justificación:** Sin marketplace, API y cloud, no podemos competir comercialmente.

### 4.1 Marketplace

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| PLT-001 | Portal de marketplace: browse, search, categorías | P0 | Alta | S11 |
| PLT-002 | Sistema de publicación de componentes | P0 | Alta | S11 |
| PLT-003 | Instalación one-click de componentes | P0 | Media | S11 |
| PLT-004 | Sistema de reviews y ratings (1-5 estrellas) | P1 | Media | S11 |
| PLT-005 | Revenue sharing 70/30 con developers | P1 | Alta | S11 |
| PLT-006 | SDK para crear componentes de marketplace | P1 | Alta | S11 |
| PLT-007 | Verificación/curación de componentes (security scan) | P1 | Alta | S11 |
| PLT-008 | Analytics para publishers (downloads, revenue) | P2 | Media | S11 |

### 4.2 API Pública

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| PLT-009 | REST API pública completa (workflows, executions, users) | P0 | Alta | S12 |
| PLT-010 | Documentación OpenAPI/Swagger interactiva | P0 | Media | S12 |
| PLT-011 | API Keys con scopes y rate limiting | P0 | Media | S12 |
| PLT-012 | Webhooks configurables (8+ eventos) | P0 | Media | S12 |
| PLT-013 | SDK JavaScript para integración | P1 | Alta | S12 |
| PLT-014 | SDK Python para integración | P1 | Alta | S12 |
| PLT-015 | Sandbox/playground para probar API | P2 | Media | S12 |

### 4.3 Cloud Managed (SaaS)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| PLT-016 | Alqvimia Cloud hosting en AWS/Azure | P0 | Muy Alta | S15 |
| PLT-017 | Onboarding SaaS: registro → trial → workspace | P0 | Alta | S15 |
| PLT-018 | Multi-tenancy con aislamiento de datos | P0 | Muy Alta | S15 |
| PLT-019 | Custom domains por tenant | P2 | Media | S15 |
| PLT-020 | Auto-scaling (Kubernetes HPA) | P1 | Alta | S15 |
| PLT-021 | CDN para assets estáticos | P1 | Baja | S15 |
| PLT-022 | Global regions (US, EU, LATAM) | P2 | Alta | S15 |

### 4.4 Billing y Licensing

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| PLT-023 | Integración Stripe: plans, subscriptions, invoices | P0 | Alta | S16 |
| PLT-024 | Portal de cliente: billing, plan, uso, facturas | P0 | Alta | S16 |
| PLT-025 | Enforcement de límites por plan (robots, workflows, exec) | P0 | Media | S16 |
| PLT-026 | Upgrade/downgrade self-service | P1 | Media | S16 |
| PLT-027 | Free trial de 14 días con full features | P0 | Media | S16 |
| PLT-028 | Pasarela MercadoPago para LATAM | P1 | Media | S16 |
| PLT-029 | Pasarela Conekta para México (SPEI, OXXO) | P2 | Media | S16 |
| PLT-030 | Facturación México CFDI 4.0 | P1 | Alta | S16 |
| PLT-031 | Dunning management (cobros fallidos) | P1 | Media | S16 |
| PLT-032 | Usage-based billing metering | P2 | Alta | S16 |

**Total requerimientos Grupo 4: 32**

---

## GRUPO 5: EXPERIENCIA DE USUARIO Y DOCUMENTACIÓN (P1 - ALTO)

> **Justificación:** Sin docs y comunidad, la adopción no escala.
> UiPath (3M community, Academy) vs Alqvimia (0)

### 5.1 Documentación

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| UX-001 | Portal de documentación (Docusaurus/GitBook) | P0 | Media | S13 |
| UX-002 | Documentación de todas las 350+ acciones | P0 | Alta | S13 |
| UX-003 | 10+ guías de inicio rápido por caso de uso | P0 | Media | S13 |
| UX-004 | 20+ video tutoriales de funcionalidades core | P0 | Alta | S13 |
| UX-005 | Documentación de API con ejemplos por endpoint | P1 | Media | S13 |
| UX-006 | Base de conocimiento de errores + soluciones | P1 | Media | S13 |
| UX-007 | Changelog público de versiones | P1 | Baja | S13 |
| UX-008 | Documentación multi-idioma (ES, EN, PT) | P2 | Alta | S13 |

### 5.2 Comunidad

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| UX-009 | Foro de comunidad (Discourse o custom) | P1 | Media | S14 |
| UX-010 | Portal de feature requests con votación | P1 | Media | S14 |
| UX-011 | Programa de beta testers | P2 | Baja | S14 |
| UX-012 | Blog técnico con artículos de automatización | P2 | Baja | S14 |
| UX-013 | GitHub public para issues y discussions | P1 | Baja | S14 |
| UX-014 | Newsletter mensual de producto | P2 | Baja | S14 |

### 5.3 Training y Certificación

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| UX-015 | Plataforma e-learning (cursos, quizzes, certificados) | P1 | Alta | S20 |
| UX-016 | Certificación "Alqvimia Developer Associate" | P1 | Media | S20 |
| UX-017 | Certificación "Alqvimia Developer Professional" | P2 | Media | S20 |
| UX-018 | Sandbox/playground para práctica | P1 | Alta | S20 |
| UX-019 | Workshops mensuales en vivo (webinars) | P2 | Baja | S20 |

### 5.4 Mobile App

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| UX-020 | PWA: monitoreo de ejecuciones en tiempo real | P1 | Alta | S14 |
| UX-021 | PWA: trigger de workflows desde móvil | P1 | Media | S14 |
| UX-022 | Notificaciones push de fallos y alertas | P1 | Media | S14 |
| UX-023 | Dashboard responsive para tablet | P2 | Media | S14 |

### 5.5 UX del Studio

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| UX-024 | Undo/Redo ilimitado en el workflow designer | P0 | Media | S1 |
| UX-025 | Copy/paste de steps entre workflows | P0 | Media | S1 |
| UX-026 | Minimap de workflow (overview de todo el flujo) | P1 | Media | S8 |
| UX-027 | Búsqueda global de acciones, workflows, variables | P1 | Media | S8 |
| UX-028 | Keyboard shortcuts configurables | P2 | Baja | S14 |
| UX-029 | Temas oscuro/claro seleccionable | P2 | Baja | S14 |
| UX-030 | Git integration: versionar workflows | P1 | Alta | S18 |

**Total requerimientos Grupo 5: 30**

---

## GRUPO 6: ENTERPRISE FEATURES (P1 - ALTO)

> **Justificación:** Features que cierran deals enterprise con Fortune 500.

### 6.1 Governance Center

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-001 | Centro de governance: políticas, aprobaciones, compliance | P0 | Alta | S17 |
| ENT-002 | Approval workflows: dev → QA → prod pipeline | P0 | Alta | S17 |
| ENT-003 | Data Loss Prevention: detectar PII/PHI en logs | P1 | Alta | S17 |
| ENT-004 | Environments: development / staging / production | P0 | Alta | S18 |
| ENT-005 | Promotion de workflows entre environments | P0 | Alta | S18 |
| ENT-006 | Version control integrado para workflows | P1 | Alta | S18 |

### 6.2 White Label

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-007 | Customización de logo, colores, nombre de app | P1 | Media | S18 |
| ENT-008 | Custom domain con SSL | P1 | Media | S18 |
| ENT-009 | Branding en emails y notificaciones | P2 | Baja | S18 |
| ENT-010 | Login page customizable | P2 | Baja | S18 |

### 6.3 Disaster Recovery

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-011 | Backup automático programado (DB + workflows + config) | P0 | Media | S18 |
| ENT-012 | Restore one-click desde backup | P0 | Alta | S18 |
| ENT-013 | Backup offsite (S3/Azure Blob) | P1 | Media | S18 |
| ENT-014 | DR testing automatizado mensual | P2 | Alta | S18 |

### 6.4 Testing Framework

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-015 | Test runner para workflows (assertions, mocks) | P1 | Alta | S18 |
| ENT-016 | Test data management | P1 | Media | S18 |
| ENT-017 | Regression testing automatizado | P2 | Alta | S18 |
| ENT-018 | Coverage report de workflows | P2 | Media | S18 |

### 6.5 Partner Program

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-019 | Portal de partners con tiers (Silver, Gold, Platinum) | P1 | Media | S20 |
| ENT-020 | Deal registration y co-selling | P2 | Media | S20 |
| ENT-021 | Partner directory público | P2 | Baja | S20 |
| ENT-022 | NFR licenses para partners | P1 | Baja | S20 |

### 6.6 Marketing y GTM

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| ENT-023 | Landing page con pricing, features, comparativa | P0 | Media | S22 |
| ENT-024 | Demo interactiva automatizada | P1 | Alta | S22 |
| ENT-025 | 3+ casos de éxito documentados | P1 | Baja | S20 |
| ENT-026 | ROI calculator para prospects | P2 | Media | S22 |
| ENT-027 | Submission a Gartner Peer Insights | P1 | Baja | S22 |
| ENT-028 | Submission para evaluación Forrester Wave | P2 | Baja | S22 |

**Total requerimientos Grupo 6: 28**

---

## GRUPO 7: MEJORAS AL CORE RPA (P2 - MEDIO)

> **Justificación:** Pulir lo que ya existe para estar al nivel de las features existentes de UiPath.

### 7.1 Workflow Designer

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| RPA-001 | Flowchart view (además del sequential actual) | P1 | Muy Alta | S8 |
| RPA-002 | State Machine view para procesos complejos | P2 | Muy Alta | S10 |
| RPA-003 | Subworkflows: invocar un workflow desde otro | P0 | Alta | S2 |
| RPA-004 | Argumentos de entrada/salida para subworkflows | P0 | Alta | S2 |
| RPA-005 | Global exception handler | P1 | Media | S7 |
| RPA-006 | Parallel execution de branches | P1 | Muy Alta | S12 |
| RPA-007 | Breakpoints para debugging paso a paso | P0 | Alta | S8 |
| RPA-008 | Watch de variables en runtime (debug panel) | P0 | Alta | S8 |
| RPA-009 | Step-over, step-into, step-out durante debug | P1 | Alta | S8 |
| RPA-010 | Workflow diff: comparar versiones | P2 | Alta | S18 |

### 7.2 Grabador Avanzado

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| RPA-011 | Grabador web mejorado: detecta tipos de input automáticamente | P1 | Alta | S10 |
| RPA-012 | Grabador desktop: captura acciones en apps Windows | P1 | Muy Alta | S10 |
| RPA-013 | Generación de múltiples selectores por elemento (resiliencia) | P0 | Alta | S7 |
| RPA-014 | Indicator (ancla visual) para selector más robusto | P1 | Alta | S10 |

### 7.3 Acciones Adicionales

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| RPA-015 | Clipboard: read/write con soporte de imágenes | P2 | Media | S14 |
| RPA-016 | Screen recording: grabar video de ejecución | P1 | Alta | S10 |
| RPA-017 | Notification channels: Slack, Discord, MS Teams webhook | P1 | Media | S11 |
| RPA-018 | Queue items: colas de trabajo estilo UiPath Queues | P0 | Alta | S12 |
| RPA-019 | Assets: key-value store global accesible desde workflows | P0 | Media | S2 |
| RPA-020 | DataTable operations mejoradas (join, pivot, group by) | P1 | Alta | S14 |

**Total requerimientos Grupo 7: 20**

---

## GRUPO 8: INNOVACIÓN Y DIFERENCIACIÓN (P2-P3)

> **Justificación:** Features que NINGÚN competidor tiene y dan ventaja única.
> Alqvimia ya tiene omnicanalidad, videoconferencia, migración — expandir estas ventajas.

### 8.1 Expandir Omnicanalidad (ya es exclusivo)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| INN-001 | Chatbot builder visual (drag & drop conversational flows) | P2 | Muy Alta | S14 |
| INN-002 | Integración con Instagram Direct Messages | P2 | Media | S14 |
| INN-003 | Integración con Facebook Messenger | P2 | Media | S14 |
| INN-004 | Integración con Slack bidireccional | P1 | Media | S11 |
| INN-005 | Voice bot: IVR con IA para atención telefónica | P3 | Muy Alta | Futuro |

### 8.2 Expandir Migración (ya es exclusivo)

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| INN-006 | Importar desde Automation Anywhere (JSON export) | P1 | Alta | S11 |
| INN-007 | Importar desde Zapier/Make (JSON) | P2 | Media | S11 |
| INN-008 | Importar desde n8n (JSON) | P2 | Media | S11 |
| INN-009 | Exportar workflows de Alqvimia → UiPath XAML | P3 | Muy Alta | Futuro |
| INN-010 | Migration wizard paso a paso con mapeo visual | P1 | Alta | S11 |

### 8.3 Low-Code App Builder

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| INN-011 | Form builder: crear formularios que alimentan workflows | P1 | Alta | S14 |
| INN-012 | Portal de usuario: dashboards self-service para end users | P2 | Alta | S15 |
| INN-013 | Formularios públicos con link compartible | P1 | Media | S14 |

### 8.4 RPA + IA Convergencia

| ID | Requerimiento | Prioridad | Complejidad | Sprint |
|----|--------------|-----------|-------------|--------|
| INN-014 | Agent orchestration: múltiples agentes IA cooperando | P1 | Muy Alta | S8 |
| INN-015 | RAG integrado: knowledge base por organización | P2 | Alta | S10 |
| INN-016 | Fine-tuning de modelos con datos del workflow | P3 | Muy Alta | Futuro |

**Total requerimientos Grupo 8: 16**

---

## RESUMEN CONSOLIDADO

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN DEL PROYECTO DE REQUERIMIENTOS                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  GRUPO 1: Seguridad y Compliance ........... 31 requerimientos  ████████████████ │
│  GRUPO 2: Escalabilidad y Arquitectura ..... 26 requerimientos  █████████████    │
│  GRUPO 3: IA Avanzada ...................... 43 requerimientos  █████████████████████ │
│  GRUPO 4: Plataforma y Comercialización .... 32 requerimientos  ████████████████ │
│  GRUPO 5: UX y Documentación .............. 30 requerimientos  ███████████████  │
│  GRUPO 6: Enterprise Features ............. 28 requerimientos  ██████████████   │
│  GRUPO 7: Mejoras Core RPA ................ 20 requerimientos  ██████████       │
│  GRUPO 8: Innovación y Diferenciación ...... 16 requerimientos  ████████         │
│                                                                                  │
│  ═══════════════════════════════════════════════════════════════                  │
│  TOTAL: 226 REQUERIMIENTOS                                                       │
│                                                                                  │
│  Por prioridad:                                                                  │
│    P0 (CRÍTICO) ........ 68 reqs (30%)  ← Febrero - Junio                       │
│    P1 (ALTO) ........... 98 reqs (43%)  ← Abril - Octubre                       │
│    P2 (MEDIO) .......... 42 reqs (19%)  ← Julio - Noviembre                     │
│    P3 (BAJO/FUTURO) .... 18 reqs (8%)   ← 2027+                                │
│                                                                                  │
│  Por fase:                                                                       │
│    FASE 1 (Feb-Mar): Fundamentos Enterprise ........ 57 reqs                    │
│    FASE 2 (Abr-Jun): Inteligencia y Discovery ...... 82 reqs                    │
│    FASE 3 (Jul-Sep): Plataforma y Comercio ......... 55 reqs                    │
│    FASE 4 (Oct-Dic): Enterprise y Certificaciones .. 32 reqs                    │
│                                                                                  │
│  META: Pasar de 6.5/10 a 8.5/10 en scoring competitivo                         │
│  RESULTADO: Superar a Blue Prism, igualar Automation Anywhere,                  │
│             competir con UiPath en features (no en market share)                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Matriz de Impacto vs Esfuerzo

```
                        ALTO IMPACTO
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          │  HACER PRIMERO  │  PLANIFICAR     │
          │                 │                 │
          │  • SSO/MFA      │  • Process Mine │
          │  • Multi-nodo   │  • Cloud SaaS   │
          │  • Orquestador  │  • Marketplace  │
          │  • Ejecutables  │  • IDP v2       │
          │  • Audit Trail  │  • Healing      │
          │                 │                 │
  BAJO ───┼─────────────────┼─────────────────┼─── ALTO
  ESFUERZO│                 │                 │  ESFUERZO
          │  QUICK WINS     │  CONSIDERAR     │
          │                 │                 │
          │  • Undo/Redo    │  • Task Mining  │
          │  • Copy/Paste   │  • Computer Vis │
          │  • Subworkflows │  • App Builder  │
          │  • Docs portal  │  • White Label  │
          │  • Breakpoints  │  • E-learning   │
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                       BAJO IMPACTO
```

---

*Plan generado: 2026-02-09*
*Basado en: Análisis Competitivo Exhaustivo Alqvimia vs UiPath vs AA vs Blue Prism vs Rocketbot*
*Versión: 2.0*
