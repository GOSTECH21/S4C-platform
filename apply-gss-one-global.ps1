$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/club/s4p-climate-projects"
if (-not (Test-Path "app\lib\featured-gss.ts")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\lib\featured-gss.ts, then run this script again."
  exit 1
}

git fetch origin cursor/gss-one-global-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/gss-one-global-18f9 failed" }
git checkout origin/cursor/gss-one-global-18f9 -- `
  app/lib/featured-gss.ts `
  app/lib/sccan-catalog.ts `
  app/lib/featured-climate-country.ts `
  app/lib/partner-projects.ts `
  app/lib/voting-window.ts `
  app/lib/predict-for-planet.ts `
  app/lib/fan-votes.ts `
  app/components/club/FeaturedGssPicker.tsx `
  app/components/fan/FanCampaignWorkspace.tsx `
  app/club/projects/select/page.tsx `
  app/global-schools-solar/page.tsx `
  app/services/club-match-day.service.ts `
  app/sponsor/campaigns/select/page.tsx `
  scripts/verify-gss-one-global.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/gss-one-global-18f9 failed" }

$catalog = Get-Content -Raw "app\lib\sccan-catalog.ts"
if ($catalog -notmatch 'country: "Global"') {
  Write-Host "The one Global Schools Solar files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Global Schools Solar is one Featured project for every country. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
