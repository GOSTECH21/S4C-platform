$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/"
if (-not (Test-Path "app\components\home\HomeTopBanner.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\home\HomeTopBanner.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/banner-drop-sport-icons-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/banner-drop-sport-icons-18f9 failed" }
git checkout origin/cursor/banner-drop-sport-icons-18f9 -- `
  public/images/home/global-sports-cluster.png `
  app/components/home/HomeTopBanner.tsx `
  scripts/verify-banner-drop-sport-icons.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/banner-drop-sport-icons-18f9 failed" }

$banner = Get-Content -Raw "app\components\home\HomeTopBanner.tsx"
if ($banner -notmatch "banner-drop-sport-icons-v1" -or $banner -notmatch "data-home-five-sports") {
  Write-Host "The homepage banner files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: The cluster artwork no longer duplicates the five sport icons. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
