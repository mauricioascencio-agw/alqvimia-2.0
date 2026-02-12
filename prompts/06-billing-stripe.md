# PROMPT 06: Billing SaaS con Stripe

## POR QUÉ
Alqvimia es un PRODUCTO DE PAGO, no open-source. Necesitamos:
- Cobrar suscripciones mensuales/anuales por plan
- Enforcement de límites por plan (robots, workflows, ejecuciones)
- Portal de cliente para gestionar su suscripción
- Free trial de 14 días para captar clientes
- Pasarelas LATAM (MercadoPago) para el futuro
Sin billing no hay negocio. Sin enforcement de límites no hay razón para upgradearse.

## PROMPT PARA CLAUDE

```
Implementa el sistema de billing y suscripciones SaaS para Alqvimia RPA usando Stripe.

### CONTEXTO ACTUAL
- Multi-tenancy ya implementado (Prompt 02): cada organización tiene un plan
- Tabla `organizations` tiene columnas: plan, max_users, max_workflows, max_executions_month
- Auth con JWT y roles (Prompt 03)
- No hay integración de pagos actual

### PLANES DE SUSCRIPCIÓN

```javascript
const PLANS = {
  trial: {
    name: 'Trial',
    price: 0,
    duration: 14, // días
    limits: {
      users: 2,
      workflows: 5,
      executionsPerMonth: 500,
      robots: 1,
      storageGb: 1,
      agents: 3,
      features: ['basic_rpa', 'basic_ai']
    }
  },
  starter: {
    name: 'Starter',
    priceMonthly: 4900,  // $49 USD en centavos
    priceYearly: 47000,  // $470 USD (20% desc)
    limits: {
      users: 3,
      workflows: 10,
      executionsPerMonth: 2000,
      robots: 1,
      storageGb: 5,
      agents: 5,
      features: ['basic_rpa', 'basic_ai', 'scheduler']
    }
  },
  professional: {
    name: 'Professional',
    priceMonthly: 14900,  // $149 USD
    priceYearly: 143000,  // $1,430 USD
    limits: {
      users: 10,
      workflows: 50,
      executionsPerMonth: 10000,
      robots: 3,
      storageGb: 20,
      agents: 15,
      features: ['basic_rpa', 'advanced_ai', 'scheduler', 'api_access', 'email_support']
    }
  },
  business: {
    name: 'Business',
    priceMonthly: 39900,  // $399 USD
    priceYearly: 383000,  // $3,830 USD
    limits: {
      users: 30,
      workflows: 200,
      executionsPerMonth: 50000,
      robots: 10,
      storageGb: 100,
      agents: 'unlimited',
      features: ['basic_rpa', 'advanced_ai', 'scheduler', 'api_access', 'priority_support', 'sso', 'process_mining', 'audit_logs']
    }
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: null,  // Custom
    limits: {
      users: 'unlimited',
      workflows: 'unlimited',
      executionsPerMonth: 'unlimited',
      robots: 'unlimited',
      storageGb: 'unlimited',
      agents: 'unlimited',
      features: ['*']  // Todo
    }
  }
};
```

### LO QUE DEBES CREAR

#### 1. Setup de Stripe (`server/services/stripeService.js`)

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Crear customer en Stripe cuando se registra una organización
  async createCustomer(org, user) {}

  // Crear checkout session para suscripción
  async createCheckoutSession(tenantId, planId, interval) {}

  // Crear portal session para gestión de suscripción
  async createPortalSession(tenantId) {}

  // Cancelar suscripción
  async cancelSubscription(tenantId) {}

  // Cambiar plan (upgrade/downgrade)
  async changePlan(tenantId, newPlanId) {}

  // Obtener estado de suscripción
  async getSubscriptionStatus(tenantId) {}
}
```

#### 2. Webhooks de Stripe (`server/routes/webhooks.js`)

```javascript
// POST /api/webhooks/stripe (público, verificado por firma)
// Eventos que manejar:
// - checkout.session.completed → Activar plan
// - customer.subscription.updated → Actualizar plan/estado
// - customer.subscription.deleted → Cancelar/suspender
// - invoice.paid → Renovación exitosa
// - invoice.payment_failed → Notificar y dar gracia de 3 días
// - customer.subscription.trial_will_end → Notificar fin de trial

router.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  switch(event.type) {
    case 'checkout.session.completed':
      // Activar plan de la organización
      break;
    case 'invoice.payment_failed':
      // Enviar email de aviso, dar 3 días de gracia
      break;
    case 'customer.subscription.deleted':
      // Downgrade a trial o suspender
      break;
  }

  res.json({ received: true });
});
```

#### 3. Enforcement de límites (`server/middleware/planLimits.js`)

```javascript
// Middleware que verifica los límites ANTES de crear recursos

export function checkLimit(resource) {
  return async (req, res, next) => {
    const org = await getOrganization(req.tenantId);
    const plan = PLANS[org.plan];
    const limits = plan.limits;

    switch(resource) {
      case 'workflow': {
        const count = await countWorkflows(req.tenantId);
        if (limits.workflows !== 'unlimited' && count >= limits.workflows) {
          return res.status(403).json({
            error: 'plan_limit_reached',
            message: `Tu plan ${plan.name} permite máximo ${limits.workflows} workflows. Upgrade para más.`,
            currentUsage: count,
            limit: limits.workflows,
            upgradeUrl: '/settings?tab=billing'
          });
        }
        break;
      }
      case 'execution': {
        const monthlyCount = await countMonthlyExecutions(req.tenantId);
        if (limits.executionsPerMonth !== 'unlimited' && monthlyCount >= limits.executionsPerMonth) {
          return res.status(403).json({
            error: 'execution_limit_reached',
            message: `Has alcanzado las ${limits.executionsPerMonth} ejecuciones/mes de tu plan ${plan.name}.`,
            currentUsage: monthlyCount,
            limit: limits.executionsPerMonth,
            upgradeUrl: '/settings?tab=billing'
          });
        }
        break;
      }
      case 'user': {
        const userCount = await countUsers(req.tenantId);
        if (limits.users !== 'unlimited' && userCount >= limits.users) {
          return res.status(403).json({
            error: 'user_limit_reached',
            message: `Tu plan permite máximo ${limits.users} usuarios.`
          });
        }
        break;
      }
    }
    next();
  };
}

// Uso en rutas:
router.post('/api/workflows', checkLimit('workflow'), createWorkflow);
router.post('/api/workflows/:id/execute', checkLimit('execution'), executeWorkflow);
router.post('/api/users/invite', checkLimit('user'), inviteUser);
```

#### 4. Trial automático

```javascript
// Al registrarse:
// 1. Crear organización con plan='trial', trial_ends_at=now+14 días
// 2. Crear customer en Stripe (sin cobro)
// 3. Enviar email de bienvenida con countdown de trial

// Cron job diario:
// 1. Buscar organizaciones donde trial_ends_at < now AND plan='trial'
// 2. Enviar email "Tu trial termina en X días" a los 3 y 1 día
// 3. Al vencer: suspender organización, mostrar paywall
```

#### 5. Tablas de billing (`server/migrations/012_billing.sql`)

```sql
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) UNIQUE REFERENCES organizations(id),
    stripe_customer_id VARCHAR(100) UNIQUE,
    stripe_subscription_id VARCHAR(100),
    plan VARCHAR(50) NOT NULL,
    status ENUM('active','past_due','cancelled','suspended','trialing') DEFAULT 'trialing',
    billing_interval ENUM('monthly','yearly') DEFAULT 'monthly',
    current_period_start TIMESTAMP NULL,
    current_period_end TIMESTAMP NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    stripe_invoice_id VARCHAR(100) UNIQUE,
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status ENUM('draft','open','paid','void','uncollectible') DEFAULT 'draft',
    period_start DATE,
    period_end DATE,
    paid_at TIMESTAMP NULL,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    metric VARCHAR(50) NOT NULL,
    value INT DEFAULT 1,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_metric_month (tenant_id, metric, recorded_at)
);
```

#### 6. Frontend: Settings → Billing

Agregar en `src/views/SettingsView.jsx` una pestaña "Plan y Facturación":
- Plan actual con badge (Trial, Starter, Pro, Business, Enterprise)
- Barra de uso: workflows X/Y, ejecuciones X/Y, usuarios X/Y
- Botón "Upgrade" que abre Stripe Checkout
- Botón "Gestionar suscripción" que abre Stripe Customer Portal
- Historial de facturas con link a PDF
- Countdown de trial (si aplica)
- Banner de upgrade cuando se acerca al límite (80%+)

#### 7. Paywall para trial expirado

Cuando el trial expira y no hay suscripción activa:
- El usuario puede hacer login
- Ve un modal de paywall: "Tu trial expiró. Elige un plan para continuar."
- NO puede crear/ejecutar workflows hasta que pague
- SÍ puede ver sus workflows existentes (no perder datos)
- SÍ puede exportar sus datos

### RESTRICCIONES
- STRIPE SOLO para pagos (no PayPal, no MercadoPago todavía)
- Webhooks verificados por firma de Stripe
- NO almacenar tarjetas de crédito (Stripe maneja todo)
- Los precios en USD (centavos para evitar decimales)
- Facturas se generan en Stripe, no las generamos nosotros
- Trial: 14 días, sin tarjeta requerida
- Grace period de 3 días para pagos fallidos
- Downgrade: al final del período actual, no inmediato
- Upgrade: inmediato con proration

### CRITERIOS DE ÉXITO
1. Signup crea organización con trial de 14 días
2. Al vencer trial, aparece paywall
3. Seleccionar plan → Stripe Checkout → pago → plan activado
4. Crear workflow #11 en plan Starter → error 403 "límite alcanzado"
5. Ejecutar workflow #2001 en plan Starter → error 403
6. Webhook de invoice.paid renueva el período
7. Webhook de payment_failed envía email y da gracia
8. "Gestionar suscripción" abre Stripe Customer Portal
9. Facturas visibles en Settings con link a PDF
```
