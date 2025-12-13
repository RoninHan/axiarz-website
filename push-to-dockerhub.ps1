# Docker Hub 推送脚本 (PowerShell) - 支持多架构 (ARM64/AMD64)
# 使用方法: .\push-to-dockerhub.ps1 -Username YOUR_USERNAME [-Version v1.0.0] [-SingleArch]

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$ImageName = "axiarz-website",
    
    [Parameter(Mandatory=$false)]
    [switch]$SingleArch = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Hub 镜像推送脚本 (多架构支持)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否安装
Write-Host "检查 Docker 安装..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker 已安装: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker 未安装或未在 PATH 中" -ForegroundColor Red
    exit 1
}

# 检查是否已登录
Write-Host "检查 Docker Hub 登录状态..." -ForegroundColor Yellow
$loginStatus = docker info 2>&1 | Select-String "Username"
if (-not $loginStatus) {
    Write-Host "需要登录 Docker Hub..." -ForegroundColor Yellow
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker Hub 登录失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ 已登录 Docker Hub" -ForegroundColor Green
}

$fullImageName = "${Username}/${ImageName}:${Version}"

if ($SingleArch) {
    # 单架构构建（当前平台）
    Write-Host ""
    Write-Host "构建单架构镜像: $fullImageName" -ForegroundColor Yellow
    Write-Host "这可能需要几分钟时间..." -ForegroundColor Yellow
    docker build -t $fullImageName .

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 镜像构建失败" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ 镜像构建成功" -ForegroundColor Green

    # 推送镜像
    Write-Host ""
    Write-Host "推送镜像到 Docker Hub..." -ForegroundColor Yellow
    docker push $fullImageName

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 镜像推送失败" -ForegroundColor Red
        exit 1
    }
} else {
    # 多架构构建 (ARM64 + AMD64)
    Write-Host ""
    Write-Host "设置 Docker Buildx..." -ForegroundColor Yellow
    
    # 检查 buildx 是否可用
    $buildxCheck = docker buildx version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker Buildx 不可用，请更新 Docker 到最新版本" -ForegroundColor Red
        Write-Host "  或者使用 -SingleArch 参数进行单架构构建" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Docker Buildx 可用" -ForegroundColor Green

    # 创建并使用多架构 builder
    Write-Host "创建多架构 builder..." -ForegroundColor Yellow
    $builderName = "axiarz-multiarch"
    $builderExists = docker buildx ls | Select-String $builderName
    
    if (-not $builderExists) {
        docker buildx create --name $builderName --use --bootstrap
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ 创建 builder 失败" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ 已创建 builder: $builderName" -ForegroundColor Green
    } else {
        docker buildx use $builderName
        Write-Host "✓ 使用现有 builder: $builderName" -ForegroundColor Green
    }

    # 构建并推送多架构镜像
    Write-Host ""
    Write-Host "构建多架构镜像 (linux/amd64, linux/arm64): $fullImageName" -ForegroundColor Yellow
    Write-Host "这可能需要较长时间，请耐心等待..." -ForegroundColor Yellow
    Write-Host ""
    
    docker buildx build `
        --platform linux/amd64,linux/arm64 `
        --tag $fullImageName `
        --push `
        .

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 多架构镜像构建/推送失败" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ 多架构镜像构建并推送成功" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ 完成！镜像已成功推送到 Docker Hub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "镜像信息:" -ForegroundColor Cyan
Write-Host "  名称: $fullImageName" -ForegroundColor White
if (-not $SingleArch) {
    Write-Host "  架构: linux/amd64, linux/arm64" -ForegroundColor White
}
Write-Host "  URL: https://hub.docker.com/r/${Username}/${ImageName}" -ForegroundColor White
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "  docker pull $fullImageName" -ForegroundColor White
Write-Host ""
if (-not $SingleArch) {
    Write-Host "注意: Docker 会自动选择适合您平台的架构版本" -ForegroundColor Yellow
    Write-Host ""
}

