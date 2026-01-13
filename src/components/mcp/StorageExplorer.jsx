/**
 * ALQVIMIA RPA 2.0 - Storage Explorer
 * Explorador de almacenamiento en la nube estilo Finder/Explorer
 */

import { useState, useRef, useCallback } from 'react'

function StorageExplorer({ connector, onClose, onOpenConfig }) {
  // Estado de navegación
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid, list, details
  const [sortBy, setSortBy] = useState('name') // name, size, date, type
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Estado de operaciones
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // Estado de modales
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showPropertiesModal, setShowPropertiesModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Estado de formularios
  const [newFolderName, setNewFolderName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [previewFile, setPreviewFile] = useState(null)

  // Refs
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  // Datos de ejemplo - archivos y carpetas
  const [files, setFiles] = useState([
    { id: 1, name: 'Documentos', type: 'folder', size: 0, modified: '2024-12-20', items: 24 },
    { id: 2, name: 'Imágenes', type: 'folder', size: 0, modified: '2024-12-19', items: 156 },
    { id: 3, name: 'Backups', type: 'folder', size: 0, modified: '2024-12-18', items: 8 },
    { id: 4, name: 'Proyectos', type: 'folder', size: 0, modified: '2024-12-15', items: 42 },
    { id: 5, name: 'reporte-ventas-2024.xlsx', type: 'file', extension: 'xlsx', size: 2456000, modified: '2024-12-20' },
    { id: 6, name: 'presentacion-Q4.pptx', type: 'file', extension: 'pptx', size: 8900000, modified: '2024-12-19' },
    { id: 7, name: 'contrato-cliente.pdf', type: 'file', extension: 'pdf', size: 156000, modified: '2024-12-18' },
    { id: 8, name: 'logo-empresa.png', type: 'file', extension: 'png', size: 45000, modified: '2024-12-17' },
    { id: 9, name: 'backup-db-2024.sql', type: 'file', extension: 'sql', size: 125000000, modified: '2024-12-16' },
    { id: 10, name: 'config.json', type: 'file', extension: 'json', size: 2400, modified: '2024-12-15' },
    { id: 11, name: 'video-tutorial.mp4', type: 'file', extension: 'mp4', size: 456000000, modified: '2024-12-14' },
    { id: 12, name: 'manual-usuario.docx', type: 'file', extension: 'docx', size: 890000, modified: '2024-12-13' },
  ])

  // Estadísticas de almacenamiento
  const storageStats = {
    used: 2.4, // GB
    total: 15, // GB
    files: 1247,
    folders: 89
  }

  // Formatear tamaño de archivo
  const formatSize = (bytes) => {
    if (bytes === 0) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Obtener icono según tipo de archivo
  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return { icon: 'fa-folder', color: '#f59e0b' }
    }

    const iconMap = {
      // Documentos
      pdf: { icon: 'fa-file-pdf', color: '#ef4444' },
      doc: { icon: 'fa-file-word', color: '#3b82f6' },
      docx: { icon: 'fa-file-word', color: '#3b82f6' },
      xls: { icon: 'fa-file-excel', color: '#10b981' },
      xlsx: { icon: 'fa-file-excel', color: '#10b981' },
      ppt: { icon: 'fa-file-powerpoint', color: '#f97316' },
      pptx: { icon: 'fa-file-powerpoint', color: '#f97316' },
      txt: { icon: 'fa-file-alt', color: '#6b7280' },

      // Imágenes
      png: { icon: 'fa-file-image', color: '#8b5cf6' },
      jpg: { icon: 'fa-file-image', color: '#8b5cf6' },
      jpeg: { icon: 'fa-file-image', color: '#8b5cf6' },
      gif: { icon: 'fa-file-image', color: '#8b5cf6' },
      svg: { icon: 'fa-file-image', color: '#8b5cf6' },
      webp: { icon: 'fa-file-image', color: '#8b5cf6' },

      // Videos
      mp4: { icon: 'fa-file-video', color: '#ec4899' },
      avi: { icon: 'fa-file-video', color: '#ec4899' },
      mov: { icon: 'fa-file-video', color: '#ec4899' },
      mkv: { icon: 'fa-file-video', color: '#ec4899' },

      // Audio
      mp3: { icon: 'fa-file-audio', color: '#14b8a6' },
      wav: { icon: 'fa-file-audio', color: '#14b8a6' },
      ogg: { icon: 'fa-file-audio', color: '#14b8a6' },

      // Código
      js: { icon: 'fa-file-code', color: '#eab308' },
      jsx: { icon: 'fa-file-code', color: '#06b6d4' },
      ts: { icon: 'fa-file-code', color: '#3b82f6' },
      tsx: { icon: 'fa-file-code', color: '#3b82f6' },
      html: { icon: 'fa-file-code', color: '#f97316' },
      css: { icon: 'fa-file-code', color: '#8b5cf6' },
      json: { icon: 'fa-file-code', color: '#10b981' },
      sql: { icon: 'fa-database', color: '#6366f1' },
      py: { icon: 'fa-file-code', color: '#3b82f6' },

      // Comprimidos
      zip: { icon: 'fa-file-archive', color: '#f59e0b' },
      rar: { icon: 'fa-file-archive', color: '#f59e0b' },
      tar: { icon: 'fa-file-archive', color: '#f59e0b' },
      gz: { icon: 'fa-file-archive', color: '#f59e0b' },
      '7z': { icon: 'fa-file-archive', color: '#f59e0b' },
    }

    return iconMap[file.extension] || { icon: 'fa-file', color: '#6b7280' }
  }

  // Obtener breadcrumbs
  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean)
    return [
      { name: connector.name, path: '/' },
      ...parts.map((part, index) => ({
        name: part,
        path: '/' + parts.slice(0, index + 1).join('/')
      }))
    ]
  }

  // Filtrar y ordenar archivos
  const getFilteredFiles = () => {
    let result = [...files]

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Ordenar
    result.sort((a, b) => {
      // Carpetas siempre primero
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1

      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = new Date(a.modified) - new Date(b.modified)
          break
        case 'type':
          comparison = (a.extension || '').localeCompare(b.extension || '')
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }

  // Navegación
  const navigateToFolder = (folder) => {
    if (folder.type === 'folder') {
      setCurrentPath(currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`)
      setSelectedFiles([])
    }
  }

  const navigateToPath = (path) => {
    setCurrentPath(path)
    setSelectedFiles([])
  }

  const goBack = () => {
    const parts = currentPath.split('/').filter(Boolean)
    if (parts.length > 0) {
      parts.pop()
      setCurrentPath('/' + parts.join('/'))
      setSelectedFiles([])
    }
  }

  // Selección
  const toggleSelection = (file, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-selección
      setSelectedFiles(prev =>
        prev.includes(file.id)
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      )
    } else if (event.shiftKey && selectedFiles.length > 0) {
      // Selección por rango
      const filtered = getFilteredFiles()
      const lastSelected = filtered.findIndex(f => f.id === selectedFiles[selectedFiles.length - 1])
      const current = filtered.findIndex(f => f.id === file.id)
      const start = Math.min(lastSelected, current)
      const end = Math.max(lastSelected, current)
      setSelectedFiles(filtered.slice(start, end + 1).map(f => f.id))
    } else {
      // Selección simple
      setSelectedFiles([file.id])
    }
  }

  const selectAll = () => {
    setSelectedFiles(getFilteredFiles().map(f => f.id))
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  // Operaciones de archivo
  const handleDoubleClick = (file) => {
    if (file.type === 'folder') {
      navigateToFolder(file)
    } else {
      // Previsualizar archivo
      openPreview(file)
    }
  }

  const openPreview = (file) => {
    setPreviewFile(file)
    setShowPreviewModal(true)
  }

  const createFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder = {
      id: Date.now(),
      name: newFolderName.trim(),
      type: 'folder',
      size: 0,
      modified: new Date().toISOString().split('T')[0],
      items: 0
    }

    setFiles(prev => [...prev, newFolder])
    setNewFolderName('')
    setShowNewFolderModal(false)
  }

  const renameFile = () => {
    if (!renameValue.trim() || selectedFiles.length !== 1) return

    setFiles(prev => prev.map(f =>
      f.id === selectedFiles[0]
        ? { ...f, name: renameValue.trim() }
        : f
    ))

    setRenameValue('')
    setShowRenameModal(false)
  }

  const deleteFiles = () => {
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)))
    setSelectedFiles([])
    setShowDeleteModal(false)
  }

  const downloadFiles = () => {
    // Simular descarga
    const selected = files.filter(f => selectedFiles.includes(f.id))
    console.log('Descargando:', selected.map(f => f.name))
    // En implementación real, iniciar descarga
  }

  // Drag & Drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [])

  const handleFileUpload = (uploadFiles) => {
    setUploadProgress({ current: 0, total: uploadFiles.length, files: uploadFiles.map(f => f.name) })

    // Simular subida
    let current = 0
    const interval = setInterval(() => {
      current++
      setUploadProgress(prev => ({ ...prev, current }))

      if (current >= uploadFiles.length) {
        clearInterval(interval)

        // Agregar archivos
        const newFiles = uploadFiles.map((f, idx) => ({
          id: Date.now() + idx,
          name: f.name,
          type: 'file',
          extension: f.name.split('.').pop().toLowerCase(),
          size: f.size,
          modified: new Date().toISOString().split('T')[0]
        }))

        setFiles(prev => [...prev, ...newFiles])

        setTimeout(() => setUploadProgress(null), 1000)
      }
    }, 500)
  }

  // Copiar enlace público
  const copyShareLink = (file) => {
    const link = `https://${connector.name.toLowerCase().replace(' ', '-')}.example.com/share/${file.id}`
    navigator.clipboard.writeText(link)
  }

  // Renderizar vista de grilla
  const renderGridView = () => (
    <div className="storage-grid">
      {getFilteredFiles().map(file => {
        const { icon, color } = getFileIcon(file)
        const isSelected = selectedFiles.includes(file.id)

        return (
          <div
            key={file.id}
            className={`storage-grid-item ${isSelected ? 'selected' : ''}`}
            onClick={(e) => toggleSelection(file, e)}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            <div className="file-icon-large" style={{ color }}>
              <i className={`fas ${icon}`}></i>
              {file.type === 'folder' && file.items > 0 && (
                <span className="folder-count">{file.items}</span>
              )}
            </div>
            <div className="file-name" title={file.name}>
              {file.name}
            </div>
            <div className="file-meta">
              {file.type === 'folder'
                ? `${file.items} elementos`
                : formatSize(file.size)
              }
            </div>
          </div>
        )
      })}
    </div>
  )

  // Renderizar vista de lista
  const renderListView = () => (
    <div className="storage-list">
      <div className="storage-list-header">
        <div className="col-check">
          <input
            type="checkbox"
            checked={selectedFiles.length === getFilteredFiles().length && selectedFiles.length > 0}
            onChange={() => selectedFiles.length === getFilteredFiles().length ? clearSelection() : selectAll()}
          />
        </div>
        <div className="col-name" onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
          Nombre {sortBy === 'name' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
        </div>
        <div className="col-size" onClick={() => { setSortBy('size'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
          Tamaño {sortBy === 'size' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
        </div>
        <div className="col-date" onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
          Modificado {sortBy === 'date' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
        </div>
        <div className="col-actions">Acciones</div>
      </div>

      {getFilteredFiles().map(file => {
        const { icon, color } = getFileIcon(file)
        const isSelected = selectedFiles.includes(file.id)

        return (
          <div
            key={file.id}
            className={`storage-list-row ${isSelected ? 'selected' : ''}`}
            onClick={(e) => toggleSelection(file, e)}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            <div className="col-check">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
              />
            </div>
            <div className="col-name">
              <i className={`fas ${icon}`} style={{ color, marginRight: '0.75rem' }}></i>
              <span>{file.name}</span>
              {file.type === 'folder' && (
                <span className="item-count">({file.items})</span>
              )}
            </div>
            <div className="col-size">{formatSize(file.size)}</div>
            <div className="col-date">{file.modified}</div>
            <div className="col-actions">
              <button className="btn-icon" title="Descargar" onClick={(e) => { e.stopPropagation(); downloadFiles() }}>
                <i className="fas fa-download"></i>
              </button>
              <button className="btn-icon" title="Compartir" onClick={(e) => { e.stopPropagation(); setShowShareModal(true) }}>
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="btn-icon" title="Más opciones" onClick={(e) => { e.stopPropagation() }}>
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Renderizar modal de preview
  const renderPreviewModal = () => {
    if (!previewFile) return null

    const { icon, color } = getFileIcon(previewFile)
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(previewFile.extension)
    const isVideo = ['mp4', 'avi', 'mov', 'mkv'].includes(previewFile.extension)
    const isPdf = previewFile.extension === 'pdf'
    const isCode = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'sql', 'py'].includes(previewFile.extension)

    return (
      <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
        <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className={`fas ${icon}`} style={{ color }}></i>
              <span>{previewFile.name}</span>
            </div>
            <button className="close-modal" onClick={() => setShowPreviewModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body preview-body">
            {isImage && (
              <div className="preview-image">
                <img src={`https://picsum.photos/800/600?random=${previewFile.id}`} alt={previewFile.name} />
              </div>
            )}
            {isVideo && (
              <div className="preview-video">
                <div className="video-placeholder">
                  <i className="fas fa-play-circle"></i>
                  <p>Vista previa de video</p>
                </div>
              </div>
            )}
            {isPdf && (
              <div className="preview-pdf">
                <div className="pdf-placeholder">
                  <i className="fas fa-file-pdf"></i>
                  <p>Documento PDF</p>
                  <span>{formatSize(previewFile.size)}</span>
                </div>
              </div>
            )}
            {isCode && (
              <div className="preview-code">
                <pre><code>{`// ${previewFile.name}\n// Vista previa del código...\n\nfunction example() {\n  console.log("Hello World");\n}`}</code></pre>
              </div>
            )}
            {!isImage && !isVideo && !isPdf && !isCode && (
              <div className="preview-generic">
                <i className={`fas ${icon}`} style={{ color, fontSize: '4rem' }}></i>
                <h3>{previewFile.name}</h3>
                <p>{formatSize(previewFile.size)}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="file-info">
              <span><i className="fas fa-weight"></i> {formatSize(previewFile.size)}</span>
              <span><i className="fas fa-calendar"></i> {previewFile.modified}</span>
            </div>
            <div className="file-actions">
              <button className="btn btn-secondary" onClick={() => copyShareLink(previewFile)}>
                <i className="fas fa-link"></i> Copiar enlace
              </button>
              <button className="btn btn-primary" onClick={downloadFiles}>
                <i className="fas fa-download"></i> Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="storage-explorer-overlay">
      <div className="storage-explorer">
        {/* Header */}
        <div className="storage-header">
          <div className="storage-title">
            <div className="connector-badge" style={{ background: connector.color }}>
              <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`}></i>
            </div>
            <div>
              <h2>{connector.name}</h2>
              <span className="storage-path">{currentPath}</span>
            </div>
          </div>
          <div className="storage-actions">
            <button className="btn btn-secondary" onClick={() => onOpenConfig(connector)}>
              <i className="fas fa-cog"></i>
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="storage-toolbar">
          <div className="toolbar-left">
            <button
              className="btn btn-icon"
              onClick={goBack}
              disabled={currentPath === '/'}
              title="Atrás"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <button className="btn btn-icon" onClick={() => setFiles([...files])} title="Actualizar">
              <i className="fas fa-sync-alt"></i>
            </button>

            {/* Breadcrumbs */}
            <div className="breadcrumbs">
              {getBreadcrumbs().map((crumb, idx) => (
                <span key={crumb.path}>
                  {idx > 0 && <i className="fas fa-chevron-right separator"></i>}
                  <button
                    className={`breadcrumb ${currentPath === crumb.path ? 'active' : ''}`}
                    onClick={() => navigateToPath(crumb.path)}
                  >
                    {idx === 0 && <i className={`${connector.brand ? 'fab' : 'fas'} ${connector.icon}`} style={{ marginRight: '0.25rem' }}></i>}
                    {crumb.name}
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="toolbar-right">
            {/* Búsqueda */}
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Vista */}
            <div className="view-toggle">
              <button
                className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista de cuadrícula"
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista de lista"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="storage-action-bar">
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <i className="fas fa-upload"></i> Subir archivos
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNewFolderModal(true)}>
              <i className="fas fa-folder-plus"></i> Nueva carpeta
            </button>

            {selectedFiles.length > 0 && (
              <>
                <div className="divider"></div>
                <button className="btn btn-secondary" onClick={downloadFiles}>
                  <i className="fas fa-download"></i> Descargar
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setRenameValue(files.find(f => f.id === selectedFiles[0])?.name || '')
                  setShowRenameModal(true)
                }} disabled={selectedFiles.length !== 1}>
                  <i className="fas fa-edit"></i> Renombrar
                </button>
                <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
                  <i className="fas fa-share-alt"></i> Compartir
                </button>
                <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                  <i className="fas fa-trash"></i> Eliminar
                </button>
              </>
            )}
          </div>

          <div className="selection-info">
            {selectedFiles.length > 0 && (
              <span>{selectedFiles.length} seleccionado(s)</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`storage-content ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="drop-overlay">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Suelta los archivos aquí para subirlos</p>
            </div>
          )}

          {isLoading ? (
            <div className="storage-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando archivos...</p>
            </div>
          ) : getFilteredFiles().length === 0 ? (
            <div className="storage-empty">
              <i className="fas fa-folder-open"></i>
              <h3>Esta carpeta está vacía</h3>
              <p>Sube archivos o crea una nueva carpeta</p>
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                <i className="fas fa-upload"></i> Subir archivos
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </div>

        {/* Footer / Status Bar */}
        <div className="storage-footer">
          <div className="storage-stats">
            <span><i className="fas fa-file"></i> {storageStats.files} archivos</span>
            <span><i className="fas fa-folder"></i> {storageStats.folders} carpetas</span>
          </div>
          <div className="storage-usage">
            <div className="usage-bar">
              <div
                className="usage-fill"
                style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
              ></div>
            </div>
            <span>{storageStats.used} GB de {storageStats.total} GB usados</span>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory="true"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
        />

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="upload-progress-overlay">
            <div className="upload-progress-modal">
              <h4><i className="fas fa-cloud-upload-alt"></i> Subiendo archivos...</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
              <p>{uploadProgress.current} de {uploadProgress.total} archivos</p>
              <div className="upload-files-list">
                {uploadProgress.files.slice(0, 3).map((name, idx) => (
                  <span key={idx}>{name}</span>
                ))}
                {uploadProgress.files.length > 3 && (
                  <span>...y {uploadProgress.files.length - 3} más</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
            <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-folder-plus"></i> Nueva carpeta</h3>
                <button className="close-modal" onClick={() => setShowNewFolderModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre de la carpeta</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Mi carpeta"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNewFolderModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={createFolder} disabled={!newFolderName.trim()}>
                  <i className="fas fa-check"></i> Crear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {showRenameModal && (
          <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
            <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-edit"></i> Renombrar</h3>
                <button className="close-modal" onClick={() => setShowRenameModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nuevo nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={renameFile} disabled={!renameValue.trim()}>
                  <i className="fas fa-check"></i> Renombrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header danger">
                <h3><i className="fas fa-exclamation-triangle"></i> Confirmar eliminación</h3>
                <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar {selectedFiles.length} elemento(s)?</p>
                <p className="warning-text">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={deleteFiles}>
                  <i className="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-share-alt"></i> Compartir</h3>
                <button className="close-modal" onClick={() => setShowShareModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="share-options">
                  <div className="share-option">
                    <div className="option-icon" style={{ background: '#3b82f6' }}>
                      <i className="fas fa-link"></i>
                    </div>
                    <div className="option-info">
                      <h4>Enlace público</h4>
                      <p>Cualquier persona con el enlace puede ver</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => {
                      const file = files.find(f => f.id === selectedFiles[0])
                      if (file) copyShareLink(file)
                    }}>
                      <i className="fas fa-copy"></i> Copiar
                    </button>
                  </div>

                  <div className="share-option">
                    <div className="option-icon" style={{ background: '#10b981' }}>
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="option-info">
                      <h4>Enviar por email</h4>
                      <p>Compartir con usuarios específicos</p>
                    </div>
                    <button className="btn btn-secondary">
                      <i className="fas fa-paper-plane"></i> Enviar
                    </button>
                  </div>

                  <div className="share-option">
                    <div className="option-icon" style={{ background: '#8b5cf6' }}>
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="option-info">
                      <h4>Agregar colaboradores</h4>
                      <p>Permitir edición a otros usuarios</p>
                    </div>
                    <button className="btn btn-secondary">
                      <i className="fas fa-user-plus"></i> Agregar
                    </button>
                  </div>
                </div>

                <div className="share-permissions">
                  <h4>Permisos del enlace</h4>
                  <div className="permission-options">
                    <label>
                      <input type="radio" name="permission" defaultChecked /> Ver solamente
                    </label>
                    <label>
                      <input type="radio" name="permission" /> Puede descargar
                    </label>
                    <label>
                      <input type="radio" name="permission" /> Puede editar
                    </label>
                  </div>

                  <div className="expiration-option">
                    <label>
                      <input type="checkbox" /> El enlace expira en:
                    </label>
                    <select className="form-control" style={{ width: 'auto', marginLeft: '0.5rem' }}>
                      <option>1 día</option>
                      <option>7 días</option>
                      <option>30 días</option>
                      <option>Nunca</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && renderPreviewModal()}
      </div>
    </div>
  )
}

export default StorageExplorer
