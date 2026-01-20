# Script para activar (poner en primer plano) una ventana de Windows
# Alqvimia RPA 2.0
# Uso: powershell -File activate-window.ps1 -Handle <handle_int> [-ProcessId <pid>]

param(
    [Parameter(Mandatory=$false)]
    [long]$Handle = 0,

    [Parameter(Mandatory=$false)]
    [int]$ProcessId = 0
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WindowActivator {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool BringWindowToTop(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();

    public const int SW_RESTORE = 9;
    public const int SW_SHOW = 5;
    public const int SW_SHOWNORMAL = 1;

    public static bool ActivateWindow(IntPtr hWnd) {
        if (hWnd == IntPtr.Zero) return false;

        // Si la ventana esta minimizada, restaurarla
        if (IsIconic(hWnd)) {
            ShowWindow(hWnd, SW_RESTORE);
        }

        // Obtener el thread de la ventana actual en primer plano
        IntPtr foregroundWnd = GetForegroundWindow();
        uint foregroundThread = 0;
        uint dummy;
        if (foregroundWnd != IntPtr.Zero) {
            foregroundThread = GetWindowThreadProcessId(foregroundWnd, out dummy);
        }

        // Obtener el thread de la ventana objetivo
        uint targetThread = GetWindowThreadProcessId(hWnd, out dummy);
        uint currentThread = GetCurrentThreadId();

        // Attach threads para poder cambiar el foco
        if (foregroundThread != 0 && foregroundThread != currentThread) {
            AttachThreadInput(currentThread, foregroundThread, true);
        }
        if (targetThread != 0 && targetThread != currentThread) {
            AttachThreadInput(currentThread, targetThread, true);
        }

        // Activar la ventana
        BringWindowToTop(hWnd);
        ShowWindow(hWnd, SW_SHOW);
        bool result = SetForegroundWindow(hWnd);

        // Detach threads
        if (foregroundThread != 0 && foregroundThread != currentThread) {
            AttachThreadInput(currentThread, foregroundThread, false);
        }
        if (targetThread != 0 && targetThread != currentThread) {
            AttachThreadInput(currentThread, targetThread, false);
        }

        return result;
    }
}
"@

$success = $false
$targetHandle = [IntPtr]::Zero

if ($Handle -ne 0) {
    $targetHandle = [IntPtr]$Handle
} elseif ($ProcessId -ne 0) {
    try {
        $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($proc -and $proc.MainWindowHandle -ne 0) {
            $targetHandle = $proc.MainWindowHandle
        }
    } catch {
        # Proceso no encontrado
    }
}

if ($targetHandle -ne [IntPtr]::Zero) {
    $success = [WindowActivator]::ActivateWindow($targetHandle)
}

@{
    success = $success
    handle = $targetHandle.ToInt64()
} | ConvertTo-Json -Compress
