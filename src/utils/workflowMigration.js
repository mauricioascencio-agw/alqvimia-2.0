/**
 * ALQVIMIA RPA 2.0 - Sistema de Migración de Workflows
 *
 * Este módulo contiene los parsers y conversores para migrar workflows
 * entre diferentes plataformas RPA.
 */

// ==========================================
// IMPORTADORES (De otras plataformas a Alqvimia)
// ==========================================

/**
 * Parsea un archivo UiPath XAML y lo convierte a formato Alqvimia
 */
export function parseUiPathXaml(content) {
  const steps = []

  try {
    // Buscar actividades comunes de UiPath
    const activityPatterns = [
      { regex: /<OpenBrowser[^>]*BrowserType="([^"]*)"[^>]*Url="([^"]*)"/, action: 'open_browser', extract: (m) => ({ browser: m[1].toLowerCase(), url: m[2] }) },
      { regex: /<Navigate[^>]*Url="([^"]*)"/, action: 'navigate', extract: (m) => ({ url: m[1] }) },
      { regex: /<Click[^>]*Selector="([^"]*)"/, action: 'click', extract: (m) => ({ selector: m[1] }) },
      { regex: /<TypeInto[^>]*Text="([^"]*)"[^>]*Selector="([^"]*)"/, action: 'type', extract: (m) => ({ text: m[1], selector: m[2] }) },
      { regex: /<GetText[^>]*Selector="([^"]*)"[^>]*output="([^"]*)"/, action: 'extract', extract: (m) => ({ selector: m[1], saveAs: m[2] }) },
      { regex: /<TakeScreenshot[^>]*FileName="([^"]*)"/, action: 'screenshot', extract: (m) => ({ path: m[1] }) },
      { regex: /<Delay[^>]*Duration="([^"]*)"/, action: 'wait', extract: (m) => ({ seconds: parseDuration(m[1]) }) },
      { regex: /<MessageBox[^>]*Text="([^"]*)"/, action: 'message_box', extract: (m) => ({ message: m[1] }) },
      { regex: /<ReadRange[^>]*SheetName="([^"]*)"[^>]*Range="([^"]*)"/, action: 'excel_read', extract: (m) => ({ sheet: m[1], range: m[2] }) },
      { regex: /<WriteRange[^>]*SheetName="([^"]*)"[^>]*Range="([^"]*)"/, action: 'excel_write', extract: (m) => ({ sheet: m[1], range: m[2] }) },
      { regex: /<InvokeMethod[^>]*MethodName="([^"]*)"/, action: 'run_application', extract: (m) => ({ method: m[1] }) },
      { regex: /<Assign[^>]*To="([^"]*)"[^>]*Value="([^"]*)"/, action: 'set_variable', extract: (m) => ({ name: m[1], value: m[2] }) },
    ]

    let stepIndex = 0
    for (const pattern of activityPatterns) {
      const matches = content.matchAll(new RegExp(pattern.regex, 'g'))
      for (const match of matches) {
        stepIndex++
        const params = pattern.extract(match)
        steps.push({
          id: `step_${stepIndex}`,
          type: pattern.action,
          label: getActionLabel(pattern.action, params),
          properties: params
        })
      }
    }

    // Ordenar por posición en el archivo
    steps.sort((a, b) => content.indexOf(a.label) - content.indexOf(b.label))

  } catch (error) {
    console.error('Error parsing UiPath XAML:', error)
  }

  return steps
}

/**
 * Parsea un archivo Power Automate JSON y lo convierte a formato Alqvimia
 */
export function parsePowerAutomate(content) {
  const steps = []

  try {
    const flow = typeof content === 'string' ? JSON.parse(content) : content
    const actions = flow.definition?.actions || flow.actions || {}

    let stepIndex = 0
    for (const [name, action] of Object.entries(actions)) {
      stepIndex++
      const converted = convertPowerAutomateAction(action, name)
      if (converted) {
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Power Automate:', error)
  }

  return steps
}

/**
 * Parsea un script Python y lo convierte a formato Alqvimia
 */
export function parsePythonScript(content) {
  const steps = []

  try {
    const lines = content.split('\n')
    let stepIndex = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const converted = convertPythonLine(trimmed)
      if (converted) {
        stepIndex++
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Python script:', error)
  }

  return steps
}

/**
 * Parsea un script JavaScript y lo convierte a formato Alqvimia
 */
export function parseJavaScript(content) {
  const steps = []

  try {
    const lines = content.split('\n')
    let stepIndex = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//')) continue

      const converted = convertJavaScriptLine(trimmed)
      if (converted) {
        stepIndex++
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing JavaScript:', error)
  }

  return steps
}

/**
 * Parsea un archivo Automation Anywhere
 */
export function parseAutomationAnywhere(content) {
  const steps = []

  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content
    const commands = data.commands || data.nodes || []

    let stepIndex = 0
    for (const cmd of commands) {
      stepIndex++
      const converted = convertAACommand(cmd)
      if (converted) {
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Automation Anywhere:', error)
  }

  return steps
}

/**
 * Parsea un archivo Blue Prism
 */
export function parseBluePrism(content) {
  const steps = []

  try {
    // Blue Prism usa XML
    const stagePatterns = [
      { regex: /<stage[^>]*type="Navigate"[^>]*>.*?<url>([^<]*)<\/url>/gs, action: 'navigate', extract: (m) => ({ url: m[1] }) },
      { regex: /<stage[^>]*type="Click"[^>]*>.*?<element>([^<]*)<\/element>/gs, action: 'click', extract: (m) => ({ selector: m[1] }) },
      { regex: /<stage[^>]*type="Write"[^>]*>.*?<text>([^<]*)<\/text>.*?<element>([^<]*)<\/element>/gs, action: 'type', extract: (m) => ({ text: m[1], selector: m[2] }) },
      { regex: /<stage[^>]*type="Read"[^>]*>.*?<element>([^<]*)<\/element>/gs, action: 'extract', extract: (m) => ({ selector: m[1] }) },
      { regex: /<stage[^>]*type="Wait"[^>]*>.*?<timeout>([^<]*)<\/timeout>/gs, action: 'wait', extract: (m) => ({ seconds: parseInt(m[1]) / 1000 }) },
    ]

    let stepIndex = 0
    for (const pattern of stagePatterns) {
      const matches = content.matchAll(pattern.regex)
      for (const match of matches) {
        stepIndex++
        const params = pattern.extract(match)
        steps.push({
          id: `step_${stepIndex}`,
          type: pattern.action,
          label: getActionLabel(pattern.action, params),
          properties: params
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Blue Prism:', error)
  }

  return steps
}

// ==========================================
// EXPORTADORES (De Alqvimia a otras plataformas)
// ==========================================

/**
 * Convierte un workflow de Alqvimia a UiPath XAML
 */
export function exportToUiPath(workflow) {
  const activities = workflow.steps.map((step, index) => {
    return convertToUiPathActivity(step, index)
  }).join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<Activity mc:Ignorable="sap sap2010" x:Class="Alqvimia_${workflow.name.replace(/\s/g, '_')}"
  xmlns="http://schemas.microsoft.com/netfx/2009/xaml/activities"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:sap="http://schemas.microsoft.com/netfx/2009/xaml/activities/presentation"
  xmlns:sap2010="http://schemas.microsoft.com/netfx/2010/xaml/activities/presentation"
  xmlns:ui="http://schemas.uipath.com/workflow/activities"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <Sequence DisplayName="${workflow.name}">
${activities}
  </Sequence>
</Activity>`
}

/**
 * Convierte un workflow de Alqvimia a Power Automate JSON
 */
export function exportToPowerAutomate(workflow) {
  const actions = {}

  workflow.steps.forEach((step, index) => {
    const actionName = `action_${index + 1}_${step.type}`
    actions[actionName] = convertToPowerAutomateAction(step)
  })

  return JSON.stringify({
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "definition": {
      "triggers": {
        "manual": {
          "type": "Request",
          "kind": "Button"
        }
      },
      "actions": actions
    }
  }, null, 2)
}

/**
 * Convierte un workflow de Alqvimia a Python
 */
export function exportToPython(workflow) {
  const imports = new Set(['from playwright.sync_api import sync_playwright', 'import time'])
  const code = []

  code.push('# Workflow generado por Alqvimia RPA 2.0')
  code.push(`# Nombre: ${workflow.name}`)
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('# Variables')
    workflow.variables.forEach(v => {
      code.push(`${v.name} = ${JSON.stringify(v.value || v.defaultValue || '')}`)
    })
    code.push('')
  }

  code.push('def main():')
  code.push('    with sync_playwright() as p:')
  code.push('        browser = None')
  code.push('        page = None')
  code.push('        ')

  workflow.steps.forEach((step, index) => {
    const pythonCode = convertToPythonCode(step, imports)
    pythonCode.forEach(line => code.push(`        ${line}`))
    code.push('')
  })

  code.push('        # Cerrar navegador si está abierto')
  code.push('        if browser:')
  code.push('            browser.close()')
  code.push('')
  code.push('if __name__ == "__main__":')
  code.push('    main()')

  return [...imports].join('\n') + '\n\n' + code.join('\n')
}

/**
 * Convierte un workflow de Alqvimia a JavaScript
 */
export function exportToJavaScript(workflow) {
  const code = []

  code.push('// Workflow generado por Alqvimia RPA 2.0')
  code.push(`// Nombre: ${workflow.name}`)
  code.push('')
  code.push("const { chromium } = require('playwright');")
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('// Variables')
    workflow.variables.forEach(v => {
      code.push(`let ${v.name} = ${JSON.stringify(v.value || v.defaultValue || '')};`)
    })
    code.push('')
  }

  code.push('async function main() {')
  code.push('  let browser = null;')
  code.push('  let page = null;')
  code.push('  ')
  code.push('  try {')

  workflow.steps.forEach((step, index) => {
    const jsCode = convertToJavaScriptCode(step)
    jsCode.forEach(line => code.push(`    ${line}`))
    code.push('')
  })

  code.push('  } catch (error) {')
  code.push('    console.error("Error:", error);')
  code.push('  } finally {')
  code.push('    if (browser) await browser.close();')
  code.push('  }')
  code.push('}')
  code.push('')
  code.push('main();')

  return code.join('\n')
}

/**
 * Convierte un workflow de Alqvimia a Bash Script
 */
export function exportToBash(workflow) {
  const code = []

  code.push('#!/bin/bash')
  code.push('# Workflow generado por Alqvimia RPA 2.0')
  code.push(`# Nombre: ${workflow.name}`)
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('# Variables')
    workflow.variables.forEach(v => {
      const value = v.value || v.defaultValue || ''
      code.push(`${v.name}="${value}"`)
    })
    code.push('')
  }

  code.push('# Pasos del workflow')
  workflow.steps.forEach((step, index) => {
    const bashCode = convertToBashCode(step, index)
    bashCode.forEach(line => code.push(line))
    code.push('')
  })

  code.push('echo "Workflow completado"')

  return code.join('\n')
}

/**
 * Convierte un workflow a pseudocódigo legible
 */
export function exportToPseudocode(workflow) {
  const code = []

  code.push(`WORKFLOW: ${workflow.name}`)
  code.push('=' .repeat(50))
  code.push('')

  if (workflow.variables?.length > 0) {
    code.push('VARIABLES:')
    workflow.variables.forEach(v => {
      code.push(`  - ${v.name}: ${v.type || 'string'} = ${JSON.stringify(v.value || v.defaultValue || '')}`)
    })
    code.push('')
  }

  code.push('PASOS:')
  code.push('')

  workflow.steps.forEach((step, index) => {
    const pseudo = convertToPseudocode(step, index + 1)
    code.push(pseudo)
    code.push('')
  })

  code.push('FIN WORKFLOW')

  return code.join('\n')
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function parseDuration(duration) {
  // Parsea formato TimeSpan de .NET (hh:mm:ss)
  const parts = duration.split(':')
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return parseInt(duration) || 1
}

function getActionLabel(action, params) {
  const labels = {
    'open_browser': `Abrir ${params.browser || 'navegador'}`,
    'navigate': `Navegar a ${params.url}`,
    'click': `Clic en ${params.selector}`,
    'type': `Escribir "${params.text?.substring(0, 20)}..."`,
    'extract': `Extraer texto de ${params.selector}`,
    'screenshot': `Capturar pantalla`,
    'wait': `Esperar ${params.seconds}s`,
    'message_box': `Mostrar mensaje`,
    'excel_read': `Leer Excel`,
    'excel_write': `Escribir Excel`,
    'set_variable': `Variable ${params.name}`,
  }
  return labels[action] || action
}

function convertPowerAutomateAction(action, name) {
  const typeMap = {
    'OpenBrowser': { type: 'open_browser', props: (a) => ({ browser: 'chrome' }) },
    'Navigate': { type: 'navigate', props: (a) => ({ url: a.inputs?.uri || a.inputs?.url }) },
    'Click': { type: 'click', props: (a) => ({ selector: a.inputs?.element }) },
    'TypeInto': { type: 'type', props: (a) => ({ text: a.inputs?.text, selector: a.inputs?.element }) },
    'GetText': { type: 'extract', props: (a) => ({ selector: a.inputs?.element }) },
    'Wait': { type: 'wait', props: (a) => ({ seconds: a.inputs?.duration || 1 }) },
    'Http': { type: 'http_get', props: (a) => ({ url: a.inputs?.uri, method: a.inputs?.method }) },
  }

  const actionType = action.type || action.kind
  const mapping = typeMap[actionType]

  if (mapping) {
    return {
      type: mapping.type,
      label: name,
      properties: mapping.props(action)
    }
  }

  return {
    type: 'unknown',
    label: name,
    properties: action.inputs || {}
  }
}

function convertPythonLine(line) {
  const patterns = [
    { regex: /browser\s*=.*launch\(\)/, type: 'open_browser', props: {} },
    { regex: /page\.goto\(["']([^"']+)["']\)/, type: 'navigate', props: (m) => ({ url: m[1] }) },
    { regex: /page\.click\(["']([^"']+)["']\)/, type: 'click', props: (m) => ({ selector: m[1] }) },
    { regex: /page\.fill\(["']([^"']+)["'],\s*["']([^"']+)["']\)/, type: 'type', props: (m) => ({ selector: m[1], text: m[2] }) },
    { regex: /page\.type\(["']([^"']+)["'],\s*["']([^"']+)["']\)/, type: 'type', props: (m) => ({ selector: m[1], text: m[2] }) },
    { regex: /time\.sleep\((\d+)\)/, type: 'wait', props: (m) => ({ seconds: parseInt(m[1]) }) },
    { regex: /print\(["']([^"']+)["']\)/, type: 'log_info', props: (m) => ({ message: m[1] }) },
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern.regex)
    if (match) {
      return {
        type: pattern.type,
        label: getActionLabel(pattern.type, pattern.props(match)),
        properties: pattern.props(match)
      }
    }
  }

  return null
}

function convertJavaScriptLine(line) {
  const patterns = [
    { regex: /chromium\.launch\(\)/, type: 'open_browser', props: {} },
    { regex: /page\.goto\(["'`]([^"'`]+)["'`]\)/, type: 'navigate', props: (m) => ({ url: m[1] }) },
    { regex: /page\.click\(["'`]([^"'`]+)["'`]\)/, type: 'click', props: (m) => ({ selector: m[1] }) },
    { regex: /page\.fill\(["'`]([^"'`]+)["'`],\s*["'`]([^"'`]+)["'`]\)/, type: 'type', props: (m) => ({ selector: m[1], text: m[2] }) },
    { regex: /await.*delay\((\d+)\)/, type: 'wait', props: (m) => ({ seconds: parseInt(m[1]) / 1000 }) },
    { regex: /console\.log\(["'`]([^"'`]+)["'`]\)/, type: 'log_info', props: (m) => ({ message: m[1] }) },
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern.regex)
    if (match) {
      return {
        type: pattern.type,
        label: getActionLabel(pattern.type, pattern.props(match)),
        properties: pattern.props(match)
      }
    }
  }

  return null
}

function convertAACommand(cmd) {
  const typeMap = {
    'Browser': { type: 'open_browser', props: (c) => ({ browser: c.browserType?.toLowerCase() }) },
    'NavigateUrl': { type: 'navigate', props: (c) => ({ url: c.url }) },
    'ClickElement': { type: 'click', props: (c) => ({ selector: c.selector }) },
    'SetText': { type: 'type', props: (c) => ({ text: c.text, selector: c.selector }) },
    'Delay': { type: 'wait', props: (c) => ({ seconds: c.delay / 1000 }) },
    'Message': { type: 'message_box', props: (c) => ({ message: c.message }) },
  }

  const mapping = typeMap[cmd.command || cmd.type]
  if (mapping) {
    return {
      type: mapping.type,
      label: cmd.name || getActionLabel(mapping.type, mapping.props(cmd)),
      properties: mapping.props(cmd)
    }
  }

  return null
}

function convertToUiPathActivity(step, index) {
  const indent = '    '
  const props = step.properties || {}

  const templates = {
    'open_browser': `${indent}<ui:OpenBrowser BrowserType="${props.browser || 'Chrome'}" Url="${props.url || ''}" DisplayName="Abrir Navegador" />`,
    'navigate': `${indent}<ui:Navigate Url="${props.url || ''}" DisplayName="Navegar a URL" />`,
    'click': `${indent}<ui:Click Selector="${props.selector || ''}" DisplayName="Clic" />`,
    'type': `${indent}<ui:TypeInto Text="${props.text || ''}" Selector="${props.selector || ''}" DisplayName="Escribir" />`,
    'extract': `${indent}<ui:GetText Selector="${props.selector || ''}" Output="[extractedText]" DisplayName="Extraer Texto" />`,
    'screenshot': `${indent}<ui:TakeScreenshot FileName="${props.path || 'screenshot.png'}" DisplayName="Captura de Pantalla" />`,
    'wait': `${indent}<ui:Delay Duration="00:00:${String(props.seconds || 1).padStart(2, '0')}" DisplayName="Esperar" />`,
    'message_box': `${indent}<ui:MessageBox Text="${props.message || ''}" DisplayName="Mensaje" />`,
  }

  return templates[step.type] || `${indent}<!-- Acción no soportada: ${step.type} -->`
}

function convertToPowerAutomateAction(step) {
  const props = step.properties || {}

  const templates = {
    'open_browser': { type: 'OpenBrowser', inputs: { browserType: props.browser || 'Chrome' } },
    'navigate': { type: 'Navigate', inputs: { uri: props.url } },
    'click': { type: 'Click', inputs: { element: props.selector } },
    'type': { type: 'TypeInto', inputs: { element: props.selector, text: props.text } },
    'extract': { type: 'GetText', inputs: { element: props.selector } },
    'wait': { type: 'Wait', inputs: { duration: props.seconds || 1 } },
    'http_get': { type: 'Http', inputs: { method: 'GET', uri: props.url } },
    'http_post': { type: 'Http', inputs: { method: 'POST', uri: props.url, body: props.body } },
  }

  return templates[step.type] || { type: 'Unknown', inputs: props }
}

function convertToPythonCode(step, imports) {
  const props = step.properties || {}

  const templates = {
    'open_browser': [`browser = p.chromium.launch(headless=${props.headless ? 'True' : 'False'})`, 'page = browser.new_page()'],
    'navigate': [`page.goto("${props.url || ''}")`],
    'click': [`page.click("${props.selector || ''}")`],
    'type': [`page.fill("${props.selector || ''}", "${props.text || ''}")`],
    'extract': [`extracted_text = page.text_content("${props.selector || ''}")`],
    'screenshot': [`page.screenshot(path="${props.path || 'screenshot.png'}")`],
    'wait': [`time.sleep(${props.seconds || 1})`],
    'message_box': [`print("${props.message || ''}")`],
    'http_get': [`response = requests.get("${props.url || ''}")`, imports.add('import requests')],
    'http_post': [`response = requests.post("${props.url || ''}", json=${JSON.stringify(props.body || {})})`, imports.add('import requests')],
    'file_read': [`with open("${props.path || ''}", "r") as f: content = f.read()`],
    'file_write': [`with open("${props.path || ''}", "w") as f: f.write("${props.content || ''}")`],
    'set_variable': [`${props.name || 'var'} = ${JSON.stringify(props.value || '')}`],
  }

  return templates[step.type] || [`# ${step.label || step.type}`]
}

function convertToJavaScriptCode(step) {
  const props = step.properties || {}

  const templates = {
    'open_browser': ['browser = await chromium.launch({ headless: false });', 'page = await browser.newPage();'],
    'navigate': [`await page.goto("${props.url || ''}");`],
    'click': [`await page.click("${props.selector || ''}");`],
    'type': [`await page.fill("${props.selector || ''}", "${props.text || ''}");`],
    'extract': [`const extractedText = await page.textContent("${props.selector || ''}");`],
    'screenshot': [`await page.screenshot({ path: "${props.path || 'screenshot.png'}" });`],
    'wait': [`await new Promise(r => setTimeout(r, ${(props.seconds || 1) * 1000}));`],
    'message_box': [`console.log("${props.message || ''}");`],
    'http_get': [`const response = await fetch("${props.url || ''}");`, 'const data = await response.json();'],
    'http_post': [`const response = await fetch("${props.url || ''}", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(${JSON.stringify(props.body || {})}) });`],
    'file_read': [`const fs = require("fs");`, `const content = fs.readFileSync("${props.path || ''}", "utf8");`],
    'file_write': [`const fs = require("fs");`, `fs.writeFileSync("${props.path || ''}", "${props.content || ''}");`],
    'set_variable': [`let ${props.name || 'variable'} = ${JSON.stringify(props.value || '')};`],
  }

  return templates[step.type] || [`// ${step.label || step.type}`]
}

function convertToBashCode(step, index) {
  const props = step.properties || {}

  const templates = {
    'wait': [`echo "Paso ${index + 1}: Esperando ${props.seconds || 1} segundos..."`, `sleep ${props.seconds || 1}`],
    'message_box': [`echo "${props.message || ''}"`],
    'http_get': [`curl -s "${props.url || ''}"`],
    'http_post': [`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(props.body || {})}' "${props.url || ''}"`],
    'file_read': [`cat "${props.path || ''}"`],
    'file_write': [`echo "${props.content || ''}" > "${props.path || ''}"`],
    'file_copy': [`cp "${props.source || ''}" "${props.destination || ''}"`],
    'file_move': [`mv "${props.source || ''}" "${props.destination || ''}"`],
    'file_delete': [`rm "${props.path || ''}"`],
    'run_application': [`"${props.path || ''}" ${(props.args || []).join(' ')}`],
    'powershell_run': [`powershell -Command "${props.command || ''}"`],
    'cmd_run': [`${props.command || ''}`],
    'set_variable': [`${props.name || 'VAR'}="${props.value || ''}"`],
  }

  return templates[step.type] || [`# Paso ${index + 1}: ${step.label || step.type}`]
}

function convertToPseudocode(step, stepNum) {
  const props = step.properties || {}

  const templates = {
    'open_browser': `${stepNum}. ABRIR navegador ${props.browser || 'Chrome'}`,
    'navigate': `${stepNum}. IR A URL: ${props.url || ''}`,
    'click': `${stepNum}. HACER CLIC en elemento: ${props.selector || ''}`,
    'type': `${stepNum}. ESCRIBIR "${props.text || ''}" en: ${props.selector || ''}`,
    'extract': `${stepNum}. EXTRAER texto de: ${props.selector || ''}`,
    'screenshot': `${stepNum}. CAPTURAR pantalla -> ${props.path || 'screenshot.png'}`,
    'wait': `${stepNum}. ESPERAR ${props.seconds || 1} segundos`,
    'message_box': `${stepNum}. MOSTRAR mensaje: "${props.message || ''}"`,
    'http_get': `${stepNum}. PETICIÓN GET a: ${props.url || ''}`,
    'http_post': `${stepNum}. PETICIÓN POST a: ${props.url || ''}`,
    'file_read': `${stepNum}. LEER archivo: ${props.path || ''}`,
    'file_write': `${stepNum}. ESCRIBIR archivo: ${props.path || ''}`,
    'set_variable': `${stepNum}. ASIGNAR ${props.name || 'variable'} = ${JSON.stringify(props.value || '')}`,
    'if_condition': `${stepNum}. SI (${props.condition || 'condición'}) ENTONCES`,
    'for_loop': `${stepNum}. PARA i = 1 HASTA ${props.iterations || 10} HACER`,
    'close_browser': `${stepNum}. CERRAR navegador`,
  }

  return templates[step.type] || `${stepNum}. ${step.label || step.type}`
}

// ==========================================
// EXPORTAR FUNCIONES PRINCIPALES
// ==========================================

export const importers = {
  'uipath': parseUiPathXaml,
  'power-automate': parsePowerAutomate,
  'automation-anywhere': parseAutomationAnywhere,
  'blue-prism': parseBluePrism,
  'python': parsePythonScript,
  'javascript': parseJavaScript,
}

export const exporters = {
  'uipath': exportToUiPath,
  'power-automate': exportToPowerAutomate,
  'python': exportToPython,
  'javascript': exportToJavaScript,
  'bash': exportToBash,
  'pseudocode': exportToPseudocode,
}

export default { importers, exporters }
