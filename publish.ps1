# 小田简报一键发布脚本
# 每天生成简报后运行此脚本，自动推送到 GitHub Pages
# 用法：在 PowerShell 中运行 .\publish.ps1

param(
    [string]$date = (Get-Date -Format "yyyy-MM-dd")
)

$repoDir   = "C:\Users\User\Documents\xiaotian-briefing"
$siteUrl   = "https://bairimenglan1991.github.io/xiaotian-briefing/"
$desktopHtml = "$env:USERPROFILE\Desktop\xiaotian-briefing-$date.html"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  📰 小田每日简报 · 一键发布" -ForegroundColor Cyan
Write-Host "  日期：$date" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查桌面是否有今日简报
if (-not (Test-Path $desktopHtml)) {
    Write-Host "❌ 未找到今日简报：$desktopHtml" -ForegroundColor Red
    Write-Host "👉 请先运行「小田简报」生成今日 HTML 文件" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 找到今日简报" -ForegroundColor Green

# 复制为 index.html（最新简报首页）
Copy-Item $desktopHtml "$repoDir\index.html" -Force
Write-Host "✅ 已更新 index.html（首页）" -ForegroundColor Green

# 复制到归档目录
Copy-Item $desktopHtml "$repoDir\archive\$date.html" -Force
Write-Host "✅ 已归档 archive/$date.html" -ForegroundColor Green

# 自动更新归档列表
$archiveDir = "$repoDir\archive"
$archiveFiles = Get-ChildItem "$archiveDir\*.html" | Where-Object { $_.Name -ne "index.html" } | Sort-Object Name -Descending
$archiveItems = ""
$dayNames = @("日","一","二","三","四","五","六")
foreach ($f in $archiveFiles) {
    $d = $f.BaseName
    try {
        $dt = [datetime]::ParseExact($d, "yyyy-MM-dd", $null)
        $dayName = $dayNames[$dt.DayOfWeek.value__]
        $label = "$($dt.Year)年$($dt.Month)月$($dt.Day)日 星期$dayName"
    } catch { $label = $d }
    $archiveItems += @"
    <a class="archive-item" href="$d.html">
      <div>
        <div class="item-date">$label</div>
        <div class="item-label">点击查看当日简报</div>
      </div>
      <div class="item-arrow">→</div>
    </a>
`n
"@
}

$archiveHtml = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>小田简报 — 历史归档</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, "Microsoft YaHei", sans-serif; background: #f0f2f5; color: #1a1a2e; }
  nav { background: #1a1a2e; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
  nav .brand { color: #fff; font-size: 1.1rem; font-weight: 700; text-decoration: none; }
  nav .brand span { color: #60a5fa; }
  nav a.back { color: #a0aec0; font-size: 0.82rem; text-decoration: none; }
  nav a.back:hover { color: #fff; }
  .container { max-width: 760px; margin: 40px auto; padding: 0 20px 60px; }
  h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
  .subtitle { color: #6b7280; font-size: 0.9rem; margin-bottom: 32px; }
  .archive-list { display: flex; flex-direction: column; gap: 12px; }
  .archive-item { background: #fff; border-radius: 12px; padding: 18px 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); display: flex; align-items: center; justify-content: space-between; transition: box-shadow 0.2s; text-decoration: none; color: inherit; border-left: 4px solid #3b82f6; }
  .archive-item:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
  .archive-item:nth-child(3n+2) { border-left-color: #10b981; }
  .archive-item:nth-child(3n+3) { border-left-color: #f59e0b; }
  .item-date { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
  .item-label { font-size: 0.78rem; color: #6b7280; margin-top: 2px; }
  .item-arrow { color: #9ca3af; font-size: 1.2rem; }
  footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 0.78rem; }
</style>
</head>
<body>
<nav>
  <a class="brand" href="../index.html">小田<span>每日简报</span></a>
  <a class="back" href="../index.html">← 查看最新简报</a>
</nav>
<div class="container">
  <h1>📚 历史简报归档</h1>
  <p class="subtitle">共 $($archiveFiles.Count) 期 · 点击查看任意一天的简报</p>
  <div class="archive-list">
$archiveItems  </div>
</div>
<footer>小田每日新闻简报 · 基于公开信息整合分析 · 不构成投资建议</footer>
</body>
</html>
"@
$archiveHtml | Out-File "$archiveDir\index.html" -Encoding utf8
Write-Host "✅ 已更新归档列表（共 $($archiveFiles.Count) 期）" -ForegroundColor Green

# Git commit & push
Set-Location $repoDir
git add .
git commit -m "📰 小田简报 $date"
git push origin main 2>&1 | Write-Host

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🚀 发布成功！约1分钟后网站自动更新" -ForegroundColor Green
    Write-Host "🔗 $siteUrl" -ForegroundColor Cyan
    Start-Process $siteUrl
} else {
    Write-Host "❌ 推送失败，请检查网络或 GitHub 权限" -ForegroundColor Red
}
