const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'docs/performance');
const b3 = '```';

function writeArt(filename, title, desc, body) {
  const content = `---
title: ${title}
description: ${desc}
outline: deep
---

# ${title}

${body}

---

## 延伸阅读与专栏导航
- **网络性能度量大系白皮书**：[网络性能度量大系与底层物理传输白皮书](/performance/)
- **Mathis 吞吐公式推导**：[Mathis 吞吐量公式数学推导与晚高峰丢包雪崩](/performance/mathis-formula-tcp-loss)
- **BBR vs CUBIC 调优**：[BBRv1/v2/v3 vs CUBIC 拥塞控制算法博弈](/performance/bbr-vs-cubic-high-packet-loss)
- **Bufferbloat 与 SQM 消除**：[Bufferbloat 缓冲区膨胀机理与 Linux SQM 实践](/performance/bufferbloat-jitter-sqm-cake)
`;
  fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
  console.log('Created: ' + filename);
}

writeArt(
  'shanghai-tokyo-submarine-cable-rtt.md',
  '沪日海底光缆 NCP/APG 物理拓扑与 25ms 理论延迟极限实测',
  '从光纤在二氧化硅介质中的折射率推导上海至东京海底光缆物理延迟极限，对比 NCP、APG、SJC2 各大光缆系统的真实 RTT 表现。',
  `在跨境专线中，**沪日（上海-东京）线路**是国内连接海外核心数据中心吞吐量最大的主干动脉之一。

光信号在真空中的传播速度为 $c \\approx 300,000\\text{ km/s}$，而在通信单模光纤（二氧化硅 $\\text{SiO}_2$）中，光纤折射率约为 $n = 1.468$，因此光在光纤中的实际传播速度约为 $v = c / n \\approx 204,360\\text{ km/s}$（约 $204.36\\text{ km/ms}$）。

上海至东京的海底光缆路由物理距离约为 $2,500 \\sim 2,800\\text{ km}$。单向光纤传播时延约为 $12.2\\text{ ms}$，因此纯物理双向往返时延（RTT）的理论下限约为：
$$\\text{RTT}_{\\text{min}} = 2 \\times 12.2 \\approx 24.5\\text{ ms}$$

实际生产环境中，加上陆地引接站、DWDM 波分复用设备、EDFA 光放大器以及交换机处理延迟，顶尖 IEPL 专线的沪日延迟一般在 **26ms ~ 28ms** 之间。凡宣称低于 22ms 的多为本地 ICMP 伪造回显欺诈。`
);

writeArt(
  'cross-border-terrestrial-cable-sz-hk-latency.md',
  '跨境陆缆中港直连：广港/深港光纤延迟为何能压入 2ms 级别',
  '解析深港跨境陆地光缆（深圳罗湖/文锦渡至香港落马洲）的物理走线与交叉互联，揭秘顶级专线 2ms 极致跟手体验的工程基础。',
  `中港（深圳/广州至香港）是亚太地区最重要的跨境通信枢纽。与海底光缆动辄数千公里的漫长距离不同，**深港之间采用的是跨境陆地光缆直连**。

深圳核心机房（如南山腾讯大厦或罗湖机房）至香港新界沙田或葵涌机房的物理直线距离仅有 $30 \\sim 50\\text{ km}$。光信号在陆地光缆中仅需 **0.2ms ~ 0.3ms** 即可跨越边境。

加上两端省界 BGP 路由交换机的端口交换时延，**深港纯内网专线的真实 RTT 稳定在 2.0ms ~ 3.5ms** 之间。这是为何使用深港 IEPL 连接香港云桌面或进行外盘高频交易时，完全感觉不到任何远程延迟的根本物理原因。`
);

writeArt(
  'trans-pacific-cable-us-latency-physics.md',
  '中美跨太平洋 TPE/FASTER 传输路径与 120ms 物理极限底线',
  '从跨太平洋跨海光缆（青岛/崇明岛至美西俄勒冈/洛杉矶）的物理大圆距离推导中美 RTT 物理极限，教你一眼识破虚假测速。',
  `跨太平洋海底光缆（Trans-Pacific Cable）横跨整个太平洋，是连接中美互联网的数字生命线。

从中国大陆登陆站（上海崇明岛、青岛）至美西海岸登陆站（如俄勒冈州 Nedonna Beach 或加州 Bandon），海缆物理路由长度通常在 **9,500km 至 11,500km** 之间。

按光纤内传播速度 $204.36\\text{ km/ms}$ 计算：
$$\\text{RTT}_{\\text{中美}} = 2 \\times \\frac{11000}{204.36} \\approx 107.6\\text{ ms}$$

加上中美两国内陆段的光纤延伸（如北京到上海需 15ms，美西到美东需 40ms）以及再生放大器时延：
- **北京/上海 -> 美西（洛杉矶/圣何塞）真实极限**：**120ms ~ 135ms**；
- **北京/上海 -> 美东（弗吉尼亚/纽约）真实极限**：**160ms ~ 180ms**。

任何声称中美直连延迟“只有 60ms”的节点，100% 是在中转入口机房进行了虚假 ICMP Ping 劫持回显。`
);

writeArt(
  'fiber-refraction-chromatic-dispersion-delay.md',
  '光纤折射率与色散补偿对跨境长途信道传输延迟的微秒级影响',
  '深入光学通信物理层，探讨群速度折射率、波分复用（WDM）与色散补偿光纤（DCF）对高频交易与低延迟专线的影响。',
  `在普通互联网用户眼中，网络延迟只是一个毫秒（ms）数值；但在国际金融高频量化（HFT）与极端低延迟专线工程中，**竞争是以微秒（µs）甚至纳秒（ns）为单位展开的**。

光在介质中的速度由群折射率（Group Index $n_g$）决定。波长为 1550nm 的激光在标准 G.652 单模光纤中的 $n_g \\approx 1.4682$。
长途光缆为了补偿色散，历史上曾大量串联色散补偿光纤（DCF）。DCF 的光纤折射率更高（$n_g > 1.48$），且长途级联导致光纤物理总长度增加了 15%~20%，无形中给中美海缆增加了近 5ms 的额外传输延迟。现代相干光通信（Coherent DSP）采用数字算法补偿色散，彻底移除了 DCF，使跨境长途光通信逼近绝对物理极限。`
);

writeArt(
  'icmp-fake-echo-ping-spoofing.md',
  'ICMP 本地伪造回显原理：为何测速面板显示 5ms 实际却是公网',
  '深度揭秘低端不良机场在境内入口服务器部署伪造 ICMP 回显欺骗测速客户端的黑幕，提供四层真实抓包取证方案。',
  `很多新手在购买某些号称“全网最便宜专线”的机场后，打开客户端一键测速，惊喜地发现所有美国、日本节点的 Ping 只有 **5ms ~ 8ms**，但在浏览器打开 Google 却卡得转圈。

这便是业内臭名昭著的 **ICMP 本地伪造回显欺诈（ICMP Spoofing）**。

---

## 一、 作弊原理：入口直接应答 Ping 包

在正规专线中，Ping 测试的数据包必须穿越专线全程到达海外落地服务器，海外服务器回复 Echo Reply，时间必然大于物理极限（美西 >120ms）。

而不良黑心商家在境内 BGP 入口服务器的防火墙（iptables/nftables）中配置了一条规则：
${b3}bash
# 黑心商家欺诈规则：境内入口直接冒充海外落地 IP 秒回 ICMP Echo Reply
iptables -t nat -A PREROUTING -p icmp -j REDIRECT
${b3}
用户的 Ping 报文甚至连国境线都没出，直接在几公里外的境内入口服务器被就地返回！测出来的自然是国内入口的 5ms。真实业务流量走的却是劣质公网慢速中转。`
);

writeArt(
  'tcp-syn-ack-rtt-audit-method.md',
  'TCP 握手 SYN-ACK 时间差推算法：彻底剥除假专线虚假延迟面具',
  '利用四层 TCP 三次握手真实时间差计算端到端往返时延，彻底粉碎 ICMP 伪造回显的照妖镜实战教程。',
  `既然 ICMP 可以被境内入口服务器轻易伪造，如何才能测定一条专线节点的真实物理延迟？

答案是：**基于四层 TCP 握手的时间差推算法（TCP Handshake Timing）**。

---

## 一、 为什么 TCP 无法作弊？

在 TCP 协议中，客户端发送 \`SYN\` 握手包，必须由最终承载业务的海外目标服务器（或海外落地代理服务端）返回 \`SYN-ACK\`，并携带合法的随机序号（ISN）。
如果境内入口提前假冒回复 \`SYN-ACK\`，当真实的海外数据到达时，序列号将彻底错乱导致整条 TCP 链接直接被操作系统强行重置（RST）。因此，**TCP 握手耗时必须走完全程物理光纤，根本无法在本地作弊**。

---

## 二、 测定工具：使用 tcping 或 curl 精准实测

${b3}bash
# 使用 curl 仅度量四层 TCP 连接建立时间 (time_connect)
curl -o /dev/null -s -w "真实物理握手耗时: %{time_connect} 秒\\n" -x socks5://127.0.0.1:7890 https://www.google.com
${b3}

若此处的 \`time_connect\` 显示为 0.135 秒（135ms），而客户端测速面板标榜 5ms，即可 100% 实锤该服务商存在测速作弊。`
);

writeArt(
  'python-scapy-rtt-timestamp-verification.md',
  '使用 Python Scapy 进行端到端四层时间戳校验与防欺诈审计',
  '编写自动化 Python Scapy 脚本构造带 TCP Timestamp 选项的自定义探测报文，精准审计跨境物理跳数与纳秒级时间戳。',
  `为了进行高精度的企业级网络审计，我们可以利用 Python 著名的网络数据包编排库 **Scapy**，直接注入带有 RFC 1323 高精度时间戳选项（TCP Timestamps Option）的数据包进行审计。

${b3}python
# 专线实验室 - 端到端四层时间戳防欺诈审计脚本
from scapy.all import IP, TCP, sr1
import time

target_ip = "1.1.1.1"
target_port = 443

# 构造带有精确高精度时间戳的 SYN 握手包
t1 = time.time()
syn_pkt = IP(dst=target_ip)/TCP(dport=target_port, flags="S", options=[('Timestamp', (1000, 0))])
reply = sr1(syn_pkt, timeout=3, verbose=0)
t2 = time.time()

if reply and reply.haslayer(TCP):
    real_rtt = (t2 - t1) * 1000
    print(f"✅ 目标响应成功！真实端到端四层 RTT: {real_rtt:.2f} ms")
else:
    print("❌ 握手超时，链路可能存在静默丢包")
${b3}`
);

writeArt(
  'wireshark-ttfb-reverse-rtt-analysis.md',
  'Wireshark 追踪真实海外落地往返耗时（HTTP TTFB 倒推 RTT）',
  '通过分析 HTTP/1.1 与 HTTP/2 的首字节返回时间（TTFB），剥离服务器内部处理开销，逆向精确推算跨境网络净往返耗时。',
  `在无法直接对中间节点执行探针压测的封闭网络中，**利用 Wireshark 抓包分析 HTTP 首字节响应时间（Time-to-First-Byte，TTFB）**是倒推链路真实 RTT 的利器。

当客户端发送完成 HTTP GET 请求报文的最后一个字节后，服务器收到并返回响应报文头部的第一个数据包，这中间经历的时间为：
$$\\text{TTFB} = \\text{单向网络延迟} + \\text{服务器业务渲染时间} + \\text{反向网络延迟} = \\text{RTT} + t_{\\text{server}}$$

在请求轻量级静态资源（如 \`favicon.ico\` 或 204 No-Content）时，服务器业务处理时间 $t_{\\text{server}} < 2\\text{ ms}$。此时 $\\text{TTFB} \\approx \\text{RTT}$，即可直接作为判定真实网络延迟的硬核依据。`
);

writeArt(
  'ssh-keystroke-latency-jitter-threshold.md',
  'SSH 远程终端击键回显时序与 15ms Jitter 粘滞临界点分析',
  '深入剖析交互式 SSH 终端 TCP_NODELAY 原理，实测抖动方差超过 15ms 时对程序员盲打与终端跟手度的生理感知破坏。',
  `SSH 协议在交互会话中默认开启了 \`TCP_NODELAY\` 选项，强行关闭了 Nagle 算法。用户的每一次按键输入都会作为一个独立的 TCP 包发出，并在收到远端回显后渲染在屏幕上。

实测生理心理学数据表明：
- 当网络抖动方差 $\\sigma < 5\\text{ ms}$ 时，按键回显如丝般顺滑，与本地终端无异；
- 当 $\\sigma > 15\\text{ ms}$ 时，敲击代码会出现忽快忽慢的“严重粘滞感”；
- 当 $\\sigma > 30\\text{ ms}$ 时，快速键入高危命令极易引发字符错位与误敲回车事故。这就是为什么高端运维必须依赖零抖动的企业级 IEPL 专线。`
);

writeArt(
  'crypto-stock-api-jitter-slippage.md',
  '加密货币与美股 API 交易滑点成因：毫秒级抖动对 FIX/WebSocket 的毁灭打击',
  '量化交易场景下网络抖动对订单薄更新与限价单成交影响实测，详解微秒级 Jitter 如何导致巨额滑点损失。',
  `在币安（Binance）、OKX 或美股（Interactive Brokers）高频量化交易（HFT）中，**网络延迟的“绝对值大小”往往不如“抖动方差 Jitter”致命**。

量化策略模型假设从行情推送（WebSocket Depth）到限价单到达撮合引擎的时间是可预测的常数 $\\Delta t$。
如果链路发生突发抖动（Jitter 从 20ms 突增至 80ms），其他竞争对手的套利单将先于你的订单被撮合，导致你的订单在队列中被迫滑入恶化的价格档位，造成巨额交易滑点（Slippage）。专业量化团队宁可选用 40ms 绝对恒定的专线，也绝不用平均 20ms 但偶发跳到 100ms 的劣质公网。`
);

writeArt(
  'webrtc-jitter-buffer-audio-plc.md',
  'WebRTC 实时语音音频流 Jitter Buffer 动态补偿机制与丢包补偿 PLC',
  '拆解 Zoom、Google Meet 与 Telegram 语音通话在跨境高抖动网络下的动态自适应缓冲算法与丢包隐藏机制。',
  `WebRTC 是现代跨境视频会议与语音通话（如 Discord、Google Meet）的核心基础。

为了对抗公网传输的抖动，WebRTC 接收端设计了 **自适应抖动缓冲区（Adaptive Jitter Buffer）**：
- 缓冲区必须在“延迟最小化”与“防止缓冲区欠载（Underflow）”之间权衡；
- 当抖动激增时，缓冲区被迫加大容量，导致通话双方出现明显的“抢话、回声、滞后 1 秒以上”的尴尬局面；
- 当丢包发生时，内置的丢包隐藏（Packet Loss Concealment，PLC）算法只能用 AI 算法合成虚假语音，导致声音发闷变调。专线低抖动是保障高保真跨境会议的刚性指标。`
);

writeArt(
  'cross-border-gaming-jitter-tickrate-desync.md',
  '跨境游戏（Apex/CS2/Valorant）时钟同步与 Jitter 导致的命中判定幽灵空枪',
  '详解 128 Tickrate 游戏服务器回溯机制（Lag Compensation），揭秘网络抖动如何引发“明明打中敌人却无伤害判定”的幽灵空枪。',
  `在 Apex Legends、CS2 或 Valorant 等第一人称射击（FPS）游戏中，玩家最痛恨的现象莫过于“明明准星锁头开枪击中了敌人，甚至看到了爆血动画，但系统判定伤害为 0”。

这就是 **网络抖动方差破坏了服务器时钟回溯判定（Lag Compensation Desync）** 的典型后果。游戏服务器在判定命中时，会根据玩家的网络时延将场景模型向过去回溯 $\\text{RTT}/2$ 的时间。如果 RTT 频繁突变，客户端预测位置与服务器回溯历史位置严重脱节，直接被服务器反作弊逻辑判定为无效攻击。`
);

writeArt(
  'speedtest-multi-thread-masking-packet-loss.md',
  'Speedtest 测速机制解密：8-32 线程并发如何掩盖 5% 的致命丢包',
  '深度解析 Ookla Speedtest 多并发线程在时间轴上的交替突发原理，揭露多线程大带宽与单流卡顿彻底背离的工程真相。',
  `Ookla Speedtest 在默认设置下会同时拉起 **8 到 32 条并发 TCP 连接** 进行压测。

根据 Mathis 公式，单条 TCP 流在遭遇 2% 丢包时吞吐量会被限制在极低水平。但当并发 32 条流时，各流的丢包与减窗事件在时间轴上相互错开：线程 A 丢包降速时，线程 B 刚好处于加速期。多流吞吐聚合在仪表盘上，便刷出了几百兆的虚高数字。但在实际看视频或下载大文件这种单连接场景下，用户依然卡得无法自拔。`
);

writeArt(
  'http2-single-tcp-head-of-line-blocking.md',
  'HTTP/2 多路复用在单 TCP 连接下的弱点：单流拥塞引发整站全阻断',
  '剖析 HTTP/2 多路复用（Multiplexing）在跨境长肥管道中的阿喀琉斯之踵：底层单 TCP 丢包引发所有流队头阻塞的机理。',
  `HTTP/2 标准引入了多路复用技术，允许多个 HTTP 请求在一条物理 TCP 连接上并行传输，极大地提升了网页加载性能。

然而，在跨境长 RTT 且有丢包的劣质公网上，这反而成了致命缺陷：**底层单一 TCP 链接只要丢了一个数据包，内核必须暂停向应用层交付后续所有数据流**，等待该丢失包重传成功。这就是著名的“四层队头阻塞（Head-of-Line Blocking）”，也是催生基于 UDP 的 HTTP/3 QUIC 协议诞生的核心驱动力。`
);

writeArt(
  'fast-com-vs-cloudflare-speed-test-metrics.md',
  'Fast.com 与 Cloudflare Speed Test 测速指标的多维度差异剖析',
  '对比 Netflix 官方 Fast.com 与 Cloudflare Speed Test 在加载延迟、空闲时延与多数据中心并发度量上的工程权威性。',
  `在客观网络性能评估中，**Netflix 旗下的 Fast.com** 与 **Cloudflare Speed Test** 提供了远超传统测速软件的多维指标：
- Fast.com 直接从 Netflix 真实的 Open Connect CDN 节点拉取高清视频分块，其测速数据直接反映流媒体解锁与播放质量；
- Cloudflare Speed Test 引入了 **加载下延迟（Loaded Latency）** 与 **空闲延迟（Unloaded Latency）** 的差值度量，直观暴露路由器是否存在缓冲区膨胀（Bufferbloat）。`
);

writeArt(
  'iperf3-single-thread-audit-guide.md',
  '利用 Iperf3 进行单线程（-P 1）正向与反向真实吞吐压力测试',
  '网络工程师权威测速实操指南：如何使用 Iperf3 剥离浏览器渲染与多线程假象，精准测定服务器物理信道极限单流吞吐。',
  `网络工程师只相信 **Iperf3 单线程压测** 的真实数据。

${b3}bash
# 服务端开启监听 (海外 VPS)
iperf3 -s -p 5201

# 客户端单线程真实反向压测 (模拟下载大文件)
iperf3 -c <海外服务器IP> -p 5201 -P 1 -R -t 30 -w 2M
${b3}
通过 \`-P 1\` 严格限制单线程，可以真实衡量专线在克服丢包与长 RTT 后的持续稳定吞吐能力。`
);

writeArt(
  'python-bash-single-stream-throughput-daemon.md',
  '编写 Bash/Python 自动化脚本对节点进行 24 小时单流吞吐监控',
  '提供企业级常驻守护脚本，自动化轮询全量专线节点并记录晚高峰丢包与吞吐衰减日志，生成 SLA 违约监控报告。',
  `通过定时任务在本地或测试机部署自动探针守护进程，24 小时监控专线晚高峰品质：

${b3}bash
#!/usr/bin/env bash
# 专线实验室 - 24小时单流吞吐自动化采样探针
NODE_PORT=7890
TEST_URL="https://speed.cloudflare.com/__down?bytes=50000000"

while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    SPEED=$(curl -x http://127.0.0.1:$NODE_PORT -o /dev/null -s -w "%{speed_download}" "$TEST_URL" --max-time 15)
    MB_SEC=$(echo "scale=2; $SPEED / 1048576" | bc)
    echo "[$TIMESTAMP] 单流持续下载速度: $MB_SEC MB/s" >> speed_audit.log
    sleep 300
done
${b3}`
);

writeArt(
  'yt-dlp-real-chunk-download-benchmark.md',
  '通过 yt-dlp 抓取 YouTube CDN 分块下载真实码率评估节点上限',
  '利用工程分析工具 yt-dlp 抓取 YouTube 4K/8K DASH 分块直连下载，真实度量专线在主流流媒体业务下的承载极限。',
  `传统测速往往无法代表 YouTube 播放质量。使用 \`yt-dlp\` 直接对高码率视频分块执行抓取，是度量流媒体实际表现的终极标准：

${b3}bash
# 抓取 YouTube 4K 60FPS 视频单切片并统计平均码率
yt-dlp --proxy "http://127.0.0.1:7890" -f "bestvideo[height<=2160]" --test "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
${b3}
真实平稳的专线下载速度应恒定保持在 80Mbps 以上，完全消除 4K 播放频繁缓冲卡顿的风险。`
);

console.log('Batch 2: All 18 performance articles created successfully!');
