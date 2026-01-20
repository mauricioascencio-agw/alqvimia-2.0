"""
Tracking Service - Rastrea mouse, detecta elementos UI y envía eventos
Combina mouse tracking, UI inspection y overlay en un servicio unificado
"""
import json
import sys
import time
import threading
import ctypes
from ctypes import wintypes
from typing import Optional, Tuple, Dict, Callable
from datetime import datetime

# Inicializar COM para Windows UI Automation
import pythoncom

# Importar pynput para tracking global del mouse
try:
    from pynput import mouse
    PYNPUT_AVAILABLE = True
except ImportError:
    PYNPUT_AVAILABLE = False
    print(json.dumps({"warning": "pynput no disponible, usar: pip install pynput"}), flush=True)

# Importar uiautomation para detección de elementos
try:
    import uiautomation as auto
    UIAUTOMATION_AVAILABLE = True
except ImportError:
    UIAUTOMATION_AVAILABLE = False
    print(json.dumps({"warning": "uiautomation no disponible, usar: pip install uiautomation"}), flush=True)

# APIs de Windows para overlay
import win32gui
import win32api
import win32con

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

# Colores
GREEN = win32api.RGB(34, 197, 94)
RED = win32api.RGB(239, 68, 68)
BLUE = win32api.RGB(59, 130, 246)


class ElementOverlay:
    """Dibuja overlay sobre elementos"""

    def __init__(self):
        self.current_rect = None
        self.running = False
        self.thread = None
        self.color = GREEN
        self.border_width = 3
        self._lock = threading.Lock()

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._draw_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        self.current_rect = None
        self._clear()

    def set_highlight(self, x, y, w, h, is_interactive=True):
        with self._lock:
            self.current_rect = (x, y, w, h)
            self.color = GREEN if is_interactive else BLUE

    def clear(self):
        with self._lock:
            self.current_rect = None
        self._clear()

    def _clear(self):
        try:
            user32.InvalidateRect(None, None, True)
        except:
            pass

    def _draw_loop(self):
        last_rect = None
        while self.running:
            try:
                with self._lock:
                    current = self.current_rect
                    color = self.color

                if current:
                    if last_rect and last_rect != current:
                        self._invalidate(last_rect)
                    self._draw_rect(*current, color)
                    last_rect = current
                elif last_rect:
                    self._invalidate(last_rect)
                    last_rect = None

                time.sleep(0.033)
            except:
                time.sleep(0.1)

    def _draw_rect(self, x, y, w, h, color):
        try:
            hdc = user32.GetDC(None)
            if not hdc:
                return

            pen = gdi32.CreatePen(win32con.PS_SOLID, self.border_width, color)
            old_pen = gdi32.SelectObject(hdc, pen)
            brush = gdi32.GetStockObject(win32con.NULL_BRUSH)
            old_brush = gdi32.SelectObject(hdc, brush)

            gdi32.Rectangle(hdc, x, y, x + w, y + h)

            gdi32.SelectObject(hdc, old_pen)
            gdi32.SelectObject(hdc, old_brush)
            gdi32.DeleteObject(pen)
            user32.ReleaseDC(None, hdc)
        except:
            pass

    def _invalidate(self, rect):
        try:
            x, y, w, h = rect
            m = self.border_width + 2
            r = (ctypes.c_long * 4)(x - m, y - m, x + w + m, y + h + m)
            user32.InvalidateRect(None, ctypes.byref(r), True)
        except:
            pass


class UIInspector:
    """Inspecciona elementos UI bajo el cursor"""

    # Mapeo de tipos de control a tipos de elemento
    CONTROL_TYPE_MAP = {
        'ButtonControl': 'button',
        'EditControl': 'edit',
        'CheckBoxControl': 'checkbox',
        'ComboBoxControl': 'combobox',
        'ListControl': 'list',
        'ListItemControl': 'listitem',
        'HyperlinkControl': 'link',
        'TextControl': 'text',
        'ImageControl': 'image',
        'MenuControl': 'menu',
        'MenuItemControl': 'menuitem',
        'TabControl': 'tab',
        'TabItemControl': 'tabitem',
        'TreeControl': 'tree',
        'TreeItemControl': 'treeitem',
        'DocumentControl': 'document',
        'PaneControl': 'pane',
        'WindowControl': 'window',
    }

    INTERACTIVE_TYPES = ['button', 'edit', 'checkbox', 'combobox', 'link', 'menuitem', 'listitem', 'tabitem']

    def get_element_at_point(self, x: int, y: int) -> Optional[Dict]:
        """Obtiene información del elemento en una posición"""
        if not UIAUTOMATION_AVAILABLE:
            return None

        try:
            control = auto.ControlFromPoint(x, y)
            if not control:
                return None

            rect = control.BoundingRectangle
            control_type = control.ControlTypeName
            element_type = self.CONTROL_TYPE_MAP.get(control_type, 'unknown')

            # Obtener nombre del padre
            parent = control.GetParentControl()
            parent_name = parent.Name if parent else None

            # Intentar obtener valor
            value = None
            try:
                if hasattr(control, 'GetValuePattern'):
                    vp = control.GetValuePattern()
                    if vp:
                        value = vp.Value
            except:
                pass

            return {
                "name": control.Name or "",
                "type": element_type,
                "controlType": control_type,
                "className": control.ClassName or "",
                "automationId": control.AutomationId or "",
                "value": value,
                "isEnabled": control.IsEnabled,
                "isVisible": not control.IsOffscreen,
                "isInteractive": element_type in self.INTERACTIVE_TYPES,
                "bounds": {
                    "x": rect.left,
                    "y": rect.top,
                    "width": rect.width(),
                    "height": rect.height()
                },
                "parentName": parent_name
            }
        except Exception as e:
            return None


class TrackingService:
    """Servicio principal de tracking"""

    def __init__(self):
        self.overlay = ElementOverlay()
        self.inspector = UIInspector()
        self.is_tracking = False
        self.mouse_listener = None
        self.current_position = (0, 0)
        self.last_element = None
        self.pending_clicks = []
        self.target_window_handle = None
        self.capture_mode = "auto"  # auto, manual
        self.hover_delay = 0.1  # segundos
        self.last_move_time = 0
        self._lock = threading.Lock()
        self._hover_thread = None

    def start(self, target_handle: int = None):
        """Inicia el tracking"""
        if self.is_tracking:
            return

        self.target_window_handle = target_handle
        self.is_tracking = True
        self.pending_clicks = []

        # Iniciar overlay
        self.overlay.start()

        # Iniciar listener de mouse
        if PYNPUT_AVAILABLE:
            self.mouse_listener = mouse.Listener(
                on_move=self._on_mouse_move,
                on_click=self._on_mouse_click
            )
            self.mouse_listener.start()

        # Iniciar hilo de hover detection
        self._hover_thread = threading.Thread(target=self._hover_loop, daemon=True)
        self._hover_thread.start()

        print(json.dumps({
            "event": "tracking_started",
            "targetHandle": target_handle
        }), flush=True)

    def stop(self):
        """Detiene el tracking"""
        self.is_tracking = False

        if self.mouse_listener:
            self.mouse_listener.stop()
            self.mouse_listener = None

        self.overlay.stop()

        print(json.dumps({
            "event": "tracking_stopped"
        }), flush=True)

    def _on_mouse_move(self, x: int, y: int):
        """Callback cuando el mouse se mueve"""
        self.current_position = (x, y)
        self.last_move_time = time.time()

    def _on_mouse_click(self, x: int, y: int, button, pressed: bool):
        """Callback cuando se hace clic"""
        if not pressed or not self.is_tracking:
            return

        # Verificar si el clic está dentro de la ventana objetivo
        if self.target_window_handle:
            try:
                rect = win32gui.GetWindowRect(self.target_window_handle)
                if not (rect[0] <= x <= rect[2] and rect[1] <= y <= rect[3]):
                    return
            except:
                pass

        click_type = "right" if button == mouse.Button.right else "left"

        # Obtener elemento en la posición del clic (con COM inicializado)
        element = None
        try:
            pythoncom.CoInitialize()
            element = self.inspector.get_element_at_point(x, y)
        except Exception as e:
            pass
        finally:
            try:
                pythoncom.CoUninitialize()
            except:
                pass

        click_data = {
            "event": "click",
            "x": x,
            "y": y,
            "clickType": click_type,
            "timestamp": datetime.now().isoformat(),
            "element": element
        }

        with self._lock:
            self.pending_clicks.append(click_data)

        # Emitir evento inmediatamente
        print(json.dumps(click_data), flush=True)

    def _hover_loop(self):
        """Loop para detectar hover y actualizar overlay"""
        # Inicializar COM para este hilo
        pythoncom.CoInitialize()

        last_pos = (0, 0)
        last_update = 0

        try:
            while self.is_tracking:
                try:
                    x, y = self.current_position
                    current_time = time.time()

                    # Solo actualizar si el mouse se movió o pasó tiempo
                    if (x, y) != last_pos or (current_time - last_update) > 0.5:
                        # Verificar si está dentro de ventana objetivo
                        in_target = True
                        if self.target_window_handle:
                            try:
                                rect = win32gui.GetWindowRect(self.target_window_handle)
                                in_target = rect[0] <= x <= rect[2] and rect[1] <= y <= rect[3]
                            except:
                                in_target = False

                        if in_target:
                            # Obtener elemento bajo el cursor
                            element = self.inspector.get_element_at_point(x, y)

                            if element and element.get("bounds"):
                                bounds = element["bounds"]
                                is_interactive = element.get("isInteractive", False)

                                self.overlay.set_highlight(
                                    bounds["x"],
                                    bounds["y"],
                                    bounds["width"],
                                    bounds["height"],
                                    is_interactive
                                )

                                # Emitir evento de hover si cambió el elemento
                                if element != self.last_element:
                                    self.last_element = element
                                    print(json.dumps({
                                        "event": "hover",
                                        "x": x,
                                        "y": y,
                                        "element": element
                                    }), flush=True)
                            else:
                                self.overlay.clear()
                        else:
                            self.overlay.clear()

                        last_pos = (x, y)
                        last_update = current_time

                    time.sleep(0.05)  # 20 FPS para hover detection

                except Exception as e:
                    time.sleep(0.1)
        finally:
            pythoncom.CoUninitialize()

    def get_pending_clicks(self):
        """Obtiene y limpia los clics pendientes"""
        with self._lock:
            clicks = self.pending_clicks.copy()
            self.pending_clicks = []
        return clicks

    def capture_element(self, x: int, y: int) -> Optional[Dict]:
        """Captura un elemento en una posición específica"""
        element = self.inspector.get_element_at_point(x, y)
        if element:
            element["capturedAt"] = datetime.now().isoformat()
            print(json.dumps({
                "event": "element_captured",
                "element": element
            }), flush=True)
        return element


# Instancia global
service = TrackingService()


def process_command(cmd: dict):
    """Procesa un comando recibido"""
    action = cmd.get("action")

    if action == "start":
        handle = cmd.get("targetHandle")
        service.start(handle)

    elif action == "stop":
        service.stop()

    elif action == "capture":
        x = cmd.get("x", 0)
        y = cmd.get("y", 0)
        element = service.capture_element(x, y)
        if not element:
            print(json.dumps({"event": "capture_failed", "x": x, "y": y}), flush=True)

    elif action == "get_clicks":
        clicks = service.get_pending_clicks()
        print(json.dumps({"event": "pending_clicks", "clicks": clicks}), flush=True)

    elif action == "get_element":
        x = cmd.get("x", 0)
        y = cmd.get("y", 0)
        element = service.inspector.get_element_at_point(x, y)
        print(json.dumps({"event": "element_info", "element": element}), flush=True)

    elif action == "highlight":
        x = cmd.get("x", 0)
        y = cmd.get("y", 0)
        w = cmd.get("width", 100)
        h = cmd.get("height", 100)
        service.overlay.set_highlight(x, y, w, h, cmd.get("interactive", True))

    elif action == "clear_highlight":
        service.overlay.clear()

    elif action == "status":
        print(json.dumps({
            "event": "status",
            "isTracking": service.is_tracking,
            "position": service.current_position,
            "pendingClicks": len(service.pending_clicks)
        }), flush=True)

    elif action == "exit":
        service.stop()
        sys.exit(0)


def main():
    """Modo servicio - lee comandos de stdin"""
    print(json.dumps({
        "event": "ready",
        "pynput": PYNPUT_AVAILABLE,
        "uiautomation": UIAUTOMATION_AVAILABLE
    }), flush=True)

    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                cmd = json.loads(line)
                process_command(cmd)
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON", "input": line[:100]}), flush=True)
    except KeyboardInterrupt:
        service.stop()
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        service.stop()


if __name__ == "__main__":
    main()
