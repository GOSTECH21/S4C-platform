$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/club/admin"
if (-not (Test-Path "app\components\club\ClubAdminLookbackAndCilt.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\club\ClubAdminLookbackAndCilt.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/admin-lookback-accordion-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/admin-lookback-accordion-18f9 failed" }
git checkout origin/cursor/admin-lookback-accordion-18f9 -- `
  app/lib/cilt.ts `
  app/lib/fan-footprint.ts `
  app/globals.css `
  app/components/club/FanFootprintAnalytics.tsx `
  app/components/club/ClubAdminLookbackAndCilt.tsx `
  app/preview/club-admin/page.tsx `
  scripts/verify-club-my-admin.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/admin-lookback-accordion-18f9 failed" }

$source = Get-Content -Raw "app\components\club\ClubAdminLookbackAndCilt.tsx"
if ($source -notmatch "lookback-accordion-v1") {
  Write-Host "The My Admin accordion files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: My Admin sponsorships collapse to three lines, and FanFootprint Analytics is on the page. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
