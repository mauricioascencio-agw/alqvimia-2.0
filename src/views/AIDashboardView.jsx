import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function AIDashboardView() {
  const { t } = useLanguage()
  const [activeModule, setActiveModule] = useState('overview')
  const [stats] = useState({
    documentsProcessed: 1247,
    processesDiscovered: 32,
    tasksAutomated: 156,
    timeSaved: '342h',
    accuracy: '96.8%',
    activeAgents: 8
  })

  // Datos de ejemplo para Process Mining
  const [processData] = useState([
    { id: 1, name: 'Proceso de Facturación', variants: 12, cases: 3420, avgTime: '4.2h', bottleneck: 'Aprobación manual' },
    { id: 2, name: 'Onboarding de Clientes', variants: 8, cases: 890, avgTime: '2.1 días', bottleneck: 'Verificación documentos' },
    { id: 3, name: 'Gestión de Pedidos', variants: 15, cases: 5670, avgTime: '6.5h', bottleneck: 'Stock checking' },
    { id: 4, name: 'Soporte al Cliente', variants: 6, cases: 2340, avgTime: '45min', bottleneck: 'Escalación nivel 2' }
  ])

  // Datos de ejemplo para Task Mining
  const [taskData] = useState([
    { id: 1, task: 'Copiar datos entre sistemas', frequency: 234, avgTime: '3.2min', automatable: 95, priority: 'Alta' },
    { id: 2, task: 'Validar información de cliente', frequency: 189, avgTime: '5.1min', automatable: 78, priority: 'Alta' },
    { id: 3, task: 'Generar reportes mensuales', frequency: 45, avgTime: '25min', automatable: 92, priority: 'Media' },
    { id: 4, task: 'Actualizar inventario', frequency: 312, avgTime: '2.8min', automatable: 88, priority: 'Alta' },
    { id: 5, task: 'Enviar notificaciones', frequency: 567, avgTime: '1.5min', automatable: 98, priority: 'Media' }
  ])

  // Tipos de documentos para IDP
  const [documentTypes] = useState([
    { type: 'Facturas', icon: 'fa-file-invoice-dollar', count: 4523, accuracy: 98.2, color: '#22c55e' },
    { type: 'Contratos', icon: 'fa-file-contract', count: 892, accuracy: 94.5, color: '#3b82f6' },
    { type: 'Órdenes de Compra', icon: 'fa-shopping-cart', count: 2341, accuracy: 97.1, color: '#8b5cf6' },
    { type: 'Formularios', icon: 'fa-wpforms', count: 1567, accuracy: 95.8, color: '#f59e0b' },
    { type: 'Recibos', icon: 'fa-receipt', count: 3789, accuracy: 96.9, color: '#ec4899' },
    { type: 'ID Documents', icon: 'fa-id-card', count: 678, accuracy: 99.1, color: '#06b6d4' }
  ])

  // Agentes Autónomos
  const [agents] = useState([
    { id: 1, name: 'Agente de Facturación', status: 'active', tasks: 45, success: 98.5, lastRun: 'Hace 5 min' },
    { id: 2, name: 'Agente de Emails', status: 'active', tasks: 123, success: 97.2, lastRun: 'Hace 2 min' },
    { id: 3, name: 'Agente de Datos', status: 'paused', tasks: 78, success: 99.1, lastRun: 'Hace 1 hora' },
    { id: 4, name: 'Agente de Reportes', status: 'active', tasks: 34, success: 96.8, lastRun: 'Hace 15 min' },
    { id: 5, name: 'Agente de Inventario', status: 'error', tasks: 12, success: 85.3, lastRun: 'Hace 30 min' }
  ])

  // Communications Mining
  const [communications] = useState({
    emails: { total: 12450, sentiment: { positive: 45, neutral: 42, negative: 13 }, topics: ['Soporte', 'Ventas', 'Facturación'] },
    chats: { total: 8920, sentiment: { positive: 52, neutral: 38, negative: 10 }, topics: ['Preguntas', 'Quejas', 'Solicitudes'] },
    calls: { total: 3420, sentiment: { positive: 48, neutral: 40, negative: 12 }, topics: ['Consultas', 'Reclamos', 'Ventas'] }
  })

  const modules = [
    { id: 'overview', name: 'Overview', icon: 'fa-th-large', color: '#6366f1' },
    { id: 'process-mining', name: 'Process Mining', icon: 'fa-project-diagram', color: '#22c55e' },
    { id: 'task-mining', name: 'Task Mining', icon: 'fa-tasks', color: '#3b82f6' },
    { id: 'document-understanding', name: 'Document Understanding', icon: 'fa-file-invoice', color: '#8b5cf6' },
    { id: 'agentic-automation', name: 'Agentic Automation', icon: 'fa-robot', color: '#f59e0b' },
    { id: 'communications-mining', name: 'Communications Mining', icon: 'fa-comments', color: '#ec4899' },
    { id: 'test-suite', name: 'Test Suite', icon: 'fa-vial', color: '#06b6d4' }
  ]

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Documentos Procesados', value: stats.documentsProcessed.toLocaleString(), icon: 'fa-file-alt', color: '#6366f1' },
          { label: 'Procesos Descubiertos', value: stats.processesDiscovered, icon: 'fa-sitemap', color: '#22c55e' },
          { label: 'Tareas Automatizadas', value: stats.tasksAutomated, icon: 'fa-cogs', color: '#3b82f6' },
          { label: 'Tiempo Ahorrado', value: stats.timeSaved, icon: 'fa-clock', color: '#f59e0b' },
          { label: 'Precisión Promedio', value: stats.accuracy, icon: 'fa-bullseye', color: '#ec4899' },
          { label: 'Agentes Activos', value: stats.activeAgents, icon: 'fa-robot', color: '#8b5cf6' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}aa)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={`fas ${stat.icon}`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fas fa-rocket" style={{ color: 'var(--primary-color)' }}></i>
        Módulos de IA/ML
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {modules.filter(m => m.id !== 'overview').map(module => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            style={{
              background: 'var(--dark-bg)',
              border: '2px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = module.color
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `linear-gradient(135deg, ${module.color}20, transparent)`,
              borderRadius: '0 16px 0 100%'
            }}></div>
            <i className={`fas ${module.icon}`} style={{ fontSize: '2.5rem', color: module.color, marginBottom: '1rem' }}></i>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{module.name}</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {module.id === 'process-mining' && 'Descubre y analiza procesos de negocio'}
              {module.id === 'task-mining' && 'Identifica tareas automatizables'}
              {module.id === 'document-understanding' && 'Extrae datos de documentos con IA'}
              {module.id === 'agentic-automation' && 'Agentes autónomos inteligentes'}
              {module.id === 'communications-mining' && 'Analiza emails, chats y llamadas'}
              {module.id === 'test-suite' && 'Pruebas automatizadas con IA'}
            </p>
          </button>
        ))}
      </div>
    </>
  )

  const renderProcessMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-project-diagram" style={{ color: '#22c55e' }}></i>
            Process Mining
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Descubre, analiza y optimiza tus procesos de negocio
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary"><i className="fas fa-upload"></i> Importar Log</button>
          <button className="btn btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }}>
            <i className="fas fa-play"></i> Nuevo Análisis
          </button>
        </div>
      </div>

      {/* Process Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {processData.map(process => (
          <div key={process.id} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{process.name}</h4>
              <span style={{
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem'
              }}>
                {process.variants} variantes
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Casos analizados</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{process.cases.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tiempo promedio</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{process.avgTime}</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Cuello de botella: {process.bottleneck}</span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>
                <i className="fas fa-sitemap"></i> Ver Mapa
              </button>
              <button className="btn btn-sm btn-primary" style={{ flex: 1, background: '#22c55e', borderColor: '#22c55e' }}>
                <i className="fas fa-magic"></i> Optimizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Process Flow Visualization Placeholder */}
      <div style={{
        background: 'var(--dark-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <i className="fas fa-project-diagram" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
        <h4 style={{ color: 'var(--text-primary)' }}>Visualización de Procesos</h4>
        <p style={{ color: 'var(--text-secondary)' }}>Selecciona un proceso para ver su mapa de flujo interactivo</p>
      </div>
    </div>
  )

  const renderTaskMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-tasks" style={{ color: '#3b82f6' }}></i>
            Task Mining
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Descubre tareas repetitivas candidatas para automatización
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary"><i className="fas fa-desktop"></i> Iniciar Grabación</button>
          <button className="btn btn-primary" style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>
            <i className="fas fa-search"></i> Analizar Tareas
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div style={{
        background: 'var(--dark-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Tarea Detectada</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Frecuencia/día</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tiempo Prom.</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Automatizable</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Prioridad</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {taskData.map(task => (
              <tr key={task.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="fas fa-mouse-pointer" style={{ color: '#3b82f6' }}></i>
                    {task.task}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {task.frequency}x
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {task.avgTime}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: task.automatable >= 90 ? 'rgba(34, 197, 94, 0.2)' : task.automatable >= 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: task.automatable >= 90 ? '#22c55e' : task.automatable >= 70 ? '#f59e0b' : '#ef4444',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }}>
                    {task.automatable}%
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    background: task.priority === 'Alta' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: task.priority === 'Alta' ? '#ef4444' : '#f59e0b',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {task.priority}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button className="btn btn-sm btn-primary" style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>
                    <i className="fas fa-robot"></i> Automatizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ROI Calculator */}
      <div style={{
        marginTop: '2rem',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-calculator" style={{ color: '#3b82f6' }}></i>
          Potencial de Ahorro Estimado
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>847h</div>
            <div style={{ color: 'var(--text-secondary)' }}>Horas/mes ahorrables</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>$42,350</div>
            <div style={{ color: 'var(--text-secondary)' }}>Ahorro estimado/mes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>3.2 meses</div>
            <div style={{ color: 'var(--text-secondary)' }}>ROI estimado</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocumentUnderstanding = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-file-invoice" style={{ color: '#8b5cf6' }}></i>
            Document Understanding (IDP)
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Procesamiento Inteligente de Documentos con Machine Learning
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary"><i className="fas fa-graduation-cap"></i> Entrenar Modelo</button>
          <button className="btn btn-primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}>
            <i className="fas fa-upload"></i> Procesar Documentos
          </button>
        </div>
      </div>

      {/* Document Type Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {documentTypes.map((doc, idx) => (
          <div key={idx} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `${doc.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <i className={`fas ${doc.icon}`} style={{ fontSize: '1.5rem', color: doc.color }}></i>
            </div>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{doc.type}</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: doc.color }}>{doc.count.toLocaleString()}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>documentos</div>
            <div style={{
              marginTop: '0.75rem',
              padding: '0.25rem 0.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#22c55e'
            }}>
              {doc.accuracy}% precisión
            </div>
          </div>
        ))}
      </div>

      {/* Extraction Pipeline */}
      <div style={{
        background: 'var(--dark-bg)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <h4 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-stream" style={{ color: '#8b5cf6' }}></i>
          Pipeline de Extracción
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {[
            { step: 1, name: 'Digitalización', icon: 'fa-scanner', desc: 'OCR y preprocesamiento' },
            { step: 2, name: 'Clasificación', icon: 'fa-tags', desc: 'ML clasifica tipo documento' },
            { step: 3, name: 'Extracción', icon: 'fa-magic', desc: 'NER extrae campos clave' },
            { step: 4, name: 'Validación', icon: 'fa-check-double', desc: 'Reglas de negocio y confianza' },
            { step: 5, name: 'Exportación', icon: 'fa-database', desc: 'Integración con sistemas' }
          ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.25rem', color: 'white' }}></i>
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
            </div>
          ))}
          <div style={{
            position: 'absolute',
            top: '30px',
            left: '10%',
            right: '10%',
            height: '3px',
            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
            zIndex: 0
          }}></div>
        </div>
      </div>

      {/* Campos Extraíbles */}
      <div style={{
        background: 'var(--dark-bg)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-list-alt" style={{ color: '#8b5cf6' }}></i>
          Campos Extraíbles (Ejemplo: Factura)
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {['Número de Factura', 'Fecha', 'Proveedor', 'NIF/CIF', 'Dirección', 'Líneas de Producto', 'Subtotal', 'IVA', 'Total', 'Forma de Pago', 'Vencimiento', 'IBAN'].map((field, idx) => (
            <span key={idx} style={{
              background: 'var(--bg-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-check" style={{ color: '#22c55e', fontSize: '0.7rem' }}></i>
              {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAgenticAutomation = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-robot" style={{ color: '#f59e0b' }}></i>
            Agentic Automation
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Agentes autónomos inteligentes que trabajan por ti
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
          <i className="fas fa-plus"></i> Crear Nuevo Agente
        </button>
      </div>

      {/* Agent Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {agents.map(agent => (
          <div key={agent.id} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: `2px solid ${agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-robot" style={{ fontSize: '1.25rem', color: 'white' }}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{agent.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{agent.lastRun}</span>
                </div>
              </div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444',
                boxShadow: `0 0 10px ${agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444'}`
              }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tareas ejecutadas</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{agent.tasks}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tasa de éxito</div>
                <div style={{ color: agent.success >= 95 ? '#22c55e' : agent.success >= 85 ? '#f59e0b' : '#ef4444', fontSize: '1.25rem', fontWeight: '600' }}>
                  {agent.success}%
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {agent.status === 'active' ? (
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>
                  <i className="fas fa-pause"></i> Pausar
                </button>
              ) : (
                <button className="btn btn-sm btn-success" style={{ flex: 1 }}>
                  <i className="fas fa-play"></i> Iniciar
                </button>
              )}
              <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                <i className="fas fa-cog"></i> Configurar
              </button>
              <button className="btn btn-sm btn-secondary">
                <i className="fas fa-history"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-magic" style={{ color: '#f59e0b' }}></i>
          Capacidades de los Agentes
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Toma de decisiones', icon: 'fa-brain' },
            { name: 'Manejo de excepciones', icon: 'fa-shield-alt' },
            { name: 'Aprendizaje continuo', icon: 'fa-graduation-cap' },
            { name: 'Colaboración multi-agente', icon: 'fa-users' },
            { name: 'Integración con LLMs', icon: 'fa-comments' },
            { name: 'Auto-optimización', icon: 'fa-chart-line' }
          ].map((cap, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'var(--dark-bg)',
              borderRadius: '8px'
            }}>
              <i className={`fas ${cap.icon}`} style={{ color: '#f59e0b' }}></i>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cap.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCommunicationsMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-comments" style={{ color: '#ec4899' }}></i>
            Communications Mining
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Analiza emails, chats y llamadas para descubrir insights
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: '#ec4899', borderColor: '#ec4899' }}>
          <i className="fas fa-plug"></i> Conectar Fuentes
        </button>
      </div>

      {/* Communication Channels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { channel: 'Emails', icon: 'fa-envelope', data: communications.emails, color: '#3b82f6' },
          { channel: 'Chats', icon: 'fa-comment-dots', data: communications.chats, color: '#22c55e' },
          { channel: 'Llamadas', icon: 'fa-phone', data: communications.calls, color: '#8b5cf6' }
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${item.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.25rem', color: item.color }}></i>
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{item.channel}</h4>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color }}>{item.data.total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sentimiento</div>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${item.data.sentiment.positive}%`, background: '#22c55e' }}></div>
                <div style={{ width: `${item.data.sentiment.neutral}%`, background: '#94a3b8' }}></div>
                <div style={{ width: `${item.data.sentiment.negative}%`, background: '#ef4444' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#22c55e' }}>+{item.data.sentiment.positive}%</span>
                <span style={{ color: '#94a3b8' }}>{item.data.sentiment.neutral}%</span>
                <span style={{ color: '#ef4444' }}>-{item.data.sentiment.negative}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Temas principales</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {item.data.topics.map((topic, i) => (
                  <span key={i} style={{
                    background: `${item.color}20`,
                    color: item.color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem'
                  }}>{topic}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.05))',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid rgba(236, 72, 153, 0.3)'
      }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-lightbulb" style={{ color: '#ec4899' }}></i>
          Insights Descubiertos
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: 'fa-exclamation-triangle', text: '23% de emails requieren múltiples respuestas - oportunidad de automatización', color: '#f59e0b' },
            { icon: 'fa-clock', text: 'Tiempo de respuesta promedio: 4.2 horas - por debajo del SLA', color: '#ef4444' },
            { icon: 'fa-chart-line', text: 'Los temas de facturación han aumentado 15% este mes', color: '#3b82f6' },
            { icon: 'fa-smile', text: 'Satisfacción del cliente en chats: 87% positivo', color: '#22c55e' }
          ].map((insight, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--dark-bg)',
              borderRadius: '8px'
            }}>
              <i className={`fas ${insight.icon}`} style={{ color: insight.color }}></i>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTestSuite = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-vial" style={{ color: '#06b6d4' }}></i>
            Test Suite
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
            Pruebas automatizadas para tus workflows y robots
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary"><i className="fas fa-file-import"></i> Importar Tests</button>
          <button className="btn btn-primary" style={{ background: '#06b6d4', borderColor: '#06b6d4' }}>
            <i className="fas fa-play"></i> Ejecutar Suite
          </button>
        </div>
      </div>

      {/* Test Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Tests', value: 156, icon: 'fa-list-check', color: '#06b6d4' },
          { label: 'Pasados', value: 142, icon: 'fa-check-circle', color: '#22c55e' },
          { label: 'Fallados', value: 8, icon: 'fa-times-circle', color: '#ef4444' },
          { label: 'Omitidos', value: 6, icon: 'fa-minus-circle', color: '#f59e0b' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--dark-bg)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <i className={`fas ${stat.icon}`} style={{ fontSize: '1.5rem', color: stat.color, marginBottom: '0.5rem' }}></i>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Test Types */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { type: 'Unit Tests', desc: 'Pruebas de acciones individuales', count: 89, passed: 85, icon: 'fa-cube' },
          { type: 'Integration Tests', desc: 'Pruebas de flujos completos', count: 45, passed: 40, icon: 'fa-link' },
          { type: 'E2E Tests', desc: 'Pruebas end-to-end', count: 22, passed: 17, icon: 'fa-route' }
        ].map((test, idx) => (
          <div key={idx} style={{
            background: 'var(--dark-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={`fas ${test.icon}`} style={{ fontSize: '1.25rem', color: 'white' }}></i>
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{test.type}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{test.desc}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tasa de éxito</span>
                <span style={{ color: '#22c55e', fontWeight: '600' }}>{Math.round((test.passed / test.count) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(test.passed / test.count) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span><i className="fas fa-check" style={{ color: '#22c55e' }}></i> {test.passed} pasados</span>
              <span><i className="fas fa-times" style={{ color: '#ef4444' }}></i> {test.count - test.passed} fallados</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeModule) {
      case 'overview': return renderOverview()
      case 'process-mining': return renderProcessMining()
      case 'task-mining': return renderTaskMining()
      case 'document-understanding': return renderDocumentUnderstanding()
      case 'agentic-automation': return renderAgenticAutomation()
      case 'communications-mining': return renderCommunicationsMining()
      case 'test-suite': return renderTestSuite()
      default: return renderOverview()
    }
  }

  const currentModule = modules.find(m => m.id === activeModule)

  return (
    <div className="view" id="ai-dashboard-view">
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${currentModule?.color || '#6366f1'}, ${currentModule?.color || '#6366f1'}cc)`,
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-brain"></i>
            {t('ai_title')}
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.85)' }}>
            {t('ai_subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white'
          }}>
            <i className="fas fa-chart-bar"></i> Métricas
          </button>
          <button className="btn" style={{
            background: 'white',
            color: currentModule?.color || '#6366f1',
            border: 'none',
            fontWeight: '600'
          }}>
            <i className="fas fa-cog"></i> Configuración
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {modules.map(module => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: activeModule === module.id ? module.color : 'var(--dark-bg)',
              border: activeModule === module.id ? `2px solid ${module.color}` : '2px solid var(--border-color)',
              borderRadius: '10px',
              color: activeModule === module.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              fontWeight: activeModule === module.id ? '600' : '400'
            }}
          >
            <i className={`fas ${module.icon}`}></i>
            {module.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

export default AIDashboardView
