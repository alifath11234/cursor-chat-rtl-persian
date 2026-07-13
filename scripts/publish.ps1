# Publish cursor-chat-rtl-persian to GitHub
# Prerequisites: gh auth login (run once)

$ErrorActionPreference = 'Stop'
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$root = Split-Path $PSScriptRoot -Parent
$version = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$vsix = Join-Path $env:USERPROFILE "Desktop\cursor-chat-rtl-persian-$version.vsix"

Set-Location $root

Write-Host "Checking GitHub auth..." -ForegroundColor Cyan
& $gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

$user = & $gh api user --jq .login
$repo = "$user/cursor-chat-rtl-persian"
Write-Host "Publishing as: $repo" -ForegroundColor Green

# Update origin to authenticated user's repo
git remote remove origin 2>$null
git remote add origin "https://github.com/$repo.git"

# Create repo if missing
$repoExists = $false
try {
    $null = & $gh repo view $repo --json name -q .name 2>$null
    if ($LASTEXITCODE -eq 0) { $repoExists = $true }
} catch {
    $repoExists = $false
}
if (-not $repoExists) {
    Write-Host "Creating public repository..." -ForegroundColor Cyan
    & $gh repo create $repo --public --description "RTL support for Cursor Agent chat - Persian, Arabic, Hebrew. Fork of yechielby/cursor-chat-rtl-extension by ALI FATHNEJAT." --source . --remote origin
} else {
    Write-Host "Repository exists, pushing..." -ForegroundColor Cyan
    git push -u origin master
    git push origin "v$version" 2>$null
}

# Ensure VSIX exists
if (-not (Test-Path $vsix)) {
    Write-Host "Building VSIX..." -ForegroundColor Cyan
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-vsix.ps1')
}

# Create GitHub Release
Write-Host "Creating release v$version..." -ForegroundColor Cyan
& $gh release create "v$version" $vsix `
    --title "v$version - Cursor Chat RTL Persian" `
    --notes "RTL support for Cursor Agent chat. Two toggles: text RTL and code RTL. By ALI FATHNEJAT. Fork of yechielby/cursor-chat-rtl-extension."

Write-Host ""
Write-Host "Published: https://github.com/$repo/releases/tag/v$version" -ForegroundColor Green
