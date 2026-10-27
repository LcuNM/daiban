param([string]$out, [string]$hwnd = '0')
Add-Type -AssemblyName System.Drawing
$sig = @"
using System;
using System.Runtime.InteropServices;
public class CW {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
}
"@
if (-not ('CW' -as [type])) { Add-Type -TypeDefinition $sig }
[CW]::SetProcessDPIAware() | Out-Null
if ($hwnd -eq '0' -or [string]::IsNullOrWhiteSpace($hwnd)) { $h = [CW]::GetForegroundWindow() } else { $h = [IntPtr][int64]$hwnd }
$cr = New-Object CW+RECT
[CW]::GetClientRect($h, [ref]$cr) | Out-Null
$pt = New-Object CW+POINT
$pt.X = 0; $pt.Y = 0
[CW]::ClientToScreen($h, [ref]$pt) | Out-Null
$w = $cr.Right - $cr.Left; $hh = $cr.Bottom - $cr.Top
if ($w -lt 600 -or $hh -lt 400) { Write-Output ("too small " + $w + "x" + $hh); exit 1 }
$bmp = New-Object System.Drawing.Bitmap $w, $hh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($pt.X, $pt.Y, 0, 0, $bmp.Size)
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output ("SHOT=" + $out + " " + $w + "x" + $hh)
