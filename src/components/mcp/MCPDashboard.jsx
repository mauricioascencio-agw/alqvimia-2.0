import { useState, useRef, useEffect } from 'react'

function MCPDashboard({ connector, onClose, onOpenConfig }) {
  const [activeTab, setActiveTab] = useState('explorer')
  const [selectedTable, setSelectedTable] = useState(null)
  const [queryText, setQueryText] = useState('')
  const [queryResults, setQueryResults] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryHistory, setQueryHistory] = useState([])
  const [expandedSchemas, setExpandedSchemas] = useState([])
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [isConnected, setIsConnected] = useState(connector?.status === 'connected')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingComplete, setTrainingComplete] = useState(false)
  const [mcpStats, setMcpStats] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showDataExportMenu, setShowDataExportMenu] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  const [tableData, setTableData] = useState(null)
  const [isLoadingTableData, setIsLoadingTableData] = useState(false)
  const queryEditorRef = useRef(null)

  // Chat IA State
  const [showAiChat, setShowAiChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [schemaContext, setSchemaContext] = useState(null)
  const chatEndRef = useRef(null)

  // Results Viewer State
  const [resultsViewMode, setResultsViewMode] = useState('grid') // grid, chart, dashboard
  const [chartType, setChartType] = useState('bar') // bar, line, pie, area, donut
  const [selectedColumns, setSelectedColumns] = useState({ x: null, y: null })
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' })
  const [filterText, setFilterText] = useState('')
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Analytics Modal State
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [analyticsTab, setAnalyticsTab] = useState('charts') // charts, dashboard, statistics, export
  const [analysisResults, setAnalysisResults] = useState(null)

  // Connection Wizard State
  const [showConnectionWizard, setShowConnectionWizard] = useState(false)
  const [wizardTab, setWizardTab] = useState('general')
  const [connectionConfig, setConnectionConfig] = useState({
    // General
    connectBy: 'host', // 'host' or 'url'
    host: 'localhost',
    port: getDefaultPort(connector?.name),
    database: '',
    url: '',
    // Authentication
    authType: 'credentials', // 'credentials', 'no_auth', 'token', 'ssh'
    username: '',
    password: '',
    savePassword: true,
    // Advanced
    connectionTimeout: 30,
    queryTimeout: 0,
    autoCommit: true,
    readOnly: false,
    ssl: false,
    sslMode: 'prefer',
    // Driver
    driverVersion: 'latest',
    driverPath: '',
    jvmOptions: ''
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testConnectionResult, setTestConnectionResult] = useState(null)
  const [isDownloadingDriver, setIsDownloadingDriver] = useState(false)
  const [driverDownloadProgress, setDriverDownloadProgress] = useState(0)
  const [driverInstalled, setDriverInstalled] = useState(false)

  // Helper function to get default port by database type
  function getDefaultPort(dbName) {
    const ports = {
      'PostgreSQL': 5432,
      'MySQL': 3306,
      'MariaDB': 3306,
      'SQL Server': 1433,
      'Oracle': 1521,
      'MongoDB': 27017,
      'Redis': 6379,
      'SQLite': 0,
      'Cassandra': 9042,
      'CockroachDB': 26257,
      'ClickHouse': 8123,
      'TimescaleDB': 5432,
      'Neo4j': 7687,
      'InfluxDB': 8086,
      'Elasticsearch': 9200
    }
    return ports[dbName] || 5432
  }

  // Get driver info based on connector
  const getDriverInfo = () => {
    const drivers = {
      'PostgreSQL': { name: 'PostgreSQL JDBC Driver', version: '42.7.1', size: '1.2 MB', url: 'https://jdbc.postgresql.org/' },
      'MySQL': { name: 'MySQL Connector/J', version: '8.2.0', size: '2.4 MB', url: 'https://dev.mysql.com/downloads/connector/j/' },
      'MariaDB': { name: 'MariaDB Connector/J', version: '3.3.2', size: '0.6 MB', url: 'https://mariadb.com/downloads/connectors/' },
      'SQL Server': { name: 'Microsoft JDBC Driver', version: '12.4.2', size: '3.1 MB', url: 'https://docs.microsoft.com/sql/connect/jdbc/' },
      'Oracle': { name: 'Oracle JDBC Driver (ojdbc11)', version: '23.3.0', size: '4.8 MB', url: 'https://www.oracle.com/database/technologies/appdev/jdbc.html' },
      'MongoDB': { name: 'MongoDB Java Driver', version: '4.11.1', size: '2.1 MB', url: 'https://mongodb.github.io/mongo-java-driver/' },
      'SQLite': { name: 'SQLite JDBC', version: '3.44.1', size: '7.8 MB', url: 'https://github.com/xerial/sqlite-jdbc' },
      'Redis': { name: 'Jedis Client', version: '5.1.0', size: '0.8 MB', url: 'https://github.com/redis/jedis' }
    }
    return drivers[connector?.name] || { name: 'Generic JDBC Driver', version: '1.0.0', size: '1.0 MB', url: '#' }
  }

  // Test connection
  const testConnection = async () => {
    setIsTestingConnection(true)
    setTestConnectionResult(null)

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock result - in real implementation this would actually test the connection
    const success = connectionConfig.host && connectionConfig.database
    setTestConnectionResult({
      success,
      message: success
        ? `Conexión exitosa a ${connectionConfig.database}@${connectionConfig.host}:${connectionConfig.port}`
        : 'Error: Verifica los datos de conexión. Host y base de datos son requeridos.',
      details: success ? {
        serverVersion: connector?.name + ' 15.4',
        connectionTime: '234ms',
        serverInfo: `${connectionConfig.host}:${connectionConfig.port}`
      } : null
    })
    setIsTestingConnection(false)
  }

  // Download driver
  const downloadDriver = async () => {
    setIsDownloadingDriver(true)
    setDriverDownloadProgress(0)

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setDriverDownloadProgress(i)
    }

    setIsDownloadingDriver(false)
    setDriverInstalled(true)
  }

  // Save connection and connect
  const saveAndConnect = async () => {
    // Save configuration
    console.log('Saving connection config:', connectionConfig)

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update connection status
    setIsConnected(true)
    setShowConnectionWizard(false)
  }

  // Database schema - se carga desde la API
  const [schema, setSchema] = useState(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaError, setSchemaError] = useState(null)

  // URL del backend
  const API_BASE = 'http://localhost:4000/api/mcp'

  // Cargar esquema cuando hay conexión real
  useEffect(() => {
    if (isConnected) {
      loadSchema()
    }
  }, [isConnected])

  const loadSchema = async () => {
    setSchemaLoading(true)
    setSchemaError(null)

    try {
      const response = await fetch(`${API_BASE}/schema`)
      const result = await response.json()

      if (result.success) {
        setSchema(result.data)
        // Expandir automáticamente el primer esquema
        if (result.data.schemas?.length > 0) {
          setExpandedSchemas([result.data.schemas[0].name])
        }
      } else {
        setSchemaError(result.error || 'Error al cargar el esquema')
      }
    } catch (error) {
      console.error('[MCPDashboard] Error cargando schema:', error)
      setSchemaError('No se pudo conectar con el servidor')
    } finally {
      setSchemaLoading(false)
    }
  }

  // Cargar datos de una tabla específica
  const loadTableData = async (tableName) => {
    setIsLoadingTableData(true)
    setTableData(null)

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: `SELECT * FROM ${tableName} LIMIT 100`, limit: 100 })
      })
      const result = await response.json()

      if (result.success) {
        setTableData(result.data)
      }
    } catch (error) {
      console.error('[MCPDashboard] Error cargando datos de tabla:', error)
    } finally {
      setIsLoadingTableData(false)
    }
  }

  // Desconectar del servidor
  const handleDisconnect = () => {
    setIsConnected(false)
    setSchema(null)
    setSelectedTable(null)
    setQueryResults(null)
    setTableData(null)
    setTrainingComplete(false)
    setMcpStats(null)
  }

  // Obtener documentación del conector
  const getConnectorDocs = () => {
    const docs = {
      'MySQL': {
        title: 'MySQL - Documentación',
        url: 'https://dev.mysql.com/doc/',
        quickRef: [
          { cmd: 'SHOW DATABASES', desc: 'Listar todas las bases de datos' },
          { cmd: 'SHOW TABLES', desc: 'Listar tablas de la BD actual' },
          { cmd: 'DESCRIBE tabla', desc: 'Ver estructura de una tabla' },
          { cmd: 'SHOW CREATE TABLE tabla', desc: 'Ver DDL de creación' },
          { cmd: 'SHOW PROCESSLIST', desc: 'Ver procesos activos' },
          { cmd: 'SHOW VARIABLES', desc: 'Ver variables del servidor' },
          { cmd: 'EXPLAIN SELECT...', desc: 'Analizar plan de ejecución' }
        ],
        tips: [
          'Usa LIMIT para evitar cargar demasiados registros',
          'Los índices mejoran significativamente las consultas WHERE',
          'Usa transacciones para operaciones múltiples relacionadas'
        ]
      },
      'MariaDB': {
        title: 'MariaDB - Documentación',
        url: 'https://mariadb.com/kb/en/',
        quickRef: [
          { cmd: 'SHOW DATABASES', desc: 'Listar todas las bases de datos' },
          { cmd: 'SHOW TABLES', desc: 'Listar tablas de la BD actual' },
          { cmd: 'DESCRIBE tabla', desc: 'Ver estructura de una tabla' },
          { cmd: 'SHOW ENGINE INNODB STATUS', desc: 'Estado del motor InnoDB' },
          { cmd: 'SHOW SLAVE STATUS', desc: 'Estado de replicación' }
        ],
        tips: [
          'MariaDB es compatible con MySQL pero tiene características adicionales',
          'Soporta motores de almacenamiento como Aria y ColumnStore',
          'Usa Galera Cluster para alta disponibilidad'
        ]
      },
      'PostgreSQL': {
        title: 'PostgreSQL - Documentación',
        url: 'https://www.postgresql.org/docs/',
        quickRef: [
          { cmd: '\\l', desc: 'Listar bases de datos' },
          { cmd: '\\dt', desc: 'Listar tablas' },
          { cmd: '\\d tabla', desc: 'Describir tabla' },
          { cmd: 'EXPLAIN ANALYZE', desc: 'Plan de ejecución detallado' },
          { cmd: 'pg_stat_activity', desc: 'Ver conexiones activas' }
        ],
        tips: [
          'PostgreSQL soporta JSON nativo y búsqueda full-text',
          'Usa CTEs (WITH) para consultas complejas',
          'VACUUM ANALYZE mantiene estadísticas actualizadas'
        ]
      },
      'SQL Server': {
        title: 'SQL Server - Documentación',
        url: 'https://learn.microsoft.com/en-us/sql/',
        quickRef: [
          { cmd: 'sp_help tabla', desc: 'Información de tabla' },
          { cmd: 'sp_who2', desc: 'Ver procesos activos' },
          { cmd: 'SET STATISTICS IO ON', desc: 'Ver I/O de consultas' },
          { cmd: 'sys.dm_exec_query_stats', desc: 'Estadísticas de queries' },
          { cmd: 'DBCC CHECKDB', desc: 'Verificar integridad de BD' }
        ],
        tips: [
          'Usa índices columnstore para analytics',
          'Query Store ayuda a identificar regresiones',
          'Always Encrypted protege datos sensibles'
        ]
      },
      'Oracle': {
        title: 'Oracle Database - Documentación',
        url: 'https://docs.oracle.com/en/database/',
        quickRef: [
          { cmd: 'SELECT * FROM all_tables', desc: 'Listar todas las tablas' },
          { cmd: 'DESC tabla', desc: 'Describir estructura de tabla' },
          { cmd: 'SELECT * FROM v$session', desc: 'Ver sesiones activas' },
          { cmd: 'EXPLAIN PLAN FOR', desc: 'Analizar plan de ejecución' },
          { cmd: 'SELECT * FROM dba_users', desc: 'Listar usuarios' }
        ],
        tips: [
          'Usa ROWNUM o FETCH FIRST para limitar resultados',
          'Oracle soporta PL/SQL para procedimientos almacenados',
          'AWR y ASH son útiles para diagnóstico de rendimiento'
        ]
      },
      'MongoDB': {
        title: 'MongoDB - Documentación',
        url: 'https://www.mongodb.com/docs/',
        quickRef: [
          { cmd: 'db.collection.find()', desc: 'Buscar documentos' },
          { cmd: 'db.collection.aggregate()', desc: 'Pipeline de agregación' },
          { cmd: 'db.collection.createIndex()', desc: 'Crear índice' },
          { cmd: 'db.collection.explain()', desc: 'Analizar plan de query' },
          { cmd: 'db.stats()', desc: 'Estadísticas de la base de datos' }
        ],
        tips: [
          'Diseña esquemas según patrones de acceso',
          'Usa proyecciones para limitar campos retornados',
          'Los índices compuestos siguen el orden de los campos'
        ]
      },
      'Redis': {
        title: 'Redis - Documentación',
        url: 'https://redis.io/docs/',
        quickRef: [
          { cmd: 'KEYS *', desc: 'Listar todas las claves (cuidado en prod)' },
          { cmd: 'GET clave', desc: 'Obtener valor de una clave' },
          { cmd: 'SET clave valor', desc: 'Establecer un valor' },
          { cmd: 'HGETALL hash', desc: 'Obtener todos los campos de un hash' },
          { cmd: 'INFO', desc: 'Información del servidor' }
        ],
        tips: [
          'Usa SCAN en lugar de KEYS en producción',
          'Redis es ideal para caché, sesiones y colas',
          'Configura maxmemory-policy para manejo de memoria'
        ]
      },
      'SQLite': {
        title: 'SQLite - Documentación',
        url: 'https://www.sqlite.org/docs.html',
        quickRef: [
          { cmd: '.tables', desc: 'Listar tablas' },
          { cmd: '.schema tabla', desc: 'Ver esquema de tabla' },
          { cmd: 'PRAGMA table_info(tabla)', desc: 'Información de columnas' },
          { cmd: '.dump', desc: 'Exportar base de datos' },
          { cmd: 'VACUUM', desc: 'Optimizar base de datos' }
        ],
        tips: [
          'SQLite es ideal para aplicaciones embebidas',
          'No requiere servidor, todo en un archivo',
          'Soporta transacciones ACID completas'
        ]
      },
      'Cassandra': {
        title: 'Apache Cassandra - Documentación',
        url: 'https://cassandra.apache.org/doc/latest/',
        quickRef: [
          { cmd: 'DESCRIBE KEYSPACES', desc: 'Listar keyspaces' },
          { cmd: 'DESCRIBE TABLES', desc: 'Listar tablas del keyspace actual' },
          { cmd: 'DESCRIBE TABLE tabla', desc: 'Ver estructura de tabla' },
          { cmd: 'TRACING ON', desc: 'Activar tracing de queries' },
          { cmd: 'CONSISTENCY', desc: 'Ver/establecer nivel de consistencia' }
        ],
        tips: [
          'Diseña tablas basándote en las queries que harás',
          'La partition key determina la distribución de datos',
          'Evita queries que escaneen múltiples particiones'
        ]
      },
      'Elasticsearch': {
        title: 'Elasticsearch - Documentación',
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/',
        quickRef: [
          { cmd: 'GET _cat/indices', desc: 'Listar índices' },
          { cmd: 'GET index/_search', desc: 'Buscar en un índice' },
          { cmd: 'GET _cluster/health', desc: 'Estado del cluster' },
          { cmd: 'PUT index/_mapping', desc: 'Definir mapping' },
          { cmd: 'POST _bulk', desc: 'Operaciones en lote' }
        ],
        tips: [
          'Elasticsearch es ideal para búsqueda full-text',
          'Usa mappings explícitos para mejor rendimiento',
          'Los shards no se pueden cambiar después de crear el índice'
        ]
      },
      'Neo4j': {
        title: 'Neo4j - Documentación',
        url: 'https://neo4j.com/docs/',
        quickRef: [
          { cmd: 'MATCH (n) RETURN n LIMIT 25', desc: 'Ver primeros 25 nodos' },
          { cmd: 'MATCH (n)-[r]->(m) RETURN n,r,m', desc: 'Ver relaciones' },
          { cmd: 'CREATE (n:Label {prop: valor})', desc: 'Crear nodo' },
          { cmd: 'CALL db.schema.visualization()', desc: 'Ver esquema visual' },
          { cmd: 'PROFILE MATCH...', desc: 'Analizar plan de ejecución' }
        ],
        tips: [
          'Neo4j usa Cypher como lenguaje de consulta',
          'Los índices mejoran búsquedas por propiedad',
          'Ideal para datos altamente conectados'
        ]
      },
      'InfluxDB': {
        title: 'InfluxDB - Documentación',
        url: 'https://docs.influxdata.com/influxdb/',
        quickRef: [
          { cmd: 'SHOW DATABASES', desc: 'Listar bases de datos' },
          { cmd: 'SHOW MEASUREMENTS', desc: 'Listar mediciones' },
          { cmd: 'SHOW TAG KEYS', desc: 'Ver claves de tags' },
          { cmd: 'SHOW FIELD KEYS', desc: 'Ver claves de campos' },
          { cmd: 'SELECT * FROM measurement LIMIT 10', desc: 'Consultar datos' }
        ],
        tips: [
          'InfluxDB está optimizado para series temporales',
          'Usa tags para datos indexados, fields para valores',
          'Configura retention policies para manejo de datos históricos'
        ]
      },
      'CockroachDB': {
        title: 'CockroachDB - Documentación',
        url: 'https://www.cockroachlabs.com/docs/',
        quickRef: [
          { cmd: 'SHOW DATABASES', desc: 'Listar bases de datos' },
          { cmd: 'SHOW TABLES', desc: 'Listar tablas' },
          { cmd: 'SHOW RANGES FROM TABLE tabla', desc: 'Ver distribución de datos' },
          { cmd: 'EXPLAIN ANALYZE', desc: 'Plan de ejecución detallado' },
          { cmd: 'SHOW JOBS', desc: 'Ver trabajos en ejecución' }
        ],
        tips: [
          'CockroachDB es compatible con PostgreSQL',
          'Diseñado para ser distribuido y resiliente',
          'Soporta transacciones ACID distribuidas'
        ]
      },
      'ClickHouse': {
        title: 'ClickHouse - Documentación',
        url: 'https://clickhouse.com/docs/',
        quickRef: [
          { cmd: 'SHOW DATABASES', desc: 'Listar bases de datos' },
          { cmd: 'SHOW TABLES', desc: 'Listar tablas' },
          { cmd: 'DESCRIBE TABLE tabla', desc: 'Ver estructura de tabla' },
          { cmd: 'EXPLAIN SELECT...', desc: 'Plan de ejecución' },
          { cmd: 'SYSTEM FLUSH LOGS', desc: 'Forzar escritura de logs' }
        ],
        tips: [
          'ClickHouse está optimizado para OLAP y analytics',
          'Usa tablas MergeTree para mejor rendimiento',
          'Las columnas se comprimen automáticamente'
        ]
      },
      'TimescaleDB': {
        title: 'TimescaleDB - Documentación',
        url: 'https://docs.timescale.com/',
        quickRef: [
          { cmd: 'SELECT create_hypertable(...)', desc: 'Crear hypertable' },
          { cmd: 'SELECT * FROM timescaledb_information.hypertables', desc: 'Ver hypertables' },
          { cmd: 'SELECT time_bucket(...)', desc: 'Agregación por tiempo' },
          { cmd: 'CALL add_retention_policy(...)', desc: 'Política de retención' },
          { cmd: 'SELECT approximate_row_count(...)', desc: 'Conteo aproximado' }
        ],
        tips: [
          'TimescaleDB extiende PostgreSQL para series temporales',
          'Las hypertables particionan automáticamente por tiempo',
          'Usa continuous aggregates para consultas rápidas'
        ]
      }
    }
    return docs[connector?.name] || {
      title: `${connector?.name} - Documentación`,
      url: `https://www.google.com/search?q=${encodeURIComponent(connector?.name + ' database documentation')}`,
      quickRef: [
        { cmd: 'SELECT * FROM tabla LIMIT 10', desc: 'Consultar datos (SQL estándar)' },
        { cmd: 'SHOW TABLES', desc: 'Listar tablas (si es compatible)' }
      ],
      tips: [
        'Consulta la documentación oficial del conector',
        'Verifica la sintaxis específica de tu base de datos'
      ]
    }
  }

  // Exportar datos de tabla
  const exportTableData = (format) => {
    if (!tableData || !tableData.rows) return

    let content = ''
    let filename = `${selectedTable?.name || 'data'}_export`
    let mimeType = 'text/plain'

    switch (format) {
      case 'csv':
        content = tableData.columns.join(',') + '\n' +
          tableData.rows.map(row =>
            tableData.columns.map(col => `"${row[col] ?? ''}"`).join(',')
          ).join('\n')
        filename += '.csv'
        mimeType = 'text/csv'
        break
      case 'json':
        content = JSON.stringify(tableData.rows, null, 2)
        filename += '.json'
        mimeType = 'application/json'
        break
      case 'sql':
        content = tableData.rows.map(row => {
          const values = tableData.columns.map(col => {
            const val = row[col]
            if (val === null) return 'NULL'
            if (typeof val === 'number') return val
            return `'${String(val).replace(/'/g, "''")}'`
          }).join(', ')
          return `INSERT INTO ${selectedTable?.name} (${tableData.columns.join(', ')}) VALUES (${values});`
        }).join('\n')
        filename += '.sql'
        mimeType = 'text/sql'
        break
      case 'excel':
        content = tableData.columns.join('\t') + '\n' +
          tableData.rows.map(row =>
            tableData.columns.map(col => row[col] ?? '').join('\t')
          ).join('\n')
        filename += '.xls'
        mimeType = 'application/vnd.ms-excel'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowDataExportMenu(false)
  }

  // Entrenar MCP - Analizar todas las tablas y vistas REALES
  const trainMCP = async () => {
    if (!schema) return

    setIsTraining(true)

    try {
      // Calcular estadísticas reales del schema
      const totalTables = schema.schemas.reduce((acc, s) => acc + s.tables.length, 0)
      const totalViews = schema.schemas.reduce((acc, s) => acc + s.views.length, 0)
      const totalFunctions = schema.schemas.reduce((acc, s) => acc + s.functions.length, 0)
      const totalColumns = schema.schemas.reduce((acc, s) =>
        acc + s.tables.reduce((acc2, t) => acc2 + t.columns.length, 0), 0)
      const totalRows = schema.schemas.reduce((acc, s) =>
        acc + s.tables.reduce((acc2, t) => acc2 + (t.rowCount || 0), 0), 0)
      const totalIndexes = schema.schemas.reduce((acc, s) =>
        acc + s.tables.reduce((acc2, t) => acc2 + (t.indexes?.length || 0), 0), 0)

      // Detectar relaciones reales (foreign keys)
      const foreignKeys = []
      schema.schemas.forEach(s => {
        s.tables.forEach(t => {
          t.columns.forEach(c => {
            if (c.foreignKey) {
              foreignKeys.push({
                from: `${t.name}.${c.name}`,
                to: c.foreignKey
              })
            }
            // Detectar posibles FKs por convención de nombres (_id)
            if (c.name.endsWith('_id') && !c.primaryKey) {
              const possibleTable = c.name.replace('_id', '')
              const targetTable = s.tables.find(t2 =>
                t2.name === possibleTable ||
                t2.name === possibleTable + 's' ||
                t2.name === possibleTable + 'es'
              )
              if (targetTable && !c.foreignKey) {
                foreignKeys.push({
                  from: `${t.name}.${c.name}`,
                  to: `${targetTable.name}.id`,
                  inferred: true
                })
              }
            }
          })
        })
      })

      // Generar recomendaciones basadas en la estructura real
      const recommendations = []
      schema.schemas.forEach(s => {
        s.tables.forEach(t => {
          // Tablas grandes sin índices
          if (t.rowCount > 1000 && (!t.indexes || t.indexes.length <= 1)) {
            recommendations.push({
              type: 'index',
              message: `La tabla "${t.name}" tiene ${t.rowCount.toLocaleString()} filas pero pocos índices`
            })
          }
          // Columnas datetime sin índice
          t.columns.forEach(c => {
            if ((c.type.includes('datetime') || c.type.includes('timestamp')) && c.name.includes('created')) {
              recommendations.push({
                type: 'optimization',
                message: `Considera índice en "${t.name}.${c.name}" para consultas por fecha`
              })
            }
          })
        })
      })

      // Crear contexto del schema para el chat IA
      const context = {
        database: schema.database,
        tables: schema.schemas.flatMap(s => s.tables.map(t => ({
          name: t.name,
          columns: t.columns.map(c => ({
            name: c.name,
            type: c.type,
            primaryKey: c.primaryKey,
            nullable: c.nullable
          })),
          rowCount: t.rowCount
        }))),
        views: schema.schemas.flatMap(s => s.views),
        relationships: foreignKeys
      }
      setSchemaContext(context)

      setMcpStats({
        totalTables,
        totalViews,
        totalFunctions,
        totalColumns,
        totalRows,
        totalIndexes,
        foreignKeys,
        analyzedAt: new Date().toISOString(),
        recommendations: recommendations.slice(0, 5)
      })

      setTrainingComplete(true)
      generateAiSuggestions(schema)

      // Mostrar mensaje en chat
      setChatMessages([{
        role: 'assistant',
        content: `¡MCP entrenado! He analizado ${totalTables} tablas con ${totalColumns} columnas y ${totalRows.toLocaleString()} registros. Puedo ayudarte a:\n\n• Generar consultas SQL\n• Crear dashboards\n• Analizar datos\n• Optimizar queries\n\n¿Qué necesitas?`
      }])
      setShowAiChat(true)

    } catch (error) {
      console.error('[MCP] Error en entrenamiento:', error)
    } finally {
      setIsTraining(false)
    }
  }

  // Generar sugerencias de AI basadas en las tablas REALES
  const generateAiSuggestions = (schemaData) => {
    if (!schemaData?.schemas) return

    const suggestions = []
    const tables = schemaData.schemas.flatMap(s => s.tables)

    // Buscar tablas con datos de usuarios
    const userTable = tables.find(t =>
      t.name.includes('usuario') || t.name.includes('user')
    )
    if (userTable) {
      suggestions.push({
        type: 'query',
        title: 'Listado de usuarios',
        description: `Ver todos los registros de ${userTable.name}`,
        query: `SELECT * FROM ${userTable.name} ORDER BY id DESC LIMIT 50;`
      })
    }

    // Buscar tablas de workflows/ejecuciones
    const workflowTable = tables.find(t => t.name.includes('workflow'))
    const ejecucionesTable = tables.find(t => t.name.includes('ejecucion'))
    if (workflowTable) {
      suggestions.push({
        type: 'dashboard',
        title: 'Dashboard de Workflows',
        description: 'Resumen de workflows por estado',
        query: `SELECT
  estado,
  COUNT(*) as total,
  MAX(updated_at) as ultima_actualizacion
FROM ${workflowTable.name}
GROUP BY estado
ORDER BY total DESC;`
      })
    }
    if (ejecucionesTable) {
      suggestions.push({
        type: 'dashboard',
        title: 'Ejecuciones recientes',
        description: 'Últimas ejecuciones con su estado',
        query: `SELECT
  e.*,
  w.nombre as workflow_nombre
FROM ${ejecucionesTable.name} e
LEFT JOIN workflows w ON e.workflow_id = w.id
ORDER BY e.created_at DESC
LIMIT 20;`
      })
    }

    // Buscar tablas de configuración
    const configTable = tables.find(t => t.name.includes('config'))
    if (configTable) {
      suggestions.push({
        type: 'query',
        title: 'Configuraciones del sistema',
        description: `Ver configuraciones en ${configTable.name}`,
        query: `SELECT * FROM ${configTable.name};`
      })
    }

    // Buscar tablas de logs
    const logTable = tables.find(t => t.name.includes('log'))
    if (logTable) {
      suggestions.push({
        type: 'analysis',
        title: 'Análisis de logs',
        description: 'Logs agrupados por nivel/categoría',
        query: `SELECT
  nivel,
  categoria,
  COUNT(*) as total,
  MAX(created_at) as ultimo
FROM ${logTable.name}
GROUP BY nivel, categoria
ORDER BY total DESC;`
      })
    }

    // Buscar tablas de plantillas
    const plantillasTable = tables.find(t => t.name.includes('plantilla'))
    if (plantillasTable) {
      suggestions.push({
        type: 'query',
        title: 'Plantillas disponibles',
        description: `Listar plantillas de ${plantillasTable.name}`,
        query: `SELECT id, nombre, descripcion, activo FROM ${plantillasTable.name} WHERE activo = 1;`
      })
    }

    // Buscar tablas de conexiones MCP
    const mcpTable = tables.find(t => t.name.includes('mcp') || t.name.includes('conexion'))
    if (mcpTable) {
      suggestions.push({
        type: 'dashboard',
        title: 'Conexiones MCP',
        description: 'Estado de conexiones a servicios',
        query: `SELECT
  tipo,
  nombre,
  estado,
  ultimo_uso
FROM ${mcpTable.name}
ORDER BY ultimo_uso DESC;`
      })
    }

    // Agregar consultas genéricas basadas en las tablas más grandes
    const largestTables = [...tables]
      .filter(t => t.rowCount > 0)
      .sort((a, b) => b.rowCount - a.rowCount)
      .slice(0, 3)

    largestTables.forEach(t => {
      if (!suggestions.find(s => s.query.includes(t.name))) {
        suggestions.push({
          type: 'analysis',
          title: `Análisis de ${t.name}`,
          description: `${t.rowCount.toLocaleString()} registros - ver estructura`,
          query: `SELECT * FROM ${t.name} LIMIT 100;`
        })
      }
    })

    // Agregar sugerencia de conteo general
    if (tables.length > 0) {
      const countQueries = tables.slice(0, 10).map(t =>
        `SELECT '${t.name}' as tabla, COUNT(*) as registros FROM ${t.name}`
      ).join('\nUNION ALL\n')

      suggestions.push({
        type: 'dashboard',
        title: 'Resumen de todas las tablas',
        description: 'Conteo de registros por tabla',
        query: countQueries + '\nORDER BY registros DESC;'
      })
    }

    setAiSuggestions(suggestions.slice(0, 8))
  }

  // Chat con IA - Procesar mensaje
  const handleChatSubmit = async (e) => {
    e?.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatLoading(true)

    try {
      // Generar respuesta basada en el contexto del schema
      const response = await generateChatResponse(userMessage, schemaContext)
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.text, sql: response.sql }])
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error procesando tu consulta. Intenta de nuevo.'
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Generar respuesta del chat basada en contexto
  const generateChatResponse = async (question, context) => {
    const q = question.toLowerCase()

    // Detectar intención del usuario
    if (q.includes('tabla') || q.includes('table')) {
      if (q.includes('cuantas') || q.includes('cuántas') || q.includes('listar') || q.includes('mostrar')) {
        const tableList = context.tables.map(t => `• **${t.name}** (${t.rowCount} registros)`).join('\n')
        return {
          text: `Hay **${context.tables.length} tablas** en la base de datos:\n\n${tableList}`
        }
      }
    }

    if (q.includes('usuario') || q.includes('user')) {
      const userTable = context.tables.find(t => t.name.includes('usuario') || t.name.includes('user'))
      if (userTable) {
        return {
          text: `La tabla de usuarios es **${userTable.name}** con ${userTable.rowCount} registros.\n\nColumnas: ${userTable.columns.map(c => c.name).join(', ')}`,
          sql: `SELECT * FROM ${userTable.name} LIMIT 20;`
        }
      }
    }

    if (q.includes('workflow') || q.includes('flujo')) {
      const wfTable = context.tables.find(t => t.name.includes('workflow'))
      if (wfTable) {
        return {
          text: `Encontré la tabla **${wfTable.name}** con ${wfTable.rowCount} workflows.`,
          sql: `SELECT id, nombre, estado, created_at FROM ${wfTable.name} ORDER BY created_at DESC LIMIT 20;`
        }
      }
    }

    if (q.includes('ejecut') || q.includes('ejecucion')) {
      const execTable = context.tables.find(t => t.name.includes('ejecucion'))
      if (execTable) {
        return {
          text: `La tabla **${execTable.name}** contiene el historial de ejecuciones.`,
          sql: `SELECT * FROM ${execTable.name} ORDER BY created_at DESC LIMIT 30;`
        }
      }
    }

    if (q.includes('dashboard') || q.includes('resumen') || q.includes('estadistica')) {
      const countQueries = context.tables.slice(0, 8).map(t =>
        `SELECT '${t.name}' as tabla, COUNT(*) as total FROM ${t.name}`
      ).join(' UNION ALL ')
      return {
        text: `Aquí tienes un resumen de las tablas principales:`,
        sql: countQueries + ' ORDER BY total DESC;'
      }
    }

    if (q.includes('log')) {
      const logTable = context.tables.find(t => t.name.includes('log'))
      if (logTable) {
        return {
          text: `Los logs se almacenan en **${logTable.name}**.`,
          sql: `SELECT * FROM ${logTable.name} ORDER BY created_at DESC LIMIT 50;`
        }
      }
    }

    if (q.includes('config')) {
      const configTable = context.tables.find(t => t.name.includes('config'))
      if (configTable) {
        return {
          text: `Las configuraciones están en **${configTable.name}**.`,
          sql: `SELECT * FROM ${configTable.name};`
        }
      }
    }

    // Detectar si pide SQL específico
    if (q.includes('select') || q.includes('query') || q.includes('consulta') || q.includes('sql')) {
      // Intentar identificar la tabla mencionada
      const mentionedTable = context.tables.find(t => q.includes(t.name.toLowerCase()))
      if (mentionedTable) {
        return {
          text: `Aquí tienes una consulta para **${mentionedTable.name}**:`,
          sql: `SELECT * FROM ${mentionedTable.name} LIMIT 100;`
        }
      }
    }

    // Respuesta por defecto
    return {
      text: `Puedo ayudarte con:\n\n• **"muestra las tablas"** - Ver todas las tablas\n• **"usuarios"** - Consultar usuarios\n• **"workflows"** - Ver flujos de trabajo\n• **"dashboard"** - Resumen estadístico\n• **"logs"** - Ver registros del sistema\n\n¿Qué información necesitas?`
    }
  }

  // Scroll al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Ejecutar SQL desde el chat
  const executeChatSQL = (sql) => {
    setQueryText(sql)
    setActiveTab('query')
    executeQuery()
  }

  useEffect(() => {
    if (trainingComplete && schema) {
      generateAiSuggestions(schema)
    }
  }, [trainingComplete])

  // Ejecutar query real
  const executeQuery = async () => {
    if (!queryText.trim()) return

    setIsExecuting(true)

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: queryText, limit: 100 })
      })

      const result = await response.json()

      if (result.success) {
        setQueryResults(result.data)
        setQueryHistory(prev => [{
          query: queryText,
          timestamp: new Date().toISOString(),
          rowCount: result.data.rowCount,
          executionTime: result.data.executionTime,
          success: true
        }, ...prev.slice(0, 19)])
      } else {
        // Mostrar error en resultados
        setQueryResults({
          error: true,
          message: result.error,
          sqlState: result.sqlState,
          errno: result.errno
        })
        setQueryHistory(prev => [{
          query: queryText,
          timestamp: new Date().toISOString(),
          error: result.error,
          success: false
        }, ...prev.slice(0, 19)])
      }
    } catch (error) {
      console.error('[MCPDashboard] Error ejecutando query:', error)
      setQueryResults({
        error: true,
        message: 'No se pudo conectar con el servidor'
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Toggle schema expanded
  const toggleSchema = (schemaName) => {
    setExpandedSchemas(prev =>
      prev.includes(schemaName)
        ? prev.filter(s => s !== schemaName)
        : [...prev, schemaName]
    )
  }

  // Generar SELECT para una tabla
  const generateSelectForTable = (table) => {
    const columns = table.columns.map(c => c.name).join(', ')
    return `SELECT ${columns}\nFROM ${table.name}\nLIMIT 100;`
  }

  // Aplicar sugerencia de AI
  const applySuggestion = (suggestion) => {
    setQueryText(suggestion.query)
    setActiveTab('query')
  }

  // Funciones de exportación
  const exportToCSV = () => {
    if (!queryResults) return
    const headers = queryResults.columns.join(',')
    const rows = queryResults.rows.map(row =>
      queryResults.columns.map(col => `"${row[col]}"`).join(',')
    ).join('\n')
    const csv = `${headers}\n${rows}`
    downloadFile(csv, 'export.csv', 'text/csv')
  }

  const exportToJSON = () => {
    if (!queryResults) return
    const json = JSON.stringify(queryResults.rows, null, 2)
    downloadFile(json, 'export.json', 'application/json')
  }

  const exportToExcel = () => {
    // Crear un formato simple de Excel (TSV que Excel puede abrir)
    if (!queryResults) return
    const headers = queryResults.columns.join('\t')
    const rows = queryResults.rows.map(row =>
      queryResults.columns.map(col => row[col]).join('\t')
    ).join('\n')
    const tsv = `${headers}\n${rows}`
    downloadFile(tsv, 'export.xls', 'application/vnd.ms-excel')
  }

  const exportToText = () => {
    if (!queryResults) return
    let text = queryResults.columns.join(' | ') + '\n'
    text += '-'.repeat(50) + '\n'
    text += queryResults.rows.map(row =>
      queryResults.columns.map(col => row[col]).join(' | ')
    ).join('\n')
    downloadFile(text, 'export.txt', 'text/plain')
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const tabs = [
    { id: 'explorer', label: 'Explorador', icon: 'fa-folder-tree' },
    { id: 'query', label: 'Editor SQL', icon: 'fa-code' },
    { id: 'data', label: 'Datos', icon: 'fa-table' },
    { id: 'ai', label: 'IA Assistant', icon: 'fa-robot' },
    { id: 'history', label: 'Historial', icon: 'fa-history' }
  ]

  // Si no está conectado, mostrar pantalla de configuración
  if (!isConnected) {
    return (
      <div className="mcp-dashboard-overlay">
        <div className="mcp-dashboard">
          <div className="mcp-dashboard-header">
            <div className="mcp-dashboard-title">
              <div className="connector-badge" style={{ background: connector.color }}>
                <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
              </div>
              <div>
                <h2>{connector.name}</h2>
                <span className="connection-status disconnected">
                  <i className="fas fa-circle"></i> Desconectado
                </span>
              </div>
            </div>
            <div className="mcp-dashboard-actions">
              <button className="btn btn-sm btn-danger" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="mcp-connection-required">
            <div className="connection-icon">
              <i className="fas fa-plug"></i>
            </div>
            <h3>Conexión requerida</h3>
            <p>Configura la conexión a {connector.name} para acceder al explorador de esquemas y el editor SQL.</p>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                if (onOpenConfig) {
                  onOpenConfig(connector)
                }
              }}
            >
              <i className="fas fa-cog"></i> Configurar conexión
            </button>

            <div className="connection-help">
              <h4>Necesitarás:</h4>
              <ul>
                {connector.type === 'database' && (
                  <>
                    <li><i className="fas fa-server"></i> Host y puerto del servidor</li>
                    <li><i className="fas fa-database"></i> Nombre de la base de datos</li>
                    <li><i className="fas fa-user"></i> Usuario y contraseña</li>
                  </>
                )}
                {connector.type === 'api' && (
                  <>
                    <li><i className="fas fa-key"></i> API Key o Token de acceso</li>
                    <li><i className="fas fa-globe"></i> URL del endpoint (si aplica)</li>
                  </>
                )}
                {connector.type === 'payment' && (
                  <>
                    <li><i className="fas fa-key"></i> API Key (pública y secreta)</li>
                    <li><i className="fas fa-toggle-on"></i> Modo (sandbox/producción)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connection Wizard Modal Component
  const ConnectionWizard = () => {
    const driverInfo = getDriverInfo()

    return (
      <div className="connection-wizard-overlay">
        <div className="connection-wizard">
          {/* Header */}
          <div className="wizard-header">
            <div className="wizard-title">
              <div className="connector-badge-small" style={{ background: connector.color }}>
                <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
              </div>
              <div>
                <h2>Conectar a base de datos</h2>
                <span className="wizard-subtitle">{connector.name} - Configuración de conexión</span>
              </div>
            </div>
            <button className="btn-close" onClick={() => setShowConnectionWizard(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="wizard-tabs">
            <button
              className={`wizard-tab ${wizardTab === 'general' ? 'active' : ''}`}
              onClick={() => setWizardTab('general')}
            >
              <i className="fas fa-cog"></i> General
            </button>
            <button
              className={`wizard-tab ${wizardTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setWizardTab('advanced')}
            >
              <i className="fas fa-sliders-h"></i> Avanzado
            </button>
            <button
              className={`wizard-tab ${wizardTab === 'driver' ? 'active' : ''}`}
              onClick={() => setWizardTab('driver')}
            >
              <i className="fas fa-puzzle-piece"></i> Driver
            </button>
          </div>

          {/* Content */}
          <div className="wizard-content">
            {/* General Tab */}
            {wizardTab === 'general' && (
              <div className="wizard-section">
                {/* Server Section */}
                <div className="config-section">
                  <h4><i className="fas fa-server"></i> Servidor</h4>

                  <div className="form-group">
                    <label>Conectar por:</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="connectBy"
                          value="host"
                          checked={connectionConfig.connectBy === 'host'}
                          onChange={(e) => setConnectionConfig({...connectionConfig, connectBy: e.target.value})}
                        />
                        <span>Host</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="connectBy"
                          value="url"
                          checked={connectionConfig.connectBy === 'url'}
                          onChange={(e) => setConnectionConfig({...connectionConfig, connectBy: e.target.value})}
                        />
                        <span>URL</span>
                      </label>
                    </div>
                  </div>

                  {connectionConfig.connectBy === 'url' ? (
                    <div className="form-group">
                      <label>URL de conexión:</label>
                      <input
                        type="text"
                        value={connectionConfig.url}
                        onChange={(e) => setConnectionConfig({...connectionConfig, url: e.target.value})}
                        placeholder={`jdbc:${connector.name.toLowerCase()}://localhost:${connectionConfig.port}/mydb`}
                        className="form-control"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="form-row">
                        <div className="form-group flex-2">
                          <label>Host:</label>
                          <input
                            type="text"
                            value={connectionConfig.host}
                            onChange={(e) => setConnectionConfig({...connectionConfig, host: e.target.value})}
                            placeholder="localhost"
                            className="form-control"
                          />
                        </div>
                        <div className="form-group flex-1">
                          <label>Puerto:</label>
                          <input
                            type="number"
                            value={connectionConfig.port}
                            onChange={(e) => setConnectionConfig({...connectionConfig, port: parseInt(e.target.value)})}
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Base de datos:</label>
                        <input
                          type="text"
                          value={connectionConfig.database}
                          onChange={(e) => setConnectionConfig({...connectionConfig, database: e.target.value})}
                          placeholder="nombre_base_datos"
                          className="form-control"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Authentication Section */}
                <div className="config-section">
                  <h4><i className="fas fa-key"></i> Autenticación</h4>

                  <div className="form-group">
                    <label>Tipo de autenticación:</label>
                    <select
                      value={connectionConfig.authType}
                      onChange={(e) => setConnectionConfig({...connectionConfig, authType: e.target.value})}
                      className="form-control"
                    >
                      <option value="credentials">Usuario y contraseña</option>
                      <option value="no_auth">Sin autenticación</option>
                      <option value="token">Token/API Key</option>
                      <option value="ssh">SSH Tunnel</option>
                      <option value="kerberos">Kerberos</option>
                    </select>
                  </div>

                  {connectionConfig.authType === 'credentials' && (
                    <>
                      <div className="form-group">
                        <label>Nombre de usuario:</label>
                        <input
                          type="text"
                          value={connectionConfig.username}
                          onChange={(e) => setConnectionConfig({...connectionConfig, username: e.target.value})}
                          placeholder="usuario"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                          type="password"
                          value={connectionConfig.password}
                          onChange={(e) => setConnectionConfig({...connectionConfig, password: e.target.value})}
                          placeholder="••••••••"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={connectionConfig.savePassword}
                            onChange={(e) => setConnectionConfig({...connectionConfig, savePassword: e.target.checked})}
                          />
                          <span>Guardar contraseña</span>
                        </label>
                      </div>
                    </>
                  )}

                  {connectionConfig.authType === 'token' && (
                    <div className="form-group">
                      <label>Token/API Key:</label>
                      <input
                        type="password"
                        value={connectionConfig.password}
                        onChange={(e) => setConnectionConfig({...connectionConfig, password: e.target.value})}
                        placeholder="Tu API Key o Token"
                        className="form-control"
                      />
                    </div>
                  )}
                </div>

                {/* Connection Test Result */}
                {testConnectionResult && (
                  <div className={`test-result ${testConnectionResult.success ? 'success' : 'error'}`}>
                    <div className="test-result-icon">
                      <i className={`fas ${testConnectionResult.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    </div>
                    <div className="test-result-content">
                      <p className="test-result-message">{testConnectionResult.message}</p>
                      {testConnectionResult.details && (
                        <div className="test-result-details">
                          <span><i className="fas fa-database"></i> {testConnectionResult.details.serverVersion}</span>
                          <span><i className="fas fa-clock"></i> {testConnectionResult.details.connectionTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Tab */}
            {wizardTab === 'advanced' && (
              <div className="wizard-section">
                <div className="config-section">
                  <h4><i className="fas fa-clock"></i> Tiempos de espera</h4>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Timeout de conexión (segundos):</label>
                      <input
                        type="number"
                        value={connectionConfig.connectionTimeout}
                        onChange={(e) => setConnectionConfig({...connectionConfig, connectionTimeout: parseInt(e.target.value)})}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Timeout de consulta (segundos):</label>
                      <input
                        type="number"
                        value={connectionConfig.queryTimeout}
                        onChange={(e) => setConnectionConfig({...connectionConfig, queryTimeout: parseInt(e.target.value)})}
                        className="form-control"
                        placeholder="0 = sin límite"
                      />
                    </div>
                  </div>
                </div>

                <div className="config-section">
                  <h4><i className="fas fa-cogs"></i> Opciones de conexión</h4>

                  <div className="checkbox-group">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={connectionConfig.autoCommit}
                        onChange={(e) => setConnectionConfig({...connectionConfig, autoCommit: e.target.checked})}
                      />
                      <span>Auto-commit</span>
                      <small>Confirmar automáticamente las transacciones</small>
                    </label>

                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={connectionConfig.readOnly}
                        onChange={(e) => setConnectionConfig({...connectionConfig, readOnly: e.target.checked})}
                      />
                      <span>Solo lectura</span>
                      <small>Conectar en modo de solo lectura</small>
                    </label>
                  </div>
                </div>

                <div className="config-section">
                  <h4><i className="fas fa-lock"></i> Seguridad SSL/TLS</h4>

                  <div className="form-group">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={connectionConfig.ssl}
                        onChange={(e) => setConnectionConfig({...connectionConfig, ssl: e.target.checked})}
                      />
                      <span>Usar SSL/TLS</span>
                    </label>
                  </div>

                  {connectionConfig.ssl && (
                    <div className="form-group">
                      <label>Modo SSL:</label>
                      <select
                        value={connectionConfig.sslMode}
                        onChange={(e) => setConnectionConfig({...connectionConfig, sslMode: e.target.value})}
                        className="form-control"
                      >
                        <option value="disable">Deshabilitado</option>
                        <option value="allow">Permitir</option>
                        <option value="prefer">Preferir</option>
                        <option value="require">Requerir</option>
                        <option value="verify-ca">Verificar CA</option>
                        <option value="verify-full">Verificar completo</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Driver Tab */}
            {wizardTab === 'driver' && (
              <div className="wizard-section">
                <div className="config-section">
                  <h4><i className="fas fa-puzzle-piece"></i> Información del Driver</h4>

                  <div className="driver-info-card">
                    <div className="driver-icon" style={{ background: connector.color }}>
                      <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
                    </div>
                    <div className="driver-details">
                      <h5>{driverInfo.name}</h5>
                      <p>
                        <span className="driver-version">v{driverInfo.version}</span>
                        <span className="driver-size">{driverInfo.size}</span>
                      </p>
                    </div>
                    <div className="driver-status">
                      {driverInstalled ? (
                        <span className="driver-installed">
                          <i className="fas fa-check-circle"></i> Instalado
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={downloadDriver}
                          disabled={isDownloadingDriver}
                        >
                          {isDownloadingDriver ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              {driverDownloadProgress}%
                            </>
                          ) : (
                            <>
                              <i className="fas fa-download"></i> Descargar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isDownloadingDriver && (
                    <div className="download-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${driverDownloadProgress}%` }}
                        ></div>
                      </div>
                      <p>Descargando {driverInfo.name}...</p>
                    </div>
                  )}
                </div>

                <div className="config-section">
                  <h4><i className="fas fa-folder-open"></i> Configuración del Driver</h4>

                  <div className="form-group">
                    <label>Versión del driver:</label>
                    <select
                      value={connectionConfig.driverVersion}
                      onChange={(e) => setConnectionConfig({...connectionConfig, driverVersion: e.target.value})}
                      className="form-control"
                    >
                      <option value="latest">Última versión ({driverInfo.version})</option>
                      <option value="stable">Estable</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ruta del driver (opcional):</label>
                    <div className="input-with-button">
                      <input
                        type="text"
                        value={connectionConfig.driverPath}
                        onChange={(e) => setConnectionConfig({...connectionConfig, driverPath: e.target.value})}
                        placeholder="/path/to/driver.jar"
                        className="form-control"
                      />
                      <button className="btn btn-secondary btn-sm">
                        <i className="fas fa-folder-open"></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Opciones JVM:</label>
                    <input
                      type="text"
                      value={connectionConfig.jvmOptions}
                      onChange={(e) => setConnectionConfig({...connectionConfig, jvmOptions: e.target.value})}
                      placeholder="-Xmx512m"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="config-section">
                  <h4><i className="fas fa-info-circle"></i> Licencia</h4>
                  <div className="license-info">
                    <p>
                      <i className="fas fa-check-circle"></i>
                      Este driver es de código abierto y está disponible bajo licencia compatible.
                    </p>
                    <a href={driverInfo.url} target="_blank" rel="noopener noreferrer" className="driver-link">
                      <i className="fas fa-external-link-alt"></i> Ver documentación del driver
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="wizard-footer">
            <button
              className="btn btn-secondary"
              onClick={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Probando...
                </>
              ) : (
                <>
                  <i className="fas fa-plug"></i> Probar conexión
                </>
              )}
            </button>

            <div className="wizard-nav">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (wizardTab === 'advanced') setWizardTab('general')
                  else if (wizardTab === 'driver') setWizardTab('advanced')
                }}
                disabled={wizardTab === 'general'}
              >
                <i className="fas fa-chevron-left"></i> Anterior
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (wizardTab === 'general') setWizardTab('advanced')
                  else if (wizardTab === 'advanced') setWizardTab('driver')
                }}
                disabled={wizardTab === 'driver'}
              >
                Siguiente <i className="fas fa-chevron-right"></i>
              </button>
              <button className="btn btn-primary" onClick={saveAndConnect}>
                <i className="fas fa-check"></i> Finalizar
              </button>
              <button className="btn btn-danger" onClick={() => setShowConnectionWizard(false)}>
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mcp-dashboard-overlay">
      <div className="mcp-dashboard">
        {/* Connection Wizard Modal */}
        {showConnectionWizard && <ConnectionWizard />}

        {/* Header */}
        <div className="mcp-dashboard-header">
          <div className="mcp-dashboard-title">
            <div className="connector-badge" style={{ background: connector.color }}>
              <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
            </div>
            <div>
              <h2>{connector.name}</h2>
              <div className="connection-info">
                <span className="connection-status connected">
                  <i className="fas fa-circle"></i> Conectado
                </span>
                {schema?.schemas?.[0]?.name && (
                  <span className="schema-name">
                    <i className="fas fa-database"></i> {schema.schemas[0].name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mcp-dashboard-actions">
            <button className="btn btn-sm btn-secondary" title="Refrescar esquema" onClick={loadSchema}>
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="btn btn-sm btn-secondary" title="Editar conexión" onClick={() => setShowConnectionWizard(true)}>
              <i className="fas fa-edit"></i>
            </button>
            <button className="btn btn-sm btn-warning" title="Desconectar" onClick={handleDisconnect}>
              <i className="fas fa-unlink"></i>
            </button>
            <button className="btn btn-sm btn-info" title="Documentación y Ayuda" onClick={() => setShowHelpPanel(!showHelpPanel)}>
              <i className="fas fa-book"></i>
            </button>
            <button className="btn btn-sm btn-danger" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelpPanel && (
          <div className="help-panel">
            <div className="help-panel-header">
              <h4><i className="fas fa-book"></i> {getConnectorDocs().title}</h4>
              <button className="btn-close-help" onClick={() => setShowHelpPanel(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="help-panel-content">
              <div className="help-section">
                <h5><i className="fas fa-terminal"></i> Referencia Rápida</h5>
                <div className="quick-ref-list">
                  {getConnectorDocs().quickRef.map((item, idx) => (
                    <div key={idx} className="quick-ref-item" onClick={() => {
                      setQueryText(item.cmd)
                      setActiveTab('query')
                      setShowHelpPanel(false)
                    }}>
                      <code>{item.cmd}</code>
                      <span>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="help-section">
                <h5><i className="fas fa-lightbulb"></i> Tips</h5>
                <ul className="tips-list">
                  {getConnectorDocs().tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="help-section">
                <a href={getConnectorDocs().url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <i className="fas fa-external-link-alt"></i> Documentación Oficial
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mcp-dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`mcp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mcp-dashboard-content">
          {/* Explorer Tab */}
          {activeTab === 'explorer' && (
            <div className="mcp-explorer">
              <div className="explorer-sidebar">
                <div className="explorer-header">
                  <h4><i className="fas fa-database"></i> Esquemas</h4>
                  <button
                    className="btn-icon"
                    title="Nueva conexión"
                    onClick={() => setShowConnectionWizard(true)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                {schema ? (
                  <div className="explorer-tree">
                    {schema.schemas.map(s => (
                      <div key={s.name} className="tree-schema">
                        <div
                          className="tree-item schema-item"
                          onClick={() => toggleSchema(s.name)}
                        >
                          <i className={`fas fa-chevron-${expandedSchemas.includes(s.name) ? 'down' : 'right'}`}></i>
                          <i className="fas fa-database"></i>
                          <span>{s.name}</span>
                        </div>

                        {expandedSchemas.includes(s.name) && (
                          <div className="tree-children">
                            {/* Tables */}
                            <div className="tree-category">
                              <div className="tree-item category-item">
                                <i className="fas fa-table"></i>
                                <span>Tablas ({s.tables.length})</span>
                              </div>
                              <div className="tree-children">
                                {s.tables.map(table => (
                                  <div
                                    key={table.name}
                                    className={`tree-item table-item ${selectedTable?.name === table.name ? 'selected' : ''}`}
                                    onClick={() => setSelectedTable(table)}
                                    onDoubleClick={() => {
                                      setQueryText(generateSelectForTable(table))
                                      setActiveTab('query')
                                    }}
                                  >
                                    <i className="fas fa-table"></i>
                                    <span>{table.name}</span>
                                    <span className="row-count">{table.rowCount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Views */}
                            <div className="tree-category">
                              <div className="tree-item category-item">
                                <i className="fas fa-eye"></i>
                                <span>Vistas ({s.views.length})</span>
                              </div>
                              <div className="tree-children">
                                {s.views.map(view => (
                                  <div key={view.name} className="tree-item view-item">
                                    <i className="fas fa-eye"></i>
                                    <span>{view.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Functions */}
                            <div className="tree-category">
                              <div className="tree-item category-item">
                                <i className="fas fa-code"></i>
                                <span>Funciones ({s.functions.length})</span>
                              </div>
                              <div className="tree-children">
                                {s.functions.map(fn => (
                                  <div key={fn.name} className="tree-item function-item">
                                    <i className="fas fa-code"></i>
                                    <span>{fn.name}()</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : schemaLoading ? (
                  <div className="explorer-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando esquema...</p>
                  </div>
                ) : schemaError ? (
                  <div className="explorer-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{schemaError}</p>
                    <button className="btn btn-sm btn-primary" onClick={loadSchema}>
                      <i className="fas fa-sync-alt"></i> Reintentar
                    </button>
                  </div>
                ) : (
                  <div className="explorer-loading">
                    <i className="fas fa-database"></i>
                    <p>Sin datos de esquema</p>
                  </div>
                )}
              </div>

              <div className="explorer-details">
                {selectedTable ? (
                  <>
                    <div className="details-header">
                      <h3>
                        <i className="fas fa-table"></i> {selectedTable.name}
                      </h3>
                      <div className="details-actions">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setQueryText(generateSelectForTable(selectedTable))
                            setActiveTab('query')
                          }}
                        >
                          <i className="fas fa-play"></i> SELECT
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <i className="fas fa-plus"></i> INSERT
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <i className="fas fa-edit"></i> Editar
                        </button>
                      </div>
                    </div>

                    <div className="table-info">
                      <div className="info-card">
                        <i className="fas fa-list"></i>
                        <div>
                          <span className="info-value">{selectedTable.columns.length}</span>
                          <span className="info-label">Columnas</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <i className="fas fa-layer-group"></i>
                        <div>
                          <span className="info-value">{selectedTable.rowCount.toLocaleString()}</span>
                          <span className="info-label">Filas</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <i className="fas fa-bolt"></i>
                        <div>
                          <span className="info-value">{selectedTable.indexes.length}</span>
                          <span className="info-label">Índices</span>
                        </div>
                      </div>
                    </div>

                    <div className="columns-table">
                      <h4><i className="fas fa-columns"></i> Columnas</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>PK</th>
                            <th>NULL</th>
                            <th>FK</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTable.columns.map(col => (
                            <tr key={col.name}>
                              <td>
                                <span className="column-name">
                                  {col.primaryKey && <i className="fas fa-key" style={{ color: '#f59e0b' }}></i>}
                                  {col.name}
                                </span>
                              </td>
                              <td><code>{col.type}</code></td>
                              <td>{col.primaryKey ? <i className="fas fa-check text-success"></i> : '-'}</td>
                              <td>{col.nullable ? <i className="fas fa-check text-warning"></i> : <i className="fas fa-times text-danger"></i>}</td>
                              <td>{col.foreignKey ? <span className="fk-ref">{col.foreignKey}</span> : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {selectedTable.indexes.length > 0 && (
                      <div className="indexes-section">
                        <h4><i className="fas fa-bolt"></i> Índices</h4>
                        <div className="indexes-list">
                          {selectedTable.indexes.map(idx => (
                            <span key={idx} className="index-badge">
                              <i className="fas fa-bolt"></i> {idx}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-selection">
                    <i className="fas fa-mouse-pointer"></i>
                    <p>Selecciona una tabla para ver sus detalles</p>
                    <small>Doble clic para generar un SELECT</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Query Editor Tab */}
          {activeTab === 'query' && (
            <div className="mcp-query-editor">
              <div className="query-toolbar">
                <button
                  className="btn btn-success"
                  onClick={executeQuery}
                  disabled={isExecuting || !queryText.trim()}
                >
                  {isExecuting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Ejecutando...</>
                  ) : (
                    <><i className="fas fa-play"></i> Ejecutar (F5)</>
                  )}
                </button>
                <button className="btn btn-secondary" onClick={() => setQueryText('')}>
                  <i className="fas fa-eraser"></i> Limpiar
                </button>
                <button className="btn btn-secondary">
                  <i className="fas fa-magic"></i> Formatear
                </button>
                <div className="toolbar-spacer"></div>

                {/* Training Button */}
                <button
                  className={`btn ${trainingComplete ? 'btn-success' : 'btn-warning'}`}
                  onClick={trainMCP}
                  disabled={isTraining || !schema}
                >
                  {isTraining ? (
                    <><i className="fas fa-spinner fa-spin"></i> Entrenando...</>
                  ) : trainingComplete ? (
                    <><i className="fas fa-check-circle"></i> MCP Entrenado</>
                  ) : (
                    <><i className="fas fa-brain"></i> Entrenar MCP</>
                  )}
                </button>

                <button
                  className={`btn ${showAiPanel ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  disabled={!trainingComplete}
                  title={!trainingComplete ? 'Entrena el MCP primero' : 'Sugerencias de IA'}
                >
                  <i className="fas fa-robot"></i> Sugerencias IA
                </button>
              </div>

              <div className={`query-main ${queryResults ? 'compact' : ''}`}>
                <div className="query-editor-wrapper">
                  <textarea
                    ref={queryEditorRef}
                    className="query-textarea"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="-- Escribe tu consulta SQL aquí
SELECT * FROM users LIMIT 10;"
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
                        e.preventDefault()
                        executeQuery()
                      }
                    }}
                  />
                </div>

                {showAiPanel && trainingComplete && (
                  <div className="ai-suggestions-panel">
                    <h4><i className="fas fa-robot"></i> Sugerencias de IA</h4>
                    <div className="suggestions-list">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className={`suggestion-card ${suggestion.type}`}
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div className="suggestion-header">
                            <span className={`suggestion-type ${suggestion.type}`}>
                              {suggestion.type === 'query' && <i className="fas fa-search"></i>}
                              {suggestion.type === 'optimization' && <i className="fas fa-tachometer-alt"></i>}
                              {suggestion.type === 'analysis' && <i className="fas fa-chart-bar"></i>}
                              {suggestion.type === 'dashboard' && <i className="fas fa-chart-line"></i>}
                              {suggestion.type.toUpperCase()}
                            </span>
                            <button className="btn-apply">
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <h5>{suggestion.title}</h5>
                          <p>{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {queryResults && (
                <div className="query-results">
                  {queryResults.error ? (
                    <div className="query-error">
                      <div className="error-header">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>Error en la consulta</span>
                      </div>
                      <div className="error-message">
                        {queryResults.message}
                        {queryResults.errno && <span className="error-code"> (Error: {queryResults.errno})</span>}
                      </div>
                    </div>
                  ) : queryResults.affectedRows !== undefined ? (
                    <div className="query-success">
                      <div className="success-header">
                        <i className="fas fa-check-circle"></i>
                        <span>Consulta ejecutada correctamente</span>
                      </div>
                      <div className="success-details">
                        <span><i className="fas fa-edit"></i> Filas afectadas: {queryResults.affectedRows}</span>
                        {queryResults.insertId > 0 && <span><i className="fas fa-plus"></i> ID insertado: {queryResults.insertId}</span>}
                        <span><i className="fas fa-clock"></i> {queryResults.executionTime}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="results-viewer compact-view">
                      {/* Compact Results Toolbar */}
                      <div className="results-toolbar compact">
                        <div className="toolbar-left">
                          <div className="results-info">
                            <span className="row-count">
                              <i className="fas fa-layer-group"></i>
                              <strong>{queryResults.rowCount}</strong> filas
                            </span>
                            <span className="exec-time">
                              <i className="fas fa-bolt"></i>
                              {queryResults.executionTime}
                            </span>
                            <span className="col-count">
                              <i className="fas fa-columns"></i>
                              {queryResults.columns.length} cols
                            </span>
                          </div>
                        </div>

                        <div className="toolbar-center">
                          {/* Quick Filter */}
                          <div className="filter-box compact">
                            <i className="fas fa-search"></i>
                            <input
                              type="text"
                              placeholder="Buscar..."
                              value={filterText}
                              onChange={(e) => setFilterText(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="toolbar-right">
                          {/* Analytics Button - Opens Modal */}
                          <button
                            className="btn-analytics"
                            onClick={() => setShowAnalyticsModal(true)}
                            title="Abrir Analytics"
                          >
                            <i className="fas fa-chart-pie"></i>
                            <span>Analytics</span>
                          </button>

                          {/* Quick Export */}
                          <div className="export-dropdown">
                            <button
                              className="btn-toolbar"
                              onClick={() => setShowDataExportMenu(!showDataExportMenu)}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            {showDataExportMenu && (
                              <div className="export-menu">
                                <button onClick={exportToExcel}>
                                  <i className="fas fa-file-excel"></i> Excel
                                </button>
                                <button onClick={exportToCSV}>
                                  <i className="fas fa-file-csv"></i> CSV
                                </button>
                                <button onClick={exportToJSON}>
                                  <i className="fas fa-file-code"></i> JSON
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Refresh */}
                          <button
                            className="btn-toolbar"
                            onClick={executeQuery}
                            title="Refrescar"
                          >
                            <i className="fas fa-sync-alt"></i>
                          </button>
                        </div>
                      </div>

                      {/* Grid View */}
                      {resultsViewMode === 'grid' && (
                        <div className="results-grid-container">
                          <div className="results-table-wrapper dbeaver-style">
                            <table className="results-table">
                              <thead>
                                <tr>
                                  <th className="row-number-header">#</th>
                                  {queryResults.columns.map(col => (
                                    <th
                                      key={col}
                                      className={sortConfig.column === col ? `sorted-${sortConfig.direction}` : ''}
                                      onClick={() => {
                                        setSortConfig({
                                          column: col,
                                          direction: sortConfig.column === col && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                                        })
                                      }}
                                    >
                                      <span className="col-name">{col}</span>
                                      <span className="col-type">
                                        {typeof queryResults.rows[0]?.[col] === 'number' ? '123' : 'AZ'}
                                      </span>
                                      {sortConfig.column === col && (
                                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                                      )}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResults.rows
                                  .filter(row => {
                                    if (!filterText) return true
                                    return Object.values(row).some(val =>
                                      String(val).toLowerCase().includes(filterText.toLowerCase())
                                    )
                                  })
                                  .sort((a, b) => {
                                    if (!sortConfig.column) return 0
                                    const aVal = a[sortConfig.column]
                                    const bVal = b[sortConfig.column]
                                    if (aVal === null) return 1
                                    if (bVal === null) return -1
                                    if (typeof aVal === 'number') {
                                      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
                                    }
                                    return sortConfig.direction === 'asc'
                                      ? String(aVal).localeCompare(String(bVal))
                                      : String(bVal).localeCompare(String(aVal))
                                  })
                                  .map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className={selectedRows.has(idx) ? 'selected' : ''}
                                      onClick={() => {
                                        const newSelected = new Set(selectedRows)
                                        if (newSelected.has(idx)) {
                                          newSelected.delete(idx)
                                        } else {
                                          newSelected.add(idx)
                                        }
                                        setSelectedRows(newSelected)
                                      }}
                                    >
                                      <td className="row-number">{idx + 1}</td>
                                      {queryResults.columns.map(col => (
                                        <td
                                          key={col}
                                          className={row[col] === null ? 'null-cell' : typeof row[col] === 'number' ? 'number-cell' : ''}
                                        >
                                          {row[col] !== null ? String(row[col]) : <span className="null-value">[NULL]</span>}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Status Bar */}
                          <div className="results-status-bar">
                            <span>
                              <i className="fas fa-check-circle"></i>
                              {filterText ? `Mostrando ${queryResults.rows.filter(row =>
                                Object.values(row).some(val =>
                                  String(val).toLowerCase().includes(filterText.toLowerCase())
                                )
                              ).length} de ${queryResults.rowCount}` : `${queryResults.rowCount} registros`}
                            </span>
                            {selectedRows.size > 0 && (
                              <span className="selected-info">
                                <i className="fas fa-mouse-pointer"></i>
                                {selectedRows.size} seleccionados
                              </span>
                            )}
                            <span className="timestamp">
                              <i className="fas fa-clock"></i>
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Analytics Modal */}
          {showAnalyticsModal && queryResults && !queryResults.error && (
            <div className="analytics-modal-overlay" onClick={() => setShowAnalyticsModal(false)}>
              <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="analytics-modal-header">
                  <div className="header-left">
                    <i className="fas fa-chart-pie"></i>
                    <h2>Data Analytics</h2>
                    <span className="data-badge">{queryResults.rowCount} registros</span>
                  </div>
                  <div className="header-tabs">
                    <button
                      className={`tab-btn ${analyticsTab === 'charts' ? 'active' : ''}`}
                      onClick={() => setAnalyticsTab('charts')}
                    >
                      <i className="fas fa-chart-bar"></i> Gráficos
                    </button>
                    <button
                      className={`tab-btn ${analyticsTab === 'dashboard' ? 'active' : ''}`}
                      onClick={() => setAnalyticsTab('dashboard')}
                    >
                      <i className="fas fa-tachometer-alt"></i> Dashboard
                    </button>
                    <button
                      className={`tab-btn ${analyticsTab === 'statistics' ? 'active' : ''}`}
                      onClick={() => setAnalyticsTab('statistics')}
                    >
                      <i className="fas fa-calculator"></i> Estadísticas
                    </button>
                    <button
                      className={`tab-btn ${analyticsTab === 'export' ? 'active' : ''}`}
                      onClick={() => setAnalyticsTab('export')}
                    >
                      <i className="fas fa-file-export"></i> Exportar
                    </button>
                  </div>
                  <button className="close-btn" onClick={() => setShowAnalyticsModal(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="analytics-modal-body">
                  {/* Charts Tab */}
                  {analyticsTab === 'charts' && (
                    <div className="analytics-charts">
                      <div className="chart-controls">
                        <div className="control-group">
                          <label>Tipo de Gráfico</label>
                          <div className="chart-type-buttons">
                            {[
                              { type: 'bar', icon: 'fa-chart-bar', label: 'Barras' },
                              { type: 'line', icon: 'fa-chart-line', label: 'Líneas' },
                              { type: 'pie', icon: 'fa-chart-pie', label: 'Circular' },
                              { type: 'area', icon: 'fa-chart-area', label: 'Área' },
                              { type: 'donut', icon: 'fa-circle-notch', label: 'Dona' },
                              { type: 'scatter', icon: 'fa-braille', label: 'Dispersión' }
                            ].map(ct => (
                              <button
                                key={ct.type}
                                className={`chart-btn ${chartType === ct.type ? 'active' : ''}`}
                                onClick={() => setChartType(ct.type)}
                              >
                                <i className={`fas ${ct.icon}`}></i>
                                <span>{ct.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="axis-controls">
                          <div className="control-group">
                            <label><i className="fas fa-arrows-alt-h"></i> Eje X (Categoría)</label>
                            <select
                              value={selectedColumns.x || ''}
                              onChange={(e) => setSelectedColumns({ ...selectedColumns, x: e.target.value })}
                            >
                              <option value="">Seleccionar columna...</option>
                              {queryResults.columns.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                          <div className="control-group">
                            <label><i className="fas fa-arrows-alt-v"></i> Eje Y (Valor)</label>
                            <select
                              value={selectedColumns.y || ''}
                              onChange={(e) => setSelectedColumns({ ...selectedColumns, y: e.target.value })}
                            >
                              <option value="">Seleccionar columna...</option>
                              {queryResults.columns.filter(col =>
                                typeof queryResults.rows[0]?.[col] === 'number'
                              ).map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="chart-display">
                        {selectedColumns.x && selectedColumns.y ? (
                          <div className="chart-container">
                            {/* Bar Chart */}
                            {chartType === 'bar' && (
                              <svg viewBox="0 0 800 400" className="analytics-chart">
                                <defs>
                                  <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                  </linearGradient>
                                </defs>
                                {queryResults.rows.slice(0, 20).map((row, idx) => {
                                  const maxVal = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                  const barHeight = ((Number(row[selectedColumns.y]) || 0) / maxVal) * 300
                                  const barWidth = Math.min(35, 700 / queryResults.rows.slice(0, 20).length - 5)
                                  const x = 60 + idx * (barWidth + 5)
                                  return (
                                    <g key={idx} className="bar-group">
                                      <rect
                                        x={x}
                                        y={350 - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="url(#barGrad)"
                                        rx="4"
                                      >
                                        <title>{`${row[selectedColumns.x]}: ${row[selectedColumns.y]}`}</title>
                                      </rect>
                                      <text
                                        x={x + barWidth / 2}
                                        y={365}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="var(--text-muted)"
                                        transform={`rotate(-45, ${x + barWidth / 2}, 365)`}
                                      >
                                        {String(row[selectedColumns.x]).substring(0, 10)}
                                      </text>
                                    </g>
                                  )
                                })}
                                <line x1="55" y1="50" x2="55" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                                <line x1="55" y1="350" x2="780" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                              </svg>
                            )}

                            {/* Line Chart */}
                            {chartType === 'line' && (
                              <svg viewBox="0 0 800 400" className="analytics-chart">
                                <defs>
                                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={queryResults.rows.slice(0, 30).map((row, idx) => {
                                    const maxVal = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                    const y = 350 - ((Number(row[selectedColumns.y]) || 0) / maxVal) * 300
                                    const x = 60 + idx * 24
                                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                                  }).join(' ')}
                                  fill="none"
                                  stroke="url(#lineGrad)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                {queryResults.rows.slice(0, 30).map((row, idx) => {
                                  const maxVal = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                  const y = 350 - ((Number(row[selectedColumns.y]) || 0) / maxVal) * 300
                                  const x = 60 + idx * 24
                                  return (
                                    <circle key={idx} cx={x} cy={y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2">
                                      <title>{`${row[selectedColumns.x]}: ${row[selectedColumns.y]}`}</title>
                                    </circle>
                                  )
                                })}
                                <line x1="55" y1="50" x2="55" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                                <line x1="55" y1="350" x2="780" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                              </svg>
                            )}

                            {/* Pie Chart */}
                            {chartType === 'pie' && (
                              <div className="pie-chart-container">
                                <svg viewBox="0 0 400 400" className="analytics-chart pie">
                                  {(() => {
                                    const data = queryResults.rows.slice(0, 8)
                                    const total = data.reduce((sum, row) => sum + (Number(row[selectedColumns.y]) || 0), 0)
                                    let currentAngle = 0
                                    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']
                                    return data.map((row, idx) => {
                                      const value = Number(row[selectedColumns.y]) || 0
                                      const angle = (value / total) * 360
                                      const startAngle = currentAngle
                                      currentAngle += angle
                                      const x1 = 200 + 150 * Math.cos((startAngle - 90) * Math.PI / 180)
                                      const y1 = 200 + 150 * Math.sin((startAngle - 90) * Math.PI / 180)
                                      const x2 = 200 + 150 * Math.cos((startAngle + angle - 90) * Math.PI / 180)
                                      const y2 = 200 + 150 * Math.sin((startAngle + angle - 90) * Math.PI / 180)
                                      const largeArc = angle > 180 ? 1 : 0
                                      return (
                                        <path
                                          key={idx}
                                          d={`M 200 200 L ${x1} ${y1} A 150 150 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                          fill={colors[idx % colors.length]}
                                          className="pie-slice"
                                        >
                                          <title>{`${row[selectedColumns.x]}: ${row[selectedColumns.y]} (${((value/total)*100).toFixed(1)}%)`}</title>
                                        </path>
                                      )
                                    })
                                  })()}
                                </svg>
                                <div className="chart-legend">
                                  {queryResults.rows.slice(0, 8).map((row, idx) => {
                                    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']
                                    const total = queryResults.rows.slice(0, 8).reduce((sum, r) => sum + (Number(r[selectedColumns.y]) || 0), 0)
                                    const pct = ((Number(row[selectedColumns.y]) || 0) / total * 100).toFixed(1)
                                    return (
                                      <div key={idx} className="legend-item">
                                        <span className="legend-color" style={{ background: colors[idx % colors.length] }}></span>
                                        <span className="legend-label">{String(row[selectedColumns.x]).substring(0, 20)}</span>
                                        <span className="legend-value">{pct}%</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Area Chart */}
                            {chartType === 'area' && (
                              <svg viewBox="0 0 800 400" className="analytics-chart">
                                <defs>
                                  <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={`M 60 350 ${queryResults.rows.slice(0, 30).map((row, idx) => {
                                    const maxVal = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                    const y = 350 - ((Number(row[selectedColumns.y]) || 0) / maxVal) * 300
                                    const x = 60 + idx * 24
                                    return `L ${x} ${y}`
                                  }).join(' ')} L ${60 + (Math.min(queryResults.rows.length, 30) - 1) * 24} 350 Z`}
                                  fill="url(#areaGrad)"
                                />
                                <path
                                  d={queryResults.rows.slice(0, 30).map((row, idx) => {
                                    const maxVal = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                    const y = 350 - ((Number(row[selectedColumns.y]) || 0) / maxVal) * 300
                                    const x = 60 + idx * 24
                                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#8b5cf6"
                                  strokeWidth="2"
                                />
                                <line x1="55" y1="50" x2="55" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                                <line x1="55" y1="350" x2="780" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                              </svg>
                            )}

                            {/* Donut Chart */}
                            {chartType === 'donut' && (
                              <div className="pie-chart-container">
                                <svg viewBox="0 0 400 400" className="analytics-chart pie">
                                  {(() => {
                                    const data = queryResults.rows.slice(0, 8)
                                    const total = data.reduce((sum, row) => sum + (Number(row[selectedColumns.y]) || 0), 0)
                                    let currentAngle = 0
                                    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']
                                    const outerR = 150, innerR = 90
                                    return data.map((row, idx) => {
                                      const value = Number(row[selectedColumns.y]) || 0
                                      const angle = (value / total) * 360
                                      const startAngle = currentAngle
                                      currentAngle += angle
                                      const x1o = 200 + outerR * Math.cos((startAngle - 90) * Math.PI / 180)
                                      const y1o = 200 + outerR * Math.sin((startAngle - 90) * Math.PI / 180)
                                      const x2o = 200 + outerR * Math.cos((startAngle + angle - 90) * Math.PI / 180)
                                      const y2o = 200 + outerR * Math.sin((startAngle + angle - 90) * Math.PI / 180)
                                      const x1i = 200 + innerR * Math.cos((startAngle + angle - 90) * Math.PI / 180)
                                      const y1i = 200 + innerR * Math.sin((startAngle + angle - 90) * Math.PI / 180)
                                      const x2i = 200 + innerR * Math.cos((startAngle - 90) * Math.PI / 180)
                                      const y2i = 200 + innerR * Math.sin((startAngle - 90) * Math.PI / 180)
                                      const largeArc = angle > 180 ? 1 : 0
                                      return (
                                        <path
                                          key={idx}
                                          d={`M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i} Z`}
                                          fill={colors[idx % colors.length]}
                                          className="pie-slice"
                                        >
                                          <title>{`${row[selectedColumns.x]}: ${row[selectedColumns.y]} (${((value/total)*100).toFixed(1)}%)`}</title>
                                        </path>
                                      )
                                    })
                                  })()}
                                  <text x="200" y="190" textAnchor="middle" fontSize="14" fill="var(--text-muted)">Total</text>
                                  <text x="200" y="215" textAnchor="middle" fontSize="24" fontWeight="bold" fill="var(--text-primary)">
                                    {queryResults.rows.slice(0, 8).reduce((sum, row) => sum + (Number(row[selectedColumns.y]) || 0), 0).toLocaleString()}
                                  </text>
                                </svg>
                                <div className="chart-legend">
                                  {queryResults.rows.slice(0, 8).map((row, idx) => {
                                    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']
                                    return (
                                      <div key={idx} className="legend-item">
                                        <span className="legend-color" style={{ background: colors[idx % colors.length] }}></span>
                                        <span className="legend-label">{String(row[selectedColumns.x]).substring(0, 20)}</span>
                                        <span className="legend-value">{row[selectedColumns.y]}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Scatter Chart */}
                            {chartType === 'scatter' && (
                              <svg viewBox="0 0 800 400" className="analytics-chart">
                                {queryResults.rows.slice(0, 50).map((row, idx) => {
                                  const maxX = Math.max(...queryResults.rows.map((r, i) => i))
                                  const maxY = Math.max(...queryResults.rows.map(r => Number(r[selectedColumns.y]) || 0))
                                  const x = 60 + (idx / maxX) * 700
                                  const y = 350 - ((Number(row[selectedColumns.y]) || 0) / maxY) * 300
                                  return (
                                    <circle
                                      key={idx}
                                      cx={x}
                                      cy={y}
                                      r="6"
                                      fill="#8b5cf6"
                                      fillOpacity="0.7"
                                      stroke="white"
                                      strokeWidth="1"
                                    >
                                      <title>{`${row[selectedColumns.x]}: ${row[selectedColumns.y]}`}</title>
                                    </circle>
                                  )
                                })}
                                <line x1="55" y1="50" x2="55" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                                <line x1="55" y1="350" x2="780" y2="350" stroke="var(--border-color)" strokeWidth="2" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div className="chart-placeholder">
                            <div className="placeholder-icon">
                              <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>Selecciona los ejes</h3>
                            <p>Elige las columnas para visualizar tus datos</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dashboard Tab */}
                  {analyticsTab === 'dashboard' && (
                    <div className="analytics-dashboard">
                      <div className="dashboard-row">
                        {/* Summary Cards */}
                        <div className="summary-cards">
                          <div className="summary-card blue">
                            <div className="card-icon"><i className="fas fa-database"></i></div>
                            <div className="card-info">
                              <span className="card-label">Total Registros</span>
                              <span className="card-value">{queryResults.rowCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="summary-card purple">
                            <div className="card-icon"><i className="fas fa-columns"></i></div>
                            <div className="card-info">
                              <span className="card-label">Columnas</span>
                              <span className="card-value">{queryResults.columns.length}</span>
                            </div>
                          </div>
                          <div className="summary-card green">
                            <div className="card-icon"><i className="fas fa-bolt"></i></div>
                            <div className="card-info">
                              <span className="card-label">Tiempo</span>
                              <span className="card-value">{queryResults.executionTime}</span>
                            </div>
                          </div>
                          <div className="summary-card orange">
                            <div className="card-icon"><i className="fas fa-exclamation-triangle"></i></div>
                            <div className="card-info">
                              <span className="card-label">Valores Nulos</span>
                              <span className="card-value">
                                {queryResults.rows.reduce((count, row) =>
                                  count + Object.values(row).filter(v => v === null).length, 0
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-row two-cols">
                        {/* Column Analysis */}
                        <div className="dashboard-panel">
                          <h3><i className="fas fa-chart-pie"></i> Análisis por Columna</h3>
                          <div className="column-analysis">
                            {queryResults.columns.slice(0, 8).map(col => {
                              const values = queryResults.rows.map(r => r[col]).filter(v => v !== null)
                              const numericVals = values.filter(v => typeof v === 'number')
                              const isNumeric = numericVals.length > values.length / 2
                              return (
                                <div key={col} className="column-item">
                                  <div className="column-header">
                                    <span className="column-name">{col}</span>
                                    <span className={`column-type ${isNumeric ? 'numeric' : 'text'}`}>
                                      {isNumeric ? 'Numérico' : 'Texto'}
                                    </span>
                                  </div>
                                  <div className="column-stats">
                                    {isNumeric ? (
                                      <>
                                        <div className="stat">
                                          <span className="stat-label">Min</span>
                                          <span className="stat-value">{Math.min(...numericVals).toLocaleString()}</span>
                                        </div>
                                        <div className="stat">
                                          <span className="stat-label">Max</span>
                                          <span className="stat-value">{Math.max(...numericVals).toLocaleString()}</span>
                                        </div>
                                        <div className="stat">
                                          <span className="stat-label">Promedio</span>
                                          <span className="stat-value">{(numericVals.reduce((a, b) => a + b, 0) / numericVals.length).toFixed(2)}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="stat">
                                          <span className="stat-label">Únicos</span>
                                          <span className="stat-value">{new Set(values).size}</span>
                                        </div>
                                        <div className="stat">
                                          <span className="stat-label">No Nulos</span>
                                          <span className="stat-value">{values.length}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Mini Charts */}
                        <div className="dashboard-panel">
                          <h3><i className="fas fa-chart-bar"></i> Distribución de Datos</h3>
                          <div className="mini-charts-grid">
                            {queryResults.columns.filter(col =>
                              typeof queryResults.rows[0]?.[col] === 'number'
                            ).slice(0, 4).map(numCol => (
                              <div key={numCol} className="mini-chart-card">
                                <span className="mini-chart-title">{numCol}</span>
                                <svg viewBox="0 0 200 60" className="mini-chart-svg">
                                  {queryResults.rows.slice(0, 15).map((row, idx) => {
                                    const maxVal = Math.max(...queryResults.rows.slice(0, 15).map(r => Number(r[numCol]) || 0))
                                    const barHeight = ((Number(row[numCol]) || 0) / maxVal) * 45
                                    return (
                                      <rect
                                        key={idx}
                                        x={idx * 13}
                                        y={50 - barHeight}
                                        width="10"
                                        height={barHeight}
                                        fill={`hsl(${250 + idx * 5}, 70%, 55%)`}
                                        rx="2"
                                      />
                                    )
                                  })}
                                </svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Data Preview */}
                      <div className="dashboard-row">
                        <div className="dashboard-panel full-width">
                          <h3><i className="fas fa-table"></i> Vista Previa</h3>
                          <div className="preview-table-container">
                            <table className="preview-table">
                              <thead>
                                <tr>
                                  {queryResults.columns.slice(0, 6).map(col => (
                                    <th key={col}>{col}</th>
                                  ))}
                                  {queryResults.columns.length > 6 && <th>...</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResults.rows.slice(0, 5).map((row, idx) => (
                                  <tr key={idx}>
                                    {queryResults.columns.slice(0, 6).map(col => (
                                      <td key={col}>{row[col] !== null ? String(row[col]).substring(0, 25) : <span className="null">NULL</span>}</td>
                                    ))}
                                    {queryResults.columns.length > 6 && <td>...</td>}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Statistics Tab */}
                  {analyticsTab === 'statistics' && (
                    <div className="analytics-statistics">
                      <div className="stats-grid">
                        {queryResults.columns.map(col => {
                          const values = queryResults.rows.map(r => r[col])
                          const nonNullValues = values.filter(v => v !== null)
                          const numericVals = nonNullValues.filter(v => typeof v === 'number')
                          const isNumeric = numericVals.length > nonNullValues.length / 2

                          return (
                            <div key={col} className="stats-card">
                              <div className="stats-header">
                                <h4>{col}</h4>
                                <span className={`type-badge ${isNumeric ? 'numeric' : 'text'}`}>
                                  {isNumeric ? <><i className="fas fa-hashtag"></i> Numérico</> : <><i className="fas fa-font"></i> Texto</>}
                                </span>
                              </div>
                              <div className="stats-body">
                                <div className="stat-row">
                                  <span className="stat-name">Total valores</span>
                                  <span className="stat-val">{values.length}</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-name">No nulos</span>
                                  <span className="stat-val">{nonNullValues.length}</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-name">Nulos</span>
                                  <span className="stat-val">{values.length - nonNullValues.length}</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-name">Únicos</span>
                                  <span className="stat-val">{new Set(nonNullValues).size}</span>
                                </div>
                                {isNumeric && (
                                  <>
                                    <div className="stat-row highlight">
                                      <span className="stat-name">Mínimo</span>
                                      <span className="stat-val">{Math.min(...numericVals).toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row highlight">
                                      <span className="stat-name">Máximo</span>
                                      <span className="stat-val">{Math.max(...numericVals).toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row highlight">
                                      <span className="stat-name">Suma</span>
                                      <span className="stat-val">{numericVals.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row highlight">
                                      <span className="stat-name">Promedio</span>
                                      <span className="stat-val">{(numericVals.reduce((a, b) => a + b, 0) / numericVals.length).toFixed(2)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Export Tab */}
                  {analyticsTab === 'export' && (
                    <div className="analytics-export">
                      <div className="export-options">
                        <h3><i className="fas fa-file-export"></i> Exportar Datos</h3>
                        <p className="export-desc">Selecciona el formato de exportación para tus {queryResults.rowCount} registros</p>

                        <div className="export-cards">
                          <div className="export-card" onClick={exportToExcel}>
                            <div className="export-icon excel">
                              <i className="fas fa-file-excel"></i>
                            </div>
                            <h4>Excel</h4>
                            <p>Formato .xlsx compatible con Microsoft Excel</p>
                            <span className="export-ext">.xlsx</span>
                          </div>

                          <div className="export-card" onClick={exportToCSV}>
                            <div className="export-icon csv">
                              <i className="fas fa-file-csv"></i>
                            </div>
                            <h4>CSV</h4>
                            <p>Valores separados por comas, universal</p>
                            <span className="export-ext">.csv</span>
                          </div>

                          <div className="export-card" onClick={exportToJSON}>
                            <div className="export-icon json">
                              <i className="fas fa-file-code"></i>
                            </div>
                            <h4>JSON</h4>
                            <p>Formato JavaScript Object Notation</p>
                            <span className="export-ext">.json</span>
                          </div>

                          <div className="export-card" onClick={exportToText}>
                            <div className="export-icon sql">
                              <i className="fas fa-database"></i>
                            </div>
                            <h4>SQL INSERT</h4>
                            <p>Sentencias INSERT para importar</p>
                            <span className="export-ext">.sql</span>
                          </div>

                          <div className="export-card" onClick={() => {
                            navigator.clipboard.writeText(
                              queryResults.columns.join('\t') + '\n' +
                              queryResults.rows.map(row =>
                                queryResults.columns.map(col => row[col] ?? '').join('\t')
                              ).join('\n')
                            )
                          }}>
                            <div className="export-icon clipboard">
                              <i className="fas fa-clipboard"></i>
                            </div>
                            <h4>Copiar</h4>
                            <p>Copiar al portapapeles como tabla</p>
                            <span className="export-ext">Clipboard</span>
                          </div>

                          <div className="export-card" onClick={() => {
                            const markdown = '| ' + queryResults.columns.join(' | ') + ' |\n' +
                              '| ' + queryResults.columns.map(() => '---').join(' | ') + ' |\n' +
                              queryResults.rows.slice(0, 100).map(row =>
                                '| ' + queryResults.columns.map(col => row[col] ?? '').join(' | ') + ' |'
                              ).join('\n')
                            navigator.clipboard.writeText(markdown)
                          }}>
                            <div className="export-icon markdown">
                              <i className="fab fa-markdown"></i>
                            </div>
                            <h4>Markdown</h4>
                            <p>Tabla en formato Markdown</p>
                            <span className="export-ext">.md</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="mcp-ai-assistant">
              {!trainingComplete ? (
                <div className="ai-training-required">
                  <div className="training-icon">
                    <i className="fas fa-brain"></i>
                  </div>
                  <h3>Entrenamiento requerido</h3>
                  <p>Entrena el MCP para que analice tu base de datos y genere sugerencias inteligentes.</p>

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={trainMCP}
                    disabled={isTraining}
                  >
                    {isTraining ? (
                      <><i className="fas fa-spinner fa-spin"></i> Analizando...</>
                    ) : (
                      <><i className="fas fa-brain"></i> Entrenar MCP</>
                    )}
                  </button>

                  {isTraining && (
                    <div className="training-progress">
                      <div className="progress-bar">
                        <div className="progress-fill"></div>
                      </div>
                      <p>Analizando tablas, vistas y relaciones...</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Stats Panel */}
                  {mcpStats && (
                    <div className="mcp-stats-panel">
                      <div className="stats-header">
                        <h3><i className="fas fa-chart-pie"></i> Estadísticas de la Base de Datos</h3>
                        <span className="stats-date">
                          Analizado: {new Date(mcpStats.analyzedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#3b82f6' }}>
                            <i className="fas fa-table"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalTables}</span>
                            <span className="stat-label">Tablas</span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#8b5cf6' }}>
                            <i className="fas fa-eye"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalViews}</span>
                            <span className="stat-label">Vistas</span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#f59e0b' }}>
                            <i className="fas fa-code"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalFunctions}</span>
                            <span className="stat-label">Funciones</span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#10b981' }}>
                            <i className="fas fa-columns"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalColumns}</span>
                            <span className="stat-label">Columnas</span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#ec4899' }}>
                            <i className="fas fa-layer-group"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalRows.toLocaleString()}</span>
                            <span className="stat-label">Filas totales</span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon" style={{ background: '#06b6d4' }}>
                            <i className="fas fa-bolt"></i>
                          </div>
                          <div className="stat-info">
                            <span className="stat-value">{mcpStats.totalIndexes}</span>
                            <span className="stat-label">Índices</span>
                          </div>
                        </div>
                      </div>

                      {/* Relaciones */}
                      {mcpStats.foreignKeys.length > 0 && (
                        <div className="relations-section">
                          <h4><i className="fas fa-link"></i> Relaciones detectadas</h4>
                          <div className="relations-list">
                            {mcpStats.foreignKeys.map((fk, idx) => (
                              <div key={idx} className="relation-item">
                                <span className="relation-from">{fk.from}</span>
                                <i className="fas fa-arrow-right"></i>
                                <span className="relation-to">{fk.to}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recomendaciones */}
                      {mcpStats.recommendations.length > 0 && (
                        <div className="recommendations-section">
                          <h4><i className="fas fa-lightbulb"></i> Recomendaciones</h4>
                          <div className="recommendations-list">
                            {mcpStats.recommendations.map((rec, idx) => (
                              <div key={idx} className={`recommendation-item ${rec.type}`}>
                                <i className={`fas ${
                                  rec.type === 'index' ? 'fa-bolt' :
                                  rec.type === 'optimization' ? 'fa-tachometer-alt' :
                                  'fa-search'
                                }`}></i>
                                <span>{rec.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Export Stats */}
                      <div className="stats-actions">
                        <button className="btn btn-secondary" onClick={() => {
                          const stats = JSON.stringify(mcpStats, null, 2)
                          downloadFile(stats, 'db-stats.json', 'application/json')
                        }}>
                          <i className="fas fa-download"></i> Exportar estadísticas
                        </button>
                        <button className="btn btn-secondary" onClick={trainMCP}>
                          <i className="fas fa-sync"></i> Re-analizar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="ai-header">
                    <h3><i className="fas fa-robot"></i> Asistente de IA para {connector.name}</h3>
                    <p>Genera consultas, analiza datos y obtén recomendaciones basadas en tu esquema</p>
                  </div>

                  <div className="ai-actions-grid">
                    <div className="ai-action-card" onClick={() => {
                      setQueryText(`-- Análisis de datos
SELECT
  DATE_TRUNC('day', created_at) as fecha,
  COUNT(*) as total
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY fecha
ORDER BY fecha;`)
                      setActiveTab('query')
                    }}>
                      <div className="action-icon" style={{ background: '#3b82f6' }}>
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <h4>Análisis de Tendencias</h4>
                      <p>Genera queries para analizar tendencias en tus datos</p>
                    </div>

                    <div className="ai-action-card" onClick={() => {
                      setQueryText(`-- Optimización sugerida
EXPLAIN ANALYZE
SELECT * FROM orders WHERE status = 'pending';

-- Índice recomendado:
-- CREATE INDEX idx_orders_status ON orders(status);`)
                      setActiveTab('query')
                    }}>
                      <div className="action-icon" style={{ background: '#10b981' }}>
                        <i className="fas fa-tachometer-alt"></i>
                      </div>
                      <h4>Optimización</h4>
                      <p>Analiza y sugiere mejoras de rendimiento</p>
                    </div>

                    <div className="ai-action-card" onClick={() => {
                      setQueryText(`-- Dashboard de métricas
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT SUM(total) FROM orders) as revenue,
  (SELECT AVG(total) FROM orders) as avg_order_value;`)
                      setActiveTab('query')
                    }}>
                      <div className="action-icon" style={{ background: '#8b5cf6' }}>
                        <i className="fas fa-th-large"></i>
                      </div>
                      <h4>Dashboard</h4>
                      <p>Crea consultas para dashboards y reportes</p>
                    </div>

                    <div className="ai-action-card" onClick={() => {
                      setQueryText(`-- Detección de anomalías
SELECT *
FROM orders
WHERE total > (SELECT AVG(total) + 3 * STDDEV(total) FROM orders)
   OR total < 0
ORDER BY created_at DESC;`)
                      setActiveTab('query')
                    }}>
                      <div className="action-icon" style={{ background: '#f59e0b' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <h4>Anomalías</h4>
                      <p>Detecta valores atípicos y problemas de datos</p>
                    </div>
                  </div>

                  <div className="ai-suggestions-section">
                    <h4><i className="fas fa-lightbulb"></i> Sugerencias basadas en tu esquema</h4>
                    <div className="suggestions-grid">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div className="suggestion-icon">
                            {suggestion.type === 'query' && <i className="fas fa-search"></i>}
                            {suggestion.type === 'optimization' && <i className="fas fa-bolt"></i>}
                            {suggestion.type === 'analysis' && <i className="fas fa-chart-pie"></i>}
                            {suggestion.type === 'dashboard' && <i className="fas fa-chart-line"></i>}
                          </div>
                          <div className="suggestion-content">
                            <h5>{suggestion.title}</h5>
                            <p>{suggestion.description}</p>
                          </div>
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="mcp-history">
              <div className="history-header">
                <h3><i className="fas fa-history"></i> Historial de Consultas</h3>
                {queryHistory.length > 0 && (
                  <button className="btn btn-sm btn-danger" onClick={() => setQueryHistory([])}>
                    <i className="fas fa-trash"></i> Limpiar historial
                  </button>
                )}
              </div>

              {queryHistory.length === 0 ? (
                <div className="empty-history">
                  <i className="fas fa-history"></i>
                  <p>No hay consultas en el historial</p>
                  <small>Las consultas ejecutadas aparecerán aquí</small>
                </div>
              ) : (
                <div className="history-list">
                  {queryHistory.map((item, idx) => (
                    <div key={idx} className="history-item" onClick={() => {
                      setQueryText(item.query)
                      setActiveTab('query')
                    }}>
                      <div className="history-meta">
                        <span className="history-time">
                          <i className="fas fa-clock"></i>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="history-stats">
                          <span><i className="fas fa-table"></i> {item.rowCount} filas</span>
                          <span><i className="fas fa-tachometer-alt"></i> {item.executionTime}</span>
                        </span>
                      </div>
                      <pre className="history-query">{item.query}</pre>
                      <button className="btn-replay" title="Ejecutar de nuevo">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="mcp-data-viewer">
              <div className="data-header">
                <h3><i className="fas fa-table"></i> Visor de Datos</h3>
                <p>Selecciona una tabla y carga sus datos para explorar</p>
              </div>

              {selectedTable ? (
                <div className="data-content">
                  <div className="data-toolbar">
                    <div className="table-info-toolbar">
                      <span className="table-name">
                        <i className="fas fa-table"></i> {selectedTable.name}
                      </span>
                      {tableData && (
                        <span className="table-stats">
                          <i className="fas fa-layer-group"></i> {tableData.rowCount} filas
                          <i className="fas fa-clock"></i> {tableData.executionTime}
                        </span>
                      )}
                    </div>
                    <div className="data-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => loadTableData(selectedTable.name)}
                        disabled={isLoadingTableData}
                      >
                        {isLoadingTableData ? (
                          <><i className="fas fa-spinner fa-spin"></i> Cargando...</>
                        ) : (
                          <><i className="fas fa-sync-alt"></i> Cargar Datos</>
                        )}
                      </button>
                      <button className="btn btn-sm btn-success" onClick={() => {
                        setQueryText(`INSERT INTO ${selectedTable.name} () VALUES ();`)
                        setActiveTab('query')
                      }}>
                        <i className="fas fa-plus"></i> Nuevo
                      </button>
                      <div className="export-dropdown">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setShowDataExportMenu(!showDataExportMenu)}
                          disabled={!tableData}
                        >
                          <i className="fas fa-download"></i> Exportar <i className="fas fa-caret-down"></i>
                        </button>
                        {showDataExportMenu && tableData && (
                          <div className="export-menu">
                            <button onClick={() => exportTableData('excel')}>
                              <i className="fas fa-file-excel"></i> Excel (.xls)
                            </button>
                            <button onClick={() => exportTableData('csv')}>
                              <i className="fas fa-file-csv"></i> CSV (.csv)
                            </button>
                            <button onClick={() => exportTableData('json')}>
                              <i className="fas fa-file-code"></i> JSON (.json)
                            </button>
                            <button onClick={() => exportTableData('sql')}>
                              <i className="fas fa-database"></i> SQL Inserts (.sql)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="data-grid">
                    {isLoadingTableData ? (
                      <div className="data-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Cargando datos de {selectedTable.name}...</p>
                      </div>
                    ) : tableData ? (
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            {tableData.columns.map(col => (
                              <th key={col}>
                                {col}
                                {selectedTable.columns.find(c => c.name === col)?.primaryKey && (
                                  <i className="fas fa-key" style={{ marginLeft: '4px', color: '#f59e0b' }}></i>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows.map((row, idx) => (
                            <tr key={idx}>
                              <td className="row-number">{idx + 1}</td>
                              {tableData.columns.map(col => (
                                <td key={col}>
                                  {row[col] !== null ? String(row[col]) : <span className="null-value">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="data-empty">
                        <i className="fas fa-database"></i>
                        <p>Haz clic en "Cargar Datos" para ver los registros</p>
                        <small>Se cargarán máximo 100 registros</small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-table-selected">
                  <i className="fas fa-table"></i>
                  <p>Selecciona una tabla del explorador</p>
                  <small>Ve a la pestaña "Explorador" y selecciona una tabla</small>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Chat Panel - Bottom */}
        {showAiChat && trainingComplete && (
          <div className="ai-chat-panel">
            <div className="ai-chat-header">
              <div className="ai-chat-title">
                <i className="fas fa-robot"></i>
                <span>Asistente IA</span>
                <span className="ai-badge">MCP Entrenado</span>
              </div>
              <div className="ai-chat-actions">
                <button
                  className="btn-icon"
                  onClick={() => setChatMessages([{
                    role: 'assistant',
                    content: '¿En qué puedo ayudarte? Pregúntame sobre las tablas, datos o genera consultas SQL.'
                  }])}
                  title="Limpiar chat"
                >
                  <i className="fas fa-eraser"></i>
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setShowAiChat(false)}
                  title="Minimizar"
                >
                  <i className="fas fa-chevron-down"></i>
                </button>
              </div>
            </div>

            <div className="ai-chat-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'assistant' ? (
                      <i className="fas fa-robot"></i>
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    {msg.sql && (
                      <div className="message-sql">
                        <div className="sql-header">
                          <span><i className="fas fa-code"></i> SQL Sugerido</span>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setQueryText(msg.sql)
                              setActiveTab('query')
                            }}
                          >
                            <i className="fas fa-play"></i> Ejecutar
                          </button>
                        </div>
                        <pre>{msg.sql}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-message assistant">
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="message-content">
                    <div className="message-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="ai-chat-input" onSubmit={handleChatSubmit}>
              <input
                type="text"
                placeholder="Pregunta sobre las tablas, genera queries, crea dashboards..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button type="submit" disabled={!chatInput.trim() || isChatLoading}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        )}

        {/* AI Chat Toggle Button - When minimized */}
        {!showAiChat && trainingComplete && (
          <button
            className="ai-chat-toggle"
            onClick={() => setShowAiChat(true)}
            title="Abrir Asistente IA"
          >
            <i className="fas fa-robot"></i>
            <span>Asistente IA</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MCPDashboard
