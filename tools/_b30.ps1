. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Click 1280 58
Start-Sleep -Milliseconds 600
Click 1075 1124
Start-Sleep -Seconds 2
Set-Clipboard -Value 'C:\Users\elysia\.dsh\chat-digest\mock\out\cover169.png'
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Milliseconds 500
Key 0x0D
Start-Sleep -Seconds 6
Shot "$env:TEMP\b30.png"
Write-Output "UPLOADED"
