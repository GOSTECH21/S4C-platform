$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: https://s4-c-platform.vercel.app/preview/club-pending-invite"
if (-not (Test-Path "app\club\dashboard\page.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\club\dashboard\page.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/club-sponsors-address-books-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/club-sponsors-address-books-18f9 failed" }
git checkout origin/cursor/club-sponsors-address-books-18f9 -- `
  app/lib/routes.ts `
  app/lib/partner-projects.ts `
  app/lib/sponsor-listings.ts `
  app/components/club/ClubSponsorsAddressBooks.tsx `
  app/components/club/ClubSponsorsListings.tsx `
  app/components/club/SendInvitationToSponsorsLink.tsx `
  app/club/sponsors/page.tsx `
  app/club/admin/page.tsx `
  app/club/dashboard/page.tsx `
  app/club/projects/select/page.tsx `
  app/preview/club-pending-invite/page.tsx
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/club-sponsors-address-books-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$sponsors = Get-Content -Raw "app\club\sponsors\page.tsx"
$admin = Get-Content -Raw "app\club\admin\page.tsx"
$dashboard = Get-Content -Raw "app\club\dashboard\page.tsx"
if (
  $sponsors -notmatch "ClubSponsorsAddressBooks" -or
  $admin -match "ClubAddressBookPanel" -or
  $dashboard -notmatch "SendInvitationToSponsorsLink"
) {
  Write-Host "Address Books are still on My Admin. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: The phone dashboard keeps Send Invitation to Sponsors under the last Pending Approval project."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh on the phone (or open the live preview)"
Write-Host "Or open https://s4-c-platform.vercel.app/preview/club-pending-invite"
