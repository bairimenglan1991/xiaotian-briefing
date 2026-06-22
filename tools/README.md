# 小田简报 · 工具链

把每天重复的体力活封装成脚本。日常只需写「内容片段」，其余自动化。

## 每日流程（新）

```powershell
# 1) 一键抓取 + 数据新鲜度自检（合并了 market + news，并告警 WSJ旧文/财新存量/FX未更新）
cd C:\Users\User\Documents\xiaotian-playwright
node fetch-all.js

# 2) 写当天内容片段到桌面：xiaotian-content-YYYY-MM-DD.html
#    只写 .container 内部正文（hero/市场/焦点/要闻/分析/品种/赛道/板块/风险），
#    顶部加 META 块（见下）。不用再写 CSS / <head> / nav / footer。

# 3) 构建完整 HTML（自动内联共享 CSS + 导航 + 页脚 + 摘要 meta）
cd C:\Users\User\Documents\xiaotian-briefing
node tools/build.js YYYY-MM-DD

# 4) 一键发布（复制 → 自动重建带摘要的归档索引 → git 推送）
node tools/publish.js YYYY-MM-DD
```

## 内容片段顶部的 META 块

```html
<!--META
date=2026-06-22
title=6月22日
label=斯塔默濒临辞职 · 美伊紧张谈判 · 港股逼近熊市 · 新兴市场领跑
-->
```

- `label` 会写入 `<meta name="briefing-label">`，**归档索引据此自动生成精华摘要**——这是过去每天手动改 `archive/index.html` 的根因，现已自动化。

## 脚本清单

| 脚本 | 作用 |
|------|------|
| `xiaotian-playwright/fetch-all.js` | 合并抓取 market+news + 新鲜度自检告警 |
| `tools/style.css` | 简报页面共享 CSS（改样式只改这一处） |
| `tools/build.js <date>` | 内容片段 → 完整自包含 HTML（到桌面） |
| `tools/gen-archive.js` | 扫描 archive/*.html 内嵌摘要，重建归档索引 |
| `tools/publish.js <date>` | 复制 + gen-archive + git 推送，一条命令发布 |
| `tools/backfill-labels.js` | 一次性：把历史各期摘要回填为 meta（已执行） |

## 说明

- 每期 HTML 仍是**自包含**（CSS 在构建时内联），可直接双击桌面文件预览，不依赖外部样式。
- 旧的 `publish.ps1` 仍可用，但其归档标签是通用文案；推荐用 `tools/publish.js`（带精华摘要）。
