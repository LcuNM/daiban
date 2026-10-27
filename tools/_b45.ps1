. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Click 1367 1500
Start-Sleep -Milliseconds 800
$t = [System.IO.File]::ReadAllText('C:\Users\elysia\.dsh\chat-digest\video\_desc.txt', [System.Text.Encoding]::UTF8)
Set-Clipboard -Value $t
Start-Sleep -Milliseconds 400
Combo 0x11 0x56
Start-Sleep -Seconds 2
Shot "$env:TEMP\b45.png"
Write-Output "OK"
