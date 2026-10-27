. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Click 1717 960
Start-Sleep -Milliseconds 600
Combo 0x11 0x41
Start-Sleep -Milliseconds 200
$t = [System.IO.File]::ReadAllText('C:\Users\elysia\.dsh\chat-digest\video\_title.txt', [System.Text.Encoding]::UTF8).Trim()
Set-Clipboard -Value $t
Start-Sleep -Milliseconds 300
Combo 0x11 0x56
Start-Sleep -Seconds 1
Shot "$env:TEMP\b44.png"
Write-Output "OK"
