const fs = require('fs');
const path = require('path');

const files = [
  'benchmark/index.md',
  'devices/apple-tv-netflix-surge-clash.md',
  'devices/clients-download-guide.md',
  'devices/index.md',
  'devices/openwrt-bypass-gateway-fakeip.md',
  'free/index.md',
  'performance/index.md',
  'performance/mathis-formula-tcp-loss.md',
  'protocols/index.md',
  'protocols/shadowsocks-2022-setup.md',
  'protocols/vless-reality-sni-guide.md',
  'recommend/avoid-airport-exit-scams.md',
  'recommend/guangsucloud.md',
  'recommend/index.md',
  'troubleshooting/dns-leak-fakeip-edns.md',
  'troubleshooting/index.md',
  'troubleshooting/ipv6-leak-fix-guide.md',
  'zhuanxian/index.md'
];

function normalize(str) {
  return str.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
}

// Calculate similarity score between two normalized strings
function similarity(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length) + 0.5;
  }
  // Count character overlap
  let matches = 0;
  for (let c of s1) {
    if (s2.includes(c)) matches++;
  }
  return matches / Math.max(s1.length, s2.length);
}

let totalFixed = 0;

files.forEach(file => {
  const mdPath = path.join('docs', file);
  let content = fs.readFileSync(mdPath, 'utf8');
  const htmlPath = path.join('docs/.vitepress/dist', file.replace(/\.md$/, '.html'));
  if (!fs.existsSync(htmlPath)) return;
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Extract all heading IDs from html
  const headingIds = [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map(m => m[1]);

  const tocMatches = [...content.matchAll(/\[([^\]]+)\]\(#([^\)]+)\)/g)];
  console.log(`\n=== Checking ${file} (${tocMatches.length} links) ===`);

  let fileChanges = 0;

  tocMatches.forEach(m => {
    const fullMatch = m[0];
    const text = m[1];
    const oldAnchor = decodeURIComponent(m[2]);
    if (headingIds.includes(oldAnchor)) return; // already valid

    // Try to match
    const normText = normalize(text);
    const normAnchor = normalize(oldAnchor);

    let bestId = null;
    let bestScore = 0;

    headingIds.forEach(id => {
      const normId = normalize(id);
      
      const scoreText = similarity(normText, normId);
      const scoreAnchor = similarity(normAnchor, normId);
      const maxScore = Math.max(scoreText, scoreAnchor);

      if (maxScore > bestScore) {
        bestScore = maxScore;
        bestId = id;
      }
    });

    if (bestId && bestScore > 0.4) {
      console.log(`  FIX: [${text}]`);
      console.log(`       Old: #${oldAnchor}`);
      console.log(`       New: #${bestId} (score: ${bestScore.toFixed(2)})`);
      
      const newLink = `[${text}](#${bestId})`;
      content = content.replace(fullMatch, newLink);
      fileChanges++;
      totalFixed++;
    } else {
      console.log(`  WARN UNMATCHED: [${text}] (#${oldAnchor})`);
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(mdPath, content, 'utf8');
    console.log(`  => Saved ${fileChanges} changes to ${file}`);
  }
});

console.log(`\nTotal fixed anchor links: ${totalFixed}`);
