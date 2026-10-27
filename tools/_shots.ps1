Add-Type -AssemblyName System.Drawing
$sig = @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class PW {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
if (-not ('PW' -as [type])) { Add-Type -TypeDefinition $sig }
[PW]::SetProcessDPIAware() | Out-Null

$running = (Get-CimInstance Win32_Process -Filter "Name='electron.exe'" | Where-Object { $_.CommandLine -like '*chat-digest*' } | Measure-Object).Count
if ($running -eq 0) {
  Start-Process -FilePath 'C:\Windows\System32\cmd.exe' -ArgumentList '/c','C:\Users\elysia\.dsh\chat-digest\start.cmd' -WindowStyle Hidden
  Start-Sleep -Seconds 11
}
Start-Sleep -Seconds 1

$script:target = [IntPtr]::Zero
$cb = [PW+EnumProc]{
  param($h, $l)
  if (-not [PW]::IsWindowVisible($h)) { return $true }
  $sb = New-Object System.Text.StringBuilder 256
  [PW]::GetWindowTextW($h, $sb, 256) | Out-Null
  $t = $sb.ToString()
  $r = New-Object PW+RECT
  [PW]::GetWindowRect($h, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left
  if ($t -match '待办' -and $w -gt 700) { $script:target = $h; Write-Output ("FOUND title=" + $t + " " + $w + "x" + ($r.Bottom - $r.Top) + " at " + $r.Left + "," + $r.Top) ; return $false }
  return $true
}
[PW]::EnumWindows($cb, [IntPtr]::Zero) | Out-Null
if ($script:target -eq [IntPtr]::Zero) { Write-Output 'TARGET_NOT_FOUND'; exit 1 }
[PW]::ShowWindow($script:target, 9) | Out-Null
[PW]::BringWindowToTop($script:target) | Out-Null
[PW]::SetForegroundWindow($script:target) | Out-Null
Start-Sleep -Milliseconds 900

$r2 = New-Object PW+RECT
[PW]::GetWindowRect($script:target, [ref]$r2) | Out-Null
$w2 = $r2.Right - $r2.Left; $h2 = $r2.Bottom - $r2.Top
$bmp = New-Object System.Drawing.Bitmap $w2, $h2
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r2.Left, $r2.Top, 0, 0, $bmp.Size)
$bmp.Save('C:/Users/elysia/.dsh/chat-digest/assets/shot01_main.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output ("SHOT main " + $w2 + "x" + $h2)
