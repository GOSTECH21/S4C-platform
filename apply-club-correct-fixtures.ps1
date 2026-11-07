$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-club-correct-fixtures.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
