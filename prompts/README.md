# Prompts de Desarrollo - Alqvimia RPA 3.0

## Qué es esto
Cada archivo `.md` es un prompt auto-contenido y documentado que se le da a Claude para implementar una funcionalidad completa. Incluye el POR QUÉ (justificación basada en el análisis competitivo) y el CÓMO (instrucciones detalladas).

## Cómo usar
1. Abrir el prompt `.md` que corresponda
2. Copiar el contenido dentro del bloque ``` del PROMPT PARA CLAUDE
3. Pegarlo en una sesión nueva de Claude
4. Claude ejecutará la implementación completa

## Orden de ejecución
Los prompts están numerados en el orden que deben ejecutarse. Cada prompt puede depender de los anteriores.

## Nomenclatura
```
XX-nombre-corto.md
XX = Número secuencial (orden de ejecución)
```

---

## BLOQUE 1: Infraestructura Cloud-Native SaaS (Feb-Mar 2026)

**Objetivo:** Transformar Alqvimia de monolito local a SaaS cloud-native con cobro

| # | Prompt | Descripción | Depende de | Estado |
|---|--------|-------------|------------|--------|
| 01 | [Docker Multi-Servicio](01-docker-multi-servicio.md) | Separar en microservicios: API, Worker, Scheduler, Redis | - | Listo |
| 02 | [Multi-Tenancy](02-multi-tenancy.md) | Aislamiento de datos por organización, tenant scoping | 01 | Listo |
| 03 | [SSO + MFA + RBAC](03-sso-mfa-rbac.md) | Autenticación enterprise: SAML, TOTP, roles y permisos | 02 | Listo |
| 04 | [Orquestador v2](04-orquestador-v2.md) | BullMQ, colas, triggers, queue items, retry, paralelo | 01, 02 | Listo |
| 05 | [Audit Trail](05-audit-trail.md) | Registro inmutable de acciones, data masking, export | 02, 03 | Listo |
| 06 | [Billing Stripe](06-billing-stripe.md) | Suscripciones, planes, enforcement, trial, paywall | 02, 03 | Listo |

### Diagrama de dependencias
```
01-Docker ──┬── 02-Multi-Tenancy ──┬── 03-SSO/MFA/RBAC ──┬── 05-Audit Trail
            │                      │                      └── 06-Billing
            └── 04-Orquestador ────┘
```

---

## BLOQUE 2: Core RPA Mejorado (Abr 2026)
*(se generarán al terminar Bloque 1)*

| # | Prompt | Descripción |
|---|--------|-------------|
| 07 | Subworkflows / Invoke | Invocar workflows desde otros con argumentos |
| 08 | Debugging Avanzado | Breakpoints, watch variables, step-over |
| 09 | Flowchart View | Vista de diagrama de flujo alternativa |

## BLOQUE 3: IA + Healing (May-Jun 2026)
*(se generarán al terminar Bloque 2)*

| # | Prompt | Descripción |
|---|--------|-------------|
| 10 | Healing Agents | Auto-detección y reparación de selectores rotos |
| 11 | NL to Automation v2 | Lenguaje natural → workflow con preview |
| 12 | Process Mining | Importar logs, descubrir procesos, visualizar |
| 13 | IDP v2 | Document Understanding avanzado con validation station |

## BLOQUE 4: Plataforma (Jul-Sep 2026)
*(se generarán al terminar Bloque 3)*

| # | Prompt | Descripción |
|---|--------|-------------|
| 14 | Marketplace | Portal, publicación, one-click install, revenue sharing |
| 15 | API Pública | REST API documentada, webhooks, SDKs |
| 16 | Docs + Comunidad | Portal de documentación, foro, video tutoriales |
| 17 | PWA Mobile | App móvil, monitoreo, triggers, notificaciones push |
| 18 | Cloud Managed | Deploy AWS/Azure, auto-scaling, CDN |
