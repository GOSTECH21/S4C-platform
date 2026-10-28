$ErrorActionPreference = "Stop"
Write-Host "Folder: $(Get-Location)"

$markers = Get-ChildItem -Path . -Recurse -Filter HowItWorks.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.next\\" }

if (-not $markers) {
  Write-Host "Could not find HowItWorks.tsx under this folder."
  Write-Host "Open the SAME terminal that runs npm run dev, cd to S4C-platform, and run this again."
  exit 1
}

$branch = "cursor/p4p-live-challenge-18f9"
$files = @(
  "app/lib/predict-for-planet.ts",
  "app/services/predict-for-planet.service.ts",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/dashboard/supporter/components/FanNav.tsx",
  "app/dashboard/supporter/predict/page.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/predict-for-planet/page.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/lib/calendar-clubs.ts",
  "app/sponsor/register/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/climate-sponsorship/page.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/lib/home-stakeholders.ts",
  "app/lib/routes.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/sports.ts",
  "apply-match-sponsorship.mjs",
  "apply-match-sponsorship.ps1",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-homepage.ts"
)

$roots = $markers | ForEach-Object {
  Split-Path (Split-Path (Split-Path (Split-Path $_.FullName)))
} | Select-Object -Unique

foreach ($root in $roots) {
  Write-Host "Updating $root"
  foreach ($rel in $files) {
    $url = "https://raw.githubusercontent.com/GOSTECH21/S4C-platform/$branch/$rel"
    $dest = Join-Path $root ($rel -replace "/", "\")
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $dest
    Write-Host "Pulled $dest"
  }
}

$updated = 0
foreach ($root in $roots) {
  $how = Join-Path $root "app\components\home\HowItWorks.tsx"
  $lib = Join-Path $root "app\lib\predict-for-planet.ts"
  $howText = if (Test-Path $how) { Get-Content -Raw $how } else { "" }
  $libText = if (Test-Path $lib) { Get-Content -Raw $lib } else { "" }
  if (
    $howText -match "s4p-predict-for-planet-v1" -and
    $howText -match "PredictForPlanetPhone" -and
    $howText -notmatch "Plan Your Travel"
  ) {
    Write-Host "Updated How S4P Works Step 4: $how"
    $updated++
  } else {
    Write-Host "Still old How S4P Works Step 4: $how"
  }
  if (
    $libText -match "s4p-predict-for-planet-v1" -and
    $libText -match "Handball offence" -and
    $libText -match "VAR referee review"
  ) {
    Write-Host "Updated Predict-For Planet model: $lib"
    $updated++
  } else {
    Write-Host "Still old Predict-For Planet model: $lib"
  }
}

if ($updated -lt 2) { exit 1 }
Write-Host "OK: Predict-For Planet is How S4P Works Step 4. Do not re-run the listings overlay or Match-Sponsorship overlay after this. In the npm run dev terminal: Ctrl+C, npm run dev, then Ctrl+F5. Open How S4P Works Step 4, or http://localhost:3000/preview/predict-for-planet"
