
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class S {
  public delegate bool Proc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool EnumWindows(Proc p, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
}
"@
[S]::SetProcessDPIAware() | Out-Null
$pids = @{}
Get-Process electron -ErrorAction SilentlyContinue | ForEach-Object { $pids[[uint32]$_.Id] = $true }
$script:best = [IntPtr]::Zero
$script:bestArea = 0
$cb = [S+Proc]{
  param($h, $l)
  $pid2 = [uint32]0
  [S]::GetWindowThreadProcessId($h, [ref]$pid2) | Out-Null
  if (-not $pids.ContainsKey($pid2)) { return $true }
  if (-not [S]::IsWindowVisible($h)) { return $true }
  $r = New-Object S+RECT
  [S]::GetWindowRect($h, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left
  $hh = $r.Bottom - $r.Top
  $area = $w * $hh
  if ($w -gt 700 -and $hh -gt 400 -and $area -gt $script:bestArea) { $script:best = $h; $script:bestArea = $area }
  return $true
}
[S]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
if ($script:best -eq [IntPtr]::Zero) { 'no window'; exit }
$h = $script:best
[S]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 400
$cr = New-Object S+RECT
[S]::GetClientRect($h, [ref]$cr) | Out-Null
$pt = New-Object S+POINT
$pt.X = 0; $pt.Y = 0
[S]::ClientToScreen($h, [ref]$pt) | Out-Null
$w2 = $cr.Right - $cr.Left
$h2 = $cr.Bottom - $cr.Top
$bmp = New-Object System.Drawing.Bitmap $w2, $h2
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($pt.X, $pt.Y, 0, 0, $bmp.Size)
$out = Join-Path $env:TEMP 'chat-digest-client.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
"CLIENT=" + $pt.X + "," + $pt.Y + " " + $w2 + "x" + $h2
