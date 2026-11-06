$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/sponsor/invitations"
if (-not (Test-Path "app\components\sponsor\SponsorInviteInbox.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\sponsor\SponsorInviteInbox.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/local-invite-pay-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/local-invite-pay-18f9 failed" }
git checkout origin/cursor/local-invite-pay-18f9 -- `
  app/components/sponsor/SponsorInviteInbox.tsx `
  app/services/sponsor-listings.service.ts `
  app/sponsor/pay/page.tsx `
  app/sponsor/invitations/page.tsx `
  app/services/current-sponsor.service.ts `
  scripts/verify-local-invite-pay.ts `
  scripts/verify-sponsor-listings.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/local-invite-pay-18f9 failed" }

$inbox = Get-Content -Raw "app\components\sponsor\SponsorInviteInbox.tsx"
if ($inbox -notmatch "data-local-invite-pay" -or $inbox -notmatch "sponsorPayPath") {
  Write-Host "The local invite payment files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Local Business Climate Sponsors now go to card payment after Proceed to Payment. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
