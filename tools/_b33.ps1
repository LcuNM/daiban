Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$root = [System.Windows.Automation.AutomationElement]::RootElement
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, '完成')
$btn = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
if ($btn -eq $null) { Write-Output "NO_COMPLETE_BUTTON" } else {
  Write-Output ("FOUND " + $btn.Current.ControlType.ProgrammaticName + " " + $btn.Current.BoundingRectangle)
  try {
    $p = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
    $p.Invoke()
    Write-Output "INVOKED"
  } catch { Write-Output ("INVOKE_FAIL " + $_.Exception.Message) }
}
