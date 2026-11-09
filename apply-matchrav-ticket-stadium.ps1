$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-matchrav-ticket-stadium.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
