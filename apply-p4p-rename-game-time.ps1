$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: https://s4-c-platform.vercel.app/preview/game-time"
if (-not (Test-Path "app\sponsor\game-time\page.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\sponsor\game-time\page.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/p4p-rename-game-time-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/p4p-rename-game-time-18f9 failed" }
git checkout origin/cursor/p4p-rename-game-time-18f9 -- `
  app/lib/predict-for-planet.ts `
  app/lib/sponsor-listings.ts `
  app/lib/sports.ts `
  app/lib/home-stakeholders.ts `
  app/sponsor/sponsor-nav.tsx `
  app/sponsor/game-time/page.tsx `
  app/sponsor/register/page.tsx `
  app/preview/game-time/page.tsx `
  app/components/fan/PredictForPlanetPlay.tsx `
  app/components/fan/P4pLiveChallengePreview.tsx `
  app/components/home/PredictForPlanet.tsx `
  app/climate-sponsorship/page.tsx
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/p4p-rename-game-time-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$nav = Get-Content -Raw "app\sponsor\sponsor-nav.tsx"
$page = Get-Content -Raw "app\sponsor\game-time\page.tsx"
if (
  $nav -notmatch "GAME_TIME_NAV_LABEL" -or
  $nav -match "          Game-Time" -or
  $page -match "Game-Time"
) {
  Write-Host "Game-Time is still on the tab or P4P page. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Game-Time copy is now P4P on tabs, buttons and page text."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh on the phone (Ctrl+F5)"
Write-Host "Or open https://s4-c-platform.vercel.app/preview/game-time"
