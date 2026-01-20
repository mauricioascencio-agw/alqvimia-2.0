# Desarrollo de Agentes de IA para Gestión Fiscal
## Alquimia / Intecfra - Bots Contables SAT

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

| Campo | Descripción |
|-------|-------------|
| **Nombre del Proyecto** | Alquimia - Agentes Digitales con IA para Gestión Fiscal SAT |
| **Fecha de Reunión/Transcript** | Enero 2026 |
| **Versión del Documento** | v1.0 |
| **Elaborado por** | Equipo Intecfra/Alquimia |
| **Organizaciones** | Intecfra, Alquimia |

---

## 2. RESUMEN EJECUTIVO

### 2.1 Objetivo de la Reunión
Presentar al contador experto Mario cinco robots prioritarios para automatización fiscal y contable, obtener retroalimentación sobre viabilidad técnica, regulatoria y de mercado, y validar si los usuarios pagarían por estas automatizaciones.

### 2.2 Contexto General
Alquimia es una aplicación de software que permite crear agentes digitales con IA enfocados en temas contables y fiscales para el mercado mexicano. El proyecto busca automatizar procesos repetitivos y de alto riesgo de multas relacionados con el SAT, dirigiéndose tanto a personas físicas como a empresas (PyMEs y grandes corporativos).

### 2.3 Conclusiones Principales
1. Los robots de facturación (CFDI 4.0) y calendario inteligente tienen mayor potencial de valor inmediato.
2. El robot de buzón tributario tiene restricciones regulatorias importantes (no conviene abrir automáticamente ciertas notificaciones).
3. Se recomienda vender como paquete escalonado (básico/intermedio/premium) para diferentes segmentos de mercado.
4. El valor diferencial debe estar en la calidad de la información y captura móvil de tickets, no replicar competencia.
5. Se requiere intervención humana para casos sensibles por regulación fiscal.

---

## 3. INVOLUCRADOS (STAKEHOLDERS)

### 3.1 Participantes de la Reunión

| Nombre | Rol/Cargo | Organización | Tipo de Participación |
|--------|-----------|--------------|----------------------|
| Mario | Contador/Consultor Fiscal | Despacho Contable Independiente | Consultor Experto (Decisor) |
| Delia | Estructuración de Productos | Intecfra | Presentadora/Técnico |
| Raúl | Project Manager | Intecfra | Coordinación |
| Ramón Nava | Project Manager / Desarrollo Software | Intecfra | Técnico |
| Aurelio | Contador Principal | [Organización Cliente] | Consultor |
| Isaac | Participante | [Por definir] | Observador |
| Diego | Participante | [Por definir] | Técnico |
| Mau (Mauricio) | Participante Técnico | [Por definir] | Técnico |
| Renán | Participante | [Por definir] | Observador |

### 3.2 Matriz RACI

| Actividad/Entregable | Responsable (R) | Aprobador (A) | Consultado (C) | Informado (I) |
|---------------------|-----------------|---------------|----------------|---------------|
| Definición de Producto | Delia | Aurelio | Mario | Equipo completo |
| Desarrollo Técnico | Ramón/Diego/Mau | Raúl | Delia | Aurelio |
| Validación Fiscal/Legal | Mario | Aurelio | Delia | Raúl |
| Go-to-Market | Delia | Aurelio | Mario | Equipo completo |

---

## 4. ENTENDIMIENTO DEL NEGOCIO

### 4.1 Problemática Identificada
1. **Multas por buzón tributario**: 3,000 a 11,000 pesos por no habilitarlo o no atender notificaciones.
2. **Falta de monitoreo**: Empresas no monitorean notificaciones del SAT y pierden plazos críticos.
3. **Complementos de pago**: Incumplimiento en CFDI 4.0 que impide cerrar ciclos contables.
4. **Falta de educación fiscal**: A nivel nacional existe desconocimiento sobre obligaciones fiscales.
5. **Procesos manuales**: Contadores y contribuyentes realizan tareas repetitivas que pueden automatizarse.

### 4.2 Contexto del Mercado
- **México cuenta con 87 millones de personas físicas** registradas ante el SAT.
- De estos, **55 millones son asalariados** con obligaciones mínimas.
- Aproximadamente **50 millones son asalariados** que reciben un salario.
- Existen **3-30 millones de personas físicas con actividad empresarial** como mercado potencial.
- Ya existen **5+ aplicaciones en el mercado** con mucha promoción (competencia).
- El SAT se divide en **sectores económicos** con diferentes regímenes y obligaciones.

### 4.3 Usuarios Objetivo

| Segmento | Características | Disposición a Pagar | Tamaño Estimado |
|----------|-----------------|---------------------|-----------------|
| Personas físicas (< $12,000/mes) | Asalariados con ingresos bajos | Baja | ~50 millones |
| Personas físicas (> $50,000/mes) | Profesionistas, freelancers | Media | ~3-5 millones |
| PyMEs | Pequeñas y medianas empresas | Media-Alta | ~4 millones |
| Despachos contables | Firmas que atienden múltiples clientes | Alta | ~50,000-100,000 |
| Empresas grandes | Corporativos con equipos fiscales | Alta (servicios premium) | ~10,000-50,000 |

---

## 5. ANÁLISIS AS-IS (Situación Actual)

### 5.1 Procesos Actuales
1. **Buzón tributario**: Se revisa manualmente, muchos contribuyentes lo ignoran o lo abren estratégicamente.
2. **Facturación**: Se generan CFDIs de manera manual, validación reactiva de errores.
3. **Complementos de pago**: Se emiten manualmente cuando el cliente paga, sin recordatorios.
4. **Contabilidad electrónica**: Se presenta en los primeros 3 días del periodo de forma manual.
5. **DIOT**: Se cruza información manualmente con terceros para la declaración anual.
6. **Calendario fiscal**: Se lleva en Excel o memorias sin alertas automatizadas.

### 5.2 Herramientas y Sistemas Existentes
- **OJO**: Sistema contable utilizado internamente por Intecfra.
- **Aspel**: ERP/Software contable popular en México.
- **Portal del SAT**: Para descarga de XML, presentación de declaraciones.
- **ERPs diversos**: Diferentes sistemas contables en el mercado.
- **Aplicaciones competidoras**: 5+ apps de facturación y gestión fiscal.

### 5.3 Puntos de Dolor (Pain Points)
1. **Multas y sanciones** por no atender notificaciones a tiempo.
2. **Imposibilidad de cerrar periodos** sin complementos de pago completos.
3. **Discrepancias** entre lo declarado y lo reportado por terceros.
4. **Falta de visibilidad** sobre el estado fiscal general del negocio.
5. **Dificultad para facturar** gastos cotidianos (restaurantes, gasolineras, SAMS).
6. **Desconocimiento del monto a pagar** hasta el final del mes.

### 5.4 Diagrama de Flujo AS-IS
```
[Contribuyente] → [Revisa manualmente buzón SAT] → [Atiende/Ignora notificaciones]
                                                           ↓
                                                    [Riesgo de multas]

[Operación comercial] → [Factura manual] → [Espera pago] → [Emite complemento manual]
                                                                    ↓
                                                           [Riesgo de errores CFDI]
```

---

## 6. ANÁLISIS TO-BE (Situación Deseada)

### 6.1 Visión del Estado Futuro
Un ecosistema de agentes de IA que automatice el monitoreo, alertas, validación y gestión de obligaciones fiscales 24/7, minimizando intervención manual y reduciendo riesgos de multas y errores. El usuario podrá ver en un **dashboard unificado** el estado completo de su situación fiscal y recibir proyecciones de impuestos a pagar.

### 6.2 Beneficios Esperados
| Beneficio | Métrica Esperada |
|-----------|------------------|
| Reducción de multas | 80-90% menos multas por buzón tributario |
| Ahorro de tiempo | 50-70% menos tiempo en tareas repetitivas |
| Cumplimiento fiscal | 95%+ de obligaciones atendidas a tiempo |
| Visibilidad financiera | Dashboard con información en tiempo real |
| Proyección de impuestos | Conocer monto a pagar antes del día 15 |

### 6.3 Diagrama de Flujo TO-BE
```
[SAT Notificación] → [Robot Buzón] → [Clasifica por urgencia] → [WhatsApp al usuario]
                                                                        ↓
                                              [Usuario decide: Abrir/No abrir vía WhatsApp]
                                                                        ↓
                                                               [Acuse automático si procede]

[Operación comercial] → [Robot Facturación] → [Valida CFDI 4.0] → [Alerta errores]
                                                                         ↓
                                                      [Semáforo: Verde/Amarillo/Rojo]
                                                                         ↓
                                              [Recordatorio automático de complemento de pago]
```

### 6.4 Propuesta de Solución
Cinco agentes de IA integrados en la plataforma Alquimia, cada uno especializado en una función fiscal específica, con capacidad de interactuar vía WhatsApp, integrarse con ERPs y proporcionar dashboards ejecutivos.

---

## 7. REGLAS DE NEGOCIO

### 7.1 Reglas Operativas

| ID | Regla | Descripción | Fuente/Justificación |
|----|-------|-------------|----------------------|
| RN-001 | No abrir automáticamente notificaciones sensibles | Las notificaciones del SAT no deben abrirse automáticamente si son compulsas, créditos fiscales o auditorías | Práctica fiscal - abrir inicia conteo de plazos |
| RN-002 | Permitir decisión del usuario vía WhatsApp | El usuario debe poder decidir qué notificaciones abrir desde WhatsApp sin entrar al portal | Mitigación de riesgo legal |
| RN-003 | Complementos de pago según Código Fiscal | Los complementos deben emitirse en fecha según Código Fiscal de la Federación | Código Fiscal de la Federación |
| RN-004 | Validación CFDI 4.0 obligatoria | Toda factura debe validarse contra catálogos CFDI 4.0 antes de emisión | SAT - CFDI 4.0 |
| RN-005 | Contabilidad electrónica primeros 3 días | Personas morales deben presentar en los primeros 3 días del periodo | SAT - Obligaciones fiscales |

### 7.2 Restricciones Regulatorias
1. **Buzón tributario**: Abrir una notificación del SAT inicia el conteo de plazos legales para responder.
2. **Automatización limitada**: No se puede automatizar 100% la apertura de notificaciones por implicaciones legales.
3. **CFDI 4.0**: Desde 2023, los complementos de pago son más exigibles y hay multas por incumplimiento.
4. **Privacidad de datos fiscales**: Los datos del SAT son confidenciales y requieren autorización del contribuyente.

### 7.3 Políticas Internas
1. Escalar a revisión humana cualquier notificación de auditoría o crédito fiscal.
2. Mantener logs de todas las acciones automatizadas para trazabilidad.
3. No sustituir al contador profesional, ser herramienta de apoyo.

---

## 8. REQUERIMIENTOS

### 8.1 Requerimientos Funcionales

| ID | Requerimiento | Descripción | Prioridad | Criterio de Aceptación |
|----|--------------|-------------|-----------|------------------------|
| RF-001 | Monitoreo buzón tributario | Monitorear 24/7 el buzón sin abrir notificaciones automáticamente | Alta | El robot detecta nuevas notificaciones en menos de 1 hora |
| RF-002 | Alertas WhatsApp | Enviar alertas inmediatas al WhatsApp del usuario con opciones de acción | Alta | Usuario recibe alerta en menos de 5 minutos |
| RF-003 | Clasificación de notificaciones | Clasificar notificaciones por tipo y urgencia | Alta | 95%+ de clasificación correcta |
| RF-004 | Recordatorios de facturación | Enviar recordatorios 5 días antes de vencimientos | Alta | 100% de recordatorios enviados a tiempo |
| RF-005 | Validación CFDI 4.0 | Validar facturas contra catálogos CFDI 4.0 | Alta | Detección del 100% de errores de catálogo |
| RF-006 | Dataset errores CFDI | Base de datos de errores comunes CFDI 4.0 | Media | Catálogo de 50+ errores comunes documentados |
| RF-007 | Integración ERP | Conectores con Aspel y otros ERPs populares | Media | API funcional con al menos 2 ERPs |
| RF-008 | Dashboard ejecutivo | Panel con métricas de cumplimiento fiscal | Alta | Dashboard con 5+ métricas clave |
| RF-009 | Calendario personalizado | Calendario de obligaciones por régimen fiscal | Alta | Calendarios para 10+ regímenes |
| RF-010 | Captura móvil de tickets | Fotografiar ticket y generar factura automática | Media | Reconocimiento OCR 90%+ precisión |

### 8.2 Requerimientos No Funcionales

| ID | Categoría | Requerimiento | Descripción | Métrica |
|----|-----------|---------------|-------------|---------|
| RNF-001 | Disponibilidad | Alta disponibilidad | Sistema operativo 24/7 | 99.5% uptime |
| RNF-002 | Rendimiento | Tiempo de respuesta | Alertas en tiempo real | < 5 minutos |
| RNF-003 | Seguridad | Cifrado de datos | Datos fiscales cifrados en tránsito y reposo | AES-256 |
| RNF-004 | Escalabilidad | Soporte multi-cliente | Manejar múltiples contribuyentes | 1,000+ simultáneos |
| RNF-005 | Usabilidad | Interfaz WhatsApp | Interacción simple vía WhatsApp | NPS > 8 |
| RNF-006 | Integración | APIs REST | APIs documentadas para integraciones | OpenAPI 3.0 |
| RNF-007 | Auditabilidad | Logs completos | Registro de todas las acciones | Retención 5 años |

### 8.3 Historias de Usuario

**HU-001: Alerta de Buzón Tributario**
```
Como contribuyente
Quiero recibir alertas en mi WhatsApp cuando tenga notificaciones en mi buzón tributario
Para poder atenderlas a tiempo sin tener que revisar manualmente el portal del SAT

Criterios de aceptación:
- [ ] Recibo alerta en menos de 5 minutos de la notificación
- [ ] La alerta muestra el título sin abrir la notificación
- [ ] Puedo responder SÍ/NO para decidir si el robot abre la notificación
- [ ] Si respondo NO, la notificación queda pendiente con recordatorio
```

**HU-002: Recordatorio de Complemento de Pago**
```
Como contador de empresa
Quiero recibir alertas cuando mis clientes no hayan pagado facturas que requieren complemento
Para poder dar seguimiento y evitar problemas en el cierre contable

Criterios de aceptación:
- [ ] El sistema identifica facturas PPD pendientes de complemento
- [ ] Recibo alerta 5 días antes del vencimiento
- [ ] Puedo ver un semáforo de prioridad (verde/amarillo/rojo)
- [ ] Puedo enviar recordatorio automático al cliente
```

**HU-003: Dashboard de Cumplimiento**
```
Como director de despacho contable
Quiero ver en un dashboard el estado fiscal de todos mis clientes
Para supervisar cumplimiento y tomar acciones preventivas

Criterios de aceptación:
- [ ] Veo métricas de cumplimiento por cliente
- [ ] Identifico rápidamente clientes con alertas
- [ ] Puedo exportar reportes para dirección
- [ ] Tengo visibilidad de próximos vencimientos
```

---

## 9. ANÁLISIS DE FACTIBILIDAD

### 9.1 Factibilidad Técnica

| Aspecto | Estado | Observaciones |
|---------|--------|---------------|
| Infraestructura disponible | ✅ | Plataforma Alquimia existente |
| Integraciones requeridas | ⚠️ | Requiere desarrollo de conectores ERP |
| Capacidades del equipo | ✅ | Equipo con experiencia en desarrollo |
| APIs SAT | ⚠️ | Requiere análisis de limitaciones de API del SAT |
| WhatsApp Business API | ✅ | Disponible y probada |
| IA/Prompts | ✅ | Tecnología de IA disponible |
| Dataset errores CFDI | ⚠️ | Requiere compilación y mantenimiento |

### 9.2 Factibilidad Económica

| Concepto | Estimación | Observaciones |
|----------|------------|---------------|
| Costo de desarrollo (5 robots) | Por determinar | Requiere sprint planning detallado |
| Costo de operación mensual | Por determinar | Depende de infraestructura cloud |
| Precio básico (personas físicas) | $100-300 MXN/mes | Precio bajo para masividad |
| Precio intermedio (PyMEs) | $500-1,500 MXN/mes | Incluye más funcionalidades |
| Precio premium (despachos) | $2,000-5,000 MXN/mes | Incluye asesoría y soporte |
| Mercado potencial (personas físicas) | ~3 millones usuarios | Segmento > $50k/mes |
| Mercado potencial (empresas) | ~4 millones PyMEs | Con necesidad fiscal |

### 9.3 Factibilidad Operativa
- **Positivo**: Los contadores y empresas ya buscan soluciones de automatización.
- **Desafío**: Requiere cambio de hábitos en contribuyentes tradicionales.
- **Oportunidad**: Despachos contables pueden ser early adopters y multiplicadores.
- **Riesgo**: Dependencia de estabilidad de APIs del SAT.

### 9.4 Factibilidad Legal/Regulatoria
- **Riesgo identificado**: Abrir notificaciones del SAT automáticamente puede tener implicaciones legales.
- **Mitigación**: Implementar control manual del usuario para decidir qué abrir.
- **Recomendación**: Auditoría legal antes de habilitar respuestas automáticas al buzón.
- **Cumplimiento de datos**: Requiere consentimiento explícito del contribuyente.

### 9.5 Matriz de Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R-001 | Cambios en normativa SAT | Media | Alto | Monitoreo constante de cambios regulatorios |
| R-002 | Fallas en API del SAT | Media | Alto | Reintentos automáticos, alertas de falla |
| R-003 | Competencia con apps existentes | Alta | Medio | Diferenciación por calidad y captura móvil |
| R-004 | Baja adopción inicial | Media | Medio | Programa piloto con despachos contables |
| R-005 | Errores en automatización | Baja | Alto | Intervención humana en casos sensibles |
| R-006 | Problemas de escalabilidad | Baja | Medio | Arquitectura cloud escalable |

---

## 10. ESTIMACIÓN DE RECURSOS

### 10.1 Equipo Requerido

| Rol | Cantidad | Dedicación | Período | Justificación |
|-----|----------|------------|---------|---------------|
| Project Manager | 1 | 100% | 12 meses | Coordinación general del proyecto |
| Arquitecto de Soluciones | 1 | 50% | 6 meses | Diseño técnico de la plataforma |
| Desarrollador Backend | 2 | 100% | 12 meses | Desarrollo de robots y APIs |
| Desarrollador Frontend | 1 | 100% | 12 meses | Dashboard y interfaces |
| Especialista en IA/ML | 1 | 50% | 8 meses | Desarrollo de prompts y clasificadores |
| QA/Tester | 1 | 100% | 10 meses | Aseguramiento de calidad |
| Consultor Fiscal | 1 | 25% | 12 meses | Validación de reglas de negocio |
| UX Designer | 1 | 50% | 4 meses | Diseño de experiencia de usuario |

**Total: 6-8 personas** en diferentes momentos del proyecto.

### 10.2 Recursos Técnicos
- Infraestructura Cloud (AWS/Azure/GCP)
- WhatsApp Business API
- APIs del SAT (CFDI, Buzón)
- Herramientas de IA (OpenAI, Anthropic, etc.)
- ERPs para integración (Aspel, CONTPAq, etc.)
- Herramientas de desarrollo y CI/CD

### 10.3 Presupuesto Estimado

| Categoría | Descripción | Monto Estimado |
|-----------|-------------|----------------|
| Personal | Equipo de desarrollo 12 meses | Por determinar |
| Infraestructura | Cloud + APIs | $5,000-10,000 USD/mes |
| Licencias | Herramientas de IA, WhatsApp API | $2,000-5,000 USD/mes |
| Consultoría fiscal | Asesoría legal y fiscal | Por determinar |
| Marketing | Go-to-market inicial | Por determinar |
| **TOTAL ESTIMADO** | | **Por determinar** |

---

## 11. CRONOGRAMA (GANTT)

### 11.1 Fases del Proyecto

| Fase | Descripción | Inicio | Fin | Duración | Dependencias |
|------|-------------|--------|-----|----------|--------------|
| Fase 0 | Análisis y diseño | Mes 1 | Mes 2 | 8 semanas | - |
| Fase 1 | Robot 2: Facturación CFDI 4.0 | Mes 3 | Mes 5 | 12 semanas | Fase 0 |
| Fase 2 | Robot 5: Calendario Inteligente | Mes 4 | Mes 6 | 10 semanas | Fase 0 |
| Fase 3 | Robot 1: Buzón Tributario | Mes 6 | Mes 8 | 10 semanas | Fase 1 |
| Fase 4 | Robot 3: Contabilidad Electrónica | Mes 7 | Mes 9 | 10 semanas | Fase 1, 2 |
| Fase 5 | Robot 4: DIOT | Mes 9 | Mes 11 | 8 semanas | Fase 3, 4 |
| Fase 6 | Integración y pruebas | Mes 10 | Mes 12 | 8 semanas | Todas |
| Fase 7 | Go-to-market | Mes 11 | Mes 14 | 12 semanas | Fase 6 |

### 11.2 Hitos Principales

| Hito | Descripción | Fecha Objetivo | Entregable |
|------|-------------|----------------|------------|
| M1 | Diseño técnico aprobado | Fin Mes 2 | Documento de arquitectura |
| M2 | Robot Facturación MVP | Fin Mes 5 | Robot 2 funcional |
| M3 | Robot Calendario MVP | Fin Mes 6 | Robot 5 funcional |
| M4 | Piloto con despachos | Fin Mes 8 | 5 despachos en piloto |
| M5 | Todos los robots integrados | Fin Mes 11 | Plataforma completa |
| M6 | Lanzamiento comercial | Fin Mes 14 | Go-to-market |

### 11.3 Diagrama de Gantt

```
              | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 |
--------------|----|----|----|----|----|----|----|----|----|----|-----|-----|
Análisis      |████████|    |    |    |    |    |    |    |    |     |     |
Robot 2 CFDI  |    |████████████████|    |    |    |    |    |    |     |     |
Robot 5 Cal   |    |    |████████████████|    |    |    |    |    |     |     |
Robot 1 Buzón |    |    |    |    |    |████████████████|    |    |     |     |
Robot 3 Cont  |    |    |    |    |    |    |████████████████|    |     |     |
Robot 4 DIOT  |    |    |    |    |    |    |    |    |████████████|     |     |
Integración   |    |    |    |    |    |    |    |    |    |████████████|     |
Go-to-market  |    |    |    |    |    |    |    |    |    |    |█████████████|
```

---

## 12. ACUERDOS Y COMPROMISOS

### 12.1 Acuerdos de la Reunión

| # | Acuerdo | Responsable | Fecha Límite | Estado |
|---|---------|-------------|--------------|--------|
| 1 | Refinar las cinco propuestas y empaquetarlas en versiones escalonadas | Delia/Equipo | Próxima reunión | Pendiente |
| 2 | Realizar análisis regulatorio sobre límites de automatización del buzón | Mario/Legal | 2 semanas | Pendiente |
| 3 | Definir packaging y pricing por segmento | Delia/Raúl | Próxima reunión | Pendiente |
| 4 | Preparar demo/materiales para siguiente reunión | Equipo técnico | Martes 17:00 | Pendiente |
| 5 | Priorizar Robot 2 (Facturación) y Robot 5 (Calendario) | Equipo | Inmediato | En progreso |

### 12.2 Próximos Pasos

| Paso | Descripción | Responsable | Fecha |
|------|-------------|-------------|-------|
| 1 | Incorporar retroalimentación de Mario en propuestas | Delia | 1 semana |
| 2 | Definir límites de automatización del buzón tributario | Mario | 2 semanas |
| 3 | Crear propuesta de valor por segmento (básico/intermedio/premium) | Equipo comercial | 2 semanas |
| 4 | Mapear conectores ERP prioritarios (Aspel) | Equipo técnico | 3 semanas |
| 5 | Diseñar semáforo de errores CFDI 4.0 | Equipo técnico | 3 semanas |
| 6 | Validar hipótesis de mercado con estudio rápido | Equipo comercial | 4 semanas |

### 12.3 Reuniones de Seguimiento

| Fecha | Objetivo | Participantes |
|-------|----------|---------------|
| Martes 17:00 | Presentar propuesta refinada con ajustes | Mario, Delia, Raúl, Aurelio |
| Por definir | Revisión técnica de integraciones | Equipo técnico |
| Por definir | Validación de pricing con mercado | Equipo comercial |

---

## 13. ESPECIFICACIÓN DE AGENTES DE IA

### 13.1 Catálogo de Agentes

| ID | Nombre del Agente | Propósito | Prioridad |
|----|-------------------|-----------|-----------|
| AG-001 | Asistente de Buzón Tributario | Monitoreo 24/7 y alertas del buzón SAT | 3 |
| AG-002 | Robot de Facturación CFDI 4.0 | Validación, recordatorios y errores de facturación | 1 |
| AG-003 | Robot de Contabilidad Electrónica | Automatización de registros contables y XML | 4 |
| AG-004 | Robot DIOT | Cruce de operaciones con terceros y detección de discrepancias | 5 |
| AG-005 | Calendario Inteligente | Alertas personalizadas por régimen fiscal | 2 |

---

### 13.2 Fichas Técnicas por Agente

#### AG-001: Asistente de Buzón Tributario

| Atributo | Descripción |
|----------|-------------|
| **ID** | AG-001 |
| **Nombre** | Asistente de Buzón Tributario |
| **Problema que resuelve** | Multas de $3,000 a $11,000 por no habilitar o no atender buzón tributario. Pérdida de plazos críticos. |
| **Funciones principales** | Monitoreo 24/7 del buzón tributario, alertas a WhatsApp, recordatorios de plazos, clasificación por urgencia, acuses automáticos (con autorización) |
| **Integraciones requeridas** | API SAT Buzón Tributario, WhatsApp Business API, Sistema contable OJO |
| **Especialización técnica** | Prompts de IA para interpretar tipos de notificaciones, conector API SAT |
| **Mercado objetivo** | Personas físicas con actividad empresarial, PyMEs, despachos contables |
| **Tiempo estimado de desarrollo** | 10-12 semanas |
| **Observaciones/Restricciones** | ⚠️ **CRÍTICO**: No abrir automáticamente notificaciones sensibles (compulsas, créditos fiscales). Requiere decisión manual del usuario vía WhatsApp. Análisis legal requerido. |

---

#### AG-002: Robot de Facturación CFDI 4.0

| Atributo | Descripción |
|----------|-------------|
| **ID** | AG-002 |
| **Nombre** | Robot de Facturación e Identificación de Errores CFDI 4.0 |
| **Problema que resuelve** | Errores en facturas que impiden cierre contable. Incumplimiento de complementos de pago. Multas por CFDI incorrectos. |
| **Funciones principales** | Recordatorios automáticos 5 días antes, validación de datos fiscales (RFC, régimen), identificación de ingresos pendientes de complemento, reportes de facturas con errores, alertas de cancelación, FAQ inteligente de errores CFDI 4.0 |
| **Integraciones requeridas** | API SAT Facturación, ERPs (Aspel, CONTPAq), WhatsApp Business API |
| **Especialización técnica** | Dataset de errores CFDI 4.0, integración con PACs de facturación, semáforo de prioridades |
| **Mercado objetivo** | Todos los contribuyentes que emiten facturas, especialmente PyMEs y despachos |
| **Tiempo estimado de desarrollo** | 10-12 semanas |
| **Observaciones/Restricciones** | ✅ **ALTA PRIORIDAD** según retroalimentación de Mario. Complementos de pago son más exigibles desde 2023. Valor real si además de detectar, facilita la corrección. |

---

#### AG-003: Robot de Contabilidad Electrónica

| Atributo | Descripción |
|----------|-------------|
| **ID** | AG-003 |
| **Nombre** | Robot de Contabilidad Electrónica y Conciliación |
| **Problema que resuelve** | Presentación manual de contabilidad electrónica en primeros 3 días. Errores en XML. Falta de conciliación con estados de cuenta. |
| **Funciones principales** | Recordatorios automáticos día 3, verificación de información antes de envío, integración con ERPs, generación automática de XML, seguimiento de acuses SAT, dashboard de métricas |
| **Integraciones requeridas** | ERPs (Aspel, CONTPAq, otros), API SAT, Estados de cuenta bancarios |
| **Especialización técnica** | Conectores con ERPs contables, calendario automatizado, API del SAT para comparar realidad vs XMLs |
| **Mercado objetivo** | Personas morales, despachos contables que manejan múltiples clientes |
| **Tiempo estimado de desarrollo** | 10-12 semanas |
| **Observaciones/Restricciones** | Es herramienta de **precontabilidad y supervisión**, no sustituye al contador. Valor en visibilidad y preparación rápida. Mario sugiere incluir estado de cuenta real para comparación. |

---

#### AG-004: Robot DIOT

| Atributo | Descripción |
|----------|-------------|
| **ID** | AG-004 |
| **Nombre** | Robot DIOT / Declaración Informativa de Operaciones con Terceros |
| **Problema que resuelve** | Discrepancias entre lo declarado por el contribuyente y lo reportado por terceros. Errores en declaración anual. |
| **Funciones principales** | Análisis de operaciones con terceros, cruce de datos para identificar diferencias, detección de discrepancias, tutoriales interactivos para plataforma DIOT, reportes automáticos |
| **Integraciones requeridas** | Plataforma DIOT SAT, XML de facturas emitidas/recibidas |
| **Especialización técnica** | Dataset de errores DIOT, validación de formato para carga de archivos |
| **Mercado objetivo** | Contribuyentes con operaciones con terceros, despachos contables |
| **Tiempo estimado de desarrollo** | 8-10 semanas |
| **Observaciones/Restricciones** | ⚠️ **PRIORIDAD BAJA** según Mario. No resuelve operaciones, solo detecta y guía. La información ya está disponible en declaración anual y programas contables. Valor limitado como solución independiente. |

---

#### AG-005: Calendario Inteligente y Alertas

| Atributo | Descripción |
|----------|-------------|
| **ID** | AG-005 |
| **Nombre** | Calendario Inteligente y Sistema de Alertas Fiscales |
| **Problema que resuelve** | Pérdida de fechas límite de obligaciones fiscales. Multas por incumplimiento. Falta de previsión de pagos de impuestos. |
| **Funciones principales** | Calendario personalizado por régimen fiscal, recordatorios automáticos WhatsApp/email (7 días y 1 día antes), check-in mensual de cumplimiento, alertas especiales (declaración anual, PTU), integración con calendarios del usuario, reportes de cumplimiento para dirección, estimación de impuestos a pagar |
| **Integraciones requeridas** | Google Calendar, Outlook, WhatsApp Business API, sistema contable |
| **Especialización técnica** | Motor de reglas por régimen fiscal, integración multi-calendario |
| **Mercado objetivo** | Todos los contribuyentes, especialmente PyMEs y despachos como herramienta de supervisión |
| **Tiempo estimado de desarrollo** | 8-10 semanas |
| **Observaciones/Restricciones** | ✅ **ALTA PRIORIDAD**. Gran valor percibido para previsión y reducción de multas. Permite saber cuánto se va a pagar antes del día 15. Es como un "supervisor" del cumplimiento fiscal. |

---

## 14. DECISIONES TOMADAS

| # | Decisión | Justificación | Fecha | Tomada por |
|---|----------|---------------|-------|------------|
| 1 | Priorizar Robot 2 (Facturación) y Robot 5 (Calendario) | Mayor valor percibido y menor riesgo regulatorio | Reunión actual | Mario/Equipo |
| 2 | Empaquetar solución en versiones escalonadas | Atender diferentes segmentos de mercado con precios adecuados | Reunión actual | Mario |
| 3 | Limitar automatización de apertura de buzón tributario | Riesgo legal al abrir automáticamente notificaciones sensibles | Reunión actual | Mario |
| 4 | Diferenciarse por calidad de datos y captura móvil | No replicar lo que ya ofrece la competencia | Reunión actual | Mario |
| 5 | Incluir estimación de impuestos a pagar | Valor agregado clave: saber antes del día 15 cuánto se pagará | Reunión actual | Mario |
| 6 | Robot DIOT como prioridad baja | No resuelve operaciones, solo detecta; información ya disponible | Reunión actual | Mario |

---

## 15. ANEXOS

### Anexo A: Transcripción de la Reunión
Archivo: `Trasncrip_bots_contable_sat.txt`

### Anexo B: Documentación de Soporte
- Catálogo CFDI 4.0 del SAT
- Guía de buzón tributario SAT
- Documentación de APIs SAT
- Análisis de competencia (5+ apps existentes)

### Anexo C: Glosario de Términos

| Término | Definición |
|---------|------------|
| **SAT** | Servicio de Administración Tributaria de México |
| **CFDI** | Comprobante Fiscal Digital por Internet |
| **CFDI 4.0** | Versión actual del estándar de facturación electrónica en México |
| **Buzón Tributario** | Canal de comunicación oficial entre el SAT y los contribuyentes |
| **DIOT** | Declaración Informativa de Operaciones con Terceros |
| **PPD** | Pago en Parcialidades o Diferido (requiere complemento de pago) |
| **PUE** | Pago en Una sola Exhibición |
| **ERP** | Enterprise Resource Planning (sistema de gestión empresarial) |
| **RFC** | Registro Federal de Contribuyentes |
| **ISR** | Impuesto Sobre la Renta |
| **IVA** | Impuesto al Valor Agregado |
| **PTU** | Participación de los Trabajadores en las Utilidades |
| **PyME** | Pequeña y Mediana Empresa |
| **XML** | Extensible Markup Language (formato de facturas electrónicas) |
| **Acuse** | Comprobante de recepción emitido por el SAT |
| **Compulsa** | Requerimiento del SAT para verificar información fiscal |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Cambios Realizados |
|---------|-------|-------|-------------------|
| 1.0 | Enero 2026 | Equipo Intecfra/Alquimia | Versión inicial basada en transcripción de reunión |

---

*Documento generado siguiendo la metodología de Desarrollo de Agentes de IA*
*© Intecfra / Alquimia - 2026*
