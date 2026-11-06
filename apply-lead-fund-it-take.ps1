$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/dashboard/supporter/vote"
if (-not (Test-Path "app\components\fan\ClimateProjectSponsors.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\fan\ClimateProjectSponsors.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/lead-fund-it-take-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/lead-fund-it-take-18f9 failed" }
git checkout origin/cursor/lead-fund-it-take-18f9 -- `
  app/components/fan/ClimateProjectSponsors.tsx `
  app/components/fan/FanCampaignWorkspace.tsx `
  app/services/match-day-folder.service.ts `
  scripts/verify-wallet-vote.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/lead-fund-it-take-18f9 failed" }

$ui = Get-Content -Raw "app\components\fan\ClimateProjectSponsors.tsx"
if ($ui -notmatch 'data-fund-it-native="lead-fund-it-take-v1"') {
  Write-Host "The Lead FUND-IT take files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Tap a Climate Project, then press FUND-IT — £0.20 leaves the Lead wallet. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
