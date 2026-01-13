/**
 * ALQVIMIA RPA 2.0 - Email Agent
 * Agente autónomo para envío y recepción de emails (SMTP/IMAP)
 */

import BaseAgent from '../core/BaseAgent.js'
import nodemailer from 'nodemailer'

class EmailAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-email',
      name: 'Email Agent',
      version: '1.4.0',
      port: config.port || 4303,
      category: 'messaging',
      ...config
    })

    this.smtpConfig = {
      host: config.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: config.smtpPort || process.env.SMTP_PORT || 587,
      secure: config.smtpSecure || process.env.SMTP_SECURE === 'true',
      user: config.smtpUser || process.env.SMTP_USER,
      password: config.smtpPassword || process.env.SMTP_PASSWORD,
      fromEmail: config.fromEmail || process.env.SMTP_FROM_EMAIL,
      fromName: config.fromName || process.env.SMTP_FROM_NAME || 'Alqvimia'
    }

    this.transporter = null
    this.emailHistory = []
    this.templates = new Map()

    this.setupEmailRoutes()
  }

  getCapabilities() {
    return ['send', 'send-html', 'templates', 'attachments', 'bulk', 'tracking', 'receive']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      email: {
        smtpHost: this.smtpConfig.host,
        smtpPort: this.smtpConfig.port,
        fromEmail: this.smtpConfig.fromEmail,
        configured: !!this.smtpConfig.user
      }
    }
  }

  setupEmailRoutes() {
    // Send email
    this.app.post('/send', async (req, res) => {
      try {
        const result = await this.sendEmail(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send HTML email
    this.app.post('/send/html', async (req, res) => {
      try {
        const result = await this.sendHtmlEmail(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send with template
    this.app.post('/send/template', async (req, res) => {
      try {
        const result = await this.sendWithTemplate(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Bulk send
    this.app.post('/bulk', async (req, res) => {
      try {
        const { emails, delayMs = 1000 } = req.body
        const results = await this.sendBulk(emails, delayMs)
        res.json({ success: true, data: results })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Manage templates
    this.app.get('/templates', (req, res) => {
      const templates = Array.from(this.templates.entries()).map(([name, template]) => ({
        name,
        subject: template.subject,
        variables: template.variables
      }))
      res.json({ success: true, data: templates })
    })

    this.app.post('/templates', (req, res) => {
      try {
        const { name, subject, html, text, variables } = req.body
        this.templates.set(name, { subject, html, text, variables })
        res.json({ success: true, message: `Template '${name}' saved` })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.delete('/templates/:name', (req, res) => {
      const { name } = req.params
      if (this.templates.delete(name)) {
        res.json({ success: true, message: `Template '${name}' deleted` })
      } else {
        res.status(404).json({ success: false, error: 'Template not found' })
      }
    })

    // Email history
    this.app.get('/history', (req, res) => {
      const { limit = 100 } = req.query
      res.json({
        success: true,
        data: this.emailHistory.slice(-parseInt(limit))
      })
    })

    // Verify connection
    this.app.post('/verify', async (req, res) => {
      try {
        await this.verifyConnection()
        res.json({ success: true, message: 'SMTP connection verified' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Test connection with custom config
    this.app.post('/test-connection', async (req, res) => {
      try {
        await this.testConnection(req.body)
        res.json({ success: true, message: 'Connection successful' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })
  }

  async onStart() {
    try {
      await this.createTransporter()
      await this.verifyConnection()
      this.log('info', `Email agent connected to ${this.smtpConfig.host}`)
    } catch (error) {
      this.log('warn', `Could not connect to SMTP: ${error.message}`)
    }

    // Load default templates
    this.loadDefaultTemplates()
  }

  async onStop() {
    if (this.transporter) {
      this.transporter.close()
      this.transporter = null
    }
  }

  async createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.password
      }
    })
  }

  async verifyConnection() {
    if (!this.transporter) throw new Error('Transporter not initialized')
    await this.transporter.verify()
  }

  async testConnection(config) {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost || config.host,
      port: config.smtpPort || config.port,
      secure: config.smtpSecure || config.secure,
      auth: {
        user: config.smtpUser || config.user || config.username,
        pass: config.smtpPassword || config.password
      }
    })
    await transporter.verify()
    transporter.close()
  }

  loadDefaultTemplates() {
    this.templates.set('welcome', {
      subject: 'Bienvenido a {{companyName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">¡Bienvenido, {{name}}!</h1>
          <p>Gracias por registrarte en {{companyName}}.</p>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <a href="{{loginUrl}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
            Iniciar Sesión
          </a>
        </div>
      `,
      variables: ['name', 'companyName', 'loginUrl']
    })

    this.templates.set('notification', {
      subject: '{{subject}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">{{title}}</h2>
          <p>{{message}}</p>
          {{#if actionUrl}}
          <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
            {{actionText}}
          </a>
          {{/if}}
        </div>
      `,
      variables: ['title', 'message', 'actionUrl', 'actionText', 'subject']
    })

    this.templates.set('password-reset', {
      subject: 'Restablecer tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecer Contraseña</h2>
          <p>Hola {{name}},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo:</p>
          <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Este enlace expira en {{expiresIn}}. Si no solicitaste esto, ignora este email.
          </p>
        </div>
      `,
      variables: ['name', 'resetUrl', 'expiresIn']
    })
  }

  async sendEmail({ to, subject, text, cc, bcc, replyTo, attachments }) {
    if (!this.transporter) throw new Error('Email service not configured')

    const mailOptions = {
      from: `"${this.smtpConfig.fromName}" <${this.smtpConfig.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text
    }

    if (cc) mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc
    if (bcc) mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc
    if (replyTo) mailOptions.replyTo = replyTo
    if (attachments) mailOptions.attachments = attachments

    const info = await this.transporter.sendMail(mailOptions)

    this.emailHistory.push({
      to,
      subject,
      messageId: info.messageId,
      status: 'sent',
      timestamp: new Date().toISOString()
    })

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    }
  }

  async sendHtmlEmail({ to, subject, html, text, cc, bcc, replyTo, attachments }) {
    if (!this.transporter) throw new Error('Email service not configured')

    const mailOptions = {
      from: `"${this.smtpConfig.fromName}" <${this.smtpConfig.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || this.htmlToText(html)
    }

    if (cc) mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc
    if (bcc) mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc
    if (replyTo) mailOptions.replyTo = replyTo
    if (attachments) mailOptions.attachments = attachments

    const info = await this.transporter.sendMail(mailOptions)

    this.emailHistory.push({
      to,
      subject,
      messageId: info.messageId,
      status: 'sent',
      timestamp: new Date().toISOString()
    })

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    }
  }

  async sendWithTemplate({ to, templateName, data, cc, bcc, replyTo, attachments }) {
    const template = this.templates.get(templateName)
    if (!template) throw new Error(`Template '${templateName}' not found`)

    const html = this.interpolate(template.html, data)
    const subject = this.interpolate(template.subject, data)
    const text = template.text ? this.interpolate(template.text, data) : undefined

    return await this.sendHtmlEmail({ to, subject, html, text, cc, bcc, replyTo, attachments })
  }

  async sendBulk(emails, delayMs = 1000) {
    const results = []

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email)
        results.push({ email: email.to, success: true, messageId: result.messageId })
      } catch (error) {
        results.push({ email: email.to, success: false, error: error.message })
      }

      // Delay between sends
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs))
      }
    }

    return results
  }

  interpolate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match
    })
  }

  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  async execute(action, params) {
    switch (action) {
      case 'send': return await this.sendEmail(params)
      case 'send-html': return await this.sendHtmlEmail(params)
      case 'send-template': return await this.sendWithTemplate(params)
      case 'bulk': return await this.sendBulk(params.emails, params.delayMs)
      case 'verify': return await this.verifyConnection()
      case 'get-templates': return Array.from(this.templates.entries()).map(([name, t]) => ({ name, ...t }))
      case 'save-template':
        this.templates.set(params.name, params.template)
        return { success: true }
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('send-email', async (data, callback) => {
      try {
        const result = await this.sendEmail(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default EmailAgent

const isMainModule = process.argv[1]?.includes('EmailAgent')
if (isMainModule) {
  const agent = new EmailAgent({
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
