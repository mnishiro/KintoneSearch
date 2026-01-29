$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$OutputName = "kintone-partial-search-plugin.zip"
$OutputPath = Join-Path $RootDir $OutputName

$Items = @(
  "manifest.json",
  "desktop.js",
  "desktop.css",
  "config.html",
  "config.js",
  "config.css"
)

$FullPaths = $Items | ForEach-Object { Join-Path $RootDir $_ }

if (Test-Path $OutputPath) {
  Remove-Item $OutputPath -Force
}

Compress-Archive -Path $FullPaths -DestinationPath $OutputPath
Write-Output "Created: $OutputPath"
