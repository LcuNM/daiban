Add-Type -AssemblyName System.Drawing
function Crop([string]$src, [string]$dst, [int]$x, [int]$y, [int]$w, [int]$h) {
  $img = [System.Drawing.Image]::FromFile($src)
  $r = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), $r, [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  Write-Output ("crop -> " + $dst)
}
Crop 'C:\Users\elysia\AppData\Local\Temp\desk-icon.png' 'C:/Users/elysia/.dsh/chat-digest/assets/va_main.png' 489 301 1601 1027
Crop 'C:\Users\elysia\AppData\Local\Temp\desk-icon.png' 'C:/Users/elysia/.dsh/chat-digest/assets/va_icons.png' 20 480 460 560
Write-Output "--- ffmpeg path ---"
$f = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1
Write-Output ($f.FullName)
& $f.FullName -version 2>&1 | Select-Object -First 1