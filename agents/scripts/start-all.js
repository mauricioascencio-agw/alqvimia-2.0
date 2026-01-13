/**
 * ALQVIMIA RPA 2.0 - Start All Agents Script
 * Inicia todos los agentes configurados
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const agentsDir = path.join(__dirname, '..')

// Agentes a iniciar
const agents = [
  { name: 'Agent Manager', file: 'core/AgentManager.js', port: 4000 },
  { name: 'MySQL Agent', file: 'database/MySQLAgent.js', port: 4101 },
  { name: 'REST API Agent', file: 'api/RESTAPIAgent.js', port: 4201 },
  { name: 'WhatsApp Agent', file: 'messaging/WhatsAppAgent.js', port: 4301 }
]

const processes = []

function startAgent(agent) {
  const agentPath = path.join(agentsDir, agent.file)

  console.log(`Starting ${agent.name} on port ${agent.port}...`)

  const proc = spawn('node', [agentPath], {
    env: { ...process.env, AGENT_PORT: agent.port },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  proc.stdout.on('data', (data) => {
    console.log(`[${agent.name}] ${data.toString().trim()}`)
  })

  proc.stderr.on('data', (data) => {
    console.error(`[${agent.name} ERROR] ${data.toString().trim()}`)
  })

  proc.on('error', (error) => {
    console.error(`[${agent.name}] Failed to start: ${error.message}`)
  })

  proc.on('close', (code) => {
    console.log(`[${agent.name}] Exited with code ${code}`)
    // Remover del array
    const index = processes.indexOf(proc)
    if (index > -1) processes.splice(index, 1)
  })

  processes.push(proc)
  return proc
}

function stopAll() {
  console.log('\nStopping all agents...')
  processes.forEach(proc => {
    proc.kill('SIGTERM')
  })
}

// Manejar señales de terminación
process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)

// Iniciar todos los agentes
console.log('='.repeat(50))
console.log('ALQVIMIA RPA 2.0 - Starting All Agents')
console.log('='.repeat(50))
console.log('')

// Iniciar secuencialmente con un pequeño delay
async function startAllSequentially() {
  for (const agent of agents) {
    try {
      startAgent(agent)
      // Pequeño delay entre inicios
      await new Promise(r => setTimeout(r, 500))
    } catch (error) {
      console.error(`Failed to start ${agent.name}: ${error.message}`)
    }
  }

  console.log('')
  console.log('='.repeat(50))
  console.log('All agents started!')
  console.log('')
  console.log('Endpoints:')
  agents.forEach(a => {
    console.log(`  ${a.name}: http://localhost:${a.port}`)
  })
  console.log('')
  console.log('Press Ctrl+C to stop all agents')
  console.log('='.repeat(50))
}

startAllSequentially().catch(console.error)
