. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Click 300 700
Start-Sleep -Milliseconds 400
Combo 0x11 0x54
Start-Sleep -Milliseconds 1200
Set-Clipboard -Value 'https://search.bilibili.com/all?keyword=%E5%A4%A7%E8%82%A5%E9%B1%BC'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 500
Key 0x0D
Start-Sleep -Seconds 9
Hide-DSH
Start-Sleep -Milliseconds 700
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 800
Shot "$env:TEMP\s03.png"
Write-Output "OK"
