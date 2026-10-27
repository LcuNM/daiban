Add-Type -AssemblyName System.Drawing
$out = 'C:\Users\elysia\.dsh\chat-digest\assets'
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-RoundPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
  $p.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
  $p.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
  $p.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
  $p.CloseFigure()
  return $p
}

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

$bg = New-RoundPath 6 6 244 244 56
$c1 = [System.Drawing.ColorTranslator]::FromHtml('#8FA8FF')
$c2 = [System.Drawing.ColorTranslator]::FromHtml('#3A5CE8')
$gb = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, 6)), (New-Object System.Drawing.Point(0, 250)), $c1, $c2)
$g.FillPath($gb, $bg)

$sh = New-RoundPath 58 50 140 164 18
$shBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 8, 16, 40))
$g.FillPath($shBrush, $sh)

$paper = New-RoundPath 56 46 140 164 18
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $paper)

$spine = New-RoundPath 72 62 108 22 11
$sp1 = [System.Drawing.ColorTranslator]::FromHtml('#7C93FF')
$sp2 = [System.Drawing.ColorTranslator]::FromHtml('#4A6CF7')
$gs = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(72, 62)), (New-Object System.Drawing.Point(180, 84)), $sp1, $sp2)
$g.FillPath($gs, $spine)

$lp = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#D3DBEC'), 8)
$lp.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$lp.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($lp, 74, 108, 178, 108)
$g.DrawLine($lp, 74, 136, 178, 136)
$g.DrawLine($lp, 74, 164, 152, 164)

$png256 = Join-Path $out 'icon-256.png'
$bmp.Save($png256, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

foreach ($s in 64, 48, 32, 16) {
  $src = [System.Drawing.Image]::FromFile($png256)
  $dst = New-Object System.Drawing.Bitmap($s, $s, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $dg = [System.Drawing.Graphics]::FromImage($dst)
  $dg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $dg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $dg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $dg.Clear([System.Drawing.Color]::Transparent)
  $dg.DrawImage($src, 0, 0, $s, $s)
  $dst.Save((Join-Path $out ("icon-" + $s + ".png")), [System.Drawing.Imaging.ImageFormat]::Png)
  $dg.Dispose(); $dst.Dispose(); $src.Dispose()
}
Get-ChildItem $out -Filter 'icon-*.png' | Select-Object Name, Length | Format-Table -AutoSize | Out-String