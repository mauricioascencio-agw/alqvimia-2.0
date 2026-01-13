/**
 * ALQVIMIA RPA 2.0 - Messaging Hub
 * Centro de mensajería unificado - Todos los canales en un solo lugar
 */

import { useState, useRef, useEffect } from 'react'

function MessagingHub({ connector, onClose, onOpenConfig }) {
  // Estado principal
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)

  // Estado de filtros avanzados
  const [filterStatus, setFilterStatus] = useState('all') // all, unread, starred, archived
  const [filterPlatform, setFilterPlatform] = useState('all')

  // Estado de modales
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)

  // Refs
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  // Plataformas de mensajería
  const platforms = {
    whatsapp: { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', brand: true },
    telegram: { name: 'Telegram', icon: 'fa-telegram', color: '#0088CC', brand: true },
    slack: { name: 'Slack', icon: 'fa-slack', color: '#4A154B', brand: true },
    teams: { name: 'Teams', icon: 'fa-microsoft', color: '#6264A7', brand: true },
    discord: { name: 'Discord', icon: 'fa-discord', color: '#5865F2', brand: true },
    sms: { name: 'SMS', icon: 'fa-sms', color: '#F22F46', brand: false },
    email: { name: 'Email', icon: 'fa-envelope', color: '#1A82E2', brand: false }
  }

  // Datos de ejemplo - Conversaciones
  const [conversations, setConversations] = useState([
    {
      id: 1,
      contact: { name: 'María García', avatar: null, phone: '+52 55 1234 5678', email: 'maria@empresa.com' },
      platform: 'whatsapp',
      lastMessage: 'Perfecto, entonces quedamos para mañana a las 10am',
      timestamp: '10:32',
      unread: 2,
      starred: true,
      status: 'active',
      tags: ['cliente', 'ventas']
    },
    {
      id: 2,
      contact: { name: 'Carlos López', avatar: null, phone: '+52 55 9876 5432' },
      platform: 'telegram',
      lastMessage: '¿Ya está listo el reporte?',
      timestamp: '09:45',
      unread: 0,
      starred: false,
      status: 'active',
      tags: ['equipo']
    },
    {
      id: 3,
      contact: { name: '#ventas-latam', avatar: null, isChannel: true },
      platform: 'slack',
      lastMessage: 'John: Cerré el deal con Acme Corp! 🎉',
      timestamp: 'Ayer',
      unread: 15,
      starred: true,
      status: 'active',
      tags: ['canal']
    },
    {
      id: 4,
      contact: { name: 'Soporte Técnico', avatar: null, isChannel: true },
      platform: 'teams',
      lastMessage: 'Ana: El ticket #4521 fue resuelto',
      timestamp: 'Ayer',
      unread: 0,
      starred: false,
      status: 'active',
      tags: ['soporte']
    },
    {
      id: 5,
      contact: { name: 'Pedro Martínez', avatar: null, phone: '+1 555 123 4567' },
      platform: 'sms',
      lastMessage: 'Recibido, gracias!',
      timestamp: 'Lun',
      unread: 0,
      starred: false,
      status: 'archived',
      tags: []
    },
    {
      id: 6,
      contact: { name: 'Laura Sánchez', avatar: null, email: 'laura@cliente.com' },
      platform: 'email',
      lastMessage: 'Re: Propuesta comercial Q1 2025',
      timestamp: '15 Dic',
      unread: 1,
      starred: true,
      status: 'active',
      tags: ['cliente', 'propuesta']
    },
    {
      id: 7,
      contact: { name: 'Gaming Server', avatar: null, isChannel: true },
      platform: 'discord',
      lastMessage: 'Bot: Nuevo usuario se unió al servidor',
      timestamp: '14 Dic',
      unread: 42,
      starred: false,
      status: 'active',
      tags: []
    },
    {
      id: 8,
      contact: { name: 'Roberto Díaz', avatar: null, phone: '+52 33 4567 8901' },
      platform: 'whatsapp',
      lastMessage: 'Enviaste una imagen',
      timestamp: '12 Dic',
      unread: 0,
      starred: false,
      status: 'active',
      tags: ['proveedor']
    }
  ])

  // Mensajes de la conversación seleccionada
  const [messages, setMessages] = useState({
    1: [
      { id: 1, type: 'received', text: 'Hola, buenos días! Quería confirmar nuestra reunión', time: '10:15', status: 'read' },
      { id: 2, type: 'sent', text: 'Buenos días María! Sí, está confirmada para mañana', time: '10:20', status: 'delivered' },
      { id: 3, type: 'received', text: '¿A qué hora sería?', time: '10:25', status: 'read' },
      { id: 4, type: 'sent', text: 'Te propongo a las 10am, ¿te funciona?', time: '10:28', status: 'delivered' },
      { id: 5, type: 'received', text: 'Perfecto, entonces quedamos para mañana a las 10am', time: '10:32', status: 'read' }
    ],
    3: [
      { id: 1, type: 'received', sender: 'Ana M.', text: 'El cliente de Brasil confirmó el pedido', time: '09:00', status: 'read' },
      { id: 2, type: 'received', sender: 'Carlos', text: 'Excelente! Yo tengo la llamada con Chile en 1 hora', time: '09:15', status: 'read' },
      { id: 3, type: 'sent', text: 'Perfecto equipo, vamos muy bien este mes!', time: '09:30', status: 'delivered' },
      { id: 4, type: 'received', sender: 'John', text: 'Cerré el deal con Acme Corp! 🎉', time: 'Ayer', status: 'read' }
    ]
  })

  // Templates de respuesta rápida
  const templates = [
    { id: 1, name: 'Saludo', text: 'Hola! Gracias por contactarnos. ¿En qué puedo ayudarte?' },
    { id: 2, name: 'Confirmación', text: 'Perfecto, queda confirmado. Te enviaremos los detalles por correo.' },
    { id: 3, name: 'Seguimiento', text: 'Hola! Solo quería dar seguimiento a nuestra conversación anterior. ¿Tienes alguna duda?' },
    { id: 4, name: 'Despedida', text: 'Gracias por tu tiempo. Quedamos pendientes. ¡Que tengas un excelente día!' },
    { id: 5, name: 'Fuera de horario', text: 'Gracias por tu mensaje. Nuestro horario de atención es de 9am a 6pm. Te responderemos a la brevedad.' },
    { id: 6, name: 'Solicitar info', text: '¿Podrías proporcionarme más información sobre tu solicitud para poder ayudarte mejor?' }
  ]

  // Agentes del equipo
  const agents = [
    { id: 1, name: 'Juan Pérez', avatar: null, status: 'online', conversations: 5 },
    { id: 2, name: 'Ana García', avatar: null, status: 'online', conversations: 3 },
    { id: 3, name: 'Carlos Ruiz', avatar: null, status: 'busy', conversations: 8 },
    { id: 4, name: 'María López', avatar: null, status: 'offline', conversations: 0 }
  ]

  // Tags disponibles
  const availableTags = [
    { id: 1, name: 'cliente', color: '#3b82f6' },
    { id: 2, name: 'ventas', color: '#10b981' },
    { id: 3, name: 'soporte', color: '#f59e0b' },
    { id: 4, name: 'urgente', color: '#ef4444' },
    { id: 5, name: 'equipo', color: '#8b5cf6' },
    { id: 6, name: 'proveedor', color: '#6b7280' },
    { id: 7, name: 'propuesta', color: '#ec4899' }
  ]

  // Estadísticas
  const stats = {
    total: conversations.length,
    unread: conversations.reduce((acc, c) => acc + c.unread, 0),
    starred: conversations.filter(c => c.starred).length,
    today: conversations.filter(c => c.timestamp.includes(':') || c.timestamp === 'Ayer').length
  }

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation, messages])

  // Filtrar conversaciones
  const getFilteredConversations = () => {
    let result = [...conversations]

    // Filtrar por plataforma
    if (filterPlatform !== 'all') {
      result = result.filter(c => c.platform === filterPlatform)
    }

    // Filtrar por estado
    if (filterStatus === 'unread') {
      result = result.filter(c => c.unread > 0)
    } else if (filterStatus === 'starred') {
      result = result.filter(c => c.starred)
    } else if (filterStatus === 'archived') {
      result = result.filter(c => c.status === 'archived')
    } else {
      result = result.filter(c => c.status !== 'archived')
    }

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(c =>
        c.contact.name.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term) ||
        c.tags.some(t => t.toLowerCase().includes(term))
      )
    }

    // Ordenar por timestamp (más reciente primero)
    result.sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1
      if (a.unread === 0 && b.unread > 0) return 1
      return 0
    })

    return result
  }

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  // Obtener color de avatar basado en nombre
  const getAvatarColor = (name) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Seleccionar conversación
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation)
    // Marcar como leído
    setConversations(prev => prev.map(c =>
      c.id === conversation.id ? { ...c, unread: 0 } : c
    ))
  }

  // Enviar mensaje
  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return

    const newMessage = {
      id: Date.now(),
      type: 'sent',
      text: messageText.trim(),
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    }

    // Agregar mensaje
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
    }))

    // Actualizar última mensaje en conversación
    setConversations(prev => prev.map(c =>
      c.id === selectedConversation.id
        ? { ...c, lastMessage: messageText.trim(), timestamp: newMessage.time }
        : c
    ))

    setMessageText('')

    // Simular estado de enviado
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedConversation.id]: prev[selectedConversation.id].map(m =>
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        )
      }))
    }, 1000)
  }

  // Toggle starred
  const toggleStarred = (conversationId) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, starred: !c.starred } : c
    ))
  }

  // Archivar conversación
  const archiveConversation = (conversationId) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: c.status === 'archived' ? 'active' : 'archived' } : c
    ))
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  // Usar template
  const useTemplate = (template) => {
    setMessageText(template.text)
    setShowTemplatesModal(false)
    messageInputRef.current?.focus()
  }

  // Renderizar icono de plataforma
  const PlatformIcon = ({ platform, size = '1rem' }) => {
    const p = platforms[platform]
    if (!p) return null
    return (
      <i
        className={`${p.brand ? 'fab' : 'fas'} ${p.icon}`}
        style={{ color: p.color, fontSize: size }}
        title={p.name}
      ></i>
    )
  }

  // Renderizar estado del mensaje
  const MessageStatus = ({ status }) => {
    const icons = {
      sending: 'fa-clock',
      sent: 'fa-check',
      delivered: 'fa-check-double',
      read: 'fa-check-double'
    }
    const colors = {
      sending: 'var(--text-muted)',
      sent: 'var(--text-muted)',
      delivered: 'var(--text-muted)',
      read: '#3b82f6'
    }
    return (
      <i className={`fas ${icons[status]}`} style={{ color: colors[status], fontSize: '0.7rem' }}></i>
    )
  }

  return (
    <div className="messaging-hub-overlay">
      <div className="messaging-hub">
        {/* Sidebar - Lista de conversaciones */}
        <div className="messaging-sidebar">
          {/* Header */}
          <div className="sidebar-header">
            <div className="header-title">
              <div className="connector-badge" style={{ background: connector.color }}>
                <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
              </div>
              <div>
                <h2>Mensajes</h2>
                <span className="message-count">{stats.unread} sin leer</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-icon" onClick={() => setShowNewMessageModal(true)} title="Nuevo mensaje">
                <i className="fas fa-edit"></i>
              </button>
              <button className="btn-icon" onClick={onClose} title="Cerrar">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button
              className={`btn-icon filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter"></i>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="sidebar-filters">
              <div className="filter-group">
                <label>Estado</label>
                <div className="filter-pills">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'unread', label: 'Sin leer' },
                    { id: 'starred', label: 'Destacados' },
                    { id: 'archived', label: 'Archivados' }
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`filter-pill ${filterStatus === f.id ? 'active' : ''}`}
                      onClick={() => setFilterStatus(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Plataforma</label>
                <div className="filter-pills platforms">
                  <button
                    className={`filter-pill ${filterPlatform === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterPlatform('all')}
                  >
                    Todas
                  </button>
                  {Object.entries(platforms).map(([key, p]) => (
                    <button
                      key={key}
                      className={`filter-pill platform ${filterPlatform === key ? 'active' : ''}`}
                      onClick={() => setFilterPlatform(key)}
                      style={{ '--platform-color': p.color }}
                    >
                      <i className={`${p.brand ? 'fab' : 'fas'} ${p.icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-value">{stats.unread}</span>
              <span className="stat-label">Sin leer</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.starred}</span>
              <span className="stat-label">Destacados</span>
            </div>
          </div>

          {/* Conversations List */}
          <div className="conversations-list">
            {getFilteredConversations().length === 0 ? (
              <div className="empty-conversations">
                <i className="fas fa-inbox"></i>
                <p>No hay conversaciones</p>
              </div>
            ) : (
              getFilteredConversations().map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread > 0 ? 'unread' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conversation-avatar" style={{ background: getAvatarColor(conv.contact.name) }}>
                    {conv.contact.isChannel ? (
                      <i className="fas fa-hashtag"></i>
                    ) : (
                      <span>{getInitials(conv.contact.name)}</span>
                    )}
                    <div className="platform-indicator">
                      <PlatformIcon platform={conv.platform} size="0.65rem" />
                    </div>
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">{conv.contact.name}</span>
                      <span className="conversation-time">{conv.timestamp}</span>
                    </div>
                    <div className="conversation-preview">
                      <span className="preview-text">{conv.lastMessage}</span>
                      <div className="conversation-badges">
                        {conv.starred && <i className="fas fa-star starred"></i>}
                        {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                      </div>
                    </div>
                    {conv.tags.length > 0 && (
                      <div className="conversation-tags">
                        {conv.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="tag"
                            style={{ background: availableTags.find(t => t.name === tag)?.color || '#6b7280' }}
                          >
                            {tag}
                          </span>
                        ))}
                        {conv.tags.length > 2 && (
                          <span className="tag more">+{conv.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="messaging-main">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-contact">
                  <div className="contact-avatar" style={{ background: getAvatarColor(selectedConversation.contact.name) }}>
                    {selectedConversation.contact.isChannel ? (
                      <i className="fas fa-hashtag"></i>
                    ) : (
                      <span>{getInitials(selectedConversation.contact.name)}</span>
                    )}
                  </div>
                  <div className="contact-info">
                    <h3>{selectedConversation.contact.name}</h3>
                    <div className="contact-meta">
                      <PlatformIcon platform={selectedConversation.platform} />
                      <span>{platforms[selectedConversation.platform]?.name}</span>
                      {selectedConversation.contact.phone && (
                        <span className="separator">•</span>
                      )}
                      {selectedConversation.contact.phone && (
                        <span>{selectedConversation.contact.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    className={`btn-icon ${selectedConversation.starred ? 'active' : ''}`}
                    onClick={() => toggleStarred(selectedConversation.id)}
                    title={selectedConversation.starred ? 'Quitar de destacados' : 'Destacar'}
                  >
                    <i className={`${selectedConversation.starred ? 'fas' : 'far'} fa-star`}></i>
                  </button>
                  <button className="btn-icon" onClick={() => setShowTagsModal(true)} title="Etiquetas">
                    <i className="fas fa-tags"></i>
                  </button>
                  <button className="btn-icon" onClick={() => setShowAssignModal(true)} title="Asignar">
                    <i className="fas fa-user-plus"></i>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => archiveConversation(selectedConversation.id)}
                    title={selectedConversation.status === 'archived' ? 'Desarchivar' : 'Archivar'}
                  >
                    <i className="fas fa-archive"></i>
                  </button>
                  <button
                    className={`btn-icon ${showContactInfo ? 'active' : ''}`}
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    title="Info del contacto"
                  >
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="chat-messages">
                <div className="messages-container">
                  {/* Date separator */}
                  <div className="date-separator">
                    <span>Hoy</span>
                  </div>

                  {(messages[selectedConversation.id] || []).map(msg => (
                    <div key={msg.id} className={`message ${msg.type}`}>
                      {msg.sender && (
                        <div className="message-sender">{msg.sender}</div>
                      )}
                      <div className="message-bubble">
                        <p>{msg.text}</p>
                        <div className="message-meta">
                          <span className="message-time">{msg.time}</span>
                          {msg.type === 'sent' && <MessageStatus status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="chat-input">
                <div className="input-actions">
                  <button className="btn-icon" title="Adjuntar archivo">
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <button className="btn-icon" title="Emoji">
                    <i className="far fa-smile"></i>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setShowTemplatesModal(true)}
                    title="Respuestas rápidas"
                  >
                    <i className="fas fa-bolt"></i>
                  </button>
                </div>
                <div className="input-wrapper">
                  <textarea
                    ref={messageInputRef}
                    placeholder="Escribe un mensaje..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    rows={1}
                  />
                </div>
                <button
                  className="btn-send"
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-content">
                <i className="fas fa-comments"></i>
                <h3>Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para ver los mensajes</p>
                <button className="btn btn-primary" onClick={() => setShowNewMessageModal(true)}>
                  <i className="fas fa-plus"></i> Nuevo mensaje
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info Panel */}
        {showContactInfo && selectedConversation && (
          <div className="contact-panel">
            <div className="panel-header">
              <h3>Información</h3>
              <button className="btn-icon" onClick={() => setShowContactInfo(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="panel-content">
              {/* Contact Card */}
              <div className="contact-card">
                <div className="contact-avatar large" style={{ background: getAvatarColor(selectedConversation.contact.name) }}>
                  {selectedConversation.contact.isChannel ? (
                    <i className="fas fa-hashtag"></i>
                  ) : (
                    <span>{getInitials(selectedConversation.contact.name)}</span>
                  )}
                </div>
                <h4>{selectedConversation.contact.name}</h4>
                <div className="platform-badge" style={{ background: platforms[selectedConversation.platform]?.color }}>
                  <PlatformIcon platform={selectedConversation.platform} size="0.8rem" />
                  <span>{platforms[selectedConversation.platform]?.name}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="contact-details">
                {selectedConversation.contact.phone && (
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <label>Teléfono</label>
                      <span>{selectedConversation.contact.phone}</span>
                    </div>
                  </div>
                )}
                {selectedConversation.contact.email && (
                  <div className="detail-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <label>Email</label>
                      <span>{selectedConversation.contact.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="contact-section">
                <h5>Etiquetas</h5>
                <div className="tags-list">
                  {selectedConversation.tags.map(tag => (
                    <span
                      key={tag}
                      className="tag"
                      style={{ background: availableTags.find(t => t.name === tag)?.color || '#6b7280' }}
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="add-tag-btn" onClick={() => setShowTagsModal(true)}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="contact-section">
                <h5>Acciones rápidas</h5>
                <div className="quick-actions">
                  <button className="quick-action">
                    <i className="fas fa-phone"></i>
                    <span>Llamar</span>
                  </button>
                  <button className="quick-action">
                    <i className="fas fa-video"></i>
                    <span>Videollamada</span>
                  </button>
                  <button className="quick-action">
                    <i className="fas fa-calendar"></i>
                    <span>Agendar</span>
                  </button>
                  <button className="quick-action">
                    <i className="fas fa-file-alt"></i>
                    <span>Crear ticket</span>
                  </button>
                </div>
              </div>

              {/* Media */}
              <div className="contact-section">
                <h5>Archivos compartidos</h5>
                <div className="shared-media">
                  <div className="media-placeholder">
                    <i className="fas fa-images"></i>
                    <span>No hay archivos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplatesModal && (
          <div className="modal-overlay" onClick={() => setShowTemplatesModal(false)}>
            <div className="modal-content templates-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-bolt"></i> Respuestas rápidas</h3>
                <button className="close-modal" onClick={() => setShowTemplatesModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="templates-list">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="template-item"
                      onClick={() => useTemplate(template)}
                    >
                      <div className="template-name">{template.name}</div>
                      <div className="template-text">{template.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowTemplatesModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i> Crear plantilla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal-content assign-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-user-plus"></i> Asignar conversación</h3>
                <button className="close-modal" onClick={() => setShowAssignModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="agents-list">
                  {agents.map(agent => (
                    <div key={agent.id} className="agent-item">
                      <div className="agent-avatar" style={{ background: getAvatarColor(agent.name) }}>
                        {getInitials(agent.name)}
                        <span className={`status-dot ${agent.status}`}></span>
                      </div>
                      <div className="agent-info">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-meta">
                          {agent.conversations} conversaciones activas
                        </span>
                      </div>
                      <button className="btn btn-sm btn-secondary">
                        Asignar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tags Modal */}
        {showTagsModal && (
          <div className="modal-overlay" onClick={() => setShowTagsModal(false)}>
            <div className="modal-content tags-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-tags"></i> Gestionar etiquetas</h3>
                <button className="close-modal" onClick={() => setShowTagsModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="tags-grid">
                  {availableTags.map(tag => {
                    const isSelected = selectedConversation?.tags.includes(tag.name)
                    return (
                      <button
                        key={tag.id}
                        className={`tag-item ${isSelected ? 'selected' : ''}`}
                        style={{ '--tag-color': tag.color }}
                        onClick={() => {
                          if (selectedConversation) {
                            setConversations(prev => prev.map(c =>
                              c.id === selectedConversation.id
                                ? {
                                    ...c,
                                    tags: isSelected
                                      ? c.tags.filter(t => t !== tag.name)
                                      : [...c.tags, tag.name]
                                  }
                                : c
                            ))
                            setSelectedConversation(prev => ({
                              ...prev,
                              tags: isSelected
                                ? prev.tags.filter(t => t !== tag.name)
                                : [...prev.tags, tag.name]
                            }))
                          }
                        }}
                      >
                        <span className="tag-dot" style={{ background: tag.color }}></span>
                        {tag.name}
                        {isSelected && <i className="fas fa-check"></i>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowTagsModal(false)}>
                  Cerrar
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i> Nueva etiqueta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
            <div className="modal-content new-message-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-edit"></i> Nuevo mensaje</h3>
                <button className="close-modal" onClick={() => setShowNewMessageModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Plataforma</label>
                  <div className="platform-selector">
                    {Object.entries(platforms).map(([key, p]) => (
                      <button key={key} className="platform-option" style={{ '--platform-color': p.color }}>
                        <i className={`${p.brand ? 'fab' : 'fas'} ${p.icon}`}></i>
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Destinatario</label>
                  <input type="text" className="form-control" placeholder="Nombre, teléfono o email..." />
                </div>
                <div className="form-group">
                  <label>Mensaje</label>
                  <textarea className="form-control" rows={4} placeholder="Escribe tu mensaje..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNewMessageModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-paper-plane"></i> Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagingHub
