$ErrorActionPreference = "Stop"
Write-Host "Folder: $(Get-Location)"

$markers = Get-ChildItem -Path . -Recurse -Filter HowItWorks.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.next\\" }

if (-not $markers) {
  Write-Host "Could not find HowItWorks.tsx under this folder."
  Write-Host "Open the SAME terminal that runs npm run dev, cd to S4C-platform, and run this again."
  exit 1
}

$branch = "cursor/p4p-wallet-full-time-18f9"
$bust = "p4p-wallet-full-time-1"
$files = @(
  "app/lib/predict-for-planet.ts",
  "app/lib/score-for-planet.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/sports.ts",
  "app/lib/sponsored-goal.ts",
  "app/lib/fan-register-copy.ts",
  "app/services/sponsored-goal.service.ts",
  "app/services/sponsor-wallet.service.ts",
  "app/lib/match-day-carbon-offset.ts",
  "app/climate-sponsorship/page.tsx",
  "app/climate-credits/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/services/predict-for-planet.service.ts",
  "scripts/verify-score-for-planet.ts",
  "app/lib/how-s4p-works.ts",
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/PhoneFrame.tsx",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/components/home/HowYoureSupporting.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/dashboard/supporter/components/FanNav.tsx",
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "app/dashboard/supporter/predict/page.tsx",
  "app/dashboard/supporter/preferences/page.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "app/components/fan/FanMyTeamsPanel.tsx",
  "app/components/fan/FanCiftTable.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/supporter/dashboard/page.tsx",
  "app/supporter/dashboard/cift/page.tsx",
  "app/supporter/dashboard/climate-sponsors/page.tsx",
  "app/lib/s4p-impact-tables.ts",
  "app/services/s4p-impact-tables.service.ts",
  "scripts/verify-fan-five-tabs.ts",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/predict-for-planet/page.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/components/sponsor/MatchDayLockIn.tsx",
  "app/club/dashboard/page.tsx",
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
  "scripts/verify-homepage.ts",
  "scripts/verify-how-s4p-split.ts"
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
  $gameTime = Join-Path $root "app\sponsor\game-time\page.tsx"
  $preview = Join-Path $root "app\components\fan\P4pLiveChallengePreview.tsx"
  $banner = Join-Path $root "app\components\home\HomeTopBanner.tsx"
  $howText = if (Test-Path $how) { Get-Content -Raw $how } else { "" }
  $bannerText = if (Test-Path $banner) { Get-Content -Raw $banner } else { "" }
  $libText = if (Test-Path $lib) { Get-Content -Raw $lib } else { "" }
  $playText = if (Test-Path $play) { Get-Content -Raw $play } else { "" }
  $phoneText = if (Test-Path $phone) { Get-Content -Raw $phone } else { "" }
  $gameTimeText = if (Test-Path $gameTime) { Get-Content -Raw $gameTime } else { "" }
  $previewText = if (Test-Path $preview) { Get-Content -Raw $preview } else { "" }
  if (
    $howText -match "how-s4p-split-steps-v1" -and
    $howText -match "HOW_S4P_ACCESS_JOIN" -and
    $howText -match "hidden md:block" -and
    $howText -match "data-phone-frame" -and
    $howText -notmatch "Explore the six steps below" -and
    $howText -notmatch "PredictForPlanetPhone" -and
    $howText -notmatch "Plan Your Travel"
  ) {
    Write-Host "Updated How S4P Works Access & Join: $how"
    $updated++
  } else {
    Write-Host "Still old How S4P Works six-step carousel: $how"
  }
  if (
    $bannerText -match "offset its Match Day carbon emissions" -and
    $bannerText -match "Global Brands & Businesses" -and
    $bannerText -notmatch "We help elite sports clubs, their fans, sponsors and partners"
  ) {
    Write-Host "Updated homepage hero Match Day offset copy: $banner"
    $updated++
  } else {
    Write-Host "Still old homepage hero copy: $banner"
  }
  if (
    $libText -match "s4p-predict-for-planet-v7" -and
    $libText -match "Handball offence" -and
    $libText -match "VAR referee review" -and
    $libText -match "Fans engagement with this challenge" -and
    $libText -match "p4pPlayIntroCopy"
  ) {
    Write-Host "Updated Predict-For Planet model: $lib"
    $updated++
  } else {
    Write-Host "Still old Predict-For Planet model: $lib"
  }
  if (
    $playText -match "s4p-predict-for-planet-v7" -and
    $playText -match "p4p-powered-by" -and
    $playText -match "P4P_PREDICT_NEXT_LABEL" -and
    $playText -match "if \(!hydrated \|\| !sponsored\)" -and
    $playText -match "P4P_FANS_ENGAGEMENT_LABEL" -and
    $playText -match "FAN_CARBON_WALLET_LABEL" -and
    $playText -notmatch "bg-\[#10262c\]"
  ) {
    Write-Host "Ivory live board with Predict what happens next: $play"
    $updated++
  } else {
    Write-Host "Still old dark P4P live board: $play"
  }
  if (
    $phoneText -match "s4p-predict-for-planet-v7" -and
    $phoneText -match "#fffdf8" -and
    $phoneText -match "PhoneFrame" -and
    $phoneText -match "earnedGbp" -and
    $phoneText -notmatch "12.4" -and
    $phoneText -notmatch "#0b1f14"
  ) {
    Write-Host "Ivory How S4P Works P4P phone with sponsor mark: $phone"
    $updated++
  } else {
    Write-Host "Still old dark How S4P Works P4P phone: $phone"
  }
  if (
    $gameTimeText -match "P4pLiveChallengePreview" -and
    $previewText -match "What fans see on Predict-For Planet" -and
    $previewText -match "p4p-powered-by" -and
    $previewText -match "P4P_FANS_ENGAGEMENT_LABEL"
  ) {
    Write-Host "Game-Time shows ivory live board and sponsor mark: $gameTime"
    $updated++
  } else {
    Write-Host "Still old Game-Time page without the ivory P4P preview: $gameTime"
  }
}

if ($updated -lt 6) { exit 1 }
Write-Host "OK: Homepage hero now says we help your team offset Match Day carbon emissions with climate projects funded by Global Brands & Businesses. Desktop still shows the How S4P phone mockups; a handset does not. Do not re-run the listings overlay or Match-Sponsorship overlay after this. In the npm run dev terminal: Ctrl+C, then delete the .next folder, then npm run dev, then Ctrl+F5. Open http://localhost:3000/"
