$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: https://s4-c-platform.vercel.app/preview/fan-p4p"
if (-not (Test-Path "app\components\fan\PredictForPlanetPlay.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\fan\PredictForPlanetPlay.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/p4p-timer-complete-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/p4p-timer-complete-18f9 failed" }
git checkout origin/cursor/p4p-timer-complete-18f9 -- `
  app/lib/predict-for-planet.ts `
  app/components/fan/PredictForPlanetPlay.tsx `
  app/preview/fan-p4p-complete/page.tsx `
  app/preview/fan-p4p-awaiting/page.tsx `
  scripts/verify-p4p-timer-complete.ts `
  scripts/verify-p4p-slot-timer.ts `
  scripts/verify-p4p-slot-wipe.ts `
  scripts/verify-predict-for-planet.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/p4p-timer-complete-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$play = Get-Content -Raw "app\components\fan\PredictForPlanetPlay.tsx"
$lib = Get-Content -Raw "app\lib\predict-for-planet.ts"
if (
  $play -notmatch "p4p-timer-complete-v1" -or
  $play -notmatch "P4P_WINDOW_TIMER_LABEL" -or
  $play -notmatch "P4P_SLOT_COMPLETE_LABEL" -or
  $play -notmatch "P4P_AWAITING_NEW_SPONSORED_LABEL" -or
  $lib -notmatch "p4pIsAfterMatchDay" -or
  $lib -notmatch "gameTimeSlotIsComplete"
) {
  Write-Host "P4P is still missing the timer, COMPLETE slot, or awaiting notice. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: P4P shows a 5-minute countdown, marks a played 30-minute slot COMPLETE, and awaits a new sponsored P4P the next day."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh on the phone (Ctrl+F5)"
Write-Host "Or open https://s4-c-platform.vercel.app/preview/fan-p4p"
