@echo off
setlocal

set ROOT_DIR=%~dp0..
set OUTPUT_NAME=kintone-partial-search-plugin.zip
set OUTPUT_PATH=%ROOT_DIR%\%OUTPUT_NAME%

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-zip.ps1"

endlocal
