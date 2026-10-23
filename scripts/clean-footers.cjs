const fs = require('fs');
const path = require('path');

function cleanDir(dir) {
  const fullDir = path.join(process.cwd(), 'docs', dir);
  if (!fs.existsSync(fullDir)) return;
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md') && f !== 'index.md');
  files.forEach(f => {
    const filePath = path.join(fullDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove the boilerplate footer
    if (content.includes('## 延伸阅读与专栏导航')) {
      content = content.replace(/---\s+## 延伸阅读与专栏导航[\s\S]*$/, '');
      content = content.trim() + '\n';
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

cleanDir('troubleshooting');
cleanDir('performance');
cleanDir('devices');
cleanDir('protocols');

console.log('Cleaned boilerplate footers across all batches!');
