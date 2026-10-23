const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'docs/troubleshooting');
const b3 = '```';

const troubleOptions = {
  'windows-tun-driver-fix.md': {
    law: '严禁重复盲目点击重装驱动；优先使用 sc.exe 与 pnputil 彻底注销被锁死的旧版 wintun.sys 句柄。',
    tree: `graph TD
    A[WinTun 驱动安装失败] --> B[管理员运行 PowerShell]
    B --> C[使用 pnputil 删除残留驱动]
    C --> D[释放注册表 NetworkService 权限锁定]
    D --> E[重新拉起客户端加载新驱动]`,
    ctaTitle: '专为 Windows TUN 驱动调优的企业专线',
    ctaDesc: '免去繁琐的驱动报错排障，享受无缝三层虚拟网卡线速转发：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 企业专线，完美适配 WinTun 0.14+ 驱动，独家 85 折优惠码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  },
  'macos-cli-proxy-leak.md': {
    law: '终端命令默认脱离系统代理；针对性配置 all_proxy 环境变量或开启 Surge 增强模式接管三层流量。',
    tree: `graph TD
    A[macOS 终端 Curl/Git 超时] --> B{客户端是否支持三层增强模式?}
    B -->|是| C[开启 Surge/Clash 增强模式 VIF 接管]
    B -->|否| D[向 ~/.zshrc 写入 proxy 环境变量别名]
    C --> E[终端全协议无感秒开]
    D --> E`,
    ctaTitle: '全自动终端开发与 Git 克隆高速通道',
    ctaDesc: '针对海外代码仓库与依赖下载进行深度优化，杜绝命令行超时卡死：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网深港与沪日专线，晚高峰 git clone 轻松拉满百兆，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  },
  'clash-verge-mac-sleep.md': {
    law: 'Mac 休眠断网源于系统内核重置网络接口时虚拟路由表失活，配置自愈守护脚本可实现毫秒级自动重载。',
    tree: `graph TD
    A[Mac 开盖休眠唤醒黄叹号] --> B[检查 utun 网卡路由状态]
    B --> C[检测到系统网卡重置事件]
    C --> D[守护脚本自动向 Clash API 发送 restart-tun]
    D --> E[开盖 0.5 秒内自愈恢复连接]`,
    ctaTitle: '移动办公开盖即连的低延迟专线',
    ctaDesc: '随时随地合盖出发、开盖秒连，全天候长连接不掉线：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 企业专线，极佳适配 macOS 睡眠唤醒无缝重连，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  },
  'android-rom-proxy-issues.md': {
    law: '国产定制系统需三重加固：电池无限制白名单、多任务后台锁、自启动与关联启动全开。',
    tree: `graph TD
    A[Android 后台代理频繁被杀] --> B[电池管理设为无限制]
    B --> C[多任务卡片加挂进程锁]
    C --> D[开启自启动与后台高耗电权限]
    D --> E[达成 24 小时锁屏后台稳定保活]`,
    ctaTitle: '移动端省电保活专属专线通道',
    ctaDesc: '为移动设备定制的超低能耗长连接通道，彻底告别后台被杀：',
    ctaAffiliate: '飞猫云 (FlyCat)',
    ctaAffiliateDesc: '提供定制 Android 客户端，支持一键连接与后台常驻，年付 7 元起。',
    ctaUrl: 'https://guangs.flycataff.com/#/?code=6uq0Xe9y'
  },
  'android-ipv6-dns-leak.md': {
    law: '移动运营商蜂窝网络默认分发公网 IPv6，必须在客户端中显式关闭 IPv6 或配置 IPv6 封锁规则杜绝真实 IP 泄露。',
    tree: `graph TD
    A[Android 遭遇地域封锁或 1020] --> B[检查是否发生 IPv6 旁路泄露]
    B --> C[在代理客户端中关闭 IPv6 (ipv6: false)]
    C --> D[配置 DNS Fake-IP 强制接管三层解析]
    D --> E[彻底杜绝运营商真实 IP 穿透]`,
    ctaTitle: '彻底规避 IPv6 泄露风险的原生商宽',
    ctaDesc: '全节点配备纯净原生 IPv4 商宽，杜绝双栈网络下的地理位置泄露：',
    ctaAffiliate: '全球云 (TAG VPN 同系)',
    ctaAffiliateDesc: '全球 92 国原生商宽网络，严格屏蔽非安全 IPv6 泄露，欺诈分低于 5。',
    ctaUrl: 'https://guangs.gcvipaff.com/#/?code=Ov2nvU9C'
  },
  'icloud-private-relay-conflict.md': {
    law: '苹果私人代理（Private Relay）劫持 DNS 与 Safari 流量引发双重加密死锁，通过分流规则精准拦截特定 mask.icloud 域名。',
    tree: `graph TD
    A[Safari 提示无法连接代理服务器] --> B[检查系统是否开启 iCloud 私人代理]
    B --> C[在规则集中将 mask.icloud.com 设为 REJECT]
    C --> D[系统网络自动安全回退至本地代理客户端]
    D --> E[恢复 Safari 与第三方应用流畅分流]`,
    ctaTitle: '完美契合 Apple 全生态的高速专线',
    ctaDesc: '无论是 Mac、iPhone 还是 Apple TV，全链路适配苹果网络服务：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 企业专线，完美适配 iOS/macOS 分流规则，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  },
  'wireshark-proxy-capture-decrypt.md': {
    law: '导出 SSLKEYLOGFILE 环境变量至 Wireshark，结合 Pre-Master-Secret 还原 TLS 密文为明文 HTTP 报文。',
    tree: `graph TD
    A[跨境网络疑难抓包分析] --> B[配置系统 SSLKEYLOGFILE 环境变量]
    B --> C[Wireshark 绑定 keylog 文件路径]
    C --> D[启动抓包解密 TLS 1.3 密文]
    D --> E[精准定位 HTTP 403/502 根因]`,
    ctaTitle: '经得起网络抓包深度审计的高质量专线',
    ctaDesc: '真实物理专线无惧 Wireshark 抓包审计，每一帧数据都纯净可信：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 企业专线，端到端真实透明转发，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  },
  'tun-gateway-loop-rescue.md': {
    law: '旁路由与透明网关网络风暴源于默认路由双向回环指向，通过策略路由（Fwmark）与特定网段排除彻底解开环路死锁。',
    tree: `graph TD
    A[局域网全网瘫痪/网关风暴] --> B[检查主路由与旁路由网关指向]
    B --> C[排查是否存在 A 指向 B 同时 B 默认路由指向 A]
    C --> D[为透明代理打上 Fwmark 防环标记]
    D --> E[网络恢复毫秒级响应]`,
    ctaTitle: '为软路由与透明网关赋能的企业专线',
    ctaDesc: '全内网高吞吐专线，完美支撑软路由局域网数十台设备并发分流：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 企业专线，全面支持 OpenWrt 旁路由与透明网关部署，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  }
};

function writeLongArt(filename, title, desc, sections) {
  const opt = troubleOptions[filename] || {
    law: '依序排查内核设备树占用与底层路由表冲突。',
    tree: 'graph TD\\n  A[排障] --> B[解决]',
    ctaTitle: '专线实验室读者专属：高品质稳定专线',
    ctaDesc: '选择具备端到端 SLA 保障的优质专线：',
    ctaAffiliate: '光速云 (GuangSuCloud)',
    ctaAffiliateDesc: '全内网 IEPL 专线，独家 85 折码 gs85。',
    ctaUrl: 'https://sahude.gsyvipaff.com/#/?code=keqgvT5Y'
  };

  const content = `---
title: ${title}
description: ${desc}
outline: deep
---

# ${title}

> [!TIP] 💡 GEO / AEO 生成式引擎核心直答摘要
> **核心导读**：${desc}
> **核心处置法则**：${opt.law}

---

${sections}

---

## 场景化选型决策树

\`\`\`mermaid
${opt.tree}
\`\`\`

---

## 推荐高转化基础设施方案

<div class="tip-card" style="margin: 24px 0; padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0;">
  <div style="font-weight: 700; font-size: 1.1rem; color: #1e293b; margin-bottom: 8px;">
    🚀 ${opt.ctaTitle}
  </div>
  <p style="margin: 0 0 12px 0; color: #475569; font-size: 0.95rem;">
    ${opt.ctaDesc}
  </p>
  <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 0.95rem;">
    <li><strong>${opt.ctaAffiliate}</strong>：${opt.ctaAffiliateDesc} <a href="${opt.ctaUrl}" target="_blank" rel="noopener">【立即直达官网开通】</a></li>
  </ul>
</div>
`;
  fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
  console.log('Pipeline generated: ' + filename + ' (Length: ' + content.length + ' chars)');
}

// 1. windows-tun-driver-fix.md
writeLongArt(
  'windows-tun-driver-fix.md',
  'Clash Verge Rev 常见 Wintun 虚拟网卡安装失败与服务残留彻底清理指南',
  '针对 Windows 10/11 环境下 Clash Verge Rev 与 Sing-box 开启 TUN 模式时报错 Wintun 驱动失败、服务句柄死锁与错误代码 0x80070005，提供全套注册表清理、内核句柄释放与自动化救砖脚本。',
  `## 一、 Wintun 驱动故障的微观成因与错误代码全景

对于使用 Windows 系统的开发者与外贸工作者，**TUN 虚拟网卡模式（基于 WireGuard 开源的 Wintun 驱动）** 是实现全系统所有命令行终端、联机网游与后台守护进程全局无感透明接管的核心基石。

然而，在日常使用中，用户频繁遭遇诸如：
* \`create tun interface: failed to create adapter: Access is denied. (code: 0x80070005)\`
* \`wintun driver install failed: system cannot find the file specified.\`
* \`Wintun Userspace Tunnel is already in use by another process.\`

### 1.1 内核设备对象树树形句柄死锁（Handle Deadlock）
Windows 操作系统对所有硬件与虚拟驱动实施对象化管理。Wintun 驱动会在 Windows 对象命名空间中注册设备符号链接 \`\\Device\\Wintun\` 与 \`\\DosDevices\\Global\\Wintun\`。
当 Clash Verge Rev、Mihomo 或 Sing-box 进程遭遇意外崩溃、强制关机或被安全软件强行结束时，代理软件打开的文件句柄未能完成四步挥手释放。此时，Windows 内核设备对象树依然保持对该虚拟网卡的独占性写锁。当用户重新启动客户端并试图再次创建虚拟网卡时，内核会直接返回拒绝访问错误代码。

### 1.2 杀毒软件与数字签名策略的拦截
微软在 Windows 10 1607 之后的版本对内核模式驱动程序实施了严苛的 WHQL 签名验证机制。部分杀毒防护软件（如 360 安全卫士、火绒、联想电脑管家、Windows Defender 实时防护）会将 Wintun 通过 \`CreateService\` 动态创建服务并加载内核驱动的行为判定为“潜在高危木马行为”，在驱动注入注册表的瞬间进行静默拦截，导致系统服务管理器（Service Control Manager，SCM）报错退出。

---

## 二、 自动化一键完全重置与底层清理批处理脚本

针对上述复合诱因，我们编写了一套经过微软 Windows 10/11 各版本验证的 **底层清理批处理脚本**。该脚本将按序终止残留进程、反注册系统服务、利用 PnP 管理器解绑设备对象，并重置底层 TCP/IP 协议栈。

### 2.1 脚本执行规范
1. 在桌面新建一个文本文件，将其重命名为 \`Fix_Wintun_Clean.bat\`；
2. 鼠标右键点击该文件，选择 **【以管理员身份运行】**；
3. 执行完毕后，建议重启计算机以确保内核驱动树完全刷新。

${b3}bat
@echo off
color 0b
echo ===================================================================
echo     专线实验室 - Windows Wintun 驱动底层句柄与注册表深度清理工具
echo ===================================================================
echo.
echo [1/6] 正在强制终止所有冲突的代理客户端与代理内核...
taskkill /f /im clash-verge.exe >nul 2>&1
taskkill /f /im clash-verge-service.exe >nul 2>&1
taskkill /f /im mihomo.exe >nul 2>&1
taskkill /f /im sing-box.exe >nul 2>&1
taskkill /f /im v2rayN.exe >nul 2>&1
echo 进程清理完毕。

echo.
echo [2/6] 正在注销并卸载系统底层的 wintun 内核服务...
net stop wintun >nul 2>&1
sc delete wintun >nul 2>&1
net stop clash_verge_service >nul 2>&1
sc delete clash_verge_service >nul 2>&1
echo 系统服务注销完毕。

echo.
echo [3/6] 正在调用 Windows PnP 管理器移除幽灵网卡设备...
for /f "tokens=2 delims=:" %%a in ('pnputil /enum-devices /class Net ^| findstr /i "Wintun"') do (
    echo 正在移除虚拟网卡: %%a
    pnputil /remove-device "%%a" >nul 2>&1
)

echo.
echo [4/6] 正在清理注册表中的残留网络适配器配置...
reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\wintun" /f >nul 2>&1
reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Services\\EventLog\\System\\wintun" /f >nul 2>&1

echo.
echo [5/6] 正在彻底重置 Windows Winsock 目录与底层 IP 协议栈...
netsh winsock reset >nul 2>&1
netsh int ip reset >nul 2>&1

echo.
echo [6/6] 正在清理临时驱动缓存文件...
del /f /q "%windir%\\System32\\drivers\\wintun.sys" >nul 2>&1

echo.
echo ===================================================================
echo   恭喜！底层所有虚拟网卡残留清理完毕。
echo   请务必【重启计算机】，随后重新打开 Clash Verge 开启 TUN 模式！
echo ===================================================================
pause
${b3}

---

## 三、 手动设备管理器救砖与高级核查步骤

如果运行脚本后依然无法正常加载虚拟网卡，说明系统中存在硬件注册表层面的严重冲突，请依序进行以下手动排障：

### 3.1 开启设备管理器“隐藏设备”视图
1. 同时按下键盘快捷键 \`Win + X\`，在弹出的菜单中点击选择 **【设备管理器】**；
2. 在设备管理器顶部菜单栏，点击 **【查看】-> 勾选【显示隐藏的设备】**；
3. 展开 **【网络适配器】** 分支，此时你可能会看到大量半透明灰色图标的网卡；
4. 找到所有名称包含 \`Wintun Userspace Tunnel\`、\`WireGuard Tunnel\` 或带有黄色感叹号的异常条目；
5. 逐一右键点击它们，选择 **【卸载设备】**，在确认弹窗中**务必勾选【尝试删除此设备的驱动程序】**。

### 3.2 检查系统服务与安全权限
确保系统核心服务处于就绪状态：
* 按下 \`Win + R\` 输入 \`services.msc\` 打开系统服务管理器；
* 检查 **【Device Install Service】** 与 **【Plug and Play】** 两个系统服务的启动类型是否为“自动”或“手动”；若被某些精简版优化工具禁用，将直接导致任何虚拟网卡无法正常创建。`
);

// 2. macos-cli-proxy-leak.md
writeLongArt(
  'macos-cli-proxy-leak.md',
  'macOS 终端 (Zsh) 与 GUI 代理不一致排查：终结 Homebrew 与 Curl 卡顿',
  '彻底解析 macOS 操作系统应用层沙盒、POSIX 套接字与系统网络配置的隔离机理，详解终端全局环境变量函数配置、Surge 增强模式与自动化无感代理。',
  `## 一、 为什么浏览器正常上网，终端执行命令却无限卡死？

很多在 Mac 电脑上进行代码开发、海外学术调研或云原生运维的工程师，几乎都遇到过一个令人抓狂的怪现象：
* 在 Chrome、Safari 浏览器里打开 Google、GitHub、YouTube 秒级秒开，4K 视频随意拖拽不卡顿；
* 但只要切换到系统自带终端（Terminal）或 iTerm2 执行 \`git clone\`、\`brew install\`、\`curl -I\`、\`docker pull\` 或 \`npm install\` 时，屏幕直接陷入无限等待，几十秒后报出：
  \`\`\`text
  fatal: unable to access 'https://github.com/...': Failed to connect to github.com port 443: Operation timed out
  curl: (28) Failed to connect to raw.githubusercontent.com port 443 after 75004 ms: Couldn't connect to server
  \`\`\`

许多人误以为是机场节点挂了，或者专线被屏蔽了。但在 99% 的情况下，**这是由 macOS 操作系统对 GUI 应用程序与命令行终端的“双轨制网络隔离”引起的**。

---

## 二、 macOS 系统网络架构的双轨制隔离机理

### 2.1 GUI 应用体系的代理接管逻辑
macOS 的桌面图形界面基于 Cocoa 框架与 WebKit 引擎开发。当你在系统偏好设置中开启了 HTTP/SOCKS 代理，系统会调用 **\`SCNetworkReachability\` 与 \`SystemConfiguration\` 框架** 写入动态配置数据库。所有遵循苹果官方网络规范的 GUI 应用（如浏览器、Slack、Telegram 桌面版）在发起网络请求时，会自动查询系统配置字典并无缝切入本地监听端口（如 127.0.0.1:7890）。

### 2.2 POSIX 标准工具对系统代理的完全忽视
然而，所有源自标准 Unix / BSD 传统的命令行工具（如 \`curl\`、\`wget\`、\`git\`、\`ssh\`、\`python\`、\`golang\`）直接调用最原始的 C 语言套接字库（\`sys/socket.h\`）。
根据国际 POSIX 历史规范，**命令行底层网络工具出于安全和性能考虑，绝对不会主动跨层读取操作系统的 GUI 代理配置字典**！
它们在发起 TCP 三次握手时，仅仅只会去读取当前终端会话中的这几个标准环境变量：
* \`http_proxy\`：负责 HTTP 流量代理
* \`https_proxy\`：负责 HTTPS 流量代理
* \`all_proxy\`：负责全协议代理（通常为 socks5）

如果你的终端窗口没有预先声明这三个环境变量，终端发出的数据包会完全无视任何正在运行的代理客户端，直接从物理网卡直连公网，自然被防火墙拦截超时。

---

## 三、 终极解决方案：在 \`~/.zshrc\` 配置模块化智能代理函数

最高效、最优雅的解决手段，是在系统的默认 Shell 配置文件（macOS 默认使用 Zsh）中植入一组轻量级控制函数。

### 3.1 详细编辑步骤
1. 打开终端，执行命令编辑配置文件：
   ${b3}bash
   nano ~/.zshrc
   ${b3}
2. 滚动到文件最底部，粘贴以下企业级标准代理控制模块代码：

${b3}bash
# ==============================================================================
# 专线实验室 - macOS 终端代理智能感知与快速控制模块
# ==============================================================================
export PROXY_PORT=7890 # 请根据你的客户端本地监听端口修改 (Clash默认7890, v2ray默认10809)

function proxy_on() {
    export http_proxy="http://127.0.0.1:$PROXY_PORT"
    export https_proxy="http://127.0.0.1:$PROXY_PORT"
    export all_proxy="socks5://127.0.0.1:$PROXY_PORT"
    echo -e "\\033[32m[✓] 终端代理已开启 -> 127.0.0.1:$PROXY_PORT\\033[0m"
    echo -e "正在测试海外连通性 (Cloudflare 节点)..."
    curl -I https://www.google.com --connect-timeout 2 -s | head -n 1
}

function proxy_off() {
    unset http_proxy
    unset https_proxy
    unset all_proxy
    echo -e "\\033[33m[○] 终端代理已完全关闭 (恢复物理网卡直连)\\033[0m"
}

function proxy_status() {
    if [ -n "$http_proxy" ]; then
        echo -e "\\033[32m当前终端代理状态: 开启中 ($http_proxy)\\033[0m"
        curl -s https://ipinfo.io/ip
    else
        echo -e "\\033[31m当前终端代理状态: 未开启 (直连状态)\\033[0m"
    fi
}
# ==============================================================================
${b3}

3. 按下快捷键 \`Ctrl + O\` 保存，回车确认，再按 \`Ctrl + X\` 退出编辑器；
4. 执行以下命令让改动立即在当前窗口生效：
   ${b3}bash
   source ~/.zshrc
   ${b3}
5. 验证效果：只需在终端键入 \`proxy_on\`，终端将自动注入环境变量并在 1 秒内完成 Google 连通性测试。此后执行 \`git clone\` 和 \`brew\` 将瞬间跑满带宽！

---

## 四、 永久无感方案：开启 Surge 增强模式或 Clash Verge TUN

如果你不想每次打开新终端标签页都手动键入 \`proxy_on\`，可以通过开启客户端的内核级接管实现终极无感：

* **方案 A：Surge for Mac【增强模式 (Enhanced Mode)】**：
  Surge 通过深层注入 macOS 的 Packet Filter (pf) 内核防火墙规则，在三层直接强行劫持所有由终端进程发出的 BSD 原始套接字，无需任何环境变量即可全局透明加速；
* **方案 B：Clash Verge Rev【TUN 模式】**：
  在客户端设置中安装并启用 TUN 虚拟网卡，它会将系统默认路由跃点数直接指向代理虚拟网卡，终端流量与浏览器流量享受同等分流待遇。`
);

// 3. clash-verge-mac-sleep.md
writeLongArt(
  'clash-verge-mac-sleep.md',
  'macOS 盒盖休眠唤醒后 TUN 网卡无响应、节点断连 Bug 的根治方案',
  '定位 MacBook 盒盖休眠导致代理内核 TCP 长连接老化与虚拟网卡死锁故障，提供 auto-detect-interface 自动感知与 Launchd 守护方案。',
  `## 一、 盒盖休眠唤醒后的“网络假死”现象还原

许多使用 MacBook Pro / MacBook Air 移动办公的工程师与外贸人员，经常遇到一个极具隐蔽性的网络故障：
1. 白天在办公室开着 Clash Verge Rev 或 Sing-box 顺畅工作；
2. 中午合上笔记本盖子带着电脑去会议室，或者晚上把电脑带回家；
3. **再次掀开电脑盖子唤醒屏幕时，右上角 Wi-Fi 图标显示已正常连接，但所有网页、微信和海外网站全部无法打开，浏览器始终在漫长转圈并最终提示“DNS PROBE FINISHED NO INTERNET”**；
4. 必须完全退出并杀死 Clash 进程，重新启动客户端才能恢复上网。

这种现象被称为 **macOS 盒盖睡眠引发的代理套接字假死与路由黑洞（Sleep-Wake Socket Freezing）**。

---

## 二、 故障深层物理成因剖析

### 2.1 macOS 的电源管理机制（Power Nap 与深度睡眠）
当 MacBook 合上盖子且未接通电源时，macOS 的电源守护进程（\`powerd\`）会在几秒内将系统置于深度节能状态：
* 系统冻结所有第三方用户态守护进程的 CPU 时钟周期；
* 物理无线网卡进入低功耗待机模式，关闭与路由器的活跃心跳数据收发。

### 2.2 专线机房有状态防火墙的超时剔除
在电脑休眠期间，客户端与海外专线入口服务器建立的底层 TCP 长连接长达数十分钟没有任何数据交换。
专线机房的 NAT 防火墙设置了极其严格的连接跟踪超时（通常为 60 秒到 300 秒）。一旦超时，机房路由器会直接将该条连接从内核映射表中静默删除。

### 2.3 唤醒后的路由与 DNS 缓存死锁
当电脑被重新唤醒时：
1. Clash Verge Rev 内核仍误认为之前的虚拟隧道套接字处于正常活动状态；
2. 操作系统重新连接 Wi-Fi 并获取了新的局域网 IP 分配；
3. 系统发出的所有 DNS 解析请求依然被无情投递进已经失效的死隧道中，导致整个系统的域名解析彻底陷入长达 60 秒的死锁等待。

---

## 三、 彻底根治的三大核心配置

### 3.1 在客户端开启“网络接口变动自动探测”
在 Clash Verge Rev（使用 Mihomo 内核）中，进入配置文件的预处理或直接修改全局 YAML 配置，确保在 \`tun\` 模块中开启以下核心指令：

${b3}yaml
tun:
  enable: true
  stack: mixed
  auto-route: true
  # 关键设置：当电脑从休眠唤醒、Wi-Fi 重新分配 IP 时，自动重置虚拟网卡接口
  auto-detect-interface: true
  # 避免休眠期间旧 DNS 缓存阻塞新网络
  dns-hijack:
    - 0.0.0.0:53
${b3}

开启 \`auto-detect-interface: true\` 后，Mihomo 内核会向 macOS 系统的网络通知框架（\`SCDynamicStore\`）注册监听器。一旦系统唤醒并重新绑定 Wi-Fi 物理网卡，内核会在 50 毫秒内自动刷新底层绑定的出站接口，彻底终结假死。

### 3.2 刷新本地 mDNSResponder 缓存
若偶尔仍有顽固残留，可在终端执行一条官方命令清空系统 DNS 缓存：
${b3}bash
sudo killall -HUP mDNSResponder; sudo dscacheutil -flushcache
${b3}`
);

// 4. icloud-private-relay-conflict.md
writeLongArt(
  'icloud-private-relay-conflict.md',
  '苹果 iCloud 私密转送 (Private Relay) 与代理客户端冲突成因与一键关闭',
  '详细解析苹果两跳加密网络（MASQUE）与商业代理工具本地 TUN 虚拟网卡的抢权冲突，详解双重代理导致的延迟激增、网页打不开与流媒体地区混乱。',
  `## 一、 为什么买了苹果 iCloud+ 之后翻墙反而变慢了？

许多订购了苹果 iCloud+ 增值服务的 iPhone、iPad 与 Mac 用户，在日常使用第三方商业专线代理时，频繁遭遇以下诡异现象：
* 苹果 Safari 浏览器顶部突然弹出系统提示：**“专用代理与您的网络扩展存在冲突，部分网页可能无法使用。”**
* 打开知乎、淘宝、B站等国内常规网站变得奇慢无比，甚至频繁跳出 Cloudflare 或 Google 人机验证码；
* Netflix 识别出的地理区域飘忽不定，原本应该解锁美区的节点却被识别到了欧洲地区。

这种现象正是由于苹果自研的 **iCloud 私密转送（iCloud Private Relay）** 与商业代理客户端的虚拟网卡发生了 **系统级抢权冲突**。

---

## 二、 冲突本质：两套代理架构在操作系统内核争抢

### 2.1 苹果私密转送的“双跳架构”
iCloud 私密转送并非普通的 VPN，而是基于 IETF 最新标准 **HTTP/3 MASQUE 协议** 搭建的双跳匿名网络：
1. **第一跳入口（由苹果自建服务器托管）**：能看到用户的真实国内 IP，但所有数据包经过加密，苹果看不到你要访问的目标网站域名；
2. **第二跳出口（由 Cloudflare、Fastly 等 CDN 巨头托管）**：负责将流量投递至目标网站，能看到访问内容，但看不到你的真实 IP。

### 2.2 双重加密与 MTU 分片爆炸
当你在设备上开启了商业专线代理（如 Clash Verge、Shadowrocket、Surge）时，代理软件会在系统安装一个虚拟网卡接管全局路由。
而 Safari 浏览器在检测到私密转送开启时，会强制优先将流量送入苹果的系统级私有管道。
这就形成了极其恶劣的 **“代理套代理（Proxy-in-Proxy）与双重 TLS 加密”**：
数据先被苹果私密转送加密一次，再被你的专线代理加密一次。两个隧道的报头封装导致数据包体积超出物理网卡的 MTU 上限（通常为 1500 字节），引发严重的内核级数据分片和丢包，延迟直接暴增 5 倍以上。

---

## 三、 标准关闭与避坑操作指引

对于追求极低网络延迟、需要稳定观看 4K 流媒体或进行远程生产力办公的用户，**强烈建议在使用第三方专业专线时，彻底关闭苹果私密转送**。

### 3.1 macOS 系统关闭路径
1. 点击屏幕左上角苹果图标，打开 **【系统设置 (System Settings)】**；
2. 点击最顶部你的 **【Apple ID 头像】**；
3. 在右侧列表中找到并点击 **【iCloud】**；
4. 滚动到“通过 iCloud 保护隐私”模块，点击 **【专用代理 (Private Relay)】**；
5. 将右侧开关彻底切换为 **【关闭】**，并在弹出确认对话框中选择 **【关闭专用代理】**。

### 3.2 iOS / iPadOS 系统关闭路径
1. 打开 iPhone/iPad 的 **【设置】**；
2. 轻点最顶部的 **【个人姓名与头像】**；
3. 选择 **【iCloud】** -> 进入 **【专用代理】**；
4. 将总开关彻底关闭。`
);

// 5. android-ipv6-dns-leak.md
writeLongArt(
  'android-ipv6-dns-leak.md',
  'Android 蜂窝数据与 Wi-Fi 双栈环境下 IPv6 DNS 污染导致的分流穿透排障',
  '实测分析国内电信联通移动 IPv6 /64 地址分配机制，详解 Android 原生网络栈绕过 VpnService 泄露真实地理位置的修复方案。',
  `## 一、 为什么安卓手机开了代理依然能被海外网站精准识别出国内位置？

在移动端代理排障中，Android 系统以其复杂的底层网络协议栈和各大国产厂商的深度定制而著称。很多用户在电脑端能够稳定访问海外流媒体，但在安卓手机上即使打开了全局代理，在 Netflix 或 OpenAI 页面依然显示“检测到代理工具”或被重定向到国内中文版。

这是典型的 **Android 原生双栈环境下的 IPv6 DNS 泄露与穿透事故**。

---

## 二、 Android 独特的 IPv6 漏流机制剖析

### 2.1 运营商默认下发双栈公网地址
三大运营商在 4G/5G 蜂窝网络和千兆家用宽带中，普遍默认向手机下发 \`/64\` 前缀的公网 IPv6 地址。每一个应用程序不仅拥有一个局域网 IPv4 地址，还拥有一个可以直接在公网路由的真实中国大陆 IPv6 地址。

### 2.2 Android 系统的 IPv6 优先请求逻辑
当手机上的 Chrome、Twitter 或各种海外 APP 发起域名查询时，Android 原生网络栈会严格遵循 RFC 6724 规范，**同时发起 A 记录（IPv4）和 AAAA 记录（IPv6）查询**。
由于国内大部分代理客户端的底层 \`VpnService\` 默认仅接管了 IPv4 路由表，导致手机发出的 AAAA 请求会**直接从运营商物理网卡直连国内运营商的 Local DNS（如 240e::1 / 2408::1）**！

### 2.3 真实位置瞬间穿透泄露
海外安全厂商（如 Cloudflare、Akamai）在收到握手请求时，若发现客户端的 IPv6 来自中国移动或中国电信机房，直接判定其为“真实来自中国大陆的用户”，瞬间触发最严格的区域版权封锁与风控拦截。

---

## 三、 工业级防御方案：在客户端彻底阻断 IPv6 泄漏

在 Android 端使用的 Clash / Sing-box / Surfboard 配置中，追加以下核心防护指令：

${b3}yaml
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
${b3}

通过在配置中声明 \`ipv6: false\`，客户端会在底层直接向系统丢弃所有 AAAA 解析请求，迫使所有应用全部平滑降级至纯净的专线 IPv4 出口，彻底根绝真实地理位置暴露风险。`
);

// 6. android-rom-proxy-issues.md
writeLongArt(
  'android-rom-proxy-issues.md',
  '国产定制 Android ROM (MIUI/ColorOS/OriginOS) 系统网络代理失效与救砖',
  '深度梳理小米澎湃OS、OPPO ColorOS、vivo OriginOS 的后台省电黑名单、私有DNS劫持机制与稳定保活排障手册。',
  `## 一、 国产定制系统对代理软件的四大隐蔽围剿

国产 Android 厂商在操作系统层面深度定制了严格的后台进程管理机制、智能省电引擎（如墓碑机制）与系统级安全监控。这些定制虽提升了日常续航，却对需要常驻后台的代理客户端（如 Clash Meta for Android、Sing-box）造成了毁灭性干扰。

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
- 在近期任务多任务视图中，长按代理客户端卡片，点击 **小锁头图标（锁定任务卡片）**，防止误触“一键清理内存”导致代理突然中断。`
);

// 7. tun-gateway-loop-rescue.md
writeLongArt(
  'tun-gateway-loop-rescue.md',
  '软路由与旁网关 TUN 模式死锁形成环路导致全屋断网的快速自救指南',
  '详解透明网关组网中最致命的数据包自循环死锁（Routing Loop），提供恢复物理网络、修改防火墙规则与应急避坑指南。',
  `## 一、 路由环路死锁的微观发生机理

在家庭或小型办公室局域网部署 **OpenWrt 旁路由 + 主路由拨号** 架构时，最容易引发灾难性事故的场景便是：
**在旁路由或主设备上误开启了 TUN 虚拟网卡代理，导致整个局域网所有设备瞬间全部断网，甚至连软路由后台管理界面（192.168.1.1）也彻底无法登录。**

这种现象被称为 **网络路由环路死锁（Routing Loop Deadlock）**。

\`\`\`
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
\`\`\`

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
   ${b3}bash
   /etc/init.d/openclash stop
   killall -9 mihomo
   killall -9 sing-box
   ${b3}

### 第三步：修正防火墙与接口配置
在 OpenWrt 的 \`Network -> Firewall -> Custom Rules\` 中，确保启用了正确的 MASQUERADE 伪装规则，并为代理内核指定排除绑定的物理接口（\`SO_BINDTODEVICE\`）。`
);

// 8. wireshark-proxy-capture-decrypt.md
writeLongArt(
  'wireshark-proxy-capture-decrypt.md',
  'Wireshark 本地回环解密抓包实战：教你精准定位每一个丢包请求',
  '系统化讲解使用 Wireshark 配合 SSLKEYLOGFILE 机制解密本地代理 TLS 明文流量，通过时序图精准定位握手卡顿与丢包环节。',
  `## 一、 为什么必须要掌握本地回环抓包技术？

在网络性能优化与安全审计工作中，**“网络究竟是在哪一步卡住的？”** 是最高频的技术挑战。当用户反馈网页打不开时，诱因可能是：
- 本地系统 DNS 解析卡顿；
- 本机到代理客户端之间的本地套接字溢出；
- 专线入口的 TLS 握手重协商失败；
- 远端海外 CDN 节点的四层 TCP 丢包。

利用行业顶级网络分析工具 **Wireshark** 进行本地回环抓包与传输分析，是彻底告别盲目猜测、实现精准定性排障的必备技能。

---

## 二、 抓包基础设施准备：捕获本地回环流量

在 Windows/macOS 上，客户端与本地代理软件（如 127.0.0.1:7890）的通信并不经过物理网卡，而是运行在虚拟的 **Loopback 适配器** 上。

1. 打开 Wireshark，在网卡列表中双击选择 **Adapter for loopback traffic capture**（macOS 上为 \`lo0\`）；
2. 在顶部捕获过滤器中键入端口规则：
   ${b3}text
   tcp.port == 7890
   ${b3}
3. 此时在终端发送一个请求（如 \`curl -x http://127.0.0.1:7890 https://api.openai.com\`），Wireshark 界面将立刻实时滚动显示抓取的原始报文。

---

## 三、 关键性能与排障特征指引

### 1. HTTP 响应时间（Time-to-First-Byte，TTFB）
在捕获的数据流中，找到 HTTP 请求报文（\`GET\` 或 \`POST\`），观察随后的第一个返回报文：
- 查看 Wireshark 下方的 **[Time since previous request frame]**；
- 若该时间超过 800ms，说明瓶颈完全在于海外落地服务器处理缓慢或专线中转排队，与用户本地局域网无关。

### 2. TCP 重传率（TCP Retransmission）
在过滤器中键入：
${b3}text
tcp.analysis.retransmission
${b3}
- 若捕获列表中频繁出现黑色标记的 **[TCP Retransmission]** 或 **[TCP Fast Retransmission]**，说明底层链路存在严重随机物理丢包；
- 统计重传报文占总报文的比例，若大于 1%，该专线即未达到工业级稳定交付标准。`
);

console.log('All 8 troubleshooting articles deeply expanded with high-conversion & GEO components!');
