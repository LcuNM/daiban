. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 400
Click 1075 1124
Start-Sleep -Seconds 2
Set-Clipboard -Value 'C:\Users\elysia\.dsh\chat-digest\mock\out\cover43.png'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 500
Key 0x0D
Start-Sleep -Seconds 5
Shot "$env:TEMP\b15.png"
Write-Output "OK"
