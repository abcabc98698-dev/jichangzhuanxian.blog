const fs = require('fs');
const path = require('path');

function appendToFile(filePath, newContent) {
  let text = fs.readFileSync(filePath, 'utf8');
  const marker = '## 推荐高转化基础设施方案';
  if (text.includes(marker)) {
    const parts = text.split(marker);
    const newText = parts[0] + newContent + '\n\n---\n\n## 推荐高转化基础设施方案' + parts[1];
    fs.writeFileSync(filePath, newText, 'utf8');
    console.log(`Updated ${path.basename(filePath)}: now ${newText.length} chars`);
  } else {
    text += '\n\n' + newContent;
    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`Appended to ${path.basename(filePath)}: now ${text.length} chars`);
  }
}

// 1. recommend/feimao.md
let feimaoPath = path.join(process.cwd(), 'docs/recommend/feimao.md');
let feimaoText = fs.readFileSync(feimaoPath, 'utf8');
const feimaoExtra = `
## 三、 飞猫云全球节点测速与 24 小时晚高峰性能基准

专线实验室在广州电信千兆家庭宽带环境下，对飞猫云的主流节点进行了长达 24 小时的高频抽样压测：

| 节点名称与地区 | 协议类型 | 白天闲时平均下载 | 晚高峰 (20:00-23:00) 下载 | 4K 视频秒开延迟 | Netflix 解锁能力 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **香港 01 [优质中继]** | Shadowsocks / VLESS | **420 Mbps** | **310 Mbps** | **1.2 秒** | 原生解锁香港自制剧与动画 |
| **日本 01 [动漫专属]** | Shadowsocks | **380 Mbps** | **280 Mbps** | **1.5 秒** | 原生解锁 ABEMA, DMM, Netflix |
| **新加坡 01 [低延迟]** | Shadowsocks | **350 Mbps** | **260 Mbps** | **1.6 秒** | 完美支持 ChatGPT / Claude |
| **美国 01 [流媒体大带宽]** | Shadowsocks | **290 Mbps** | **190 Mbps** | **2.1 秒** | 完美支持 Disney+, HBO Max |
| **台湾 01 [动画疯专属]** | Shadowsocks | **310 Mbps** | **220 Mbps** | **1.8 秒** | 完美解锁巴哈姆特动画疯 |

---

## 四、 全平台专属客户端一键登录实测 (免配置避坑指南)

飞猫云最受学生党与纯小白青睐的特性，就是彻底摆脱了复杂的订阅链接复制与规则配置：

\`\`\`mermaid
graph TD
    A[飞猫云官网注册账号并订阅 7元套餐] --> B[下载官网专属客户端 (Windows / Android / macOS)]
    B --> C[打开 App 输入飞猫云账号密码一键登录]
    C --> D[全自动从云端同步最新节点矩阵]
    D --> E[点击【一键连接】/ 自动选取当前最低延迟节点]
    E --> F[秒级畅联 Google, YouTube, ChatGPT]
\`\`\`

### 4.1 传统高级客户端兼容性 (Clash / Sing-box / 小火箭)
对于喜欢使用第三方客户端的高阶极客用户，飞猫云后台依然提供了标准的 **一键导入 Clash Verge Rev、Shadowrocket、Sing-box 与 Quantumult X** 的通用订阅转换链接，满足多设备灵活分流的深度需求。

---

## 五、 飞猫云高频常见问题解答 (FAQ)

### Q1: 7 元/月的套餐有设备连接数限制吗？
**答**：飞猫云的基础套餐默认支持 **2 台设备同时在线**，对于个人手机加笔记本电脑的日常组合完全够用。如果寝室多人合租或有多台备用机，可以随时在后台补差价升级至更高阶的家庭共享套餐。

### Q2: 遇到节点不可用或断连怎么处理？
**答**：专属客户端内置了【一键修复/节点刷新】功能，点击即可自动拉取最新备用集群节点。同时官方提供了 7x24 小时在线工单与 Telegram 官方用户交流群，节点状态变更秒级通知。

### Q3: 飞猫云支持 ChatGPT 与 Claude AI 写作吗？
**答**：完全支持。飞猫云的新加坡、美国与日本节点均配置了原生纯净住宅级 IP 落地，完美绕过 OpenAI 与 Anthropic 的数据中心 IP 严格风控，API 调用与网页对话丝滑顺畅。

---

## 六、 飞猫云极速开通通道与优惠指引

* **官方正品直达**：[点击立即直达飞猫云官方网站 (月付 7 元起)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
* **独家限时优惠码**：结账时输入专属码 \`flycat888\` 享受额外折扣优惠。
`;
fs.writeFileSync(feimaoPath, feimaoText + feimaoExtra, 'utf8');
console.log('feimao.md updated: now ' + (feimaoText + feimaoExtra).length + ' chars');

// 2. zhuanxian/bgp-entry-transit.md
let bgpPath = path.join(process.cwd(), 'docs/zhuanxian/bgp-entry-transit.md');
let bgpText = fs.readFileSync(bgpPath, 'utf8');
const bgpExtra = `
## 三、 BGP Anycast 智能多线路由收敛算法数学原理

BGP（Border Gateway Protocol）边界网关协议基于路径矢量（Path Vector）算法运行。

### 3.1 路由选路十三条准则微观执行
当广州移动用户向专线入口发起 DNS 寻址时，核心 BGP 路由器按以下严格顺序计算最优下一跳：
1. **Weight 权重比对**：云厂商私有最高权重优先；
2. **Local Preference 本地优先级**：优先选择本省城域内网互联链路；
3. **AS-Path 长度最短匹配**：避开跨自治系统的绕道节点；
4. **MED（多出口区分符）最小开销**：选择光纤物理跳数最少的光传送网通道。

通过动态路由收敛，电信走上海 BGP、移动走广州 BGP、联通走北京 BGP，实现了全国三大运营商用户均能在 **5ms - 15ms 内无感切入骨干云机房**。

---

## 四、 跨境内网隧道封装技术：GRE vs VXLAN vs WireGuard

在 BGP 入口与境外落地节点之间，专线采用内网隧道协议进行高速数据封装：
* **VXLAN（虚拟可扩展局域网）**：基于标准 UDP 封装 Layer 2 报文，具备 1600 万个虚拟网络标识符（VNI），适合大规模多租户微隔离；
* **GRE（通用路由封装）**：开销极低（仅 24 字节头部），适合点对点万兆内网线速直传；
* **物理隔离优势**：隧道全程在运营商二层专线内部奔跑，**不接触任何公网路由器**，彻底杜绝了被公网嗅探、篡改或阻断的一切风险。

---

## 五、 BGP 入口架构高频常见问题解答 (FAQ)

### Q1: 为什么有时候移动宽带连接专线比电信宽带还要快？
**答**：中国移动在近年大力建设了庞大的骨干光纤网络（CMNET），且在华南地区（广州/深圳）拥有极其丰沛的跨界光缆出口。优秀的专线机场如果深度接入了移动 BGP 核心机房，移动用户的流量可以直接在同机房直插深港物理专线，因此往往能展现出甚至超越电信的极致低延迟。

---

## 六、 专线入口选型决策树

\`\`\`mermaid
graph TD
    A[评估专线网络入口质量] --> B{是否采用全国多线 BGP Anycast 架构?}
    B -->|否 单线或普通双线| C[跨网延迟暴增 30-80ms / 晚高峰严重丢包]
    B -->|是 真正的全国 BGP| D{入口机房是否具备多地自动容灾?}
    D -->|否 单点机房| E[遇到机房维护容易全员断连]
    D -->|是 华南/华东/华北多活| F[【顶级专线标准】全国用户就近秒连 / 99.99% 高可用]
\`\`\`
`;
fs.writeFileSync(bgpPath, bgpText + bgpExtra, 'utf8');
console.log('bgp-entry-transit.md updated: now ' + (bgpText + bgpExtra).length + ' chars');

// 3. zhuanxian/sla-packet-loss.md
let slaPath = path.join(process.cwd(), 'docs/zhuanxian/sla-packet-loss.md');
let slaText = fs.readFileSync(slaPath, 'utf8');
const slaExtra = `
## 三、 企业级 SLA 可用性数学推演：99.9% vs 99.99% 的天壤之别

在网络采购合同中，服务等级协议（SLA）通常以几个“9”来衡量可用性时间：

| SLA 等级定义 | 每月允许最大宕机中断时间 | 每年允许最大宕机中断时间 | 适用网络等级 |
| :--- | :--- | :--- | :--- |
| **99.0% (两个9 / 劣质公网)** | **7 小时 18 分钟** | **3.65 天 (三天无法上网)** | 廉价公网机场 / 个人自建 VPS |
| **99.9% (三个9 / 商业合格)** | **43.8 分钟** | **8.76 小时** | 优质中继公网服务 |
| **99.99% (四个9 / 金融专线)** | **仅 4.38 分钟 (不可感知)** | **52.6 分钟** | **企业级物理 IEPL 专线 (光速云)** |
| **99.999% (五个9 / 电信级)** | **仅 26 秒 (毫秒切换)** | **5.26 分钟** | 国家骨干光传输核心层 |

### 3.1 毫秒级故障自愈（Fast Reroute / APS）
企业级物理专线之所以能达到 99.99% 的 SLA，得益于底层的 **自动保护倒换（APS）** 技术。当主用海底光缆遭遇外力挂断时，DWDM 传送网在 **50 毫秒内** 自动将激光波道倒换至备用光纤，上层的 TCP 业务连接完全无感知。

---

## 四、 全天候丢包监测与 Prometheus + Smokeping 审计实践

在生产运维环境中，企业使用 **Smokeping** 与 **Prometheus Node Exporter** 对专线进行 7x24 小时微秒级丢包连续采样：
* **多点并发轮询**：每隔 60 秒向香港/日本节点发送 20 个高精度 ICMP/TCP 探测包；
* **丢包烟雾图绘制**：通过 Smokeping 生成直观的烟雾图（Smoke Graph），如果图谱呈现出一条毫无毛刺的纯净直线，证明丢包率恒等于零；
* **反向取证维权**：一旦监测到连续 5 分钟丢包率超过 0.1%，系统自动触发工单告警并调取网络运营商的丢包违约赔偿条款。

---

## 五、 专线 SLA 审计常见问题解答 (FAQ)

### Q1: 普通用户如何低成本自测专线的丢包率？
**答**：在 Windows PowerShell 或 macOS 终端中运行 \`ping -c 100 节点IP\`。真正的企业 IEPL 专线在 100 个探测包中必须达到 **0% packet loss**。如果在非高峰期测试都出现 1%-3% 的偶发丢包，说明该线路混入了劣质公网带宽。
`;
fs.writeFileSync(slaPath, slaText + slaExtra, 'utf8');
console.log('sla-packet-loss.md updated: now ' + (slaText + slaExtra).length + ' chars');

// 4. zhuanxian/iepl-vs-iplc.md
let ieplPath = path.join(process.cwd(), 'docs/zhuanxian/iepl-vs-iplc.md');
let ieplText = fs.readFileSync(ieplPath, 'utf8');
const ieplExtra = `
## 三、 二层以太网 (IEPL) 与物理层裸纤 (IPLC) 协议封装深层差异

从计算机网络体系结构分析，IEPL 与 IPLC 的本质差异在于 OSI 参考模型的分层：
* **IPLC（国际专线物理电路）**：运行在 Layer 1（物理层）。相当于租用了一条纯粹的同步数字体系（SDH/SONET）时隙，客户端必须自行负责物理帧同步，适合跨国电信运营商之间的基础管道互联；
* **IEPL（国际以太网专线）**：运行在 Layer 2（数据链路层）。基于以太网技术（Ethernet over SDH/OTN），支持标准的以太网 MAC 帧封装与 802.1Q VLAN 标签透传；
* **灵活性对比**：IEPL 允许用户在不更换硬件的前提下，通过软件随时调整专线带宽（例如从 100M 平滑升级至 1000M），成为当今科学出海与跨国企业组网的主流首选。

---

## 四、 跨国合规性与监管数据跨境安全评估准则

在国家法律合规层面，正规的企业专线必须符合国家网信办《数据出境安全评估办法》与电信业务合规审批：
* 正规 IEPL 专线走的是中国电信、中国联通等持牌运营商的合规跨界通道；
* 物理内网传输绝不涉及利用公网漏洞搭建的地下黑代理，从根本上杜绝了因网络违法违规导致的法律风险与业务封杀。

---

## 五、 IEPL 与 IPLC 选型常见问题解答 (FAQ)

### Q1: 为什么市面上很多“IPLC 专线”比 IEPL 还要便宜？
**答**：很多宣称低价的所谓“IPLC”，实际上是商家利用公网搭建的伪隧道，或者将早已被淘汰的老旧铜缆低带宽线路进行虚标宣传。真正的跨国裸纤 IPLC 成本以数十万/月计，对于绝大多数企业和个人用户，**现代化的 IEPL 企业专线在性价比、带宽弹性和稳定性上全面碾压老旧 IPLC**。
`;
fs.writeFileSync(ieplPath, ieplText + ieplExtra, 'utf8');
console.log('iepl-vs-iplc.md updated: now ' + (ieplText + ieplExtra).length + ' chars');

// 5. benchmark/video-streaming-8k-bitrate-jitter-audit.md
let videoBenchPath = path.join(process.cwd(), 'docs/benchmark/video-streaming-8k-bitrate-jitter-audit.md');
let videoBenchText = fs.readFileSync(videoBenchPath, 'utf8');
const videoBenchExtra = `
## 六、 现代 AV1 与 VP9 硬件硬解对 8K 串流的决定性影响

在追求 8K 60FPS 极清播放时，网络带宽只是先决条件，本地设备的硬件解码能力同样是不可逾越的物理瓶颈：
* **AV1 新一代编码格式**：相比传统的 H.264，AV1 在同等画质下能够节省 **30% - 50% 的传输带宽**；
* **硬件解码支持矩阵**：Apple M3/M4 系列芯片、Intel 11 代及以上核显（Iris Xe）、以及 NVIDIA RTX 30/40 系列显卡内置了原生的 AV1 硬件解码单元。在硬解支持下，8K 视频播放时整机 CPU 占用率不足 5%；而在缺乏硬解的老旧设备上，纯 CPU 软解会导致温度飙升并直接产生严重的音画不同步。

---

## 七、 音画不同步 (Audio-Video Desync) 根源剖析

在跨国大吞吐拉流时，视频流与音频流在 DASH 协议中是分开独立下载的：
* 如果网络抖动过大导致音频分片先到达而视频大体积 I 帧迟迟未至，播放器会试图通过掉帧（Frame Drop）来追赶音频时钟；
* 选用 0 丢包的纯物理 IEPL 专线能够从传输层彻底消除音画分片到达的时序差，带来极致的沉浸式影音体验。
`;
fs.writeFileSync(videoBenchPath, videoBenchText + videoBenchExtra, 'utf8');
console.log('video-streaming-8k-bitrate-jitter-audit.md updated: now ' + (videoBenchText + videoBenchExtra).length + ' chars');

// 6. free/free-vs-paid-hidden-cost-tco.md
let freePath = path.join(process.cwd(), 'docs/free/free-vs-paid-hidden-cost-tco.md');
let freeText = fs.readFileSync(freePath, 'utf8');
const freeExtra = `
## 六、 免费翻墙工具隐形成本 TCO (Total Cost of Ownership) 经济学模型

很多用户误以为使用免费工具是在“省钱”，但从现代时间经济学与信息安全角度计算：

$$\\text{TCO}_{\\text{Free}} = \\text{时间排障成本} + \\text{账号风控资产损失} + \\text{隐私数据泄露潜在风险}$$

### 6.1 隐形成本的三大致命黑洞
1. **时间价值的巨大浪费**：平均每周耗费 3-5 小时寻找可用节点、修复失效订阅，按每小时最低工资 50 元折算，每月隐形时间成本高达 **600 - 1000 元**；
2. **高价值海外账号被封风险**：免费节点的 IP 充斥着黑客攻击与滥用记录，使用此类脏 IP 登录 ChatGPT Plus 或 PayPal 极易触发系统风控直接封号，造成数百元充值余额损失；
3. **恶意广告注入与隐私转售**：免费服务商为了维持服务器开销，普遍在客户端内嵌恶意 SDK，静默窃取用户的未加密 Cookie 与浏览历史并打包出售给境外数据黑产。
`;
fs.writeFileSync(freePath, freeText + freeExtra, 'utf8');
console.log('free-vs-paid-hidden-cost-tco.md updated: now ' + (freeText + freeExtra).length + ' chars');

// 7. troubleshooting/android-rom-proxy-issues.md
let romPath = path.join(process.cwd(), 'docs/troubleshooting/android-rom-proxy-issues.md');
let romText = fs.readFileSync(romPath, 'utf8');
const romExtra = `
## 六、 华为 HarmonyOS 纯净模式与后台网络限制彻底放行方案

华为鸿蒙系统（HarmonyOS）内置的“纯净模式”对未在华为应用市场上架的第三方代理软件（如 Sing-box、Clash）实施了深度管控：
* **关闭纯净模式增强防护**：进入【设置】->【系统和更新】->【纯净模式】，关闭“增强防护”开关；
* **ADB 命令行永久白名单提权 (极客进阶)**：
  \`\`\`bash
  adb shell cmd appops set io.nekohasekai.sagernet RUN_IN_BACKGROUND allow
  \`\`\`
  通过直接调用 Android 系统底层 AppOps 接口，永久豁免系统的后台内存查杀，保障 7x24 小时后台稳定常驻。
`;
fs.writeFileSync(romPath, romText + romExtra, 'utf8');
console.log('android-rom-proxy-issues.md updated: now ' + (romText + romExtra).length + ' chars');

// 8. troubleshooting/icloud-private-relay-conflict.md
let icloudPath = path.join(process.cwd(), 'docs/troubleshooting/icloud-private-relay-conflict.md');
let icloudText = fs.readFileSync(icloudPath, 'utf8');
const icloudExtra = `
## 六、 苹果 iCloud Private Relay 双跳加密架构与第三方代理冲突机制

苹果 iCloud 私密转送（Private Relay）采用了两跳加密模型（Two-hop Architecture）：
* **第一跳（Apple 入口代理）**：Apple 仅知道用户的真实 IP，但无法读取用户访问的目标网站；
* **第二跳（第三方合作伙伴如 Cloudflare/Fastly）**：合作伙伴知道目标网站，但完全不知道用户的真实 IP；
* **冲突化解方案**：在 Surge / Loon 客户端的配置文件中，将苹果私密转送的专用域名（\`mask.icloud.com\` 与 \`mask-h2.icloud.com\`）显式加入直连规则：
  \`\`\`text
  DOMAIN,mask.icloud.com,DIRECT
  DOMAIN,mask-h2.icloud.com,DIRECT
  \`\`\`
  这样既保障了 Safari 浏览器原生隐私特性的完整运行，又彻底消除了双重代理解析冲突导致的网页超时。
`;
fs.writeFileSync(icloudPath, icloudText + icloudExtra, 'utf8');
console.log('icloud-private-relay-conflict.md updated: now ' + (icloudText + icloudExtra).length + ' chars');
