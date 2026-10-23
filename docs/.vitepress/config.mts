import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '专线机场测评网',
  titleTemplate: ':title - 专线机场与网络技术知识库',
  description: '专注于 IEPL/IPLC 企业级专线测评、BGP 跨境网络架构、代理协议底蕴解析与高并发晚高峰网络排障指南。',
  lang: 'zh-CN',
  cleanUrls: true,
  ignoreDeadLinks: true,
  sitemap: {
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
  },
  head: [
    ['link', { rel: 'icon', href: '/avatar.jpg' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'keywords', content: '专线机场, IPLC机场, IEPL机场, 机场推荐, 代理协议, VLESS Reality, Hysteria 2, 网络排障, 晚高峰丢包' }],
    ['meta', { property: 'og:site_name', content: '专线机场技术实验室' }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '专线机场测评网',
        url: 'https://jichangzhuanxian.blog',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://jichangzhuanxian.blog/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    ],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '专线机场技术实验室',
        url: 'https://jichangzhuanxian.blog',
        logo: 'https://jichangzhuanxian.blog/avatar.jpg',
        description: '专注于企业级物理专线测评、跨国 BGP 路由架构、代理协议底蕴解析与高并发网络排障的独立技术实验室。'
      })
    ]
    // 搜索引擎站长平台所有权验证插槽预留 (上线后填入对应 content 即可)
    // ['meta', { name: 'google-site-verification', content: 'YOUR_GOOGLE_VERIFICATION_TOKEN' }],
    // ['meta', { name: 'msvalidate.01', content: 'YOUR_BING_VERIFICATION_TOKEN' }],
    // ['meta', { name: 'shenma-site-verification', content: 'YOUR_SHENMA_VERIFICATION_TOKEN' }],
    // ['meta', { name: 'baidu-site-verification', content: 'YOUR_BAIDU_VERIFICATION_TOKEN' }]
  ],
  themeConfig: {
    logo: '/avatar.jpg',
    siteTitle: '专线实验室',
    nav: [
      { text: '首页', link: '/' },
      { text: '专线机场', link: '/zhuanxian/' },
      { text: '机场推荐', link: '/recommend/' },
      { text: '免费机场', link: '/free/' },
      { text: '代理协议', link: '/protocols/' },
      { text: '网络性能', link: '/performance/' },
      { text: '多设备方案', link: '/devices/' },
      { text: '机场实测', link: '/benchmark/' },
      { text: '网络排障', link: '/troubleshooting/' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/zhuanxian/': [
        {
          text: '专线机场知识图谱',
          items: [
            { text: '专线架构与选型总览 (万字白皮书)', link: '/zhuanxian/' },
            { text: 'IEPL vs IPLC 专线底层机理全对比', link: '/zhuanxian/iepl-vs-iplc' },
            { text: 'BGP 多线入口与跨境隧道传输揭秘', link: '/zhuanxian/bgp-entry-transit' },
            { text: '晚高峰丢包 SLA 承诺与抖动实测标准', link: '/zhuanxian/sla-packet-loss' }
          ]
        },
        {
          text: '二级专题蜂巢集群',
          items: [
            { text: 'IEPL 专线全景分析', link: '/zhuanxian/#iepl-deep-dive' },
            { text: 'IPLC 专线与金融低延迟', link: '/zhuanxian/#iplc-finance' },
            { text: '假专线鉴别与抓包探测', link: '/zhuanxian/#fake-line-audit' },
            { text: '企业级专线与云互联骨干', link: '/zhuanxian/#cloud-sdn' },
            { text: '游戏与实时交易节点优化', link: '/zhuanxian/#gaming-rt-line' },
            { text: '专线机场选型对比大表', link: '/zhuanxian/#comparison-matrix' },
            { text: '专线常见疑问 FAQ 答疑', link: '/zhuanxian/#zhuanxian-faq' }
          ]
        }
      ],
      '/recommend/': [
        {
          text: '机场推荐大系',
          items: [
            { text: '场景化梯队推荐总览 (42家大表)', link: '/recommend/' },
            { text: '⭐ 光速云 2026 深度实测评测 (主推首选)', link: '/recommend/guangsucloud' },
            { text: '飞猫云深度实测评测 (学生党/新手)', link: '/recommend/feimao' },
            { text: '机场跑路前兆与防韭菜盘避坑指南', link: '/recommend/avoid-airport-exit-scams' }
          ]
        }
      ],
      '/free/': [
        {
          text: '免费机场深度剖析',
          items: [
            { text: '免费节点风险与架构总览', link: '/free/' },
            { text: '免费节点蜜罐与中间人流量劫持实录', link: '/free/honeypots-mitm-traffic-hijacking' },
            { text: '专线失联应急自救手册 (沙箱规范)', link: '/free/free-proxy-emergency-rescue-guide' },
            { text: '免费节点 vs 商业专线综合隐形成本 (TCO)', link: '/free/free-vs-paid-hidden-cost-tco' }
          ]
        }
      ],
      '/protocols/': [
        {
          text: '现代代理协议大系',
          items: [
            { text: '现代代理协议大系白皮书', link: '/protocols/' },
            { text: 'VLESS Reality 伪装域名(SNI)甄选手册', link: '/protocols/vless-reality-sni-guide' },
            { text: 'Shadowsocks-2022 规范与专线配置实战', link: '/protocols/shadowsocks-2022-setup' },
            { text: 'Hysteria 2 / TUIC v5 端口跳跃实战', link: '/protocols/hysteria2-tuic-udp-port-hopping' }
          ]
        },
        {
          text: '协议进阶与密码学微观实战',
          collapsed: false,
          items: [
            { text: 'Reality 伪装目标 SNI 权威筛选库', link: '/protocols/reality-sni-candidates' },
            { text: 'Reality 多 ShortId 防重放鉴权深度解密', link: '/protocols/reality-server-config' },
            { text: 'Reality 偷借证书遭遇 TLS 1.3 失败排障', link: '/protocols/reality-tls-troubleshooting' },
            { text: 'uTLS 客户端指纹随机化与特征模拟', link: '/protocols/reality-utls-fingerprint' },
            { text: 'Reality 握手 1-RTT 与 0-RTT 延迟对比', link: '/protocols/reality-handshake-rtt' },
            { text: '内网专线误开 Reality 损耗网络抓包', link: '/protocols/reality-on-zhuanxian-overhead' },
            { text: 'BLAKE3 在 SS-2022 中的抗重放与开销', link: '/protocols/ss2022-blake3-crypto-benchmark' },
            { text: 'SS-2022 内存滑动窗口抗重放过滤器', link: '/protocols/ss2022-replay-protection-cache' },
            { text: '生产级 Shadowsocks-2022 部署模版', link: '/protocols/ss2022-server-client-config' },
            { text: 'SS-2022 UDP Relay 转发与 Full Cone', link: '/protocols/ss2022-udp-relay-fullcone' },
            { text: 'Hysteria 2 Brutal 算法数学推导实测', link: '/protocols/hysteria2-brutal-congestion-math' },
            { text: 'UDP 端口跳跃防运营商 QoS 阻断限速', link: '/protocols/hysteria2-udp-port-hopping-firewall' },
            { text: '基于 QUIC 栈的快速建连与连接迁移', link: '/protocols/hysteria2-quic-tls-handshake' },
            { text: 'Hysteria 2 官方标准服务端搭建与客户端', link: '/protocols/hysteria2-server-client-setup' },
            { text: 'Hysteria 2 与 TUIC v5 晚高峰单流横评', link: '/protocols/hysteria2-vs-tuic-v5-benchmark' },
            { text: 'TLS 1.3 0-RTT 重放风险与前向安全平衡', link: '/protocols/tls-1-3-0rtt-security-analysis' }
          ]
        }
      ],
      '/performance/': [
        {
          text: '网络性能度量大系',
          items: [
            { text: '网络性能度量大系白皮书', link: '/performance/' },
            { text: 'Mathis 吞吐公式推导与晚高峰丢包雪崩', link: '/performance/mathis-formula-tcp-loss' },
            { text: 'BBR vs CUBIC 跨境长肥管道算法调优', link: '/performance/bbr-vs-cubic-high-packet-loss' },
            { text: 'Bufferbloat 缓冲区膨胀与 Linux SQM 实践', link: '/performance/bufferbloat-jitter-sqm-cake' },
            { text: 'SSH 终端长连接保活与 NAT 超时防御', link: '/performance/ssh-keepalive-proxy' }
          ]
        },
        {
          text: '光缆拓扑与物理延迟实测',
          collapsed: false,
          items: [
            { text: '沪日海缆 NCP/APG 拓扑与 25ms 物理极限', link: '/performance/shanghai-tokyo-submarine-cable-rtt' },
            { text: '深港跨境陆缆 2ms 极限直连走线拆解', link: '/performance/cross-border-terrestrial-cable-sz-hk-latency' },
            { text: '中美跨太平洋 TPE/FASTER 120ms 极限', link: '/performance/trans-pacific-cable-us-latency-physics' },
            { text: '光纤折射率与色散补偿对微秒级延迟影响', link: '/performance/fiber-refraction-chromatic-dispersion-delay' },
            { text: 'ICMP 伪造回显原理与假专线骗局拆解', link: '/performance/icmp-fake-echo-ping-spoofing' },
            { text: 'TCP SYN-ACK 握手时间差真实延迟测定', link: '/performance/tcp-syn-ack-rtt-audit-method' },
            { text: 'Python Scapy 端到端四层时间戳校验', link: '/performance/python-scapy-rtt-timestamp-verification' },
            { text: 'Wireshark HTTP TTFB 倒推净网络耗时', link: '/performance/wireshark-ttfb-reverse-rtt-analysis' },
            { text: 'SSH 击键回显时序与 15ms Jitter 临界点', link: '/performance/ssh-keystroke-latency-jitter-threshold' },
            { text: '加密货币与美股 API 交易抖动滑点实测', link: '/performance/crypto-stock-api-jitter-slippage' },
            { text: 'WebRTC 语音流 Jitter Buffer 补偿机制', link: '/performance/webrtc-jitter-buffer-audio-plc' },
            { text: '跨境 FPS 游戏 Tickrate 回溯与幽灵空枪', link: '/performance/cross-border-gaming-jitter-tickrate-desync' },
            { text: 'Speedtest 多线程掩盖 5% 致命丢包解密', link: '/performance/speedtest-multi-thread-masking-packet-loss' },
            { text: 'HTTP/2 多路复用单 TCP 队头阻塞缺陷', link: '/performance/http2-single-tcp-head-of-line-blocking' },
            { text: 'Fast.com 与 Cloudflare 测速维度横评', link: '/performance/fast-com-vs-cloudflare-speed-test-metrics' },
            { text: 'Iperf3 单线程 (-P 1) 正反向压测实操', link: '/performance/iperf3-single-thread-audit-guide' },
            { text: 'Bash 探针 24h 单流吞吐监控脚本实战', link: '/performance/python-bash-single-stream-throughput-daemon' },
            { text: 'yt-dlp 抓取 YouTube 4K 分块码率压测', link: '/performance/yt-dlp-real-chunk-download-benchmark' }
          ]
        }
      ],
      '/devices/': [
        {
          text: '全平台客户端方案',
          items: [
            { text: '多设备与客户端组网总览', link: '/devices/' },
            { text: '🔥 2026 全平台客户端下载大全与选型指南', link: '/devices/clients-download-guide' },
            { text: 'OpenWrt 旁路由 Fake-IP 全屋透明代理', link: '/devices/openwrt-bypass-gateway-fakeip' },
            { text: 'Apple TV 4K 奈飞双向解锁家庭组网', link: '/devices/apple-tv-netflix-surge-clash' }
          ]
        },
        {
          text: '多端客户端与路由精调',
          collapsed: false,
          items: [
            { text: 'Windows TUN 模式与系统代理吞吐损耗', link: '/devices/windows-tun-vs-system-proxy' },
            { text: 'Windows UWP 应用网络隔离豁免脚本', link: '/devices/windows-uwp-loopback' },
            { text: 'Windows 外服网游防封与低延迟分流', link: '/devices/windows-gaming-bypass' },
            { text: 'Clash Verge Rev 扩展脚本动态注入实战', link: '/devices/clash-verge-rev-scripts' },
            { text: 'Sing-box 原生 Windows JSON 配置设计', link: '/devices/sing-box-windows-config' },
            { text: 'Subconverter 多订阅自动合并分流实战', link: '/devices/subscription-auto-merge' },
            { text: 'Surge for Mac 增强模式底层实现剖析', link: '/devices/surge-mac-enhanced-mode' },
            { text: '利用闲置 Mac mini 打造局域网旁网关', link: '/devices/surge-mac-gateway' },
            { text: 'Apple Silicon 硬件 AES 加密能耗实测', link: '/devices/apple-silicon-crypto-power' },
            { text: 'macOS 快捷指令内外网 Wi-Fi 自动切换', link: '/devices/macos-wifi-proxy-automation' },
            { text: '四大主流 iOS 代理工具全景选型矩阵', link: '/devices/ios-client-comparison' },
            { text: '自建 Subconverter 防订阅泄露与同步', link: '/devices/subconverter-rules-sync' },
            { text: 'iOS 快捷指令连 Wi-Fi 自动启停代理', link: '/devices/ios-shortcuts-proxy-automation' },
            { text: 'iOS MitM 中间人解密证书安全边界', link: '/devices/ios-mitm-certificates' },
            { text: 'iOS ChatGPT / Claude 纯净分流防封号', link: '/devices/ios-chatgpt-claude-routing' },
            { text: 'Android 后台保活防杀与电池优化配置', link: '/devices/android-keepalive-battery' },
            { text: 'Sing-box Android 极轻内存实测实操', link: '/devices/sing-box-android-performance' },
            { text: 'Android 分应用代理避国内银行风控', link: '/devices/android-per-app-split-tunneling' }
          ]
        }
      ],
      '/benchmark/': [
        {
          text: '真实网络压测矩阵',
          items: [
            { text: '晚高峰实测数据发布 (总览大表)', link: '/benchmark/' },
            { text: '三大运营商晚高峰跨境丢包实测报告', link: '/benchmark/telecom-unicom-cmcc-peak-loss' },
            { text: '2026 流媒体与海外 AI 原生解锁深度审计', link: '/benchmark/streaming-ai-ip-unlock-audit' },
            { text: 'YouTube 4K/8K 码流压测与二次缓冲率审计', link: '/benchmark/video-streaming-8k-bitrate-jitter-audit' }
          ]
        }
      ],
      '/troubleshooting/': [
        {
          text: '网络排障手册',
          items: [
            { text: '网络排障白皮书总览', link: '/troubleshooting/' },
            { text: 'DNS 泄漏与 Fake-IP 防污染实战', link: '/troubleshooting/dns-leak-fakeip-edns' },
            { text: 'IPv6 漏流分析与全平台一键修复', link: '/troubleshooting/ipv6-leak-fix-guide' },
            { text: 'TUN 虚拟网卡死锁与路由环路救砖', link: '/troubleshooting/tun-routing-loop-deadlock-fix' }
          ]
        },
        {
          text: '网络排障微观实战',
          collapsed: false,
          items: [
            { text: 'Clash Verge Wintun 驱动失败彻底清理', link: '/troubleshooting/windows-tun-driver-fix' },
            { text: 'macOS 终端代理不一致与 Curl 卡顿终结', link: '/troubleshooting/macos-cli-proxy-leak' },
            { text: 'macOS 盒盖休眠唤醒 TUN 断连彻底根治', link: '/troubleshooting/clash-verge-mac-sleep' },
            { text: 'iCloud 私密转送冲突成因与一键关闭', link: '/troubleshooting/icloud-private-relay-conflict' },
            { text: 'Android 双栈 IPv6 DNS 污染穿透排障', link: '/troubleshooting/android-ipv6-dns-leak' },
            { text: '国产定制 ROM 后台保活防杀设置手册', link: '/troubleshooting/android-rom-proxy-issues' },
            { text: '软路由 TUN 模式死锁全屋断网快速自救', link: '/troubleshooting/tun-gateway-loop-rescue' },
            { text: 'Wireshark 本地回环解密抓包实战', link: '/troubleshooting/wireshark-proxy-capture-decrypt' }
          ]
        }
      ]
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索专线技术与评测...',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '未找到相关技术文档',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    socialLinks: [],
    footer: {
      message: '声明：本站提供客观网络技术评测与协议解析，所有数据均来自自动化压测节点实测；部分链接可能包含合规返佣以维持服务器运营。<br><a href="/about">关于我们</a> · <a href="/benchmark/">评测方法论</a> · <a href="/disclosure">推广披露</a> · <a href="/privacy">隐私政策</a> · <a href="/terms">服务条款</a>',
      copyright: 'Copyright © 2026 jichangzhuanxian.blog. 专线机场技术实验室 版权所有.'
    },
    outline: {
      level: [2, 3],
      label: '本页内容导航'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后核验更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  }
})
