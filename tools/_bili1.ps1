. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { Write-Output "NO_EDGE_WINDOW"; exit }
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 700
Combo 0x11 0x54
Start-Sleep -Milliseconds 900
Set-Clipboard -Value 'https://member.bilibili.com/platform/upload/video/frame'
Start-Sleep -Milliseconds 200
Combo 0x11 0x56
Start-Sleep -Milliseconds 400
Key 0x0D
Start-Sleep -Seconds 7
$out = "$env:TEMP\bili1.png"
Shot $out
Write-Output ("SHOT=" + $out)
