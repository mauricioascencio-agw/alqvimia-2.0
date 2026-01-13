/**
 * ALQVIMIA RPA 2.0 - Agent EXE Build Script
 * Compila agentes como ejecutables standalone usando pkg
 */

import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const agentsDir = path.join(__dirname, '..')
const distDir = path.join(__dirname, '..', 'dist')
const exeDir = path.join(__dirname, '..', 'exe')

// Agentes disponibles para compilar como EXE
const agents = [
  // Core
  {
    name: 'AlqvimiaOrchestrator',
    entry: 'core/AgentOrchestrator.js',
    description: 'Central orchestrator with licensing and billing',
    port: 4000,
    category: 'core'
  },
  {
    name: 'AlqvimiaAgentManager',
    entry: 'core/AgentManager.js',
    description: 'Agent management service',
    port: 4001,
    category: 'core'
  },

  // Database Agents
  {
    name: 'MySQLAgent',
    entry: 'database/MySQLAgent.js',
    description: 'MySQL/MariaDB database agent',
    port: 4101,
    category: 'database'
  },
  {
    name: 'PostgreSQLAgent',
    entry: 'database/PostgreSQLAgent.js',
    description: 'PostgreSQL database agent',
    port: 4102,
    category: 'database'
  },
  {
    name: 'MongoDBAgent',
    entry: 'database/MongoDBAgent.js',
    description: 'MongoDB NoSQL agent',
    port: 4103,
    category: 'database'
  },
  {
    name: 'RedisAgent',
    entry: 'database/RedisAgent.js',
    description: 'Redis cache/store agent',
    port: 4104,
    category: 'database'
  },

  // API Agents
  {
    name: 'RESTAPIAgent',
    entry: 'api/RESTAPIAgent.js',
    description: 'REST API client agent',
    port: 4201,
    category: 'api'
  },

  // Messaging Agents
  {
    name: 'WhatsAppAgent',
    entry: 'messaging/WhatsAppAgent.js',
    description: 'WhatsApp Business API agent',
    port: 4301,
    category: 'messaging'
  },
  {
    name: 'TelegramAgent',
    entry: 'messaging/TelegramAgent.js',
    description: 'Telegram Bot agent',
    port: 4302,
    category: 'messaging'
  },
  {
    name: 'EmailAgent',
    entry: 'messaging/EmailAgent.js',
    description: 'Email SMTP agent',
    port: 4303,
    category: 'messaging'
  },
  {
    name: 'SlackAgent',
    entry: 'messaging/SlackAgent.js',
    description: 'Slack integration agent',
    port: 4304,
    category: 'messaging'
  },

  // AI Agents
  {
    name: 'OpenAIAgent',
    entry: 'ai/OpenAIAgent.js',
    description: 'OpenAI GPT integration agent',
    port: 4401,
    category: 'ai'
  },
  {
    name: 'ClaudeAgent',
    entry: 'ai/ClaudeAgent.js',
    description: 'Anthropic Claude agent',
    port: 4402,
    category: 'ai'
  },

  // Payment Agents
  {
    name: 'StripeAgent',
    entry: 'payments/StripeAgent.js',
    description: 'Stripe payment processing agent',
    port: 4501,
    category: 'payments'
  },

  // Storage Agents
  {
    name: 'S3Agent',
    entry: 'storage/S3Agent.js',
    description: 'AWS S3 storage agent',
    port: 4601,
    category: 'storage'
  }
]

async function buildExe(agentName) {
  const agent = agents.find(a => a.name.toLowerCase() === agentName?.toLowerCase())

  if (!agent && agentName !== 'all') {
    console.log('Available agents:')
    agents.forEach(a => console.log(`  - ${a.name}: ${a.description}`))
    console.log('\nUsage: node build-exe.js <agent-name|all>')
    return
  }

  const agentsToBuild = agentName === 'all' ? agents : [agent]

  console.log('Building Alqvimia Agents as EXE...\n')
  console.log('This requires pkg to be installed globally: npm install -g pkg\n')

  // Crear directorio
  await fs.mkdir(exeDir, { recursive: true })

  for (const a of agentsToBuild) {
    const entryPath = path.join(agentsDir, a.entry)
    const outputPath = path.join(exeDir, a.name)

    try {
      // Verificar que existe
      await fs.access(entryPath)

      console.log(`Building ${a.name}...`)

      // Crear configuración temporal de pkg
      const pkgConfig = {
        name: a.name,
        version: '2.0.0',
        main: a.entry,
        bin: a.entry,
        pkg: {
          scripts: [a.entry],
          targets: ['node18-win-x64'],
          outputPath: outputPath
        }
      }

      const tempPkgPath = path.join(agentsDir, `pkg-${a.name}.json`)
      await fs.writeFile(tempPkgPath, JSON.stringify(pkgConfig, null, 2))

      // Ejecutar pkg
      await new Promise((resolve, reject) => {
        exec(
          `npx pkg ${entryPath} --targets node18-win-x64 --output "${outputPath}.exe"`,
          { cwd: agentsDir },
          (error, stdout, stderr) => {
            if (error) {
              reject(error)
            } else {
              resolve(stdout)
            }
          }
        )
      })

      // Limpiar archivo temporal
      await fs.unlink(tempPkgPath).catch(() => {})

      const stats = await fs.stat(`${outputPath}.exe`)
      console.log(`  ✓ ${a.name}.exe (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)

      // Crear archivo de configuración de ejemplo
      const configExample = {
        agent: a.name,
        port: getDefaultPort(a.name),
        logLevel: 'info',
        autoConnect: true
      }

      await fs.writeFile(
        `${outputPath}.config.json`,
        JSON.stringify(configExample, null, 2)
      )
      console.log(`  ✓ ${a.name}.config.json`)

    } catch (error) {
      console.log(`  ✗ ${a.name}: ${error.message}`)
    }
  }

  // Crear script de inicio para Windows
  const startBat = `@echo off
echo Starting Alqvimia Agent Manager...
echo.
start "" AlqvimiaAgentManager.exe
echo Agent Manager started on port 4000
echo.
echo You can now access the Agent Manager at http://localhost:4000
echo.
pause
`
  await fs.writeFile(path.join(exeDir, 'start-manager.bat'), startBat)

  // Crear script para iniciar todo
  const startAllBat = `@echo off
echo Starting All Alqvimia Agents...
echo.
start "Agent Manager" AlqvimiaAgentManager.exe
timeout /t 2 /nobreak > nul
start "MySQL Agent" MySQLAgent.exe
start "REST API Agent" RESTAPIAgent.exe
start "WhatsApp Agent" WhatsAppAgent.exe
echo.
echo All agents started!
echo.
echo Agent Manager: http://localhost:4000
echo MySQL Agent: http://localhost:4101
echo REST API Agent: http://localhost:4201
echo WhatsApp Agent: http://localhost:4301
echo.
pause
`
  await fs.writeFile(path.join(exeDir, 'start-all.bat'), startAllBat)

  console.log('\n✓ Windows batch scripts created')
  console.log('\n✓ Build complete! Executables in:', exeDir)
}

function getDefaultPort(agentName) {
  const agent = agents.find(a => a.name === agentName)
  return agent?.port || 4000
}

// Build por categoría
async function buildCategory(category) {
  const categoryAgents = agents.filter(a => a.category === category)

  if (categoryAgents.length === 0) {
    console.log(`No agents found for category: ${category}`)
    console.log('Available categories: core, database, api, messaging, ai, payments, storage')
    return
  }

  console.log(`\nBuilding ${category} agents (${categoryAgents.length})...\n`)

  for (const agent of categoryAgents) {
    await buildSingleAgent(agent)
  }
}

// Build individual
async function buildSingleAgent(agent) {
  const entryPath = path.join(agentsDir, agent.entry)
  const outputPath = path.join(exeDir, agent.name)

  try {
    await fs.access(entryPath)

    console.log(`Building ${agent.name}...`)

    const pkgConfig = {
      name: agent.name,
      version: '2.0.0',
      main: agent.entry,
      bin: agent.entry,
      pkg: {
        scripts: [agent.entry],
        targets: ['node18-win-x64', 'node18-linux-x64', 'node18-macos-x64'],
        outputPath: outputPath
      }
    }

    const tempPkgPath = path.join(agentsDir, `pkg-${agent.name}.json`)
    await fs.writeFile(tempPkgPath, JSON.stringify(pkgConfig, null, 2))

    // Build for current platform
    const platform = process.platform
    const target = platform === 'win32' ? 'node18-win-x64' :
                   platform === 'darwin' ? 'node18-macos-x64' : 'node18-linux-x64'
    const ext = platform === 'win32' ? '.exe' : ''

    await new Promise((resolve, reject) => {
      exec(
        `npx pkg ${entryPath} --targets ${target} --output "${outputPath}${ext}"`,
        { cwd: agentsDir },
        (error, stdout, stderr) => {
          if (error) reject(error)
          else resolve(stdout)
        }
      )
    })

    await fs.unlink(tempPkgPath).catch(() => {})

    const stats = await fs.stat(`${outputPath}${ext}`)
    console.log(`  ✓ ${agent.name}${ext} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)

    // Config file
    const configExample = {
      agent: agent.name,
      version: '2.0.0',
      port: agent.port,
      category: agent.category,
      logLevel: 'info',
      autoConnect: true,
      orchestrator: {
        url: 'http://localhost:4000',
        autoRegister: true
      },
      license: {
        key: '',
        validateOnStart: true
      }
    }

    await fs.writeFile(`${outputPath}.config.json`, JSON.stringify(configExample, null, 2))
    console.log(`  ✓ ${agent.name}.config.json`)

    return true
  } catch (error) {
    console.log(`  ✗ ${agent.name}: ${error.message}`)
    return false
  }
}

// Obtener argumento de línea de comandos
const agentArg = process.argv[2] || 'all'
buildExe(agentArg).catch(console.error)
