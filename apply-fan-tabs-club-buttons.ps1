$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-fan-tabs-club-buttons.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
