$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-matchrav-car-miles.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
