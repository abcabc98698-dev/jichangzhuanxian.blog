const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');

const routeRules = [
  // Performance
  { pattern: /mathis|sawtooth|锯齿|吞吐衰减|loss-throughput|packet-loss/i, url: '/performance/mathis-formula-tcp-loss' },
  { pattern: /bbr|cubic|拥塞控制|congestion/i, url: '/performance/bbr-vs-cubic-high-packet-loss' },
  { pattern: /jitter|bufferbloat|sqm|cake|fq_codel|抖动|缓冲区膨胀|击键/i, url: '/performance/bufferbloat-jitter-sqm-cake' },
  { pattern: /8k|4k|dash|youtube.*buffering|码率|yt-dlp|分块/i, url: '/benchmark/video-streaming-8k-bitrate-jitter-audit' },
  { pattern: /unlock|netflix|disney|chatgpt|openai|claude|纯净|原生.*ip|风控/i, url: '/benchmark/streaming-ai-ip-unlock-audit' },
  { pattern: /电信|联通|移动|三网|as4134|as4837|as4809|peak-loss|运营商/i, url: '/benchmark/telecom-unicom-cmcc-peak-loss' },
  
  // Protocols
  { pattern: /reality|sni|vision|shortid|utls|偷借/i, url: '/protocols/vless-reality-sni-guide' },
  { pattern: /shadowsocks|ss2022|2022-blake3/i, url: '/protocols/shadowsocks-2022-setup' },
  { pattern: /hysteria|tuic|brutal|udp|quic|跳频/i, url: '/protocols/hysteria2-tuic-udp-port-hopping' },
  
  // Devices
  { pattern: /openwrt|旁路由|软路由|透明代理|fake-ip.*路由|bypass-gateway/i, url: '/devices/openwrt-bypass-gateway-fakeip' },
  { pattern: /apple-tv|surge.*gateway|电视盒子|mac.*网关/i, url: '/devices/apple-tv-netflix-surge-clash' },
  { pattern: /客户端|下载|gui|verge|sing-box.*config|小火箭|loon|quantumult|stash|客户端选型|subconverter|合并订阅/i, url: '/devices/clients-download-guide' },
  
  // Troubleshooting
  { pattern: /wintun|tun.*driver|死锁|路由循环|环路|routing-loop/i, url: '/troubleshooting/tun-routing-loop-deadlock-fix' },
  { pattern: /dns.*leak|dns.*污染|edns|ecs|fake-ip|smartdns|doh|dot/i, url: '/troubleshooting/dns-leak-fakeip-edns' },
  { pattern: /ipv6|双栈/i, url: '/troubleshooting/ipv6-leak-fix-guide' },
  
  // Zhuanxian & Recommend & Free
  { pattern: /bgp|pop|入口|落地集群/i, url: '/zhuanxian/bgp-entry-transit' },
  { pattern: /iepl|iplc|专线|陆缆|海缆|内网/i, url: '/zhuanxian/iepl-vs-iplc' },
  { pattern: /sla|工单|补偿|失联/i, url: '/zhuanxian/sla-packet-loss' },
  { pattern: /跑路|资金盘|骗局|避坑|退出|exit-scam/i, url: '/recommend/avoid-airport-exit-scams' },
  { pattern: /蜜罐|劫持|honeypot/i, url: '/free/honeypots-mitm-traffic-hijacking' },
  { pattern: /应急|救生|备用/i, url: '/free/free-proxy-emergency-rescue-guide' },
  { pattern: /tco|成本|自建/i, url: '/free/free-vs-paid-hidden-cost-tco' }
];

function processFile(relPath) {
  const filePath = path.join(docsDir, relPath);
  let content = fs.readFileSync(filePath, 'utf8');
  let relinkCount = 0;
  let unlinkCount = 0;

  // 1. Process <li><a href="URL">TEXT</a></li>
  content = content.replace(/<li><a href="([^"]+)">([^<]+)<\/a><\/li>/g, (match, url, text) => {
    if (!url.startsWith('/')) return match;
    const clean = url.split('#')[0].split('?')[0];
    const p1 = path.join(docsDir, clean + '.md');
    const p2 = path.join(docsDir, clean, 'index.md');
    if (fs.existsSync(p1) || fs.existsSync(p2) || clean.startsWith('/images/')) {
      return match; // valid link!
    }
    
    // Check routing rules
    const combined = `${url} ${text}`;
    let matchedRule = null;
    for (const rule of routeRules) {
      if (rule.pattern.test(combined)) {
        matchedRule = rule.url;
        break;
      }
    }

    if (matchedRule) {
      relinkCount++;
      return `<li><a href="${matchedRule}"><strong>【推荐专章】</strong> ${text}</a></li>`;
    } else {
      unlinkCount++;
      return `<li><strong>【技术要点】</strong> ${text}</li>`;
    }
  });

  // 2. Process [TEXT](URL)
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (!url.startsWith('/')) return match;
    const clean = url.split('#')[0].split('?')[0];
    const p1 = path.join(docsDir, clean + '.md');
    const p2 = path.join(docsDir, clean, 'index.md');
    if (fs.existsSync(p1) || fs.existsSync(p2) || clean.startsWith('/images/')) {
      return match; // valid link!
    }

    // Check routing rules
    const combined = `${url} ${text}`;
    let matchedRule = null;
    for (const rule of routeRules) {
      if (rule.pattern.test(combined)) {
        matchedRule = rule.url;
        break;
      }
    }

    if (matchedRule) {
      relinkCount++;
      return `[${text} (详见专章)](${matchedRule})`;
    } else {
      unlinkCount++;
      return `**【深度考量】** ${text}`;
    }
  });

  // Fix /docs/data/protocols.json -> /data/protocols.json
  content = content.replaceAll('/docs/data/protocols.json', '/data/protocols.json');
  content = content.replaceAll('/docs/data/lines.json', '/data/lines.json');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`${relPath}: Relinked ${relinkCount}, Unlinked ${unlinkCount}`);
}

processFile('devices/index.md');
processFile('performance/index.md');
processFile('protocols/index.md');
