const ExcelJS = require('exceljs');
const path = require('path');

async function generateComparison() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Alqvimia RPA 2.0';
  workbook.created = new Date();

  // ========== COLORES ==========
  const colors = {
    headerBg: 'FF1E3A5F',      // Azul oscuro
    headerFont: 'FFFFFFFF',     // Blanco
    alqvimiaBg: 'FF6C3483',     // Morado (Alqvimia)
    uipathBg: 'FFFF6D00',      // Naranja (UiPath)
    aaBg: 'FFFF0000',          // Rojo (Automation Anywhere)
    bpBg: 'FF0033A0',          // Azul (Blue Prism)
    rocketBg: 'FF00B4D8',      // Celeste (Rocketbot)
    greenBg: 'FF27AE60',       // Verde (positivo)
    yellowBg: 'FFF39C12',      // Amarillo (parcial)
    redBg: 'FFE74C3C',         // Rojo (negativo)
    lightGray: 'FFF2F3F4',     // Gris claro
    white: 'FFFFFFFF',
    darkText: 'FF2C3E50',
    categoryBg: 'FF34495E',    // Gris oscuro para categorías
    proBg: 'FF27AE60',         // Verde para pros
    conBg: 'FFE74C3C',         // Rojo para contras
    sectionBg: 'FF2980B9',     // Azul para secciones
  };

  // ========== ESTILOS COMUNES ==========
  const headerStyle = {
    font: { bold: true, color: { argb: colors.headerFont }, size: 12, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FF95A5A6' } },
      bottom: { style: 'thin', color: { argb: 'FF95A5A6' } },
      left: { style: 'thin', color: { argb: 'FF95A5A6' } },
      right: { style: 'thin', color: { argb: 'FF95A5A6' } }
    }
  };

  const categoryStyle = {
    font: { bold: true, color: { argb: colors.headerFont }, size: 11, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.categoryBg } },
    alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FF95A5A6' } },
      bottom: { style: 'thin', color: { argb: 'FF95A5A6' } },
      left: { style: 'thin', color: { argb: 'FF95A5A6' } },
      right: { style: 'thin', color: { argb: 'FF95A5A6' } }
    }
  };

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FFD5D8DC' } },
    bottom: { style: 'thin', color: { argb: 'FFD5D8DC' } },
    left: { style: 'thin', color: { argb: 'FFD5D8DC' } },
    right: { style: 'thin', color: { argb: 'FFD5D8DC' } }
  };

  function applyCellStyle(cell, isEven = false) {
    cell.font = { name: 'Calibri', size: 10, color: { argb: colors.darkText } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = cellBorder;
    if (isEven) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };
    }
  }

  function applyToolHeader(cell, bgColor) {
    cell.font = { bold: true, color: { argb: colors.headerFont }, size: 13, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = cellBorder;
  }

  function applyRatingCell(cell, rating) {
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = cellBorder;
    cell.font = { bold: true, size: 10, name: 'Calibri' };

    if (rating && typeof rating === 'string') {
      const r = rating.toLowerCase();
      if (r.includes('excelente') || r.includes('si') || r.includes('sí') || r.includes('lider') || r.includes('líder') || r.includes('avanzado') || r.includes('nativo') || r === 'alto' || r === 'alta') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
        cell.font.color = { argb: 'FF1E8449' };
      } else if (r.includes('parcial') || r.includes('limitad') || r.includes('medio') || r.includes('básic') || r.includes('basic')) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } };
        cell.font.color = { argb: 'FF9A7D0A' };
      } else if (r.includes('no') || r.includes('ninguno') || r.includes('sin') || r === 'bajo' || r === 'baja') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
        cell.font.color = { argb: 'FF922B21' };
      }
    }
  }

  // ===================================================================
  // HOJA 1: RESUMEN EJECUTIVO
  // ===================================================================
  const ws1 = workbook.addWorksheet('Resumen Ejecutivo', {
    properties: { tabColor: { argb: 'FF1E3A5F' } },
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  ws1.columns = [
    { width: 40 }, // Criterio
    { width: 32 }, // Alqvimia
    { width: 32 }, // UiPath
    { width: 32 }, // Automation Anywhere
    { width: 32 }, // Blue Prism
    { width: 32 }, // Rocketbot
  ];

  // Título
  ws1.mergeCells('A1:F1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = 'ANÁLISIS COMPARATIVO EXHAUSTIVO DE HERRAMIENTAS RPA - 2026';
  titleCell.font = { bold: true, size: 18, color: { argb: colors.headerFont }, name: 'Calibri' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(1).height = 45;

  // Subtítulo
  ws1.mergeCells('A2:F2');
  const subtitleCell = ws1.getCell('A2');
  subtitleCell.value = 'Alqvimia RPA 2.0 vs UiPath vs Automation Anywhere vs Blue Prism (SS&C) vs Rocketbot';
  subtitleCell.font = { bold: true, size: 12, color: { argb: 'FFB0B0B0' }, name: 'Calibri' };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(2).height = 30;

  // Headers de herramientas
  const toolHeaders = ['CRITERIO', 'ALQVIMIA RPA 2.0', 'UIPATH', 'AUTOMATION ANYWHERE', 'BLUE PRISM (SS&C)', 'ROCKETBOT'];
  const toolColors = [colors.headerBg, colors.alqvimiaBg, colors.uipathBg, colors.aaBg, colors.bpBg, colors.rocketBg];

  ws1.getRow(3).height = 35;
  toolHeaders.forEach((header, i) => {
    const cell = ws1.getCell(3, i + 1);
    cell.value = header;
    applyToolHeader(cell, toolColors[i]);
  });

  // Datos del resumen ejecutivo
  const summaryData = [
    // INFORMACIÓN GENERAL
    ['INFORMACIÓN GENERAL', '', '', '', '', ''],
    ['Tipo de Producto', 'Plataforma RPA Open/Self-hosted', 'Plataforma RPA Enterprise', 'Plataforma RPA Cloud-native', 'Plataforma RPA Enterprise', 'Plataforma RPA Accesible'],
    ['Año de Fundación', '2024 (v2.0 en 2026)', '2005', '2003', '2001 (SS&C 2022)', '2018'],
    ['Sede Principal', 'N/A (Self-hosted)', 'Nueva York, USA', 'San José, CA, USA', 'Londres, UK / SS&C Windsor, CT', 'Santiago, Chile'],
    ['Empleados', 'Equipo pequeño', '~5,000+', '~3,000+', '~3,000+ (SS&C: 7,000+)', '~53'],
    ['Revenue Anual', 'N/A (producto interno)', '$1.43B USD (FY2025)', '~$700-900M USD (est.)', 'Parte de SS&C ($5.9B)', '~$2.7M USD (funding total)'],
    ['Clientes', 'Uso interno/startup', '10,750+', '5,000+ (est.)', '2,800+', 'Cientos (LatAm)'],
    ['Market Share', 'N/A', '~35.8% (#1)', '~15-20% (#2-3)', '~6.5% (en declive)', '<0.1%'],
    ['Gartner Magic Quadrant', 'No incluido', 'Líder 7 años (#1 ejecución)', 'Líder 7 años', 'Líder 7 años (posición más baja)', 'No incluido'],

    // PRICING
    ['MODELO DE PRECIOS', '', '', '', '', ''],
    ['Edición Gratuita', 'Sí (self-hosted completo)', 'Sí (Community Edition)', 'Sí (Community Edition)', 'No', 'Sí (Studio gratuito)'],
    ['Precio Base', 'Gratuito / Open', '~$420+/mes', '$750/mes (starter pack)', '~$15,000-20,000/año por robot', 'Económico (sin publicar)'],
    ['Costo por Robot Adicional', 'Sin costo adicional', 'Variable según plan', '$500/mes (unattended), $125/mes (attended)', 'Incluido en licencia', 'Sin cargo por usuario'],
    ['Modelo de Licenciamiento', 'Sin licencia (self-hosted)', 'Créditos unificados o por robot', 'Por bot/usuario + cloud', 'Por digital worker (capacidad)', 'Suscripción mensual/anual'],
    ['TCO Estimado (3 años, 10 bots)', 'Muy Bajo (~infra solamente)', 'Alto ($150K-500K+)', 'Medio-Alto ($100K-300K+)', 'Muy Alto ($200K-600K+)', 'Bajo ($30K-80K est.)'],

    // ARQUITECTURA
    ['ARQUITECTURA Y DESPLIEGUE', '', '', '', '', ''],
    ['Cloud', 'No (self-hosted)', 'Sí (Automation Cloud)', 'Sí (nativo cloud A360)', 'Sí (Blue Prism Cloud)', 'Sí (flexible)'],
    ['On-Premises', 'Sí (Docker/nativo)', 'Sí (Automation Suite)', 'Sí', 'Sí (fortaleza histórica)', 'Sí'],
    ['Híbrido', 'Parcial', 'Sí', 'Sí', 'Sí', 'Sí'],
    ['Tecnología Base', 'React + Node.js + MySQL', '.NET Framework', 'Cloud-native Java/Python', '.NET Framework', 'Python'],
    ['Escalabilidad', 'Media (single server)', 'Alta (miles de robots)', 'Alta (multi-tenant cloud)', 'Alta (enterprise-grade)', 'Baja (máx 10 procesos)'],
    ['Alta Disponibilidad', 'Manual (Docker)', 'Sí (built-in)', 'Sí (cloud-native)', 'Sí', 'No'],

    // FUNCIONALIDADES CORE
    ['FUNCIONALIDADES CORE RPA', '', '', '', '', ''],
    ['Diseñador Visual (Drag & Drop)', 'Sí (completo con categorías)', 'Sí (Studio/StudioX)', 'Sí (Bot Creator)', 'Sí (Process Studio)', 'Sí (Studio)'],
    ['Grabador de Acciones', 'Sí (Recorder integrado)', 'Sí (múltiples grabadores)', 'Sí (Generative Recorder con IA)', 'Sí (básico)', 'Sí'],
    ['Element Spy / Inspector', 'Sí (integrado en navegador)', 'Sí (UI Explorer)', 'Sí (Recorder + Variable panel)', 'Sí', 'Parcial'],
    ['Robots Atendidos', 'Sí', 'Sí (UiPath Assistant)', 'Sí (AARI)', 'Sí (On-Desktop)', 'Sí (desktop trigger)'],
    ['Robots Desatendidos', 'Sí (ejecutor integrado)', 'Sí (Orchestrator)', 'Sí (Control Room)', 'Sí (Control Room)', 'Sí (cronJob/scheduler)'],
    ['Orquestador', 'Básico (programador)', 'Sí (Orchestrator avanzado)', 'Sí (Control Room)', 'Sí (Control Room)', 'Básico (Orchestrator Center)'],
    ['Programación de Tareas', 'Sí (Scheduler integrado)', 'Sí (cron, triggers)', 'Sí (triggers avanzados)', 'Sí', 'Sí (cronJob/Windows Scheduler)'],
    ['Variables y DataTables', 'Sí (panel completo)', 'Sí (completo)', 'Sí', 'Sí', 'Parcial'],
    ['Control de Flujo', 'Sí (17 acciones: if, for, while, try/catch, switch, etc.)', 'Sí (completo)', 'Sí (completo)', 'Sí (completo)', 'Básico'],
    ['Contenedores/Grupos', 'Sí (steps anidados)', 'Sí (sequences, flowcharts)', 'Sí', 'Sí (Process Studio)', 'Parcial'],

    // AUTOMATIZACIÓN WEB
    ['AUTOMATIZACIÓN WEB', '', '', '', '', ''],
    ['Navegadores Soportados', 'Chrome, Edge, Firefox, Brave', 'Chrome, Edge, Firefox, Safari', 'Chrome, Edge, Firefox', 'Chrome, Edge, Firefox', 'Chrome, Edge, Firefox'],
    ['Modo Headless', 'Sí', 'Sí', 'Sí', 'Parcial', 'No especificado'],
    ['Selectores CSS', 'Sí', 'Sí (con UiPath Selector)', 'Sí', 'Sí', 'Sí'],
    ['XPath', 'Sí', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Acciones Web Disponibles', '28+ acciones dedicadas', '50+ actividades web', '30+ acciones web', '20+ objetos web', '15+ acciones web'],
    ['Inyección JavaScript', 'Sí (execute_js)', 'Sí (Inject JS)', 'Sí', 'Parcial', 'No'],
    ['Manejo de Frames/iFrames', 'Sí (switch_frame)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Extracción de Datos Web', 'Sí (extract_text, extract_table)', 'Sí (Data Scraping wizard)', 'Sí', 'Sí', 'Básico'],
    ['Gestión de Pestañas', 'Sí (new_tab, switch_tab, close_tab)', 'Sí', 'Sí', 'Parcial', 'Parcial'],

    // AUTOMATIZACIÓN DESKTOP
    ['AUTOMATIZACIÓN DESKTOP', '', '', '', '', ''],
    ['Mouse & Keyboard', 'Sí (10 acciones)', 'Sí (nativo, avanzado)', 'Sí', 'Sí', 'Sí'],
    ['Gestión de Ventanas', 'Sí (activar, cerrar, min, max)', 'Sí (completo)', 'Sí', 'Sí', 'Parcial'],
    ['Ejecución de Procesos', 'Sí (process_start, process_kill)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Terminal/CMD/PowerShell', 'Sí (cmd, powershell, bash, ssh)', 'Sí', 'Sí', 'Parcial', 'Parcial'],
    ['Citrix / VDI', 'Sí (6 acciones dedicadas)', 'Sí (con extensión)', 'Sí (Computer Vision)', 'Sí', 'No'],
    ['Mainframe / AS400', 'Sí (7 acciones)', 'Sí (Terminal activites)', 'Parcial', 'Sí', 'No'],

    // EXCEL
    ['AUTOMATIZACIÓN EXCEL', '', '', '', '', ''],
    ['Excel COM/OLE (con aplicación)', 'Sí (54+ acciones avanzadas)', 'Sí (40+ actividades)', 'Sí', 'Sí', 'Parcial'],
    ['Excel Background (sin app)', 'Sí (44+ acciones openpyxl)', 'Sí (Workbook activities)', 'Sí', 'Parcial', 'Parcial'],
    ['Fórmulas', 'Sí', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Macros', 'Sí (excel_run_macro)', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['Gráficos', 'Sí (excel_bg_add_chart)', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['Tablas Dinámicas', 'Sí (convert_to_table)', 'Sí', 'Sí', 'Parcial', 'No'],
    ['Protección de Hojas', 'Sí (protect/unprotect)', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['Export CSV/JSON', 'Sí (to_csv, to_json)', 'Sí', 'Sí', 'Parcial', 'Básico'],

    // PDF
    ['PROCESAMIENTO PDF', '', '', '', '', ''],
    ['Leer/Extraer Texto', 'Sí', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Extraer Tablas', 'Sí', 'Sí', 'Sí', 'Parcial', 'No'],
    ['Crear PDF', 'Sí', 'Sí', 'Sí', 'Parcial', 'No'],
    ['Merge/Split', 'Sí', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['Firma Digital', 'Sí (pdf_add_signature)', 'Sí', 'Parcial', 'No', 'No'],
    ['Formularios PDF', 'Sí (pdf_fill_form)', 'Sí', 'Parcial', 'No', 'No'],
    ['Marca de Agua', 'Sí (pdf_add_watermark)', 'Parcial', 'Parcial', 'No', 'No'],

    // INTELIGENCIA ARTIFICIAL
    ['INTELIGENCIA ARTIFICIAL', '', '', '', '', ''],
    ['Generación de Texto', 'Sí (ai_text_generation)', 'Sí (GenAI Activities)', 'Sí (AI Agent Studio)', 'Parcial (Skills)', 'No'],
    ['Chat con IA', 'Sí (ai_chat integrado)', 'Sí (Autopilot)', 'Sí (AARI conversacional)', 'No', 'No'],
    ['Análisis de Sentimiento', 'Sí (ai_sentiment)', 'Sí', 'Sí', 'Parcial', 'No'],
    ['Clasificación', 'Sí (ai_classification)', 'Sí (Document Understanding)', 'Sí (IQ Bot)', 'Sí (Decipher)', 'No'],
    ['Resumen de Texto', 'Sí (ai_summarize)', 'Sí', 'Sí', 'No', 'No'],
    ['Traducción', 'Sí (ai_translation)', 'Sí', 'Parcial', 'No', 'No'],
    ['Extracción de Entidades', 'Sí (ai_extract_entities)', 'Sí', 'Sí', 'Parcial', 'No'],
    ['Análisis de Imagen', 'Sí (ai_image_analysis)', 'Sí (Computer Vision)', 'Sí', 'Parcial', 'No'],
    ['OCR con IA', 'Sí (ai_ocr)', 'Sí (múltiples motores)', 'Sí', 'Sí (Decipher IDP)', 'Básico'],
    ['Document Understanding (IDP)', 'Sí (ai_document_understanding)', 'Sí (líder, IXP con GenAI)', 'Sí (IQ Bot → Doc Automation)', 'Sí (Decipher IDP)', 'No'],
    ['Agentes Autónomos IA', 'Sí (Agentes + Catálogo)', 'Sí (Agent Builder, Maestro)', 'Sí (AI Agent Studio)', 'No', 'No'],
    ['Natural Language to Automation', 'Parcial (IA Dashboard)', 'Sí (Text to Workflow)', 'Sí (Generative Recorder)', 'No', 'No'],
    ['Process Mining', 'No', 'Sí (nativo, best-in-class)', 'Parcial (Process Discovery)', 'Sí (ABBYY Timeline)', 'No'],
    ['Task Mining', 'No', 'Sí (con audio/voz)', 'Parcial (en transición)', 'Sí (ABBYY Timeline)', 'No'],
    ['Healing Agents (auto-reparación)', 'No', 'Sí (2025)', 'No', 'No', 'No'],

    // INTEGRACIONES
    ['INTEGRACIONES', '', '', '', '', ''],
    ['Email (SMTP/IMAP)', 'Sí (12 acciones)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['REST API / HTTP', 'Sí (8 acciones inc. GraphQL)', 'Sí (HTTP activites)', 'Sí', 'Sí (Web Services)', 'Parcial'],
    ['Base de Datos SQL', 'Sí (11 acciones con transacciones)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['SAP', 'Sí (9 acciones dedicadas)', 'Sí (SAP connector)', 'Sí (SAP connector)', 'Sí (SAP connector)', 'Parcial (via store)'],
    ['Microsoft 365', 'Sí (8 acciones: Teams, SharePoint, OneDrive, Outlook)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Google Workspace', 'Sí (12 acciones: Sheets, Drive, Gmail, Calendar)', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['Amazon AWS', 'Sí (9 acciones: S3, Lambda, SQS, SNS)', 'Sí (marketplace)', 'Sí', 'Parcial', 'No'],
    ['Microsoft Azure', 'Sí (7 acciones: Blob, Functions, Queue)', 'Sí', 'Sí', 'Sí', 'No'],
    ['Active Directory', 'Sí (12 acciones LDAP completas)', 'Sí (actividades AD)', 'Sí', 'Sí', 'No'],
    ['FTP / SFTP', 'Sí (9 acciones)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Word', 'Sí (10 acciones)', 'Sí', 'Parcial', 'Parcial', 'No'],
    ['PowerPoint', 'Sí (10 acciones)', 'Parcial', 'No', 'No', 'No'],
    ['XML / JSON', 'Sí (9 acciones con XPath, JSONPath)', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['Marketplace/Store de Integraciones', 'No (built-in)', 'Sí (1,500+ listings)', 'Sí (300+ packages)', 'Sí (500+ DX assets)', 'Sí (store pequeño)'],

    // OCR E IMÁGENES
    ['OCR E IMÁGENES', '', '', '', '', ''],
    ['OCR Pantalla', 'Sí', 'Sí', 'Sí', 'Sí', 'Parcial'],
    ['OCR Región', 'Sí', 'Sí', 'Sí', 'Parcial', 'No'],
    ['OCR Documento', 'Sí', 'Sí (múltiples motores)', 'Sí (Document Automation)', 'Sí (Decipher)', 'No'],
    ['Buscar Imagen en Pantalla', 'Sí', 'Sí (Image automation)', 'Sí (Computer Vision)', 'Sí', 'No'],
    ['Comparar Imágenes', 'Sí', 'Parcial', 'Parcial', 'No', 'No'],

    // SEGURIDAD
    ['SEGURIDAD Y COMPLIANCE', '', '', '', '', ''],
    ['Autenticación de Usuarios', 'Sí (login con hash bcrypt)', 'Sí (SSO, MFA, SAML)', 'Sí (SSO, MFA, SAML)', 'Sí (SSO, MFA, SAML)', 'Básico'],
    ['Gestión de Credenciales', 'Sí (7 acciones, encriptación)', 'Sí (Credential Store)', 'Sí (Credential Vault)', 'Sí (Credential Store)', 'Básico'],
    ['Gestión de API Keys', 'Sí (módulo dedicado)', 'Sí', 'Sí', 'Sí', 'No'],
    ['SOC 2', 'No', 'Sí (Type 1 y 2)', 'Sí', 'Sí', 'No'],
    ['ISO 27001', 'No', 'Sí (+ 27017, 27018)', 'Sí', 'Sí', 'No'],
    ['HIPAA', 'No', 'Sí', 'Sí (firma BAAs)', 'Sí', 'No'],
    ['GDPR', 'N/A (self-hosted = control total)', 'Sí', 'Sí', 'Sí', 'No documentado'],
    ['FedRAMP', 'No', 'Sí', 'No', 'No', 'No'],
    ['Audit Trail', 'Básico (logs)', 'Sí (completo)', 'Sí', 'Sí (el más completo)', 'Básico'],

    // DESARROLLO
    ['EXPERIENCIA DE DESARROLLO', '', '', '', '', ''],
    ['Enfoque', 'Low-code visual', 'Unified (low-code + pro-code)', 'Primariamente low-code', 'Code-oriented', 'Low-code only'],
    ['Editor de Código Integrado', 'Sí (CodeEditorView con IA)', 'Sí (Coded Workflows)', 'Parcial (scripting)', 'Sí (Object Studio)', 'No'],
    ['Lenguaje de Scripting', 'JavaScript/Python', 'VB.NET, C#, Python', 'Python, scripting', 'VB.NET', 'Python'],
    ['Migración desde otras plataformas', 'Sí (UiPath XAML, Power Automate, Blue Prism, Python, JS, C#)', 'No nativo', 'No nativo', 'No nativo', 'No'],
    ['Biblioteca de Componentes', 'Sí (Library integrada)', 'Sí (packages, NuGet)', 'Sí (Bot Store)', 'Sí (Digital Exchange)', 'Sí (store)'],
    ['Plantillas de Workflow', 'Sí (WorkflowTemplatesView)', 'Sí (templates)', 'Sí (templates)', 'Sí (templates)', 'Sí (templates)'],
    ['Componentes Personalizados', 'Sí (createCustomComponent)', 'Sí (Custom Activities)', 'Sí (Custom Packages)', 'Sí (Business Objects)', 'Parcial'],

    // COMUNICACIÓN
    ['COMUNICACIÓN Y COLABORACIÓN', '', '', '', '', ''],
    ['Omnicanalidad', 'Sí (WhatsApp, Telegram, SMS, Chat, Email)', 'No nativo', 'Parcial (AARI)', 'No', 'No'],
    ['Videoconferencia', 'Sí (integrada)', 'No', 'No', 'No', 'No'],
    ['MCP Conectores', 'Sí (vista dedicada)', 'No', 'No', 'No', 'No'],
    ['Agente con Voz', 'Sí (Speech Synthesis)', 'No', 'No', 'No', 'No'],

    // DASHBOARDS Y ANALYTICS
    ['DASHBOARDS Y ANALYTICS', '', '', '', '', ''],
    ['Dashboard IA', 'Sí (AIDashboardView)', 'Sí (Insights)', 'Sí (Bot Insight)', 'Sí (analytics)', 'Básico'],
    ['Dashboard Creator', 'Sí (arrastrar y soltar)', 'Parcial (Insights custom)', 'Parcial', 'No', 'No'],
    ['Panel de Administración', 'Sí (AdminDashboard)', 'Sí (completo)', 'Sí (Control Room)', 'Sí', 'Básico'],
    ['Reportes de Ejecución', 'Sí', 'Sí (avanzados)', 'Sí (avanzados)', 'Sí', 'Básico'],

    // MULTI-IDIOMA
    ['EXPERIENCIA DE USUARIO', '', '', '', '', ''],
    ['Multi-idioma', 'Sí (ES, EN, PT - completo)', 'Sí (20+ idiomas)', 'Sí (4+ idiomas)', 'Sí (múltiples)', 'Sí (ES, EN, PT)'],
    ['Curva de Aprendizaje', 'Baja', 'Media-Alta', 'Media', 'Alta', 'Baja'],
    ['Onboarding Wizard', 'Sí (asistente guiado)', 'Sí (Academy)', 'Sí (AAU)', 'Sí (University)', 'Parcial'],
    ['Soporte Móvil', 'No nativo (web responsive)', 'Sí (UiPath Assistant mobile)', 'Sí (AARI mobile)', 'Limitado (web)', 'Parcial (formularios web)'],
    ['Comunidad', 'No (producto interno)', '3M+ miembros', 'Grande (no publicado)', '51K+ miembros', '3K+ estudiantes'],
    ['Certificaciones/Capacitación', 'No', 'Sí (Academy gratuita, exámenes)', 'Sí (AAU gratuita, 4 idiomas)', 'Sí (University, 290+ cursos)', 'Sí (gratuita, 550+ certs)'],

    // NÚMERO DE ACCIONES
    ['ACCIONES/ACTIVIDADES DISPONIBLES', '', '', '', '', ''],
    ['Navegador Web', '28', '50+', '30+', '20+', '15+'],
    ['Excel (total)', '98 (54 COM + 44 background)', '40+', '30+', '25+', '10+'],
    ['Base de Datos', '11', '15+', '10+', '10+', '5+'],
    ['Email', '12', '10+', '8+', '8+', '5+'],
    ['Archivos/Carpetas', '16', '15+', '10+', '10+', '8+'],
    ['PDF', '15', '10+', '8+', '5+', '2+'],
    ['REST API', '8', '5+', '5+', '3+', '2+'],
    ['IA/ML', '10', '20+', '15+', '5+', '0'],
    ['SAP', '9', '10+', '10+', '8+', '2+'],
    ['Active Directory', '12', '5+', '3+', '5+', '0'],
    ['Cloud (AWS/Azure)', '16', '20+', '15+', '10+', '0'],
    ['OCR/Imágenes', '9', '15+', '10+', '5+', '2+'],
    ['Control de Flujo', '17', '20+', '15+', '15+', '8+'],
    ['Omnicanalidad', '20+ (WhatsApp, Telegram, SMS, etc.)', '0 (vía marketplace)', '0', '0', '0'],
    ['TOTAL ESTIMADO DE ACCIONES', '350+', '500+', '300+', '200+', '80+'],
  ];

  let rowNum = 4;
  summaryData.forEach((row, idx) => {
    const isCategory = row[1] === '' && row[2] === '' && row[0] !== '';
    const wsRow = ws1.getRow(rowNum);

    if (isCategory) {
      row.forEach((val, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.value = colIdx === 0 ? val : '';
        Object.assign(cell, categoryStyle);
      });
      wsRow.height = 28;
    } else {
      const isEven = idx % 2 === 0;
      row.forEach((val, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.value = val;
        if (colIdx === 0) {
          cell.font = { bold: true, name: 'Calibri', size: 10, color: { argb: colors.darkText } };
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.border = cellBorder;
          if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };
        } else {
          applyCellStyle(cell, isEven);
          applyRatingCell(cell, val);
        }
      });
      wsRow.height = 22;
    }
    rowNum++;
  });

  // ===================================================================
  // HOJA 2: PROS Y CONTRAS
  // ===================================================================
  const ws2 = workbook.addWorksheet('Pros y Contras', {
    properties: { tabColor: { argb: 'FF27AE60' } },
    views: [{ state: 'frozen', ySplit: 2 }]
  });

  ws2.columns = [
    { width: 22 }, // Herramienta
    { width: 8 },  // +/-
    { width: 80 }, // Descripción
    { width: 25 }, // Impacto
  ];

  // Título
  ws2.mergeCells('A1:D1');
  const ws2Title = ws2.getCell('A1');
  ws2Title.value = 'ANÁLISIS DETALLADO DE PROS Y CONTRAS';
  ws2Title.font = { bold: true, size: 16, color: { argb: colors.headerFont }, name: 'Calibri' };
  ws2Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  ws2Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 40;

  // Headers
  ['HERRAMIENTA', 'TIPO', 'DESCRIPCIÓN', 'IMPACTO'].forEach((h, i) => {
    const cell = ws2.getCell(2, i + 1);
    cell.value = h;
    Object.assign(cell, headerStyle);
  });
  ws2.getRow(2).height = 30;

  const prosConsData = [
    // ALQVIMIA
    ['ALQVIMIA RPA 2.0', '', '', '', colors.alqvimiaBg],
    ['Alqvimia', 'PRO', 'Costo cero de licenciamiento: self-hosted sin cobro por robot, usuario o ejecución', 'Crítico - Ahorro'],
    ['Alqvimia', 'PRO', '350+ acciones nativas integradas sin necesidad de plugins o marketplace', 'Alto - Productividad'],
    ['Alqvimia', 'PRO', '98 acciones de Excel (54 COM + 44 background): la cobertura más completa del mercado', 'Alto - Diferenciador'],
    ['Alqvimia', 'PRO', 'Sistema de migración completo: importa desde UiPath, Power Automate, Blue Prism, Python, JS, C#', 'Alto - Adopción'],
    ['Alqvimia', 'PRO', 'Omnicanalidad integrada: WhatsApp, Telegram, SMS, Chat Web, Email en un solo lugar', 'Alto - Diferenciador único'],
    ['Alqvimia', 'PRO', 'Videoconferencia integrada directamente en la plataforma RPA', 'Medio - Diferenciador único'],
    ['Alqvimia', 'PRO', '10 acciones de IA nativas: generación de texto, chat, sentimiento, OCR, document understanding', 'Alto - Competitivo'],
    ['Alqvimia', 'PRO', 'Catálogo de agentes IA y marketplace de agentes integrado', 'Alto - Innovación'],
    ['Alqvimia', 'PRO', 'Dashboard Creator drag & drop para crear dashboards personalizados', 'Medio - Diferenciador'],
    ['Alqvimia', 'PRO', 'Multi-idioma completo (ES/EN/PT) con agente con voz Speech Synthesis', 'Medio - UX'],
    ['Alqvimia', 'PRO', 'Integraciones nativas: SAP (9), Active Directory (12), AWS (9), Azure (7), M365 (8), Google (12)', 'Alto - Enterprise'],
    ['Alqvimia', 'PRO', 'Curva de aprendizaje baja con Onboarding Wizard integrado', 'Alto - Adopción'],
    ['Alqvimia', 'PRO', 'Editor de código con IA integrado para developers', 'Medio - Productividad'],
    ['Alqvimia', 'PRO', 'MCP Conectores para conectar servicios externos de forma estandarizada', 'Medio - Flexibilidad'],
    ['Alqvimia', 'PRO', 'Citrix/VDI y Mainframe/AS400 soportados nativamente', 'Alto - Enterprise'],
    ['Alqvimia', 'PRO', 'Control total de datos: self-hosted = GDPR compliance inherente', 'Alto - Seguridad'],
    ['Alqvimia', 'CONTRA', 'Sin certificaciones de seguridad formales (SOC 2, ISO 27001, HIPAA)', 'Alto - Enterprise'],
    ['Alqvimia', 'CONTRA', 'Sin Process Mining ni Task Mining', 'Medio - Discovery'],
    ['Alqvimia', 'CONTRA', 'Escalabilidad limitada: arquitectura single-server', 'Alto - Enterprise'],
    ['Alqvimia', 'CONTRA', 'Sin comunidad ni marketplace externo de terceros', 'Medio - Ecosistema'],
    ['Alqvimia', 'CONTRA', 'Sin soporte cloud nativo ni alta disponibilidad automatizada', 'Medio - Infraestructura'],
    ['Alqvimia', 'CONTRA', 'Sin certificaciones ni programa de training formal', 'Medio - Adopción'],
    ['Alqvimia', 'CONTRA', 'Producto joven sin track record enterprise probado', 'Alto - Confianza'],
    ['Alqvimia', 'CONTRA', 'Sin soporte móvil nativo (solo web responsive)', 'Bajo - UX'],
    ['Alqvimia', 'CONTRA', 'Sin healing agents ni auto-reparación de workflows', 'Medio - Madurez'],

    // UIPATH
    ['UIPATH', '', '', '', colors.uipathBg],
    ['UiPath', 'PRO', 'Líder indiscutible del mercado: 35.8% market share, $1.43B revenue, #1 Gartner 7 años', 'Crítico - Credibilidad'],
    ['UiPath', 'PRO', 'IA más avanzada: Autopilot, Agent Builder, Maestro (multi-agente), Healing Agents', 'Crítico - Innovación'],
    ['UiPath', 'PRO', 'Process Mining y Task Mining nativos: los mejores del mercado', 'Alto - Discovery'],
    ['UiPath', 'PRO', 'Unified Studio: desarrollo low-code + pro-code (Python, C#, VB.NET) en un mismo entorno', 'Alto - Flexibilidad'],
    ['UiPath', 'PRO', 'Marketplace más grande: 1,500+ listings, comunidad de 3M+ miembros', 'Alto - Ecosistema'],
    ['UiPath', 'PRO', 'Document Understanding con GenAI (IXP): líder en IDP', 'Alto - IA'],
    ['UiPath', 'PRO', 'Certificaciones de seguridad completas: SOC 2, ISO 27001/27017/27018, HIPAA, FedRAMP', 'Alto - Enterprise'],
    ['UiPath', 'PRO', 'Escalabilidad probada: miles de robots en despliegues globales', 'Alto - Enterprise'],
    ['UiPath', 'PRO', 'Academy gratuita con certificaciones profesionales reconocidas', 'Alto - Adopción'],
    ['UiPath', 'PRO', 'Despliegue flexible: Cloud, On-Premises, Hybrid (AWS, Azure, GCP)', 'Alto - Flexibilidad'],
    ['UiPath', 'CONTRA', 'Licenciamiento muy costoso: $420+/mes base, TCO alto para SMBs ($150K-500K+ 3 años)', 'Crítico - Costo'],
    ['UiPath', 'CONTRA', 'Estructura de pricing compleja: créditos unificados vs flex, difícil de calcular', 'Alto - Transparencia'],
    ['UiPath', 'CONTRA', 'Curva de aprendizaje media-alta, especialmente para agentic automation', 'Medio - Adopción'],
    ['UiPath', 'CONTRA', 'Dependencia fuerte de .NET Framework', 'Medio - Flexibilidad'],
    ['UiPath', 'CONTRA', 'Migraciones de versión rompen workflows existentes (ej. 2024.10)', 'Alto - Estabilidad'],
    ['UiPath', 'CONTRA', 'Workflows grandes causan problemas de rendimiento', 'Medio - Performance'],
    ['UiPath', 'CONTRA', 'IA/agentic features no generan revenue material aún (según CFO)', 'Medio - ROI de IA'],
    ['UiPath', 'CONTRA', 'Features nuevos a veces se lanzan sin madurez completa', 'Medio - Calidad'],

    // AUTOMATION ANYWHERE
    ['AUTOMATION ANYWHERE', '', '', '', colors.aaBg],
    ['Automation Anywhere', 'PRO', 'Cloud-native desde el inicio (A360): arquitectura moderna y escalable', 'Alto - Arquitectura'],
    ['Automation Anywhere', 'PRO', 'AI Agent Studio con 655K+ agentes IA ejecutados por clientes', 'Alto - IA'],
    ['Automation Anywhere', 'PRO', 'AARI: mejor interfaz humano-bot del mercado, conversacional', 'Alto - UX'],
    ['Automation Anywhere', 'PRO', 'Generative Recorder: graba acciones con GenAI y lenguaje natural', 'Alto - Innovación'],
    ['Automation Anywhere', 'PRO', 'Crecimiento fuerte: 150%+ en deals millonarios, 90% YoY en AI Agent bookings', 'Alto - Momentum'],
    ['Automation Anywhere', 'PRO', 'HIPAA compliant con firma de BAAs: fuerte en healthcare', 'Alto - Compliance'],
    ['Automation Anywhere', 'PRO', 'Starter pack accesible: $750/mes con 1 unattended bot', 'Medio - Accesibilidad'],
    ['Automation Anywhere', 'PRO', 'Automatización blended: mezcla attended + unattended en mismo workflow', 'Alto - Flexibilidad'],
    ['Automation Anywhere', 'CONTRA', 'Costos altos para SMBs: licenciamiento complejo a escala', 'Alto - Costo'],
    ['Automation Anywhere', 'CONTRA', 'Soporte técnico: tiempos de respuesta lentos, issues sin resolver', 'Alto - Soporte'],
    ['Automation Anywhere', 'CONTRA', 'Bugs en manejo de Excel y mecanismos de logging inadecuados', 'Medio - Calidad'],
    ['Automation Anywhere', 'CONTRA', 'OCR/UI element extraction no siempre funciona en web automation', 'Medio - Confiabilidad'],
    ['Automation Anywhere', 'CONTRA', 'Bots encriptados requieren mucho CPU/memoria', 'Medio - Performance'],
    ['Automation Anywhere', 'CONTRA', 'Transición de productos: IQ Bot EOL Mar 2026, Discovery Bot EOL Nov 2025', 'Alto - Disrupción'],
    ['Automation Anywhere', 'CONTRA', 'Actualizaciones frecuentes rompen compatibilidad, requieren reconfiguración', 'Alto - Estabilidad'],
    ['Automation Anywhere', 'CONTRA', 'Problemas de integración con productos Microsoft y herramientas DevOps', 'Medio - Integración'],

    // BLUE PRISM
    ['BLUE PRISM (SS&C)', '', '', '', colors.bpBg],
    ['Blue Prism', 'PRO', 'Governance y compliance más fuertes del mercado: audit trail completo', 'Crítico - Enterprise'],
    ['Blue Prism', 'PRO', 'Licencia única: sin cargo por usuario ni por entorno, cubre attended + unattended', 'Alto - Simplicidad'],
    ['Blue Prism', 'PRO', 'Preferido por industrias altamente reguladas: banca, salud, gobierno', 'Alto - Confianza'],
    ['Blue Prism', 'PRO', 'Respaldo de SS&C Technologies ($5.9B revenue), estabilidad financiera', 'Alto - Estabilidad'],
    ['Blue Prism', 'PRO', 'ROI de 330% en 3 años según estudio Forrester', 'Alto - ROI'],
    ['Blue Prism', 'PRO', 'Process Intelligence con ABBYY Timeline: análisis avanzado de procesos', 'Medio - Discovery'],
    ['Blue Prism', 'PRO', 'Digital Exchange con 500+ assets de 100+ partners', 'Medio - Ecosistema'],
    ['Blue Prism', 'CONTRA', 'El más caro: $15,000-20,000/año por digital worker', 'Crítico - Costo'],
    ['Blue Prism', 'CONTRA', 'Market share en declive: cayó de 11.9% a 6.5%, superado por Power Automate', 'Crítico - Relevancia'],
    ['Blue Prism', 'CONTRA', 'Curva de aprendizaje más pronunciada: requiere developers especializados', 'Alto - Adopción'],
    ['Blue Prism', 'CONTRA', 'IA limitada vs competencia: sin GenAI nativo, sin agentes autónomos', 'Alto - Innovación'],
    ['Blue Prism', 'CONTRA', 'OCR requiere identificación manual de tecnologías web', 'Medio - Usabilidad'],
    ['Blue Prism', 'CONTRA', 'Integración limitada: solo Web Services y K scripts para sistemas externos', 'Alto - Flexibilidad'],
    ['Blue Prism', 'CONTRA', 'Comunidad más pequeña: 51K vs 3M de UiPath', 'Alto - Ecosistema'],
    ['Blue Prism', 'CONTRA', 'Bugs ocasionales en scheduling de procesos automatizados', 'Medio - Confiabilidad'],

    // ROCKETBOT
    ['ROCKETBOT', '', '', '', colors.rocketBg],
    ['Rocketbot', 'PRO', 'La herramienta RPA más accesible del mercado: ideal para SMBs y startups', 'Alto - Accesibilidad'],
    ['Rocketbot', 'PRO', 'Sin cobro por usuario: escalamiento económico', 'Alto - Costo'],
    ['Rocketbot', 'PRO', 'Curva de aprendizaje más baja: 1-2 semanas para entrenar y desplegar robots', 'Alto - Adopción'],
    ['Rocketbot', 'PRO', 'Studio de desarrollo gratuito, training y certificaciones sin costo', 'Alto - Adopción'],
    ['Rocketbot', 'PRO', 'Despliegue flexible: Windows, Linux Ubuntu, cloud (AWS, Azure)', 'Medio - Flexibilidad'],
    ['Rocketbot', 'PRO', 'Fuerte presencia en Latinoamérica con soporte en español/portugués', 'Medio - Regional'],
    ['Rocketbot', 'PRO', '4.6/5 rating promedio en G2 y Gartner Peer Insights', 'Medio - Satisfacción'],
    ['Rocketbot', 'CONTRA', 'Sin capacidades de IA/ML nativas: sin GenAI, sin agentes, sin cognitive automation', 'Crítico - Innovación'],
    ['Rocketbot', 'CONTRA', 'Sin Process Mining ni Task Mining', 'Alto - Discovery'],
    ['Rocketbot', 'CONTRA', 'Escalabilidad limitada: máximo 10 procesos concurrentes', 'Crítico - Enterprise'],
    ['Rocketbot', 'CONTRA', 'Ecosistema pequeño: pocas integraciones, templates y recursos comunitarios', 'Alto - Ecosistema'],
    ['Rocketbot', 'CONTRA', 'Sin certificaciones de seguridad: no SOC 2, no ISO 27001, no HIPAA', 'Alto - Enterprise'],
    ['Rocketbot', 'CONTRA', 'Bugs reportados por usuarios que impactan la usabilidad', 'Medio - Calidad'],
    ['Rocketbot', 'CONTRA', 'Documentación pobre: falta de guías detalladas y video tutoriales', 'Medio - Soporte'],
    ['Rocketbot', 'CONTRA', 'Funding mínimo ($2.7M): capacidad limitada de I+D vs competencia billonaria', 'Crítico - Futuro'],
    ['Rocketbot', 'CONTRA', 'No incluido en Gartner Magic Quadrant: falta credibilidad enterprise', 'Alto - Credibilidad'],
    ['Rocketbot', 'CONTRA', 'Personalización limitada para necesidades de automatización especializadas', 'Medio - Flexibilidad'],
  ];

  let row2Num = 3;
  prosConsData.forEach((row) => {
    const wsRow = ws2.getRow(row2Num);

    if (row.length === 5 && row[1] === '') {
      // Category header
      ws2.mergeCells(row2Num, 1, row2Num, 4);
      const cell = wsRow.getCell(1);
      cell.value = row[0];
      cell.font = { bold: true, size: 13, color: { argb: colors.headerFont }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[4] } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = cellBorder;
      wsRow.height = 32;
    } else {
      const isPro = row[1] === 'PRO';

      wsRow.getCell(1).value = row[0];
      wsRow.getCell(1).font = { bold: true, name: 'Calibri', size: 10 };
      wsRow.getCell(1).alignment = { vertical: 'middle', wrapText: true };
      wsRow.getCell(1).border = cellBorder;

      const typeCell = wsRow.getCell(2);
      typeCell.value = isPro ? '+' : '-';
      typeCell.font = { bold: true, size: 14, color: { argb: isPro ? 'FF1E8449' : 'FF922B21' } };
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPro ? 'FFD5F5E3' : 'FFFADBD8' } };
      typeCell.alignment = { horizontal: 'center', vertical: 'middle' };
      typeCell.border = cellBorder;

      wsRow.getCell(3).value = row[2];
      wsRow.getCell(3).font = { name: 'Calibri', size: 10 };
      wsRow.getCell(3).alignment = { vertical: 'middle', wrapText: true };
      wsRow.getCell(3).border = cellBorder;

      wsRow.getCell(4).value = row[3];
      wsRow.getCell(4).font = { name: 'Calibri', size: 10, italic: true };
      wsRow.getCell(4).alignment = { vertical: 'middle', wrapText: true };
      wsRow.getCell(4).border = cellBorder;

      wsRow.height = 24;
    }
    row2Num++;
  });

  // ===================================================================
  // HOJA 3: SCORING / PUNTUACIÓN
  // ===================================================================
  const ws3 = workbook.addWorksheet('Scoring Detallado', {
    properties: { tabColor: { argb: 'FFF39C12' } },
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  ws3.columns = [
    { width: 35 }, // Criterio
    { width: 10 }, // Peso
    { width: 14 }, // Alqvimia
    { width: 14 }, // UiPath
    { width: 14 }, // AA
    { width: 14 }, // BP
    { width: 14 }, // Rocket
  ];

  // Título
  ws3.mergeCells('A1:G1');
  const ws3Title = ws3.getCell('A1');
  ws3Title.value = 'SCORING COMPARATIVO PONDERADO (1-10)';
  ws3Title.font = { bold: true, size: 16, color: { argb: colors.headerFont }, name: 'Calibri' };
  ws3Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  ws3Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws3.getRow(1).height = 40;

  // Subtítulo
  ws3.mergeCells('A2:G2');
  const ws3Sub = ws3.getCell('A2');
  ws3Sub.value = '10 = Excelente | 7-9 = Bueno | 4-6 = Aceptable | 1-3 = Débil | Peso: importancia del criterio (1-5)';
  ws3Sub.font = { size: 10, color: { argb: 'FFB0B0B0' }, name: 'Calibri' };
  ws3Sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  ws3Sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws3.getRow(2).height = 25;

  // Headers
  const scoreHeaders = ['CRITERIO', 'PESO', 'ALQVIMIA', 'UIPATH', 'AUTOM. ANY.', 'BLUE PRISM', 'ROCKETBOT'];
  const scoreColors = [colors.headerBg, colors.headerBg, colors.alqvimiaBg, colors.uipathBg, colors.aaBg, colors.bpBg, colors.rocketBg];
  ws3.getRow(3).height = 32;
  scoreHeaders.forEach((h, i) => {
    const cell = ws3.getCell(3, i + 1);
    cell.value = h;
    applyToolHeader(cell, scoreColors[i]);
  });

  // Datos de scoring: [Criterio, Peso, Alqvimia, UiPath, AA, BP, Rocket]
  const scoringData = [
    ['COSTO Y ACCESIBILIDAD', '', '', '', '', '', ''],
    ['Costo de licenciamiento', 5, 10, 3, 4, 2, 9],
    ['Transparencia de pricing', 4, 10, 4, 5, 4, 7],
    ['TCO (3 años, 10 bots)', 5, 10, 3, 4, 2, 8],
    ['Edición gratuita disponible', 3, 10, 7, 6, 0, 9],
    ['Escalabilidad de costos', 4, 10, 4, 5, 3, 8],

    ['FUNCIONALIDADES CORE RPA', '', '', '', '', '', ''],
    ['Diseñador visual', 5, 8, 10, 8, 7, 6],
    ['Grabador de acciones', 4, 7, 9, 9, 5, 6],
    ['Automatización web', 5, 8, 9, 8, 7, 5],
    ['Automatización desktop', 4, 7, 9, 8, 8, 5],
    ['Automatización Excel', 5, 10, 8, 7, 6, 4],
    ['Procesamiento PDF', 3, 9, 8, 7, 5, 3],
    ['Control de flujo', 5, 8, 9, 8, 8, 5],
    ['Variables y datos', 4, 8, 9, 8, 8, 5],
    ['Orquestación', 4, 5, 10, 9, 9, 4],
    ['Programación/Scheduling', 3, 7, 9, 9, 8, 5],

    ['INTELIGENCIA ARTIFICIAL', '', '', '', '', '', ''],
    ['IA generativa integrada', 5, 7, 10, 8, 3, 0],
    ['Document Understanding (IDP)', 4, 6, 10, 8, 7, 0],
    ['OCR nativo', 3, 7, 9, 8, 7, 3],
    ['Agentes autónomos IA', 4, 6, 10, 8, 0, 0],
    ['Process Mining', 4, 0, 10, 5, 7, 0],
    ['Task Mining', 3, 0, 10, 4, 7, 0],
    ['NL to Automation', 3, 5, 9, 8, 0, 0],
    ['Auto-healing / Self-repair', 3, 0, 8, 0, 0, 0],

    ['INTEGRACIONES', '', '', '', '', '', ''],
    ['Email (SMTP/IMAP)', 3, 9, 8, 7, 7, 5],
    ['REST API / HTTP', 4, 8, 8, 8, 6, 4],
    ['Base de datos SQL', 4, 8, 8, 7, 7, 4],
    ['SAP', 4, 7, 9, 9, 8, 3],
    ['Microsoft 365', 4, 7, 9, 8, 7, 3],
    ['Google Workspace', 3, 8, 7, 5, 4, 0],
    ['Cloud (AWS/Azure)', 3, 8, 8, 8, 6, 0],
    ['Active Directory', 3, 9, 7, 5, 7, 0],
    ['Citrix/VDI', 3, 6, 8, 8, 7, 0],
    ['Mainframe/AS400', 3, 6, 8, 5, 7, 0],
    ['Marketplace de integraciones', 4, 2, 10, 7, 7, 3],

    ['OMNICANALIDAD Y COMUNICACIÓN', '', '', '', '', '', ''],
    ['WhatsApp / Telegram / SMS', 4, 9, 0, 0, 0, 0],
    ['Chat web integrado', 3, 8, 0, 4, 0, 0],
    ['Videoconferencia', 2, 8, 0, 0, 0, 0],
    ['Agente con voz', 2, 7, 0, 0, 0, 0],

    ['SEGURIDAD Y COMPLIANCE', '', '', '', '', '', ''],
    ['Autenticación (SSO, MFA)', 4, 4, 10, 9, 9, 3],
    ['Gestión de credenciales', 4, 7, 9, 9, 9, 3],
    ['SOC 2 / ISO 27001', 4, 0, 10, 8, 8, 0],
    ['HIPAA', 3, 0, 8, 9, 8, 0],
    ['Audit trail', 4, 4, 9, 8, 10, 3],
    ['Control de datos (self-hosted)', 3, 10, 7, 5, 8, 7],

    ['EXPERIENCIA DE USUARIO', '', '', '', '', '', ''],
    ['Curva de aprendizaje', 5, 9, 5, 6, 3, 9],
    ['Onboarding / Wizard', 3, 8, 7, 7, 6, 4],
    ['Multi-idioma', 3, 8, 9, 7, 7, 7],
    ['Soporte móvil', 2, 3, 7, 7, 3, 4],
    ['Dashboard / Analytics', 3, 8, 8, 7, 6, 3],
    ['Dashboard Creator (custom)', 3, 9, 6, 5, 4, 0],
    ['Editor de código integrado', 3, 8, 9, 5, 7, 0],

    ['ECOSISTEMA Y MADUREZ', '', '', '', '', '', ''],
    ['Comunidad', 4, 1, 10, 7, 4, 2],
    ['Documentación', 4, 3, 9, 7, 7, 3],
    ['Certificaciones/Training', 3, 1, 10, 8, 8, 6],
    ['Madurez del producto', 4, 3, 10, 8, 9, 4],
    ['Track record enterprise', 5, 1, 10, 8, 9, 2],
    ['Soporte técnico', 4, 2, 7, 5, 7, 4],
    ['Visión de futuro', 4, 7, 10, 8, 5, 4],

    ['DIFERENCIADORES ÚNICOS', '', '', '', '', '', ''],
    ['Migración desde otras plataformas', 4, 10, 0, 0, 0, 0],
    ['Omnicanalidad integrada', 4, 10, 0, 0, 0, 0],
    ['Componentes personalizados (runtime)', 3, 9, 7, 5, 6, 3],
    ['Self-hosted sin restricciones', 3, 10, 5, 3, 7, 7],
  ];

  let row3Num = 4;
  let totalWeights = 0;
  let totals = [0, 0, 0, 0, 0]; // weighted scores for each tool

  scoringData.forEach((row) => {
    const wsRow = ws3.getRow(row3Num);
    const isCategory = row[1] === '';

    if (isCategory) {
      row.forEach((val, i) => {
        const cell = wsRow.getCell(i + 1);
        cell.value = i === 0 ? val : '';
        Object.assign(cell, categoryStyle);
      });
      wsRow.height = 28;
    } else {
      const weight = row[1];
      totalWeights += weight;

      row.forEach((val, i) => {
        const cell = wsRow.getCell(i + 1);
        cell.value = val;
        cell.border = cellBorder;
        cell.alignment = { vertical: 'middle', wrapText: true, horizontal: i > 0 ? 'center' : 'left' };
        cell.font = { name: 'Calibri', size: 10 };

        if (i === 0) {
          cell.font = { bold: true, name: 'Calibri', size: 10, color: { argb: colors.darkText } };
        } else if (i === 1) {
          cell.font = { bold: true, name: 'Calibri', size: 10, color: { argb: 'FF8E44AD' } };
        } else if (i >= 2) {
          const score = val;
          totals[i - 2] += score * weight;

          // Color code scores
          if (score >= 8) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
            cell.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF1E8449' } };
          } else if (score >= 5) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } };
            cell.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF9A7D0A' } };
          } else if (score >= 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
            cell.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF922B21' } };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            cell.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF999999' } };
          }
        }
      });
      wsRow.height = 22;
    }
    row3Num++;
  });

  // Add totals row
  row3Num += 1;
  const totalsRow = ws3.getRow(row3Num);
  totalsRow.height = 35;

  const totalCell = totalsRow.getCell(1);
  totalCell.value = 'PUNTUACIÓN TOTAL PONDERADA';
  totalCell.font = { bold: true, size: 12, name: 'Calibri', color: { argb: colors.headerFont } };
  totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  totalCell.alignment = { horizontal: 'left', vertical: 'middle' };
  totalCell.border = cellBorder;

  const weightCell = totalsRow.getCell(2);
  weightCell.value = totalWeights;
  weightCell.font = { bold: true, size: 12, name: 'Calibri', color: { argb: colors.headerFont } };
  weightCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  weightCell.alignment = { horizontal: 'center', vertical: 'middle' };
  weightCell.border = cellBorder;

  const toolTotalColors = [colors.alqvimiaBg, colors.uipathBg, colors.aaBg, colors.bpBg, colors.rocketBg];
  totals.forEach((total, i) => {
    const cell = totalsRow.getCell(i + 3);
    const avg = (total / totalWeights).toFixed(1);
    cell.value = `${total} pts (${avg}/10)`;
    cell.font = { bold: true, size: 12, name: 'Calibri', color: { argb: colors.headerFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toolTotalColors[i] } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = cellBorder;
  });

  // Ranking row
  row3Num += 1;
  const rankRow = ws3.getRow(row3Num);
  rankRow.height = 30;

  const rankLabel = rankRow.getCell(1);
  rankLabel.value = 'RANKING';
  Object.assign(rankLabel, categoryStyle);
  rankRow.getCell(2).value = '';
  Object.assign(rankRow.getCell(2), categoryStyle);

  // Sort to get ranking
  const toolNames = ['Alqvimia', 'UiPath', 'Autom. Anywhere', 'Blue Prism', 'Rocketbot'];
  const indexed = totals.map((t, i) => ({ total: t, idx: i }));
  indexed.sort((a, b) => b.total - a.total);
  const ranks = new Array(5);
  indexed.forEach((item, pos) => { ranks[item.idx] = pos + 1; });

  ranks.forEach((rank, i) => {
    const cell = rankRow.getCell(i + 3);
    cell.value = `#${rank}`;
    cell.font = { bold: true, size: 14, name: 'Calibri', color: { argb: rank === 1 ? 'FFf1c40f' : colors.headerFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toolTotalColors[i] } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = cellBorder;
  });

  // ===================================================================
  // HOJA 4: RECOMENDACIONES
  // ===================================================================
  const ws4 = workbook.addWorksheet('Recomendaciones', {
    properties: { tabColor: { argb: 'FF2ECC71' } }
  });

  ws4.columns = [
    { width: 25 },
    { width: 80 },
  ];

  // Título
  ws4.mergeCells('A1:B1');
  const ws4Title = ws4.getCell('A1');
  ws4Title.value = 'RECOMENDACIONES Y CONCLUSIONES';
  ws4Title.font = { bold: true, size: 16, color: { argb: colors.headerFont }, name: 'Calibri' };
  ws4Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  ws4Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws4.getRow(1).height = 40;

  const recommendations = [
    ['CUÁNDO ELEGIR...', '', colors.headerBg],
    ['Alqvimia RPA 2.0', 'Ideal para: Organizaciones que buscan cero costo de licenciamiento, control total de datos (self-hosted), necesidades de omnicanalidad integrada (WhatsApp, Telegram, SMS), migración desde otras plataformas RPA, automatización de Excel avanzada, y startups/SMBs que no pueden justificar los costos de UiPath o AA. También para equipos que valoran la baja curva de aprendizaje y la capacidad de personalización completa del código.'],
    ['UiPath', 'Ideal para: Grandes empresas que requieren la plataforma más completa y madura del mercado, capacidades avanzadas de IA/GenAI (Autopilot, Agent Builder), Process Mining y Task Mining nativos, máxima escalabilidad (miles de robots), cumplimiento regulatorio completo (SOC 2, ISO, HIPAA, FedRAMP), y acceso al ecosistema más grande (3M+ comunidad, 1,500+ marketplace). Justificable cuando el presupuesto no es la restricción principal.'],
    ['Automation Anywhere', 'Ideal para: Organizaciones que priorizan una arquitectura cloud-native moderna, necesitan excelente colaboración humano-bot (AARI), están en healthcare (HIPAA con BAA), buscan crecimiento rápido en AI agents, y prefieren un punto de entrada más accesible que UiPath ($750/mes starter). Buena opción para empresas en transición a la nube.'],
    ['Blue Prism (SS&C)', 'Ideal para: Industrias altamente reguladas (banca, gobierno, seguros) donde la governance y el audit trail son prioridad absoluta, organizaciones que ya tienen relación con SS&C Technologies, y empresas que prefieren un modelo de licencia simple (por capacidad, no por usuario). NO recomendado para nuevos proyectos debido al declive de market share y la falta de innovación en IA.'],
    ['Rocketbot', 'Ideal para: Pequeñas y medianas empresas en Latinoamérica con presupuesto limitado, primeros pasos en automatización (RPA journey), procesos simples de no más de 10 ejecuciones concurrentes, y organizaciones que valoran el soporte en español y la capacitación gratuita. NO recomendado para automatización enterprise o procesos que requieran IA avanzada.'],

    ['', ''],
    ['VENTAJAS COMPETITIVAS ÚNICAS DE ALQVIMIA', '', colors.alqvimiaBg],
    ['1. Cero Costo', 'Alqvimia es la ÚNICA plataforma RPA con funcionalidades enterprise completas que no cobra absolutamente nada por licenciamiento. Mientras UiPath cobra $420+/mes, AA cobra $750/mes, y Blue Prism cobra $15K-20K/año por robot, Alqvimia solo requiere infraestructura de hosting.'],
    ['2. Migración Universal', 'Alqvimia es la ÚNICA plataforma del mercado que ofrece importación nativa desde UiPath (XAML), Power Automate, Blue Prism (XML), Python (Selenium/Playwright), JavaScript (Puppeteer/Playwright), y C# (Selenium/HttpClient). Ningún competidor ofrece esta capacidad.'],
    ['3. Omnicanalidad Integrada', 'Alqvimia es la ÚNICA plataforma RPA que integra comunicación multicanal (WhatsApp, Telegram, SMS, Chat Web, Email) directamente en el workflow designer, con 20+ acciones dedicadas. Ningún competidor tiene esto de forma nativa.'],
    ['4. Excel Masivo', 'Con 98 acciones de Excel (54 COM + 44 background), Alqvimia supera ampliamente a UiPath (~40), AA (~30) y Blue Prism (~25) en cobertura de automatización Excel.'],
    ['5. Videoconferencia + Voz', 'Única plataforma RPA con videoconferencia integrada y agente con voz (Speech Synthesis) como features nativos.'],
    ['6. Dashboard Creator', 'Alqvimia permite crear dashboards personalizados con drag & drop, una funcionalidad que las demás plataformas no ofrecen o cobran como módulo premium separado.'],

    ['', ''],
    ['ÁREAS DE MEJORA PRIORITARIAS PARA ALQVIMIA', '', colors.conBg],
    ['1. Certificaciones de Seguridad', 'Obtener SOC 2 Type 2 e ISO 27001 es crítico para vender a empresas medianas y grandes. Sin estas certificaciones, muchas organizaciones no pueden ni evaluar la herramienta.'],
    ['2. Escalabilidad', 'Implementar arquitectura multi-nodo/clustering para soportar despliegues enterprise con cientos de procesos concurrentes. Considerar opciones cloud managed.'],
    ['3. Process Mining', 'Agregar capacidades básicas de Process Mining para competir con UiPath y Blue Prism en discovery de procesos. Integración con herramientas existentes como mínimo.'],
    ['4. Comunidad y Documentación', 'Crear portal de comunidad, documentación exhaustiva, tutoriales en video, y programa de certificación para acelerar la adopción.'],
    ['5. Healing/Auto-repair', 'Implementar self-healing para workflows que fallen, al menos detección de selectores rotos con sugerencias automáticas de corrección.'],
    ['6. Soporte Móvil', 'Crear app móvil o PWA para monitoreo y ejecución de workflows desde dispositivos móviles.'],
  ];

  let row4Num = 2;
  recommendations.forEach((row) => {
    const wsRow = ws4.getRow(row4Num);

    if (row.length === 3 && row[2]) {
      // Section header
      ws4.mergeCells(row4Num, 1, row4Num, 2);
      const cell = wsRow.getCell(1);
      cell.value = row[0];
      cell.font = { bold: true, size: 13, color: { argb: colors.headerFont }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[2] } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = cellBorder;
      wsRow.height = 32;
    } else if (row[0] === '' && row[1] === '') {
      wsRow.height = 10;
    } else {
      wsRow.getCell(1).value = row[0];
      wsRow.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: { argb: colors.darkText } };
      wsRow.getCell(1).alignment = { vertical: 'top', wrapText: true };
      wsRow.getCell(1).border = cellBorder;

      wsRow.getCell(2).value = row[1];
      wsRow.getCell(2).font = { name: 'Calibri', size: 10 };
      wsRow.getCell(2).alignment = { vertical: 'top', wrapText: true };
      wsRow.getCell(2).border = cellBorder;

      wsRow.height = 55;
    }
    row4Num++;
  });

  // ===================================================================
  // HOJA 5: ACCIONES DETALLADAS DE ALQVIMIA
  // ===================================================================
  const ws5 = workbook.addWorksheet('Acciones Alqvimia', {
    properties: { tabColor: { argb: colors.alqvimiaBg } },
    views: [{ state: 'frozen', ySplit: 2 }]
  });

  ws5.columns = [
    { width: 30 }, // Categoría
    { width: 35 }, // Acción
    { width: 20 }, // ID
    { width: 15 }, // UiPath equiv
    { width: 15 }, // AA equiv
    { width: 15 }, // BP equiv
  ];

  ws5.mergeCells('A1:F1');
  const ws5Title = ws5.getCell('A1');
  ws5Title.value = 'CATÁLOGO COMPLETO DE ACCIONES DE ALQVIMIA RPA 2.0 (350+)';
  ws5Title.font = { bold: true, size: 16, color: { argb: colors.headerFont }, name: 'Calibri' };
  ws5Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.alqvimiaBg } };
  ws5Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws5.getRow(1).height = 40;

  ['CATEGORÍA', 'ACCIÓN', 'ID TÉCNICO', '¿UIPATH?', '¿AUTOM. ANY.?', '¿BLUE PRISM?'].forEach((h, i) => {
    const cell = ws5.getCell(2, i + 1);
    cell.value = h;
    Object.assign(cell, headerStyle);
  });
  ws5.getRow(2).height = 28;

  const categories = [
    ['Control de Flujo', [
      ['Step (Grupo)', 'step_group', 'Sí', 'Sí', 'Sí'],
      ['Si / Condición', 'if_condition', 'Sí', 'Sí', 'Sí'],
      ['Sino (Else)', 'else_condition', 'Sí', 'Sí', 'Sí'],
      ['Switch / Case', 'switch_case', 'Sí', 'Sí', 'Sí'],
      ['Bucle For', 'for_loop', 'Sí', 'Sí', 'Sí'],
      ['Para Cada (ForEach)', 'for_each', 'Sí', 'Sí', 'Sí'],
      ['Bucle While', 'while_loop', 'Sí', 'Sí', 'Sí'],
      ['Hacer Mientras', 'do_while', 'Sí', 'Sí', 'Sí'],
      ['Break', 'break', 'Sí', 'Sí', 'Parcial'],
      ['Continue', 'continue', 'Sí', 'Sí', 'No'],
      ['Esperar/Delay', 'delay', 'Sí', 'Sí', 'Sí'],
      ['Esperar Condición', 'wait_condition', 'Sí', 'Sí', 'Sí'],
      ['Esperar Cambio Pantalla', 'wait_screen_change', 'Parcial', 'Parcial', 'No'],
      ['Esperar Ventana', 'wait_window', 'Sí', 'Sí', 'Sí'],
      ['Pausa (MessageBox)', 'pause', 'Sí', 'Sí', 'Sí'],
      ['Try/Catch', 'try_catch', 'Sí', 'Sí', 'Sí'],
      ['Lanzar Excepción', 'throw', 'Sí', 'Sí', 'Sí'],
    ]],
    ['Diálogos y Mensajes', [
      ['Message Box', 'message_box', 'Sí', 'Sí', 'Parcial'],
      ['Input Dialog', 'input_dialog', 'Sí', 'Sí', 'No'],
      ['Confirm Dialog', 'confirm_dialog', 'Sí', 'Parcial', 'No'],
      ['Seleccionar Archivo', 'select_file', 'Sí', 'Sí', 'Parcial'],
      ['Seleccionar Carpeta', 'select_folder', 'Sí', 'Sí', 'Parcial'],
      ['Notificación', 'notification', 'Parcial', 'Parcial', 'No'],
      ['Log Message', 'log_message', 'Sí', 'Sí', 'Sí'],
    ]],
    ['IA (10 acciones)', [
      ['Generar Texto', 'ai_text_generation', 'Sí', 'Sí', 'Parcial'],
      ['Chat con IA', 'ai_chat', 'Sí', 'Sí', 'No'],
      ['Análisis Sentimiento', 'ai_sentiment', 'Sí', 'Sí', 'No'],
      ['Clasificación', 'ai_classification', 'Sí', 'Sí', 'Sí'],
      ['Resumir Texto', 'ai_summarize', 'Sí', 'Sí', 'No'],
      ['Traducción', 'ai_translation', 'Sí', 'Parcial', 'No'],
      ['Extraer Entidades', 'ai_extract_entities', 'Sí', 'Sí', 'Parcial'],
      ['Análisis Imagen', 'ai_image_analysis', 'Sí', 'Sí', 'Parcial'],
      ['OCR con IA', 'ai_ocr', 'Sí', 'Sí', 'Sí'],
      ['Document Understanding', 'ai_document_understanding', 'Sí', 'Sí', 'Sí'],
    ]],
    ['Omnicanalidad (exclusivo)', [
      ['WhatsApp Send', 'whatsapp_send', 'No', 'No', 'No'],
      ['WhatsApp Template', 'whatsapp_template', 'No', 'No', 'No'],
      ['Telegram Send', 'telegram_send', 'No', 'No', 'No'],
      ['SMS Send', 'sms_send', 'No', 'No', 'No'],
      ['Webchat Send', 'webchat_send', 'No', 'No', 'No'],
    ]],
  ];

  let row5Num = 3;
  categories.forEach(([catName, actions]) => {
    // Category header
    const catRow = ws5.getRow(row5Num);
    ws5.mergeCells(row5Num, 1, row5Num, 6);
    const catCell = catRow.getCell(1);
    catCell.value = `${catName} (${actions.length} acciones)`;
    Object.assign(catCell, categoryStyle);
    catRow.height = 26;
    row5Num++;

    actions.forEach((action, idx) => {
      const aRow = ws5.getRow(row5Num);
      const isEven = idx % 2 === 0;

      aRow.getCell(1).value = catName;
      aRow.getCell(2).value = action[0];
      aRow.getCell(3).value = action[1];
      aRow.getCell(4).value = action[2];
      aRow.getCell(5).value = action[3];
      aRow.getCell(6).value = action[4];

      for (let c = 1; c <= 6; c++) {
        const cell = aRow.getCell(c);
        applyCellStyle(cell, isEven);
        if (c >= 4) applyRatingCell(cell, action[c - 2]);
      }
      aRow.height = 20;
      row5Num++;
    });
  });

  // ===================================================================
  // HOJA 6: ANÁLISIS DE GAPS + ROADMAP (NUEVA)
  // ===================================================================
  const ws6 = workbook.addWorksheet('GAPS y Roadmap', {
    properties: { tabColor: { argb: 'FFE74C3C' } },
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  ws6.columns = [
    { width: 6 },   // #
    { width: 35 },  // Criterio
    { width: 8 },   // Peso
    { width: 12 },  // Alqvimia
    { width: 12 },  // Líder (max)
    { width: 10 },  // GAP
    { width: 14 },  // GAP Ponderado
    { width: 14 },  // Prioridad
    { width: 16 },  // Mes Target
    { width: 50 },  // Qué hacer (Cloud-Native SaaS)
    { width: 18 },  // Categoría
  ];

  // Título
  ws6.mergeCells('A1:K1');
  const ws6Title = ws6.getCell('A1');
  ws6Title.value = 'ANÁLISIS DE GAPS: DÓNDE ALQVIMIA ESTÁ MÁS DÉBIL vs LA COMPETENCIA';
  ws6Title.font = { bold: true, size: 16, color: { argb: colors.headerFont }, name: 'Calibri' };
  ws6Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
  ws6Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws6.getRow(1).height = 42;

  // Subtítulo con modelo de negocio
  ws6.mergeCells('A2:K2');
  const ws6Sub = ws6.getCell('A2');
  ws6Sub.value = 'MODELO: SaaS Cloud-Native (Docker + Kubernetes + Multi-Tenant) | COBRO por suscripción | NO es free/open-source';
  ws6Sub.font = { bold: true, size: 11, color: { argb: 'FFFFD700' }, name: 'Calibri' };
  ws6Sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  ws6Sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws6.getRow(2).height = 30;

  // Subtítulo 2
  ws6.mergeCells('A3:K3');
  const ws6Sub2 = ws6.getCell('A3');
  ws6Sub2.value = 'Ordenado por GAP PONDERADO (más crítico primero) | GAP = Líder - Alqvimia | GAP Ponderado = GAP × Peso';
  ws6Sub2.font = { size: 10, color: { argb: 'FFAAAAAA' }, name: 'Calibri' };
  ws6Sub2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  ws6Sub2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws6.getRow(3).height = 22;

  // Headers
  const gapHeaders = ['#', 'CRITERIO', 'PESO', 'ALQVIMIA', 'LÍDER', 'GAP', 'GAP×PESO', 'PRIORIDAD', 'MES TARGET', 'ACCIÓN REQUERIDA (Cloud-Native SaaS)', 'CATEGORÍA'];
  ws6.getRow(4).height = 32;
  gapHeaders.forEach((h, i) => {
    const cell = ws6.getCell(4, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: colors.headerFont }, size: 10, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = cellBorder;
  });

  // Gap data: sorted by weighted gap (descending)
  // [Criterio, Peso, AlqScore, LiderScore, Acción, Categoría, MesTarget]
  const gapRawData = [
    // GAPS CRÍTICOS (score 0)
    ['SOC 2 / ISO 27001', 4, 0, 10, 'Implementar controles SOC 2 Type 1+2. Contratar auditoría. Documentar ISO 27001. REQUERIDO para vender a enterprise.', 'Seguridad', 'Nov 2026'],
    ['Process Mining', 4, 0, 10, 'Construir motor de Process Mining: importar event logs, descubrir procesos, visualizar process maps, detectar cuellos de botella. Integrar con el SaaS dashboard.', 'IA/Discovery', 'Abr 2026'],
    ['Task Mining', 3, 0, 10, 'Agente desktop de captura de tareas. ML para detectar patrones repetitivos. Generar workflow skeletons automáticamente.', 'IA/Discovery', 'Abr 2026'],
    ['HIPAA compliance', 3, 0, 9, 'Implementar controles HIPAA, templates de BAA, encriptación PHI. Necesario para clientes de salud.', 'Seguridad', 'Nov 2026'],
    ['Auto-healing / Self-repair', 3, 0, 8, 'Detector de selectores rotos, sugerencia automática de alternativas, retry inteligente, fragility score por workflow. NOS PONE ANTES que AA y BP.', 'IA/Healing', 'May 2026'],
    ['Escalabilidad (cloud-native)', 5, 3, 10, 'MIGRAR A CLOUD-NATIVE: Docker multi-servicio, Kubernetes, workers distribuidos con BullMQ/Redis, auto-scaling HPA, load balancer. ESTO ES LA BASE DE TODO.', 'Arquitectura', 'Mar 2026'],
    ['Track record enterprise', 5, 1, 10, 'Conseguir 3-5 clientes piloto, documentar casos de éxito, ROI medible. Publicar en landing page y submit a Gartner Peer Insights.', 'Negocio', 'Oct-Dic 2026'],
    ['Comunidad', 4, 1, 10, 'Portal de docs (Docusaurus), foro de comunidad, blog técnico, GitHub discussions. 20+ video tutoriales.', 'Ecosistema', 'Ago 2026'],
    ['Certificaciones / Training', 3, 1, 10, 'Plataforma e-learning SaaS, certificación "Alqvimia Developer", cursos en video, exámenes online. Programa de partners.', 'Ecosistema', 'Nov 2026'],
    ['Documentación', 4, 3, 9, 'Portal completo de documentación de las 350+ acciones, API docs con Swagger, guías por caso de uso, troubleshooting KB.', 'Ecosistema', 'Ago 2026'],
    ['Soporte técnico', 4, 2, 7, 'Sistema de tickets SaaS (Zendesk/Intercom), SLAs por plan (Starter: 48h, Pro: 24h, Business: 8h, Enterprise: 4h), chat en vivo.', 'Operaciones', 'Sep 2026'],
    ['Marketplace de integraciones', 4, 2, 10, 'Marketplace SaaS: browse, install one-click, ratings, revenue sharing 70/30. SDK para third-party developers.', 'Plataforma', 'Jul 2026'],
    ['Soporte móvil', 2, 3, 7, 'PWA: monitoreo de ejecuciones, trigger de workflows, notificaciones push, dashboard responsive.', 'UX', 'Ago 2026'],
    ['Autenticación enterprise (SSO/MFA)', 4, 4, 10, 'SSO con SAML 2.0 + OpenID Connect (Azure AD, Okta, Google). MFA con TOTP + SMS. RBAC con permisos granulares. NECESARIO PARA COBRAR PLAN ENTERPRISE.', 'Seguridad', 'Feb 2026'],
    ['Audit trail', 4, 4, 10, 'Audit log inmutable de toda acción. Exportar a SIEM (Splunk, ELK). Data masking. Retention policies. Compliance reports.', 'Seguridad', 'Feb 2026'],
    ['Orquestación avanzada', 4, 5, 10, 'Cola con prioridades (BullMQ), ejecución paralela, triggers (webhook, file, email, API), retry con backoff, dead letter queue. Central al modelo SaaS.', 'Arquitectura', 'Feb 2026'],
    ['Multi-tenancy', 5, 0, 10, 'Aislamiento de datos por organización, custom domains, branding por tenant. BASE PARA MODELO SAAS con cobro por tenant/organización.', 'Arquitectura', 'Mar 2026'],
    ['NL to Automation', 3, 5, 9, 'Mejorar: prompt engineering avanzado, preview visual, edición interactiva, copilot conversacional en Studio.', 'IA', 'May 2026'],
    ['Visión de futuro / Innovación', 4, 7, 10, 'Agentic orchestration (multi-agente), RAG integrado, form builder, chatbot builder. Expandir omnicanalidad (ya es diferenciador).', 'Innovación', 'Jul-Oct 2026'],
    ['Billing y licensing SaaS', 5, 0, 10, 'Stripe integration, planes (Starter $49, Pro $149, Business $399, Enterprise custom), enforcement de límites, portal de cliente, MercadoPago para LATAM.', 'Plataforma', 'Sep 2026'],
    ['Alta disponibilidad', 4, 0, 10, 'Health checks, failover automático, backup/restore, DR testing. Kubernetes liveness/readiness probes.', 'Arquitectura', 'Mar 2026'],
    ['Ejecutable standalone', 4, 0, 10, 'Electron app (Studio), Robot CLI headless (pkg), auto-updater, code signing, instalador MSI/EXE. Para clientes on-premise.', 'Distribución', 'Mar 2026'],
    ['Cloud hosting managed', 4, 0, 10, 'Deploy en AWS ECS/EKS o Azure AKS. CDN para frontend. RDS para DB. ElastiCache para Redis. Managed infra.', 'Arquitectura', 'Sep 2026'],
    ['Gestión de credenciales avanzada', 4, 7, 9, 'Integrar con HashiCorp Vault, Azure Key Vault, AWS Secrets Manager. Rotación automática.', 'Seguridad', 'Oct 2026'],
    ['White-label', 3, 0, 7, 'Logo, colores, dominio custom por tenant. Login page personalizable. Emails branded. DIFERENCIADOR para partners/revendedores.', 'Enterprise', 'Oct 2026'],
    ['Test automation de workflows', 3, 0, 7, 'Test runner, assertions, mocks, test data management, regression testing, coverage report.', 'Calidad', 'Oct 2026'],
    ['Environments (dev/staging/prod)', 4, 0, 9, 'Pipeline de promoción de workflows entre ambientes. Approval gates. Versioning.', 'Enterprise', 'Oct 2026'],
    ['Grabador desktop avanzado', 4, 7, 9, 'Grabador para apps Windows (no solo web). Multi-selector generation. Anchors visuales.', 'Core RPA', 'Jun 2026'],
    ['IDP v2 / Document Understanding', 4, 6, 10, 'Clasificación automática de docs, extracción con modelos pre-entrenados, validation station, multi-idioma, integración Google Vision/AWS Textract.', 'IA/IDP', 'Jun 2026'],
    ['Computer Vision', 3, 0, 8, 'Template matching para UI elements, anchor-based location, OCR en tiempo real para apps sin API.', 'IA/Vision', 'Jun 2026'],
    ['Flowchart view', 3, 0, 9, 'Vista de diagrama de flujo además de la vista secuencial actual. State machine para procesos complejos.', 'Core RPA', 'May 2026'],
    ['Debugging avanzado', 4, 0, 9, 'Breakpoints, watch de variables en runtime, step-over/step-into, execution trace, variable inspector.', 'Core RPA', 'May 2026'],
    ['Subworkflows / Invoke', 4, 0, 9, 'Invocar un workflow desde otro con argumentos de entrada/salida. Composición modular.', 'Core RPA', 'Feb 2026'],
    ['Queue items (colas de trabajo)', 4, 0, 10, 'Work queues estilo UiPath Orchestrator: items, prioridades, retry, SLA monitoring. Central para procesos transaccionales.', 'Orquestación', 'Mar 2026'],
    ['API pública documentada', 4, 0, 9, 'REST API completa, OpenAPI/Swagger, API keys con scopes, rate limiting, webhooks, SDKs JS/Python.', 'Plataforma', 'Jul 2026'],
  ];

  // Calculate gaps and sort by weighted gap
  const processedGaps = gapRawData.map(row => {
    const gap = row[3] - row[2];
    const weightedGap = gap * row[1];
    let priority;
    if (weightedGap >= 40) priority = 'CRÍTICO';
    else if (weightedGap >= 25) priority = 'ALTO';
    else if (weightedGap >= 15) priority = 'MEDIO';
    else priority = 'BAJO';
    return [...row, gap, weightedGap, priority];
  });

  // Sort by weighted gap descending
  processedGaps.sort((a, b) => b[8] - a[8]);

  let row6Num = 5;
  processedGaps.forEach((row, idx) => {
    const [criterio, peso, alqScore, liderScore, accion, categoria, mesTarget, gap, weightedGap, priority] = row;
    const wsRow = ws6.getRow(row6Num);
    const isEven = idx % 2 === 0;

    // # (ranking)
    const numCell = wsRow.getCell(1);
    numCell.value = idx + 1;
    numCell.font = { bold: true, size: 11, name: 'Calibri' };
    numCell.alignment = { horizontal: 'center', vertical: 'middle' };
    numCell.border = cellBorder;
    if (isEven) numCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };

    // Criterio
    const critCell = wsRow.getCell(2);
    critCell.value = criterio;
    critCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: colors.darkText } };
    critCell.alignment = { vertical: 'middle', wrapText: true };
    critCell.border = cellBorder;
    if (isEven) critCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };

    // Peso
    const pesoCell = wsRow.getCell(3);
    pesoCell.value = peso;
    pesoCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF8E44AD' } };
    pesoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    pesoCell.border = cellBorder;

    // Alqvimia score
    const alqCell = wsRow.getCell(4);
    alqCell.value = alqScore;
    alqCell.alignment = { horizontal: 'center', vertical: 'middle' };
    alqCell.border = cellBorder;
    alqCell.font = { bold: true, size: 11, name: 'Calibri' };
    if (alqScore >= 7) {
      alqCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
      alqCell.font.color = { argb: 'FF1E8449' };
    } else if (alqScore >= 4) {
      alqCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } };
      alqCell.font.color = { argb: 'FF9A7D0A' };
    } else {
      alqCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
      alqCell.font.color = { argb: 'FF922B21' };
    }

    // Líder score
    const liderCell = wsRow.getCell(5);
    liderCell.value = liderScore;
    liderCell.font = { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF1E8449' } };
    liderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
    liderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    liderCell.border = cellBorder;

    // GAP
    const gapCell = wsRow.getCell(6);
    gapCell.value = gap;
    gapCell.alignment = { horizontal: 'center', vertical: 'middle' };
    gapCell.border = cellBorder;
    gapCell.font = { bold: true, size: 12, name: 'Calibri' };
    if (gap >= 8) {
      gapCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } };
      gapCell.font.color = { argb: 'FFFFFFFF' };
    } else if (gap >= 5) {
      gapCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
      gapCell.font.color = { argb: 'FFFFFFFF' };
    } else if (gap >= 3) {
      gapCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF39C12' } };
      gapCell.font.color = { argb: 'FFFFFFFF' };
    } else {
      gapCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
      gapCell.font.color = { argb: 'FFFFFFFF' };
    }

    // GAP Ponderado
    const wpCell = wsRow.getCell(7);
    wpCell.value = weightedGap;
    wpCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wpCell.border = cellBorder;
    wpCell.font = { bold: true, size: 12, name: 'Calibri' };
    if (weightedGap >= 40) {
      wpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } };
      wpCell.font.color = { argb: 'FFFFFFFF' };
    } else if (weightedGap >= 25) {
      wpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } };
      wpCell.font.color = { argb: 'FFFFFFFF' };
    } else if (weightedGap >= 15) {
      wpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE67E22' } };
      wpCell.font.color = { argb: 'FFFFFFFF' };
    } else {
      wpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
      wpCell.font.color = { argb: 'FFFFFFFF' };
    }

    // Prioridad
    const prioCell = wsRow.getCell(8);
    prioCell.value = priority;
    prioCell.alignment = { horizontal: 'center', vertical: 'middle' };
    prioCell.border = cellBorder;
    prioCell.font = { bold: true, size: 10, name: 'Calibri' };
    if (priority === 'CRÍTICO') {
      prioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } };
      prioCell.font.color = { argb: 'FFFFFFFF' };
    } else if (priority === 'ALTO') {
      prioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
      prioCell.font.color = { argb: 'FFFFFFFF' };
    } else if (priority === 'MEDIO') {
      prioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF39C12' } };
      prioCell.font.color = { argb: 'FFFFFFFF' };
    } else {
      prioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
      prioCell.font.color = { argb: 'FFFFFFFF' };
    }

    // Mes target
    const mesCell = wsRow.getCell(9);
    mesCell.value = mesTarget;
    mesCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF2980B9' } };
    mesCell.alignment = { horizontal: 'center', vertical: 'middle' };
    mesCell.border = cellBorder;
    if (isEven) mesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };

    // Acción requerida
    const accCell = wsRow.getCell(10);
    accCell.value = accion;
    accCell.font = { size: 9, name: 'Calibri', color: { argb: colors.darkText } };
    accCell.alignment = { vertical: 'middle', wrapText: true };
    accCell.border = cellBorder;
    if (isEven) accCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };

    // Categoría
    const catCell2 = wsRow.getCell(11);
    catCell2.value = categoria;
    catCell2.font = { size: 9, name: 'Calibri', italic: true };
    catCell2.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    catCell2.border = cellBorder;
    if (isEven) catCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };

    wsRow.height = 42;
    row6Num++;
  });

  // Add summary section
  row6Num += 2;
  ws6.mergeCells(row6Num, 1, row6Num, 11);
  const summCell = ws6.getCell(row6Num, 1);
  summCell.value = 'RECOMENDACIÓN ESTRATÉGICA: ORDEN DE EJECUCIÓN PARA CLOUD-NATIVE SaaS CON COBRO';
  summCell.font = { bold: true, size: 14, color: { argb: colors.headerFont }, name: 'Calibri' };
  summCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.alqvimiaBg } };
  summCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summCell.border = cellBorder;
  ws6.getRow(row6Num).height = 38;

  const stratData = [
    ['BLOQUE 1 (Feb-Mar)', 'INFRAESTRUCTURA CLOUD-NATIVE', 'Docker multi-servicio + K8s + Redis + Multi-tenancy + Orquestador + SSO/MFA + Audit Trail + Billing base. SIN ESTO NO HAY SAAS.', 'CRÍTICO', 'FFE74C3C'],
    ['BLOQUE 2 (Abr)', 'ORQUESTACIÓN + COLAS + SUBWORKFLOWS', 'Queue items, ejecución paralela, subworkflows, triggers avanzados, debugging con breakpoints. El core del producto SaaS.', 'CRÍTICO', 'FFE74C3C'],
    ['BLOQUE 3 (May)', 'HEALING + NL→AUTO + DEBUGGING', 'Self-repair de workflows, natural language to automation, flowchart view, breakpoints. DIFERENCIADOR vs AA y BP.', 'ALTO', 'FFF39C12'],
    ['BLOQUE 4 (Jun)', 'IA AVANZADA: IDP + VISION + MINING', 'Document Understanding v2, Computer Vision, Process Mining básico, Task Mining. Cierra gap con UiPath en IA.', 'ALTO', 'FFF39C12'],
    ['BLOQUE 5 (Jul)', 'MARKETPLACE + API + SDK', 'Marketplace SaaS con revenue sharing, REST API pública documentada, webhooks, SDKs. Habilita ecosistema.', 'ALTO', 'FFF39C12'],
    ['BLOQUE 6 (Ago)', 'DOCS + COMUNIDAD + MOBILE', 'Portal docs, 20+ videos, foro, blog, PWA móvil, notificaciones push. Escala adopción.', 'MEDIO', 'FF3498DB'],
    ['BLOQUE 7 (Sep)', 'CLOUD MANAGED + BILLING COMPLETO', 'Deploy AWS/Azure managed, Stripe billing, plans enforcement, trial, MercadoPago LATAM, portal cliente.', 'CRÍTICO', 'FFE74C3C'],
    ['BLOQUE 8 (Oct)', 'ENTERPRISE: GOV + DR + TEST + ENV', 'Governance center, disaster recovery, test framework, environments dev/staging/prod, white-label.', 'ALTO', 'FFF39C12'],
    ['BLOQUE 9 (Nov)', 'CERTIFICACIONES + TRAINING', 'SOC 2 auditoría, ISO 27001 docs, e-learning platform, certificación developer, partner program.', 'ALTO', 'FFF39C12'],
    ['BLOQUE 10 (Dic)', 'LAUNCH + GTM', 'Landing page, demo interactiva, casos de éxito, Gartner submission, LAUNCH Alqvimia 3.0 Enterprise SaaS.', 'ALTO', 'FFF39C12'],
  ];

  row6Num++;
  // Headers for strategy
  const stratHeaders = ['BLOQUE', 'FOCO', 'ENTREGABLES', 'URGENCIA', ''];
  ws6.getRow(row6Num).height = 28;
  stratHeaders.forEach((h, i) => {
    if (i >= 4) return;
    const cols = [1, 2, 4, 8];
    const spans = [[1,1], [2,3], [4,7], [8,11]];
    ws6.mergeCells(row6Num, spans[i][0], row6Num, spans[i][1]);
    const cell = ws6.getCell(row6Num, spans[i][0]);
    cell.value = h;
    cell.font = { bold: true, color: { argb: colors.headerFont }, size: 10, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = cellBorder;
  });

  row6Num++;
  stratData.forEach((row, idx) => {
    const wsRow = ws6.getRow(row6Num);

    // Bloque
    const bCell = wsRow.getCell(1);
    bCell.value = row[0];
    bCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: colors.headerFont } };
    bCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[4] } };
    bCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    bCell.border = cellBorder;

    // Foco
    ws6.mergeCells(row6Num, 2, row6Num, 3);
    const fCell = wsRow.getCell(2);
    fCell.value = row[1];
    fCell.font = { bold: true, size: 10, name: 'Calibri' };
    fCell.alignment = { vertical: 'middle', wrapText: true };
    fCell.border = cellBorder;

    // Entregables
    ws6.mergeCells(row6Num, 4, row6Num, 7);
    const eCell = wsRow.getCell(4);
    eCell.value = row[2];
    eCell.font = { size: 9, name: 'Calibri' };
    eCell.alignment = { vertical: 'middle', wrapText: true };
    eCell.border = cellBorder;

    // Urgencia
    ws6.mergeCells(row6Num, 8, row6Num, 11);
    const uCell = wsRow.getCell(8);
    uCell.value = row[3];
    uCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: colors.headerFont } };
    uCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[4] } };
    uCell.alignment = { horizontal: 'center', vertical: 'middle' };
    uCell.border = cellBorder;

    wsRow.height = 50;
    row6Num++;
  });

  // Final note
  row6Num += 2;
  ws6.mergeCells(row6Num, 1, row6Num, 11);
  const noteCell = ws6.getCell(row6Num, 1);
  noteCell.value = 'NOTA: El BLOQUE 1 es prerequisito para todo lo demás. Sin cloud-native + multi-tenancy + billing, NO HAY PRODUCTO SaaS. Todo lo demás se construye encima de esa base.';
  noteCell.font = { bold: true, size: 11, color: { argb: 'FFFFD700' }, name: 'Calibri' };
  noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  noteCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  noteCell.border = cellBorder;
  ws6.getRow(row6Num).height = 45;

  // ===================================================================
  // GUARDAR
  // ===================================================================
  const outputPath = path.join(__dirname, 'Analisis_Comparativo_RPA_2026.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel generado exitosamente en: ${outputPath}`);
  console.log(`Total de hojas: ${workbook.worksheets.length}`);
}

generateComparison().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
