$ErrorActionPreference = "Stop"

Write-Host "Working folder: $(Get-Location)"
Write-Host "LIVE page: http://localhost:3000/supporter/dashboard/matchrav"
if (-not (Test-Path "app\components\fan\FanMatchravPanel.tsx")) {
  Write-Host "This is not the S4C-platform folder. cd into the folder that contains app\components\fan\FanMatchravPanel.tsx, then run this script again."
  exit 1
}

git fetch origin cursor/matchrav-journey-ops-18f9
if ($LASTEXITCODE -ne 0) { throw "git fetch origin cursor/matchrav-journey-ops-18f9 failed" }
git checkout origin/cursor/matchrav-journey-ops-18f9 -- `
  app/lib/matchrav.ts `
  app/lib/matchrav-journey.ts `
  app/lib/project-site.ts `
  app/lib/routes.ts `
  app/components/fan/FanMatchravPanel.tsx `
  app/supporter/dashboard/matchrav/page.tsx `
  app/components/admin/MatchravOpsBoard.tsx `
  app/admin/matchrav/page.tsx `
  app/preview/matchrav-ops/page.tsx `
  app/api/fan/matchrav-fixtures/route.ts `
  app/layout/Sidebar.tsx `
  scripts/verify-matchrav-journey.ts
if ($LASTEXITCODE -ne 0) { throw "git checkout origin/cursor/matchrav-journey-ops-18f9 failed" }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

$panel = Get-Content -Raw "app\components\fan\FanMatchravPanel.tsx"
if (
  $panel -notmatch "data-matchrav-fixture" -or
  $panel -notmatch "data-matchrav-privacy" -or
  $panel -match "PhoneFrame"
) {
  Write-Host "The Matchrav journey files did not land. Wrong folder: $(Get-Location)"
  exit 1
}

Write-Host "OK: Matchrav now plans fixtures, origin, routes, return trips and privacy. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
