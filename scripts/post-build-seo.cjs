const fs = require('fs');
const path = require('path');

const distDir = path.join(process.cwd(), 'docs', '.vitepress', 'dist');

function getAllHtml(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      res = res.concat(getAllHtml(full));
    } else if (f.endsWith('.html')) {
      res.push(full);
    }
  });
  return res;
}

const htmlFiles = getAllHtml(distDir);
console.log(`[post-build-seo] Enhancing ${htmlFiles.length} HTML files in ${distDir}...`);

let canonicalFixed = 0;
let affiliateLinksFixed = 0;
let imagesOptimized = 0;
let disclosuresAdded = 0;
let breadcrumbsAdded = 0;

const affDomains = ['gsyvipaff.com', 'flycataff.com', 'gcvipaff.com', 'gsvipaff.com', '/go/'];

const categoryNames = {
  'zhuanxian': '专线机场',
  'recommend': '机场推荐',
  'free': '免费资源',
  'protocols': '代理协议',
  'performance': '网络性能',
  'devices': '多设备方案',
  'benchmark': '机场实测',
  'troubleshooting': '网络排障'
};

htmlFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(distDir, f).replace(/\\/g, '/');
  let modified = false;

  // 1. Canonical tag guarantee
  if (!/<link[^>]+rel=["']canonical["']/i.test(content) && !content.includes('rel="canonical"')) {
    let cleanPath = rel.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    if (cleanPath && !cleanPath.endsWith('/') && rel.endsWith('index.html')) {
      cleanPath += '/';
    }
    const canonicalUrl = 'https://jichangzhuanxian.blog/' + cleanPath;
    const canTag = `\n    <link rel="canonical" href="${canonicalUrl}">`;
    content = content.replace('</head>', `${canTag}\n  </head>`);
    canonicalFixed++;
    modified = true;
  }

  // 2. Affiliate links guarantee rel="nofollow sponsored noopener"
  const aTagRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;
  content = content.replace(aTagRegex, (match, prefix, href, suffix) => {
    const isAff = affDomains.some(d => href.includes(d));
    if (isAff) {
      affiliateLinksFixed++;
      modified = true;
      let rest = (prefix + ' ' + suffix)
        .replace(/rel=["'][^"']*["']/gi, '')
        .replace(/target=["'][^"']*["']/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return `<a ${rest} href="${href}" target="_blank" rel="nofollow sponsored noopener">`;
    }
    return match;
  });

  // 3. Image optimization (lazy loading & async decoding)
  const imgRegex = /<img\s+([^>]*?)>/gi;
  content = content.replace(imgRegex, (match, attrs) => {
    if (!attrs.includes('loading=')) {
      imagesOptimized++;
      modified = true;
      return `<img ${attrs} loading="lazy" decoding="async">`;
    }
    return match;
  });

  // 4. Affiliate disclosure callout in pages with affiliate links
  const hasAffLink = affDomains.some(d => content.includes(d));
  const hasDisclosureAlready = content.includes('affiliate-disclosure-box') || content.includes('透明度与赞助披露');
  if (hasAffLink && !hasDisclosureAlready && rel !== 'disclosure.html') {
    const disclosureHtml = `
<div class="affiliate-disclosure-box" style="margin: 16px 0; padding: 12px 16px; background-color: rgba(37,99,235,0.06); border-left: 4px solid #2563eb; border-radius: 4px; font-size: 0.88rem; color: #475569; line-height: 1.6;">
  <strong>ℹ️ 透明度与赞助披露</strong>：本站测评坚持中立客观原则。部分服务商链接包含专属返利代码（如光速云 85 折码 <code>gs85</code>），点击不仅不会增加您的消费金额，还可享受独家折扣；佣金收益全额用于支付测速服务器与物理专线带宽开支。<a href="/disclosure" style="color: #2563eb; text-decoration: underline;">查看完整赞助披露与编辑独立性细则</a>。
</div>
`;
    if (content.includes('id="推荐高转化基础设施方案"')) {
      content = content.replace(/(<h2 id="推荐高转化基础设施方案"[^>]*>)/i, `${disclosureHtml}\n$1`);
      disclosuresAdded++;
      modified = true;
    } else if (content.includes('专属直达通道')) {
      content = content.replace(/(<h2[^>]*id="[^"]*基础设施[^"]*"[^>]*>)/i, `${disclosureHtml}\n$1`);
      disclosuresAdded++;
      modified = true;
    }
  }

  // 5. BreadcrumbList Schema.org injection
  if (!content.includes('BreadcrumbList') && rel.includes('/') && rel !== '404.html') {
    const parts = rel.split('/');
    const catSlug = parts[0];
    const catName = categoryNames[catSlug] || catSlug;
    
    // Extract page title from <title>
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    let pageTitle = titleMatch ? titleMatch[1].split('-')[0].trim() : parts[parts.length - 1].replace(/\.html$/, '');
    
    let cleanPath = rel.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    if (cleanPath && !cleanPath.endsWith('/') && rel.endsWith('index.html')) cleanPath += '/';
    
    const itemList = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "https://jichangzhuanxian.blog/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": catName,
        "item": `https://jichangzhuanxian.blog/${catSlug}/`
      }
    ];

    if (!rel.endsWith('index.html')) {
      itemList.push({
        "@type": "ListItem",
        "position": 3,
        "name": pageTitle,
        "item": `https://jichangzhuanxian.blog/${cleanPath}`
      });
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemList
    };

    const scriptTag = `\n    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
    content = content.replace('</head>', `${scriptTag}\n  </head>`);
    breadcrumbsAdded++;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, content, 'utf8');
  }
});

// 6. Sitemap <lastmod> guarantee
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  if (!sitemap.includes('<lastmod>')) {
    sitemap = sitemap.replace(/<\/loc><\/url>/g, `</loc><lastmod>${today}</lastmod></url>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('[post-build-seo] Injected <lastmod> into sitemap.xml');
  }
}

console.log(`[post-build-seo] Summary:`);
console.log(` - Canonical tags added/verified: ${canonicalFixed}`);
console.log(` - Affiliate links normalized: ${affiliateLinksFixed}`);
console.log(` - Images optimized: ${imagesOptimized}`);
console.log(` - Disclosures added: ${disclosuresAdded}`);
console.log(` - BreadcrumbList schemas injected: ${breadcrumbsAdded}`);
