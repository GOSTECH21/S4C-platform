$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-fund-strip-fit-phone.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
