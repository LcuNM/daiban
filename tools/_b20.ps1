$src = @'
using System;
using System.Runtime.InteropServices;
public class W32B {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
'@
Add-Type -TypeDefinition $src
[W32B]::SetProcessDPIAware() | Out-Null
. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 400
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
$h = $p.MainWindowHandle
[W32B]::ShowWindow($h, 9) | Out-Null
Start-Sleep -Milliseconds 300
[W32B]::ShowWindow($h, 3) | Out-Null
Start-Sleep -Milliseconds 1200
$r = New-Object W32B+RECT
[W32B]::GetWindowRect($h, [ref]$r) | Out-Null
Write-Output ("RECT " + $r.Left + "," + $r.Top + " -> " + $r.Right + "," + $r.Bottom)
Shot "$env:TEMP\b20.png"
Write-Output "SHOTDONE"
