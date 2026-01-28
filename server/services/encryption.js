/**
 * ALQVIMIA RPA 2.0 - Servicio de Encriptación
 * Manejo seguro de API keys y datos sensibles
 */

import crypto from 'crypto'

// Configuración de encriptación
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

// Obtener clave de encriptación del entorno o generar una por defecto
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'alqvimia_default_encryption_key_2024'
  // Asegurar que la clave tenga 32 bytes (256 bits)
  return crypto.createHash('sha256').update(key).digest()
}

/**
 * Encripta un texto usando AES-256-GCM
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en formato base64
 */
export function encrypt(text) {
  if (!text) return null

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Combinar IV + AuthTag + Encrypted en un solo string
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ])

    return combined.toString('base64')
  } catch (error) {
    console.error('Error encriptando:', error.message)
    throw new Error('Error al encriptar datos')
  }
}

/**
 * Desencripta un texto encriptado con AES-256-GCM
 * @param {string} encryptedText - Texto encriptado en base64
 * @returns {string} - Texto desencriptado
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null

  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedText, 'base64')

    // Extraer IV, AuthTag y datos encriptados
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, null, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Error desencriptando:', error.message)
    throw new Error('Error al desencriptar datos - La clave puede haber cambiado')
  }
}

/**
 * Enmascara una API key mostrando solo los primeros y últimos caracteres
 * @param {string} apiKey - API key completa
 * @returns {string} - API key enmascarada (ej: sk-ant-...abc123)
 */
export function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 12) return '***'

  const prefix = apiKey.substring(0, 10)
  const suffix = apiKey.substring(apiKey.length - 6)
  return `${prefix}...${suffix}`
}

/**
 * Valida el formato de una API key de Anthropic
 * @param {string} apiKey - API key a validar
 * @returns {boolean} - true si el formato es válido
 */
export function validateAnthropicKey(apiKey) {
  if (!apiKey) return false
  // Formato: sk-ant-api03-... (puede variar)
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20
}

/**
 * Valida el formato de una API key de OpenAI
 * @param {string} apiKey - API key a validar
 * @returns {boolean} - true si el formato es válido
 */
export function validateOpenAIKey(apiKey) {
  if (!apiKey) return false
  return apiKey.startsWith('sk-') && apiKey.length > 20
}

/**
 * Genera un hash seguro para comparaciones
 * @param {string} text - Texto a hashear
 * @returns {string} - Hash SHA256
 */
export function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export default {
  encrypt,
  decrypt,
  maskApiKey,
  validateAnthropicKey,
  validateOpenAIKey,
  hash
}
