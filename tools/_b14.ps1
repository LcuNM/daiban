. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Hide-DSH
Start-Sleep -Milliseconds 500
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -Restore 3
Start-Sleep -Milliseconds 900
$r = Rect $p.MainWindowHandle
Write-Output ("RECT=" + $r)
Shot "$env:TEMP\b14.png"
Write-Output "OK"
