$src = @'
using System;
using System.Runtime.InteropServices;
public class W32D {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, int d, UIntPtr e);
}
'@
Add-Type -TypeDefinition $src
[W32D]::SetCursorPos(1964, 1142) | Out-Null
Start-Sleep -Milliseconds 400
[W32D]::mouse_event(0x0002,0,0,0,[UIntPtr]::Zero)
Start-Sleep -Milliseconds 90
[W32D]::mouse_event(0x0004,0,0,0,[UIntPtr]::Zero)
Start-Sleep -Seconds 3
. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Shot "$env:TEMP\b27.png"
Write-Output "OK"
