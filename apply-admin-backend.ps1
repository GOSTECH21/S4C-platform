$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-admin-backend.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
