// Manejadores para Element Spy v3.0
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * PowerShell script para obtener elementos UI de una ventana usando UI Automation
 */
const getUIElementsScript = (handle) => `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

function Get-UIElements {
    param([IntPtr]$WindowHandle, [int]$MaxDepth = 3)

    $automation = [System.Windows.Automation.AutomationElement]::FromHandle($WindowHandle)
    if (-not $automation) { return @() }

    $elements = @()

    function Traverse-Element {
        param($element, $depth, $parentPath)

        if ($depth -gt $MaxDepth) { return }

        try {
            $rect = $element.Current.BoundingRectangle
            $name = $element.Current.Name
            $controlType = $element.Current.ControlType.ProgrammaticName
            $automationId = $element.Current.AutomationId
            $className = $element.Current.ClassName

            if (-not [System.Double]::IsInfinity($rect.Width) -and $rect.Width -gt 0) {
                $elements += @{
                    Name = $name
                    ControlType = $controlType.Replace("ControlType.", "")
                    AutomationId = $automationId
                    ClassName = $className
                    IsEnabled = $element.Current.IsEnabled
                    BoundingRect = @{
                        X = [int]$rect.X
                        Y = [int]$rect.Y
                        Width = [int]$rect.Width
                        Height = [int]$rect.Height
                    }
                    Path = $parentPath
                }
            }

            $children = $element.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
            $index = 0
            foreach ($child in $children) {
                $childPath = if ($parentPath) { "$parentPath/$index" } else { "$index" }
                Traverse-Element -element $child -depth ($depth + 1) -parentPath $childPath
                $index++
            }
        } catch {}
    }

    Traverse-Element -element $automation -depth 0 -parentPath ""
    return $elements
}

$result = Get-UIElements -WindowHandle ([IntPtr]${handle})
$result | ConvertTo-Json -Compress -Depth 10
`

/**
 * PowerShell script para obtener elemento bajo el cursor
 */
const getElementAtPointScript = (x, y) => `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class MouseHelper {
    [DllImport("user32.dll")]
    public static extern bool GetCursorPos(out POINT lpPoint);

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT {
        public int X;
        public int Y;
    }
}
"@

try {
    $point = New-Object System.Windows.Point(${x}, ${y})
    $element = [System.Windows.Automation.AutomationElement]::FromPoint($point)

    if ($element) {
        $rect = $element.Current.BoundingRectangle
        @{
            Name = $element.Current.Name
            ControlType = $element.Current.ControlType.ProgrammaticName.Replace("ControlType.", "")
            AutomationId = $element.Current.AutomationId
            ClassName = $element.Current.ClassName
            IsEnabled = $element.Current.IsEnabled
            Value = try {
                $valuePattern = $element.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
                $valuePattern.Current.Value
            } catch { "" }
            BoundingRect = @{
                X = [int]$rect.X
                Y = [int]$rect.Y
                Width = [int]$rect.Width
                Height = [int]$rect.Height
            }
            ProcessId = $element.Current.ProcessId
        } | ConvertTo-Json -Compress
    } else {
        '{"error": "No element found"}'
    }
} catch {
    "{\\"error\\": \\"$($_.Exception.Message)\\"}"
}
`

/**
 * PowerShell script para capturar screenshot de ventana
 */
const captureWindowScript = (handle, outputPath) => `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Drawing;

public class ScreenCapture {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdcBlt, uint nFlags);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left, Top, Right, Bottom;
    }

    public static Bitmap CaptureWindow(IntPtr handle) {
        RECT rect;
        GetWindowRect(handle, out rect);
        int width = rect.Right - rect.Left;
        int height = rect.Bottom - rect.Top;

        Bitmap bmp = new Bitmap(width, height);
        Graphics g = Graphics.FromImage(bmp);
        IntPtr hdc = g.GetHdc();
        PrintWindow(handle, hdc, 0);
        g.ReleaseHdc(hdc);
        g.Dispose();

        return bmp;
    }
}
"@

\$handle = [IntPtr]${handle}
\$bitmap = [ScreenCapture]::CaptureWindow(\$handle)
\$bitmap.Save("${outputPath.replace(/\\/g, '\\\\')}")
\$bitmap.Dispose()
Write-Output "OK"
`

export function registerSpyHandlers(io, socket, serverState) {

  // Iniciar sesión de espionaje
  socket.on('spy:start', async (data) => {
    console.log(`[Spy] Iniciando sesión para ${socket.id}`, data)

    serverState.spySessions.set(socket.id, {
      active: true,
      startedAt: new Date(),
      targetWindow: data?.targetWindow || null,
      mode: data?.mode || 'web',
      continuousMode: false
    })

    socket.emit('spy:started', {
      success: true,
      message: 'Sesión de espionaje iniciada',
      sessionId: socket.id
    })
  })

  // Detener sesión de espionaje
  socket.on('spy:stop', () => {
    console.log(`[Spy] Deteniendo sesión para ${socket.id}`)

    serverState.spySessions.delete(socket.id)

    socket.emit('spy:stopped', {
      success: true,
      message: 'Sesión de espionaje detenida'
    })
  })

  // Capturar elemento (web - viene del injector)
  socket.on('spy:capture', (data) => {
    console.log(`[Spy] Elemento web capturado:`, data?.element?.tag, data?.element?.id)

    const elementData = {
      id: `element_${Date.now()}`,
      source: 'web',
      ...data?.element,
      capturedAt: new Date().toISOString()
    }

    // Broadcast a todos los clientes conectados
    socket.emit('spy:element-captured', elementData)

    // También enviar al cliente que lo solicitó
    socket.emit('element-selected', elementData)
  })

  // Obtener lista de ventanas REAL de Windows
  socket.on('spy:get-windows', async () => {
    console.log(`[Spy] Solicitando lista de ventanas real`)

    try {
      // Usar script de archivo para evitar problemas de escape
      const scriptPath = path.join(__dirname, '..', 'scripts', 'get-windows.ps1')

      const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
        encoding: 'utf8',
        timeout: 15000
      })

      let windows = []
      if (stdout && stdout.trim()) {
        const parsed = JSON.parse(stdout)
        windows = Array.isArray(parsed) ? parsed : [parsed]

        // Filtrar y categorizar
        windows = windows.map((w, index) => ({
          id: w.ProcessId || index + 1,
          title: w.Title || 'Sin título',
          processName: w.ProcessName || 'unknown',
          handle: w.Handle ? `0x${w.Handle.toString(16).toUpperCase()}` : '0x0',
          handleInt: w.Handle,
          rect: w.Rect,
          type: categorizeWindow(w.ProcessName)
        })).filter(w => {
          if (!w.title || w.title === 'Sin título') return false
          const excluded = ['textinputhost', 'applicationframehost', 'shellexperiencehost', 'searchhost', 'startmenuexperiencehost', 'systemsettings']
          return !excluded.includes(w.processName.toLowerCase())
        })
      }

      socket.emit('spy:windows-list', { windows, success: true })
    } catch (error) {
      console.error('[Spy] Error obteniendo ventanas:', error.message)
      socket.emit('spy:windows-list', {
        windows: [],
        success: false,
        error: error.message
      })
    }
  })

  // Seleccionar ventana objetivo
  socket.on('spy:select-window', async (data) => {
    console.log(`[Spy] Ventana seleccionada:`, data?.windowId, data?.handle)

    const session = serverState.spySessions.get(socket.id)
    if (session) {
      session.targetWindow = data?.windowId
      session.targetHandle = data?.handle
      session.targetHandleInt = data?.handleInt
    }

    socket.emit('spy:window-selected', {
      success: true,
      windowId: data?.windowId,
      handle: data?.handle
    })
  })

  // Obtener elementos UI de una ventana de escritorio
  socket.on('spy:get-desktop-elements', async (data) => {
    console.log(`[Spy] Obteniendo elementos de ventana:`, data?.handle)

    const handle = data?.handleInt || parseInt(data?.handle, 16)

    if (!handle) {
      socket.emit('spy:desktop-elements', { elements: [], error: 'Handle no válido' })
      return
    }

    try {
      const script = getUIElementsScript(handle)
      const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: 15000
      })

      let elements = []
      if (stdout && stdout.trim() && stdout.trim() !== 'null') {
        const parsed = JSON.parse(stdout)
        elements = Array.isArray(parsed) ? parsed : [parsed]
      }

      socket.emit('spy:desktop-elements', {
        elements,
        success: true,
        count: elements.length
      })
    } catch (error) {
      console.error('[Spy] Error obteniendo elementos:', error.message)
      socket.emit('spy:desktop-elements', {
        elements: [],
        success: false,
        error: error.message
      })
    }
  })

  // Obtener elemento bajo el cursor del mouse
  socket.on('spy:get-element-at-point', async (data) => {
    const { x, y } = data || {}

    if (typeof x !== 'number' || typeof y !== 'number') {
      socket.emit('spy:element-at-point', { element: null, error: 'Coordenadas inválidas' })
      return
    }

    try {
      const script = getElementAtPointScript(x, y)
      const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: 5000
      })

      if (stdout && stdout.trim()) {
        const element = JSON.parse(stdout)
        if (!element.error) {
          socket.emit('spy:element-at-point', { element, success: true })

          // También emitir como elemento seleccionado
          socket.emit('spy:desktop-element-captured', {
            id: `desktop_${Date.now()}`,
            source: 'desktop',
            ...element,
            selectors: generateDesktopSelectors(element),
            capturedAt: new Date().toISOString()
          })
        } else {
          socket.emit('spy:element-at-point', { element: null, error: element.error })
        }
      }
    } catch (error) {
      console.error('[Spy] Error obteniendo elemento:', error.message)
      socket.emit('spy:element-at-point', { element: null, error: error.message })
    }
  })

  // Capturar screenshot de ventana
  socket.on('spy:capture-window-screenshot', async (data) => {
    const handle = data?.handleInt || parseInt(data?.handle, 16)

    if (!handle) {
      socket.emit('spy:screenshot', { success: false, error: 'Handle no válido' })
      return
    }

    try {
      const screenshotDir = path.join(process.cwd(), 'screenshots')
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
      }

      const filename = `window_${handle}_${Date.now()}.png`
      const outputPath = path.join(screenshotDir, filename)

      const script = captureWindowScript(handle, outputPath)
      await execAsync(`powershell -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        timeout: 10000
      })

      // Leer archivo y convertir a base64
      const imageBuffer = fs.readFileSync(outputPath)
      const base64 = imageBuffer.toString('base64')

      socket.emit('spy:screenshot', {
        success: true,
        filename,
        path: outputPath,
        base64: `data:image/png;base64,${base64}`
      })
    } catch (error) {
      console.error('[Spy] Error capturando screenshot:', error.message)
      socket.emit('spy:screenshot', { success: false, error: error.message })
    }
  })

  // Modo de captura continua
  socket.on('spy:toggle-continuous', (data) => {
    const session = serverState.spySessions.get(socket.id)
    if (session) {
      session.continuousMode = data?.enabled || false
      console.log(`[Spy] Modo continuo: ${session.continuousMode}`)
    }

    socket.emit('spy:continuous-toggled', {
      enabled: data?.enabled || false
    })
  })

  // Iniciar tracking del mouse para modo desktop
  socket.on('spy:start-mouse-tracking', async (data) => {
    const session = serverState.spySessions.get(socket.id)
    if (!session) return

    session.mouseTracking = true
    console.log(`[Spy] Mouse tracking iniciado`)

    socket.emit('spy:mouse-tracking-started', { success: true })
  })

  // Detener tracking del mouse
  socket.on('spy:stop-mouse-tracking', () => {
    const session = serverState.spySessions.get(socket.id)
    if (session) {
      session.mouseTracking = false
    }

    socket.emit('spy:mouse-tracking-stopped', { success: true })
  })

  // Limpiar sesión al desconectar
  socket.on('disconnect', () => {
    serverState.spySessions.delete(socket.id)
    console.log(`[Spy] Sesión limpiada para ${socket.id}`)
  })
}

/**
 * Categoriza el tipo de ventana según el proceso
 */
function categorizeWindow(processName) {
  if (!processName) return 'application'

  const pn = processName.toLowerCase()

  if (['chrome', 'firefox', 'msedge', 'opera', 'brave', 'vivaldi'].some(b => pn.includes(b))) {
    return 'browser'
  }
  if (['code', 'devenv', 'idea', 'pycharm', 'webstorm', 'sublime', 'notepad', 'atom'].some(e => pn.includes(e))) {
    return 'editor'
  }
  if (pn.includes('explorer')) {
    return 'explorer'
  }
  if (['cmd', 'powershell', 'windowsterminal', 'conhost'].some(t => pn.includes(t))) {
    return 'terminal'
  }
  if (['winword', 'excel', 'powerpnt', 'outlook', 'onenote'].some(o => pn.includes(o))) {
    return 'office'
  }

  return 'application'
}

/**
 * Genera selectores para elementos de escritorio
 */
function generateDesktopSelectors(element) {
  const selectors = []

  // AutomationId (más confiable)
  if (element.AutomationId) {
    selectors.push({
      type: 'automationId',
      value: element.AutomationId,
      priority: 1
    })
  }

  // Name + ControlType
  if (element.Name) {
    selectors.push({
      type: 'name',
      value: element.Name,
      priority: 2
    })

    selectors.push({
      type: 'nameAndType',
      value: `${element.ControlType}:${element.Name}`,
      priority: 2
    })
  }

  // ClassName
  if (element.ClassName) {
    selectors.push({
      type: 'className',
      value: element.ClassName,
      priority: 3
    })
  }

  // ControlType solo
  selectors.push({
    type: 'controlType',
    value: element.ControlType,
    priority: 4
  })

  // XPath-like para UI Automation
  if (element.Path) {
    selectors.push({
      type: 'treePath',
      value: element.Path,
      priority: 5
    })
  }

  return selectors.sort((a, b) => a.priority - b.priority)
}
