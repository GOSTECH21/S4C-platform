$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node .\apply-my-s4p-streamline.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
