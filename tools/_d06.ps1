. 'C:\Users\elysia\.dsh\dsh_orb\tools\uia.ps1'
$pts = @(@(600,1300),@(700,1150),@(500,1200),@(650,1000),@(450,1000))
foreach ($pt in $pts) {
  Click $pt[0] $pt[1]
  Start-Sleep -Milliseconds 1200
  $t = FgTitle
  if ($t -match "打开|Open|选择") { Write-Output ("DIALOG=" + $t); break }
  Write-Output ("tried " + $pt[0] + "," + $pt[1] + " fg=" + $t)
}
