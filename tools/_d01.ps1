. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 400
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 500
Click 573 186
Start-Sleep -Seconds 2
Shot "$env:TEMP\d01.png"
Write-Output "OK"
