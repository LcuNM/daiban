. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Combo 0x11 0x4C
Start-Sleep -Milliseconds 600
Set-Clipboard -Value 'https://member.bilibili.com/platform/upload/video/frame'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 400
Key 0x0D
Start-Sleep -Seconds 9
Shot "$env:TEMP\s07.png"
Write-Output "OK"
