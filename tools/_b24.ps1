$src = @'
using System;
using System.Runtime.InteropServices;
public class W32C {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
'@
Add-Type -TypeDefinition $src
[W32C]::SetProcessDPIAware() | Out-Null
. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
$h = $p.MainWindowHandle
[W32C]::ShowWindow($h, 3) | Out-Null
Start-Sleep -Milliseconds 1200
$r = New-Object W32C+RECT
[W32C]::GetWindowRect($h, [ref]$r) | Out-Null
Write-Output ("RECT " + $r.Left + "," + $r.Top + " -> " + $r.Right + "," + $r.Bottom)
Click 1962 1140
Start-Sleep -Seconds 3
Shot "$env:TEMP\b24.png"
Write-Output "DONE"
