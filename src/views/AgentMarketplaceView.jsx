/**
 * ALQVIMIA RPA 2.0 - Agent Marketplace View
 * Vista principal para la gestión del marketplace de agentes modulares
 */

import { useState } from 'react'
import AgentMarketplace from '../components/agents/AgentMarketplace'
import '../assets/css/agent-marketplace.css'

function AgentMarketplaceView() {
  const [showMarketplace, setShowMarketplace] = useState(false)

  return (
    <div className="view" id="marketplace-view">
      <div className="view-header">
        <h2><i className="fas fa-store"></i> Agent Marketplace</h2>
        <p>Centro de descarga, instalación y gestión de agentes modulares autónomos</p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="fas fa-cubes" style={{ fontSize: '2rem', opacity: 0.8 }}></i>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>24</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Agentes Disponibles</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="fas fa-download" style={{ fontSize: '2rem', opacity: 0.8 }}></i>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>12</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Instalados</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="fas fa-play-circle" style={{ fontSize: '2rem', opacity: 0.8 }}></i>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>8</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>En Ejecución</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="fas fa-network-wired" style={{ fontSize: '2rem', opacity: 0.8 }}></i>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>6</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Conectados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Open Marketplace */}
        <div
          onClick={() => setShowMarketplace(true)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#6366f1'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <i className="fas fa-store" style={{ fontSize: '2.5rem', color: 'white' }}></i>
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Abrir Marketplace</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explora, descarga e instala nuevos agentes
          </p>
        </div>

        {/* Orchestrator Dashboard */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#10b981'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <i className="fas fa-sitemap" style={{ fontSize: '2.5rem', color: 'white' }}></i>
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Orquestador</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestiona la comunicación entre agentes
          </p>
        </div>

        {/* Agent Builder */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#f59e0b'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <i className="fas fa-hammer" style={{ fontSize: '2.5rem', color: 'white' }}></i>
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Crear Agente</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Crea tus propios agentes personalizados
          </p>
        </div>
      </div>

      {/* Categories */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        <i className="fas fa-th-large"></i> Categorías de Agentes
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { name: 'Bases de Datos', icon: 'fa-database', color: '#4479A1', count: 3 },
          { name: 'APIs & Integraciones', icon: 'fa-plug', color: '#FF6B6B', count: 4 },
          { name: 'Mensajería', icon: 'fa-comments', color: '#25D366', count: 4 },
          { name: 'IA & Machine Learning', icon: 'fa-brain', color: '#412991', count: 3 },
          { name: 'Automatización', icon: 'fa-robot', color: '#F59E0B', count: 3 },
          { name: 'Almacenamiento', icon: 'fa-hdd', color: '#FF9900', count: 2 },
          { name: 'Monitoreo', icon: 'fa-chart-line', color: '#06B6D4', count: 2 },
          { name: 'Seguridad', icon: 'fa-shield-alt', color: '#EF4444', count: 3 }
        ].map(cat => (
          <div
            key={cat.name}
            onClick={() => setShowMarketplace(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = cat.color
              e.currentTarget.style.background = `${cat.color}15`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.background = 'var(--bg-secondary)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: cat.color,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className={`fas ${cat.icon}`} style={{ color: 'white', fontSize: '1.25rem' }}></i>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cat.name}</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cat.count} agentes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Running Agents */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        <i className="fas fa-play-circle" style={{ color: '#10b981' }}></i> Agentes en Ejecución
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {[
          { name: 'MySQL Agent', port: 4101, status: 'healthy', memory: '45 MB', cpu: '2%', color: '#4479A1' },
          { name: 'REST API Agent', port: 4201, status: 'healthy', memory: '32 MB', cpu: '1%', color: '#FF6B6B' },
          { name: 'WhatsApp Agent', port: 4301, status: 'healthy', memory: '68 MB', cpu: '3%', color: '#25D366' },
          { name: 'OpenAI GPT Agent', port: 4401, status: 'healthy', memory: '52 MB', cpu: '4%', color: '#412991' },
          { name: 'Task Scheduler Agent', port: 4501, status: 'healthy', memory: '28 MB', cpu: '1%', color: '#F59E0B' },
          { name: 'Workflow Engine Agent', port: 4502, status: 'healthy', memory: '85 MB', cpu: '5%', color: '#EC4899' }
        ].map(agent => (
          <div
            key={agent.name}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10b981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10b981'
            }}></div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{agent.name}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span>:{agent.port}</span>
                <span>{agent.memory}</span>
                <span>CPU {agent.cpu}</span>
              </div>
            </div>
            <button style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}>
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Marketplace Modal */}
      {showMarketplace && (
        <AgentMarketplace onClose={() => setShowMarketplace(false)} />
      )}
    </div>
  )
}

export default AgentMarketplaceView
