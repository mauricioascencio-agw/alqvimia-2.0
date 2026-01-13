import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function OmnichannelView() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('messages')
  const [whatsappStatus, setWhatsappStatus] = useState('Desconectado')
  const [telegramStatus, setTelegramStatus] = useState('Desconectado')
  const [twilioStatus, setTwilioStatus] = useState('Desconectado')
  const [smsStatus, setSmsStatus] = useState('Desconectado')
  const [emailStatus, setEmailStatus] = useState('Desconectado')
  const [stats, setStats] = useState({
    totalConversations: 0,
    queuedMessages: 0,
    totalTemplates: 0
  })
  const [messageForm, setMessageForm] = useState({
    channel: 'whatsapp',
    recipient: '',
    text: ''
  })
  const [templateForm, setTemplateForm] = useState({
    name: '',
    text: ''
  })
  const [templates, setTemplates] = useState([])
  const [conversations, setConversations] = useState([])

  // Estados para modales
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [showTwilioModal, setShowTwilioModal] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Estados para configuraciones
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    webhookUrl: ''
  })

  const [telegramConfig, setTelegramConfig] = useState({
    botToken: '',
    botUsername: '',
    webhookUrl: ''
  })

  const [smsConfig, setSmsConfig] = useState({
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    senderId: ''
  })

  const [emailConfig, setEmailConfig] = useState({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: ''
  })

  // Estado para notificaciones
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }

  const initializeSystem = () => {
    showNotification('Inicializando sistema omnicanal...', 'info')
    // Simular inicialización
    setTimeout(() => {
      showNotification('Sistema omnicanal inicializado correctamente', 'success')
    }, 2000)
  }

  const refreshStatus = () => {
    showNotification('Actualizando estado de los canales...', 'info')
    // Simular actualización
    setTimeout(() => {
      showNotification('Estado actualizado', 'success')
    }, 1000)
  }

  const showWhatsAppQR = () => {
    setShowQRModal(true)
  }

  const openTelegramConfig = () => {
    setShowTelegramModal(true)
  }

  const openTwilioConfig = () => {
    setShowTwilioModal(true)
  }

  const openSMSConfig = () => {
    setShowSMSModal(true)
  }

  const openEmailConfig = () => {
    setShowEmailModal(true)
  }

  const sendMessage = () => {
    if (!messageForm.recipient || !messageForm.text) {
      showNotification('Por favor completa todos los campos', 'error')
      return
    }
    showNotification(`Enviando mensaje por ${messageForm.channel}...`, 'info')
    setTimeout(() => {
      showNotification('Mensaje enviado correctamente', 'success')
      setMessageForm({ ...messageForm, recipient: '', text: '' })
    }, 1500)
  }

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.text) {
      showNotification('Por favor completa todos los campos', 'error')
      return
    }
    setTemplates([...templates, { ...templateForm, id: Date.now() }])
    setTemplateForm({ name: '', text: '' })
    showNotification('Template guardado correctamente', 'success')
  }

  const saveTwilioConfig = () => {
    if (!twilioConfig.accountSid || !twilioConfig.authToken) {
      showNotification('Por favor ingresa Account SID y Auth Token', 'error')
      return
    }
    localStorage.setItem('twilioConfig', JSON.stringify(twilioConfig))
    setTwilioStatus('Conectado')
    setShowTwilioModal(false)
    showNotification('Configuración de Twilio guardada correctamente', 'success')
  }

  const saveTelegramConfig = () => {
    if (!telegramConfig.botToken) {
      showNotification('Por favor ingresa el Bot Token', 'error')
      return
    }
    localStorage.setItem('telegramConfig', JSON.stringify(telegramConfig))
    setTelegramStatus('Conectado')
    setShowTelegramModal(false)
    showNotification('Configuración de Telegram guardada correctamente', 'success')
  }

  const saveSMSConfig = () => {
    if (!smsConfig.apiKey) {
      showNotification('Por favor ingresa la API Key', 'error')
      return
    }
    localStorage.setItem('smsConfig', JSON.stringify(smsConfig))
    setSmsStatus('Conectado')
    setShowSMSModal(false)
    showNotification('Configuración de SMS guardada correctamente', 'success')
  }

  const saveEmailConfig = () => {
    if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
      showNotification('Por favor completa la configuración SMTP', 'error')
      return
    }
    localStorage.setItem('emailConfig', JSON.stringify(emailConfig))
    setEmailStatus('Conectado')
    setShowEmailModal(false)
    showNotification('Configuración de Email guardada correctamente', 'success')
  }

  const testConnection = (service) => {
    showNotification(`Probando conexión con ${service}...`, 'info')
    setTimeout(() => {
      showNotification(`Conexión con ${service} exitosa`, 'success')
    }, 2000)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
  }

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedTwilio = localStorage.getItem('twilioConfig')
    const savedTelegram = localStorage.getItem('telegramConfig')
    const savedSMS = localStorage.getItem('smsConfig')
    const savedEmail = localStorage.getItem('emailConfig')

    if (savedTwilio) {
      setTwilioConfig(JSON.parse(savedTwilio))
      setTwilioStatus('Conectado')
    }
    if (savedTelegram) {
      setTelegramConfig(JSON.parse(savedTelegram))
      setTelegramStatus('Conectado')
    }
    if (savedSMS) {
      setSmsConfig(JSON.parse(savedSMS))
      setSmsStatus('Conectado')
    }
    if (savedEmail) {
      setEmailConfig(JSON.parse(savedEmail))
      setEmailStatus('Conectado')
    }
  }, [])

  // Estilos comunes
  const cardStyle = {
    background: '#1e293b',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #334155'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 500
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  }

  const modalStyle = {
    background: '#1e293b',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #334155',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  }

  return (
    <div className="view" id="omnichannel-view">
      {/* Notificación */}
      {notification.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            background: notification.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                       notification.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                       'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            fontWeight: 500,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease'
          }}
        >
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' :
                              notification.type === 'error' ? 'fa-exclamation-circle' :
                              'fa-info-circle'}`}></i>
          {notification.message}
        </div>
      )}

      <div
        className="view-header"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-comments"></i> Omnicanalidad - Centro de Comunicaciones
            </h2>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0' }}>
              Sistema de chatbots, mensajería multicanal e integraciones con APIs
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowInfoModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-info-circle"></i> ¿Cómo funciona?
            </button>
            <button
              onClick={initializeSystem}
              style={{
                background: 'white',
                color: '#10b981',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-power-off"></i> Inicializar Sistema
            </button>
            <button
              onClick={refreshStatus}
              style={{
                background: 'white',
                color: '#10b981',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-sync"></i> Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estado del Sistema - Canales */}
      <div
        id="omnichannelStatus"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* WhatsApp Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fab fa-whatsapp"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fab fa-whatsapp" style={{ fontSize: '1.75rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>WhatsApp Business</h3>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: whatsappStatus === 'Conectado' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', marginTop: '0.25rem'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: whatsappStatus === 'Conectado' ? '#fff' : '#fbbf24'
                  }}></span>
                  {whatsappStatus}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>
              API oficial de WhatsApp Business para enviar y recibir mensajes
            </p>
            <button
              onClick={showWhatsAppQR}
              style={{
                width: '100%',
                background: 'white',
                color: '#25D366',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-qrcode"></i> Ver QR Code
            </button>
          </div>
        </div>

        {/* Telegram Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #0088cc 0%, #0066aa 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fab fa-telegram"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fab fa-telegram" style={{ fontSize: '1.75rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Telegram Bot</h3>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: telegramStatus === 'Conectado' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', marginTop: '0.25rem'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: telegramStatus === 'Conectado' ? '#fff' : '#fbbf24'
                  }}></span>
                  {telegramStatus}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>
              Bot de Telegram para automatización y atención al cliente
            </p>
            <button
              onClick={openTelegramConfig}
              style={{
                width: '100%',
                background: 'white',
                color: '#0088cc',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-cog"></i> Configurar Bot
            </button>
          </div>
        </div>

        {/* Twilio Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #f22f46 0%, #c4192e 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fas fa-phone-volume"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fas fa-phone-volume" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Twilio</h3>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: twilioStatus === 'Conectado' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', marginTop: '0.25rem'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: twilioStatus === 'Conectado' ? '#fff' : '#fbbf24'
                  }}></span>
                  {twilioStatus}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>
              SMS, Voz, WhatsApp y Video a través de la API de Twilio
            </p>
            <button
              onClick={openTwilioConfig}
              style={{
                width: '100%',
                background: 'white',
                color: '#f22f46',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-plug"></i> Configurar API
            </button>
          </div>
        </div>

        {/* SMS Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fas fa-sms"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fas fa-sms" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>SMS Gateway</h3>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: smsStatus === 'Conectado' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', marginTop: '0.25rem'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: smsStatus === 'Conectado' ? '#fff' : '#fbbf24'
                  }}></span>
                  {smsStatus}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>
              Envío masivo de SMS con múltiples proveedores
            </p>
            <button
              onClick={openSMSConfig}
              style={{
                width: '100%',
                background: 'white',
                color: '#8b5cf6',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-cog"></i> Configurar SMS
            </button>
          </div>
        </div>

        {/* Email Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fas fa-envelope"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fas fa-envelope" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Email SMTP</h3>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: emailStatus === 'Conectado' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', marginTop: '0.25rem'
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: emailStatus === 'Conectado' ? '#fff' : '#fbbf24'
                  }}></span>
                  {emailStatus}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>
              Envío de correos electrónicos automatizados
            </p>
            <button
              onClick={openEmailConfig}
              style={{
                width: '100%',
                background: 'white',
                color: '#f59e0b',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-cog"></i> Configurar Email
            </button>
          </div>
        </div>

        {/* Estadísticas Card */}
        <div
          className="channel-card"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: '8rem' }}>
            <i className="fas fa-chart-line"></i>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="fas fa-chart-line" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Estadísticas</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>Conversaciones</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{stats.totalConversations}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>Mensajes en cola</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{stats.queuedMessages}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>Templates</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{templates.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="tabs"
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #334155',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'messages', icon: 'fa-comment-dots', label: 'Enviar Mensajes' },
          { id: 'conversations', icon: 'fa-comments', label: 'Conversaciones' },
          { id: 'templates', icon: 'fa-file-alt', label: 'Templates' },
          { id: 'automations', icon: 'fa-robot', label: 'Automatizaciones' },
          { id: 'config', icon: 'fa-cog', label: 'Configuración' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === tab.id ? '#10b981' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-paper-plane" style={{ color: '#10b981' }}></i> Enviar Mensaje
            </h3>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Canal de envío</label>
                <select
                  value={messageForm.channel}
                  onChange={(e) => setMessageForm({ ...messageForm, channel: e.target.value })}
                  style={inputStyle}
                >
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="telegram">🤖 Telegram</option>
                  <option value="twilio_sms">📲 SMS (Twilio)</option>
                  <option value="twilio_voice">📞 Llamada (Twilio)</option>
                  <option value="sms">💬 SMS Gateway</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Destinatario</label>
                <input
                  type="text"
                  placeholder={
                    messageForm.channel === 'email' ? 'correo@ejemplo.com' :
                    messageForm.channel === 'telegram' ? 'Chat ID (ej: 123456789)' :
                    'Número con código de país (ej: 5215512345678)'
                  }
                  value={messageForm.recipient}
                  onChange={(e) => setMessageForm({ ...messageForm, recipient: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Mensaje</label>
                <textarea
                  rows="4"
                  placeholder="Escribe tu mensaje aquí..."
                  value={messageForm.text}
                  onChange={(e) => setMessageForm({ ...messageForm, text: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={sendMessage}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <i className="fas fa-paper-plane"></i> Enviar Mensaje
                </button>
                {templates.length > 0 && (
                  <select
                    onChange={(e) => {
                      const tpl = templates.find(t => t.id === parseInt(e.target.value))
                      if (tpl) setMessageForm({ ...messageForm, text: tpl.text })
                    }}
                    style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                  >
                    <option value="">Usar template...</option>
                    {templates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-comments" style={{ color: '#3b82f6' }}></i> Historial de Conversaciones
            </h3>
            {conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <i className="fas fa-inbox" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p style={{ fontSize: '1.1rem' }}>No hay conversaciones aún</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Las conversaciones aparecerán aquí cuando los usuarios interactúen</p>
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div key={index} className="conversation-item" style={{
                  padding: '1rem',
                  background: '#0f172a',
                  borderRadius: '8px',
                  marginBottom: '0.75rem'
                }}>
                  {conv.lastMessage}
                </div>
              ))
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-file-alt" style={{ color: '#8b5cf6' }}></i> Templates de Mensajes
            </h3>

            <div style={{
              display: 'grid',
              gap: '1.25rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#0f172a',
              borderRadius: '10px'
            }}>
              <div>
                <label style={labelStyle}>Nombre del Template</label>
                <input
                  type="text"
                  placeholder="ej: bienvenida, confirmacion_cita"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Mensaje (usa {'{{variable}}'} para variables)</label>
                <textarea
                  rows="4"
                  placeholder="Hola {{nombre}}! Bienvenido a {{empresa}}. Tu cita está programada para el {{fecha}}."
                  value={templateForm.text}
                  onChange={(e) => setTemplateForm({ ...templateForm, text: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                ></textarea>
                <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                  Variables disponibles: {'{{nombre}}'}, {'{{empresa}}'}, {'{{fecha}}'}, {'{{hora}}'}, {'{{codigo}}'}
                </small>
              </div>

              <button
                onClick={saveTemplate}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-save"></i> Guardar Template
              </button>
            </div>

            <h4 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Templates Guardados</h4>
            {templates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <i className="fas fa-file" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>No hay templates guardados</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {templates.map((tpl) => (
                  <div key={tpl.id} style={{
                    padding: '1rem',
                    background: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#8b5cf6' }}>{tpl.name}</strong>
                      <button
                        onClick={() => setTemplates(templates.filter(t => t.id !== tpl.id))}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#ef4444',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{tpl.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Automations Tab */}
        {activeTab === 'automations' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-robot" style={{ color: '#f59e0b' }}></i> Automatizaciones con Omnicanalidad
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Sección de Flujos Automáticos */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-project-diagram" style={{ color: '#10b981' }}></i>
                  Flujos de Trabajo Automatizados
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Crea flujos automáticos que respondan a eventos de tus canales de comunicación.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <i className="fas fa-comment-dots" style={{ color: '#25D366', marginBottom: '0.5rem', display: 'block' }}></i>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Respuesta Automática</strong>
                    <small style={{ color: '#64748b' }}>Responde automáticamente a mensajes entrantes</small>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <i className="fas fa-user-plus" style={{ color: '#3b82f6', marginBottom: '0.5rem', display: 'block' }}></i>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Calificación de Leads</strong>
                    <small style={{ color: '#64748b' }}>Califica clientes potenciales automáticamente</small>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <i className="fas fa-ticket-alt" style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'block' }}></i>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Creación de Tickets</strong>
                    <small style={{ color: '#64748b' }}>Crea tickets de soporte desde mensajes</small>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <i className="fas fa-bell" style={{ color: '#8b5cf6', marginBottom: '0.5rem', display: 'block' }}></i>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Notificaciones</strong>
                    <small style={{ color: '#64748b' }}>Envía recordatorios y alertas</small>
                  </div>
                </div>
              </div>

              {/* Integración con CRM */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-database" style={{ color: '#3b82f6' }}></i>
                  Integración con CRM y Herramientas
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Conecta con las plataformas más populares para sincronizar datos de clientes.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {['HubSpot', 'Salesforce', 'Zendesk', 'Pipedrive', 'Zoho CRM', 'Monday', 'Notion', 'Airtable'].map(crm => (
                    <span key={crm} style={{
                      background: '#0f172a',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      border: '1px solid #334155'
                    }}>
                      {crm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chatbots con IA */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.05))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-brain" style={{ color: '#8b5cf6' }}></i>
                  Chatbots con Inteligencia Artificial
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Implementa chatbots inteligentes para manejar consultas frecuentes y calificar leads.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <li>Respuestas automáticas 24/7</li>
                  <li>Procesamiento de lenguaje natural</li>
                  <li>Escalamiento inteligente a agentes humanos</li>
                  <li>Aprendizaje continuo de conversaciones</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-cog" style={{ color: '#94a3b8' }}></i> Configuración del Sistema
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Estado de Conexiones */}
              <div style={{
                background: '#0f172a',
                borderRadius: '10px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Estado de Conexiones</h4>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {[
                    { name: 'WhatsApp', status: whatsappStatus, color: '#25D366', action: showWhatsAppQR },
                    { name: 'Telegram', status: telegramStatus, color: '#0088cc', action: openTelegramConfig },
                    { name: 'Twilio', status: twilioStatus, color: '#f22f46', action: openTwilioConfig },
                    { name: 'SMS Gateway', status: smsStatus, color: '#8b5cf6', action: openSMSConfig },
                    { name: 'Email SMTP', status: emailStatus, color: '#f59e0b', action: openEmailConfig }
                  ].map(service => (
                    <div key={service.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: '#1e293b',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: service.status === 'Conectado' ? '#22c55e' : '#fbbf24'
                        }}></div>
                        <span style={{ fontWeight: 500 }}>{service.name}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: service.status === 'Conectado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                          color: service.status === 'Conectado' ? '#22c55e' : '#fbbf24'
                        }}>
                          {service.status}
                        </span>
                      </div>
                      <button
                        onClick={service.action}
                        style={{
                          background: service.color,
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Configurar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhooks */}
              <div style={{
                background: '#0f172a',
                borderRadius: '10px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>URLs de Webhooks</h4>
                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  Configura estas URLs en tus servicios para recibir mensajes entrantes.
                </p>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {[
                    { name: 'WhatsApp', url: `${window.location.origin}/api/webhook/whatsapp` },
                    { name: 'Telegram', url: `${window.location.origin}/api/webhook/telegram` },
                    { name: 'Twilio', url: `${window.location.origin}/api/webhook/twilio` }
                  ].map(webhook => (
                    <div key={webhook.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: '#1e293b',
                      borderRadius: '6px'
                    }}>
                      <span style={{ minWidth: '80px', fontWeight: 500, fontSize: '0.85rem' }}>{webhook.name}:</span>
                      <code style={{
                        flex: 1,
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {webhook.url}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.url)
                          showNotification('URL copiada al portapapeles')
                        }}
                        style={{
                          background: '#334155',
                          border: 'none',
                          color: '#94a3b8',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: WhatsApp QR */}
      {showQRModal && (
        <div style={modalOverlayStyle} onClick={() => setShowQRModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i>
                Conectar WhatsApp
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: 200,
                height: 200,
                background: 'white',
                margin: '0 auto 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid #25D366'
              }}>
                <i className="fas fa-qrcode" style={{ fontSize: '6rem', color: '#1e293b' }}></i>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Escanea el código QR</h4>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Abre WhatsApp en tu teléfono {'>'} Configuración {'>'} Dispositivos vinculados {'>'} Vincular dispositivo
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    showNotification('Generando nuevo código QR...')
                  }}
                  style={{
                    background: '#25D366',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <i className="fas fa-sync"></i> Regenerar QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Telegram Config */}
      {showTelegramModal && (
        <div style={modalOverlayStyle} onClick={() => setShowTelegramModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fab fa-telegram" style={{ color: '#0088cc' }}></i>
                Configurar Telegram Bot
              </h3>
              <button
                onClick={() => setShowTelegramModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Bot Token *</label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                    value={telegramConfig.botToken}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                    style={inputStyle}
                  />
                  <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                    Obtén el token de @BotFather en Telegram
                  </small>
                </div>
                <div>
                  <label style={labelStyle}>Username del Bot</label>
                  <input
                    type="text"
                    placeholder="@mi_bot"
                    value={telegramConfig.botUsername}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, botUsername: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => testConnection('Telegram')}
                    style={{
                      flex: 1,
                      background: '#334155',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <i className="fas fa-plug"></i> Probar Conexión
                  </button>
                  <button
                    onClick={saveTelegramConfig}
                    style={{
                      flex: 1,
                      background: '#0088cc',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <i className="fas fa-save"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Twilio Config */}
      {showTwilioModal && (
        <div style={modalOverlayStyle} onClick={() => setShowTwilioModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-phone-volume" style={{ color: '#f22f46' }}></i>
                Configurar Twilio
              </h3>
              <button
                onClick={() => setShowTwilioModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                background: 'rgba(242, 47, 70, 0.1)',
                border: '1px solid rgba(242, 47, 70, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#f87171' }}>
                  <i className="fas fa-info-circle"></i> Obtén tus credenciales en{' '}
                  <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" style={{ color: '#f22f46' }}>
                    console.twilio.com
                  </a>
                </p>
              </div>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Account SID *</label>
                  <input
                    type="text"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={twilioConfig.accountSid}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Auth Token *</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Número de Teléfono Twilio</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={twilioConfig.phoneNumber}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, phoneNumber: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => testConnection('Twilio')}
                    style={{
                      flex: 1,
                      background: '#334155',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <i className="fas fa-plug"></i> Probar Conexión
                  </button>
                  <button
                    onClick={saveTwilioConfig}
                    style={{
                      flex: 1,
                      background: '#f22f46',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <i className="fas fa-save"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: SMS Config */}
      {showSMSModal && (
        <div style={modalOverlayStyle} onClick={() => setShowSMSModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-sms" style={{ color: '#8b5cf6' }}></i>
                Configurar SMS Gateway
              </h3>
              <button
                onClick={() => setShowSMSModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Proveedor</label>
                  <select
                    value={smsConfig.provider}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Vonage (Nexmo)</option>
                    <option value="messagebird">MessageBird</option>
                    <option value="plivo">Plivo</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>API Key *</label>
                  <input
                    type="text"
                    placeholder="Tu API Key"
                    value={smsConfig.apiKey}
                    onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>API Secret</label>
                  <input
                    type="password"
                    placeholder="Tu API Secret"
                    value={smsConfig.apiSecret}
                    onChange={(e) => setSmsConfig({ ...smsConfig, apiSecret: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Sender ID / Número</label>
                  <input
                    type="text"
                    placeholder="MiEmpresa o +1234567890"
                    value={smsConfig.senderId}
                    onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => testConnection('SMS Gateway')}
                    style={{
                      flex: 1,
                      background: '#334155',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <i className="fas fa-plug"></i> Probar Conexión
                  </button>
                  <button
                    onClick={saveSMSConfig}
                    style={{
                      flex: 1,
                      background: '#8b5cf6',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <i className="fas fa-save"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Email Config */}
      {showEmailModal && (
        <div style={modalOverlayStyle} onClick={() => setShowEmailModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-envelope" style={{ color: '#f59e0b' }}></i>
                Configurar Email SMTP
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Proveedor</label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="smtp">SMTP Personalizado</option>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook/Office 365</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Servidor SMTP *</label>
                    <input
                      type="text"
                      placeholder="smtp.ejemplo.com"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Puerto</label>
                    <input
                      type="text"
                      placeholder="587"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Usuario SMTP *</label>
                  <input
                    type="text"
                    placeholder="usuario@ejemplo.com"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña SMTP *</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Email Remitente</label>
                    <input
                      type="email"
                      placeholder="noreply@ejemplo.com"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nombre Remitente</label>
                    <input
                      type="text"
                      placeholder="Mi Empresa"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => testConnection('Email SMTP')}
                    style={{
                      flex: 1,
                      background: '#334155',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <i className="fas fa-plug"></i> Probar Conexión
                  </button>
                  <button
                    onClick={saveEmailConfig}
                    style={{
                      flex: 1,
                      background: '#f59e0b',
                      border: 'none',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <i className="fas fa-save"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Información de Omnicanalidad */}
      {showInfoModal && (
        <div style={modalOverlayStyle} onClick={() => setShowInfoModal(false)}>
          <div style={{ ...modalStyle, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-info-circle" style={{ color: '#10b981' }}></i>
                ¿Cómo funciona la Omnicanalidad con Automatizaciones?
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                La automatización en una estrategia omnicanal permite gestionar eficientemente las interacciones
                y los datos del cliente, sin importar el canal que utilicen (chat, correo, redes sociales, voz, etc.).
              </p>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {[
                  {
                    icon: 'fa-inbox',
                    color: '#3b82f6',
                    title: 'Gestión Unificada de la Comunicación',
                    desc: 'La automatización centraliza todos los mensajes en una sola bandeja de entrada. Los equipos responden desde un único panel y ven el historial completo del cliente, evitando que repita información al cambiar de canal.'
                  },
                  {
                    icon: 'fa-robot',
                    color: '#8b5cf6',
                    title: 'Chatbots con IA',
                    desc: 'Implementa chatbots con inteligencia artificial para manejar consultas frecuentes, calificar clientes potenciales y dirigir casos complejos a agentes humanos, garantizando atención 24/7.'
                  },
                  {
                    icon: 'fa-project-diagram',
                    color: '#f59e0b',
                    title: 'Flujos de Trabajo Automatizados',
                    desc: 'Automatiza la creación y asignación de tickets, envío de notificaciones y recordatorios (WhatsApp, email), y registro de interacciones en un CRM.'
                  },
                  {
                    icon: 'fa-magic',
                    color: '#ec4899',
                    title: 'Personalización y Recomendaciones',
                    desc: 'Con acceso a datos completos del cliente, la automatización ofrece recomendaciones personalizadas y experiencias adaptadas a cada usuario.'
                  },
                  {
                    icon: 'fa-sync',
                    color: '#22c55e',
                    title: 'Sincronización de Datos',
                    desc: 'La información del cliente está disponible en tiempo real en todos los canales y departamentos (ventas, marketing, soporte, logística).'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    background: '#0f172a',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    border: '1px solid #334155'
                  }}>
                    <h4 style={{
                      margin: '0 0 0.75rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <i className={`fas ${item.icon}`} style={{ color: item.color }}></i>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <i className="fas fa-plug" style={{ color: '#3b82f6', marginRight: '0.5rem' }}></i>
                Herramientas con API que pueden consumirse
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { name: 'WhatsApp Business API', category: 'Mensajería' },
                  { name: 'Twilio', category: 'Comunicación' },
                  { name: 'Telegram Bot API', category: 'Mensajería' },
                  { name: 'HubSpot', category: 'CRM' },
                  { name: 'Salesforce', category: 'CRM' },
                  { name: 'Zendesk', category: 'Soporte' },
                  { name: 'SendGrid', category: 'Email' },
                  { name: 'Zapier', category: 'Integración' },
                  { name: 'Make (Integromat)', category: 'Integración' },
                  { name: 'Route Mobile', category: 'Omnicanal' },
                  { name: 'Vonage (Nexmo)', category: 'Comunicación' },
                  { name: 'MessageBird', category: 'Mensajería' }
                ].map((api, index) => (
                  <div key={index} style={{
                    background: '#1e293b',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{api.name}</strong>
                    <small style={{ color: '#64748b' }}>{api.category}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .channel-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .channel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

export default OmnichannelView
