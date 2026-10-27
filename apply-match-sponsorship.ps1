$ErrorActionPreference = "Stop"
Write-Host "Folder: $(Get-Location)"

$wallets = Get-ChildItem -Path . -Recurse -Filter ClimateSponsorshipWallet.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.next\\" }

if (-not $wallets) {
  Write-Host "Could not find ClimateSponsorshipWallet.tsx under this folder."
  Write-Host "Open the SAME terminal that runs npm run dev, cd to S4C-platform, and run this again."
  exit 1
}

$branch = "cursor/match-sponsorship-18f9"
$files = @(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-listings.ts",
  "app/sponsor/wallet/page.tsx"
)

$roots = $wallets | ForEach-Object {
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
foreach ($wallet in $wallets) {
  $text = Get-Content -Raw $wallet.FullName
  if ($text -match "s4p-match-sponsorship-wallet-v2") {
    Write-Host "Updated wallet: $($wallet.FullName)"
    $updated++
  } else {
    Write-Host "Still old wallet: $($wallet.FullName)"
  }
}

if ($updated -lt 1) { exit 1 }
Write-Host "OK: wallet files updated. In the npm run dev terminal: Ctrl+C, Remove-Item -Recurse -Force .next, npm run dev, then Ctrl+F5."
