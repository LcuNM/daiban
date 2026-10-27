$src = "$env:LOCALAPPDATA\Microsoft\Edge\User Data"
$dst = 'C:\Users\elysia\.dsh\chat-digest\video\.edge-prof'
if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
New-Item -ItemType Directory -Path "$dst\Default\Network" -Force | Out-Null
New-Item -ItemType Directory -Path "$dst\Default\Local Storage\leveldb" -Force | Out-Null
Copy-Item "$src\Local State" $dst -Force
Copy-Item "$src\Default\Network\Cookies" "$dst\Default\Network" -Force -ErrorAction SilentlyContinue
Copy-Item "$src\Default\Preferences" "$dst\Default" -Force -ErrorAction SilentlyContinue
if (Test-Path "$src\Default\Local Storage\leveldb") { Copy-Item "$src\Default\Local Storage\leveldb\*" "$dst\Default\Local Storage\leveldb" -Recurse -Force -ErrorAction SilentlyContinue }
$sz = (Get-ChildItem $dst -Recurse -File | Measure-Object -Property Length -Sum).Sum
Write-Output ("PROFILE_BYTES=" + [int]$sz)
