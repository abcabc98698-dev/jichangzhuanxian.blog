const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext = '.md') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== '.vitepress' && file !== 'node_modules') {
        results = results.concat(getAllFiles(fullPath, ext));
      }
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  });
  return results;
}

const docsDir = path.join(process.cwd(), 'docs');
const distDir = path.join(docsDir, '.vitepress', 'dist');
const files = getAllFiles(docsDir);

let brokenCount = 0;

files.forEach(mdFile => {
  const content = fs.readFileSync(mdFile, 'utf8');
  const relPath = path.relative(docsDir, mdFile).replace(/\\/g, '/');
  const htmlFile = path.join(distDir, relPath.replace(/\.md$/, '.html'));
  
  if (!fs.existsSync(htmlFile)) return;
  const html = fs.readFileSync(htmlFile, 'utf8');
  
  // Find all internal anchors: [text](#anchor)
  const anchorMatches = [...content.matchAll(/\[([^\]]+)\]\(#([^\)]+)\)/g)];
  if (anchorMatches.length === 0) return;

  // Extract all IDs in html
  const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const idSet = new Set(idMatches);

  let fileBroken = [];
  anchorMatches.forEach(m => {
    const text = m[1];
    const anchor = decodeURIComponent(m[2]);
    if (!idSet.has(anchor)) {
      fileBroken.push({ text, anchor });
      brokenCount++;
    }
  });

  if (fileBroken.length > 0) {
    console.log(`[FAIL] ${relPath}: ${fileBroken.length} 个锚点失效`);
    fileBroken.forEach(b => console.log(`   - 锚点: #${b.anchor} (文字: "${b.text}")`));
  }
});

console.log(`\n总失效锚点数: ${brokenCount}`);
