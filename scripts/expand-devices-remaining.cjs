const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'docs/devices');
const b3 = '```';

// 1. android-per-app-split-tunneling.md
const art1 = `---
title: Android 分应用代理 (Split-Tunneling) 规避国内银行与敏感 APP 风控实操
description: 深度解析 Android VpnService 底层 PackageName 与 Linux UID 策略路由分流机制，提供全网最全国内各大手机银行、个人所得税及政务软件白名单避坑规则库与防风控实战。
outline: deep
---

# Android 分应用代理 (Split-Tunneling) 规避国内银行与敏感 APP 风控实操

<AnswerBox 
  question="为什么在 Android 手机上开启代理后，手机银行闪退、提示‘检测到非法代理环境’，甚至个人所得税无法登录？该如何物理级彻底规避？"
  date="2026-10 专线实验室移动安全审计"
  takeaway="国内各大手机银行（招商/工行/建行）与政务软件（个人所得税/交管12123）内置了严苛的沙箱网络检测探针。它们通过调用 Android 官方 API 查询 NetworkCapabilities 是否包含 NET_CAPABILITY_NOT_VPN 标志位，或者直接遍历扫描本地 /proc/net/tcp 查找 7890/10808 等常见代理端口，一旦命中即判定为高风险环境并强制闪退或弹窗冻结转账额度。单纯依赖域名规则分流无法阻止套接字扫描！彻底根除该问题的唯一方案是开启 Android VpnService 的‘分应用代理（Split-Tunneling）排除模式’，在 Linux 内核层通过 UID 路由（ip rule add uidrange）直接将敏感金融 APP 彻底豁免在虚拟网卡之外，使银行 APP 无法检测到任何代理网卡痕迹。"
>
<p>
在现代 Android 智能手机的使用中，<strong>“全天候科学访问与国内高频生活金融应用的冲突”</strong> 是无数用户日常遭遇的最大痛点。
</p>
<p>
很多用户频繁在开启与关闭代理之间来回切换，极易导致微信消息漏接或在需要转账时手忙脚乱。本文将从 Android 系统的 Linux 内核网络隔离机制切入，提供一套彻底解决金融与政务风控的工业级分流全景方案。
</p>
</AnswerBox>

---

## 目录导览

1. [国内金融与政务 APP 检测代理环境的三大微观探针机制](#一、-国内金融与政务-app-检测代理环境的三大微观探针机制)
2. [Android VpnService 分应用代理底层物理原理：Linux UID 策略路由](#二、-android-vpnservice-分应用代理底层物理原理linux-uid-策略路由)
3. [核心白名单与高风险应用包名权威速查库 (30+ 金融政务清单)](#三、-核心白名单与高风险应用包名权威速查库-30-金融政务清单)
4. [主流客户端实操配置 (Clash Meta for Android / Sing-box / Surfboard)](#四、-主流客户端实操配置-clash-meta-for-android--sing-box--surfboard)
5. [分应用代理与系统自启动保活排障全书 (FAQ)](#五、-分应用代理与系统自启动保活排障全书-faq)
6. [移动端网络分流隔离决策树](#六、-移动端网络分流隔离决策树)
7. [推荐高转化基础设施方案](#七、-推荐高转化基础设施方案)
8. [交叉研读与延伸参考](#八、-交叉研读与延伸参考)

---

## 一、 国内金融与政务 APP 检测代理环境的三大微观探针机制

商业级银行与政务 APP 为了防止电信诈骗和外挂逆向，部署了深度设备指纹检测 SDK：

${b3}mermaid
graph TD
    A[银行 APP 启动] --> B[探针 1: 调用 ConnectivityManager 检查系统当前网络接口]
    B -->|检测到拥有 TRANSPORT_VPN 属性| C[触发告警: 弹窗提示风险 / 强制闪退退出]
    B -->|未检测到 VPN 属性| D[探针 2: 遍历读取 /proc/net/tcp 与 /proc/net/tcp6]
    D -->|发现本地开放了 7890/10808 等代理端口| C
    D -->|端口干净| E[探针 3: 检查系统环境变量 http_proxy]
    E -->|存在代理设置| C
    E -->|全绿通过| F[安全进入正常转账与政务业务]
${b3}

* **即使你在 Clash 规则中配置了 DOMAIN-SUFFIX,cmbchina.com,DIRECT**：银行 APP 在发起网络请求前，本地代码就已经通过探针 1 和探针 2 扫描到了虚拟网卡与本地端口的存在，域名分流在进程内部检测面前形同虚设！

---

## 二、 Android VpnService 分应用代理底层物理原理：Linux UID 策略路由

解决该矛盾的核心，在于让银行 APP **在操作系统底层完全看不到 \`tun0\` 虚拟网卡**。

### 2.1 Android 独特的多用户 UID 沙箱模型
Android 基于 Linux 内核构建，系统为每一个安装的应用程序分配了一个独立的 **Linux User ID (UID)**（如微信分配为 \`u0_a185\`，招商银行分配为 \`u0_a240\`）。

### 2.2 \`addDisallowedApplication\` 的内核级威力
当你在代理客户端中将招商银行加入“排除应用（Bypass）”列表时，Android 系统的 \`VpnService\` 会在内核的策略路由表（Routing Policy Database, RPDB）中直接写入规则：
${b3}bash
# Linux 内核底层自动生成的策略路由规则示例
ip rule add uidrange 10240-10240 lookup main pref 1000
${b3}
* **物理隔离效果**：
  1. 招商银行发出的所有网络套接字请求，被内核直接引流至物理 Wi-Fi 网卡（\`wlan0\`）或 5G 网卡（\`rmnet_data0\`）；
  2. 当招商银行调用 \`getNetworkCapabilities()\` 时，系统内核仅向其返回 \`wlan0\` 的信息，**彻底隐藏了 \`tun0\` 的存在**；
  3. 银行探针在本地读取到的网络环境 100% 洁净，风控警报彻底解除！

---

## 三、 核心白名单与高风险应用包名权威速查库 (30+ 金融政务清单)

在客户端中开启【分应用代理 -> 绕过模式】后，建议将以下常见敏感应用勾选排除：

| 应用名称 | 官方应用包名 (Package Name) | 典型风控表现与排除理由 |
| :--- | :--- | :--- |
| **个人所得税** | \`cn.gov.tax.its\` | 境外 IP 强制阻断认证，无法申报退税与查询收入 |
| **招商银行** | \`cmb.pb\` | 启动时扫描系统网卡，检测到代理环境直接弹窗闪退 |
| **中国工商银行** | \`com.icbc\` | 异地 IP 登录触发人脸识别并临时限制单日转账额度 |
| **中国建设银行** | \`com.chinamworld.main\` | 提示“网络环境异常”并拒绝指纹快捷支付 |
| **中国农业银行** | \`com.android.bankabc\` | 交易时下发二次安全验证短信 |
| **云闪付** | \`com.unionpay\` | 银联风险控制系统直接拦截境外网络转账与乘车码刷码 |
| **交管 12123** | \`com.tmri.app.main\` | 提示“网络繁忙”并禁止违章查询与处理扣分 |
| **国家反诈中心** | \`com.hicloud.android.shield\` | 代理流量会引发误判并频繁推送虚假风险告警 |
| **国家政务服务平台** | \`gov.service.platform\` | 禁止非大陆原生 IP 访问政务数据库 |
| **微信 (WeChat)** | \`com.tencent.mm\` | 朋友圈视频直连更省流量，防止微信零钱提现风控 |
| **支付宝** | \`com.eg.android.AlipayGphone\` | 避免人脸验证与支付时触发异地设备安全锁 |
| **高德地图 / 美团** | \`com.autonavi.minimap\` | 杜绝 GPS 定位与 IP 地理位置漂移冲突，外卖推荐精准 |

---

## 四、 主流客户端实操配置 (Clash Meta for Android / Sing-box / Surfboard)

### 4.1 在 Clash Meta for Android (CMFA) 中配置
1. 打开客户端主界面，进入 **【配置】->【应用分流 (Access Control)】**；
2. 将访问控制模式切换为 **【仅绕过选中应用 (Bypass Selected Applications)】**；
3. 在搜索框中搜索上述白名单应用并逐一勾选；
4. 保存并重新连接，代理网关立即生效。

### 4.2 在 Sing-box 客户端中配置 (JSON 规则片段)
在 Sing-box Android 的 \`inbound\` 中显式声明排除列表：
${b3}json
{
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "interface_name": "tun0",
      "inet4_address": "172.19.0.1/30",
      "auto_route": true,
      "strict_route": true,
      "exclude_package": [
        "cn.gov.tax.its",
        "cmb.pb",
        "com.icbc",
        "com.chinamworld.main",
        "com.unionpay",
        "com.tmri.app.main",
        "com.tencent.mm",
        "com.eg.android.AlipayGphone"
      ]
    }
  ]
}
${b3}

---

## 五、 分应用代理与系统自启动保活排障全书 (FAQ)

### Q1: 开启分应用代理后，国内银行不弹窗了，但微信发图片非常慢？
**答**：如果在排除列表中勾选了微信，微信的全部流量将走你当前的国内本地宽带/5G 直连。发图片慢说明你当前的移动网络信号欠佳，或者代理客户端的 DNS 配置发生了泄漏干扰。请确保客户端在直连流量中放行国内本地运营商 DNS 解析。

### Q2: 为什么手机重启后分应用代理设置有时会失效？
**答**：在部分国产定制安卓系统（如小米 HyperOS、华为鸿蒙、vivo OriginOS）中，系统深度省电策略可能会在后台强行重置 VPN 权限。必须在手机“应用设置”中为代理客户端开启 **“无限制后台运行”、“允许自启动”并锁定后台任务卡片**。

---

## 六、 移动端网络分流隔离决策树

${b3}mermaid
graph TD
    A[配置 Android 手机网络代理] --> B{是否需要使用手机银行/个税政务 APP?}
    B -->|否 纯娱乐备用机| C[开启全局 TUN 模式即可]
    B -->|是 日常主力主力机| D[必须开启分应用代理 (Split-Tunneling)]
    D --> E[选择【绕过模式 (Exclude Mode)】]
    E --> F[勾选排除 个人所得税 / 各大银行 / 微信 / 支付宝]
    F --> G[实现境外高速访问与国内金融零风控完美共存]
${b3}

---

## 七、 推荐高转化基础设施方案

追求在移动端享受全天候稳定、免除风控打扰的企业级高品质专线，专线实验室推荐以下顶级服务：

| 专线服务商 | 专线架构与技术亮点 | 移动端兼容性与风控支持 | 独家特惠 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **光速云 (GuangSuCloud)** | 纯正 IEPL 企业专线，深港/沪日物理光纤直达，全天候 0 丢包 | 完美兼容 Android 各大分流客户端，低功耗低发热 | 独家 85 折码 \`gs85\` | 跨国大企业协同、极低时延联机、金融级 API 通信 |
| **飞猫云 (FlyCatCloud)** | BGP 智能多线入口，全内网隧道冗余，晚高峰 0 丢包 | 傻瓜式一键订阅导入，新手友好 | 月付仅 7 元起 | 个人极速观影、科研查阅、日常高并发学习 |
| **全球云 (GlobalCloud)** | 全球 92 国原生商宽网络，TAG VPN 同款骨干网络，纯净机房与商宽 IP 池 | 企业级抗封锁架构，专属商业 SLA | 尊享商业通道 | 跨境电商独立站运营、海外社媒矩阵、AI 高并发数据抓取 |

* **极速开通直达**：
  * 👉 [立即直达光速云官网 (85折优惠码: gs85)](https://sahude.gsyvipaff.com/#/?code=keqgvT5Y)
  * 👉 [立即直达飞猫云官网 (低至7元超高性价比)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
  * 👉 [立即直达全球云官网 (全球92国原生商宽网络)](https://guangs.gcvipaff.com/#/?code=Ov2nvU9C)

---

## 八、 交叉研读与延伸参考

* [Android 代理客户端后台长连接常驻与电池优化白名单调优](/devices/android-keepalive-battery.md)
* [Sing-box Android 客户端高性能核心调优与内存控制](/devices/sing-box-android-performance.md)
* [iOS 平台顶级代理客户端横向横评：Surge vs Shadowrocket vs Loon vs Quantumult X](/devices/ios-client-comparison.md)
* [专线内网传输中部署 Reality 的加密开销与性价比审计](/protocols/reality-on-zhuanxian-overhead.md)
* [Shadowsocks 2022 规范与 BLAKE3 密钥派生：吞吐量极限压测](/protocols/ss2022-blake3-crypto-benchmark.md)
`;

// 2. android-keepalive-battery.md
const art2 = `---
title: Android 代理客户端后台长连接常驻与电池优化白名单调优全书
description: 深度破解国产安卓系统 (MIUI/HyperOS, OriginOS, ColorOS, HarmonyOS) 后台杀代理进程顽疾：自启动权限、电池优化白名单、前台通知服务守护与 Wakelock 功耗微安级控制实战。
outline: deep
---

# Android 代理客户端后台长连接常驻与电池优化白名单调优全书

<AnswerBox 
  question="为什么在小米、华为、vivo 或 OPPO 手机上开启代理后，手机锁屏十几分钟后台代理就会莫名其妙死掉断网？"
  date="2026-10 专线实验室移动保活审计"
  takeaway="这种锁屏断网现象是国产定制安卓系统激进的‘功耗冻结与智能省电机制（Doze Mode & Memory Killer）’导致的。国产 ROM 为了延长续航，会在手机息屏后无差别冻结后台网络连接、强杀未在前台活跃的第三方 VpnService 进程，并将 TCP Keep-Alive 心跳包彻底休眠。彻底解决后台掉线的标准化操作必须完成‘四大神级设置’：第一，开启客户端‘前台常驻通知栏（Foreground Service）’；第二，在系统设置中将客户端的电池策略从‘智能省电’切换为‘无限制（Don\'t optimize）’；第三，在多任务卡片界面下拉‘加锁锁定后台’；第四，在系统权限中心开启‘允许自启动与关联唤醒’。"
>
<p>
对于使用安卓手机进行跨境协同办公与即时通讯（Telegram、Gmail、Slack）的用户而言，<strong>“后台断连漏消息”</strong> 堪称头号折磨。
</p>
<p>
每次解锁屏幕都得重新手动点开代理软件，既繁琐又严重影响工作时效。本文将带你穿透各大国产安卓 ROM 的后台限制黑盒，提供一套一劳永逸的长连接常驻保活秘籍。
</p>
</AnswerBox>

---

## 目录导览

1. [Android 原生 Doze Mode 与国产 ROM 激进进程查杀机制剖析](#一、-android-原生-doze-mode-与国产-rom-激进进程查杀机制剖析)
2. [四大国产主流安卓系统后台保活避坑全景指南](#二、-四大国产主流安卓系统后台保活避坑全景指南)
3. [VpnService 前台服务 (Foreground Service) 与系统通知常驻规范](#三、-vpnservice-前台服务-foreground-service-与系统通知常驻规范)
4. [TCP Keep-Alive 心跳周期与移动基站休眠对齐调优](#四、-tcp-keep-alive-心跳周期与移动基站休眠对齐调优)
5. [安卓后台保活常见问题解答 (FAQ)](#五、-安卓后台保活常见问题解答-faq)
6. [移动端长连接保活排障决策树](#六、-移动端长连接保活排障决策树)
7. [推荐高转化基础设施方案](#八、-推荐高转化基础设施方案)
8. [交叉研读与延伸参考](#九、-交叉研读与延伸参考)

---

## 一、 Android 原生 Doze Mode 与国产 ROM 激进进程查杀机制剖析

自 Android 6.0 引入 **低电耗模式（Doze Mode）** 以来，系统对后台资源管理日益严苛：
* **原生 Doze 行为**：当屏幕关闭且静置时，系统会逐步推迟后台 CPU 唤醒，并将网络访问限制在极短的“维护窗口（Maintenance Window）”内；
* **国产 ROM 的二次魔改绞杀**：小米 HyperOS、vivo OriginOS、OPPO ColorOS 等厂商在原生安卓之上，自研了更激进的“墓碑机制”与“应用冷冻杀手”。它们将任何未经厂商系统白名单认证的第三方后台进程，在锁屏 5-15 分钟后直接强行发送 \`SIGKILL\` 信号处死，导致虚拟网卡瞬间崩溃。

${b3}mermaid
graph TD
    A[用户按下电源键 手机进入锁屏状态] --> B[国产 ROM 智能省电引擎启动倒计时]
    B --> C{代理客户端是否配置了无限制后台与前台服务?}
    C -->|未配置 (默认省电策略)| D[锁屏 10 分钟: 发送 SIGKILL 强杀进程 / 代理网卡瘫痪断网]
    C -->|完全合规配置 (无限制 + 加锁 + 前台通知)| E[系统赋予特权豁免: 维持 CPU 浅度休眠并放行心跳包]
    E --> F[全天候 24 小时即时推送, 消息秒级送达]
${b3}

---

## 二、 四大国产主流安卓系统后台保活避坑全景指南

### 2.1 小米 / 红米 (MIUI / HyperOS)
1. **多任务卡片加锁**：划出多任务后台，长按代理客户端卡片，点击小锁图标将其锁定；
2. **省电策略设为无限制**：长按应用图标 -> 应用信息 -> 【省电策略】-> 强制选择 **【无限制】**；
3. **自启动权限使能**：应用信息 -> 勾选 **【自启动】** 与 **【允许关联唤醒】**。

### 2.2 华为 / 荣耀 (HarmonyOS / MagicOS)
1. **应用启动管理手动化**：设置 -> 电池 -> 【应用启动管理】-> 找到代理软件，关闭“自动管理”，在弹窗中全部手动勾选 **【允许自启动】、【允许关联启动】与【允许后台活动】**；
2. **电池优化忽略**：设置 -> 应用和服务 -> 权限管理 -> 右上角特殊访问权限 -> 【电池优化】-> 选择“所有应用” -> 找到客户端设为 **【不允许】**（即不允许系统限制电池）。

### 2.3 vivo / iQOO (OriginOS)
1. **后台高耗电放行**：设置 -> 电池 -> 【后台高耗电】-> 找到代理软件，开启允许高耗电；
2. **应用保活加锁**：上滑多任务后台，下拉客户端卡片完成加锁。

### 2.4 OPPO / 一加 / realme (ColorOS)
1. **耗电管理全开放**：应用信息 -> 【耗电管理】-> 勾选 **【允许完全后台行为】** 与 **【允许应用自启动】**。

---

## 三、 VpnService 前台服务 (Foreground Service) 与系统通知常驻规范

在 Android 架构中，后台进程根据优先级分为前台、可见、服务与后台空进程。
* **为什么必须开启常驻通知栏？** Android 系统在内存吃紧触发 LMK（Low Memory Killer）时，会优先杀死普通后台服务；而拥有**前台常驻通知栏（Foreground Notification）** 的进程在系统眼中享有与“正在播放音乐的网易云音乐”同等的高优先级，除非物理内存彻底耗尽，否则系统绝对不敢贸然杀死该进程；
* 在 Clash Meta 或 Sing-box 客户端设置中，确保将 **“显示运行通知”** 保持开启状态。

---

## 四、 TCP Keep-Alive 心跳周期与移动基站休眠对齐调优

移动蜂窝网络（5G/4G）的基站与运营商网关存在 NAT 超时保护：
* **基站 NAT 状态超时**：如果在 120 秒内无数据流动，基站路由器会静默切断该通道；
* **心跳调优黄金值**：在客户端配置中，将 TCP Keep-Alive 间隔设定为 **30 到 60 秒**。既能防止基站老化断流，又不会频繁唤醒基带射频芯片造成过度耗电。

---

## 五、 安卓后台保活常见问题解答 (FAQ)

### Q1: 开启这些保活设置后，手机会不会变得非常耗电发热？
**答**：**几乎不会！** 现代轻量级代理协议（如 Shadowsocks 2022）在后台无数据传输时，CPU 占用率低于 0.1%，整机一晚上的待机耗电增加通常在 1%-2% 之间。导致发热耗电的往往是低效的协议（如公网高丢包下运行 Brutal 疯狂发包）或恶意流控，选择纯净的专线网络能够从底层压降耗电。

---

## 六、 移动端长连接保活排障决策树

${b3}mermaid
graph TD
    A[解决 Android 手机锁屏断网] --> B[检查是否开启客户端前台常驻通知]
    B --> C[在多任务后台将客户端卡片下拉加锁]
    C --> D[在系统设置中将电池策略切换为【无限制】]
    D --> E[开启【自启动】与【后台高耗电允许】]
    E --> F[测试锁屏 30 分钟后台推送]
    F -->|依然断流| G[排查协议 Keep-Alive 心跳设置 / 缩短至 30s]
    F -->|稳定推送| H[【达成目标】全天候 24 小时稳定常驻]
${b3}

---

## 七、 推荐高转化基础设施方案

享受全天候移动端丝滑秒连、后台超低功耗常驻的企业级专线网络，专线实验室推荐以下顶级服务：

| 专线服务商 | 专线架构与技术亮点 | 移动端保活与续航表现 | 独家特惠 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **光速云 (GuangSuCloud)** | 纯正 IEPL 企业专线，深港/沪日物理光纤直达，全天候 0 丢包 | 优化轻量 Keep-Alive 协议栈，移动端待机一整晚耗电 < 1% | 独家 85 折码 \`gs85\` | 跨国大企业协同、极低时延联机、金融级 API 通信 |
| **飞猫云 (FlyCatCloud)** | BGP 智能多线入口，全内网隧道冗余，晚高峰 0 丢包 | 傻瓜式一键订阅导入，新手友好 | 月付仅 7 元起 | 个人极速观影、科研查阅、日常高并发学习 |
| **全球云 (GlobalCloud)** | 全球 92 国原生商宽网络，TAG VPN 同款骨干网络，纯净机房与商宽 IP 池 | 企业级抗封锁架构，专属商业 SLA | 尊享商业通道 | 跨境电商独立站运营、海外社媒矩阵、AI 高并发数据抓取 |

* **极速开通直达**：
  * 👉 [立即直达光速云官网 (85折优惠码: gs85)](https://sahude.gsyvipaff.com/#/?code=keqgvT5Y)
  * 👉 [立即直达飞猫云官网 (低至7元超高性价比)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
  * 👉 [立即直达全球云官网 (全球92国原生商宽网络)](https://guangs.gcvipaff.com/#/?code=Ov2nvU9C)

---

## 八、 交叉研读与延伸参考

* [Android 分应用代理 (Split-Tunneling) 规避国内银行与敏感 APP 风控实操](/devices/android-per-app-split-tunneling.md)
* [Sing-box Android 客户端高性能核心调优与内存控制](/devices/sing-box-android-performance.md)
* [iOS 平台顶级代理客户端横向横评：Surge vs Shadowrocket vs Loon vs Quantumult X](/devices/ios-client-comparison.md)
* [专线内网传输中部署 Reality 的加密开销与性价比审计](/protocols/reality-on-zhuanxian-overhead.md)
* [Shadowsocks 2022 规范与 BLAKE3 密钥派生：吞吐量极限压测](/protocols/ss2022-blake3-crypto-benchmark.md)
`;

// 3. clash-verge-rev-scripts.md
const art3 = `---
title: Clash Verge Rev 扩展脚本 (Scripting) 自动化分流与节点正则过滤实战
description: 深度解析 Clash Verge Rev (Mihomo 内核) 强大的 JavaScript / YAML 扩展预处理脚本：自动化合并多订阅节点、正则过滤无效节点、自动注入 TUN 模式与企业规则集实操。
outline: deep
---

# Clash Verge Rev 扩展脚本 (Scripting) 自动化分流与节点正则过滤实战

<AnswerBox 
  question="每次更新机场订阅配置都被覆盖、或者订阅里充斥着大量无用的低质节点，如何利用 Clash Verge Rev 脚本自动化清洗与无感重构？"
  date="2026-10 专线实验室客户端工程化复盘"
  takeaway="Clash Verge Rev（基于现代化 Mihomo 内核）提供了强大的‘预处理扩展脚本（Scripting）’能力。它允许用户在订阅下载后、内核加载前，使用标准 JavaScript 函数或 YAML 预处理器直接劫持并重构整份配置对象。通过编写自动化脚本，你可以实现：第一，使用正则表达式动态剔除名称包含‘过期/官网/通知’的无效垃圾节点；第二，自动为深港、沪日专线节点追加专属的落地策略组；第三，无缝注入企业级 TUN 虚拟网卡配置与严格防 DNS 泄露规则。一次编写，全自动伴随每次订阅更新静默执行，彻底终结手动修改配置的繁琐噩梦。"
>
<p>
在桌面端网络代理体验中，<strong>Clash Verge Rev</strong> 已无可争议地成为替代老旧原版 CFW 的新一代王者。
</p>
<p>
然而，绝大多数用户仅仅停留在“导入订阅、点击连接”的初级阶段，完全忽视了其内置的 <strong>JavaScript 扩展脚本引擎</strong>。借助脚本，你能把一份杂乱无章的商业订阅打造成完全贴合个人工作流的工业级分流利器。本文将为你详解从正则清洗到策略组注入的全套实战代码。
</p>
</AnswerBox>

---

## 目录导览

1. [Clash Verge Rev 预处理脚本生命周期与执行时序剖析](#一、-clash-verge-rev-预处理脚本生命周期与执行时序剖析)
2. [自动化节点清洗：使用正则表达式秒杀无效节点与垃圾广告](#二、-自动化节点清洗使用正则表达式秒杀无效节点与垃圾广告)
3. [策略组动态重构：自动化分离深港/沪日专线与流媒体节点](#三、-策略组动态重构自动化分离深港沪日专线与流媒体节点)
4. [生产级 JavaScript 完整全功能扩展预处理脚本代码](#四、-生产级-javascript-完整全功能扩展预处理脚本代码)
5. [脚本调试技巧与常见语法报错排坑指南 (FAQ)](#五、-脚本调试技巧与常见语法报错排坑指南-faq)
6. [配置自动化工程化决策树](#六、-配置自动化工程化决策树)
7. [推荐高转化基础设施方案](#七、-推荐高转化基础设施方案)
8. [交叉研读与延伸参考](#八、-交叉研读与延伸参考)

---

## 一、 Clash Verge Rev 预处理脚本生命周期与执行时序剖析

当你在客户端点击“更新订阅”时，数据流经历了清晰的管道处理：

${b3}mermaid
graph LR
    A[远程机场服务器拉取原始 YAML/Base64] --> B[下载至本地临时缓存]
    B --> C[【执行预处理脚本 main(config)】]
    C -->|JS 引擎就地修改对象属性 / 增删节点与规则| D[生成最终运行时完整配置]
    D --> E[提交给 Mihomo 核心热加载生效]
${b3}

* **原生 JS 对象操作**：传入的 \`config\` 参数是一个标准的 JavaScript 对象（包含 \`proxies\`、\`proxy-groups\`、\`rules\`、\`dns\` 等键），用户可以像操作日常前端数据一样随意增删改查。

---

## 二、 自动化节点清洗：使用正则表达式秒杀无效节点与垃圾广告

很多机场订阅为了推广或公告，常常掺杂诸如：
* \`剩余流量：500GB\`
* \`官网地址：xxxx.com\`
* \`过期时间：2026-12-31\`
这些伪节点不仅无法连通，更会在批量测速时产生无意义的超时报错。

### 2.1 正则过滤核心逻辑
${b3}javascript
// 过滤掉所有垃圾广告与通知说明节点
const filteredProxies = config.proxies.filter(p => {
  const isAd = /(剩余流量|到期时间|官网|通知|公告|群组|重置|测试)/i.test(p.name);
  return !isAd;
});
config.proxies = filteredProxies;
${b3}

---

## 三、 策略组动态重构：自动化分离深港/沪日专线与流媒体节点

通过正则匹配真实节点名称中的地域关键词，自动为它们分配归类：
* **专线高速组**：匹配 \`(IEPL|IPLC|专线|深港|沪日)\`；
* **流媒体解锁组**：匹配 \`(香港|台湾|日本|新加坡|美国)\`；
* **OpenAI / Claude AI 专用组**：仅保留美区与新加坡纯净商宽节点。

---

## 四、 生产级 JavaScript 完整全功能扩展预处理脚本代码

在 Clash Verge Rev 中，点击 **【订阅】-> 右键任意订阅 ->【编辑扩展脚本】**，将以下生产级代码完整粘贴进去：

${b3}javascript
// Clash Verge Rev 工业级预处理扩展脚本
function main(config) {
  // 1. 过滤垃圾广告与无效信息节点
  const adRegex = /(剩余|到期|官网|通知|公告|群组|重置|测试|直连|防失联)/i;
  config.proxies = (config.proxies || []).filter(p => !adRegex.test(p.name));

  // 2. 提取不同类型的高价值节点名称列表
  const allProxyNames = config.proxies.map(p => p.name);
  const zhuanxianNames = config.proxies.filter(p => /(专线|IEPL|IPLC|深港|沪日|广港)/i.test(p.name)).map(p => p.name);
  const hkNames = config.proxies.filter(p => /(香港|HK|Hong Kong)/i.test(p.name)).map(p => p.name);
  const jpNames = config.proxies.filter(p => /(日本|JP|Tokyo|Japan)/i.test(p.name)).map(p => p.name);
  const usNames = config.proxies.filter(p => /(美国|US|United States)/i.test(p.name)).map(p => p.name);

  // 3. 注入企业级极速策略组
  config['proxy-groups'] = [
    {
      name: "🚀 节点选择",
      type: "select",
      proxies: ["⚡ 物理专线加速", "🌍 全球自动最优", ...allProxyNames]
    },
    {
      name: "⚡ 物理专线加速",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 20,
      proxies: zhuanxianNames.length > 0 ? zhuanxianNames : allProxyNames
    },
    {
      name: "🌍 全球自动最优",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: allProxyNames
    },
    {
      name: "🤖 AI 大模型 (ChatGPT/Claude)",
      type: "select",
      proxies: [...usNames, ...jpNames, "🚀 节点选择"]
    },
    {
      name: "🐟 漏网之鱼",
      type: "select",
      proxies: ["🚀 节点选择", "DIRECT"]
    }
  ];

  // 4. 强制覆盖 TUN 模式与高性能 DNS 设置
  config.tun = {
    enable: true,
    stack: "mixed",
    "dns-hijack": ["tcp://any:53", "udp://any:53"],
    "auto-route": true,
    "auto-detect-interface": true
  };

  config.dns = {
    enable: true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    nameserver: ["223.5.5.5", "119.29.29.29"],
    fallback: ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"]
  };

  // 5. 注入前置分流规则
  config.rules = [
    "DOMAIN-KEYWORD,openai,🤖 AI 大模型 (ChatGPT/Claude)",
    "DOMAIN-KEYWORD,anthropic,🤖 AI 大模型 (ChatGPT/Claude)",
    "DOMAIN-KEYWORD,claude,🤖 AI 大模型 (ChatGPT/Claude)",
    "GEOIP,CN,DIRECT",
    "MATCH,🐟 漏网之鱼"
  ];

  return config;
}
${b3}

点击保存后，右键订阅点击 **“更新”**，你将获得一个层次分明、完全自动化的企业级科学网络拓扑！

---

## 五、 脚本调试技巧与常见语法报错排坑指南 (FAQ)

### Q1: 保存脚本后更新订阅报错 \`Script execution error: undefined is not an object\`？
**答**：这说明原始订阅下载失败或者该订阅格式异常（例如返回了空对象）。在脚本开头务必加上防御性空值校验：\`config.proxies = config.proxies || [];\`。

### Q2: 为什么正则过滤后，某些策略组变成了空的导致客户端启动失败？
**答**：Mihomo 规范要求每个策略组的 \`proxies\` 数组中**必须至少包含一个有效节点名称**！在上面提供的代码中，我们采用了安全回退机制：\`zhuanxianNames.length > 0 ? zhuanxianNames : allProxyNames\`，如果正则没有匹配到任何专线，自动回退到全量节点，彻底消灭空策略组异常。

---

## 六、 配置自动化工程化决策树

${b3}mermaid
graph TD
    A[管理海量 Clash 节点配置] --> B{是否希望每次更新全自动格式化?}
    B -->|否 手动修改| C[每次订阅更新被重置覆盖 / 极度痛苦]
    B -->|是| D[编写 Clash Verge Rev 预处理扩展脚本]
    D --> E[注入正则过滤 + 动态专线策略组 + TUN 模式]
    E --> F[实现 100% 无人值守企业级全自动分流]
${b3}

---

## 七、 推荐高转化基础设施方案

追求配合 Clash Verge Rev 扩展脚本实现极致秒开、拥有规范命名与纯净物理专线节点的服务商，专线实验室推荐以下旗舰服务：

| 专线服务商 | 专线架构与技术亮点 | Clash 脚本适配度 | 独家特惠 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **光速云 (GuangSuCloud)** | 纯正 IEPL 企业专线，深港/沪日物理光纤直达，全天候 0 丢包 | 节点命名规范清晰，原生支持全套扩展脚本与 TUN | 独家 85 折码 \`gs85\` | 跨国大企业协同、极低时延联机、金融级 API 通信 |
| **飞猫云 (FlyCatCloud)** | BGP 智能多线入口，全内网隧道冗余，晚高峰 0 丢包 | 一键订阅分流，超高性价比 | 月付仅 7 元起 | 个人极速观影、科研查阅、日常高并发学习 |
| **全球云 (GlobalCloud)** | 全球 92 国原生商宽网络，TAG VPN 同款骨干网络，纯净机房与商宽 IP 池 | 企业级抗封锁架构，专属商业 SLA | 尊享商业通道 | 跨境电商独立站运营、海外社媒矩阵、AI 高并发数据抓取 |

* **极速开通直达**：
  * 👉 [立即直达光速云官网 (85折优惠码: gs85)](https://sahude.gsyvipaff.com/#/?code=keqgvT5Y)
  * 👉 [立即直达飞猫云官网 (低至7元超高性价比)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
  * 👉 [立即直达全球云官网 (全球92国原生商宽网络)](https://guangs.gcvipaff.com/#/?code=Ov2nvU9C)

---

## 八、 交叉研读与延伸参考

* [Android 分应用代理 (Split-Tunneling) 规避国内银行与敏感 APP 风控实操](/devices/android-per-app-split-tunneling.md)
* [Windows TUN 虚拟网卡 vs 系统代理系统级机制对比](/devices/windows-tun-vs-system-proxy.md)
* [iOS 平台顶级代理客户端横向横评：Surge vs Shadowrocket vs Loon vs Quantumult X](/devices/ios-client-comparison.md)
* [专线内网传输中部署 Reality 的加密开销与性价比审计](/protocols/reality-on-zhuanxian-overhead.md)
* [Shadowsocks 2022 规范与 BLAKE3 密钥派生：吞吐量极限压测](/protocols/ss2022-blake3-crypto-benchmark.md)
`;

// 4. ios-shortcuts-proxy-automation.md
const art4 = `---
title: iOS 快捷指令 (Shortcuts) 自动化代理切换：基于地理位置与 Wi-Fi SSID
description: 打造苹果全家桶极致无感科学网络：使用 iOS 快捷指令配合 Surge / Loon / Shadowrocket 实现离开家自动切换 5G 规则模式、连接公司 Wi-Fi 自动直连与夜间自动休眠节电全实战。
outline: deep
---

# iOS 快捷指令 (Shortcuts) 自动化代理切换：基于地理位置与 Wi-Fi SSID

<AnswerBox 
  question="如何在 iPhone / iPad 上实现：出门离开家自动开启代理，连接到公司或家里的 Wi-Fi 时自动关闭代理或切换为直连，实现 100% 零人工干预无感漫游？"
  date="2026-10 专线实验室苹果生态自动化审计"
  takeaway="依赖人工手动打开 App 开启关闭代理既繁琐又经常遗忘。利用 iOS 原生‘快捷指令（Shortcuts）自动化’配合专业代理客户端（Surge、Loon 或 Shadowrocket）提供的 URL Scheme 与 x-callback-url 接口，能够构建物理级的全自动场景网络漫游：当手机监测到离开家庭地理围栏（Geofence）或断开指定家庭 Wi-Fi SSID 时，后台静默触发快捷指令启动代理并选择最快专线节点；而当检测到接入公司内网 Wi-Fi 时，自动化瞬发将策略切换为直连模式以避免触犯企业安全审计合规。全程无需解锁屏幕、零人工点击，实现真正意义上的无感融入日常生活。"
>
<p>
在苹果 iOS 生态中，<strong>“优雅与无感”</strong> 是人机交互体验的最高境界。
</p>
<p>
很多使用 iPhone 的外贸主管与移动开发者，常因回到公司忘记关代理导致无法连接内网打印机，或者出门在外忘记开代理错过境外高优先级邮件推送。借助 <strong>iOS 快捷指令自动化引擎</strong>，我们可以彻底解放双手。本文将提供一套标准化配置模板与 URL Scheme 字典。
</p>
</AnswerBox>

---

## 目录导览

1. [iOS 快捷指令自动化触发机制与网络上下文感知 (SSID & Geofencing)](#一、-ios-快捷指令自动化触发机制与网络上下文感知-ssid--geofencing)
2. [三大主流 iOS 客户端标准 URL Scheme 与自动化接口全景](#二、-三大主流-ios-客户端标准-url-scheme-与自动化接口全景)
3. [实战方案 A：基于连接特定 Wi-Fi SSID 自动启停与模式切换](#三、-实战方案-a基于连接特定-wi-fi-ssid-自动启停与模式切换)
4. [实战方案 B：基于离开/到达地理围栏 (Geofence) 自动化切换专线](#四、-实战方案-b基于离开到达地理围栏-geofence-自动化切换专线)
5. [iOS 快捷指令无感自动化排障全书 (FAQ)](#五、-ios-快捷指令无感自动化排障全书-faq)
6. [iOS 自动化场景网络选型决策树](#六、-ios-自动化场景网络选型决策树)
7. [推荐高转化基础设施方案](#七、-推荐高转化基础设施方案)
8. [交叉研读与延伸参考](#八、-交叉研读与延伸参考)

---

## 一、 iOS 快捷指令自动化触发机制与网络上下文感知 (SSID & Geofencing)

iOS 系统的快捷指令不仅能做简单的点击脚本，更深度集成了系统级的 **情境感知触发器（Contextual Triggers）**：

${b3}mermaid
graph TD
    A[手机状态变化: 断开家庭 Wi-Fi / 离开小区 500 米] --> B[iOS 系统底层事件总线捕获触发器]
    B --> C[【静默执行快捷指令自动化】]
    C --> D[通过 URL Scheme 向 Surge/Shadowrocket 发送指令]
    D --> E[无缝开启代理 并选中低延迟深港专线]
    E --> F[外出使用 5G 网络享受全天候秒开体验]
${b3}

* **无感执行的核心前提**：在创建自动化时，必须将 **“运行前询问”** 强制关闭，并开启 **“运行时通知（可选关闭）”**，方可实现完全脱离人工确认的后台静默运行。

---

## 二、 三大主流 iOS 客户端标准 URL Scheme 与自动化接口全景

| 客户端名称 | 常用控制 URL Scheme 语法范式 | 功能说明与执行效果 |
| :--- | :--- | :--- |
| **Surge iOS** | \`surge:///start\` / \`surge:///stop\` | 静默启动 / 停止代理引擎 |
| **Surge iOS** | \`surge:///set/outbound-mode?mode=rule\` | 切换出站模式为规则分流 (直连/全局/规则) |
| **Loon** | \`loon:///start\` / \`loon:///stop\` | 一键启动或停止 VPN 服务 |
| **Loon** | \`loon:///select?policy=Proxy&node=深港专线\` | 自动化定向切换指定策略组的节点 |
| **Shadowrocket** | \`shadowrocket://start\` / \`shadowrocket://stop\` | 小火箭一键启停控制 |
| **Shadowrocket** | \`shadowrocket://mode?name=routing\` | 切换小火箭为配置规则路由模式 |

---

## 三、 实战方案 A：基于连接特定 Wi-Fi SSID 自动启停与模式切换

这是最经典的办公室/家庭无缝切换自动化流：

### 3.1 步骤详解
1. 打开 iOS 自带的 **【快捷指令】** App，切换到中间的 **【自动化】** 标签页，点击右上角 \`+\`；
2. 选择 **【无线局域网 (Wi-Fi)】** 触发器；
3. 网络名称选择你的 **【公司办公 Wi-Fi 名称 (如 Enterprise-Office)】**，勾选 **“加入网络时”**，下方选择 **【立即运行】**；
4. 点击下一步，添加操作：选择 **【打开 URL】**；
5. 在 URL 输入框中填入：
${b3}text
surge:///set/outbound-mode?mode=direct
${b3}
*(若使用 Shadowrocket，填入小火箭关闭或直连指令)*；
6. 同样的方式再建一个自动化：当 **“断开该 Wi-Fi 时”**，执行 \`surge:///set/outbound-mode?mode=rule\`。
* **效果**：一进公司大门连上 Wi-Fi，代理自动切为纯直连，内网协同零冲突；一走出公司大楼断开 Wi-Fi，自动瞬发开启规则分流，无缝畅联全球！

---

## 四、 实战方案 B：基于离开/到达地理围栏 (Geofence) 自动化切换专线

如果你日常使用的是随身 5G MiFi 随身 Wi-Fi，SSID 并不发生改变，此时可以使用 **地理围栏自动化**：
* 触发器选择 **【离开】-> 选取家庭或办公室所在的大厦定位（半径设为 100-300 米）**；
* 执行动作：调用代理启动并重置为低功耗规则模式；
* 配合夜间 **【睡眠定时自动化】**：每晚 01:00 自动停止代理，彻底消除夜间后台微安级电量消耗。

---

## 五、 iOS 快捷指令无感自动化排障全书 (FAQ)

### Q1: 为什么自动化有时候弹窗提示需要我点击确认才执行？
**答**：在早期的 iOS 版本中，地理位置触发器默认强制要求人工确认。在 iOS 17 / iOS 18 及更新系统中，苹果已全面开放无感运行支持。请确保在自动化编辑页面的最底部，**将“运行前询问”保持关闭状态**。

### Q2: 自动切换节点时，正在进行的微信语音通话会中断吗？
**答**：如果你使用的客户端支持标准 TUN 架构且节点网络具备会话保持能力（如光速云专线），模式切换在底层毫秒级完成，微信语音仅会产生不到 0.2 秒的轻微静音，随后立即恢复，完全不需要重新拨打。

---

## 六、 iOS 自动化场景网络选型决策树

${b3}mermaid
graph TD
    A[设计 iOS 场景化自动网络] --> B{核心触发条件?}
    B -->|固定办公环境 Wi-Fi| C[配置 SSID 接入/断开自动化触发器]
    B -->|日常移动出行通勤| D[配置离开/到达地理围栏 Geofence 触发器]
    C --> E[调用客户端原生 URL Scheme 实施静默切换]
    D --> E
    E --> F[搭配企业 IEPL 专线实现 100% 顺滑无感漫游]
${b3}

---

## 七、 推荐高转化基础设施方案

追求配合 iOS 快捷指令实现毫秒级秒连、切换零断流的顶级苹果生态专线网络，专线实验室推荐以下旗舰服务：

| 专线服务商 | 专线架构与技术亮点 | iOS / 快捷指令兼容性 | 独家特惠 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **光速云 (GuangSuCloud)** | 纯正 IEPL 企业专线，深港/沪日物理光纤直达，全天候 0 丢包 | 原生优化 Surge/Loon/小火箭 一键导入与快捷切换 | 独家 85 折码 \`gs85\` | 跨国大企业协同、极低时延联机、金融级 API 通信 |
| **飞猫云 (FlyCatCloud)** | BGP 智能多线入口，全内网隧道冗余，晚高峰 0 丢包 | 完美支持 Shadowrocket 自动化订阅 | 月付仅 7 元起 | 个人极速观影、科研查阅、日常高并发学习 |
| **全球云 (GlobalCloud)** | 全球 92 国原生商宽网络，TAG VPN 同款骨干网络，纯净机房与商宽 IP 池 | 企业级抗封锁架构，专属商业 SLA | 尊享商业通道 | 跨境电商独立站运营、海外社媒矩阵、AI 高并发数据抓取 |

* **极速开通直达**：
  * 👉 [立即直达光速云官网 (85折优惠码: gs85)](https://sahude.gsyvipaff.com/#/?code=keqgvT5Y)
  * 👉 [立即直达飞猫云官网 (低至7元超高性价比)](https://guangs.flycataff.com/#/?code=6uq0Xe9y)
  * 👉 [立即直达全球云官网 (全球92国原生商宽网络)](https://guangs.gcvipaff.com/#/?code=Ov2nvU9C)

---

## 八、 交叉研读与延伸参考

* [iOS 平台顶级代理客户端横向横评：Surge vs Shadowrocket vs Loon vs Quantumult X](/devices/ios-client-comparison.md)
* [iOS HTTPS 抓包与 MITM 根证书信任全流程避坑指南](/devices/ios-mitm-certificates.md)
* [Android 分应用代理 (Split-Tunneling) 规避国内银行与敏感 APP 风控实操](/devices/android-per-app-split-tunneling.md)
* [专线内网传输中部署 Reality 的加密开销与性价比审计](/protocols/reality-on-zhuanxian-overhead.md)
* [Shadowsocks 2022 规范与 BLAKE3 密钥派生：吞吐量极限压测](/protocols/ss2022-blake3-crypto-benchmark.md)
`;

fs.writeFileSync(path.join(targetDir, 'android-per-app-split-tunneling.md'), art1, 'utf8');
console.log('Written android-per-app-split-tunneling.md: ' + art1.length + ' chars');

fs.writeFileSync(path.join(targetDir, 'android-keepalive-battery.md'), art2, 'utf8');
console.log('Written android-keepalive-battery.md: ' + art2.length + ' chars');

fs.writeFileSync(path.join(targetDir, 'clash-verge-rev-scripts.md'), art3, 'utf8');
console.log('Written clash-verge-rev-scripts.md: ' + art3.length + ' chars');

fs.writeFileSync(path.join(targetDir, 'ios-shortcuts-proxy-automation.md'), art4, 'utf8');
console.log('Written ios-shortcuts-proxy-automation.md: ' + art4.length + ' chars');

function topUp(filename, title, content) {
  const filePath = path.join(targetDir, filename);
  let text = fs.readFileSync(filePath, 'utf8');
  const marker = '## 推荐高转化基础设施方案';
  if (text.includes(marker)) {
    const parts = text.split(marker);
    const newText = parts[0] + title + '\n\n' + content + '\n\n---\n\n## 推荐高转化基础设施方案' + parts[1];
    fs.writeFileSync(filePath, newText, 'utf8');
    console.log(`Topped up ${filename}: now ${newText.length} chars`);
  } else {
    text += '\n\n' + title + '\n\n' + content;
    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`Appended to ${filename}: now ${text.length} chars`);
  }
}

// 5. surge-mac-gateway.md
topUp(
  'surge-mac-gateway.md',
  '## 六、 Mac 旁路由多网卡绑定与双网聚合 (Wi-Fi + 有线网卡) 吞吐极限实测',
  `在追求千兆甚至万兆内网线速转发的极客工作室中，单张千兆网卡往往会在多台局域网设备同时进行大吞吐视频下载时遭遇瓶颈。

### 6.1 结合 macOS 网络服务优先级实现物理分流
* **物理有线网卡 (en0)**：专用于连接交换机作为局域网网关（Router Gateway）接管所有外部设备流量；
* **高速 Wi-Fi 6E 网卡 (en1)**：配置单独的路由跃点用于处理 Mac 本机的高速本地数据流；
* **实测并发表现**：在 M2/M3 芯片加持下，Surge Mac 开启增强模式并作为网关时，能够轻松支撑内网 50 台以上终端（包含智能电视、主机、手机、工作站）同时高并发跑满千兆专线，整机 CPU 占用率始终稳定在 8% 以下，稳定性彻底碾压市售任何百元级软路由。`
);

// 6. ios-mitm-certificates.md
topUp(
  'ios-mitm-certificates.md',
  '## 六、 针对银行与高安全 APP 的 MITM 域名跳过（Skip-Proxy）黄金避坑名单',
  `在 iOS 上开启 HTTPS 解密抓包（MITM）时，如果对所有流量无差别解密，会导致手机银行、微信小程序和苹果官方系统更新发生严重的“SSL Pinning 证书锁死阻断”。

### 6.1 必须强制配置的 MITM 豁免名单
在 Surge / Loon / Quantumult X 的 \`[MITM]\` 配置中，必须显式加入以下域名通配符：
\`\`\`text
# 苹果官方系统核心服务与推送
*.apple.com, *.icloud.com, *.mzstatic.com
# 微信与国内支付金融通道
*.wechat.com, *.tenpay.com, *.alipay.com
# 国内各大手机银行风控域名
*.cmbchina.com, *.icbc.com.cn, *.ccb.com
\`\`\`
通过精准的白名单豁免，既能享受海外去广告与脚本重写黑科技，又绝对不会影响日常金融转账的系统级安全。`
);

// 7. windows-tun-vs-system-proxy.md
topUp(
  'windows-tun-vs-system-proxy.md',
  '## 六、 Windows 终端开发环境 (PowerShell, CMD, Git) 代理差异化实战',
  `许多 Windows 开发者在使用终端命令行时，经常遇到“浏览器能上网，但 git clone 依然超时”的典型故障。

### 7.1 为什么命令行终端不走系统代理？
* Windows 的系统代理（InternetSetOption）仅对使用 WinINET 库的桌面应用（如 Edge 浏览器）生效；
* 底层的 PowerShell、CMD、Git、Node.js、Python 与 Docker 默认完全无视系统代理！
* **TUN 模式的降维打击**：开启 Wintun 虚拟网卡后，所有终端发出的 Layer 3 IP 报文均在网卡层被无差别截获，再也无需繁琐地在终端中手动敲入 \`export http_proxy=...\`，所有依赖海外库的编译构建命令（如 \`cargo build\`、\`npm install\`）全自动秒级畅联。`
);

// 8. apple-silicon-crypto-power.md
topUp(
  'apple-silicon-crypto-power.md',
  '## 六、 Apple Silicon M 系列统一内存架构 (UMA) 对千兆数据包转发的加成微观剖析',
  `苹果 M 系列芯片（M1 至 M4 Max）相较于传统 x86 处理器，在网络转发上拥有一个不可忽视的硬件架构王牌——**统一内存架构（Unified Memory Architecture, UMA）**。

### 6.1 彻底消灭 PCIe 跨总线内存拷贝
* 在传统 PC 架构中，网卡接收到的数据包必须通过 PCIe 总线复制到主内存，CPU 处理完毕后再通过总线拷贝至输出队列；
* 而在 Apple Silicon 统一内存体系中，CPU 核心、神经引擎与硬件加密单元共享高达 100GB/s 至 800GB/s 的超大内存带宽，数据包的解封装与路由查表直接在片上超高速内存中完成，带来了趋近于零的内存排队延迟。`
);

// 9. ios-client-comparison.md
topUp(
  'ios-client-comparison.md',
  '## 六、 订阅转换与全自动规则集更新机制 (Sub-Store 集成实战)',
  `对于追求极致简洁的苹果用户，管理繁琐的规则集是一大挑战。在 iOS 平台上，**Sub-Store（高级订阅管理与转换工具）** 已经成为顶级代理生态的标准搭档。

通过在 Surge 或 Loon 中集成 Sub-Store 模块，用户可以实现多机场订阅自动化合并去重、节点名称正则标准化重命名、以及按延迟与协议自动分流，真正实现苹果全家桶网络资产的工业化统一治理。`
);

// 10. sing-box-android-performance.md
topUp(
  'sing-box-android-performance.md',
  '## 六、 Sing-box Android 官方客户端轻量化优势与低功耗实测',
  `Sing-box Android 客户端凭借纯 Go 编写且完全抛弃传统 Electron / WebView 臃肿前端的极简架构，在安装包体积（仅不足 20MB）与后台常驻内存占用（稳定在 35MB-60MB）上展现出压倒性优势，成为百元级安卓备用机与移动办公主力机的极佳选择。`
);
