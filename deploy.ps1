# Axiarz Website 部署脚本 (Windows PowerShell)
# 使用方法: .\deploy.ps1 [start|stop|restart|logs|build]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "build")]
    [string]$Action = "start"
)

# 检查 Docker 和 Docker Compose
function Test-Dependencies {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "错误: 未安装 Docker，请先安装 Docker Desktop" -ForegroundColor Red
        exit 1
    }

    $dockerCompose = $null
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $dockerCompose = "docker-compose"
    } elseif (docker compose version 2>$null) {
        $dockerCompose = "docker compose"
    } else {
        Write-Host "错误: 未安装 Docker Compose，请先安装 Docker Compose" -ForegroundColor Red
        exit 1
    }
    return $dockerCompose
}

# 检查环境变量文件
function Test-EnvFile {
    if (-not (Test-Path .env)) {
        Write-Host "警告: .env 文件不存在，正在从 .env.example 创建..." -ForegroundColor Yellow
        if (Test-Path .env.example) {
            Copy-Item .env.example .env
            Write-Host "已创建 .env 文件，请编辑后重新运行部署脚本" -ForegroundColor Green
            exit 1
        } else {
            Write-Host "错误: .env.example 文件不存在" -ForegroundColor Red
            exit 1
        }
    }
}

# 创建必要的目录
function New-Directories {
    Write-Host "创建必要的目录..." -ForegroundColor Yellow
    if (-not (Test-Path "public\uploads")) {
        New-Item -ItemType Directory -Path "public\uploads" -Force | Out-Null
    }
}

# 启动服务
function Start-Services {
    param([string]$DockerCompose)
    Write-Host "启动服务..." -ForegroundColor Green
    Invoke-Expression "$DockerCompose up -d"
    Write-Host "服务已启动！" -ForegroundColor Green
    Write-Host "等待数据库初始化..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host "应用地址: http://localhost:3000" -ForegroundColor Green
    Write-Host "后台管理: http://localhost:3000/admin/login" -ForegroundColor Green
}

# 停止服务
function Stop-Services {
    param([string]$DockerCompose)
    Write-Host "停止服务..." -ForegroundColor Yellow
    Invoke-Expression "$DockerCompose down"
    Write-Host "服务已停止" -ForegroundColor Green
}

# 重启服务
function Restart-Services {
    param([string]$DockerCompose)
    Write-Host "重启服务..." -ForegroundColor Yellow
    Invoke-Expression "$DockerCompose restart"
    Write-Host "服务已重启" -ForegroundColor Green
}

# 查看日志
function Show-Logs {
    param([string]$DockerCompose)
    Write-Host "查看服务日志..." -ForegroundColor Yellow
    Invoke-Expression "$DockerCompose logs -f"
}

# 构建镜像
function Build-Images {
    param([string]$DockerCompose)
    Write-Host "构建 Docker 镜像..." -ForegroundColor Yellow
    Invoke-Expression "$DockerCompose build --no-cache"
    Write-Host "镜像构建完成" -ForegroundColor Green
}

# 主函数
function Main {
    $dockerCompose = Test-Dependencies
    Test-EnvFile
    New-Directories

    switch ($Action) {
        "start" {
            Start-Services -DockerCompose $dockerCompose
        }
        "stop" {
            Stop-Services -DockerCompose $dockerCompose
        }
        "restart" {
            Restart-Services -DockerCompose $dockerCompose
        }
        "logs" {
            Show-Logs -DockerCompose $dockerCompose
        }
        "build" {
            Build-Images -DockerCompose $dockerCompose
        }
    }
}

Main





