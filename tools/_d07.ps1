. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Key 0x1B
Start-Sleep -Seconds 1
Click 1200 800
Start-Sleep -Milliseconds 300
Key 0x23
Start-Sleep -Seconds 2
Shot "$env:TEMP\d07.png"
Write-Output "OK"
