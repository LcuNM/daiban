$src = @'
using System;
using System.Runtime.InteropServices;
public class W32F {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
}
'@
Add-Type -TypeDefinition $src
[W32F]::SetProcessDPIAware() | Out-Null
. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 300
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
[W32F]::ShowWindow($p.MainWindowHandle, 3) | Out-Null
Start-Sleep -Milliseconds 1200
Shot "$env:TEMP\c03.png"
Write-Output "OK"
