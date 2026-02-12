# Prompt: Generar Excel Comparativo de Herramientas RPA

## Instrucciones para Claude

Necesito que generes un archivo Node.js que cree un Excel (.xlsx) con un analisis comparativo exhaustivo de herramientas RPA. El archivo debe llamarse `generate-comparison.cjs` y usar la libreria `exceljs`.

---

## CONTEXTO

Estoy trabajando en una version anterior/diferente de **Alqvimia RPA** y necesito generar un Excel comparativo profesional que compare nuestra herramienta contra los principales competidores del mercado. El Excel debe ser visualmente profesional con colores, estilos, y formato condicional.

---

## PREREQUISITOS

Antes de ejecutar, necesito tener instalado:

```bash
npm install exceljs
```

---

## ESTRUCTURA EXACTA DEL EXCEL A GENERAR

El archivo debe tener **6 hojas** con esta estructura exacta:

### HOJA 1: Resumen Ejecutivo

**Configuracion:**
- Nombre: "Resumen Ejecutivo"
- Tab color: Azul oscuro
- Frozen panes: fila 3
- 6 columnas: Criterio (40px) + 5 herramientas (32px cada una)

**Herramientas a comparar (columnas):**

| Columna | Herramienta | Color de Header |
|---------|-------------|-----------------|
| A | CRITERIO | Azul oscuro (#1E3A5F) |
| B | ALQVIMIA RPA [tu version] | Morado (#6C3483) |
| C | UIPATH | Naranja (#FF6D00) |
| D | AUTOMATION ANYWHERE | Rojo (#FF0000) |
| E | BLUE PRISM (SS&C) | Azul (#0033A0) |
| F | ROCKETBOT | Celeste (#00B4D8) |

**Filas - Titulo:**
- Fila 1: Titulo merged A1:F1, font 18pt bold blanco, fondo azul oscuro, alto 45px
- Fila 2: Subtitulo merged A2:F2, font 12pt bold gris, fondo azul oscuro, alto 30px
- Fila 3: Headers de herramientas con colores respectivos, font 13pt bold, alto 35px

**Filas - Datos (desde fila 4):**

Organizar en CATEGORIAS (filas con fondo gris oscuro #34495E, texto blanco, sin datos en columnas B-F) y FILAS DE DATOS (alternando fondo blanco/gris claro).

**Categorias y criterios a incluir:**

```
INFORMACION GENERAL
- Tipo de Producto
- Ano de Fundacion
- Sede Principal
- Empleados
- Revenue Anual
- Clientes
- Market Share
- Gartner Magic Quadrant

MODELO DE PRECIOS
- Edicion Gratuita
- Precio Base
- Costo por Robot Adicional
- Modelo de Licenciamiento
- TCO Estimado (3 anos, 10 bots)

ARQUITECTURA Y DESPLIEGUE
- Cloud
- On-Premises
- Hibrido
- Tecnologia Base
- Escalabilidad
- Alta Disponibilidad

FUNCIONALIDADES CORE RPA
- Disenador Visual (Drag & Drop)
- Grabador de Acciones
- Element Spy / Inspector
- Robots Atendidos
- Robots Desatendidos
- Orquestador
- Programacion de Tareas
- Variables y DataTables
- Control de Flujo
- Contenedores/Grupos

AUTOMATIZACION WEB
- Navegadores Soportados
- Modo Headless
- Selectores CSS
- XPath
- Acciones Web Disponibles
- Inyeccion JavaScript
- Manejo de Frames/iFrames
- Extraccion de Datos Web
- Gestion de Pestanas

AUTOMATIZACION DESKTOP
- Mouse & Keyboard
- Gestion de Ventanas
- Ejecucion de Procesos
- Terminal/CMD/PowerShell
- Citrix / VDI
- Mainframe / AS400

AUTOMATIZACION EXCEL
- Excel COM/OLE (con aplicacion)
- Excel Background (sin app)
- Formulas
- Macros
- Graficos
- Tablas Dinamicas
- Proteccion de Hojas
- Export CSV/JSON

PROCESAMIENTO PDF
- Leer/Extraer Texto
- Extraer Tablas
- Crear PDF
- Merge/Split
- Firma Digital
- Formularios PDF
- Marca de Agua

INTELIGENCIA ARTIFICIAL
- Generacion de Texto
- Chat con IA
- Analisis de Sentimiento
- Clasificacion
- Resumen de Texto
- Traduccion
- Extraccion de Entidades
- Analisis de Imagen
- OCR con IA
- Document Understanding (IDP)
- Agentes Autonomos IA
- Natural Language to Automation
- Process Mining
- Task Mining
- Healing Agents (auto-reparacion)

INTEGRACIONES
- Email (SMTP/IMAP)
- REST API / HTTP
- Base de Datos SQL
- SAP
- Microsoft 365
- Google Workspace
- Amazon AWS
- Microsoft Azure
- Active Directory
- FTP / SFTP
- Word
- PowerPoint
- XML / JSON
- Marketplace/Store de Integraciones

OCR E IMAGENES
- OCR Pantalla
- OCR Region
- OCR Documento
- Buscar Imagen en Pantalla
- Comparar Imagenes

SEGURIDAD Y COMPLIANCE
- Autenticacion de Usuarios
- Gestion de Credenciales
- Gestion de API Keys
- SOC 2
- ISO 27001
- HIPAA
- GDPR
- FedRAMP
- Audit Trail

EXPERIENCIA DE DESARROLLO
- Enfoque
- Editor de Codigo Integrado
- Lenguaje de Scripting
- Migracion desde otras plataformas
- Biblioteca de Componentes
- Plantillas de Workflow
- Componentes Personalizados

COMUNICACION Y COLABORACION
- Omnicanalidad
- Videoconferencia
- MCP Conectores
- Agente con Voz

DASHBOARDS Y ANALYTICS
- Dashboard IA
- Dashboard Creator
- Panel de Administracion
- Reportes de Ejecucion

EXPERIENCIA DE USUARIO
- Multi-idioma
- Curva de Aprendizaje
- Onboarding Wizard
- Soporte Movil
- Comunidad
- Certificaciones/Capacitacion

ACCIONES/ACTIVIDADES DISPONIBLES
- Navegador Web (cantidad)
- Excel (total)
- Base de Datos
- Email
- Archivos/Carpetas
- PDF
- REST API
- IA/ML
- SAP
- Active Directory
- Cloud (AWS/Azure)
- OCR/Imagenes
- Control de Flujo
- Omnicanalidad
- TOTAL ESTIMADO DE ACCIONES
```

**Color condicional automatico en celdas de datos (columnas B-F):**
- Verde claro (#D5F5E3) + texto verde (#1E8449): si contiene "Excelente", "Si", "Lider", "Avanzado", "Nativo", "Alto", "Alta"
- Amarillo claro (#FEF9E7) + texto amarillo (#9A7D0A): si contiene "Parcial", "Limitad", "Medio", "Basic"
- Rojo claro (#FADBD8) + texto rojo (#922B21): si contiene "No", "Ninguno", "Sin", "Bajo", "Baja"

---

### HOJA 2: Pros y Contras

**Configuracion:**
- Nombre: "Pros y Contras"
- Tab color: Verde (#27AE60)
- Frozen panes: fila 2
- 4 columnas: Herramienta (22px), Tipo +/- (8px), Descripcion (80px), Impacto (25px)

**Estructura:**
- Fila 1: Titulo merged
- Fila 2: Headers
- Separadores por herramienta: fila con fondo del color de la herramienta, texto blanco, merged
- Para cada herramienta listar 10-16 PROS y 7-10 CONTRAS con:
  - PRO = "+" en verde (#D5F5E3)
  - CONTRA = "-" en rojo (#FADBD8)
  - Columna Impacto: "Critico - Area", "Alto - Area", "Medio - Area", "Bajo - Area"

**IMPORTANTE para la columna de Alqvimia:** Ajusta los PROs y CONTRAs a las funcionalidades REALES de tu version. Si tu version no tiene videoconferencia, no la listes como PRO. Se honesto.

---

### HOJA 3: Scoring Detallado

**Configuracion:**
- Nombre: "Scoring Detallado"
- Tab color: Amarillo (#F39C12)
- Frozen panes: fila 3
- 7 columnas: Criterio (35px), Peso (10px), 5 herramientas (14px cada una)

**Escala:**
- Puntuacion: 1-10 (10 = Excelente, 7-9 = Bueno, 4-6 = Aceptable, 1-3 = Debil)
- Peso: 1-5 (importancia del criterio)

**Color de celdas de score:**
- 8-10: Verde claro, texto verde bold
- 5-7: Amarillo claro, texto amarillo bold
- 1-4: Rojo claro, texto rojo bold
- 0: Gris claro, texto gris

**Categorias y criterios (con pesos sugeridos):**

```
COSTO Y ACCESIBILIDAD (peso 3-5)
- Costo de licenciamiento (5)
- Transparencia de pricing (4)
- TCO 3 anos 10 bots (5)
- Edicion gratuita (3)
- Escalabilidad de costos (4)

FUNCIONALIDADES CORE RPA (peso 3-5)
- Disenador visual (5)
- Grabador de acciones (4)
- Automatizacion web (5)
- Automatizacion desktop (4)
- Automatizacion Excel (5)
- Procesamiento PDF (3)
- Control de flujo (5)
- Variables y datos (4)
- Orquestacion (4)
- Programacion/Scheduling (3)

INTELIGENCIA ARTIFICIAL (peso 3-5)
- IA generativa integrada (5)
- Document Understanding IDP (4)
- OCR nativo (3)
- Agentes autonomos IA (4)
- Process Mining (4)
- Task Mining (3)
- NL to Automation (3)
- Auto-healing Self-repair (3)

INTEGRACIONES (peso 3-4)
- Email SMTP/IMAP (3)
- REST API HTTP (4)
- Base de datos SQL (4)
- SAP (4)
- Microsoft 365 (4)
- Google Workspace (3)
- Cloud AWS/Azure (3)
- Active Directory (3)
- Citrix/VDI (3)
- Mainframe/AS400 (3)
- Marketplace (4)

OMNICANALIDAD Y COMUNICACION (peso 2-4)
- WhatsApp/Telegram/SMS (4)
- Chat web integrado (3)
- Videoconferencia (2)
- Agente con voz (2)

SEGURIDAD Y COMPLIANCE (peso 3-4)
- Autenticacion SSO MFA (4)
- Gestion de credenciales (4)
- SOC 2 ISO 27001 (4)
- HIPAA (3)
- Audit trail (4)
- Control de datos self-hosted (3)

EXPERIENCIA DE USUARIO (peso 2-5)
- Curva de aprendizaje (5)
- Onboarding Wizard (3)
- Multi-idioma (3)
- Soporte movil (2)
- Dashboard Analytics (3)
- Dashboard Creator custom (3)
- Editor de codigo integrado (3)

ECOSISTEMA Y MADUREZ (peso 3-5)
- Comunidad (4)
- Documentacion (4)
- Certificaciones Training (3)
- Madurez del producto (4)
- Track record enterprise (5)
- Soporte tecnico (4)
- Vision de futuro (4)

DIFERENCIADORES UNICOS (peso 3-4)
- Migracion desde otras plataformas (4)
- Omnicanalidad integrada (4)
- Componentes personalizados runtime (3)
- Self-hosted sin restricciones (3)
```

**Fila final: PUNTUACION TOTAL PONDERADA**
- Calcular: suma de (score * peso) para cada herramienta
- Mostrar: "XXX pts (X.X/10)"
- Color: fondo del color de cada herramienta

**Fila de RANKING:**
- Ordenar herramientas de mayor a menor
- #1 en dorado

---

### HOJA 4: Recomendaciones

**Configuracion:**
- Nombre: "Recomendaciones"
- Tab color: Verde (#2ECC71)
- 2 columnas: Titulo (25px), Descripcion (80px)

**Secciones:**

1. **CUANDO ELEGIR...** (header azul oscuro)
   - Para cada herramienta: descripcion de 2-3 lineas de cuando es la mejor opcion

2. **VENTAJAS COMPETITIVAS UNICAS DE ALQVIMIA** (header morado)
   - Listar 5-8 ventajas unicas reales de tu version

3. **AREAS DE MEJORA PRIORITARIAS PARA ALQVIMIA** (header rojo)
   - Listar 5-8 areas donde tu version necesita mejorar

---

### HOJA 5: Acciones Alqvimia

**Configuracion:**
- Nombre: "Acciones Alqvimia"
- Tab color: Morado (color de Alqvimia)
- Frozen panes: fila 2
- 6 columnas: Categoria (30px), Accion (35px), ID Tecnico (20px), UiPath? (15px), AA? (15px), BP? (15px)

**Contenido:**
- Listar TODAS las acciones/componentes disponibles en tu version de Alqvimia
- Agrupar por categoria con header de categoria (merged, fondo gris oscuro)
- Para cada accion indicar si UiPath/AA/BluePrism tienen equivalente (Si/Parcial/No)
- Color condicional en columnas D-F (mismo sistema verde/amarillo/rojo)

---

### HOJA 6: GAPS y Roadmap

**Configuracion:**
- Nombre: "GAPS y Roadmap"
- Tab color: Rojo (#E74C3C)
- Frozen panes: fila 4
- 11 columnas: #, Criterio, Peso, Alqvimia Score, Lider Score, GAP, GAP*Peso, Prioridad, Mes Target, Accion Requerida, Categoria

**Datos:**
- Tomar los scores de la Hoja 3 donde Alqvimia tiene GAP vs el lider
- Calcular: GAP = Lider - Alqvimia, GAP Ponderado = GAP * Peso
- Ordenar por GAP Ponderado descendente (mas critico primero)
- Prioridad automatica: >=40 CRITICO (rojo), >=25 ALTO (naranja), >=15 MEDIO (amarillo), <15 BAJO (verde)
- Incluir fecha target (mes) y accion requerida para cerrar el gap
- Numeracion secuencial en columna #

---

## ESTILOS GLOBALES

### Paleta de Colores (formato ARGB para exceljs)

```javascript
const colors = {
  headerBg: 'FF1E3A5F',      // Azul oscuro (headers)
  headerFont: 'FFFFFFFF',     // Blanco
  alqvimiaBg: 'FF6C3483',     // Morado (Alqvimia)
  uipathBg: 'FFFF6D00',      // Naranja (UiPath)
  aaBg: 'FFFF0000',          // Rojo (Automation Anywhere)
  bpBg: 'FF0033A0',          // Azul (Blue Prism)
  rocketBg: 'FF00B4D8',      // Celeste (Rocketbot)
  greenBg: 'FF27AE60',       // Verde (positivo)
  yellowBg: 'FFF39C12',      // Amarillo (parcial)
  redBg: 'FFE74C3C',         // Rojo (negativo)
  lightGray: 'FFF2F3F4',     // Gris claro (filas pares)
  white: 'FFFFFFFF',
  darkText: 'FF2C3E50',      // Texto oscuro
  categoryBg: 'FF34495E',    // Gris oscuro (categorias)
};
```

### Fuentes
- Todas las celdas: Calibri
- Titulos: 16-18pt, bold, blanco
- Headers: 12-13pt, bold, blanco
- Categorias: 11pt, bold, blanco
- Datos: 10pt, color oscuro
- Scores: 11pt, bold, color segun valor

### Bordes
- Headers y categorias: thin, gris (#95A5A6)
- Datos: thin, gris claro (#D5D8DC)

### Filas
- Titulos: 40-45px alto
- Headers: 28-35px
- Categorias: 26-28px
- Datos: 20-24px
- Recomendaciones: 55px

---

## COMO EJECUTAR

El script debe:
1. Crear el workbook con `new ExcelJS.Workbook()`
2. Generar las 6 hojas con todos los datos y estilos
3. Guardar como: `Analisis_Comparativo_RPA_[ANO].xlsx`

```javascript
// Al final del script:
const outputPath = path.join(__dirname, 'Analisis_Comparativo_RPA_2026.xlsx');
await workbook.xlsx.writeFile(outputPath);
console.log(`Excel generado: ${outputPath}`);
```

Ejecutar con:

```bash
node generate-comparison.cjs
```

---

## INSTRUCCIONES PARA ADAPTAR A TU VERSION

### Paso 1: Inventariar tu version de Alqvimia

Antes de generar el Excel, necesitas saber que tiene tu version. Ejecuta esto o revisa manualmente:

1. **Contar acciones por categoria** - Revisa `src/utils/actionProperties.js` y `src/views/WorkflowsView.jsx` (WORKFLOW_CATEGORIES)
2. **Verificar integraciones** - Que servicios externos tiene conectados
3. **Verificar IA** - Que capacidades de IA tiene
4. **Verificar features unicos** - Que tiene que otros no tienen

### Paso 2: Actualizar los datos de Alqvimia

En el script generado, busca y reemplaza todos los valores de la columna "ALQVIMIA" con los datos reales de tu version. Por ejemplo:

- Si tu version tiene 200 acciones en vez de 350, cambia el total
- Si no tiene videoconferencia, pon "No" en vez de "Si"
- Si tiene menos acciones de Excel, actualiza el conteo
- Ajusta los scores de la Hoja 3 honestamente

### Paso 3: Actualizar datos de competidores

Los datos de UiPath, Automation Anywhere, Blue Prism y Rocketbot deben ser actuales. Investiga:

- Precios actuales (cambian frecuentemente)
- Nuevas features (especialmente IA)
- Market share actualizado
- Gartner Magic Quadrant mas reciente

### Paso 4: Generar y validar

```bash
node generate-comparison.cjs
```

Abre el Excel resultante y verifica:
- Los colores se ven correctamente
- Los datos de Alqvimia son precisos para tu version
- Los datos de competidores estan actualizados
- El scoring es honesto y justificable
- Los gaps y roadmap son realistas

---

## EJEMPLO DE ESTRUCTURA DEL SCRIPT

```javascript
const ExcelJS = require('exceljs');
const path = require('path');

async function generateComparison() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Alqvimia RPA';
  workbook.created = new Date();

  // Definir colores
  const colors = { /* ... paleta completa ... */ };

  // Funciones helper de estilos
  function applyCellStyle(cell, isEven) { /* ... */ }
  function applyToolHeader(cell, bgColor) { /* ... */ }
  function applyRatingCell(cell, rating) { /* ... color condicional ... */ }

  // === HOJA 1: Resumen Ejecutivo ===
  const ws1 = workbook.addWorksheet('Resumen Ejecutivo', {
    properties: { tabColor: { argb: 'FF1E3A5F' } },
    views: [{ state: 'frozen', ySplit: 3 }]
  });
  // ... titulo, headers, datos, categorias ...

  // === HOJA 2: Pros y Contras ===
  const ws2 = workbook.addWorksheet('Pros y Contras', { /* ... */ });
  // ... datos por herramienta ...

  // === HOJA 3: Scoring Detallado ===
  const ws3 = workbook.addWorksheet('Scoring Detallado', { /* ... */ });
  // ... scores, calcular totals, ranking ...

  // === HOJA 4: Recomendaciones ===
  const ws4 = workbook.addWorksheet('Recomendaciones', { /* ... */ });
  // ... cuando elegir, ventajas, mejoras ...

  // === HOJA 5: Acciones Alqvimia ===
  const ws5 = workbook.addWorksheet('Acciones Alqvimia', { /* ... */ });
  // ... catalogo completo de acciones ...

  // === HOJA 6: GAPS y Roadmap ===
  const ws6 = workbook.addWorksheet('GAPS y Roadmap', { /* ... */ });
  // ... gaps calculados, ordenados, con roadmap ...

  // Guardar
  const outputPath = path.join(__dirname, 'Analisis_Comparativo_RPA_2026.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel generado exitosamente: ${outputPath}`);
}

generateComparison().catch(console.error);
```

---

## NOTAS FINALES

- El script original de Alqvimia 2.0 tiene ~900 lineas de codigo
- Todas las hojas deben tener frozen panes para que los headers se queden fijos al hacer scroll
- La funcion `applyRatingCell()` es CLAVE: detecta automaticamente si el valor es positivo/parcial/negativo y aplica color
- Los totals de la Hoja 3 se calculan en runtime: `total += score * peso`
- Los gaps de la Hoja 6 se calculan de los mismos datos de la Hoja 3
- El ranking se genera automaticamente ordenando los totales

**Pide a Claude que genere el script COMPLETO con todos los datos de tu version de Alqvimia y datos actualizados de los competidores.**
