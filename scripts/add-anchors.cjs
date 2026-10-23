const fs = require('fs');

function addAnchors(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="amytelecom"')) {
    content = content.replace(/<AffiliateCard\s+name="AmyTelecom"/, '<div id="amytelecom"></div>\n<AffiliateCard\n  name="AmyTelecom"');
    content = content.replace(/<AffiliateCard\s+name="TAG VPN"/, '<div id="tagvpn"></div>\n<AffiliateCard\n  name="TAG VPN"');
    content = content.replace(/<AffiliateCard\s+name="FlyingBird[^"]*"/, '<div id="flyingbird"></div>\n<div id="kuaichedao"></div>\n<AffiliateCard\n  name="FlyingBird (飞鸟专线)"');
    content = content.replace(/<AffiliateCard\s+name="FlowerCloud[^"]*"/, '<div id="flowercloud"></div>\n<AffiliateCard\n  name="FlowerCloud (花云)"');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added anchors to:', file);
  }
}

addAnchors('docs/zhuanxian/index.md');
addAnchors('docs/recommend/index.md');
