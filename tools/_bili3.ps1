. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 500
Click 1070 1108
Start-Sleep -Seconds 2
$out = "$env:TEMP\bili3.png"
Shot $out
Write-Output ("SHOT=" + $out)
