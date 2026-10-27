. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$p = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
Show-Win $p.MainWindowHandle -Force -TopMost
Start-Sleep -Milliseconds 600
Click 1404 867
Start-Sleep -Seconds 2
Set-Clipboard -Value 'C:\Users\elysia\.dsh\chat-digest\video\daiban_intro_v8.mp4'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 600
Key 0x0D
Start-Sleep -Seconds 10
$out = "$env:TEMP\bili2.png"
Shot $out
Write-Output ("SHOT=" + $out)
