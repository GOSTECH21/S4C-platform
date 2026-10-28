$ErrorActionPreference = "Stop"
Write-Host "Folder: $(Get-Location)"

$markers = @()
$markers += Get-ChildItem -Path . -Recurse -Filter ClimateSponsorshipWallet.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.next\\" }
$markers += Get-ChildItem -Path . -Recurse -Filter SponsorInviteInbox.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.next\\" }

if (-not $markers) {
  Write-Host "Could not find SponsorInviteInbox.tsx or ClimateSponsorshipWallet.tsx under this folder."
  Write-Host "Open the SAME terminal that runs npm run dev, cd to S4C-platform, and run this again."
  exit 1
}

$branch = "cursor/match-sponsorship-18f9"
$files = @(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/sports.ts"
)

$roots = $markers | ForEach-Object {
  Split-Path (Split-Path (Split-Path (Split-Path $_.FullName)))
} | Select-Object -Unique

foreach ($root in $roots) {
  $p4p = Join-Path $root "app\lib\predict-for-planet.ts"
  $how = Join-Path $root "app\components\home\HowItWorks.tsx"
  $p4pText = if (Test-Path $p4p) { Get-Content -Raw $p4p } else { "" }
  $howText = if (Test-Path $how) { Get-Content -Raw $how } else { "" }
  if ($p4pText -match "s4p-predict-for-planet-v1" -or $howText -match "s4p-predict-for-planet-v1") {
    Write-Host "STOP: Predict-For Planet is already applied. Re-running Match-Sponsorship would drop Game-Time. Use apply-predict-for-planet.mjs instead."
    exit 1
  }
}

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
  $wallet = Join-Path $root "app\components\sponsor\ClimateSponsorshipWallet.tsx"
  $inbox = Join-Path $root "app\components\sponsor\SponsorInviteInbox.tsx"
  $walletText = if (Test-Path $wallet) { Get-Content -Raw $wallet } else { "" }
  $inboxText = if (Test-Path $inbox) { Get-Content -Raw $inbox } else { "" }
  if ($walletText -match "s4p-match-sponsorship-wallet-v2") {
    Write-Host "Updated wallet: $wallet"
    $updated++
  } else {
    Write-Host "Still old wallet: $wallet"
  }
  if (
    $inboxText -match "s4p-match-sponsorship-inbox-v2" -and
    $inboxText -notmatch "Commitment Fee" -and
    $inboxText -notmatch "Sponsorship/Goal" -and
    $inboxText -notmatch "Commit sponsorship amounts"
  ) {
    Write-Host "Updated invitations inbox: $inbox"
    $updated++
  } else {
    Write-Host "Still old invitations inbox: $inbox"
  }
}

if ($updated -lt 2) { exit 1 }
Write-Host "OK: Invitations and wallet now use one Match-Sponsorship amount. In the npm run dev terminal: Ctrl+C, Remove-Item -Recurse -Force .next, npm run dev, then Ctrl+F5 on Invitations."
