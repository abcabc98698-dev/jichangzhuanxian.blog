const fs = require('fs');

let config = fs.readFileSync('docs/.vitepress/config.mts', 'utf8');

const targetSitemap = `  sitemap: {
    hostname: 'https://jichangzhuanxian.blog'
  },`;

const newSitemapAndHead = `  sitemap: {
    hostname: 'https://jichangzhuanxian.blog',
    transformItems(items) {
      return items.map(item => ({
        ...item,
        lastmod: new Date().toISOString().split('T')[0]
      }))
    }
  },
  transformHead({ pageData }) {
    let cleanPath = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
    if (cleanPath && !cleanPath.endsWith('/') && pageData.relativePath.endsWith('index.md')) {
      cleanPath += '/'
    }
    const canonicalUrl = 'https://jichangzhuanxian.blog/' + cleanPath
    return [
      ['link', { rel: 'canonical', href: canonicalUrl }]
    ]
  },
  markdown: {
    config(md) {
      const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
      }
      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const hrefIndex = tokens[idx].attrIndex('href')
        if (hrefIndex >= 0) {
          const href = tokens[idx].attrs[hrefIndex][1]
          const affDomains = ['gsyvipaff.com', 'flycataff.com', 'gcvipaff.com', 'gsvipaff.com']
          if (affDomains.some(d => href.includes(d)) || href.includes('/go/')) {
            tokens[idx].attrSet('rel', 'nofollow sponsored noopener')
            tokens[idx].attrSet('target', '_blank')
          }
        }
        return defaultRender(tokens, idx, options, env, self)
      }
    }
  },`;

if (config.includes(targetSitemap)) {
  config = config.replace(targetSitemap, newSitemapAndHead);
  console.log('Replaced sitemap with sitemap + transformHead + markdown');
} else {
  console.error('Target sitemap not found');
}

const targetNav = `      { text: '网络排障', link: '/troubleshooting/' }
    ],`;
const newNav = `      { text: '网络排障', link: '/troubleshooting/' },
      { text: '关于', link: '/about' }
    ],`;

if (config.includes(targetNav)) {
  config = config.replace(targetNav, newNav);
  console.log('Added 关于 to nav');
} else {
  console.error('Target nav not found');
}

const targetFooter = `      message: '声明：本站提供客观网络技术评测与协议解析，所有数据均来自自动化压测节点实测；部分链接可能包含合规返佣以维持服务器运营。',`;
const newFooter = `      message: '声明：本站提供客观网络技术评测与协议解析，所有数据均来自自动化压测节点实测；部分链接可能包含合规返佣以维持服务器运营。<br><a href="/about">关于我们</a> · <a href="/benchmark/">评测方法论</a> · <a href="/disclosure">推广披露</a> · <a href="/privacy">隐私政策</a> · <a href="/terms">服务条款</a>',`;

if (config.includes(targetFooter)) {
  config = config.replace(targetFooter, newFooter);
  console.log('Updated footer with legal & trust links');
} else {
  console.error('Target footer not found');
}

fs.writeFileSync('docs/.vitepress/config.mts', config, 'utf8');
console.log('Finished writing docs/.vitepress/config.mts');
