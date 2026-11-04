$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: https://s4-c-platform.vercel.app/preview/club-sponsors-address-books"
if (-not (Test-Path "app\club\dashboard\page.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\club\dashboard\page.tsx, then run this script again."
  exit 1
}

git fetch origin main
if ($LASTEXITCODE -ne 0) { throw "git fetch origin main failed" }
git checkout origin/main -- `
  app/lib/routes.ts `
  app/lib/partner-projects.ts `
  app/lib/sponsor-listings.ts `
  app/components/club/ClubSponsorsAddressBooks.tsx `
  app/components/club/ClubSponsorsListings.tsx `
  app/club/sponsors/page.tsx `
  app/club/admin/page.tsx `
  app/club/dashboard/page.tsx `
  app/club/projects/select/page.tsx
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/main failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$sponsors = Get-Content -Raw "app\club\sponsors\page.tsx"
$admin = Get-Content -Raw "app\club\admin\page.tsx"
$dashboard = Get-Content -Raw "app\club\dashboard\page.tsx"
if (
  $sponsors -notmatch "ClubSponsorsAddressBooks" -or
  $admin -match "ClubAddressBookPanel" -or
  $dashboard -notmatch "SEND_INVITATION_LABEL"
) {
  Write-Host "Address Books are still on My Admin. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Address Books are on Sponsors with Existing Sponsors."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh (Ctrl+F5)"
Write-Host "Or open https://s4-c-platform.vercel.app/preview/club-sponsors-address-books"
