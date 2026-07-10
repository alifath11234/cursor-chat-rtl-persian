# Generates resources/cursor-chat-rtl.css and .js from src/content.ts constants
# Run after editing content.ts (requires Node.js). Fallback: edit resources/*.css|js directly.

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\src\content.ts")) {
    $root = Split-Path $PSScriptRoot -Parent
}

$ts = Get-Content "$root\src\content.ts" -Raw

function Extract-BacktickBlock([string]$name) {
    if ($ts -match "export const $name = ``([\s\S]*?)``;") {
        return $Matches[1]
    }
    throw "Could not extract $name from content.ts"
}

$resDir = Join-Path $root 'resources'
New-Item -ItemType Directory -Force -Path $resDir | Out-Null

$css = Extract-BacktickBlock 'RTL_CSS'
$js = Extract-BacktickBlock 'RTL_JS'

Set-Content -Path (Join-Path $resDir 'cursor-chat-rtl.css') -Value $css -Encoding UTF8
Set-Content -Path (Join-Path $resDir 'cursor-chat-rtl.js') -Value $js -Encoding UTF8

Write-Host "Generated resources in $resDir"
