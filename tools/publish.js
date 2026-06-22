/**
 * 小田简报 — 一键发布
 * 用法：node tools/publish.js 2026-06-22
 *
 * 1) 把桌面 xiaotian-briefing-<date>.html 复制为 index.html + archive/<date>.html
 * 2) 自动重建归档索引（gen-archive.js，带精华摘要）
 * 3) git add / commit / push
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const date = process.argv[2];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('❌ 用法：node tools/publish.js YYYY-MM-DD');
  process.exit(1);
}

const repoDir = path.resolve(__dirname, '..');
const desktopHtml = path.join(os.homedir(), 'Desktop', `xiaotian-briefing-${date}.html`);
if (!fs.existsSync(desktopHtml)) {
  console.error(`❌ 未找到完整简报：${desktopHtml}`);
  console.error(`   请先运行：node tools/build.js ${date}`);
  process.exit(1);
}

// 1) 复制
fs.copyFileSync(desktopHtml, path.join(repoDir, 'index.html'));
fs.copyFileSync(desktopHtml, path.join(repoDir, 'archive', `${date}.html`));
console.log('✅ 已更新 index.html 与 archive/' + date + '.html');

// 2) 重建归档索引
require('./gen-archive.js');

// 3) git
try {
  execSync('git add .', { cwd: repoDir, stdio: 'inherit' });
  execSync(`git commit -m "📰 小田简报 ${date}"`, { cwd: repoDir, stdio: 'inherit' });
  execSync('git push origin main', { cwd: repoDir, stdio: 'inherit' });
  console.log('\n🚀 发布成功！约1分钟后网站自动更新');
  console.log('🔗 https://bairimenglan1991.github.io/xiaotian-briefing/');
} catch (e) {
  console.error('❌ git 操作失败（可能无改动或网络问题），请手动检查');
  process.exit(1);
}
