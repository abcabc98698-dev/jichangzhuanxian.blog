const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const docsDir = path.join(rootDir, 'docs');
const distDir = path.join(docsDir, '.vitepress', 'dist');

function getAllFiles(dir, ext) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.vitepress' && f !== 'dist') {
        res = res.concat(getAllFiles(full, ext));
      }
    } else if (!ext || f.endsWith(ext)) {
      res.push(full);
    }
  });
  return res;
}

function getAllDistHtml(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      res = res.concat(getAllDistHtml(full));
    } else if (f.endsWith('.html')) {
      res.push(full);
    }
  });
  return res;
}

const mdFiles = getAllFiles(docsDir, '.md');
const htmlFiles = getAllDistHtml(distDir);

console.log(`Auditing ${mdFiles.length} markdown source files and ${htmlFiles.length} compiled HTML files...`);

// -------------------------------------------------------------
// 1. Technical SEO Audit
// -------------------------------------------------------------
// 1.1 Robots & Crawlers
const robotsPath = path.join(docsDir, 'public', 'robots.txt');
let robotsContent = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';
const robotsHasDisallowRoot = /Disallow:\s*\/\s*$/m.test(robotsContent);
const explicitBots = ['Googlebot', 'Bingbot', 'Baiduspider', 'yisouspider'];
const missingBots = explicitBots.filter(b => !robotsContent.includes(b));
const sitemapInRobots = (robotsContent.match(/Sitemap:\s*(.+)$/m) || [])[1] || '';

// 1.2 Canonical & Noindex in HTML
let canonicalStats = {
  total: 0,
  selfReferencing: 0,
  missing: 0,
  notFormalDomain: 0,
  details: []
};
let noindexStats = {
  found: 0,
  pages: []
};

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  
  // Canonical
  const canMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || content.match(/<link[^>]+href=["'][^"']+["'][^>]+rel=["']canonical["'][^>]*>/i);
  if (canMatch) {
    canonicalStats.total++;
    const hrefMatch = canMatch[0].match(/href=["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : '';
    if (!href.startsWith('https://jichangzhuanxian.blog')) {
      canonicalStats.notFormalDomain++;
      canonicalStats.details.push({ file: rel, href });
    }
  } else {
    canonicalStats.missing++;
    canonicalStats.details.push({ file: rel, issue: 'missing' });
  }

  // Noindex
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i.test(content)) {
    noindexStats.found++;
    noindexStats.pages.push(rel);
  }
});

// 1.3 Sitemap Health
const sitemapPath = path.join(distDir, 'sitemap.xml');
let sitemapUrls = [];
let sitemapExists = fs.existsSync(sitemapPath);
if (sitemapExists) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const locMatches = sitemapXml.match(/<loc>(.+?)<\/loc>/g) || [];
  sitemapUrls = locMatches.map(m => m.replace(/<\/?loc>/g, ''));
}

// 1.4 URL specifications in markdown and sitemap
let nonLowercaseSlugs = [];
let chineseUrls = [];
let paramUrls = [];
mdFiles.forEach(f => {
  const rel = path.relative(docsDir, f).replace(/\\/g, '/');
  if (/[A-Z]/.test(rel)) nonLowercaseSlugs.push(rel);
  if (/[\u4e00-\u9fa5]/.test(rel)) chineseUrls.push(rel);
});

// 1.6 HTTPS & Security in .htaccess
const htaccessPath = path.join(docsDir, 'public', '.htaccess');
let htaccessContent = fs.existsSync(htaccessPath) ? fs.readFileSync(htaccessPath, 'utf8') : '';
const hasHttpsRewrite = /RewriteCond %\{HTTPS\} !=on/i.test(htaccessContent);
const hasSecurityHeaders = htaccessContent.includes('X-Content-Type-Options') && htaccessContent.includes('X-Frame-Options');

// -------------------------------------------------------------
// 2. Content Quality Health Audit
// -------------------------------------------------------------
let wordCountStats = {
  under300: [],
  under500: [],
  between500And2000: [],
  between2000And6000: [],
  above6000: []
};
let titlesMap = new Map();
let descMap = new Map();
let h1Map = new Map();
let duplicateTitles = [];
let duplicateDescs = [];
let duplicateH1s = [];

mdFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(docsDir, f).replace(/\\/g, '/');
  const cleanLen = content.replace(/\s+/g, '').length;

  if (cleanLen < 300) wordCountStats.under300.push({ file: rel, len: cleanLen });
  else if (cleanLen < 500) wordCountStats.under500.push({ file: rel, len: cleanLen });
  else if (cleanLen < 2000) wordCountStats.between500And2000.push({ file: rel, len: cleanLen });
  else if (cleanLen < 6000) wordCountStats.between2000And6000.push({ file: rel, len: cleanLen });
  else wordCountStats.above6000.push({ file: rel, len: cleanLen });

  // Title
  const titleM = (content.match(/^title:\s*['"]?([^'"\n]+)/m) || content.match(/^#\s+(.+)$/m) || [])[1];
  if (titleM) {
    const t = titleM.trim();
    if (titlesMap.has(t)) duplicateTitles.push({ t, file1: titlesMap.get(t), file2: rel });
    else titlesMap.set(t, rel);
  }

  // Description
  const descM = (content.match(/^description:\s*['"]?([^'"\n]+)/m) || [])[1];
  if (descM) {
    const d = descM.trim();
    if (descMap.has(d)) duplicateDescs.push({ d, file1: descMap.get(d), file2: rel });
    else descMap.set(d, rel);
  }

  // H1
  const h1M = (content.match(/^#\s+(.+)$/m) || [])[1];
  if (h1M) {
    const h1 = h1M.trim();
    if (h1Map.has(h1)) duplicateH1s.push({ h1, file1: h1Map.get(h1), file2: rel });
    else h1Map.set(h1, rel);
  }
});

// -------------------------------------------------------------
// 3. E-E-A-T & Trust Signals Audit
// -------------------------------------------------------------
let authorStats = {
  missingByline: [],
  hasAuthorPage: fs.existsSync(path.join(docsDir, 'about.md')) || fs.existsSync(path.join(docsDir, 'author.md')),
  authorFiles: []
};
let trustPages = {
  about: fs.existsSync(path.join(docsDir, 'about.md')),
  methodology: fs.existsSync(path.join(docsDir, 'methodology.md')) || fs.existsSync(path.join(docsDir, 'benchmark', 'index.md')),
  privacy: fs.existsSync(path.join(docsDir, 'privacy.md')) || fs.existsSync(path.join(docsDir, 'public', 'privacy.html')),
  terms: fs.existsSync(path.join(docsDir, 'terms.md')) || fs.existsSync(path.join(docsDir, 'public', 'terms.html')),
  disclosure: fs.existsSync(path.join(docsDir, 'disclosure.md'))
};

mdFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(docsDir, f).replace(/\\/g, '/');
  if (!content.includes('author:') && !content.includes('作者') && !content.includes('专线实验室')) {
    authorStats.missingByline.push(rel);
  }
});

// -------------------------------------------------------------
// 4. Affiliate Link Compliance Audit
// -------------------------------------------------------------
let affiliateStats = {
  totalOutbound: 0,
  affiliateLinksCount: 0,
  unmarkedAffiliateLinks: [],
  pagesWithAffiliate: [],
  pagesWithDisclosure: []
};

const affDomains = ['gsyvipaff.com', 'flycataff.com', 'gcvipaff.com', 'gsvipaff.com'];

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  
  const linkMatches = content.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
  
  let pageHasAff = false;
  linkMatches.forEach(tag => {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : '';
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.includes('jichangzhuanxian.blog')) {
        affiliateStats.totalOutbound++;
        const isAff = affDomains.some(d => href.includes(d)) || href.includes('/go/');
        if (isAff) {
          affiliateStats.affiliateLinksCount++;
          pageHasAff = true;
          const relMatch = tag.match(/rel=["']([^"']+)["']/i);
          const relVal = relMatch ? relMatch[1] : '';
          const hasNofollow = relVal.includes('nofollow');
          const hasSponsored = relVal.includes('sponsored');
          if (!hasNofollow || !hasSponsored) {
            affiliateStats.unmarkedAffiliateLinks.push({ file: rel, tag, href, relVal });
          }
        }
      }
    }
  });

  if (pageHasAff) {
    affiliateStats.pagesWithAffiliate.push(rel);
    if (content.includes('推广') || content.includes('返利') || content.includes('商业赞助') || content.includes('disclosure') || content.includes('佣金')) {
      affiliateStats.pagesWithDisclosure.push(rel);
    }
  }
});

// -------------------------------------------------------------
// 5. Internal Links & Architecture Health
// -------------------------------------------------------------
let linkGraph = new Map(); // target -> [sources]
let emptyHrefs = [];
let hashOnlyHrefs = [];

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  
  const aTags = content.match(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
  aTags.forEach(tag => {
    const hrefM = tag.match(/href=["']([^"']*)["']/i);
    const href = hrefM ? hrefM[1] : '';
    if (href === '') emptyHrefs.push({ file: rel, tag });
    if (href === '#') hashOnlyHrefs.push({ file: rel, tag });
    
    // Internal link graph mapping
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
      let norm = href.split('#')[0].split('?')[0];
      if (norm.endsWith('/')) norm += 'index.html';
      else if (!norm.endsWith('.html')) norm += '.html';
      if (norm.startsWith('/')) norm = norm.slice(1);
      
      if (!linkGraph.has(norm)) linkGraph.set(norm, new Set());
      linkGraph.get(norm).add(rel);
    }
  });
});

let orphanPages = [];
htmlFiles.forEach(f => {
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  if (rel !== 'index.html' && rel !== '404.html') {
    if (!linkGraph.has(rel) || linkGraph.get(rel).size === 0) {
      orphanPages.push(rel);
    }
  }
});

// -------------------------------------------------------------
// 6. Schema Structured Data Audit
// -------------------------------------------------------------
let schemaStats = {
  totalSchemas: 0,
  types: {},
  pagesWithSchema: 0,
  errors: []
};

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  const scriptMatches = content.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  if (scriptMatches.length > 0) {
    schemaStats.pagesWithSchema++;
    scriptMatches.forEach(tag => {
      schemaStats.totalSchemas++;
      const jsonStr = tag.replace(/<\/?script[^>]*>/gi, '').trim();
      try {
        const parsed = JSON.parse(jsonStr);
        const t = parsed['@type'] || 'Unknown';
        schemaStats.types[t] = (schemaStats.types[t] || 0) + 1;
      } catch (e) {
        schemaStats.errors.push({ file: rel, error: e.message });
      }
    });
  }
});

// Summary Object Output
const auditResult = {
  technical: {
    robotsHasDisallowRoot,
    missingBots,
    sitemapInRobots,
    canonicalStats,
    noindexStats,
    sitemapCount: sitemapUrls.length,
    sitemapExists,
    nonLowercaseSlugsCount: nonLowercaseSlugs.length,
    chineseUrlsCount: chineseUrls.length,
    hasHttpsRewrite,
    hasSecurityHeaders
  },
  content: {
    totalArticles: mdFiles.length,
    wordCountStats: {
      under300: wordCountStats.under300.length,
      under500: wordCountStats.under500.length,
      between500And2000: wordCountStats.between500And2000.length,
      between2000And6000: wordCountStats.between2000And6000.length,
      above6000: wordCountStats.above6000.length
    },
    duplicateTitlesCount: duplicateTitles.length,
    duplicateDescsCount: duplicateDescs.length,
    duplicateH1sCount: duplicateH1s.length
  },
  eeat: {
    missingBylineCount: authorStats.missingByline.length,
    hasAuthorPage: authorStats.hasAuthorPage,
    trustPages
  },
  affiliate: {
    totalOutbound: affiliateStats.totalOutbound,
    affiliateLinksCount: affiliateStats.affiliateLinksCount,
    unmarkedAffiliateCount: affiliateStats.unmarkedAffiliateLinks.length,
    unmarkedSamples: affiliateStats.unmarkedAffiliateLinks.slice(0, 10),
    pagesWithAffiliateCount: affiliateStats.pagesWithAffiliate.length,
    pagesWithDisclosureCount: affiliateStats.pagesWithDisclosure.length
  },
  internalLinks: {
    emptyHrefsCount: emptyHrefs.length,
    hashOnlyHrefsCount: hashOnlyHrefs.length,
    orphanPagesCount: orphanPages.length,
    orphanSamples: orphanPages.slice(0, 10)
  },
  schema: {
    pagesWithSchema: schemaStats.pagesWithSchema,
    totalSchemas: schemaStats.totalSchemas,
    types: schemaStats.types,
    errorsCount: schemaStats.errors.length
  }
};

fs.writeFileSync(path.join(rootDir, 'audit-results.json'), JSON.stringify(auditResult, null, 2), 'utf8');
console.log('Audit complete! Results saved to audit-results.json');
console.log(JSON.stringify(auditResult, null, 2));

// Click depth calculation
let queue = [{ url: 'index.html', depth: 0 }];
let visited = new Map();
visited.set('index.html', 0);

while (queue.length > 0) {
  const item = queue.shift();
  const filePath = path.join(distDir, item.url);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const aTags = content.match(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
  
  aTags.forEach(tag => {
    const hrefM = tag.match(/href=["']([^"']*)["']/i);
    let href = hrefM ? hrefM[1] : '';
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      let norm = href.split('#')[0].split('?')[0];
      if (norm.endsWith('/')) norm += 'index.html';
      else if (!norm.endsWith('.html')) norm += '.html';
      if (norm.startsWith('/')) norm = norm.slice(1);
      
      if (!visited.has(norm)) {
        visited.set(norm, item.depth + 1);
        queue.push({ url: norm, depth: item.depth + 1 });
      }
    }
  });
}

const depthStats = {};
visited.forEach((d, u) => {
  depthStats[d] = (depthStats[d] || 0) + 1;
});

console.log('=== Click Depth Distribution ===', depthStats);

let deepPages = [];
visited.forEach((d, u) => {
  if (d > 3) deepPages.push({ url: u, depth: d });
});
console.log('Pages with depth > 3:', deepPages.length);

// Image check
let totalImgTags = 0;
let imgWithoutLazy = 0;
let imgWithoutDimensions = 0;
let imgSamples = [];

htmlFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  const imgs = c.match(/<img\s+[^>]*>/gi) || [];
  totalImgTags += imgs.length;
  imgs.forEach(tag => {
    const hasLazy = tag.includes('loading="lazy"');
    const hasDims = tag.includes('width=') && tag.includes('height=');
    if (!hasLazy) imgWithoutLazy++;
    if (!hasDims) imgWithoutDimensions++;
    if (imgSamples.length < 5) imgSamples.push({ file: rel, tag });
  });
});

console.log('=== Image Optimization ===');
console.log('Total img tags:', totalImgTags);
console.log('Img without lazy loading:', imgWithoutLazy);
console.log('Img without dimensions (CLS risk):', imgWithoutDimensions);
console.log('Sample img tags:', imgSamples);

// Originality Sampling
const sampleFiles = [
  'protocols/hysteria2-brutal-congestion-math.md',
  'protocols/reality-handshake-rtt.md',
  'protocols/ss2022-blake3-crypto-benchmark.md',
  'performance/cross-border-terrestrial-cable-sz-hk-latency.md',
  'performance/crypto-stock-api-jitter-slippage.md',
  'performance/fiber-refraction-chromatic-dispersion-delay.md',
  'performance/shanghai-tokyo-submarine-cable-rtt.md',
  'devices/android-keepalive-battery.md',
  'devices/clash-verge-rev-scripts.md',
  'troubleshooting/wireshark-proxy-capture-decrypt.md'
];

console.log('=== Originality Sampling of 10 Articles ===');
const samplesOutput = [];
sampleFiles.forEach((rel, idx) => {
  const full = path.join(docsDir, rel);
  const content = fs.readFileSync(full, 'utf8');
  const clean = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/```[\s\S]*?```/g, '');
  const paras = clean.split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50 && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('<'));
  
  const sampleData = {
    index: idx + 1,
    file: rel,
    totalParas: paras.length,
    p1: paras[0] || '',
    p2: paras[1] || '',
    p3: paras[2] || ''
  };
  samplesOutput.push(sampleData);
  console.log('[' + (idx + 1) + '] ' + rel);
  console.log('   P1: ' + sampleData.p1.slice(0, 60) + '...');
  console.log('   P2: ' + sampleData.p2.slice(0, 60) + '...');
});

fs.writeFileSync(path.join(rootDir, 'originality-samples.json'), JSON.stringify(samplesOutput, null, 2), 'utf8');
