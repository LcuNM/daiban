$wp = (Get-ItemProperty 'HKCU:\Control Panel\Desktop').WallPaper
Write-Output ("WP=" + $wp)
if ($wp -and (Test-Path $wp)) { Copy-Item $wp 'C:\Users\elysia\.dsh\chat-digest\video\_wallpaper.png' -Force; Write-Output "COPIED" } else { Write-Output "NOT_FOUND" }
