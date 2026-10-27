. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force
Start-Sleep -Milliseconds 500
Click 588 695
Start-Sleep -Milliseconds 900
Click 688 498
Start-Sleep -Milliseconds 900
Shot "$env:TEMP\b18.png"
Write-Output "STEP1"
