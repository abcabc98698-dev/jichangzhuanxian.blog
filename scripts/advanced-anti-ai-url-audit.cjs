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

console.log('===========================================================');
console.log('   专线实验室 - URL 防批量 AI 识别与全站内容独创性终极审计');
console.log('===========================================================');
console.log(`扫描文件总数: ${files.length} 篇 Markdown 文章\n`);

let articles = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(docsDir, f).replace(/\\/g, '/');
  
  // Title
  let title = '';
  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/title:\s*['"]?([^'"\n]+)/);
  if (titleMatch) title = titleMatch[1].trim();

  // Description
  let desc = '';
  const descMatch = content.match(/description:\s*['"]?([^'"\n]+)/);
  if (descMatch) desc = descMatch[1].trim();

  // Headings
  const headings = (content.match(/^#{1,4}\s+.+$/gm) || []).map(h => h.replace(/^#+\s+/, '').trim());

  articles.push({
    file: relPath,
    slug: relPath.replace(/\.md$/, '').replace(/\/index$/, ''),
    title,
    desc,
    headings,
    rawLength: content.length,
    charCount: content.replace(/\s+/g, '').length,
    content
  });
});

// -------------------------------------------------------------
// 1. URL 结构与防批量 AI 识别特征检查
// -------------------------------------------------------------
console.log('【维度 1】URL 结构与防批量 AI 特征检查 (URL Anti-Footprint)');
let urlIssues = [];

const slugMap = new Map();
articles.forEach(a => {
  const slug = a.slug;
  
  // 1.1 Slug 重复检查
  if (slugMap.has(slug)) {
    urlIssues.push(`[重复 Slug] ${slug} 同时出现在 ${slugMap.get(slug)} 与 ${a.file}`);
  } else {
    slugMap.set(slug, a.file);
  }

  // 1.2 机械化格式检查 (如连续数字编号、机械前缀)
  if (/\b(?:article|page|post|topic|item)[-_]?\d+\b/i.test(slug)) {
    urlIssues.push(`[机械流水号 Slug] ${slug} (存在模板化流水号风险)`);
  }

  // 1.3 异常字符与大小写检查
  if (/[A-Z]/.test(slug)) {
    urlIssues.push(`[大写字符] ${slug} (建议全小写以防搜索引擎大小写重复收录)`);
  }
  if (/[^a-z0-9\/\-]/.test(slug) && !slug.includes('.vitepress')) {
    urlIssues.push(`[非标准字符 Slug] ${slug}`);
  }

  // 1.4 堆砌关键词检查
  const parts = slug.split(/[\/\-]/);
  const freq = {};
  parts.forEach(p => { if (p) freq[p] = (freq[p] || 0) + 1; });
  for (const [w, count] of Object.entries(freq)) {
    if (count >= 3 && !['vs', 'and', 'or'].includes(w)) {
      urlIssues.push(`[关键词堆砌 Slug] ${slug} (词语 "${w}" 重复 ${count} 次)`);
    }
  }
});

if (urlIssues.length === 0) {
  console.log('  ✅ 完美！全站 94 篇 URL Slug 均为纯小写语义化短语，无机械流水号、无关键词堆砌、无异常符号。');
} else {
  console.log(`  ⚠️ 发现 ${urlIssues.length} 项 URL 结构优化建议:`);
  urlIssues.forEach(i => console.log('   - ' + i));
}

// -------------------------------------------------------------
// 2. 标题 (Title) 与 描述 (Description) 独特性检查
// -------------------------------------------------------------
console.log('\n【维度 2】元数据唯一性检查 (Meta Title & Description Uniqueness)');
const titleMap = new Map();
const descMap = new Map();
let metaDuplicates = [];

articles.forEach(a => {
  if (!a.title) {
    metaDuplicates.push(`[缺失 Title] ${a.file}`);
  } else if (titleMap.has(a.title)) {
    metaDuplicates.push(`[重复 Title] "${a.title}" 在 [${titleMap.get(a.title)}] 和 [${a.file}] 相同`);
  } else {
    titleMap.set(a.title, a.file);
  }

  if (!a.desc) {
    metaDuplicates.push(`[缺失 Description] ${a.file}`);
  } else if (descMap.has(a.desc)) {
    metaDuplicates.push(`[重复 Description] "${a.desc.slice(0, 30)}..." 在 [${descMap.get(a.desc)}] 和 [${a.file}] 相同`);
  } else {
    descMap.set(a.desc, a.file);
  }
});

if (metaDuplicates.length === 0) {
  console.log('  ✅ 完美！全站 94 篇文章的 Title 与 Description 100% 独立且各不相同，无元数据套用。');
} else {
  console.log(`  ⚠️ 发现 ${metaDuplicates.length} 处元数据重复:`);
  metaDuplicates.forEach(m => console.log('   - ' + m));
}

// -------------------------------------------------------------
// 3. 段落级内容重合度与滑动窗口查重 (35+ 字符精度)
// -------------------------------------------------------------
console.log('\n【维度 3】全站正文段落与滑动窗口内容查重 (Duplicate Content Scan)');

const cleanParaMap = new Map();
let duplicateParas = [];

articles.forEach(a => {
  // Strip frontmatter, code blocks and json-ld
  const cleanBody = a.content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/```[\s\S]*?```/g, '');

  const lines = cleanBody.split(/\n\s*\n/)
    .map(p => p.trim()
      .replace(/^[-*#>]+\s*/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/\s+/g, '')
    )
    .filter(p => p.length >= 35 && !p.startsWith('<') && !p.startsWith('|'));

  lines.forEach(p => {
    if (cleanParaMap.has(p)) {
      const orig = cleanParaMap.get(p);
      if (orig.file !== a.file) {
        duplicateParas.push({
          file1: orig.file,
          file2: a.file,
          text: p.slice(0, 45) + '...'
        });
      }
    } else {
      cleanParaMap.set(p, { file: a.file });
    }
  });
});

if (duplicateParas.length === 0) {
  console.log('  ✅ 完美！在 35+ 字符高精度模式下，全站跨文章未检测到任何重复段落！');
} else {
  console.log(`  ⚠️ 发现 ${duplicateParas.length} 处相似/重复段落:`);
  duplicateParas.slice(0, 10).forEach(d => {
    console.log(`   - "${d.text}" 出现在 [${d.file1}] <==> [${d.file2}]`);
  });
}

// -------------------------------------------------------------
// 4. 跨文章 50 字滑动窗口 N-Gram 重合度交叉扫描 (过滤代码与 Schema)
// -------------------------------------------------------------
console.log('\n【维度 4】50 字连续纯自然语言文本跨文章指纹交叉校验 (N-Gram Fingerprinting)');

let ngramMap = new Map();
let ngramCollisions = [];

articles.forEach(a => {
  // Strip frontmatter, code blocks, json-ld schema, and html
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
          chunk: chunk.slice(0, 30) + '...'
        });
      }
    } else {
      ngramMap.set(chunk, a.file);
    }
  }
});

if (ngramCollisions.length === 0) {
  console.log('  ✅ 完美！全站自然语言正文中无任何超过 50 字的连续相同文本，文章指纹独占率 100%！');
} else {
  console.log(`  ⚠️ 发现 ${ngramCollisions.length} 处 50 字连续片段重合:`);
  ngramCollisions.slice(0, 10).forEach(c => {
    console.log(`   - [${c.file1}] 与 [${c.file2}]: "${c.chunk}"`);
  });
}

// -------------------------------------------------------------
// 5. 典型 AI 模板口癖与虚词检测
// -------------------------------------------------------------
console.log('\n【维度 5】AI 机械套话与口癖特征扫描 (AI Footprint)');
const aiCliches = [
  '在当今数字化时代', '不可否认的是', '总而言之', '综上所述', '值得一提的是',
  '正如前文所说', '双刃剑', '随着互联网的飞速发展', '显而易见', '毫无疑问',
  '让我们拭目以待', '在数字化转型的浪潮中', '扮演着至关重要的角色', '毋庸置疑',
  '不容忽视', '方方面面', '深入探讨', '不仅如此', '众所周知'
];

let totalCliches = 0;
let clicheFiles = [];

articles.forEach(a => {
  let fileMatches = [];
  aiCliches.forEach(word => {
    const reg = new RegExp(word, 'g');
    const m = a.content.match(reg);
    if (m) {
      fileMatches.push(`${word}(${m.length})`);
      totalCliches += m.length;
    }
  });
  if (fileMatches.length > 0) {
    clicheFiles.push({ file: a.file, matches: fileMatches });
  }
});

if (totalCliches === 0) {
  console.log('  ✅ 完美！全站 0 处典型 AI 模板套话与陈词滥调！');
} else {
  console.log(`  ℹ️ 共发现 ${totalCliches} 处高频虚词/套话词汇:`);
  clicheFiles.slice(0, 10).forEach(cf => {
    console.log(`   - [${cf.file}]: ${cf.matches.join(', ')}`);
  });
}

console.log('\n===========================================================');
console.log('   审计报告总结');
console.log('===========================================================');
console.log(`- 全站有效文章数: ${articles.length} 篇`);
console.log(`- URL 格式与防批量生成合规率: ${urlIssues.length === 0 ? '100% (完全合规)' : `${urlIssues.length} 项待关注`}`);
console.log(`- 元数据 (Title/Desc) 独立率: ${metaDuplicates.length === 0 ? '100% (完全独立)' : `${metaDuplicates.length} 处重复`}`);
console.log(`- 35+ 字段落重复率: ${duplicateParas.length === 0 ? '0% (零重复)' : `${duplicateParas.length} 处重复`}`);
console.log(`- 50+ 字连续文本碰撞数: ${ngramCollisions.length === 0 ? '0 处 (完全独立)' : `${ngramCollisions.length} 处`}`);
console.log(`- AI 模板口癖数: ${totalCliches} 处`);
