/**
 * ALQVIMIA RPA 2.0 - Amazon S3 Storage Agent
 * Agente autónomo para integración con Amazon S3
 */

import BaseAgent from '../core/BaseAgent.js'
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

class S3Agent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-s3',
      name: 'Amazon S3 Agent',
      version: '2.0.0',
      port: config.port || 4601,
      category: 'storage',
      ...config
    })

    this.s3Config = {
      accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      endpoint: config.endpoint || process.env.AWS_S3_ENDPOINT,
      defaultBucket: config.defaultBucket || process.env.AWS_S3_BUCKET
    }

    this.client = null
    if (this.s3Config.accessKeyId && this.s3Config.secretAccessKey) {
      this.initializeClient()
    }

    this.setupS3Routes()
  }

  initializeClient() {
    const clientConfig = {
      region: this.s3Config.region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey
      }
    }

    if (this.s3Config.endpoint) {
      clientConfig.endpoint = this.s3Config.endpoint
      clientConfig.forcePathStyle = true
    }

    this.client = new S3Client(clientConfig)
  }

  getCapabilities() {
    return ['upload', 'download', 'list', 'delete', 'copy', 'presigned-urls', 'buckets', 'metadata']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      s3: {
        region: this.s3Config.region,
        defaultBucket: this.s3Config.defaultBucket,
        endpoint: this.s3Config.endpoint,
        configured: !!this.s3Config.accessKeyId
      }
    }
  }

  setupS3Routes() {
    // List buckets
    this.app.get('/buckets', async (req, res) => {
      try {
        const buckets = await this.listBuckets()
        res.json({ success: true, data: buckets })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Create bucket
    this.app.post('/buckets', async (req, res) => {
      try {
        const { name, region } = req.body
        const result = await this.createBucket(name, region)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Delete bucket
    this.app.delete('/buckets/:name', async (req, res) => {
      try {
        await this.deleteBucket(req.params.name)
        res.json({ success: true, message: 'Bucket deleted' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // List objects in bucket
    this.app.get('/objects/:bucket?', async (req, res) => {
      try {
        const bucket = req.params.bucket || this.s3Config.defaultBucket
        const { prefix, maxKeys = 1000, continuationToken } = req.query
        const objects = await this.listObjects(bucket, { prefix, maxKeys: parseInt(maxKeys), continuationToken })
        res.json({ success: true, data: objects })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get object
    this.app.get('/object/:bucket/*', async (req, res) => {
      try {
        const bucket = req.params.bucket
        const key = req.params[0]
        const object = await this.getObject(bucket, key)

        res.set('Content-Type', object.contentType)
        res.set('Content-Length', object.contentLength)
        res.send(object.body)
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get object metadata
    this.app.head('/object/:bucket/*', async (req, res) => {
      try {
        const bucket = req.params.bucket
        const key = req.params[0]
        const metadata = await this.getObjectMetadata(bucket, key)

        res.set('Content-Type', metadata.contentType)
        res.set('Content-Length', metadata.contentLength)
        res.set('Last-Modified', metadata.lastModified)
        res.set('ETag', metadata.etag)
        res.status(200).end()
      } catch (error) {
        res.status(404).end()
      }
    })

    // Upload object
    this.app.post('/upload', async (req, res) => {
      try {
        const { bucket, key, content, contentType, metadata } = req.body
        const result = await this.uploadObject(
          bucket || this.s3Config.defaultBucket,
          key,
          content,
          contentType,
          metadata
        )
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Upload from base64
    this.app.post('/upload/base64', async (req, res) => {
      try {
        const { bucket, key, base64Content, contentType, metadata } = req.body
        const buffer = Buffer.from(base64Content, 'base64')
        const result = await this.uploadObject(
          bucket || this.s3Config.defaultBucket,
          key,
          buffer,
          contentType,
          metadata
        )
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Delete object
    this.app.delete('/object/:bucket/*', async (req, res) => {
      try {
        const bucket = req.params.bucket
        const key = req.params[0]
        await this.deleteObject(bucket, key)
        res.json({ success: true, message: 'Object deleted' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Copy object
    this.app.post('/copy', async (req, res) => {
      try {
        const { sourceBucket, sourceKey, destBucket, destKey } = req.body
        const result = await this.copyObject(sourceBucket, sourceKey, destBucket, destKey)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Generate presigned URL for download
    this.app.post('/presigned/download', async (req, res) => {
      try {
        const { bucket, key, expiresIn = 3600 } = req.body
        const url = await this.getPresignedDownloadUrl(
          bucket || this.s3Config.defaultBucket,
          key,
          expiresIn
        )
        res.json({ success: true, data: { url, expiresIn } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Generate presigned URL for upload
    this.app.post('/presigned/upload', async (req, res) => {
      try {
        const { bucket, key, contentType, expiresIn = 3600 } = req.body
        const url = await this.getPresignedUploadUrl(
          bucket || this.s3Config.defaultBucket,
          key,
          contentType,
          expiresIn
        )
        res.json({ success: true, data: { url, expiresIn } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Test connection
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
    if (!this.s3Config.accessKeyId) {
      this.log('warn', 'AWS credentials not configured')
      return
    }

    try {
      const buckets = await this.listBuckets()
      this.log('info', `S3 agent connected. ${buckets.length} buckets available`)
    } catch (error) {
      this.log('error', `Failed to connect to S3: ${error.message}`)
    }
  }

  async testConnection(config) {
    const testClient = new S3Client({
      region: config.region || 'us-east-1',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      },
      ...(config.endpoint && { endpoint: config.endpoint, forcePathStyle: true })
    })

    await testClient.send(new ListBucketsCommand({}))
  }

  // Bucket operations
  async listBuckets() {
    const response = await this.client.send(new ListBucketsCommand({}))
    return response.Buckets.map(b => ({
      name: b.Name,
      creationDate: b.CreationDate
    }))
  }

  async createBucket(name, region) {
    const params = { Bucket: name }
    if (region && region !== 'us-east-1') {
      params.CreateBucketConfiguration = { LocationConstraint: region }
    }
    await this.client.send(new CreateBucketCommand(params))
    return { bucket: name, region: region || this.s3Config.region }
  }

  async deleteBucket(name) {
    await this.client.send(new DeleteBucketCommand({ Bucket: name }))
  }

  // Object operations
  async listObjects(bucket, { prefix, maxKeys = 1000, continuationToken } = {}) {
    const params = {
      Bucket: bucket,
      MaxKeys: maxKeys
    }
    if (prefix) params.Prefix = prefix
    if (continuationToken) params.ContinuationToken = continuationToken

    const response = await this.client.send(new ListObjectsV2Command(params))

    return {
      objects: (response.Contents || []).map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag,
        storageClass: obj.StorageClass
      })),
      prefixes: (response.CommonPrefixes || []).map(p => p.Prefix),
      isTruncated: response.IsTruncated,
      nextContinuationToken: response.NextContinuationToken
    }
  }

  async getObject(bucket, key) {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key
    }))

    const chunks = []
    for await (const chunk of response.Body) {
      chunks.push(chunk)
    }

    return {
      body: Buffer.concat(chunks),
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
      metadata: response.Metadata
    }
  }

  async getObjectMetadata(bucket, key) {
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    }))

    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
      metadata: response.Metadata
    }
  }

  async uploadObject(bucket, key, content, contentType = 'application/octet-stream', metadata = {}) {
    const body = typeof content === 'string' ? Buffer.from(content) : content

    await this.client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata
    }))

    return {
      bucket,
      key,
      size: body.length,
      url: `https://${bucket}.s3.${this.s3Config.region}.amazonaws.com/${key}`
    }
  }

  async deleteObject(bucket, key) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }))
  }

  async copyObject(sourceBucket, sourceKey, destBucket, destKey) {
    await this.client.send(new CopyObjectCommand({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: destBucket,
      Key: destKey
    }))

    return {
      sourceBucket,
      sourceKey,
      destBucket,
      destKey
    }
  }

  // Presigned URLs
  async getPresignedDownloadUrl(bucket, key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  async getPresignedUploadUrl(bucket, key, contentType, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    })
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  async execute(action, params) {
    switch (action) {
      case 'list-buckets': return await this.listBuckets()
      case 'create-bucket': return await this.createBucket(params.name, params.region)
      case 'delete-bucket': return await this.deleteBucket(params.name)
      case 'list-objects': return await this.listObjects(params.bucket || this.s3Config.defaultBucket, params)
      case 'get-object': return await this.getObject(params.bucket, params.key)
      case 'get-metadata': return await this.getObjectMetadata(params.bucket, params.key)
      case 'upload': return await this.uploadObject(params.bucket, params.key, params.content, params.contentType, params.metadata)
      case 'delete': return await this.deleteObject(params.bucket, params.key)
      case 'copy': return await this.copyObject(params.sourceBucket, params.sourceKey, params.destBucket, params.destKey)
      case 'presigned-download': return await this.getPresignedDownloadUrl(params.bucket, params.key, params.expiresIn)
      case 'presigned-upload': return await this.getPresignedUploadUrl(params.bucket, params.key, params.contentType, params.expiresIn)
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('list-objects', async ({ bucket, prefix }, callback) => {
      try {
        const result = await this.listObjects(bucket || this.s3Config.defaultBucket, { prefix })
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('upload', async (data, callback) => {
      try {
        const result = await this.uploadObject(
          data.bucket || this.s3Config.defaultBucket,
          data.key,
          data.content,
          data.contentType
        )
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default S3Agent

const isMainModule = process.argv[1]?.includes('S3Agent')
if (isMainModule) {
  const agent = new S3Agent({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    defaultBucket: process.env.AWS_S3_BUCKET
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
