# Script para obtener lista de ventanas de Windows
# Alqvimia RPA 2.0

Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class WindowEnumerator {
    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left, Top, Right, Bottom;
    }

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    public static List<object> GetAllWindows() {
        var windows = new List<object>();
        EnumWindows((hWnd, lParam) => {
            if (IsWindowVisible(hWnd)) {
                int length = GetWindowTextLength(hWnd);
                if (length > 0) {
                    StringBuilder sb = new StringBuilder(length + 1);
                    GetWindowText(hWnd, sb, sb.Capacity);
                    string title = sb.ToString();
                    if (!string.IsNullOrWhiteSpace(title)) {
                        uint processId;
                        GetWindowThreadProcessId(hWnd, out processId);
                        RECT rect;
                        GetWindowRect(hWnd, out rect);
                        try {
                            var proc = System.Diagnostics.Process.GetProcessById((int)processId);
                            windows.Add(new {
                                Handle = hWnd.ToInt64(),
                                Title = title,
                                ProcessId = processId,
                                ProcessName = proc.ProcessName,
                                Rect = new {
                                    X = rect.Left,
                                    Y = rect.Top,
                                    Width = rect.Right - rect.Left,
                                    Height = rect.Bottom - rect.Top
                                }
                            });
                        } catch {}
                    }
                }
            }
            return true;
        }, IntPtr.Zero);
        return windows;
    }
}
"@

$result = [WindowEnumerator]::GetAllWindows()
$result | ConvertTo-Json -Compress
