$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/supporter/dashboard"
if (-not (Test-Path "app\components\fan\FanCampaignWorkspace.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\fan\FanCampaignWorkspace.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/match-sponsorship-lead-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/match-sponsorship-lead-18f9 failed" }
git checkout origin/cursor/match-sponsorship-lead-18f9 -- `
  app/components/fan/CampaignMatchHeader.tsx `
  app/components/fan/FanCampaignWorkspace.tsx `
  app/lib/sponsorship-auction.ts `
  app/preview/my-s4p/page.tsx `
  app/preview/rangers-headline/page.tsx
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/match-sponsorship-lead-18f9 failed" }

$source = Get-Content -Raw "app\components\fan\CampaignMatchHeader.tsx"
if ($source -notmatch "matchSponsorshipHeading") {
  Write-Host "The Match Sponsorship heading files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Club line is Match Sponsorship, then the Climate Campaign, then Sponsored By. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
