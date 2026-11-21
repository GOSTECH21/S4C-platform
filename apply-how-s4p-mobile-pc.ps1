$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: https://s4-c-platform.vercel.app/#how-s4p-works"
if (-not (Test-Path "app\components\home\HowItWorks.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\home\HowItWorks.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/how-s4p-mobile-pc-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/how-s4p-mobile-pc-18f9 failed" }
git checkout origin/cursor/how-s4p-mobile-pc-18f9 -- `
  app/components/home/HomeFrontPage.tsx `
  app/components/home/HowItWorks.tsx `
  app/components/home/HomeTopBanner.tsx `
  app/components/home/HowS4pPredictForPlanet.tsx `
  scripts/verify-how-s4p-mobile-pc.ts `
  scripts/verify-how-s4p-split.ts `
  scripts/verify-homepage.ts `
  scripts/verify-join-community-tab.ts `
  scripts/verify-home-mobile-simplify.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/how-s4p-mobile-pc-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$how = Get-Content -Raw "app\components\home\HowItWorks.tsx"
$front = Get-Content -Raw "app\components\home\HomeFrontPage.tsx"
if (
  $how -notmatch "how-s4p-mobile-pc-v1" -or
  $how -match "hidden md:block" -or
  $front -notmatch "how-s4p-mobile-pc-v1" -or
  $front -match "hidden md:block"
) {
  Write-Host "How S4P Works is still desktop-only. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: How S4P Works Access & Join is now on mobile and PC."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh (Ctrl+F5)"
