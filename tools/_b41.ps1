. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Combo 0x11 0x4C
Start-Sleep -Milliseconds 500
Set-Clipboard -Value 'https://member.bilibili.com/platform/upload/video/frame'
Combo 0x11 0x56
Start-Sleep -Milliseconds 400
Key 0x0D
Start-Sleep -Seconds 10
Shot "$env:TEMP\b41.png"
Write-Output "OK"
