. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 400
Click 1282 779
Start-Sleep -Seconds 2
$out = "$env:TEMP\bili4.png"
Shot $out
Write-Output ("SHOT=" + $out)
