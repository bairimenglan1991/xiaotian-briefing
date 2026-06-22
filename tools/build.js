/**
 * 小田简报 — 构建脚本
 * 用法：node tools/build.js 2026-06-22
 *
 * 输入：桌面 xiaotian-content-<date>.html（只含 .container 内部内容 + 顶部 META 块）
 * 输出：桌面 xiaotian-briefing-<date>.html（完整自包含 HTML，已内联共享 CSS）
 *
 * 片段文件顶部 META 块格式（label 会写入 <meta>，供归档索引自动读取）：
 *   <!--META
 *   date=2026-06-22
 *   title=6月22日
 *   label=斯塔默濒临辞职 · 美伊紧张谈判 · 港股逼近熊市
 *   theme=（可选）今日焦点小标题
 *   -->
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const date = process.argv[2];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('❌ 用法：node tools/build.js YYYY-MM-DD');
  process.exit(1);
}

const desktop = path.join(os.homedir(), 'Desktop');
const fragPath = path.join(desktop, `xiaotian-content-${date}.html`);
const outPath  = path.join(desktop, `xiaotian-briefing-${date}.html`);
const cssPath  = path.join(__dirname, 'style.css');

if (!fs.existsSync(fragPath)) {
  console.error(`❌ 未找到内容片段：${fragPath}`);
  console.error('   请先把当天的正文（.container 内部内容）写入该文件，并在顶部加 META 块。');
  process.exit(1);
}

const raw = fs.readFileSync(fragPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

// 解析 META 块
const meta = {};
const m = raw.match(/<!--META([\s\S]*?)-->/);
if (m) {
  m[1].trim().split('\n').forEach(line => {
    const i = line.indexOf('=');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
}
const content = raw.replace(/<!--META[\s\S]*?-->/, '').trim();

// 日期 → 中文星期
const dt = new Date(date + 'T00:00:00');
const weekdayNames = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
const weekday = weekdayNames[dt.getDay()];
const zhShort = weekday.replace('星期', '周');
const dateCn = `${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`;

const label = meta.label || '点击查看当日简报';
const title = meta.title || dateCn;
const isWeekend = (dt.getDay() === 0 || dt.getDay() === 6);
const footerDate = isWeekend ? `${dateCn}（${zhShort}）` : dateCn;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="briefing-label" content="${label.replace(/"/g, '&quot;')}">
<meta name="briefing-weekday" content="${weekday}">
<title>小田每日新闻简报 — ${dateCn}</title>
<style>
${css}</style>
</head>
<body>

<nav>
  <div class="brand">小田<span>每日简报</span></div>
  <div class="date">📅 ${dateCn} ${weekday} · Bloomberg · FT · WSJ · 财新</div>
</nav>

<div class="container">

${content}

</div>

<footer>
  <p>本简报由<strong>小田每日新闻简报</strong>自动生成 · 数据来源：Bloomberg · Financial Times 全文 · WSJ · 财新 全文 · gold-api.com · open.er-api.com</p>
  <p style="margin-top:4px">生成时间：${footerDate} · 基于公开新闻整合分析 · 不构成投资建议 · 🔗 <a href="https://bairimenglan1991.github.io/xiaotian-briefing/" style="color:#60a5fa">bairimenglan1991.github.io/xiaotian-briefing</a></p>
</footer>

</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`✅ 已生成完整简报：${outPath}`);
console.log(`   日期 ${date} ${weekday} · 标签「${label}」`);
console.log(`   下一步：node tools/publish.js ${date}`);
