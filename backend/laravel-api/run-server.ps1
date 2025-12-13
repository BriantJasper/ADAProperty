param(
  [string]$Host = "127.0.0.1",
  [int]$Port = 8000,
  [string]$PhpPath = ""
)

# Exit on errors
$ErrorActionPreference = "Stop"

function Find-Php {
  param([string]$PreferredPath)
  if ($PreferredPath -and (Test-Path $PreferredPath)) { return $PreferredPath }
  $cmd = Get-Command php -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $wingetPhp = Get-ChildItem "C:\Users\$env:USERNAME\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.*\php.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($wingetPhp) { return $wingetPhp.FullName }
  $xamppPhp = "C:\xampp\php\php.exe"
  if (Test-Path $xamppPhp) { return $xamppPhp }
  $programFilesPhp = "C:\Program Files\php\php.exe"
  if (Test-Path $programFilesPhp) { return $programFilesPhp }
  return $null
}

function Ensure-Composer {
  $composerCmd = Get-Command composer -ErrorAction SilentlyContinue
  if (-not $composerCmd) {
    Write-Warning "Composer tidak ditemukan di PATH. Lewati instalasi dependencies. Pastikan vendor sudah ada."
    return $false
  }
  return $true
}

function Ensure-Env {
  param([string]$LaravelDir)
  $envFile = Join-Path $LaravelDir ".env"
  $envExample = Join-Path $LaravelDir ".env.example"

  if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
      Copy-Item $envExample $envFile
      Write-Host "Menyalin .env dari .env.example" -ForegroundColor Green
    } else {
      New-Item -ItemType File -Path $envFile | Out-Null
      Write-Host "Membuat file .env baru" -ForegroundColor Green
    }
  }

  $envContent = Get-Content $envFile -ErrorAction SilentlyContinue
  if (-not ($envContent | Select-String -Pattern "^JWT_SECRET=.*")) {
    $secret = [System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()
    Add-Content -Path $envFile -Value "`nJWT_SECRET=$secret`n"
    Write-Host "Menambahkan JWT_SECRET ke .env" -ForegroundColor Green
  }
}

function Run-Artisan {
  param([string]$PhpExec, [string]$LaravelDir)
  Push-Location $LaravelDir
  try {
    # Install dependencies jika belum ada vendor
    if (-not (Test-Path (Join-Path $LaravelDir "vendor"))) {
      if (Ensure-Composer) {
        Write-Host "Menjalankan composer install..." -ForegroundColor Cyan
        composer install --no-interaction | Write-Output
      } else {
        Write-Warning "Folder vendor tidak ada dan composer tidak tersedia. Laravel mungkin gagal berjalan."
      }
    }

    # Generate key jika diperlukan
    Write-Host "Generate APP_KEY (aman untuk dijalankan berulang)..." -ForegroundColor Cyan
    & $PhpExec artisan key:generate | Write-Output

    # Migrasi database
    Write-Host "Menjalankan migrasi database..." -ForegroundColor Cyan
    & $PhpExec artisan migrate --force | Write-Output

    # Seed admin default
    Write-Host "Menjalankan seeder AdminUserSeeder..." -ForegroundColor Cyan
    try { & $PhpExec artisan db:seed --class=AdminUserSeeder --no-interaction | Write-Output } catch { Write-Warning "Seeder AdminUserSeeder tidak tersedia atau gagal. Lewati langkah ini." }

    # Jalankan server
    $url = "http://{0}:{1}/" -f $Host, $Port
    Write-Host "Menjalankan server: $url" -ForegroundColor Green
    & $PhpExec artisan serve --host=$Host --port=$Port
  } finally {
    Pop-Location
  }
}

# Entry
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LaravelDir = $ScriptDir

if (-not $PhpPath) {
  $PhpPath = Find-Php -PreferredPath $PhpPath
}

if (-not $PhpPath) {
  Write-Error "PHP tidak ditemukan. Instal PHP 8.x dan pastikan 'php' ada di PATH, atau berikan -PhpPath ke skrip ini."
  exit 1
}

Write-Host "PHP ditemukan: $PhpPath" -ForegroundColor Green
Ensure-Env -LaravelDir $LaravelDir
Run-Artisan -PhpExec $PhpPath -LaravelDir $LaravelDir
