/**
 * 小田简报 — 归档索引自动生成
 * 用法：node tools/gen-archive.js
 *
 * 扫描 archive/*.html，读取每期内嵌的 <meta name="briefing-label"> 与星期，
 * 自动重建 archive/index.html（带每期精华摘要，按日期倒序）。
 */
const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const archiveDir = path.join(repoDir, 'archive');

const weekdayNames = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

const files = fs.readdirSync(archiveDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
  .sort()
  .reverse();

const items = files.map(f => {
  const date = f.replace('.html', '');
  const html = fs.readFileSync(path.join(archiveDir, f), 'utf8');
  const labelM = html.match(/<meta name="briefing-label" content="([^"]*)"/);
  const wdM = html.match(/<meta name="briefing-weekday" content="([^"]*)"/);
  const dt = new Date(date + 'T00:00:00');
  const weekday = wdM ? wdM[1] : weekdayNames[dt.getDay()];
  const label = labelM ? labelM[1].replace(/&quot;/g, '"') : '点击查看当日简报';
  const dateCn = `${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日 ${weekday}`;
  return `    <a class="archive-item" href="${date}.html">
      <div>
        <div class="item-date">${dateCn}</div>
        <div class="item-label">${label}</div>
      </div>
      <div class="item-arrow">→</div>
    </a>`;
}).join('\n');

const out = `<!DOCTYPE html>
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
  <p class="subtitle">共 ${files.length} 期 · 每日更新 · 点击查看任意一天的简报</p>
  <div class="archive-list" id="archiveList">
${items}
  </div>
</div>
<footer>小田每日新闻简报 · 基于公开信息整合分析 · 不构成投资建议</footer>
</body>
</html>
`;

fs.writeFileSync(path.join(archiveDir, 'index.html'), out, 'utf8');
console.log(`✅ 归档索引已重建：${files.length} 期`);
