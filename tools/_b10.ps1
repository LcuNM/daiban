. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 400
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 600
Shot "$env:TEMP\b10.png"
Write-Output "OK"
