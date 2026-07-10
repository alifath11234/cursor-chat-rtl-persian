# Build cursor-chat-rtl-persian.vsix without Node.js
# Writes BOM-free files and forward-slash zip entries (required by VSIX parser).

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent

$pkg = Get-Content (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$version = $pkg.version
$vsixName = "cursor-chat-rtl-persian-$version.vsix"
$outPath = Join-Path $env:USERPROFILE "Desktop\$vsixName"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="vsixmanifest" ContentType="text/xml" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="css" ContentType="text/css" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="txt" ContentType="text/plain" />
  <Default Extension="bat" ContentType="application/octet-stream" />
</Types>
'@

$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="cursor-chat-rtl-persian" Version="$version" Publisher="alifath" />
    <DisplayName>Cursor Chat RTL — Persian</DisplayName>
    <Description xml:space="preserve">RTL support for Cursor Agent chat (Persian, Arabic, Hebrew). ⇄ text toggle + code icon for Monaco/code blocks in chat. By ALI FATHNEJAT. Fork of yechielby/cursor-chat-rtl-extension.</Description>
    <Tags>persian,farsi,rtl,cursor,arabic,hebrew,bidi</Tags>
    <Categories>Other</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.94.0" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace" />
    </Properties>
    <License>extension/LICENSE</License>
    <Icon>extension/cursor-chat-rtl-logo.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/cursor-chat-rtl-logo.png" Addressable="true" />
  </Assets>
</PackageManifest>
"@

if (Test-Path $outPath) { Remove-Item $outPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($outPath, 'Create')
try {
    # Text entries written BOM-free with explicit forward-slash names
    foreach ($item in @(
        @{ Name = '[Content_Types].xml'; Content = $contentTypes },
        @{ Name = 'extension.vsixmanifest'; Content = $manifest }
    )) {
        $entry = $zip.CreateEntry($item.Name)
        $writer = New-Object System.IO.StreamWriter($entry.Open(), $utf8NoBom)
        $writer.Write($item.Content)
        $writer.Dispose()
    }

    # package.json re-serialized BOM-free
    $pkgJson = Get-Content (Join-Path $projectRoot 'package.json') -Raw
    $entry = $zip.CreateEntry('extension/package.json')
    $writer = New-Object System.IO.StreamWriter($entry.Open(), $utf8NoBom)
    $writer.Write($pkgJson)
    $writer.Dispose()

    # Binary/asset files copied as-is
    $files = @(
        @{ Src = 'dist\extension.js';                Entry = 'extension/dist/extension.js' },
        @{ Src = 'resources\cursor-chat-rtl.css';    Entry = 'extension/resources/cursor-chat-rtl.css' },
        @{ Src = 'resources\cursor-chat-rtl.js';     Entry = 'extension/resources/cursor-chat-rtl.js' },
        @{ Src = 'cursor-chat-rtl-logo.png';         Entry = 'extension/cursor-chat-rtl-logo.png' },
        @{ Src = 'LICENSE';                          Entry = 'extension/LICENSE' },
        @{ Src = 'README.md';                         Entry = 'extension/README.md' },
        @{ Src = 'README-fa.md';                     Entry = 'extension/README-fa.md' },
        @{ Src = 'CHANGELOG.md';                     Entry = 'extension/CHANGELOG.md' },
        @{ Src = 'APPLY-RTL-PERSIAN.bat';            Entry = 'extension/APPLY-RTL-PERSIAN.bat' }
    )
    foreach ($f in $files) {
        $srcPath = Join-Path $projectRoot $f.Src
        if (-not (Test-Path $srcPath)) { throw "Missing: $srcPath" }
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $srcPath, $f.Entry) | Out-Null
    }
} finally {
    $zip.Dispose()
}

Write-Host ""
Write-Host "VSIX created: $outPath" -ForegroundColor Green
Write-Host "Install: Extensions -> ... -> Install from VSIX..."
