# Documento de Requerimientos - Agentes Alqvimia RPA 2.0

## Información General

| Campo | Valor |
|-------|-------|
| Versión del Documento | 1.0.0 |
| Fecha | 13 de Enero de 2026 |
| Plataforma | Alqvimia RPA 2.0 |
| Arquitectura | APA + RPA + IA |

---

## 1. Resumen Ejecutivo

Este documento describe los requerimientos técnicos, de infraestructura y de negocio para la implementación de los agentes automatizados de Alqvimia RPA 2.0, divididos en dos categorías principales:

1. **Agentes SAT - Cumplimiento Fiscal** (5 bots prioritarios)
2. **Agentes Retail** (15 agentes del catálogo)

Todos los agentes siguen las siguientes premisas:
- Misma base tecnológica (APA + RPA + IA)
- Configurable por cliente sin reprogramar
- Motor escalable
- Producto listo para vender
- Volumetría + Analítica incluida

---

## 2. Requerimientos de Infraestructura

### 2.1 Servidor de Aplicación

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB |
| Almacenamiento | 100 GB SSD | 500 GB SSD |
| Sistema Operativo | Windows Server 2019+ / Ubuntu 20.04+ | Windows Server 2022 / Ubuntu 22.04 |

### 2.2 Base de Datos

| Componente | Especificación |
|------------|----------------|
| Motor | MySQL 8.0+ |
| RAM dedicada | 4 GB mínimo |
| Almacenamiento | 50 GB inicial (escalable) |
| Backup | Diario automatizado |

### 2.3 Red y Conectividad

| Requerimiento | Especificación |
|---------------|----------------|
| Ancho de banda | 100 Mbps mínimo |
| Puertos requeridos | 4000 (Orquestador), 4200 (Frontend), 4300-4400 (Agentes) |
| SSL/TLS | Certificado válido para producción |
| Firewall | Permitir conexiones entrantes a puertos especificados |

### 2.4 Software Base

| Software | Versión |
|----------|---------|
| Node.js | 18.x LTS o superior |
| npm | 9.x o superior |
| Git | 2.x |
| Docker (opcional) | 24.x |

---

## 3. Agentes SAT - Cumplimiento Fiscal

### 3.1 Bot 1: Asistente de Buzón Tributario

#### Descripción
Monitoreo 24/7 del Buzón Tributario con alertas automáticas vía WhatsApp.

#### Problema que Resuelve
Multas de $3,850 a $11,540 MXN por no monitorear notificaciones del SAT.

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Credencial | RFC del contribuyente | Sí |
| Credencial | e.firma (FIEL) o CIEC | Sí |
| Integración | WhatsApp Business API | No* |
| Integración | Cuenta de correo para alertas | No* |
| Integración | Zoho CRM/Books (opcional) | No |

*Al menos uno de WhatsApp o Email es requerido para alertas.

#### Entregables
- Sistema de monitoreo automatizado
- Alertas multicanal (WhatsApp/Email)
- Dashboard de notificaciones
- Historial y reportes de compliance
- Clasificación automática por urgencia

#### Configuración por Defecto
```json
{
  "checkIntervalMinutes": 60,
  "urgencyLevels": {
    "CRITICAL": 3,
    "HIGH": 7,
    "MEDIUM": 15,
    "LOW": 30
  }
}
```

---

### 3.2 Bot 2: Asistente CFDI 4.0 y Complemento de Pagos

#### Descripción
Validación pre-timbrado y recordatorios para complementos de pago.

#### Problema que Resuelve
Incumplimiento en emisión de complementos de pago (día 10 del mes siguiente).

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Conexión con PAC/Facturador | Sí |
| Integración | Sistema de facturación (Zoho, SAE, etc.) | Sí |
| Datos | Acceso a facturas emitidas | Sí |

#### Entregables
- Validador de datos fiscales pre-timbrado
- Sistema de seguimiento de facturas a crédito
- Alertas y recordatorios automatizados
- FAQ inteligente de errores CFDI 4.0

---

### 3.3 Bot 3: Gestor de Contabilidad Electrónica

#### Descripción
Recordatorios y verificación para envío de balanzas de comprobación.

#### Problema que Resuelve
Personas morales deben enviar contabilidad electrónica los primeros 3 días del segundo mes posterior.

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Sistema contable (CONTPAQi, Aspel, SAE) | Sí |
| Credencial | e.firma para envío | Sí |
| Datos | Acceso a catálogo de cuentas | Sí |

#### Entregables
- Conectores con ERPs contables
- Calendario SAT automatizado
- Generador de XML de balanza
- Dashboard de compliance mensual

---

### 3.4 Bot 4: Administrador de DIOT

#### Descripción
Validación y recordatorios para la Declaración Informativa de Operaciones con Terceros.

#### Problema que Resuelve
Multas de $9,430 a $18,860 MXN por no presentar DIOT (54 campos obligatorios en 2025).

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Sistema de compras/cuentas por pagar | Sí |
| Datos | Catálogo de proveedores con RFC | Sí |
| Credencial | Acceso al portal del SAT | Sí |

#### Entregables
- Validador de formato .TXT
- Detector de errores comunes
- Generador de reportes de operaciones
- Tutorial interactivo plataforma DIOT 2025

---

### 3.5 Bot 5: Calendario Fiscal Inteligente

#### Descripción
Dashboard personalizado de obligaciones fiscales con recordatorios automáticos.

#### Problema que Resuelve
Pérdida de fechas límite de múltiples obligaciones (ISR, IVA, IEPS, DIOT).

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Datos | RFC y régimen fiscal del contribuyente | Sí |
| Integración | Calendario Google/Outlook | No |
| Integración | WhatsApp/Email para recordatorios | Sí |

#### Entregables
- Motor de reglas fiscales por régimen
- Integración con calendarios externos
- Dashboard de compliance anual
- Sistema de checklist mensual

---

## 4. Agentes Retail

### 4.1 Agente Ejecutivo de Análisis

#### Descripción
Permite a directores consultar el negocio en lenguaje natural.

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Power BI / Zoho Analytics | Sí |
| Integración | API de ERP/POS | Sí |
| Datos | Diccionario de negocio | Sí |

#### Entregables
- Motor semántico personalizado
- Conectores BI
- Panel analítico de volumetría

---

### 4.2 Agente de Atención a Clientes

#### Descripción
Chatbot omnicanal 24/7 para atención de dudas y soporte.

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | WhatsApp Business API | Sí |
| Datos | Catálogo de FAQs | Sí |
| Integración | Sistema de pedidos/OMS | No |

#### Entregables
- Chat omnicanal WA + Web
- Base de conocimiento configurable
- Flujos de conversación personalizables

---

### 4.3 Seguimiento Automático de Pedidos

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Sistema OMS/ERP | Sí |
| Integración | WhatsApp Business API | No |
| Datos | Estados de pedido definidos | Sí |

---

### 4.4 Agente de Carritos Abandonados

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Plataforma e-commerce | Sí |
| Integración | WhatsApp/Email | Sí |
| Datos | Catálogo de productos | Sí |

---

### 4.5 Validación de Prenómina Automática

#### Requerimientos del Cliente

| Tipo | Requerimiento | Obligatorio |
|------|---------------|-------------|
| Integración | Sistema de control de asistencia | Sí |
| Integración | Sistema de nómina | Sí |
| Datos | Reglas por tipo de contrato | Sí |

---

## 5. Requerimientos de Integración

### 5.1 WhatsApp Business API

```
Proveedor: Meta (Facebook)
Requisitos:
- Cuenta de WhatsApp Business verificada
- Número de teléfono dedicado
- Token de acceso de larga duración
- Plantillas de mensaje aprobadas
```

### 5.2 Sistemas ERP Soportados

| Sistema | Método de Integración |
|---------|----------------------|
| SAP | API REST / RFC |
| Oracle | API REST |
| Microsoft Dynamics | API REST |
| Zoho | API REST |
| CONTPAQi | RPA + Archivos |
| Aspel | RPA + Archivos |
| SAE | RPA + Archivos |

### 5.3 Plataformas E-commerce

| Plataforma | Método |
|------------|--------|
| Shopify | API REST |
| WooCommerce | API REST |
| Magento | API REST |
| VTEX | API REST |
| Custom | RPA |

---

## 6. Seguridad y Compliance

### 6.1 Protección de Datos

- Encriptación AES-256 para datos sensibles en reposo
- TLS 1.3 para datos en tránsito
- Hashing bcrypt para contraseñas
- Tokens JWT con expiración configurable

### 6.2 Credenciales y Secretos

- Almacenamiento seguro de credenciales SAT (e.firma)
- Rotación automática de tokens de API
- Auditoría de acceso a credenciales

### 6.3 Compliance

- Cumplimiento con LFPDPPP (México)
- Logs de auditoría por 5 años
- Respaldo de evidencias fiscales

---

## 7. Plan de Implementación

### Fase 1: Infraestructura (Semana 1)
- [ ] Provisionar servidor de aplicación
- [ ] Configurar base de datos MySQL
- [ ] Configurar certificados SSL
- [ ] Instalar dependencias base

### Fase 2: Agentes SAT (Semanas 1-2)
- [ ] Configurar Bot 5: Calendario Fiscal
- [ ] Configurar Bot 1: Buzón Tributario
- [ ] Pruebas de integración SAT

### Fase 3: Agentes SAT (Semanas 3-4)
- [ ] Configurar Bot 2: CFDI 4.0
- [ ] Configurar Bot 4: DIOT
- [ ] Configurar Bot 3: Contabilidad Electrónica

### Fase 4: Agentes Retail (Semanas 5-6)
- [ ] Configurar agentes según prioridad del cliente
- [ ] Pruebas de integración con sistemas existentes

### Fase 5: Producción (Semana 6)
- [ ] Testing completo
- [ ] Capacitación a usuarios
- [ ] Go-live

---

## 8. Modelo de Precios

### Paquete SAT Compliance

| Concepto | Precio |
|----------|--------|
| Paquete Base (5 bots + soporte) | $8,000 - $15,000 MXN/mes |
| Integración personalizada con ERP | +$5,000 MXN |
| Capacitación equipo contable | +$3,000 MXN |
| Monitoreo 24/7 dedicado | +$4,000 MXN |

### Paquete Retail

| Concepto | Precio |
|----------|--------|
| Por agente (configuración + soporte) | $5,000 - $10,000 MXN/mes |
| Paquete completo (15 agentes) | $50,000 - $80,000 MXN/mes |
| Personalización avanzada | Cotización especial |

---

## 9. Contacto y Soporte

### Soporte Técnico
- Email: soporte@alqvimia.com
- Horario: Lunes a Viernes 9:00 - 18:00 hrs
- SLA: Respuesta en 4 horas hábiles

### Soporte Premium 24/7
- Disponible con paquete de monitoreo dedicado
- Respuesta en 1 hora

---

## 10. Anexos

### Anexo A: Checklist de Requerimientos por Cliente

```
[ ] RFC del contribuyente
[ ] Régimen fiscal
[ ] e.firma o CIEC
[ ] Número de WhatsApp Business
[ ] Correo electrónico para alertas
[ ] Acceso a sistema de facturación
[ ] Acceso a sistema contable
[ ] Catálogo de FAQs (para retail)
[ ] Acceso a sistemas ERP/POS
```

### Anexo B: Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js 18+ |
| Frontend | React 18 + Vite |
| Base de Datos | MySQL 8.0 |
| Automatización Web | Playwright |
| IA/NLP | OpenAI GPT-4 / Claude |
| Mensajería | Socket.IO |
| Colas | Bull/Redis |

### Anexo C: Glosario

| Término | Definición |
|---------|------------|
| APA | Agente Procesador Autónomo - Lógica de negocio configurable |
| RPA | Robotic Process Automation - Automatización de interfaces |
| IA | Inteligencia Artificial - Procesamiento de lenguaje natural |
| CFDI | Comprobante Fiscal Digital por Internet |
| DIOT | Declaración Informativa de Operaciones con Terceros |
| PAC | Proveedor Autorizado de Certificación |

---

*Documento generado por Alqvimia RPA 2.0*
