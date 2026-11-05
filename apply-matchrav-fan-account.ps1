$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/supporter/dashboard/matchrav"
if (-not (Test-Path "app\dashboard\supporter\components\FanTabBar.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\dashboard\supporter\components\FanTabBar.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/matchrav-fan-tab-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/matchrav-fan-tab-18f9 failed" }
git checkout origin/cursor/matchrav-fan-tab-18f9 -- `
  app/lib/matchrav.ts `
  app/lib/routes.ts `
  app/fan/login/page.tsx `
  app/register/page.tsx `
  app/dashboard/supporter/components/FanTabBar.tsx `
  app/components/fan/FanMatchravPanel.tsx `
  app/supporter/dashboard/matchrav/page.tsx `
  app/dashboard/supporter/matchrav/page.tsx `
  app/preview/fan-tabs/page.tsx `
  scripts/verify-matchrav-fan-account.ts `
  scripts/verify-matchrav-fan-tabs.ts `
  scripts/verify-fan-five-tabs.ts `
  scripts/verify-sponsor-leaderboard.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/matchrav-fan-tab-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$tabs = Get-Content -Raw "app\dashboard\supporter\components\FanTabBar.tsx"
$matchrav = Get-Content -Raw "app\lib\matchrav.ts"
$panel = Get-Content -Raw "app\components\fan\FanMatchravPanel.tsx"
if (
  $matchrav -notmatch "fanLoginPath" -or
  $tabs -notmatch "Matchrav" -or
  $tabs -notmatch 'data-fan-tabs="6"' -or
  $panel -notmatch "matchrav-planner-mobile-pc-v1" -or
  $panel -match "PhoneFrame"
) {
  Write-Host "The Matchrav fan tab did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Explore Matchrav opens Fan Login, and Fan accounts have a Matchrav tab."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh on the phone (Ctrl+F5)"
Write-Host "Open http://localhost:3000/ and click Explore Matchrav"
