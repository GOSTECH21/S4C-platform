$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
if (-not (Test-Path "app\club\dashboard\page.tsx")) {
  Write-Host "This is not the S4C-platform folder."
  Write-Host "cd into the folder that contains app\club\dashboard\page.tsx, then run this script again."
  exit 1
}

Write-Host "LIVE page (no local files needed):"
Write-Host "https://s4-c-platform.vercel.app/preview/club-select-match"

function Fetch-Main {
  git fetch origin main
  if ($LASTEXITCODE -ne 0) { return $false }
  git checkout origin/main -- `
    app/components/home/PhoneFrame.tsx `
    app/components/home/SelectMatchFixtures.tsx `
    app/components/home/HowS4pSelectMatch.tsx `
    app/lib/how-s4p-works.ts `
    app/preview/club-select-match/page.tsx
  if ($LASTEXITCODE -ne 0) { return $false }
  Write-Host "Checked out Club Select Match files from origin/main."
  return $true
}

if (-not (Fetch-Main)) {
  Write-Host "git fetch/checkout failed. Stay in the S4C-platform folder and check git is installed."
  exit 1
}

if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
  Write-Host "Cleared .next so Next.js cannot keep the old phone frame."
}

$fixtures = Get-Content -Raw "app\components\home\SelectMatchFixtures.tsx"
$frame = Get-Content -Raw "app\components\home\PhoneFrame.tsx"
$select = Get-Content -Raw "app\components\home\HowS4pSelectMatch.tsx"
if (
  $fixtures -notmatch 'framed=\{mode !== "club"\}' -or
  $fixtures -notmatch "club-pc-no-phone-frame-v1" -or
  $frame -notmatch "data-phone-unframed" -or
  $select -notmatch "CLUB_FIXTURE_COLUMN_CLASS"
) {
  Write-Host "Club Select Match still has the phone surroundings. This script did not land in the folder npm run dev is using."
  Write-Host "Folder checked: $(Get-Location)"
  exit 1
}

Write-Host "OK: this folder now has the fixture list without the phone bezel."
Write-Host "1. Stop npm run dev (Ctrl+C)"
Write-Host "2. Run npm run dev again"
Write-Host "3. Hard-refresh the Club dashboard (Ctrl+F5)"
Write-Host "Or skip local files and open:"
Write-Host "https://s4-c-platform.vercel.app/preview/club-select-match"
Write-Host "Club login: https://s4-c-platform.vercel.app/club/login"
