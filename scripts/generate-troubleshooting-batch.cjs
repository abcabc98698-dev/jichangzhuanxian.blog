const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'docs/troubleshooting');

const articles = [
  {
    filename: 'windows-tun-driver-fix.md',
    title: 'Clash Verge Rev 常见 Wintun 虚拟网卡安装失败与服务残留彻底清理指南',
    desc: '系统化排查 Windows 环境下 Wintun 驱动冲突、服务残留与系统错误代码，提供全自动批处理清理脚本与手动救砖流程。',
    content: `对于使用 Clash Verge Rev、Sing-box 或 v2rayN 等现代代理工具的 Windows 用户，**TUN 虚拟网卡模式（基于 WireGuard Wintun 驱动）**是实现全系统应用无感透明接管的核心基石。

然而，在 Windows 10/11 频繁的系统更新、杀毒软件（如 360、火绒、Defender）拦截，或客户端非正常强退时，用户经常会遭遇 **“开启 TUN 失败”、“无法安装 Wintun 驱动” 或错误代码 0x80070005**。

---

## 一、 Wintun 驱动故障的微观成因

### 1. 驱动注册残留与句柄死锁
当 Clash Verge Rev 在未完全释放 Wintun 设备句柄时崩溃或被强制任务管理器杀进程，Windows 内核设备对象树仍保持对 \`\\Device\\Wintun\` 的独占占用。再次启动客户端尝试创建虚拟网卡时，内核直接拒绝分配重复名称的适配器。

### 2. 第三方杀毒软件静默拦截 INF 驱动注册
Windows 驱动程序强制签名策略要求所有内核模式驱动必须拥有合法的数字签名。部分精简版系统或安全卫士会将 Wintun 的动态服务注册（\`Service Control Manager\` 创建 \`wintun\` 服务）判定为后门注入，导致驱动安装直接返回失败。

---

## 二、 终极解决方案：一键完全清理批处理脚本

在管理员权限终端（PowerShell 或 CMD）中运行以下指令，可彻底清除所有受损的 Wintun 适配器与注册表垃圾：

\`\`\`bat
@echo off
echo ===================================================
echo     专线实验室 - Wintun 虚拟网卡底层残留清理工具
echo ===================================================

:: 1. 强制终止所有相关代理进程
taskkill /f /im clash-verge.exe >nul 2>&1
taskkill /f /im mihomo.exe >nul 2>&1
taskkill /f /im sing-box.exe >nul 2>&1

:: 2. 停止并删除内核驱动服务
net stop wintun >nul 2>&1
sc delete wintun >nul 2>&1

:: 3. 利用 Devcon 移除幽灵网卡设备
pnputil /enum-devices /class Net | findstr /i "Wintun"
for /f "tokens=2 delims=:" %%a in ('pnputil /enum-devices /class Net ^| findstr /i "Instance ID"') do (
    pnputil /remove-device "%%a"
)

:: 4. 重置 Winsock 协议栈与系统 IP 路由表
netsh winsock reset
netsh int ip reset

echo ===================================================
echo 清理完毕！请重启计算机后重新在客户端开启 TUN 模式。
echo ===================================================
pause
\`\`\`

---

## 三、 手动设备管理器救砖核查

若脚本运行后仍无法拉起 TUN 网卡，请按以下步骤手动核验：

1. 按下 \`Win + X\` 选择进入 **设备管理器**；
2. 展开 **网络适配器**，在顶部菜单勾选 **查看 -> 显示隐藏的设备**；
3. 查找所有名称带有 \`Wintun Userspace Tunnel\` 或黄色感叹号的异常网络设备；
4. 右键选择 **卸载设备**，并在弹出确认框中务必勾选 **“尝试删除此设备的驱动程序”**；
5. 重启电脑，重新以**管理员身份运行** Clash Verge Rev，即可完成全新驱动注册。
`
  },
  {
    filename: 'macos-cli-proxy-leak.md',
    title: 'macOS 终端 (Zsh) 与 GUI 代理不一致排查：终结 Homebrew 与 Curl 卡顿',
    desc: '彻底解析 macOS 操作系统应用层沙盒、终端环境变量与系统网络配置的隔离机理，详解终端全局代理函数与免配置接管。',
    content: `在 macOS 系统中，很多开发者最常遇到的诡异现象是：**浏览器打开网页秒开 4K 视频，但在 iTerm2 或系统自带终端执行 \`brew update\`、\`git clone\` 或 \`curl -I\` 时却无限转圈卡死**。

这一现象的根本原因在于：**macOS 终端（Zsh/Bash）是一个完全独立于系统 GUI 代理设置（System Proxy）的运行环境**。

---

## 一、 macOS 终端忽略系统代理的深层原理

1. **WinINet vs POSIX 套接字传统**：
   macOS 的系统代理设置（System Settings -> Network -> Proxies）仅通过 **SCNetworkReachability** 框架对基于 Cocoa / WebKit 的 GUI 应用程序（如 Safari、Chrome）生效；
2. **标准命令行工具的规范**：
   像 Curl、Git、Node.js、Python 等 POSIX 标准工具遵循 Unix 历史惯例，**绝不主动探测系统网络控制面板**，而是严格只读取终端当前上下文中的环境变量：\`http_proxy\`、\`https_proxy\` 与 \`all_proxy\`。

---

## 二、 最佳工程实践：在 \`~/.zshrc\` 中配置全自动代理函数

编辑本地开发机的 \`~/.zshrc\` 文件：

\`\`\`bash
# 专线实验室 - macOS 终端代理智能控制函数
proxy_port=7890

function proxy_on() {
    export http_proxy="http://127.0.0.1:$proxy_port"
    export https_proxy="http://127.0.0.1:$proxy_port"
    export all_proxy="socks5://127.0.0.1:$proxy_port"
    echo "⚡ 终端代理已开启 -> 127.0.0.1:$proxy_port"
    curl -I https://www.google.com --connect-timeout 3
}

function proxy_off() {
    unset http_proxy
    unset https_proxy
    unset all_proxy
    echo "⭕ 终端代理已关闭"
}
\`\`\`

保存后执行 \`source ~/.zshrc\`，在日常使用中只需输入 \`proxy_on\`，终端立刻满速突破。

---

## 三、 终极无感方案：开启 Surge 增强模式或 Clash Verge TUN

如果不想每次打开终端都手动键入命令，最彻底的方案是开启代理客户端的驱动级流量接管：
- **Surge for Mac**：开启 **增强模式 (Enhanced Mode)**，它会通过内核级 Packet Filter (pf) 规则直接截获所有终端发出的原始 BSD 套接字流量；
- **Clash Verge Rev**：开启 **TUN 模式**，系统将自动挂载虚拟网卡并将默认路由跃点数置顶，命令行工具无需任何额外环境变量配置即可原生享受专线加速。
`
  },
  {
    filename: 'clash-verge-mac-sleep.md',
    title: 'macOS 盒盖休眠唤醒后 TUN 网卡无响应、节点断连 Bug 的根治方案',
    desc: '深度定位 MacBook 盒盖休眠时网络扩展被系统冻结导致的代理套接字假死，提供内核保活脚本与自动守护机制。',
    content: `对于使用 MacBook Pro / Air 外接显示器或频繁移动办公的用户，经常遇到一个非常头疼的顽疾：
**合上笔记本盖子休眠一段时间，再次唤醒电脑后，明明 Wi-Fi 显示已连接，但所有网页都打不开，DNS 解析超时，必须完全退出重启 Clash Verge Rev 才能恢复上网。**

---

## 一、 盒盖假死的底层原因剖析

### 1. macOS 低功耗状态（Power Nap 与 Deep Sleep）
在笔记本合盖后，macOS 的电源管理守护进程（\`powerd\`）会对用户态进程实施渐进式资源回收。为了省电，系统会彻底挂起非核心第三方进程，并向所有虚拟网卡发送挂起信号。

### 2. 代理内核套接字断链与 DNS 缓存死锁
代理客户端（Mihomo/Sing-box）与远端专线服务器建立的底层 TCP 长连接由于休眠期长时间没有发送心跳，早已被专线入口机房的 NAT 防火墙超时剔除。
当电脑唤醒时：
- 客户端内核认为旧连接仍处于活动状态；
- 系统发出新的 DNS 查询包直接送入已经损坏的旧虚拟通道；
- 最终导致系统在长达 60 秒的超时等待中一直卡死转圈。

---

## 二、 彻底根治该 Bug 的三大配置

### 1. 在客户端开启严格模式与 DNS 自动重载
在 Clash Verge Rev 的配置（Config）中追加以下设置：

\`\`\`yaml
tun:
  enable: true
  stack: mixed
  auto-route: true
  auto-detect-interface: true  # 核心：网络接口变动时自动刷新路由
  dns-hijack:
    - 0.0.0.0:53
\`\`\`

### 2. 编写休眠唤醒自动重载 LaunchAgent 守护脚本
利用 macOS 原生的 Launchd 机制，在检测到系统网络唤醒时自动重载代理服务：

\`\`\`bash
# 创建 ~/Library/LaunchAgents/com.proxy.wakefix.plist
# 监控网络状态变动并在唤醒时快速重置路由表
sudo scutil --dns
\`\`\`

对于 99% 的用户，**勾选 Clash Verge 设置中的【自动检测网络接口变更】（auto-detect-interface）** 即可从根本上消除盒盖休眠断网的困扰。
`
  },
  {
    filename: 'icloud-private-relay-conflict.md',
    title: '苹果 iCloud 私密转送 (Private Relay) 与代理客户端冲突成因与一键关闭',
    desc: '解析苹果两跳加密网络与本地 VPN/TUN 代理的竞态冲突，详解双重代理导致的延迟飙升与流媒体风控。',
    content: `购买了苹果 iCloud+ 订阅的 iPhone、iPad 和 Mac 用户，经常在启用第三方专线代理时收到系统提示：
**“专用代理与您的网络扩展存在冲突，部分网页可能无法使用。”**

与此同时，用户还会遭遇访问国内网站极其缓慢、频繁跳出 Cloudflare 人机验证码等一系列异常。这正是 **iCloud 私密转送（iCloud Private Relay）** 与商业代理客户端发生竞态冲突的直接后果。

---

## 一、 为什么私密转送会与专线代理打架？

### 1. 架构本质：苹果自建的“双跳 Quic 代理”
iCloud 私密转送并非简单的 VPN，而是基于 HTTP/3 MASQUE 协议的两跳混淆网络：
- **第一跳（入口）**：由苹果自家服务器托管，能看到用户的真实 IP，但看不到用户要访问的目的网站；
- **第二跳（出口）**：由 Cloudflare、Fastly 或 Akamai 等第三方 CDN 伙伴托管，能看到目的网站，但看不到用户的真实 IP。

### 2. 本地虚拟网卡的双重接管抢权
当你在系统开启了 Clash Verge 或 Shadowrocket 的 TUN 模式，代理工具会在最底层争抢操作系统路由表；而系统内核的私密转送规则具有更高的系统级白名单特权。
两套网络栈同时尝试对 Safari 流量进行加密封装，导致严重的 **TLS-in-TLS 双重加密与 MTU 分片爆炸**，网页加载延迟从正常的 30ms 暴增至 500ms 以上。

---

## 二、 规范关闭与绕行设置

对于追求低延迟与解锁流媒体的用户，**强烈建议在使用第三方专业专线时彻底禁用系统私密转送**：

1. **macOS 禁用路径**：
   - 打开 **系统设置 (System Settings)**；
   - 点击顶部你的 **Apple ID -> iCloud**；
   - 找到 **私密转送 (Private Relay)**，将其切换为 **关闭**。
2. **iOS / iPadOS 禁用路径**：
   - 进入 **设置 -> 个人头像 -> iCloud -> 私密转送**；
   - 选择 **关闭专用代理**。
`
  },
  {
    filename: 'android-ipv6-dns-leak.md',
    title: 'Android 蜂窝数据与 Wi-Fi 双栈环境下 IPv6 DNS 污染导致的分流穿透排障',
    desc: '实测分析国内电信联通移动 IPv6 /64 地址分配机制，详解 Android 原生网络栈绕过 VpnService 泄露真实地理位置的修复方案。',
    content: `在移动端代理排障中，Android 系统以其复杂的底层网络协议栈和各大国产厂商的深度定制而著称。很多用户在电脑端能够稳定访问流媒体，但在安卓手机上即使打开了全局代理，在 Netflix 或 OpenAI 页面依然显示“检测到代理工具”或被重定向到国内中文版。

这是典型的 **Android 原生双栈环境下的 IPv6 DNS 泄露与穿透事故**。

---

## 一、 Android 独特的 IPv6 漏流机制

1. **运营商默认下发双栈公网地址**：
   三大运营商在 4G/5G 蜂窝网络和千兆家用宽带中，普遍默认向手机下发 \`/64\` 前缀的公网 IPv6 地址；
2. **Android 系统的 IPv6 优先逻辑**：
   当应用（如 Chrome）发起域名查询时，Android 原生网络栈会同时发起 A 记录（IPv4）和 AAAA 记录（IPv6）查询。由于部分代理客户端的 \`VpnService\` 仅接管了 IPv4 路由，手机发出的 AAAA 请求会**直接从运营商物理网卡直连国内 Local DNS（如 240e::1）**；
3. **真实 IP 瞬间暴露**：
   海外流媒体服务商在识别到用户的 IPv6 来自中国大陆运营商网段时，瞬间触发最严格的区域版权封锁。

---

## 二、 工业级防御方案：在客户端彻底阻断 IPv6 泄漏

在 Android 端使用的 Clash / Sing-box / Surfboard 配置中，追加以下核心防护指令：

\`\`\`yaml
# 方案 A: 全局禁用 IPv6 解析 (推荐绝大多数用户采用)
ipv6: false

dns:
  enable: true
  ipv6: false  # 强制仅解析 IPv4 A 记录
  default-nameserver:
    - 223.5.5.5
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query

# 方案 B: 若必须使用 IPv6，强制将其全部纳入 TUN 隧道路由
tun:
  enable: true
  stack: mixed
  auto-route: true
  inet6-route-address:
    - "::/0"  # 强制接管所有 IPv6 流量
\`\`\`

通过在配置中声明 \`ipv6: false\`，客户端会在底层直接向系统丢弃所有 AAAA 解析请求，迫使所有应用全部平滑降级至纯净的专线 IPv4 出口，彻底根绝真实地理位置暴露风险。
`
  },
  {
    filename: 'android-rom-proxy-issues.md',
    title: '国产定制 Android ROM (MIUI/ColorOS/OriginOS) 系统网络代理失效与救砖',
    desc: '深度梳理小米澎湃OS、OPPO ColorOS、vivo OriginOS 的后台省电黑名单、私有DNS劫持机制与稳定保活排障手册。',
    content: `国产 Android 厂商在操作系统层面深度定制了严格的后台进程管理机制、智能省电引擎（如墓碑机制）与系统级安全监控。这些定制虽提升了日常续航，却对需要常驻后台的代理客户端（如 Clash Meta for Android、Sing-box）造成了毁灭性干扰。

---

## 一、 国产四大 ROM 的典型网络暗坑

1. **智能温控与后台强杀（OOM Killer）**：
   当手机息屏超过 10 分钟，系统会将代理客户端的 \`VpnService\` 进程判定为高耗电应用，强行杀除常驻进程；
2. **私有 DNS 强制重定向**：
   部分系统自带“安全上网”或“网址防诈防护”功能，会在系统底层强行将 53 端口重写回厂商自建的安全 DNS 服务器；
3. **智能双 Wi-Fi 加速冲突**：
   同时连接两个 Wi-Fi 或开启数据网络加速时，辅助网络接口的数据包会直接绕开 VPN 网卡直接直连。

---

## 二、 关键系统级设置白皮书

为了保障 Android 代理的 24 小时绝对稳定在线，请务必在系统设置中完成以下配置：

### 1. 电池无限制与自启动权限
- 进入 **设置 -> 应用设置 -> 应用管理 -> 选择代理客户端**；
- 开启 **自启动** 与 **关联启动**；
- 将 **省电策略 / 耗电管理** 改为 **“无限制 / 允许后台高耗电”**。

### 2. 关闭系统级私密 DNS 干扰
- 进入 **设置 -> 连接与共享 -> 私人 DNS (Private DNS)**；
- 将其由“自动”或指定域名改为 **“关闭”**（防止厂商劫持本地 DNS 分流）。

### 3. 多任务卡片上锁
- 在近期任务多任务视图中，长按代理客户端卡片，点击 **小锁头图标（锁定任务卡片）**，防止误触“一键清理内存”导致代理突然中断。
`
  },
  {
    filename: 'tun-gateway-loop-rescue.md',
    title: '软路由与旁网关 TUN 模式死锁形成环路导致全屋断网的快速自救指南',
    desc: '详解透明网关组网中最致命的数据包自循环死锁（Routing Loop），提供恢复物理网络、修改防火墙规则与应急避坑指南。',
    content: `在家庭或小型办公室局域网部署 **OpenWrt 旁路由 + 主路由拨号** 架构时，最容易引发灾难性事故的场景便是：
**在旁路由或主设备上误开启了 TUN 虚拟网卡代理，导致整个局域网所有设备瞬间全部断网，甚至连软路由后台管理界面（192.168.1.1）也彻底无法登录。**

这种现象被称为 **网络路由环路死锁（Routing Loop Deadlock）**。

---

## 一、 路由环路死锁的微观发生机理

```
[局域网客户端] ---> [旁路由 (OpenClash)]
                          |
             [TUN 虚拟网卡接管 0.0.0.0/0]
                          |
             [代理内核加密数据包准备发送至外部]
                          |
   ❌ [操作系统路由表判定发往代理服务器的数据包本身也是 0.0.0.0/0]
                          |
             [再次将加密数据包丢回 TUN 网卡]
                          |
              ⚠️ [无休止的内核级自循环递归]
                          |
     [CPU 核心单核 100% 满载 -> 局域网带宽耗尽崩溃]
```

### 根本诱因：
当 TUN 驱动修改系统路由表将默认网关指向虚拟网卡时，**必须对代理服务器自身的节点 IP（即专线入口 IP）添加静态直连豁免路由**。
如果分流规则缺失或配置错误，代理客户端加密后的数据包又被送回了自己的监听端口，在内核态形成死循环，直到缓冲区彻底溢出、路由器内存耗尽并陷入假死。

---

## 二、 应急自救三步法

### 第一步：拔掉网线，切断旁路由网络接口
遇到全屋瘫痪时，切勿盲目按主路由器 Reset 重置按钮。只需**物理拔掉旁路由与主交换机之间的这根网线**，主路由下的普通设备（手机、电视）即可在 5 秒内恢复正常直连上网。

### 第二步：直连电脑救砖
1. 用网线将笔记本电脑直接插入旁路由的 LAN 口；
2. 在电脑网络设置中手动配置静态 IP：\`192.168.1.250\`，子网掩码 \`255.255.255.0\`，网关留空；
3. 打开浏览器登录 OpenWrt 终端后台（\`192.168.1.1\`）或通过 SSH 登录；
4. 停止异常的代理服务：
   \`\`\`bash
   /etc/init.d/openclash stop
   killall -9 mihomo
   killall -9 sing-box
   \`\`\`

### 第三步：修正防火墙与接口配置
在 OpenWrt 的 \`Network -> Firewall -> Custom Rules\` 中，确保启用了正确的 MASQUERADE 伪装规则，并为代理内核指定排除绑定的物理接口（\`SO_BINDTODEVICE\`）。
`
  },
  {
    filename: 'wireshark-proxy-capture-decrypt.md',
    title: 'Wireshark 本地回环解密抓包实战：教你精准定位每一个丢包请求',
    desc: '系统化讲解使用 Wireshark 配合 SSLKEYLOGFILE 机制解密本地代理 TLS 明文流量，通过时序图精准定位握手卡顿与丢包环节。',
    content: `在网络性能优化与安全审计工作中，**“网络究竟是在哪一步卡住的？”** 是最高频的技术挑战。当用户反馈网页打不开时，诱因可能是：
- 本地系统 DNS 解析卡顿；
- 本机到代理客户端之间的本地套接字溢出；
- 专线入口的 TLS 握手重协商失败；
- 远端海外 CDN 节点的四层 TCP 丢包。

利用行业顶级网络分析工具 **Wireshark** 进行本地回环抓包与传输分析，是彻底告别盲目猜测、实现精准定性排障的必备技能。

---

## 一、 抓包基础设施准备：捕获本地回环流量

在 Windows/macOS 上，客户端与本地代理软件（如 127.0.0.1:7890）的通信并不经过物理网卡，而是运行在虚拟的 **Loopback 适配器** 上。

1. 打开 Wireshark，在网卡列表中双击选择 **Adapter for loopback traffic capture**（macOS 上为 \`lo0\`）；
2. 在顶部捕获过滤器中键入端口规则：
   \`\`\`text
   tcp.port == 7890
   \`\`\`
3. 此时在终端发送一个请求（如 \`curl -x http://127.0.0.1:7890 https://api.openai.com\`），Wireshark 界面将立刻实时滚动显示抓取的原始报文。

---

## 二、 关键性能与排障特征指引

### 1. HTTP 响应时间（Time-to-First-Byte，TTFB）
在捕获的数据流中，找到 HTTP 请求报文（\`GET\` 或 \`POST\`），观察随后的第一个返回报文：
- 查看 Wireshark 下方的 **[Time since previous request frame]**；
- 若该时间超过 800ms，说明瓶颈完全在于海外落地服务器处理缓慢或专线中转排队，与用户本地局域网无关。

### 2. TCP 重传率（TCP Retransmission）
在过滤器中键入：
\`\`\`text
tcp.analysis.retransmission
\`\`\`
- 若捕获列表中频繁出现黑色标记的 **[TCP Retransmission]** 或 **[TCP Fast Retransmission]**，说明底层链路存在严重随机物理丢包；
- 统计重传报文占总报文的比例，若大于 1%，该专线即未达到工业级稳定交付标准。
`
  }
];

articles.forEach(art => {
  const filePath = path.join(targetDir, art.filename);
  const fullContent = `---
title: ${art.title}
description: ${art.desc}
outline: deep
---

# ${art.title}

${art.content}

---

## 延伸阅读与专栏导航
- **网络排障疑难杂症白皮书**：[网络排障疑难杂症手册与系统级调试白皮书](/troubleshooting/)
- **DNS 终极防御指南**：[DNS 泄漏与污染终极防御：Fake-IP 映射机理](/troubleshooting/dns-leak-fakeip-edns)
- **IPv6 漏流一键修复**：[IPv6 漏流导致真实 IP 暴露修复指南](/troubleshooting/ipv6-leak-fix-guide)
- **TUN 虚拟网卡死锁救砖**：[TUN 虚拟网卡死锁与路由环路底层排查实战](/troubleshooting/tun-routing-loop-deadlock-fix)
`;
  fs.writeFileSync(filePath, fullContent, 'utf8');
  console.log(`Generated: ${art.filename}`);
});

console.log('All 8 troubleshooting articles generated successfully!');
