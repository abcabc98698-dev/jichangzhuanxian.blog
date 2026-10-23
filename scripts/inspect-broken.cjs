const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');

function checkFile(relPath) {
  const filePath = path.join(docsDir, relPath);
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /(?:\[([^\]]+)\]\(([^)]+)\)|href=["']([^"']+)["'])/g;
  let m;
  const missing = [];
  while ((m = regex.exec(content)) !== null) {
    const text = m[1] || '';
    const url = m[2] || m[3];
    if (!url || !url.startsWith('/')) continue;
    const clean = url.split('#')[0].split('?')[0];
    const p1 = path.join(docsDir, clean + '.md');
    const p2 = path.join(docsDir, clean, 'index.md');
    const p3 = path.join(docsDir, clean);
    if (!fs.existsSync(p1) && !fs.existsSync(p2) && !fs.existsSync(p3) && !clean.startsWith('/images/')) {
      missing.push({ text, url });
    }
  }
  console.log(`=== ${relPath}: ${missing.length} missing ===`);
  missing.forEach((item, idx) => {
    if (idx < 8) {
      console.log(`  ${idx + 1}. [${item.text}] -> ${item.url}`);
    }
  });
}

checkFile('devices/index.md');
checkFile('performance/index.md');
checkFile('protocols/index.md');
