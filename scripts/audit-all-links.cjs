const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext = '.md') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== '.vitepress' && file !== 'node_modules' && file !== 'public') {
        results = results.concat(getAllFiles(fullPath, ext));
      }
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  });
  return results;
}

const docsDir = path.join(process.cwd(), 'docs');
const files = getAllFiles(docsDir);

const missingByFile = {};
const domainByFile = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(docsDir, file).replace(/\\/g, '/');

  // check domain link
  const jcMatches = content.match(/https?:\/\/jichangzhuanxian\.blog[^\s"'<>\)]*/g);
  if (jcMatches) {
    domainByFile[rel] = jcMatches;
  }

  // check markdown links [text](url) and href="url"
  const linkRegex = /(?:\[([^\]]+)\]\(([^)]+)\)|href=["']([^"']+)["'])/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2] || match[3];
    if (!url) continue;
    if (url.startsWith('/')) {
      const cleanUrl = url.split('#')[0].split('?')[0];
      let targetFile = path.join(docsDir, cleanUrl);
      if (cleanUrl.endsWith('/')) {
        targetFile = path.join(targetFile, 'index.md');
      } else if (!cleanUrl.endsWith('.md') && !cleanUrl.endsWith('.html') && !cleanUrl.endsWith('.png') && !cleanUrl.endsWith('.jpg') && !cleanUrl.endsWith('.webp') && !cleanUrl.endsWith('.svg')) {
        if (fs.existsSync(targetFile + '.md')) {
          targetFile = targetFile + '.md';
        } else if (fs.existsSync(path.join(targetFile, 'index.md'))) {
          targetFile = path.join(targetFile, 'index.md');
        }
      }
      if (!fs.existsSync(targetFile) && !cleanUrl.startsWith('/images/')) {
        if (!missingByFile[rel]) missingByFile[rel] = [];
        missingByFile[rel].push(url);
      }
    }
  }
});

console.log('=== SUMMARY OF MISSING INTERNAL LINKS ===');
for (const [f, links] of Object.entries(missingByFile)) {
  console.log(`${f}: ${links.length} missing links`);
  // print first 5
  console.log('  Samples:', links.slice(0, 5));
}

console.log('\n=== SUMMARY OF JICHANGZHUANXIAN.BLOG DOMAIN USAGES ===');
for (const [f, matches] of Object.entries(domainByFile)) {
  console.log(`${f}: ${matches.length} occurrences`);
  console.log('  Matches:', matches);
}
