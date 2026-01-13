/**
 * ALQVIMIA RPA 2.0 - Admin Dashboard
 * Panel de administración para monitorear toda la actividad de clientes
 * Soporta jerarquía: Mayoristas > Distribuidores > Partners > Clientes TI > Clientes Finales
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../assets/css/admin-dashboard.css'

// Iconos
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  executions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/>
      <line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/>
      <line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/>
      <line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/>
      <line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  hierarchy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="2" width="6" height="4" rx="1"/>
      <rect x="2" y="18" width="6" height="4" rx="1"/>
      <rect x="9" y="18" width="6" height="4" rx="1"/>
      <rect x="16" y="18" width="6" height="4" rx="1"/>
      <path d="M12 6v4"/>
      <path d="M5 14v4"/>
      <path d="M12 14v4"/>
      <path d="M19 14v4"/>
      <path d="M5 14h14"/>
      <path d="M12 10v4"/>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

// Tipos de cliente
const CLIENT_TYPES = {
  wholesaler: { label: 'Mayorista', color: '#9b59b6', level: 1 },
  distributor: { label: 'Distribuidor', color: '#3498db', level: 2 },
  partner: { label: 'Partner TI', color: '#2ecc71', level: 3 },
  business: { label: 'Cliente Empresarial', color: '#f39c12', level: 4 },
  enduser: { label: 'Cliente Final', color: '#95a5a6', level: 5 }
}

// Estados de tenant
const TENANT_STATUS = {
  active: { label: 'Activo', color: '#2ecc71' },
  trial: { label: 'Prueba', color: '#f39c12' },
  suspended: { label: 'Suspendido', color: '#e74c3c' },
  pending: { label: 'Pendiente', color: '#3498db' }
}

const AdminDashboard = () => {
  const { t } = useLanguage()

  // Estado principal
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: '30d'
  })

  // Datos del dashboard
  const [metrics, setMetrics] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalRevenue: 0,
    mrr: 0,
    totalExecutions: 0,
    activeAgents: 0,
    pendingPayments: 0,
    alerts: 0
  })

  const [tenants, setTenants] = useState([])
  const [activityFeed, setActivityFeed] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [hierarchyView, setHierarchyView] = useState([])

  // Cargar datos
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Simular carga de datos - en producción sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 800))

      // Métricas globales
      setMetrics({
        totalTenants: 156,
        activeTenants: 142,
        totalRevenue: 287450,
        mrr: 24580,
        totalExecutions: 1847293,
        activeAgents: 312,
        pendingPayments: 8,
        alerts: 3
      })

      // Lista de tenants
      setTenants([
        {
          id: 'T001',
          name: 'TechSolutions México',
          subdomain: 'techsolutions',
          type: 'wholesaler',
          status: 'active',
          plan: 'Enterprise',
          mrr: 4500,
          executions: 125000,
          agents: 25,
          children: 12,
          createdAt: '2024-06-15',
          lastActivity: '2025-12-28T10:30:00'
        },
        {
          id: 'T002',
          name: 'Automatiza Pro',
          subdomain: 'automatizapro',
          type: 'distributor',
          status: 'active',
          plan: 'Business',
          mrr: 2200,
          executions: 58000,
          agents: 15,
          children: 8,
          parentId: 'T001',
          createdAt: '2024-08-22',
          lastActivity: '2025-12-28T09:45:00'
        },
        {
          id: 'T003',
          name: 'Soluciones IT Express',
          subdomain: 'itexpress',
          type: 'partner',
          status: 'active',
          plan: 'Professional',
          mrr: 149,
          executions: 8500,
          agents: 5,
          children: 3,
          parentId: 'T002',
          createdAt: '2024-10-05',
          lastActivity: '2025-12-28T08:20:00'
        },
        {
          id: 'T004',
          name: 'Empresa Industrial ABC',
          subdomain: 'industrialabc',
          type: 'business',
          status: 'active',
          plan: 'Professional',
          mrr: 149,
          executions: 4200,
          agents: 3,
          children: 0,
          parentId: 'T003',
          createdAt: '2024-11-12',
          lastActivity: '2025-12-28T07:55:00'
        },
        {
          id: 'T005',
          name: 'Juan Pérez - Freelancer',
          subdomain: 'jperez',
          type: 'enduser',
          status: 'trial',
          plan: 'Starter',
          mrr: 0,
          executions: 250,
          agents: 1,
          children: 0,
          parentId: 'T004',
          createdAt: '2025-12-20',
          lastActivity: '2025-12-27T18:30:00'
        },
        {
          id: 'T006',
          name: 'Distribuidora Norte',
          subdomain: 'distnorte',
          type: 'distributor',
          status: 'active',
          plan: 'Business',
          mrr: 1800,
          executions: 42000,
          agents: 12,
          children: 5,
          parentId: 'T001',
          createdAt: '2024-09-10',
          lastActivity: '2025-12-28T10:15:00'
        },
        {
          id: 'T007',
          name: 'CloudOps LATAM',
          subdomain: 'cloudops',
          type: 'wholesaler',
          status: 'active',
          plan: 'Enterprise',
          mrr: 5200,
          executions: 180000,
          agents: 30,
          children: 18,
          createdAt: '2024-05-20',
          lastActivity: '2025-12-28T10:28:00'
        },
        {
          id: 'T008',
          name: 'Startup Innovate',
          subdomain: 'innovate',
          type: 'business',
          status: 'suspended',
          plan: 'Professional',
          mrr: 0,
          executions: 1200,
          agents: 2,
          children: 0,
          parentId: 'T006',
          suspendedReason: 'Pago pendiente > 30 días',
          createdAt: '2024-12-01',
          lastActivity: '2025-12-15T14:20:00'
        }
      ])

      // Feed de actividad
      setActivityFeed([
        {
          id: 1,
          type: 'execution',
          message: 'Workflow "Sync ERP" completado exitosamente',
          tenant: 'TechSolutions México',
          timestamp: '2025-12-28T10:30:00',
          status: 'success'
        },
        {
          id: 2,
          type: 'agent',
          message: 'MySQLAgent iniciado en puerto 4101',
          tenant: 'Automatiza Pro',
          timestamp: '2025-12-28T10:25:00',
          status: 'info'
        },
        {
          id: 3,
          type: 'billing',
          message: 'Pago recibido: $149.00 USD',
          tenant: 'Soluciones IT Express',
          timestamp: '2025-12-28T10:20:00',
          status: 'success'
        },
        {
          id: 4,
          type: 'alert',
          message: 'Límite de ejecuciones al 90%',
          tenant: 'Empresa Industrial ABC',
          timestamp: '2025-12-28T10:15:00',
          status: 'warning'
        },
        {
          id: 5,
          type: 'user',
          message: 'Nuevo usuario registrado: maria@empresa.com',
          tenant: 'CloudOps LATAM',
          timestamp: '2025-12-28T10:10:00',
          status: 'info'
        },
        {
          id: 6,
          type: 'execution',
          message: 'Workflow "Email Campaign" falló - Error de conexión SMTP',
          tenant: 'Distribuidora Norte',
          timestamp: '2025-12-28T10:05:00',
          status: 'error'
        }
      ])

      // Logs de auditoría
      setAuditLogs([
        {
          id: 1,
          action: 'tenant.suspend',
          actor: 'admin@alqvimia.com',
          target: 'Startup Innovate',
          details: 'Suspendido por falta de pago',
          ip: '192.168.1.100',
          timestamp: '2025-12-28T09:00:00'
        },
        {
          id: 2,
          action: 'config.update',
          actor: 'soporte@alqvimia.com',
          target: 'TechSolutions México',
          details: 'Límite de ejecuciones aumentado a 200,000',
          ip: '192.168.1.101',
          timestamp: '2025-12-28T08:30:00'
        },
        {
          id: 3,
          action: 'agent.install',
          actor: 'admin@techsolutions.com',
          target: 'PostgreSQLAgent',
          details: 'Instalación de nuevo agente',
          ip: '10.0.0.50',
          timestamp: '2025-12-28T08:00:00'
        }
      ])

      // Vista jerárquica
      setHierarchyView(buildHierarchy(tenants))

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Construir jerarquía de tenants
  const buildHierarchy = (tenantList) => {
    const map = {}
    const roots = []

    tenantList.forEach(t => {
      map[t.id] = { ...t, childNodes: [] }
    })

    tenantList.forEach(t => {
      if (t.parentId && map[t.parentId]) {
        map[t.parentId].childNodes.push(map[t.id])
      } else if (!t.parentId) {
        roots.push(map[t.id])
      }
    })

    return roots
  }

  // Filtrar tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = !searchQuery ||
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filters.type === 'all' || tenant.type === filters.type
    const matchesStatus = filters.status === 'all' || tenant.status === filters.status

    return matchesSearch && matchesType && matchesStatus
  })

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Formatear número
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-MX')
  }

  // Renderizar tarjeta de métrica
  const renderMetricCard = (icon, label, value, subvalue, trend, color) => (
    <div className="admin-metric-card" style={{ '--accent-color': color }}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
        {subvalue && <span className="metric-subvalue">{subvalue}</span>}
      </div>
      {trend && (
        <div className={`metric-trend ${trend.direction}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  )

  // Renderizar fila de tenant
  const renderTenantRow = (tenant) => (
    <tr key={tenant.id} className={`tenant-row ${tenant.status}`}>
      <td className="tenant-info">
        <div className="tenant-avatar" style={{ background: CLIENT_TYPES[tenant.type].color }}>
          {tenant.name.charAt(0)}
        </div>
        <div className="tenant-details">
          <span className="tenant-name">{tenant.name}</span>
          <span className="tenant-subdomain">{tenant.subdomain}.alqvimia.app</span>
        </div>
      </td>
      <td>
        <span className="type-badge" style={{ background: CLIENT_TYPES[tenant.type].color }}>
          {CLIENT_TYPES[tenant.type].label}
        </span>
      </td>
      <td>
        <span className="status-badge" style={{ background: TENANT_STATUS[tenant.status].color }}>
          {TENANT_STATUS[tenant.status].label}
        </span>
      </td>
      <td className="plan-cell">{tenant.plan}</td>
      <td className="mrr-cell">{formatCurrency(tenant.mrr)}</td>
      <td className="executions-cell">{formatNumber(tenant.executions)}</td>
      <td className="agents-cell">{tenant.agents}</td>
      <td className="activity-cell">{formatRelativeTime(tenant.lastActivity)}</td>
      <td className="actions-cell">
        <button
          className="action-btn view"
          title="Ver detalles"
          onClick={() => setSelectedTenant(tenant)}
        >
          {Icons.eye}
        </button>
        <button className="action-btn settings" title="Configurar">
          {Icons.settings}
        </button>
        {tenant.status === 'active' && (
          <button className="action-btn pause" title="Suspender">
            {Icons.pause}
          </button>
        )}
      </td>
    </tr>
  )

  // Renderizar nodo de jerarquía
  const renderHierarchyNode = (node, level = 0) => (
    <div key={node.id} className="hierarchy-node" style={{ '--level': level }}>
      <div
        className={`node-content ${node.status}`}
        style={{ borderLeftColor: CLIENT_TYPES[node.type].color }}
        onClick={() => setSelectedTenant(node)}
      >
        <div className="node-avatar" style={{ background: CLIENT_TYPES[node.type].color }}>
          {node.name.charAt(0)}
        </div>
        <div className="node-info">
          <span className="node-name">{node.name}</span>
          <span className="node-type">{CLIENT_TYPES[node.type].label}</span>
        </div>
        <div className="node-metrics">
          <span className="node-mrr">{formatCurrency(node.mrr)}/mes</span>
          <span className="node-children">{node.children} sub-clientes</span>
        </div>
        <span className="node-status" style={{ background: TENANT_STATUS[node.status].color }}>
          {TENANT_STATUS[node.status].label}
        </span>
      </div>
      {node.childNodes && node.childNodes.length > 0 && (
        <div className="node-children">
          {node.childNodes.map(child => renderHierarchyNode(child, level + 1))}
        </div>
      )}
    </div>
  )

  // Renderizar item de actividad
  const renderActivityItem = (item) => {
    const statusColors = {
      success: '#2ecc71',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    }

    const typeIcons = {
      execution: Icons.executions,
      agent: Icons.agents,
      billing: Icons.billing,
      alert: Icons.alert,
      user: Icons.users
    }

    return (
      <div key={item.id} className={`activity-item ${item.status}`}>
        <div className="activity-icon" style={{ color: statusColors[item.status] }}>
          {typeIcons[item.type] || Icons.activity}
        </div>
        <div className="activity-content">
          <span className="activity-message">{item.message}</span>
          <span className="activity-tenant">{item.tenant}</span>
        </div>
        <span className="activity-time">{formatRelativeTime(item.timestamp)}</span>
      </div>
    )
  }

  // Renderizar modal de detalles de tenant
  const renderTenantModal = () => {
    if (!selectedTenant) return null

    return (
      <div className="tenant-modal-overlay" onClick={() => setSelectedTenant(null)}>
        <div className="tenant-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              <div
                className="modal-avatar"
                style={{ background: CLIENT_TYPES[selectedTenant.type].color }}
              >
                {selectedTenant.name.charAt(0)}
              </div>
              <div>
                <h2>{selectedTenant.name}</h2>
                <span className="modal-subdomain">
                  {selectedTenant.subdomain}.alqvimia.app
                </span>
              </div>
            </div>
            <button className="modal-close" onClick={() => setSelectedTenant(null)}>
              ×
            </button>
          </div>

          <div className="modal-content">
            <div className="modal-section">
              <h3>Información General</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Tipo</span>
                  <span
                    className="info-value type-badge"
                    style={{ background: CLIENT_TYPES[selectedTenant.type].color }}
                  >
                    {CLIENT_TYPES[selectedTenant.type].label}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado</span>
                  <span
                    className="info-value status-badge"
                    style={{ background: TENANT_STATUS[selectedTenant.status].color }}
                  >
                    {TENANT_STATUS[selectedTenant.status].label}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Plan</span>
                  <span className="info-value">{selectedTenant.plan}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Desde</span>
                  <span className="info-value">
                    {new Date(selectedTenant.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Métricas</h3>
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-icon">{Icons.revenue}</span>
                  <span className="metric-value">{formatCurrency(selectedTenant.mrr)}</span>
                  <span className="metric-label">MRR</span>
                </div>
                <div className="metric-box">
                  <span className="metric-icon">{Icons.executions}</span>
                  <span className="metric-value">{formatNumber(selectedTenant.executions)}</span>
                  <span className="metric-label">Ejecuciones</span>
                </div>
                <div className="metric-box">
                  <span className="metric-icon">{Icons.agents}</span>
                  <span className="metric-value">{selectedTenant.agents}</span>
                  <span className="metric-label">Agentes</span>
                </div>
                <div className="metric-box">
                  <span className="metric-icon">{Icons.hierarchy}</span>
                  <span className="metric-value">{selectedTenant.children}</span>
                  <span className="metric-label">Sub-clientes</span>
                </div>
              </div>
            </div>

            {selectedTenant.suspendedReason && (
              <div className="modal-section alert">
                <h3>Razón de Suspensión</h3>
                <p>{selectedTenant.suspendedReason}</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-primary">
                {Icons.eye} Ver Portal
              </button>
              <button className="btn-secondary">
                {Icons.settings} Configurar
              </button>
              <button className="btn-secondary">
                {Icons.billing} Facturación
              </button>
              {selectedTenant.status === 'active' ? (
                <button className="btn-danger">
                  {Icons.pause} Suspender
                </button>
              ) : (
                <button className="btn-success">
                  {Icons.check} Reactivar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Panel de Administración</h1>
          <span className="header-subtitle">ALQVIMIA RPA 2.0</span>
        </div>
        <div className="header-right">
          <button className="btn-icon" onClick={loadDashboardData} title="Actualizar">
            {Icons.refresh}
          </button>
          <button className="btn-icon" title="Exportar">
            {Icons.download}
          </button>
          {metrics.alerts > 0 && (
            <button className="btn-icon alert-btn">
              {Icons.alert}
              <span className="alert-badge">{metrics.alerts}</span>
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        {[
          { id: 'overview', label: 'Resumen' },
          { id: 'tenants', label: 'Clientes' },
          { id: 'hierarchy', label: 'Jerarquía' },
          { id: 'activity', label: 'Actividad' },
          { id: 'audit', label: 'Auditoría' },
          { id: 'billing', label: 'Facturación' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Métricas principales */}
            <section className="metrics-section">
              <div className="metrics-grid-main">
                {renderMetricCard(
                  Icons.users,
                  'Clientes Activos',
                  metrics.activeTenants,
                  `${metrics.totalTenants} total`,
                  { direction: 'up', value: 12 },
                  '#3498db'
                )}
                {renderMetricCard(
                  Icons.revenue,
                  'MRR',
                  formatCurrency(metrics.mrr),
                  `${formatCurrency(metrics.totalRevenue)} total`,
                  { direction: 'up', value: 8 },
                  '#2ecc71'
                )}
                {renderMetricCard(
                  Icons.executions,
                  'Ejecuciones',
                  formatNumber(metrics.totalExecutions),
                  'Este mes',
                  { direction: 'up', value: 23 },
                  '#9b59b6'
                )}
                {renderMetricCard(
                  Icons.agents,
                  'Agentes Activos',
                  metrics.activeAgents,
                  'En toda la plataforma',
                  null,
                  '#f39c12'
                )}
              </div>
            </section>

            {/* Distribución por tipo */}
            <section className="distribution-section">
              <h2>Distribución de Clientes</h2>
              <div className="distribution-grid">
                {Object.entries(CLIENT_TYPES).map(([key, type]) => {
                  const count = tenants.filter(t => t.type === key).length
                  const percentage = Math.round((count / tenants.length) * 100) || 0
                  return (
                    <div key={key} className="distribution-card" style={{ '--type-color': type.color }}>
                      <div className="distribution-bar" style={{ width: `${percentage}%` }}></div>
                      <div className="distribution-content">
                        <span className="distribution-label">{type.label}</span>
                        <span className="distribution-count">{count}</span>
                        <span className="distribution-percent">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Actividad reciente y alertas */}
            <div className="overview-split">
              <section className="activity-preview">
                <h2>Actividad Reciente</h2>
                <div className="activity-list">
                  {activityFeed.slice(0, 5).map(renderActivityItem)}
                </div>
                <button
                  className="btn-link"
                  onClick={() => setActiveTab('activity')}
                >
                  Ver toda la actividad →
                </button>
              </section>

              <section className="alerts-preview">
                <h2>Alertas ({metrics.alerts})</h2>
                <div className="alerts-list">
                  {activityFeed
                    .filter(a => a.status === 'warning' || a.status === 'error')
                    .map(renderActivityItem)
                  }
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="tenants-tab">
            {/* Toolbar */}
            <div className="tenants-toolbar">
              <div className="search-box">
                {Icons.search}
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters">
                <select
                  value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(CLIENT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">Todos los estados</option>
                  {Object.entries(TENANT_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
              </div>

              <button className="btn-primary">
                + Nuevo Cliente
              </button>
            </div>

            {/* Tabla */}
            <div className="tenants-table-container">
              <table className="tenants-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Plan</th>
                    <th>MRR</th>
                    <th>Ejecuciones</th>
                    <th>Agentes</th>
                    <th>Última Actividad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(renderTenantRow)}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="table-footer">
              <span className="results-count">
                Mostrando {filteredTenants.length} de {tenants.length} clientes
              </span>
              <div className="pagination">
                <button className="page-btn" disabled>← Anterior</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">Siguiente →</button>
              </div>
            </div>
          </div>
        )}

        {/* Hierarchy Tab */}
        {activeTab === 'hierarchy' && (
          <div className="hierarchy-tab">
            <div className="hierarchy-header">
              <h2>Vista Jerárquica de Clientes</h2>
              <p>Visualiza la estructura de mayoristas, distribuidores y clientes</p>
            </div>
            <div className="hierarchy-tree">
              {hierarchyView.length > 0 ? (
                hierarchyView.map(node => renderHierarchyNode(node))
              ) : (
                <div className="empty-state">
                  <p>No hay datos de jerarquía disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <div className="activity-header">
              <h2>Feed de Actividad en Tiempo Real</h2>
              <div className="activity-filters">
                <select>
                  <option value="all">Todos los eventos</option>
                  <option value="execution">Ejecuciones</option>
                  <option value="agent">Agentes</option>
                  <option value="billing">Facturación</option>
                  <option value="alert">Alertas</option>
                </select>
                <select>
                  <option value="all">Todos los clientes</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="activity-feed-full">
              {activityFeed.map(renderActivityItem)}
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="audit-tab">
            <div className="audit-header">
              <h2>Logs de Auditoría</h2>
              <div className="audit-filters">
                <input
                  type="date"
                  className="date-input"
                />
                <span>a</span>
                <input
                  type="date"
                  className="date-input"
                />
                <button className="btn-secondary">Filtrar</button>
                <button className="btn-secondary">
                  {Icons.download} Exportar
                </button>
              </div>
            </div>
            <div className="audit-table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Acción</th>
                    <th>Actor</th>
                    <th>Objetivo</th>
                    <th>Detalles</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString('es-MX')}</td>
                      <td>
                        <span className={`action-badge ${log.action.split('.')[0]}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.actor}</td>
                      <td>{log.target}</td>
                      <td>{log.details}</td>
                      <td className="ip-cell">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="billing-tab">
            <div className="billing-header">
              <h2>Facturación y Cobros</h2>
            </div>

            <div className="billing-summary">
              <div className="billing-card">
                <h3>Este Mes</h3>
                <div className="billing-amount">{formatCurrency(metrics.mrr)}</div>
                <span className="billing-label">Ingresos Recurrentes</span>
              </div>
              <div className="billing-card">
                <h3>Pendiente</h3>
                <div className="billing-amount warning">{formatCurrency(2350)}</div>
                <span className="billing-label">{metrics.pendingPayments} facturas</span>
              </div>
              <div className="billing-card">
                <h3>Comisiones</h3>
                <div className="billing-amount">{formatCurrency(4820)}</div>
                <span className="billing-label">A pagar a partners</span>
              </div>
            </div>

            <div className="billing-sections">
              <section className="pending-invoices">
                <h3>Facturas Pendientes</h3>
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Monto</th>
                      <th>Vencimiento</th>
                      <th>Días</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Startup Innovate</td>
                      <td>{formatCurrency(149)}</td>
                      <td>2025-11-28</td>
                      <td className="overdue">30</td>
                      <td>
                        <button className="btn-sm">Recordar</button>
                        <button className="btn-sm danger">Suspender</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="commission-summary">
                <h3>Comisiones por Tipo</h3>
                <div className="commission-list">
                  <div className="commission-row">
                    <span>Mayoristas (40%)</span>
                    <span className="commission-amount">{formatCurrency(2800)}</span>
                  </div>
                  <div className="commission-row">
                    <span>Distribuidores (25%)</span>
                    <span className="commission-amount">{formatCurrency(1520)}</span>
                  </div>
                  <div className="commission-row">
                    <span>Partners (15%)</span>
                    <span className="commission-amount">{formatCurrency(500)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modal de tenant */}
      {renderTenantModal()}
    </div>
  )
}

export default AdminDashboard
