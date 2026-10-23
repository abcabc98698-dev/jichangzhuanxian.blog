const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'docs/.vitepress/config.mts');
let content = fs.readFileSync(configPath, 'utf8');

// 1. Add troubleshooting secondary group
const troubleSecondary = `        {
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
        }`;

// 2. Add performance secondary group
const perfSecondary = `        {
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
        }`;

// 3. Add devices secondary group
const devicesSecondary = `        {
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
        }`;

// 4. Add protocols secondary group
const protocolsSecondary = `        {
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
        }`;

// Inject into troubleshooting
content = content.replace(
  /(\/troubleshooting\/': \[\s+\{[\s\S]+?items: \[\s+[\s\S]+?\]\s+\})/,
  `$1,\n${troubleSecondary}`
);

// Inject into performance
content = content.replace(
  /(\/performance\/': \[\s+\{[\s\S]+?items: \[\s+[\s\S]+?\]\s+\})/,
  `$1,\n${perfSecondary}`
);

// Inject into devices
content = content.replace(
  /(\/devices\/': \[\s+\{[\s\S]+?items: \[\s+[\s\S]+?\]\s+\})/,
  `$1,\n${devicesSecondary}`
);

// Inject into protocols
content = content.replace(
  /(\/protocols\/': \[\s+\{[\s\S]+?items: \[\s+[\s\S]+?\]\s+\})/,
  `$1,\n${protocolsSecondary}`
);

fs.writeFileSync(configPath, content, 'utf8');
console.log('Successfully updated sidebar in docs/.vitepress/config.mts!');
