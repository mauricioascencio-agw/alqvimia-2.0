// Manejadores para el Ejecutor de Workflows
import { ActionExecutor } from '../engine/ActionExecutor.js'

export function registerExecutorHandlers(io, socket, serverState) {

  // Estado de ejecuciones por cliente
  const executions = new Map()
  const executors = new Map()

  // Ejecutar workflow
  socket.on('executor:run', async (data) => {
    const workflowId = data?.workflowId
    const workflow = serverState.activeWorkflows.get(workflowId) || data?.workflow

    if (!workflow) {
      socket.emit('executor:error', { message: 'Workflow no encontrado' })
      return
    }

    const executionId = `exec_${Date.now()}`
    const actions = workflow.actions || workflow.steps || workflow.pasos || []

    const execution = {
      id: executionId,
      workflowId,
      workflowName: workflow.name || workflow.nombre,
      status: 'running',
      startedAt: new Date(),
      currentStep: 0,
      totalSteps: actions.length,
      logs: [],
      variables: { ...data?.variables }
    }

    executions.set(executionId, execution)

    // Crear ejecutor de acciones
    const executor = new ActionExecutor(socket, executionId)
    executors.set(executionId, executor)

    // Copiar variables iniciales
    if (workflow.variables) {
      workflow.variables.forEach(v => {
        executor.variables.set(v.name, v.value || v.defaultValue)
      })
    }

    socket.emit('executor:started', {
      executionId,
      workflowName: execution.workflowName,
      totalSteps: execution.totalSteps
    })

    console.log(`[Executor] Iniciando: ${execution.workflowName} (${actions.length} pasos)`)

    try {
      // Ejecutar acciones
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        execution.currentStep = i + 1

        // Verificar si fue pausado
        if (execution.status === 'paused') {
          socket.emit('executor:paused', { executionId, step: i + 1 })
          await waitForResume(execution)
        }

        // Verificar si fue detenido
        if (execution.status === 'stopped') {
          socket.emit('executor:stopped', { executionId, step: i + 1 })
          await executor.cleanup()
          return
        }

        // Notificar paso actual
        socket.emit('executor:step', {
          executionId,
          step: i + 1,
          totalSteps: actions.length,
          action: {
            type: action.type || action.action,
            label: action.label || action.type || action.action
          }
        })

        // Log de la acción
        const log = {
          timestamp: new Date().toISOString(),
          step: i + 1,
          type: 'info',
          message: `Ejecutando: ${action.label || action.type || action.action}`
        }
        execution.logs.push(log)
        socket.emit('executor:log', { executionId, log })

        try {
          // EJECUTAR ACCIÓN REAL
          const result = await executor.execute(action)

          // Log de éxito
          const successLog = {
            timestamp: new Date().toISOString(),
            step: i + 1,
            type: 'success',
            message: `Completado: ${action.label || action.type || action.action}`,
            result
          }
          execution.logs.push(successLog)
          socket.emit('executor:log', { executionId, log: successLog })

        } catch (actionError) {
          // Manejar error de acción
          const errorLog = {
            timestamp: new Date().toISOString(),
            step: i + 1,
            type: 'error',
            message: `Error: ${actionError.message}`
          }
          execution.logs.push(errorLog)
          socket.emit('executor:log', { executionId, log: errorLog })

          // Si continueOnError está habilitado, continuar
          if (action.properties?.continueOnError || action.params?.continueOnError) {
            continue
          }

          // De lo contrario, detener ejecución
          throw actionError
        }
      }

      // Completar ejecución
      execution.status = 'completed'
      execution.endedAt = new Date()
      execution.duration = execution.endedAt - execution.startedAt

      socket.emit('executor:completed', {
        executionId,
        duration: execution.duration,
        stepsExecuted: execution.totalSteps,
        variables: Object.fromEntries(executor.variables)
      })

      console.log(`[Executor] Completado: ${execution.workflowName} en ${execution.duration}ms`)

    } catch (error) {
      execution.status = 'error'
      execution.endedAt = new Date()
      execution.error = error.message

      socket.emit('executor:error', {
        executionId,
        message: error.message,
        step: execution.currentStep
      })

      console.error(`[Executor] Error en ${execution.workflowName}: ${error.message}`)

    } finally {
      // Limpiar recursos
      await executor.cleanup()
      executors.delete(executionId)
    }
  })

  // Ejecutar workflow directamente desde frontend (sin necesidad de cargarlo desde serverState)
  socket.on('executor:run-direct', async (data) => {
    const workflow = data?.workflow
    if (!workflow) {
      socket.emit('executor:error', { message: 'Workflow no proporcionado' })
      return
    }

    // Reutilizar la lógica de executor:run
    socket.emit('executor:run', { workflow, variables: data?.variables })
  })

  // Pausar ejecución
  socket.on('executor:pause', (data) => {
    const execution = executions.get(data?.executionId)

    if (execution && execution.status === 'running') {
      execution.status = 'paused'
      console.log(`[Executor] Pausado: ${execution.workflowName}`)
    }
  })

  // Reanudar ejecución
  socket.on('executor:resume', (data) => {
    const execution = executions.get(data?.executionId)

    if (execution && execution.status === 'paused') {
      execution.status = 'running'
      console.log(`[Executor] Reanudado: ${execution.workflowName}`)
    }
  })

  // Detener ejecución
  socket.on('executor:stop', async (data) => {
    const execution = executions.get(data?.executionId)
    const executor = executors.get(data?.executionId)

    if (execution) {
      execution.status = 'stopped'
      execution.endedAt = new Date()
      console.log(`[Executor] Detenido: ${execution.workflowName}`)

      if (executor) {
        await executor.cleanup()
      }
    }
  })

  // Cerrar MessageBox desde frontend
  socket.on('executor:message-box-closed', (data) => {
    // El evento se propaga al executor que está esperando
    socket.emit('executor:message-box-closed', data)
  })

  // Obtener estado de ejecución
  socket.on('executor:status', (data) => {
    const execution = executions.get(data?.executionId)

    if (execution) {
      socket.emit('executor:status', {
        executionId: execution.id,
        status: execution.status,
        currentStep: execution.currentStep,
        totalSteps: execution.totalSteps,
        duration: execution.endedAt
          ? execution.endedAt - execution.startedAt
          : Date.now() - execution.startedAt
      })
    } else {
      socket.emit('executor:error', { message: 'Ejecución no encontrada' })
    }
  })

  // Obtener logs de ejecución
  socket.on('executor:get-logs', (data) => {
    const execution = executions.get(data?.executionId)

    if (execution) {
      socket.emit('executor:logs', {
        executionId: execution.id,
        logs: execution.logs
      })
    }
  })

  // Obtener historial de ejecuciones
  socket.on('executor:history', () => {
    const history = Array.from(executions.values()).map(exec => ({
      id: exec.id,
      workflowId: exec.workflowId,
      workflowName: exec.workflowName,
      status: exec.status,
      startedAt: exec.startedAt,
      endedAt: exec.endedAt,
      duration: exec.duration
    }))

    socket.emit('executor:history', { executions: history })
  })
}

// Utilidades
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function waitForResume(execution) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (execution.status !== 'paused') {
        clearInterval(check)
        resolve()
      }
    }, 100)
  })
}
