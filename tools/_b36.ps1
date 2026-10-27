. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
Click 1280 58
Start-Sleep -Milliseconds 500
foreach ($pt in @(@(1940,1130),@(1990,1150),@(1964,1120),@(2010,1142))) {
  Click $pt[0] $pt[1]
  Start-Sleep -Milliseconds 700
  $w = (Get-Process msedge).Count
}
Start-Sleep -Seconds 3
Shot "$env:TEMP\b36.png"
Write-Output "OK"
