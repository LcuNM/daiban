. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 800
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 800
Shot "$env:TEMP\s02.png"
Write-Output "OK"
