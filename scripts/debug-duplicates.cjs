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
const files = getAllFiles(docsDir);

let articles = files.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(docsDir, f).replace(/\\/g, '/');
  return { file: relPath, content };
});

let ngramMap = new Map();
let ngramCollisions = [];

articles.forEach(a => {
  const textOnly = a.content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`_~\-\|:\s]/g, '');

  const step = 25;
  const windowSize = 50;
  for (let i = 0; i <= textOnly.length - windowSize; i += step) {
    const chunk = textOnly.slice(i, i + windowSize);
    if (ngramMap.has(chunk)) {
      const orig = ngramMap.get(chunk);
      if (orig !== a.file) {
        ngramCollisions.push({
          file1: orig,
          file2: a.file,
          chunk: chunk
        });
      }
    } else {
      ngramMap.set(chunk, a.file);
    }
  }
});

console.log('Total collisions:', ngramCollisions.length);
ngramCollisions.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.file1}] <==> [${c.file2}]:\n   "${c.chunk}"`);
});
