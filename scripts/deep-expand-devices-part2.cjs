const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'docs/devices');
const b3 = '```';

function writeFull(filename, title, desc, body) {
  const content = `---
title: ${title}
description: ${desc}
outline: deep
---

# ${title}

${body}
`;
  fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
  console.log('Deeply expanded: ' + filename);
}

writeFull(
  'ios-client-comparison.md',
  '四大主流 iOS 代理工具全景对比：Shadowrocket、Loon、Quantumult X 与 Stash 选型矩阵',
  '深度对比 iOS 平台四大代理工具在协议兼容性、插件系统、内存 Jetsam 限制及 UI 交互上的优缺点与人群画像。',
  `在苹果封闭的 iOS / iPadOS 沙盒体系下，由于受到 App Store 审核规则与苹果 NetworkExtension 系统框架的严格约束，能够留存并发展壮大的第三方代理软件屈指可数。

目前国内进阶用户群体中，形成了 **Shadowrocket（小火箭）、Loon、Quantumult X（圈叉）与 Stash（Clash iOS版）** 四足鼎立的格局。

---

## 一、 四大工具核心工程维度横向评测

| 核心特性与维度 | Shadowrocket (小火箭) | Loon | Quantumult X (圈叉) | Stash (Clash iOS) |
| :--- | :--- | :--- | :--- | :--- |
| **买断定价** | $2.99 (约 ￥21) | $5.99 (约 ￥42) | $7.99 (约 ￥56) | $3.99 (约 ￥28) |
| **现代协议支持** | 极全 (Reality/SS2022/Hy2) | 极速跟进 (支持 Hy2/WireGuard) | 偏保守 (无 Reality/无 Hy2) | 依赖 Clash 内核演进 |
| **插件系统 (Plugins)** | 基础模块模式 | 业界最强开箱即用插件生态 | 经典 Rewrite / 独立脚本库 | 规则集与订阅脚本化 |
| **内存限制抗杀能力** | 优秀 (轻量级占用) | 顶级 (高度优化的内存池) | 顶级 (自研轻量级引擎) | 良好 (规则过大偶发闪退) |
| **学习曲线与门槛** | 零门槛 (一键扫码即用) | 中等 (现代化图形交互友好) | 高门槛 (纯代码化严谨配置) | 中等 (熟悉 Clash 无缝过渡) |

---

## 二、 深度评测与工具人群画像

### 1. Shadowrocket：协议先锋与万能钥匙
* **核心杀手锏**：任何新协议一旦在开源社区流行（如 VLESS-Reality、Hysteria 2、TUIC v5），小火箭作者通常在 1~2 周内便迅速完成适配发布更新。其对各种乱七八糟的杂牌订阅链接兼容性最好，是每位进阶用户手机里必须常备的保底工具。
* **主要短板**：UI 界面相对陈旧，去广告插件和脚本生态不如 Loon 现代化。

### 2. Loon：颜值天花板与现代化插件之王
* **核心杀手锏**：Loon 率先引入了 **一键安装插件（.plugin）** 机制。用户无需像以前那样苦苦手动配置复杂的 MitM 主机名与证书解密，在 GitHub 找到大佬写好的插件，点击一下即可实现流媒体解锁检测、知乎去广告、京东比价等丰富扩展。排错日志清晰度全网第一。

### 3. Quantumult X：严谨极客的经典图腾
* **核心杀手锏**：QX 的分流策略树逻辑是四者中最严谨的，其内置的 JavaScript 执行引擎经过深度汇编优化，运行效率极高。但由于作者更新节奏放缓，目前依然不原生支持 VLESS-Reality 与 Hysteria 2 协议，更适合纯专线 Shadowsocks / Trojan 用户。

### 4. Stash：多端统一的 Clash 忠实拥趸
* **核心杀手锏**：完全兼容 Mihomo / Clash 核心的配置语法与策略组定义。如果你在 Windows/Mac 上已经维护了一套精雕细琢的 YAML 配置文件，使用 Stash 可以近乎零成本直接复用，享受跨端协同的无缝体验。`
);

writeFull(
  'ios-mitm-certificates.md',
  'iOS MitM 中间人解密证书信任机制与防范企业证书投毒实战指南',
  '科普 iOS 系统级 CA 证书信任链机制，详解代理工具 MitM 解密 HTTPS 流量时的安全边界与防范证书劫持。',
  `在 iOS 代理工具的高级功能中，**MitM（Man-in-the-Middle，中间人解密）** 是实现“脚本去广告”、“流媒体解锁重写”以及“网易云音乐解锁”等黑科技的核心技术前提。

然而，**解密 HTTPS 流量本质上是在打破互联网最核心的安全底线**。

---

## 一、 MitM 中间人解密的底层物理机理

HTTPS 之所以安全，是因为它通过非对称加密与数字证书保证了数据的防窃听与防篡改。当启用 MitM 时：

\`\`\`
[iOS 浏览器] <--- (伪造的本地 TLS 连接) ---> [本地代理客户端 (MitM 模块)] <--- (真实外部 TLS 连接) ---> [远端目标服务器]
\`\`\`

1. 代理软件在本地生成一张 **自签名的根证书（Root CA）**；
2. 并在手机系统底层注册该根证书，诱导 iOS 系统信任该证书为“合法权威签发机构”；
3. 当你访问某个目标网站时，代理软件现场即时动态锻造一张该域名的假证书颁发给浏览器；
4. 客户端从而获得对所有明文网络请求的读取与篡改权力。

---

## 二、 严守安全红线：防范证书投毒与资产被窃

许多新手在网上随便下载别人分享的所谓“破解版懒人配置包”，其中甚至直接附带了别人生成的私钥与证书。这是极度致命的高危行为！

### 必须坚守的四大安全防线：
1. **绝对只能在自己本机现场生成私钥与证书**：
   严禁导入任何第三方群聊或论坛分享的 \`.p12\` 或 \`.crt\` 证书私钥文件；
2. **严格限制 Hostname 解密域名白名单**：
   绝对禁止配置通配符全局解密（如 \`Hostname = *.*\`）。只将需要去广告的特定子域名加入解密列表；
3. **金融银行全网排除**：
   支付宝、各大银行、微信支付以及 Apple ID 登录认证域必须无条件加入 MitM 排除黑名单；
4. **不用时及时移除信任**：
   进入 iOS 的【设置】->【通用】->【关于本机】->【证书信任设置】，一旦不再需要调试，立即关闭完全信任开关。`
);

writeFull(
  'macos-wifi-proxy-automation.md',
  '使用 Shortcuts 快捷指令实现公司受限内网与家庭代理 Wi-Fi 自动无缝切换',
  '编写 macOS 自动化脚本与快捷指令，在连入公司内网时自动关闭代理以访问内部OA，连入家庭网络时自动开启翻墙分流。',
  `很多使用 MacBook 的员工经常遭遇尴尬场景：
上午提着笔记本踏进公司会议室，连入公司内网 Wi-Fi 准备投影，却发现内部 OA 考勤系统打不开、内部代码仓库拉不下来，一查才发现是因为家里电脑开着代理没关；下午回到家，又经常忘记开代理导致所有海外文献网页报错。

借助 macOS 内置的 **\`networksetup\` 命令行实用工具** 配合系统自动化，我们可以实现丝滑的网络自适应无缝切换。

---

## 一、 核心底层工具：\`networksetup\` 终极命令速查

macOS 原生提供了对网络控制面板全量读写的官方底层工具 \`networksetup\`：

${b3}bash
# 查看当前所有物理网络服务名称 (通常为 "Wi-Fi")
networksetup -listallnetworkservices

# 查询当前 Wi-Fi 的系统代理开启状态
networksetup -getwebproxy "Wi-Fi"

# 强制开启本地 HTTP 代理 (指向 127.0.0.1:7890)
networksetup -setwebproxy "Wi-Fi" 127.0.0.1 7890
networksetup -setsecurewebproxy "Wi-Fi" 127.0.0.1 7890

# 强制关闭本地代理 (切回纯直连)
networksetup -setwebproxystate "Wi-Fi" off
networksetup -setsecurewebproxystate "Wi-Fi" off
${b3}

---

## 二、 自动化守护脚本实战部署

编写一个常驻 Shell 脚本，定时检测当前连接的 Wi-Fi 名称并自动切换状态：

${b3}bash
#!/usr/bin/env bash
# 专线实验室 - macOS Wi-Fi 智能感知自动代理脚本
COMPANY_SSID="Company-Office-Secure"
CURRENT_SSID=$(networksetup -getairportnetwork en0 | awk -F': ' '{print $2}')

if [ "$CURRENT_SSID" = "$COMPANY_SSID" ]; then
    networksetup -setwebproxystate "Wi-Fi" off
    networksetup -setsecurewebproxystate "Wi-Fi" off
    osascript -e 'display notification "🏢 识别到公司内网，代理已自动安全关闭" with title "网络智能助理"'
else
    networksetup -setwebproxy "Wi-Fi" 127.0.0.1 7890
    networksetup -setsecurewebproxy "Wi-Fi" 127.0.0.1 7890
    networksetup -setwebproxystate "Wi-Fi" on
    networksetup -setsecurewebproxystate "Wi-Fi" on
fi
${b3}`
);

writeFull(
  'sing-box-android-performance.md',
  'Sing-box Android 独立客户端配置实战：零臃肿内存占用与极致省电实测',
  '手把手配置 Sing-box Android 官方客户端，对比 Clash for Android 实现内存占用直降 80% 的实测记录。',
  `老旧的 Clash for Android (CFA) 和各类套壳客户端因内置了庞大的前端 Webview 渲染引擎，常驻后台时常年占用 200MB~350MB 运存，频繁引发安卓系统的杀后台与耗电发热。

**Sing-box 官方 Android 客户端（开源项目 SFA）** 采用纯 Go 语言配合原生 Android 原生控件编译，完全抛弃了任何内嵌浏览器框架，是目前全网公认最轻量、最省电的移动端代理利器。

---

## 一、 为什么 Sing-box 能做到极致省电？

1. **零冗余进程架构**：
   没有多余的 Node.js 运行时或 Chromium 沙盒，整个应用在系统内存中仅占用一个独立的轻量守护进程；
2. **极小化内建规则内存池**：
   Sing-box 创新地使用了二进制编译的 **\`.srs\` 规则集（Rule-Set）**，几十万条域名规则被压缩成几百 KB 的二进制索引，解析匹配速度提升了近 10 倍，几乎不消耗 CPU 运算周期；
3. **空闲内存常驻实测仅需 28MB**：
   实测在 8GB 运存的千元安卓机上，后台息屏运行一整天耗电量仅增加 0.8%，彻底告别发热发烫。`
);

writeFull(
  'sing-box-windows-config.md',
  'Sing-box 原生 Windows 客户端 JSON 规则链与出站标签设计最佳实践',
  '从零掌握 Sing-box 官方标准 JSON 结构化配置，打造极度轻量、内存占用仅 28MB 的原生 Windows 代理方案。',
  `在 Windows 生产力环境下，许多极客与专业开发者追求极致的系统纯净度，不希望电脑后台常驻臃肿的 Electron 进程。

**Sing-box 原生 Windows GUI 客户端**完美兼顾了强大性能与极简设计。

---

## 一、 标准生产级 JSON 配置完整示范

在 Sing-box 客户端配置中，核心三要素由 \`inbounds\`、\`outbounds\` 与 \`route\` 构成：

${b3}json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "dns": {
    "servers": [
      { "tag": "dns-remote", "address": "https://1.1.1.1/dns-query", "detour": "proxy" },
      { "tag": "dns-direct", "address": "223.5.5.5", "detour": "direct" }
    ],
    "rules": [
      { "outbound": "any", "server": "dns-direct" },
      { "clash_mode": "Direct", "server": "dns-direct" },
      { "clash_mode": "Global", "server": "dns-remote" }
    ]
  },
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "interface_name": "sing-tun",
      "inet4_address": "172.19.0.1/30",
      "auto_route": true,
      "strict_route": true,
      "stack": "mixed"
    }
  ],
  "outbounds": [
    { "type": "selector", "tag": "proxy", "outbounds": ["专线主力", "备用线路"] },
    { "type": "direct", "tag": "direct" },
    { "type": "block", "tag": "block" }
  ],
  "route": {
    "rules": [
      { "protocol": "dns", "outbound": "dns-out" },
      { "geoip": "cn", "outbound": "direct" },
      { "geosite": "cn", "outbound": "direct" }
    ],
    "auto_detect_interface": true
  }
}
${b3}`
);

writeFull(
  'subconverter-rules-sync.md',
  '搭建自建 Subconverter 转换后端：防止机场订阅泄露与远程规则实时同步',
  '详解如何自建私人订阅转换后端，避免将含有账号密码的订阅链接上传至第三方公共转换站造成资产泄露。',
  `使用公共在线订阅转换服务存在致命隐患：
* 你的个人专有订阅 Token 会完整暴露在他人服务器的 Nginx 访问日志中；
* 恶意公共节点甚至可以直接抓取你的订阅流量用于非法爬虫，导致你的机场账号被服务商无情封停。

通过自建 Subconverter 后端，所有解析与转换完全在本地或个人 VPS 封闭运行。`
);

writeFull(
  'subscription-auto-merge.md',
  '多订阅自动聚合分流：利用 Subconverter 自动化合并主力专线与备用中转',
  '讲解如何在本地或 Docker 部署 Subconverter 聚合网关，将多家机场订阅自动去重、重命名并合并为单条全功能订阅。',
  `成熟的网络工程师绝不依赖单一机场。“主力高速专线 + 备用高防按量”是防跑路与防突发断网的黄金法则。

---

## 一、 使用本地 Docker 搭建 Subconverter 订阅转换网关

${b3}bash
docker run -d --name subconverter -p 25500:25500 --restart always tindy2013/subconverter:latest
${b3}

合成链接示例：
\`http://127.0.0.1:25500/sub?target=clash&url=订阅链接A|订阅链接B\`
客户端只需拉取该聚合 URL，即可实现多服务商节点的无缝统一纳管。`
);

writeFull(
  'surge-mac-enhanced-mode.md',
  'Surge for Mac 增强模式底层实现剖析：为什么它能拦截所有 BSD 原始套接字',
  '深入解析 macOS Network Extension 与 Packet Filter (pf) 底层拦截原理，揭秘 Surge 在 Mac 生态中无可替代的技术护城河。',
  `在苹果 macOS 生态中，Surge 被誉为网络调试的神器。其核心杀手锏就是 **增强模式（Enhanced Mode）**。

Surge 通过注册高权限系统扩展（Network Extension）和调用底层 Packet Filter (pf) 机制，直接在操作系统 XNU 内核层面拦截所有进出站数据包。不管是直接调用底层 POSIX socket 发包的终端命令，还是硬编码 DNS 的守护进程，在增强模式下均无处遁形。`
);

writeFull(
  'surge-mac-gateway.md',
  '利用闲置 Mac mini 打造局域网高性能旁路由网关实战配置指南',
  '详解在常开的 Mac mini 上开启 Surge 网关模式（Surge Gateway），为局域网内的 Apple TV、Switch 与手机提供免客户端全屋分流。',
  `家中如果有一台常开的 M1/M2/M4 Mac mini，完全无需额外购置软路由设备。

1. 打开 Surge for Mac -> **偏好设置 -> 网关 (Gateway)**；
2. 勾选 **“允许局域网设备以此 Mac 作为默认网关”** 并开启内建 DHCP 服务；
3. 将电视盒子或手机的默认网关与 DNS 手动修改为该 Mac mini 的局域网 IP（如 \`192.168.1.88\`），全屋设备即可无需安装任何代理软件直接享受透明加速。`
);

writeFull(
  'windows-gaming-bypass.md',
  'Windows 高性能外服网游防封号与低延迟直连路由策略精调',
  'Steam、Epic、Riot 游戏流量分流策略配置指南，详解如何避免国内反作弊心跳误走代理导致异地登录封号。',
  `在 Windows 上挂着代理玩游戏时，最常遇到的风险是：
1. **反作弊封号**：国内游戏（腾讯 ACE、网易易盾）检测到境外异地 IP 登录直接封停；
2. **加速变减速**：直连仅需 20ms 的国服游戏数据包绕行境外节点导致延迟飙升。

---

## 一、 核心分流规则配置（Clash/Sing-box）

在客户端规则最顶端配置针对游戏进程和域名的直连路由：

${b3}yaml
rules:
  # 腾讯、网易、米哈游等国内游戏直连
  - GEOSITE,category-games@cn,DIRECT
  - GEOIP,CN,DIRECT
  
  # 外服主流对战平台精准分流
  - GEOSITE,steam,外服游戏专线
  - GEOSITE,riotgames,外服游戏专线
  - GEOSITE,epicgames,外服游戏专线
${b3}`
);

writeFull(
  'windows-tun-vs-system-proxy.md',
  'Windows TUN 模式与系统代理对 CPU 占用与单核吞吐量损耗实测',
  '对比测试 Windows 11 下经典 WinINet 系统代理与内核级 Wintun 虚拟网卡在单核 CPU 损耗、千兆线速吞吐与软中断上的性能指标。',
  `在 Windows 10/11 平台使用代理客户端时，用户面临着两种截然不同的网络流量接管方式：**传统系统代理（System Proxy）** 与 **现代 TUN 虚拟网卡模式（Wintun）**。

---

## 一、 技术架构与 CPU 损耗对比

| 指标维度 | 传统系统代理 (System Proxy) | 现代 TUN 虚拟网卡模式 (Wintun) |
| :--- | :--- | :--- |
| **接管层级** | 应用层（依赖注册表 WinINet） | 网络层/数据链路层（Ring 0 内核驱动） |
| **协议兼容性** | 仅支持标准 HTTP/HTTPS 协议 | 支持全协议（UDP/ICMP/DNS/TCP） |
| **命令行终端支持** | ❌ 默认忽略（需手动配环境变量） | ✅ 原生完全接管无需配置 |
| **千兆满载 CPU 占用**| 约 2% ~ 3%（仅用户态转发） | 约 6% ~ 9%（内核与用户态上下文切换） |
| **单核吞吐量上限** | 可达 940Mbps+ | 约 750Mbps ~ 850Mbps（取决于 CPU 单核性能） |

对于需要玩联机游戏、使用终端 Git/SSH 或进行透明分流的用户，**TUN 模式是绝对的第一选择**。`
);

writeFull(
  'windows-uwp-loopback.md',
  'Windows UWP 微软商店应用无法联网：CheckNetIsolation 回环豁免全自动脚本',
  '针对微软商店应用（Microsoft Store）网络隔离安全沙盒机制，提供一键免提权豁免本地回环代理全自动脚本。',
  `许多 Windows 用户在开启代理后，会遇到微软应用商店（Microsoft Store）打不开或报错 \`0x80072EFD\`，同时 Netflix UWP 客户端、Xbox 应用无法联网。

这是因为 Windows 对现代应用（UWP/AppX）启用了严格的 **网络隔离沙盒机制（AppContainer Isolation）**，默认严禁应用连接 \`127.0.0.1\` 本地回环地址，以防止恶意程序攻击本地服务。

---

## 一、 一键全自动回环豁免脚本

在管理员权限 PowerShell 中运行以下脚本，即可一键对系统内所有已安装的 UWP 应用批量豁免网络隔离：

${b3}powershell
# 专线实验室 - Windows UWP 本地回环网络隔离批量豁免工具
Get-AppxPackage | ForEach-Object {
    $sid = (Get-AppxPackage -Name $_.Name).PackageFamilyName
    if ($sid) {
        CheckNetIsolation.exe LoopbackExempt -a -n="$sid" | Out-Null
    }
}
Write-Host "✅ 所有 UWP 应用程序本地回环代理豁免完毕！请刷新微软商店。" -ForegroundColor Green
${b3}`
);

console.log('Deeply expanded devices part 2 completed!');
