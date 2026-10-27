$src = "$env:LOCALAPPDATA\Microsoft\Edge\User Data"
$dst = 'C:\Users\elysia\.dsh\chat-digest\video\.edge-prof'
function CopyShared($from, $to) {
  $fi = [System.IO.File]::Open($from, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  $fo = [System.IO.File]::Create($to)
  $fi.CopyTo($fo)
  $fo.Close(); $fi.Close()
}
CopyShared "$src\Default\Network\Cookies" "$dst\Default\Network\Cookies"
Write-Output "COOKIES_OK"
$sz = (Get-ChildItem $dst -Recurse -File | Measure-Object -Property Length -Sum).Sum
Write-Output ("PROFILE_BYTES=" + [int]$sz)
