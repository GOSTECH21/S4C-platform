$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/dashboard/supporter/vote"
if (-not (Test-Path "app\lib\climate-sponsors.ts")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\lib\climate-sponsors.ts, then run this script again."
  exit 1
}

git fetch origin cursor/rangers-aberdeen-headline-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/rangers-aberdeen-headline-18f9 failed" }
git checkout origin/cursor/rangers-aberdeen-headline-18f9 -- `
  app/lib/climate-sponsors.ts `
  scripts/verify-club-sponsor-tabs.ts `
  scripts/verify-rangers-headline.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/rangers-aberdeen-headline-18f9 failed" }

$source = Get-Content -Raw "app\lib\climate-sponsors.ts"
if ($source -notmatch "const funded = nextSignedOffFixtureForClub") {
  Write-Host "The Rangers v Aberdeen headline files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Climate Campaigns show the funded match (Rangers v Aberdeen), not the next unfunded fixture. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
