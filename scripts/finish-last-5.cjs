const fs = require('fs');
const path = require('path');

// 1. benchmark/video-streaming-8k-bitrate-jitter-audit.md
let f1 = path.join(process.cwd(), 'docs/benchmark/video-streaming-8k-bitrate-jitter-audit.md');
let c1 = fs.readFileSync(f1, 'utf8');
c1 += `

## 八、 8K 视频流媒体全天候品质审计常见问题解答 (FAQ)

### Q1: 为什么我的千兆宽带在看 YouTube 8K 时依然会频繁掉帧？
**答**：掉帧（Frame Drops）通常由两部分引起：第一是网络传输吞吐不足导致播放器缓冲区耗尽，触发被迫等待缓冲；第二是本地 GPU 缺乏对 AV1 编码的原生硬件解码支持，纯靠 CPU 软解导致渲染线程过载。可在 YouTube 播放器中右键打开【Stats for Nerds】，查看【Dropped Frames】与【Buffer Health】以明确归因。

### Q2: 专线网络如何保障 8K 视频从头到尾零卡顿？
**答**：真正的企业级 IEPL 专线在骨干传输中不经过公网排队，提供恒定 0 丢包与 < 0.2ms 的极低抖动，使 DASH 分片拉取速度始终稳定在 400-800 Mbps 的高位，确保播放器缓冲队列始终处于满格状态。
`;
fs.writeFileSync(f1, c1, 'utf8');
console.log('video-streaming-8k-bitrate-jitter-audit.md now: ' + c1.length);

// 2. zhuanxian/iepl-vs-iplc.md
let f2 = path.join(process.cwd(), 'docs/zhuanxian/iepl-vs-iplc.md');
let c2 = fs.readFileSync(f2, 'utf8');
c2 += `

## 六、 跨国数据跨境传输合规与安全自评估全景流程

在现代跨国企业组网与合规出海业务中，网络方案的选择直接关系到企业法律风险边界：
* **合规持牌专线优势**：正规的 IEPL 企业专线通过国家基础电信运营商（中国电信、中国联通、中国移动）合规报备出境通道开通，具备合法的业务专网凭证；
* **企业网络架构最佳实践**：企业内部 ERP、跨国视频会议与跨境协同系统走合规 IEPL 专线传输，保障数据在二层以太网中加密直通，彻底告别公网封锁与法律合规隐患。

---

## 七、 跨境专线物理架构与选型全景比对表

| 评估维度与技术特性 | 企业级 IEPL 专线 (推荐首选) | 经典传统 IPLC 裸纤专线 | 普通公网优化中继 |
| :--- | :--- | :--- | :--- |
| **OSI 网络分层** | **Layer 2 (以太网数据链路层)** | Layer 1 (纯物理层 SDH) | Layer 3 / Layer 4 (公网隧道) |
| **带宽弹性升级** | **软件随时定义平滑升级 (100M-10G)** | 需重新租用硬时隙，周期漫长 | 易受公网超售拥塞影响 |
| **VLAN 标签穿透** | **完整支持 802.1Q / QinQ 透传** | 需额外协议转换设备 | 不支持真实二层透传 |
| **综合性价比** | **高 (现代化主流标准)** | 极低 (成本高昂达数十万) | 低价但稳定性极差 |
`;
fs.writeFileSync(f2, c2, 'utf8');
console.log('iepl-vs-iplc.md now: ' + c2.length);

// 3. zhuanxian/sla-packet-loss.md
let f3 = path.join(process.cwd(), 'docs/zhuanxian/sla-packet-loss.md');
let c3 = fs.readFileSync(f3, 'utf8');
c3 += `

## 六、 专线合同违约赔偿标准与阶梯式惩罚公式

在正规跨国金融与企业级 IEPL 专线 SLA 合同中，运营商必须白纸黑字写入明确的不可用赔付条款：

$$\\text{赔付比例 (Service Credit)} = \\begin{cases} 
10\\% \\text{ 月费}, & 99.9\\% \\le \\text{可用性} < 99.99\\% \\\\
25\\% \\text{ 月费}, & 99.0\\% \\le \\text{可用性} < 99.9\\% \\\\
50\\% \\text{ 月费}, & 95.0\\% \\le \\text{可用性} < 99.0\\% \\\\
100\\% \\text{ 全免月费}, & \\text{可用性} < 95.0\\% 
\\end{cases}$$

### 6.1 丢包率违约惩罚细则
除了可用性中断外，真正的企业专线合同还会严密约定 **“持续丢包率阈值”**：若单月连续 15 分钟以上网络丢包率大于 0.05%，直接按故障中断时间进行折算赔付。这也是为什么廉价公网机场永远不敢承诺任何 SLA 赔偿的根本原因。

---

## 七、 专线 SLA 监控与告警自动化架构选型决策树

\`\`\`mermaid
graph TD
    A[建立专线 SLA 监控体系] --> B[部署 Prometheus + Smokeping 探针]
    B --> C[每隔 30 秒高精度连续探测香港/日本节点]
    C --> D{月度实测指标表现?}
    D -->|丢包率恒等于 0% 且 抖动 < 0.2ms| E[【卓越】完全履约 Enterprise 99.99% SLA]
    D -->|偶发丢包但立即恢复| F[【合格】符合 99.9% 商业标准]
    D -->|晚高峰频繁丢包 > 1%| G[【违约告警】调取日志启动服务商赔偿维权流程]
\`\`\`
`;
fs.writeFileSync(f3, c3, 'utf8');
console.log('sla-packet-loss.md now: ' + c3.length);

// 4. zhuanxian/bgp-entry-transit.md
let f4 = path.join(process.cwd(), 'docs/zhuanxian/bgp-entry-transit.md');
let c4 = fs.readFileSync(f4, 'utf8');
c4 += `

## 七、 BGP Anycast 真实网络路径探测排障与 MTR 追踪实战

在客户端终端中，使用 **MTR（My Traceroute）** 可以直观验证 BGP 入口与内网隧道的真实拓扑：

\`\`\`bash
# 连续发送 50 个数据包探测 BGP 入口路由跳数
mtr --report -c 50 你的专线接入域名
\`\`\`

### 7.1 真假 BGP 入口图谱比对
* **真 BGP 专线特征**：
  - 第 1 跳：本地家庭路由器网关（192.168.1.1）；
  - 第 2-4 跳：本地城域网骨干路由器；
  - 第 5 跳：直接进入华为云/腾讯云广州/上海核心 BGP 交换中心（延迟在 8-15ms 之间锁死，且 Retr 为 0）；
  - **后续跳数全部隐藏（内网隧道传输，直接由香港落地机房冒出）**！
* **假公网中转特征**：
  - 数据包在公网经过了 15 个以上的未知公网路由器跳数；
  - 晚高峰时期在第 8-10 跳出现剧烈的 20% 丢包红条，说明所谓的“专线”只是廉价公网转发。
`;
fs.writeFileSync(f4, c4, 'utf8');
console.log('bgp-entry-transit.md now: ' + c4.length);

// 5. recommend/feimao.md
let f5 = path.join(process.cwd(), 'docs/recommend/feimao.md');
let c5 = fs.readFileSync(f5, 'utf8');
c5 += `

## 七、 飞猫云 2026 年度综合横评总结与购买建议

在当今动辄月付数十上百元的网络加速市场中，**飞猫云以 7 元/月的极致平民价格与免配置的极简体验**，在学生党与日常轻量用户群体中树立了坚实的口碑：

### 7.1 核心优势回顾
1. **价格极致亲民**：年付折合仅 7 元/月（年费 84 元），一杯奶茶钱即可获得整整一年的稳定出海网络；
2. **专属客户端开箱即用**：完全免除繁琐配置，老人小孩都能一分钟轻松上手；
3. **主流流媒体与 AI 全面支持**：香港、日本、新加坡核心节点全数配置纯净商宽 IP，畅享 4K 影视与大模型对话；
4. **服务保障到位**：7x24 小时工单与 Telegram 官方交流群全天候护航。

* **立即前往飞猫云官网体验**：[点击直达飞猫云官方网站 (独家优惠码: flycat888)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
`;
fs.writeFileSync(f5, c5, 'utf8');
console.log('feimao.md now: ' + c5.length);
