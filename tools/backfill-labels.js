/**
 * 小田简报 — 一次性回填脚本
 * 用法：node tools/backfill-labels.js
 *
 * 从当前 archive/index.html 解析每期的「日期 + 星期 + 精华摘要」，
 * 注入 <meta name="briefing-label"> / <meta name="briefing-weekday"> 到对应归档 HTML，
 * 使历史各期也能被 gen-archive.js 自动索引。已含 meta 的文件会跳过/更新。
 */
const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const archiveDir = path.join(repoDir, 'archive');
const indexHtml = fs.readFileSync(path.join(archiveDir, 'index.html'), 'utf8');

// 解析现有索引：href="DATE.html" ... item-date">日期 星期X< ... item-label">LABEL<
const re = /href="(\d{4}-\d{2}-\d{2})\.html">[\s\S]*?item-date">([^<]*)<[\s\S]*?item-label">([^<]*)</g;
let m, count = 0;
const labels = {};
while ((m = re.exec(indexHtml))) {
  const [, date, dateText, label] = m;
  const wd = (dateText.match(/星期[日一二三四五六]/) || ['星期一'])[0];
  labels[date] = { label: label.trim(), weekday: wd };
}

for (const [date, info] of Object.entries(labels)) {
  const file = path.join(archiveDir, `${date}.html`);
  if (!fs.existsSync(file)) { console.log(`⚠️ 跳过（无文件）：${date}`); continue; }
  let html = fs.readFileSync(file, 'utf8');
  const labelMeta = `<meta name="briefing-label" content="${info.label.replace(/"/g, '&quot;')}">`;
  const wdMeta = `<meta name="briefing-weekday" content="${info.weekday}">`;

  // 移除旧的（若有），再插入到 charset meta 之后
  html = html.replace(/\n?<meta name="briefing-label"[^>]*>/g, '')
             .replace(/\n?<meta name="briefing-weekday"[^>]*>/g, '');
  html = html.replace(/(<meta charset="UTF-8">)/i, `$1\n${labelMeta}\n${wdMeta}`);

  fs.writeFileSync(file, html, 'utf8');
  count++;
}
console.log(`✅ 已回填 ${count} 期的摘要 meta`);
