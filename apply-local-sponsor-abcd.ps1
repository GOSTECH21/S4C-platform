$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-local-sponsor-abcd.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
