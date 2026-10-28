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
$bust = "p4p-ivory-2"
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
    $url = "https://raw.githubusercontent.com/GOSTECH21/S4C-platform/$branch/$rel`?v=$bust"
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
  $play = Join-Path $root "app\components\fan\PredictForPlanetPlay.tsx"
  $phone = Join-Path $root "app\components\home\PredictForPlanet.tsx"
  $howText = if (Test-Path $how) { Get-Content -Raw $how } else { "" }
  $libText = if (Test-Path $lib) { Get-Content -Raw $lib } else { "" }
  $playText = if (Test-Path $play) { Get-Content -Raw $play } else { "" }
  $phoneText = if (Test-Path $phone) { Get-Content -Raw $phone } else { "" }
  if (
    $howText -match "s4p-predict-for-planet-v2" -and
    $howText -match "PredictForPlanetPhone" -and
    $howText -notmatch "Plan Your Travel"
  ) {
    Write-Host "Updated How S4P Works Step 4: $how"
    $updated++
  } else {
    Write-Host "Still old How S4P Works Step 4: $how"
  }
  if (
    $libText -match "s4p-predict-for-planet-v2" -and
    $libText -match "Handball offence" -and
    $libText -match "VAR referee review"
  ) {
    Write-Host "Updated Predict-For Planet model: $lib"
    $updated++
  } else {
    Write-Host "Still old Predict-For Planet model: $lib"
  }
  if (
    $playText -match "s4p-predict-for-planet-v2" -and
    $playText -match "p4p-powered-by" -and
    $playText -match "What happens next" -and
    $playText -notmatch "bg-\[#10262c\]"
  ) {
    Write-Host "Ivory live board and sponsor mark beside What happens next: $play"
    $updated++
  } else {
    Write-Host "Still old dark P4P live board: $play"
  }
  if (
    $phoneText -match "s4p-predict-for-planet-v2" -and
    $phoneText -match "#fffdf8" -and
    $phoneText -notmatch "#0b1f14"
  ) {
    Write-Host "Ivory How S4P Works P4P phone with sponsor mark: $phone"
    $updated++
  } else {
    Write-Host "Still old dark How S4P Works P4P phone: $phone"
  }
}

if ($updated -lt 4) { exit 1 }
Write-Host "OK: Live Climate Challenge is ivory like the rest of the page. The sponsor mark is to the right of What happens next. Do not re-run the listings overlay or Match-Sponsorship overlay after this. In the npm run dev terminal: Ctrl+C, then delete the .next folder, then npm run dev, then Ctrl+F5. Open http://localhost:3000/preview/predict-for-planet"
