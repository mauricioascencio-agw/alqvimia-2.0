"""
Overlay Service - Dibuja resaltados visuales sobre elementos UI usando Windows GDI
Basado en el sistema del proyecto grabador
"""
import win32gui
import win32api
import win32con
import ctypes
from ctypes import wintypes
import threading
import time
import json
import sys
from typing import Optional, Tuple

# Constantes para colores
RED = win32api.RGB(255, 0, 0)
GREEN = win32api.RGB(34, 197, 94)  # #22c55e
BLUE = win32api.RGB(59, 130, 246)
ORANGE = win32api.RGB(255, 165, 0)
PURPLE = win32api.RGB(139, 92, 246)

# APIs de Windows
user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32


class ElementOverlay:
    """Dibuja un overlay sobre elementos UI usando dibujo directo en DC"""

    def __init__(self):
        self.current_rect: Optional[Tuple[int, int, int, int]] = None
        self.overlay_thread: Optional[threading.Thread] = None
        self.running = False
        self.color = GREEN
        self.border_width = 3
        self._lock = threading.Lock()

    def start(self):
        """Inicia el hilo de overlay"""
        if not self.running:
            self.running = True
            self.overlay_thread = threading.Thread(target=self._draw_loop, daemon=True)
            self.overlay_thread.start()
            print(json.dumps({"status": "started", "message": "Overlay iniciado"}), flush=True)

    def stop(self):
        """Detiene el overlay"""
        self.running = False
        with self._lock:
            self.current_rect = None
        self._clear_overlay()
        print(json.dumps({"status": "stopped", "message": "Overlay detenido"}), flush=True)

    def set_highlight(self, x: int, y: int, width: int, height: int, color_name: str = "green"):
        """Establece el rectángulo a resaltar"""
        colors = {
            "green": GREEN,
            "red": RED,
            "blue": BLUE,
            "orange": ORANGE,
            "purple": PURPLE
        }
        with self._lock:
            self.current_rect = (x, y, width, height)
            self.color = colors.get(color_name, GREEN)

    def clear_highlight(self):
        """Limpia el resaltado actual"""
        with self._lock:
            self.current_rect = None
        self._clear_overlay()

    def _clear_overlay(self):
        """Limpia el overlay forzando un redibujado del área"""
        try:
            user32.InvalidateRect(None, None, True)
            user32.UpdateWindow(user32.GetDesktopWindow())
        except Exception as e:
            pass

    def _draw_loop(self):
        """Loop principal que dibuja el overlay"""
        last_rect = None

        while self.running:
            try:
                with self._lock:
                    current = self.current_rect
                    color = self.color

                if current:
                    x, y, w, h = current

                    # Si cambió el rect, limpiar el anterior
                    if last_rect and last_rect != current:
                        self._invalidate_rect(last_rect)

                    # Dibujar el nuevo rectángulo
                    self._draw_rect(x, y, w, h, color)
                    last_rect = current

                elif last_rect:
                    # Ya no hay rect, limpiar el último
                    self._invalidate_rect(last_rect)
                    last_rect = None

                time.sleep(0.033)  # ~30 FPS

            except Exception as e:
                time.sleep(0.1)

    def _draw_rect(self, x: int, y: int, width: int, height: int, color: int):
        """Dibuja un rectángulo en la pantalla"""
        try:
            # Obtener DC del escritorio
            hdc = user32.GetDC(None)
            if not hdc:
                return

            # Crear pen para el borde
            pen = gdi32.CreatePen(win32con.PS_SOLID, self.border_width, color)
            old_pen = gdi32.SelectObject(hdc, pen)

            # Crear brush transparente (NULL_BRUSH)
            brush = gdi32.GetStockObject(win32con.NULL_BRUSH)
            old_brush = gdi32.SelectObject(hdc, brush)

            # Dibujar el rectángulo
            gdi32.Rectangle(hdc, x, y, x + width, y + height)

            # Restaurar objetos anteriores
            gdi32.SelectObject(hdc, old_pen)
            gdi32.SelectObject(hdc, old_brush)
            gdi32.DeleteObject(pen)

            # Liberar DC
            user32.ReleaseDC(None, hdc)

        except Exception as e:
            pass

    def _invalidate_rect(self, rect: Tuple[int, int, int, int]):
        """Invalida un área para que se redibuje"""
        try:
            x, y, w, h = rect
            margin = self.border_width + 2
            rect_struct = (ctypes.c_long * 4)(
                x - margin,
                y - margin,
                x + w + margin,
                y + h + margin
            )
            user32.InvalidateRect(None, ctypes.byref(rect_struct), True)
        except Exception as e:
            pass


# Instancia global
overlay = ElementOverlay()


def process_command(cmd: dict):
    """Procesa un comando recibido via stdin"""
    action = cmd.get("action")

    if action == "start":
        overlay.start()
    elif action == "stop":
        overlay.stop()
    elif action == "highlight":
        x = cmd.get("x", 0)
        y = cmd.get("y", 0)
        width = cmd.get("width", 100)
        height = cmd.get("height", 100)
        color = cmd.get("color", "green")
        overlay.set_highlight(x, y, width, height, color)
        print(json.dumps({"status": "highlighted", "x": x, "y": y, "width": width, "height": height}), flush=True)
    elif action == "clear":
        overlay.clear_highlight()
        print(json.dumps({"status": "cleared"}), flush=True)
    elif action == "exit":
        overlay.stop()
        sys.exit(0)


def main():
    """Modo servicio - lee comandos de stdin"""
    print(json.dumps({"status": "ready", "message": "Overlay service listo"}), flush=True)

    # Iniciar overlay automáticamente
    overlay.start()

    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                cmd = json.loads(line)
                process_command(cmd)
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON"}), flush=True)
    except KeyboardInterrupt:
        overlay.stop()
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)


if __name__ == "__main__":
    main()
