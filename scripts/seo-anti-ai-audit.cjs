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

console.log(`=== 1. 文件清单与字数统计 (总计: ${files.length} 篇) ===`);

let fileData = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relativePath = path.relative(docsDir, f).replace(/\\/g, '/');
  const charCount = content.replace(/\s+/g, '').length;
  
  // Extract title
  let title = '';
  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/title:\s*['"]?([^'"\n]+)/);
  if (titleMatch) title = titleMatch[1].trim();

  // Extract description
  let desc = '';
  const descMatch = content.match(/description:\s*['"]?([^'"\n]+)/);
  if (descMatch) desc = descMatch[1].trim();

  fileData.push({
    file: relativePath,
    title,
    desc,
    charCount,
    content
  });

  console.log(`- [${relativePath}] (${charCount} 字): ${title}`);
});

console.log('\n=== 2. 检查占位符链接与异常 URL ===');
let placeholderFound = false;
fileData.forEach(item => {
  // Check for broken links like [text](https) or [text]()
  const badLinks = item.content.match(/\[[^\]]+\]\((https?:\/\/?)?\)/g) || [];
  const emptyLinks = item.content.match(/\[[^\]]+\]\(\s*\)/g) || [];
  const airportNumLinks = item.content.match(/\/go\/airport_\d+/g) || [];

  if (badLinks.length > 0 || emptyLinks.length > 0 || airportNumLinks.length > 0) {
    placeholderFound = true;
    console.log(`⚠️ ${item.file}:`);
    if (badLinks.length) console.log(`   异常链接: ${badLinks.join(', ')}`);
    if (emptyLinks.length) console.log(`   空链接: ${emptyLinks.join(', ')}`);
    if (airportNumLinks.length) console.log(`   机器编号链接: ${airportNumLinks.join(', ')}`);
  }
});
if (!placeholderFound) {
  console.log('✅ 未发现占位符或异常空链接！');
}

console.log('\n=== 3. 检查文章间的段落与内容重复率 (Duplicate Detection) ===');
// Split content into paragraphs of length > 40 chars
let paragraphMap = new Map();
let duplicatePairs = [];

fileData.forEach((item, idx) => {
  const paras = item.content.split(/\n\s*\n/)
    .map(p => p.trim().replace(/^[-*#>]+\s*/, '').replace(/\s+/g, ''))
    .filter(p => p.length > 50 && !p.startsWith('<') && !p.startsWith('|'));

  paras.forEach(p => {
    if (paragraphMap.has(p)) {
      const existing = paragraphMap.get(p);
      if (existing.file !== item.file) {
        duplicatePairs.push({
          para: p.slice(0, 60) + '...',
          file1: existing.file,
          file2: item.file
        });
      }
    } else {
      paragraphMap.set(p, { file: item.file });
    }
  });
});

if (duplicatePairs.length > 0) {
  console.log(`⚠️ 发现 ${duplicatePairs.length} 处跨文件重复段落：`);
  duplicatePairs.slice(0, 20).forEach(d => {
    console.log(`  - 重复内容: "${d.para}"`);
    console.log(`    出现在: [${d.file1}] <==> [${d.file2}]`);
  });
} else {
  console.log('✅ 所有文章间未发现任何大于50字的重复段落！内容独创性优秀！');
}

console.log('\n=== 4. 典型 AI 模板套话与口癖检测 (AI Footprint Scan) ===');
const aiCliches = [
  '在当今数字化时代',
  '不可否认的是',
  '总而言之',
  '综上所述',
  '值得一提的是',
  '正如前文所说',
  '双刃剑',
  '随着互联网的飞速发展',
  '显而易见',
  '毫无疑问',
  '让我们拭目以待',
  '在数字化转型的浪潮中',
  '扮演着至关重要的角色',
  '毋庸置疑',
  '不容忽视'
];

let totalCliches = 0;
fileData.forEach(item => {
  let fileCliches = [];
  aiCliches.forEach(cliche => {
    const regex = new RegExp(cliche, 'g');
    const matches = item.content.match(regex);
    if (matches) {
      fileCliches.push(`${cliche}(${matches.length}次)`);
      totalCliches += matches.length;
    }
  });
  if (fileCliches.length > 0) {
    console.log(`- ${item.file}: 发现套话 ${fileCliches.join(', ')}`);
  }
});
if (totalCliches === 0) {
  console.log('✅ 全站零 AI 模板套话！文风纯正硬核！');
} else {
  console.log(`⚠️ 共检测到 ${totalCliches} 处高频 AI 套话，建议针对性优化清理。`);
}

console.log('\n=== 5. URL 路径与 Slug 语义化检查 ===');
fileData.forEach(item => {
  // Check if URL contains arbitrary numbers or unsemantic words
  const slug = item.file.replace(/\.md$/, '');
  const isGeneric = /page\d+|post\d+|item\d+|article\d+/.test(slug);
  if (isGeneric) {
    console.log(`⚠️ 泛化 Slug: ${slug}`);
  }
});
console.log('✅ URL Slug 语义化检测完毕。');
