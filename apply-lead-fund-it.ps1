$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/dashboard/supporter/vote"
if (-not (Test-Path "app\components\fan\ClimateProjectSponsors.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\fan\ClimateProjectSponsors.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/rangers-lead-fund-it-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/rangers-lead-fund-it-18f9 failed" }
git checkout origin/cursor/rangers-lead-fund-it-18f9 -- `
  app/lib/dual-sponsor.ts `
  app/lib/sponsor-wallet.ts `
  app/components/fan/ClimateProjectSponsors.tsx `
  app/components/fan/FanCampaignWorkspace.tsx `
  app/services/match-day-folder.service.ts `
  app/services/match-day-branding.service.ts `
  scripts/verify-wallet-vote.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/rangers-lead-fund-it-18f9 failed" }

$ui = Get-Content -Raw "app\components\fan\ClimateProjectSponsors.tsx"
if ($ui -notmatch 'data-lead-fund-it="lead-fund-it-v1"') {
  Write-Host "The Rangers Lead FUND-IT files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Tap a Climate Project on the Rangers Lead wallet, then press FUND-IT. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
