# Apply RTL patch files to Cursor workbench (run as Administrator if access denied)
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$sourceCss = Join-Path $projectRoot 'resources\cursor-chat-rtl.css'
$sourceJs = Join-Path $projectRoot 'resources\cursor-chat-rtl.js'
$workbench = 'C:\Program Files\cursor\resources\app\out\vs\workbench'

if (-not (Test-Path $sourceCss)) { throw "Missing $sourceCss" }
if (-not (Test-Path $sourceJs)) { throw "Missing $sourceJs" }
if (-not (Test-Path $workbench)) { throw "Cursor workbench not found: $workbench" }

Copy-Item -Path $sourceCss -Destination (Join-Path $workbench 'cursor-chat-rtl.css') -Force
Copy-Item -Path $sourceJs -Destination (Join-Path $workbench 'cursor-chat-rtl.js') -Force

Write-Host 'RTL patch applied. Restart Cursor completely (Quit, not Reload Window).'
Write-Host "CSS: $(Join-Path $workbench 'cursor-chat-rtl.css')"
Write-Host "JS:  $(Join-Path $workbench 'cursor-chat-rtl.js')"
