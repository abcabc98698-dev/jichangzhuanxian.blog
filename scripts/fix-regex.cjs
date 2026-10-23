const fs = require('fs');
let c = fs.readFileSync('docs/.vitepress/config.mts', 'utf8');

c = c.replace(
  `.replace(/(^|/)index.md$/, '$1')
      .replace(/.md$/, '')`,
  `.replace(/(^|\\/)index\\.md$/, '$1')
      .replace(/\\.md$/, '')`
);

fs.writeFileSync('docs/.vitepress/config.mts', c, 'utf8');
console.log('Fixed regex in config.mts');
