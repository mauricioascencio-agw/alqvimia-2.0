/**
 * ALQVIMIA RPA 2.0 - Agent Build Script
 * Compila agentes individuales para distribución
 */

import { build } from 'esbuild'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const agentsDir = path.join(__dirname, '..')
const distDir = path.join(__dirname, '..', 'dist')

// Lista de agentes a compilar
const agents = [
  { name: 'mysql', entry: 'database/MySQLAgent.js' },
  { name: 'rest', entry: 'api/RESTAPIAgent.js' },
  { name: 'whatsapp', entry: 'messaging/WhatsAppAgent.js' },
  { name: 'manager', entry: 'core/AgentManager.js' },
  { name: 'orchestrator', entry: 'core/AgentOrchestrator.js' }
]

async function buildAgents() {
  console.log('Building Alqvimia Agents...\n')

  // Crear directorio de distribución
  await fs.mkdir(distDir, { recursive: true })

  for (const agent of agents) {
    const entryPath = path.join(agentsDir, agent.entry)
    const outPath = path.join(distDir, `${agent.name}.js`)

    try {
      // Verificar que existe el archivo
      await fs.access(entryPath)

      console.log(`Building ${agent.name}...`)

      await build({
        entryPoints: [entryPath],
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'esm',
        outfile: outPath,
        external: [
          // Dependencias externas que deben instalarse
          'mysql2',
          'pg',
          'axios',
          'express',
          'socket.io',
          'socket.io-client',
          'nodemailer',
          'imap'
        ],
        minify: true,
        sourcemap: true,
        banner: {
          js: `/**
 * ALQVIMIA RPA 2.0 - ${agent.name.charAt(0).toUpperCase() + agent.name.slice(1)} Agent
 * Built: ${new Date().toISOString()}
 * https://alqvimia.com
 */`
        }
      })

      const stats = await fs.stat(outPath)
      console.log(`  ✓ ${agent.name}.js (${(stats.size / 1024).toFixed(1)} KB)`)
    } catch (error) {
      console.log(`  ✗ ${agent.name}: ${error.message}`)
    }
  }

  // Copiar package.json al dist
  const pkgSource = path.join(agentsDir, 'package.json')
  const pkgDest = path.join(distDir, 'package.json')

  const pkg = JSON.parse(await fs.readFile(pkgSource, 'utf-8'))
  pkg.scripts = {
    manager: 'node manager.js',
    orchestrator: 'node orchestrator.js',
    mysql: 'node mysql.js',
    rest: 'node rest.js',
    whatsapp: 'node whatsapp.js'
  }

  await fs.writeFile(pkgDest, JSON.stringify(pkg, null, 2))
  console.log('\n✓ package.json copied')

  // Crear README
  const readme = `# Alqvimia Agents - Distribution

## Installation

\`\`\`bash
npm install
\`\`\`

## Running Agents

\`\`\`bash
# Start the Agent Manager (port 4000)
npm run manager

# Start individual agents
npm run mysql      # MySQL Agent (port 4101)
npm run rest       # REST API Agent (port 4201)
npm run whatsapp   # WhatsApp Agent (port 4301)

# Start the Orchestrator
npm run orchestrator
\`\`\`

## Configuration

Each agent can be configured via environment variables:

### MySQL Agent
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

### REST API Agent
- REST_AGENT_PORT

### WhatsApp Agent
- WA_PHONE_NUMBER_ID
- WA_ACCESS_TOKEN
- WA_BUSINESS_ACCOUNT_ID
- WA_WEBHOOK_VERIFY_TOKEN

## API Endpoints

All agents expose:
- GET /health - Health check
- GET /status - Agent status
- GET /config - Current configuration
- POST /execute - Execute an action

Check individual agent documentation for specific endpoints.

---
Built with ALQVIMIA RPA 2.0
`

  await fs.writeFile(path.join(distDir, 'README.md'), readme)
  console.log('✓ README.md created')

  console.log('\n✓ Build complete! Output in:', distDir)
}

buildAgents().catch(console.error)
