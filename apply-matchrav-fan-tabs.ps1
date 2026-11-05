$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/preview/matchrav"
if (-not (Test-Path "app\components\home\HomeJoinMission.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\home\HomeJoinMission.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/matchrav-fan-tabs-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/matchrav-fan-tabs-18f9 failed" }
git checkout origin/cursor/matchrav-fan-tabs-18f9 -- `
  app/lib/matchrav.ts `
  app/components/home/HomeJoinMission.tsx `
  app/components/home/HomeFrontPage.tsx `
  app/components/home/HomeTopBanner.tsx `
  app/preview/matchrav/page.tsx `
  scripts/verify-matchrav-fan-tabs.ts `
  scripts/verify-fan-p4p-copy.ts `
  scripts/verify-club-passion-copy.ts `
  scripts/verify-homepage.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/matchrav-fan-tabs-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$join = Get-Content -Raw "app\components\home\HomeJoinMission.tsx"
$matchrav = Get-Content -Raw "app\lib\matchrav.ts"
if (
  $matchrav -notmatch "Matchrav" -or
  $join -notmatch "grid-cols-3" -or
  $join -notmatch "JOIN_S4P_FREE_LABEL" -or
  $join -match "Over 50% of a Match Day carbon emissions"
) {
  Write-Host "The fan card still has Join free / Play P4P. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Fan panel now has Matchrav, P4P and S4P tabs."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh on the phone (Ctrl+F5)"
Write-Host "Open http://localhost:3000/ or http://localhost:3000/preview/matchrav"
