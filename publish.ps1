# 小田简报一键发布脚本
# 用法：在 PowerShell 中运行 .\publish.ps1
# 或运行 .\publish.ps1 -date "2026-05-30"

param(
    [string]$date = (Get-Date -Format "yyyy-MM-dd")
)

$repoDir = "C:\Users\User\Documents\xiaotian-briefing"
$desktopHtml = "$env:USERPROFILE\Desktop\xiaotian-briefing-$date.html"

# 检查桌面是否有今日简报
if (-not (Test-Path $desktopHtml)) {
    Write-Host "❌ 未找到今日简报文件: $desktopHtml" -ForegroundColor Red
    Write-Host "请先运行「小田简报」生成今日 HTML 文件" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 找到今日简报: $desktopHtml" -ForegroundColor Green

# 复制为 index.html（最新简报）
Copy-Item $desktopHtml "$repoDir\index.html" -Force
Write-Host "✅ 已更新 index.html" -ForegroundColor Green

# 复制到 archive 归档
Copy-Item $desktopHtml "$repoDir\archive\$date.html" -Force
Write-Host "✅ 已归档 archive/$date.html" -ForegroundColor Green

# Git commit & push
Set-Location $repoDir
git add .
git commit -m "📰 小田简报 $date"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🚀 发布成功！" -ForegroundColor Green
    Write-Host "🔗 网站将在约 1 分钟后更新" -ForegroundColor Cyan
} else {
    Write-Host "❌ 推送失败，请检查 GitHub 权限" -ForegroundColor Red
}
