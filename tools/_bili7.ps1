. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 400
Click 1992 483
Start-Sleep -Milliseconds 800
# 向下滚动页面看基本设置
Add-Type -Namespace W -Name U -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, int d, UIntPtr e); [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);'
[W.U]::SetCursorPos(1600, 900) | Out-Null
Start-Sleep -Milliseconds 200
for ($i=0; $i -lt 5; $i++) { [W.U]::mouse_event(0x0800, 0, 0, -120, [UIntPtr]::Zero); Start-Sleep -Milliseconds 120 }
Start-Sleep -Milliseconds 800
Shot "$env:TEMP\bili7.png"
Write-Output "OK"
