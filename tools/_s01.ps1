. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Combo 0x11 0x54
Start-Sleep -Milliseconds 900
Set-Clipboard -Value 'https://search.bilibili.com/all?keyword=%E5%A4%A7%E8%82%A5%E9%B1%BC'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 400
Key 0x0D
Start-Sleep -Seconds 8
Shot "$env:TEMP\s01.png"
Write-Output "OK"
