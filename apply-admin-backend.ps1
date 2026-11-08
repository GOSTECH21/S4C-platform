$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
git fetch origin cursor/admin-backend-18f9
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git checkout origin/cursor/admin-backend-18f9 -- apply-admin-backend.mjs apply-admin-backend.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node .\apply-admin-backend.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
