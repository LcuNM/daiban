. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 400
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 500
Key 0x5B
Start-Sleep -Milliseconds 100
Key 0x26
Start-Sleep -Milliseconds 900
Shot "$env:TEMP\b16.png"
Write-Output "OK"
