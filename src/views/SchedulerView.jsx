import { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'

function SchedulerView() {
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()

  // Estados principales
  const [schedules, setSchedules] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [workflows, setWorkflows] = useState([])

  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'paused', 'error'
  const [filterTrigger, setFilterTrigger] = useState('all') // 'all', 'time', 'email', 'file', 'api', 'event'
  const [filterWorkflow, setFilterWorkflow] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list'
  const [folders, setFolders] = useState([
    { id: 'root', name: 'Mis Workflows', icon: 'fa-folder' },
    { id: 'production', name: 'Produccion', icon: 'fa-industry' },
    { id: 'development', name: 'Desarrollo', icon: 'fa-code' },
    { id: 'testing', name: 'Pruebas', icon: 'fa-flask' }
  ])

  // Estado del formulario de nueva programacion
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    workflowId: '',
    workflowName: '',
    triggerType: 'time', // 'time', 'email', 'file', 'api', 'event'
    enabled: true,
    // Configuracion de tiempo
    scheduleType: 'once', // 'once', 'daily', 'weekly', 'monthly', 'cron'
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: '',
    // Recurrencia
    repeatEvery: 1,
    repeatUnit: 'hours', // 'minutes', 'hours', 'days', 'weeks', 'months'
    daysOfWeek: [], // [0-6] domingo a sabado
    dayOfMonth: 1,
    // Trigger por email
    emailAccount: '',
    emailSubjectContains: '',
    emailFromContains: '',
    // Trigger por archivo
    watchFolder: '',
    filePattern: '*.*',
    // Trigger por API/Webhook
    webhookUrl: '',
    webhookSecret: '',
    // Opciones avanzadas
    maxRetries: 3,
    retryDelayMinutes: 5,
    timeout: 3600,
    notifyOnComplete: true,
    notifyOnError: true,
    notifyEmail: ''
  })

  // Cargar workflows guardados
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
    setWorkflows(saved)

    const savedSchedules = JSON.parse(localStorage.getItem('alqvimia-schedules') || '[]')
    setSchedules(savedSchedules)
  }, [])

  // Guardar programaciones
  const saveSchedules = (newSchedules) => {
    localStorage.setItem('alqvimia-schedules', JSON.stringify(newSchedules))
    setSchedules(newSchedules)
  }

  // Dias de la semana
  const weekDays = [
    { id: 0, short: 'D', name: 'Domingo' },
    { id: 1, short: 'L', name: 'Lunes' },
    { id: 2, short: 'M', name: 'Martes' },
    { id: 3, short: 'X', name: 'Miercoles' },
    { id: 4, short: 'J', name: 'Jueves' },
    { id: 5, short: 'V', name: 'Viernes' },
    { id: 6, short: 'S', name: 'Sabado' }
  ]

  // Tipos de trigger
  const triggerTypes = [
    { id: 'time', name: 'Tarea Programada', icon: 'fa-clock', desc: 'Ejecutar en horarios especificos' },
    { id: 'email', name: 'Correo Electronico', icon: 'fa-envelope', desc: 'Trigger al recibir email' },
    { id: 'file', name: 'Deteccion de Archivo', icon: 'fa-file-import', desc: 'Al detectar archivo nuevo' },
    { id: 'api', name: 'Webhook / API', icon: 'fa-globe', desc: 'Trigger via llamada HTTP' },
    { id: 'event', name: 'Evento de Sistema', icon: 'fa-bolt', desc: 'Al ocurrir evento Windows' }
  ]

  // Crear nueva programacion
  const createSchedule = () => {
    if (!newSchedule.name || !newSchedule.workflowId) {
      alert('Completa el nombre y selecciona un workflow')
      return
    }

    const schedule = {
      id: `sch_${Date.now()}`,
      ...newSchedule,
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: calculateNextRun(newSchedule),
      runCount: 0,
      status: 'active'
    }

    const updated = [...schedules, schedule]
    saveSchedules(updated)
    setShowCreateModal(false)
    resetForm()
  }

  // Calcular proxima ejecucion
  const calculateNextRun = (schedule) => {
    const now = new Date()
    const [hours, minutes] = schedule.startTime.split(':').map(Number)

    if (schedule.scheduleType === 'once') {
      const runDate = new Date(schedule.startDate)
      runDate.setHours(hours, minutes, 0, 0)
      return runDate.toISOString()
    }

    // Para otros tipos, calcular basado en la configuracion
    const next = new Date(schedule.startDate)
    next.setHours(hours, minutes, 0, 0)

    if (next <= now) {
      // Si ya paso, calcular la siguiente
      if (schedule.scheduleType === 'daily') {
        next.setDate(next.getDate() + 1)
      } else if (schedule.scheduleType === 'weekly') {
        next.setDate(next.getDate() + 7)
      }
    }

    return next.toISOString()
  }

  // Resetear formulario
  const resetForm = () => {
    setNewSchedule({
      name: '',
      workflowId: '',
      workflowName: '',
      triggerType: 'time',
      enabled: true,
      scheduleType: 'once',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: '',
      repeatEvery: 1,
      repeatUnit: 'hours',
      daysOfWeek: [],
      dayOfMonth: 1,
      emailAccount: '',
      emailSubjectContains: '',
      emailFromContains: '',
      watchFolder: '',
      filePattern: '*.*',
      webhookUrl: '',
      webhookSecret: '',
      maxRetries: 3,
      retryDelayMinutes: 5,
      timeout: 3600,
      notifyOnComplete: true,
      notifyOnError: true,
      notifyEmail: ''
    })
  }

  // Toggle dia de la semana
  const toggleDayOfWeek = (dayId) => {
    const days = [...newSchedule.daysOfWeek]
    const index = days.indexOf(dayId)
    if (index > -1) {
      days.splice(index, 1)
    } else {
      days.push(dayId)
    }
    setNewSchedule({ ...newSchedule, daysOfWeek: days })
  }

  // Eliminar programacion
  const deleteSchedule = (id) => {
    if (confirm('Estas seguro de eliminar esta programacion?')) {
      const updated = schedules.filter(s => s.id !== id)
      saveSchedules(updated)
    }
  }

  // Toggle estado
  const toggleScheduleStatus = (id) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        return { ...s, enabled: !s.enabled, status: !s.enabled ? 'active' : 'paused' }
      }
      return s
    })
    saveSchedules(updated)
  }

  // Ejecutar manualmente
  const runScheduleNow = (schedule) => {
    if (socket && isConnected) {
      socket.emit('executor:run', {
        workflowId: schedule.workflowId,
        workflowName: schedule.workflowName,
        triggeredBy: 'manual',
        scheduleId: schedule.id
      })

      // Actualizar lastRun
      const updated = schedules.map(s => {
        if (s.id === schedule.id) {
          return { ...s, lastRun: new Date().toISOString(), runCount: s.runCount + 1 }
        }
        return s
      })
      saveSchedules(updated)
    } else {
      alert('Conecta al servidor para ejecutar workflows')
    }
  }

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  // Obtener icono de estado
  const getStatusIcon = (schedule) => {
    if (!schedule.enabled) return { icon: 'fa-pause-circle', color: 'text-warning' }
    if (schedule.status === 'running') return { icon: 'fa-spinner fa-spin', color: 'text-primary' }
    if (schedule.status === 'error') return { icon: 'fa-exclamation-circle', color: 'text-danger' }
    return { icon: 'fa-check-circle', color: 'text-success' }
  }

  // Filtrar programaciones
  const filteredSchedules = schedules.filter(schedule => {
    // Filtro por busqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!schedule.name.toLowerCase().includes(search) &&
          !schedule.workflowName?.toLowerCase().includes(search)) {
        return false
      }
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !schedule.enabled) return false
      if (filterStatus === 'paused' && schedule.enabled) return false
      if (filterStatus === 'error' && schedule.status !== 'error') return false
    }

    // Filtro por tipo de trigger
    if (filterTrigger !== 'all' && schedule.triggerType !== filterTrigger) {
      return false
    }

    // Filtro por workflow
    if (filterWorkflow !== 'all' && schedule.workflowName !== filterWorkflow) {
      return false
    }

    return true
  })

  return (
    <div className="view" id="scheduler-view">
      <div className="view-header">
        <h2><i className="fas fa-calendar-alt"></i> {t('nav_scheduler') || 'Programador de Workflows'}</h2>
        <p>{t('scheduler_subtitle') || 'Programa ejecuciones automaticas de tus workflows'}</p>
      </div>

      {/* Toolbar */}
      <div className="scheduler-toolbar">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Nueva Programacion
        </button>
        <button className="btn btn-secondary" onClick={() => {
          const savedSchedules = JSON.parse(localStorage.getItem('alqvimia-schedules') || '[]')
          setSchedules(savedSchedules)
        }}>
          <i className="fas fa-sync"></i> Actualizar
        </button>
        <div className="toolbar-stats">
          <span className="stat">
            <i className="fas fa-calendar-check"></i>
            {schedules.filter(s => s.enabled).length} Activas
          </span>
          <span className="stat">
            <i className="fas fa-pause"></i>
            {schedules.filter(s => !s.enabled).length} Pausadas
          </span>
        </div>
      </div>

      {/* Barra de filtros y acciones */}
      <div className="scheduler-filter-bar">
        <div className="filter-row">
          {/* Busqueda */}
          <div className="filter-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar programaciones..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <div className="filter-group">
            <label>Estado:</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="paused">Pausadas</option>
              <option value="error">Con Error</option>
            </select>
          </div>

          {/* Filtro por tipo de trigger */}
          <div className="filter-group">
            <label>Trigger:</label>
            <select value={filterTrigger} onChange={e => setFilterTrigger(e.target.value)}>
              <option value="all">Todos</option>
              {triggerTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por workflow */}
          <div className="filter-group">
            <label>Workflow:</label>
            <select value={filterWorkflow} onChange={e => setFilterWorkflow(e.target.value)}>
              <option value="all">Todos</option>
              {workflows.map(wf => (
                <option key={wf.name} value={wf.name}>{wf.name}</option>
              ))}
            </select>
          </div>

          {/* Toggle vista */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista de rejilla"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {/* Acciones rapidas */}
        <div className="quick-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              const activeCount = schedules.filter(s => s.enabled).length
              if (activeCount > 0 && confirm(`Pausar todas las ${activeCount} programaciones activas?`)) {
                const updated = schedules.map(s => ({ ...s, enabled: false, status: 'paused' }))
                saveSchedules(updated)
              }
            }}
            title="Pausar todas"
          >
            <i className="fas fa-pause"></i> Pausar Todas
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              const pausedCount = schedules.filter(s => !s.enabled).length
              if (pausedCount > 0 && confirm(`Activar todas las ${pausedCount} programaciones pausadas?`)) {
                const updated = schedules.map(s => ({ ...s, enabled: true, status: 'active' }))
                saveSchedules(updated)
              }
            }}
            title="Activar todas"
          >
            <i className="fas fa-play"></i> Activar Todas
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              if (schedules.length > 0) {
                const blob = new Blob([JSON.stringify(schedules, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `alqvimia-schedules-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
              }
            }}
            title="Exportar programaciones"
          >
            <i className="fas fa-download"></i> Exportar
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.json'
              input.onchange = (e) => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    try {
                      const imported = JSON.parse(ev.target.result)
                      if (Array.isArray(imported) && confirm(`Importar ${imported.length} programaciones?`)) {
                        const merged = [...schedules, ...imported.map(s => ({ ...s, id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }))]
                        saveSchedules(merged)
                      }
                    } catch (err) {
                      alert('Error al importar: archivo JSON invalido')
                    }
                  }
                  reader.readAsText(file)
                }
              }
              input.click()
            }}
            title="Importar programaciones"
          >
            <i className="fas fa-upload"></i> Importar
          </button>
          {(filterStatus !== 'all' || filterTrigger !== 'all' || filterWorkflow !== 'all' || searchTerm) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setFilterStatus('all')
                setFilterTrigger('all')
                setFilterWorkflow('all')
                setSearchTerm('')
              }}
            >
              <i className="fas fa-times"></i> Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de programaciones */}
      <div className="schedules-list">
        {filteredSchedules.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-plus"></i>
            {schedules.length === 0 ? (
              <>
                <h3>No hay programaciones</h3>
                <p>Crea tu primera programacion para ejecutar workflows automaticamente</p>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  <i className="fas fa-plus"></i> Crear Programacion
                </button>
              </>
            ) : (
              <>
                <h3>Sin resultados</h3>
                <p>No se encontraron programaciones con los filtros aplicados</p>
                <button className="btn btn-secondary" onClick={() => {
                  setFilterStatus('all')
                  setFilterTrigger('all')
                  setFilterWorkflow('all')
                  setSearchTerm('')
                }}>
                  <i className="fas fa-times"></i> Limpiar Filtros
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* Vista de lista/tabla */
          <div className="schedules-table-container">
            <table className="schedules-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Nombre</th>
                  <th>Workflow</th>
                  <th>Trigger</th>
                  <th>Horario</th>
                  <th>Ultima Ejecucion</th>
                  <th>Proxima</th>
                  <th>Ejecuciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map(schedule => {
                  const trigger = triggerTypes.find(t => t.id === schedule.triggerType)
                  const status = getStatusIcon(schedule)

                  return (
                    <tr key={schedule.id} className={!schedule.enabled ? 'disabled' : ''}>
                      <td className="status-cell">
                        <i className={`fas ${status.icon} ${status.color}`} title={schedule.enabled ? 'Activa' : 'Pausada'}></i>
                      </td>
                      <td className="name-cell">{schedule.name}</td>
                      <td className="workflow-cell">
                        <i className="fas fa-project-diagram"></i> {schedule.workflowName}
                      </td>
                      <td className="trigger-cell">
                        <i className={`fas ${trigger?.icon}`}></i> {trigger?.name}
                      </td>
                      <td className="time-cell">
                        {schedule.triggerType === 'time' && (
                          <>
                            <span>{schedule.startTime}</span>
                            <span className="frequency-badge">
                              {schedule.scheduleType === 'once' && 'Una vez'}
                              {schedule.scheduleType === 'daily' && 'Diario'}
                              {schedule.scheduleType === 'weekly' && 'Semanal'}
                              {schedule.scheduleType === 'monthly' && 'Mensual'}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="date-cell">{formatDate(schedule.lastRun)}</td>
                      <td className="date-cell">{formatDate(schedule.nextRun)}</td>
                      <td className="count-cell">{schedule.runCount}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => toggleScheduleStatus(schedule.id)}
                          title={schedule.enabled ? 'Pausar' : 'Activar'}
                        >
                          <i className={`fas fa-${schedule.enabled ? 'pause' : 'play'}`}></i>
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => runScheduleNow(schedule)}
                          title="Ejecutar ahora"
                        >
                          <i className="fas fa-rocket"></i>
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-danger"
                          onClick={() => deleteSchedule(schedule.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Vista de rejilla/cards */
          <div className="schedules-grid">
            {filteredSchedules.map(schedule => {
              const trigger = triggerTypes.find(t => t.id === schedule.triggerType)
              const status = getStatusIcon(schedule)

              return (
                <div key={schedule.id} className={`schedule-card ${!schedule.enabled ? 'disabled' : ''}`}>
                  <div className="schedule-header">
                    <div className="schedule-status">
                      <i className={`fas ${status.icon} ${status.color}`}></i>
                    </div>
                    <div className="schedule-info">
                      <h4>{schedule.name}</h4>
                      <span className="workflow-name">
                        <i className="fas fa-project-diagram"></i>
                        {schedule.workflowName}
                      </span>
                    </div>
                    <div className="schedule-actions">
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        title={schedule.enabled ? 'Pausar' : 'Activar'}
                      >
                        <i className={`fas fa-${schedule.enabled ? 'pause' : 'play'}`}></i>
                      </button>
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => runScheduleNow(schedule)}
                        title="Ejecutar ahora"
                      >
                        <i className="fas fa-rocket"></i>
                      </button>
                      <button
                        className="btn btn-xs btn-ghost text-danger"
                        onClick={() => deleteSchedule(schedule.id)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="schedule-trigger">
                    <div className="trigger-type">
                      <i className={`fas ${trigger?.icon}`}></i>
                      <span>{trigger?.name}</span>
                    </div>
                    {schedule.triggerType === 'time' && (
                      <div className="trigger-details">
                        <span className="schedule-time">
                          <i className="fas fa-clock"></i>
                          {schedule.startTime}
                        </span>
                        <span className="schedule-frequency">
                          {schedule.scheduleType === 'once' && 'Una vez'}
                          {schedule.scheduleType === 'daily' && 'Diario'}
                          {schedule.scheduleType === 'weekly' && `Semanal (${schedule.daysOfWeek.map(d => weekDays[d].short).join(', ')})`}
                          {schedule.scheduleType === 'monthly' && `Mensual (dia ${schedule.dayOfMonth})`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="schedule-footer">
                    <div className="schedule-stat">
                      <span className="label">Ultima ejecucion:</span>
                      <span className="value">{formatDate(schedule.lastRun)}</span>
                    </div>
                    <div className="schedule-stat">
                      <span className="label">Proxima:</span>
                      <span className="value">{formatDate(schedule.nextRun)}</span>
                    </div>
                    <div className="schedule-stat">
                      <span className="label">Ejecuciones:</span>
                      <span className="value">{schedule.runCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Contador de resultados */}
        {filteredSchedules.length > 0 && (
          <div className="results-count">
            Mostrando {filteredSchedules.length} de {schedules.length} programaciones
          </div>
        )}
      </div>

      {/* Modal de creacion */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-calendar-plus"></i> Nueva Programacion</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Nombre */}
              <div className="form-group">
                <label><i className="fas fa-tag"></i> Nombre de la Programacion</label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={e => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="Ej: Reporte diario de ventas"
                />
              </div>

              {/* Seleccionar Workflow */}
              <div className="form-group">
                <label><i className="fas fa-project-diagram"></i> Workflow a Ejecutar</label>
                <select
                  value={newSchedule.workflowId}
                  onChange={e => {
                    const wf = workflows.find(w => w.name === e.target.value)
                    setNewSchedule({
                      ...newSchedule,
                      workflowId: e.target.value,
                      workflowName: wf?.name || e.target.value
                    })
                  }}
                >
                  <option value="">Selecciona un workflow...</option>
                  {workflows.map(wf => (
                    <option key={wf.name} value={wf.name}>{wf.name}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Trigger */}
              <div className="form-group">
                <label><i className="fas fa-bolt"></i> Tipo de Trigger</label>
                <div className="trigger-type-selector">
                  {triggerTypes.map(trigger => (
                    <div
                      key={trigger.id}
                      className={`trigger-option ${newSchedule.triggerType === trigger.id ? 'active' : ''}`}
                      onClick={() => setNewSchedule({ ...newSchedule, triggerType: trigger.id })}
                    >
                      <i className={`fas ${trigger.icon}`}></i>
                      <span className="trigger-name">{trigger.name}</span>
                      <span className="trigger-desc">{trigger.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuracion segun tipo de trigger */}
              {newSchedule.triggerType === 'time' && (
                <div className="trigger-config">
                  <h4><i className="fas fa-clock"></i> Configuracion de Horario</h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Programacion</label>
                      <select
                        value={newSchedule.scheduleType}
                        onChange={e => setNewSchedule({ ...newSchedule, scheduleType: e.target.value })}
                      >
                        <option value="once">Una sola vez</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="interval">Cada X tiempo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Fecha de Inicio</label>
                      <input
                        type="date"
                        value={newSchedule.startDate}
                        onChange={e => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Hora</label>
                      <input
                        type="time"
                        value={newSchedule.startTime}
                        onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Dias de la semana para semanal */}
                  {newSchedule.scheduleType === 'weekly' && (
                    <div className="form-group">
                      <label>Dias de la Semana</label>
                      <div className="days-selector">
                        {weekDays.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            className={`day-btn ${newSchedule.daysOfWeek.includes(day.id) ? 'active' : ''}`}
                            onClick={() => toggleDayOfWeek(day.id)}
                            title={day.name}
                          >
                            {day.short}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dia del mes para mensual */}
                  {newSchedule.scheduleType === 'monthly' && (
                    <div className="form-group">
                      <label>Dia del Mes</label>
                      <select
                        value={newSchedule.dayOfMonth}
                        onChange={e => setNewSchedule({ ...newSchedule, dayOfMonth: parseInt(e.target.value) })}
                      >
                        {[...Array(31)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Intervalo */}
                  {newSchedule.scheduleType === 'interval' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Repetir cada</label>
                        <input
                          type="number"
                          min="1"
                          value={newSchedule.repeatEvery}
                          onChange={e => setNewSchedule({ ...newSchedule, repeatEvery: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unidad</label>
                        <select
                          value={newSchedule.repeatUnit}
                          onChange={e => setNewSchedule({ ...newSchedule, repeatUnit: e.target.value })}
                        >
                          <option value="minutes">Minutos</option>
                          <option value="hours">Horas</option>
                          <option value="days">Dias</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Fecha de fin opcional */}
                  <div className="form-group">
                    <label>Fecha de Fin (opcional)</label>
                    <input
                      type="date"
                      value={newSchedule.endDate}
                      onChange={e => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {newSchedule.triggerType === 'email' && (
                <div className="trigger-config">
                  <h4><i className="fas fa-envelope"></i> Configuracion de Email</h4>
                  <div className="form-group">
                    <label>Cuenta de Email a Monitorear</label>
                    <input
                      type="email"
                      value={newSchedule.emailAccount}
                      onChange={e => setNewSchedule({ ...newSchedule, emailAccount: e.target.value })}
                      placeholder="mi-cuenta@empresa.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Asunto contiene</label>
                    <input
                      type="text"
                      value={newSchedule.emailSubjectContains}
                      onChange={e => setNewSchedule({ ...newSchedule, emailSubjectContains: e.target.value })}
                      placeholder="Ej: [URGENTE], Factura, Orden"
                    />
                  </div>
                  <div className="form-group">
                    <label>Remitente contiene</label>
                    <input
                      type="text"
                      value={newSchedule.emailFromContains}
                      onChange={e => setNewSchedule({ ...newSchedule, emailFromContains: e.target.value })}
                      placeholder="Ej: @proveedor.com"
                    />
                  </div>
                </div>
              )}

              {newSchedule.triggerType === 'file' && (
                <div className="trigger-config">
                  <h4><i className="fas fa-folder-open"></i> Configuracion de Archivo</h4>
                  <div className="form-group">
                    <label>Carpeta a Monitorear</label>
                    <input
                      type="text"
                      value={newSchedule.watchFolder}
                      onChange={e => setNewSchedule({ ...newSchedule, watchFolder: e.target.value })}
                      placeholder="C:\Documentos\Entrada"
                    />
                  </div>
                  <div className="form-group">
                    <label>Patron de Archivo</label>
                    <input
                      type="text"
                      value={newSchedule.filePattern}
                      onChange={e => setNewSchedule({ ...newSchedule, filePattern: e.target.value })}
                      placeholder="*.xlsx, *.pdf, factura_*.csv"
                    />
                  </div>
                </div>
              )}

              {newSchedule.triggerType === 'api' && (
                <div className="trigger-config">
                  <h4><i className="fas fa-globe"></i> Configuracion de Webhook</h4>
                  <div className="form-group">
                    <label>URL del Webhook (generada)</label>
                    <div className="input-with-copy">
                      <input
                        type="text"
                        readOnly
                        value={`http://localhost:4000/api/webhook/${newSchedule.name?.toLowerCase().replace(/\s/g, '-') || 'nuevo'}`}
                      />
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:4000/api/webhook/${newSchedule.name?.toLowerCase().replace(/\s/g, '-') || 'nuevo'}`)
                      }}>
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Secret (para validar llamadas)</label>
                    <input
                      type="text"
                      value={newSchedule.webhookSecret}
                      onChange={e => setNewSchedule({ ...newSchedule, webhookSecret: e.target.value })}
                      placeholder="mi-secret-key-123"
                    />
                  </div>
                </div>
              )}

              {/* Opciones avanzadas */}
              <details className="advanced-options">
                <summary><i className="fas fa-cog"></i> Opciones Avanzadas</summary>
                <div className="advanced-options-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Reintentos en caso de error</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={newSchedule.maxRetries}
                        onChange={e => setNewSchedule({ ...newSchedule, maxRetries: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Demora entre reintentos (min)</label>
                      <input
                        type="number"
                        min="1"
                        value={newSchedule.retryDelayMinutes}
                        onChange={e => setNewSchedule({ ...newSchedule, retryDelayMinutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Timeout (segundos)</label>
                      <input
                        type="number"
                        min="60"
                        value={newSchedule.timeout}
                        onChange={e => setNewSchedule({ ...newSchedule, timeout: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notificaciones</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newSchedule.notifyOnComplete}
                          onChange={e => setNewSchedule({ ...newSchedule, notifyOnComplete: e.target.checked })}
                        />
                        <span>Notificar al completar</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newSchedule.notifyOnError}
                          onChange={e => setNewSchedule({ ...newSchedule, notifyOnError: e.target.checked })}
                        />
                        <span>Notificar en caso de error</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email para notificaciones</label>
                    <input
                      type="email"
                      value={newSchedule.notifyEmail}
                      onChange={e => setNewSchedule({ ...newSchedule, notifyEmail: e.target.value })}
                      placeholder="admin@empresa.com"
                    />
                  </div>
                </div>
              </details>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={createSchedule}>
                <i className="fas fa-save"></i> Crear Programacion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchedulerView
