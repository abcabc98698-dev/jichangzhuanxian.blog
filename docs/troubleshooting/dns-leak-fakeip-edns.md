---
title: DNS 泄漏与污染终极防御 - Fake-IP 映射机理、DoH/DoT 加密解析与本地防劫持配置
description: 深度解剖 GFW 抢答注入时序与 TTL 异常特征、传统 DNS 与 EDNS-Client-Subnet 泄漏通道、Fake-IP 198.18.0.0/16 零污染出海原理、SmartDNS 翻车陷阱及生产级全加密防泄漏实操方案。
head:
  - - meta
    - name: keywords
      content: DNS泄漏, DNS污染, GFW抢答注入, Fake-IP, 198.18.0.0/16, DoH, DoT, EDNS Client Subnet, RFC 7871, SmartDNS陷阱, 智能多宿主名称解析, Wireshark抓包排查, 防劫持
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "DNS 泄漏与污染终极防御：Fake-IP 映射机理、DoH/DoT 加密解析与本地防劫持配置",
        "description": "系统解构 DNS 协议缺陷、GFW 抢答注入机理、EDNS 真实 IP 泄漏通道，详解 198.18.0.0/16 Fake-IP 虚拟地址池与生产级 DoH/DoT 双栈分流配置方案。",
        "author": {
          "@type": "Organization",
          "name": "专线机场技术实验室"
        },
        "datePublished": "2026-10-22",
        "dateModified": "2026-10-22"
      }
---

# DNS 泄漏与污染终极防御：Fake-IP 映射机理、DoH/DoT 加密解析与本地防劫持配置

<AnswerBox 
  question="如何彻底封堵 DNS 泄漏与运营商/GFW 抢答劫持？为什么普通改境外公共 DNS 依然无法杜绝污染？" 
  date="2026-10 实测更新"
  takeaway="防御 DNS 污染与泄漏的核心法则是“境内 DoH 直连 + 境外 Fake-IP 拦截 + 远程落地节点递归解析”。传统修改 8.8.8.8 会因 UDP 53 明文过境在 10~30ms 内被 GFW 旁路设备抢答注入伪造 IP；若开启 EDNS 还会暴露国内 IP 子网。终极方案应依托 Clash.Meta (Mihomo) 或 Sing-box 的 Fake-IP (198.18.0.0/16) 机制：对境内域名直连国内 DoH，对境外域名立即返回虚拟 IP 并将原始域名封入加密专线隧道由海外出口机房递归解析，配合注册表禁用 Windows 智能多宿主解析与关闭 IPv6，杜绝任何本地明文外泄。"
>
<p>
在网络排障体系中，超过 70% 的“网页打不开”、“特定流媒体提示代理被检测”以及“访问记录被本地运营商记录”的根源，不在于节点服务器宕机，而在于 <strong>DNS 解析链路发生了严重污染或泄漏</strong>。
</p>
<p>
许多用户误以为在路由器或网卡上手动填入 <code>8.8.8.8</code> 或 <code>1.1.1.1</code> 就能安全上网，但在无加密的 UDP 53 协议下，任何明文出境查询都会在骨干网出口被旁路探针秒级嗅探并抢答伪造 IP；更有甚者盲目叠加 SmartDNS 等所谓“优化插件”，导致海外 CDN 跨洋劣选与解析循环。本文将从协议底层拆解 DNS 污染与泄漏的本质，并给出工业级防御落地方案。
</p>
</AnswerBox>

---

## 目录导览

1. [GFW 抢答注入伪造 DNS 响应报文（DNS Poisoning）的时序图解与 TTL 跳变特征](#一、-gfw-抢答注入伪造-dns-响应报文-dns-poisoning-的时序图解与-ttl-跳变特征)
2. [传统客户端 DNS 泄漏通道深度剖析：Local DNS 与 EDNS-Client-Subnet 泄漏](#二、-传统客户端-dns-泄漏通道深度剖析-local-dns-与-edns-client-subnet-泄漏)
3. [Fake-IP 虚拟网段映射机制深度解剖：为什么 198.18.0.0/16 能实现 0ms 握手与零污染出海](#三、-fake-ip-虚拟网段映射机制深度解剖-为什么-198-18-0-0-16-能实现-0ms-握手与零污染出海)
4. [SmartDNS 的虚假宣传陷阱：为什么在翻墙代理环境下使用 SmartDNS 会引发严重倒退与污染](#四、-smartdns-的虚假宣传陷阱-为什么在翻墙代理环境下使用-smartdns-会引发严重倒退与污染)
5. [生产级全加密防泄漏 DNS 架构与配置文件落地（Clash.Meta 与 Sing-box）](#五、-生产级全加密防泄漏-dns-架构与配置文件落地)
6. [Windows 10/11 智能多宿主名称解析导致并发泄漏的注册表彻底禁用方案](#六、-windows-10-11-智能多宿主名称解析导致并发泄漏的注册表彻底禁用方案)
7. [验证工具与步骤：如何使用 ipleak.net、browserleaks.com 与 Wireshark 抓包确认 100% 零泄漏](#七、-验证工具与步骤-如何使用-ipleak-net、browserleaks-com-与-wireshark-抓包确认-100-零泄漏)
8. [AEO 结构化进阶排障实战 Q&A](#八、-aeo-结构化进阶排障实战-q-a)
9. [交叉研读与深度行动指引](#九、-交叉研读与深度行动指引)

---

## 一、 GFW 抢答注入伪造 DNS 响应报文（DNS Poisoning）的时序图解与 TTL 跳变特征

### 1.1 UDP 53 明文协议的先天缺陷

DNS 协议（RFC 1035）诞生于互联网早期，默认运行于 **UDP 53 端口**。该协议具有两个致命的设计弱点：
1. **纯明文无加密传输**：数据包内的查询域名（QNAME）、查询类型（QTYPE）完全处于裸奔状态，途径的任何二层交换机、三层路由器与国家级骨干网网关都能对载荷内容一览无余；
2. **无状态与无源验证**：客户端操作系统发起 UDP 查询后，仅在本地开辟一个临时高位端口，等待匹配相同 Transaction ID（事务 ID）的 UDP 响应包。**客户端遵循“先到先得（First-Response-Wins）”原则**，只要收到第一个格式合法、ID 吻合的应答，就会立刻将其写入内核 DNS 缓存，并强制丢弃后续到达的所有报文。

### 1.2 旁路侦听与抢答注入时序全景图

国家级防火墙（GFW）部署在三大运营商的国际出入口局（如广州、上海、北京骨干出口）的旁路分光探针上。当你在国内未开启加密隧道直连查询海外敏感域名时，时序交互如下图所示：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">客户端发起明文 UDP 53 查询</div>
        <div class="step-info-desc">向境外公共 DNS（如 8.8.8.8）查询海外敏感域名，数据包经过三大运营商国际出口时被旁路分光探针镜像。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">探针命中规则并伪造源 IP 抢答 (耗时 ~15ms)</div>
        <div class="step-info-desc">探针利用极短物理距离，将源 IP 伪造成 8.8.8.8 且保持 Transaction ID 一致，抢先注入伪造假响应（如 127.0.0.1 或死地址）。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">客户端写入脏缓存，真实响应被无情丢弃</div>
        <div class="step-info-desc">系统内核采纳首个抵达的伪造响应，后续 TCP 握手发往假地址直接断连；180ms 后真实境外响应姗姗来迟时被操作系统直接丢弃。</div>
      </div>
    </div>
  </div>
</div>

由于境内客户端到国际出口探针的国内 RTT 仅需 **10ms ~ 30ms**，而数据包漂洋过海到达海外 Google/Cloudflare 递归服务器再返回需要 **120ms ~ 220ms**，伪造报文永远比真实报文早到达 100 毫秒以上。

### 1.3 GFW 伪造报文的四大网络层特征指纹

在进行网络抓包排障时，专业工程师可以通过以下四大底层特征绝对断定数据包遭到了 GFW 抢答伪造：

1. **TTL 突变（Time-To-Live Anomaly）**：
   - 正常的境外 DNS 响应经过跨洋海缆与多级 BGP 骨干路由（通常经过 12~20 个 Hop），TTL 会有正常衰减（例如初始 TTL 64 或 128 衰减至 48~52 左右）；
   - GFW 旁路注入设备生成的报文其 TTL 往往是固定值（常见为 `TTL=64`、`TTL=52` 或 `TTL=48`），且往往与你 Ping 目标境外 DNS 得到的真实 ICMP TTL 存在巨大跃点跳变。
2. **IP 报头 Identification 字段异常**：
   - GFW 伪造的响应报文中，IP Header 的 Identification（标识符）字段常为 `0x0000` 或呈现与常规 Linux/FreeBSD 递归服务器完全不同的伪随机分布；
3. **缺少 EDNS0 选项（OPT Record）**：
   - 现代递归查询通常携带 RFC 6891 EDNS0 扩展字段以支持大于 512 字节的 UDP 报文；
   - GFW 注入设备为了追求极致的线速处理性能，往往忽略客户端发送的 EDNS 扩展，直接返回不包含任何 OPT Pseudo-Section 的最简畸形报文；
4. **脏 IP 污染池（Bogon & Sinkhole IPs）**：
   - GFW 伪造的 A 记录并非随机生成，而是固定轮换数个特定网段的 IP 地址（历史常见包括美国国防部废弃网段、Facebook/Twitter 曾用网段、甚至局域网环回地址 `127.0.0.1`）。

> **工程铁律**：在路由器或操作系统中单纯将 DNS 改成 `8.8.8.8` 或 `1.1.1.1` 对抗污染是**完全徒劳的**。只要出境报文采用未经加密的 UDP 53 传输，就必定在骨干网出口被精准劫持。

---

## 二、 传统客户端 DNS 泄漏通道深度剖析：Local DNS 与 EDNS-Client-Subnet 泄漏

在许多用户的认知中，“只要我开了代理，所有的流量就都安全了”。这种盲目自信是导致各类网络指纹泄漏与安全事件的根源。在传统代理架构中，存在两大极其隐蔽的 DNS 泄漏通道。

### 2.1 泄漏通道 1：传统 Redir-Host 模式强制先解析后分流

在早期代理客户端（如 Shadowsocks 原生客户端、早期 Clash 默认配置）普遍采用 **Redir-Host 模式**。该模式的工作逻辑如下：

```
浏览器请求目标网站 -> 操作系统 Local DNS 必须先解析出真实的 IP -> 
代理客户端拿到底层 IP -> 匹配规则集 (GEOIP,CN / DIRECT / PROXY) -> 决定是否转发代理
```

这一逻辑隐藏着致命的泄漏漏洞：
- 当用户在浏览器中输入某个敏感或海外受限域名时，操作系统**必须在发起任何 TCP 连接之前**，先通过物理网卡的 DNS（通常为本地运营商下发的 `114.114.114.114` 或电信/联通机房 DNS）发起解析；
- **泄漏后果**：
  1. 本地运营商的日志审计系统精确记录下了你的公网 IP 在几点几分解析了哪些海外域名；
  2. 运营商 DNS 直接返回 GFW 污染的假 IP；
  3. 代理客户端拿到假 IP 后，由于该假 IP 并不在境内的 IP 段中，代理客户端将其判定为“走代理”，但此时境外代理落地节点去连接这个假 IP，自然导致 TCP 连接直接超时重置。

### 2.2 泄漏通道 2：EDNS-Client-Subnet (RFC 7871) 泄漏本地公网 IP

为了解决全球 Anycast CDN 调度就近接入的问题，IETF 推出了 **RFC 7871 规范（EDNS Client Subnet, 简称 ECS）**。

#### 工作机理
当客户端向支持 ECS 的递归解析器（如 Google DNS `8.8.8.8`）查询域名时，递归解析器会把客户端的公网 IPv4 地址的前 24 位（例如 `123.120.45.0/24`）或 IPv6 的前 56 位附加在 DNS 请求报文中，递交给权威 DNS 服务器。权威 DNS 服务器据此判断用户所在的地理区域，并返回距离用户最近的 CDN 节点 IP。

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">客户端发起查询</div>
        <div class="step-info-desc">客户端向境外支持 ECS 的递归解析器（如 8.8.8.8）查询海外敏感域名。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">递归解析器附加 Client Subnet 字段</div>
        <div class="step-info-desc">递归解析器将客户端公网 IPv4 地址前 24 位（如 123.120.45.0/24）附加在请求中并透传至权威 DNS，导致国内省市宽带网段明文暴露！</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">权威 CDN 错配国内死节点</div>
        <div class="step-info-desc">权威服务器依据中国大陆 IP 调度边缘节点，使境外专线落地机房被迫跨洋反向连回中国周边，触发恶性高延迟。</div>
      </div>
    </div>
  </div>
</div>

#### 代理环境下的灾难性后果
1. **真实身份完全暴露**：境外权威 DNS 服务器（以及途径的监控探针）无需用户建立任何 HTTP 连接，仅凭 DNS 查询即可锁定该访问来自于中国某省某市某运营商的特定宽带用户；
2. **CDN 跨洋绕路劣化**：如果客户端通过专线代理访问境外服务，而本地 DNS 却通过 ECS 带上了国内真实 IP，权威 DNS 会自作聪明地返回一个位于中国大陆周边的 CDN IP，甚至直接解析到未部署境外服务的死节点，导致海外落地服务器访问极慢甚至被目标网站直接阻断。

---

## 三、 Fake-IP 虚拟网段映射机制深度解剖：为什么 198.18.0.0/16 能实现 0ms 握手与零污染出海

为了从根本上颠覆“先解析 IP、后匹配分流”带来的死循环，现代顶级代理核心（如 Mihomo / Clash.Meta、Sing-box、Surge）全面转向了 **Fake-IP（虚假 IP 映射）机制**。

### 3.1 为什么标准规范选定 198.18.0.0/16 网段？

在 Fake-IP 配置中，大家都会看到一个固定的网段：`198.18.0.0/16`（或 `198.18.0.1/16`）。为什么是这个特殊的 IP 段？

依据 **IETF RFC 2544 与 RFC 5737 规范**，`198.18.0.0/15`（包含 `198.18.0.0` 到 `198.19.255.255`，共 131,072 个可用 IP）被国际互联网工程任务组专门保留为 **网络互联设备基准性能测试（Benchmark Tests for Network Interconnection Devices）专用网段**。
- 它**绝不会在任何公网互联网路由器中被广播路由**；
- 它**完全避开了局域网常用的私有网段**（`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`），防止与公司内网或家用路由器发生子网冲突；
- 它是操作系统合法认可的单播 IPv4 地址空间，网络协议栈可以正常为其创建 Socket 与 TCP 连接。

### 3.2 Fake-IP 核心时序与零污染出海机制

在 Fake-IP 模式下，本地客户端彻底摆脱了“查询海外真实 IP”的枷锁：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">应用发起查询，代理内核 0.1ms 虚假应答</div>
        <div class="step-info-desc">应用（如 Chrome）查询 api.openai.com，代理内核在内存哈希表分配 198.18.0.42 并在 0.1ms 内瞬间返回应答，无需等待公网发包。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">TCP SYN 握手拦截与域名反查还原</div>
        <div class="step-info-desc">应用向 198.18.0.42 发起 TCP 连接，内核 TUN 虚拟网卡捕获流量，反查内存哈希表还原原始域名，并将请求封装推入企业内网专线。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">海外落地机房就近发起真实解析</div>
        <div class="step-info-desc">境外落地服务器（香港/日本）接收原始域名并向当地递归 DNS 解析，权威 CDN 依据落地 IP 调度同 IDC 最近边缘节点，彻底消灭跨洋绕路。</div>
      </div>
    </div>
  </div>
</div>

#### Fake-IP 的三大颠覆性技术优势
1. **0ms 本地 DNS 握手延迟**：浏览器向本地核心发起查询，核心在内存中完成映射并于 **0.1 毫秒内**返回响应。消除了以往等待远程解析返回的 100~300ms 延迟，首屏白屏时间大幅缩短；
2. **彻底免疫本地 GFW 抢答**：本地根本不对公网发起 `api.openai.com` 的明文查询，出口探针完全捕获不到查询特征，抢答机制瞬间失效；
3. **境外 CDN 完美就近调度**：域名的真实解析由海外专线落地服务器发起（例如香港或东京数据中心）。权威 DNS 会根据落地节点的 IP 分配同机房内网级 CDN 节点，杜绝任何跨洋绕路。

### 3.3 Fake-IP 模式的陷阱与 fake-ip-filter 避坑

Fake-IP 并非万灵药。如果某些特定流量被赋予了虚拟 IP，会导致严重故障：
- **Windows NCSI 联网检测**：Windows 会向 `msftconnecttest.com` 发送 HTTP 请求检测是否联网。如果返回 Fake-IP 且代理未接管，Windows 会误判电脑“无 Internet 访问”而弹窗断网；
- **NTP 网络时钟同步**：`time.windows.com` 或 `ntp.aliyun.com` 运行在 UDP 123 端口，如果被赋予 Fake-IP，会导致系统时钟无法同步；
- **局域网私网服务与穿透**：局域网打印机、NAS（`.lan`、`.local`）必须获取真实的私网物理 IP。

因此，生产级配置必须严格设置 `fake-ip-filter` 白名单，强制上述域名走真实 DNS 解析。

---

## 四、 SmartDNS 的虚假宣传陷阱：为什么在翻墙代理环境下使用 SmartDNS 会引发严重倒退与污染

在软路由与路由器玩家圈子中，**SmartDNS** 曾被神话为“防污染加速神曲”。然而在专业的网络工程实践中，**在翻墙代理环境下串联 SmartDNS 是最为典型的技术反模式**。

### 4.1 SmartDNS 的底层设计原理
SmartDNS 的原本定位非常单纯：在**完全合规的无审查直连网络**环境下，向多个上游运营商 DNS 并发查询某个域名，收集所有返回的真实 IP 地址，并在本地软路由对这些 IP 逐一发送 ICMP Ping 或 TCP 80/443 握手包，最后把延迟最低的 IP 返回给客户端。

### 4.2 为什么在代理环境下 SmartDNS 会引发灾难？

一旦将 SmartDNS 接入现代代理架构，其核心机制与代理分流逻辑产生严重互斥：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">向境内外并发测速测算 Ping 延迟</div>
        <div class="step-info-desc">SmartDNS 查询 Netflix 域名后，向境内外并发测速；境外真实 IP 全部被 GFW 丢包阻断，而 GFW 抢答的国内假 IP 或中国边缘 CDN 延迟极低。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">SmartDNS 误判劣选中国周边边缘 IP</div>
        <div class="step-info-desc">SmartDNS 依据延迟最优原则，误将国内边缘 IP 返回给客户端应用。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">海外落地被迫跨洋反向折返</div>
        <div class="step-info-desc">海外专线落地服务器被迫跨太平洋反向连回中国大陆周边 CDN 取流，Netflix 立即弹出“检测到代理/未解锁”警告并严重卡死。</div>
      </div>
    </div>
  </div>
</div>

#### 致命缺陷 1：并发测速在本地引发死循环与高丢包
海外服务器的 IP 地址在没有代理加持的国内网络环境下，通常具有高达 20%~80% 的丢包率。SmartDNS 在本地发起 ICMP Ping 测速，绝大部分海外优质 IP 会被判定为“死节点”而惨遭淘汰；而 GFW 抢答注入的假 IP 往往位于国内机房，Ping 响应仅需数毫秒，SmartDNS 会荒谬地判定该假 IP 为“最优结果”并缓存返回！

#### 致命缺陷 2：摧毁 Fake-IP 架构，剥夺海外落地机房调度权
如前文所述，最完美的 CDN 调度应当交由海外落地节点去解析。而 SmartDNS 强行在本地软路由做出决策，把一个针对中国大陆网络测速选出的 IP 喂给客户端，客户端再通过专线把该 IP 发给香港或日本落地机房。此时海外落地节点去连接这个 IP，往往出现严重的跨洋回旋，延迟成倍上升。

#### 致命缺陷 3：引入巨大的链式解析开销
开启 SmartDNS 测速后，一次海外域名的解析耗时往往从 Fake-IP 的 **0ms 飙升至 200ms ~ 800ms**，完全失去了现代网络代理的平滑体验。

> **架构结论**：请彻底卸载软路由中的 SmartDNS。在现代化代理方案中，DNS 解析工作应当且仅应当由 **Mihomo (Clash.Meta)** 或 **Sing-box** 的内部 DNS 引擎独立闭环接管。

---

## 五、 生产级全加密防泄漏 DNS 架构与配置文件落地

生产级防泄漏架构必须严格遵循**分流解耦**与**全通道加密**两大原则：
1. **境内直连域名**：直连国内大厂加密 DoH 服务器（如阿里 DNS、腾讯 DNSPod），杜绝本地宽带运营商的 UDP 53 劫持与日志记录；
2. **境外代理域名**：启用 Fake-IP 虚拟池，本地 0ms 拦截，并将原始域名交由专线隧道远程落地节点端完成递归解析；
3. **底层引导 DNS（Bootstrap DNS）**：仅用于解析 DoH 服务器自身的域名，防止出现先有鸡还是先有蛋的死锁问题。

### 5.1 Mihomo (Clash.Meta) 生产级防泄漏配置模板

以下为工业级验证过的 `dns:` 模块标准配置。请在客户端配置文件中进行替换：

```yaml
# 生产级全加密防泄漏 DNS 架构 (Clash.Meta / Mihomo)
dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: false                      # 严禁解析 AAAA 记录，彻底封堵 IPv6 真实 IP 漏流
  enhanced-mode: fake-ip           # 核心引擎：启用 Fake-IP 虚拟映射池
  fake-ip-range: 198.18.0.1/16     # RFC 2544 行业标准基准测试保留网段
  
  # 必须放行真实 DNS 解析的白名单（防止局域网设备与系统联网探测异常）
  fake-ip-filter:
    - "*.lan"
    - "*.local"
    - "localhost.ptlogin2.qq.com"
    - "+.msftconnecttest.com"
    - "+.msftncsi.com"
    - "+.time.windows.com"
    - "+.ntp.aliyun.com"
    - "+.stun.*.*"
    - "+.stun.*.*.*"

  # 基础引导 DNS：用于解析 DoH/DoT 域名本身的 IP 地址（必须使用明文纯 IP）
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29

  # 默认国内直连解析池：采用阿里/腾讯加密 DoH 传输
  nameserver:
    - https://223.5.5.5/dns-query#h3=true     # 阿里云 HTTP/3 加密 DoH
    - https://1.12.12.12/dns-query            # 腾讯 DNSPod 加密 DoH

  # 策略分流分派：精准分离境内外解析流
  nameserver-policy:
    # 境内知名域名与直连规则走阿里/腾讯加密通道
    "geosite:cn,private":
      - https://223.5.5.5/dns-query#h3=true
      - https://1.12.12.12/dns-query
    
    # 境外特定防污染查询（兜底走加密代理通道）
    "geosite:geolocation-!cn":
      - https://1.1.1.1/dns-query
      - https://8.8.8.8/dns-query

  # 境外远程解析回退组（仅当匹配境外规则时走代理节点解析）
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query

  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4
```

### 5.2 Sing-box 生产级独立分流 DNS 配置模板

Sing-box 具备更为清晰的独立 DNS 路由图谱。推荐的生产级 `dns` 与 `route` 配置规范如下：

```json
{
  "dns": {
    "servers": [
      {
        "tag": "dns-direct",
        "address": "https://223.5.5.5/dns-query",
        "address_resolver": "dns-bootstrap",
        "detour": "direct"
      },
      {
        "tag": "dns-remote",
        "address": "https://1.1.1.1/dns-query",
        "address_resolver": "dns-bootstrap",
        "detour": "专线节点"
      },
      {
        "tag": "dns-fakeip",
        "address": "fakeip"
      },
      {
        "tag": "dns-bootstrap",
        "address": "223.5.5.5",
        "detour": "direct"
      }
    ],
    "rules": [
      {
        "outbound": "any",
        "server": "dns-direct"
      },
      {
        "clash_mode": "Direct",
        "server": "dns-direct"
      },
      {
        "clash_mode": "Global",
        "server": "dns-fakeip"
      },
      {
        "geosite": "cn",
        "server": "dns-direct"
      },
      {
        "query_type": ["A", "AAAA"],
        "server": "dns-fakeip"
      }
    ],
    "fakeip": {
      "enabled": true,
      "inet4_range": "198.18.0.0/15"
    },
    "independent_cache": true
  }
}
```

---

## 六、 Windows 10/11 智能多宿主名称解析导致并发泄漏的注册表彻底禁用方案

在 Windows 10 与 Windows 11 操作系统中，微软为了加速企业内网与公共网络混合环境下的名称解析，引入了一项名为 **智能多宿主名称解析（Smart Multi-Homed Name Resolution, SMHNR）** 的系统机制。

### 6.1 致命的并发泄漏机理
当用户的 Windows 电脑同时存在物理网卡（以太网或 Wi-Fi）以及虚拟代理网卡（TUN/TAP 适配器）时：
1. 操作系统发起 DNS 查询时，**并不会**仅仅向优先级高的网卡发送请求；
2. **Windows 会向系统中所有已连接网卡配置的 DNS 服务器并发广播查询相同的域名**；
3. 谁先返回，系统就采用谁的应答结果，并记录到本地缓存！

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">Windows 智能多宿主名称解析 (SMHNR) 并发广播</div>
        <div class="step-info-desc">操作系统内核发起域名查询时，同时向系统内所有活跃网卡（TUN 虚拟网卡 + 物理以太网/Wi-Fi 网卡）并发广播查询相同的海外域名。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">物理网卡明文泄露至公网运营商</div>
        <div class="step-info-desc">物理网卡直接将查询发送给国内电信/联通/移动 DNS，哪怕 TUN 模式开启，你的真实海外访问行为依然被公网运营商日志精准留存。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">工程治理：彻底禁用多宿主并发解析</div>
        <div class="step-info-desc">通过组策略与注册表下发 DisableSmartNameResolution，切断物理网卡的非代理 DNS 发包，彻底消灭隐私泄漏。</div>
      </div>
    </div>
  </div>
</div>

即使你的代理客户端开启了全局 TUN 模式，你的物理网卡依然在每分每秒向国内运营商的 DNS 服务器出卖你正在访问的每一个海外域名！

### 6.2 工业级一键加固 PowerShell 脚本

请在 Windows 终端中右键选择 **“以管理员身份运行”** PowerShell，复制并执行以下全量加固脚本。该脚本将通过修改注册表彻底杀死智能多宿主并发解析，并禁用 IPv6 并行查询：

```powershell
# ==============================================================================
# Windows 10/11 智能多宿主名称解析 (SMHNR) 与并发泄漏终极加固脚本
# ==============================================================================

Write-Host "[1/4] 正在关闭 Windows 智能多宿主名称解析 (DisableSmartNameResolution)..." -ForegroundColor Cyan
$dnsPolicyPath = "HKLM:\Software\Policies\Microsoft\Windows NT\DNSClient"
if (-not (Test-Path $dnsPolicyPath)) {
    New-Item -Path $dnsPolicyPath -Force | Out-Null
}
Set-ItemProperty -Path $dnsPolicyPath -Name "DisableSmartNameResolution" -Value 1 -Type DWord -Force

Write-Host "[2/4] 正在禁用 IPv4 与 IPv6 并行查询 (DisableParallelAandAAAA)..." -ForegroundColor Cyan
$dnsCacheParams = "HKLM:\System\CurrentControlSet\Services\Dnscache\Parameters"
if (-not (Test-Path $dnsCacheParams)) {
    New-Item -Path $dnsCacheParams -Force | Out-Null
}
Set-ItemProperty -Path $dnsCacheParams -Name "DisableParallelAandAAAA" -Value 1 -Type DWord -Force

Write-Host "[3/4] 正在强制关闭所有网络适配器上的多宿主优化策略..." -ForegroundColor Cyan
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" -Name "DisableTaskOffload" -Value 1 -Type DWord -Force

Write-Host "[4/4] 刷新系统 DNS 解析缓存并重启 DNS 客户端服务..." -ForegroundColor Cyan
Clear-DnsClientCache
Restart-Service -Name "Dnscache" -Force -ErrorAction SilentlyContinue

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host " 防御加固完成！Windows 物理网卡已彻底断绝向本地运营商并发泄露海外域名的通道。" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
```

---

## 七、 验证工具与步骤：如何使用 ipleak.net、browserleaks.com 与 Wireshark 抓包确认 100% 零泄漏

配置完成后，必须经过严谨的测试与底层协议抓包，才能 100% 确认无任何泄漏。

### 7.1 工具 1：ipleak.net 真实 ASN 审计
1. 保持代理开启状态，使用浏览器的无痕隐私窗口访问 [ipleak.net](https://ipleak.net)；
2. 下滑至 **DNS Addresses** 检测区域，等待至少 30 秒让所有测试解析包发送完毕；
3. **合格判定标准**：
   - 检测结果中列出的 DNS 服务器 IP，其所属的国家（Country）和组织名称（ISP / Organization）必须**全部为境外代理出口节点机房**（例如 Cloudflare、Google、Akamai 或专线服务商自身的海外 ASN）；
   - 严禁出现任何带有 **China Telecom、China Unicom、China Mobile** 或任何中国大陆省份的 DNS 服务器。一旦出现，说明存在严重泄漏！

### 7.2 工具 2：browserleaks.com WebRTC 与 IP 穿透审计
1. 访问 [browserleaks.com/ip](https://browserleaks.com/ip)；
2. 观察 **IPv4 Address** 与 **WebRTC Leak Test**：
   - WebRTC 的 `Public IP Address` 必须与你的海外代理出口 IP 完全一致；
   - 严禁在 WebRTC 检测框中暴露你的内网真实网段或国内运营商 IPv6 地址。

### 7.3 工具 3：Wireshark 终极底层抓包排障实战

网页测试可能存在浏览器缓存干扰，而网络抓包则是无法说谎的黄金基准。

#### 抓包验证步骤
1. 打开 **Wireshark**，选中你电脑当前实际连接互联网的 **物理网卡（以太网或 Wi-Fi）**，切勿选择虚拟网卡；
2. 在顶部过滤器输入过滤语法：
   ```text
   udp.port == 53 or tcp.port == 53 or udp.port == 853 or tcp.port == 853
   ```
3. 点击开始抓包；
4. 打开命令行终端或浏览器，连续访问多个境外网站（如 `twitter.com`、`openai.com`、`github.com`）；
5. 观察 Wireshark 窗口是否有数据包捕获。

| 审计状态 | Wireshark 捕获结果特征 | 网络层结论与应对策略 |
| :--- | :--- | :--- |
| **100% 零泄漏状态**<br>`(AUDIT PASS)` | 过滤器 `udp.port == 53` 捕获列表**一片空白**！物理网卡上仅看到通往专线国内 BGP 入口（如 120.x.x.x:443）的加密 TLS/SS 数据流 | ✅ **完全合格**：所有海外域名查询均由代理内核 Fake-IP 拦截并封装进专线隧道，公网运营商完全无法窥探 |
| **存在严重泄漏状态**<br>`(AUDIT FAIL)` | 捕获到发往国内公共 DNS（如 114.114.114.114 / 223.5.5.5）的 `Standard query A twitter.com` 明文报文 | ❌ **严重泄漏**：Windows 正在向国内运营商明文出卖你的访问行踪！必须立即执行前文加固脚本 |

---

## 八、 AEO 结构化进阶排障实战 Q&A

<FaqAccordion 
  title="关于 DNS 泄漏、Fake-IP 机制与防劫持的高频疑难排障"
  :items="[
    {
      q: '为什么开启 Fake-IP 之后，部分局域网联机游戏或打印机无法连接？',
      a: '<strong>这是因为局域网域名或特定私网通信被错误赋予了 Fake-IP 虚拟地址</strong>。部分游戏或办公设备依赖本地局域网组播或 NetBIOS/mDNS 协议发现设备。若客户端将 <code>.local</code> 或特定设备的主机名劫持至 <code>198.18.x.x</code>，应用程序向该地址发起握手自然无法送达本地物理设备。<strong>解决方案</strong>：在代理客户端的 <code>fake-ip-filter</code> 白名单列表中添加该游戏的服务域名或局域网后缀（例如 <code>*.local</code>、<code>*.lan</code>），使其绕过 Fake-IP 池，直接向内网真实网关获取真实的私网物理 IP。'
    },
    {
      q: '为什么开启 DoH 加密解析后，有时候刚开机打开网页会有 1 到 2 秒的停顿？',
      a: '<strong>本质是陷入了“先有鸡还是先有蛋”的 Bootstrap DNS 递归死锁</strong>。DoH 本质是在 HTTPS 上传输 DNS 请求，客户端要向 <code>https://cloudflare-dns.com/dns-query</code> 发起连接，首先必须知道 <code>cloudflare-dns.com</code> 本身的 IP 地址！如果客户端未配置纯 IP 的 <code>default-nameserver</code>（引导 DNS），客户端就必须等待底层 Socket 超时后回退。<strong>解决方案</strong>：确保在配置文件中配置 <code>default-nameserver</code> 且直接使用裸 IP（如 <code>223.5.5.5</code>、<code>119.29.29.29</code>），或者直接将 DoH 的 URL 填为裸 IP 形式（如 <code>https://223.5.5.5/dns-query</code>）。'
    },
    {
      q: '我已经开启了 Fake-IP，为什么 Wireshark 在物理网卡上依然抓到了发往 223.5.5.5 的查询？',
      a: '<strong>存在两种可能原因</strong>：1. <strong>Windows 智能多宿主名称解析（SMHNR）在作祟</strong>，Windows 物理网卡并行向本地配置的 DNS 发送了探测包，请运行本文第六节的注册表加固脚本；2. <strong>代理核心自身在解析国内直连网站</strong>。当你访问百度、淘宝等国内网站时，由于规则命中 <code>DIRECT</code>，代理核心必须通过 <code>nameserver</code> 中配置的国内 DNS（如 223.5.5.5）解析出真实的国内 IP 才能建立直连。如果查询的是国内正规网站，属于正常分流行为；只要抓包中<strong>绝对没有出现任何海外敏感域名</strong>，即为健康状态。'
    },
    {
      q: 'Clash / Sing-box 的 Fake-IP 映射表如果常年不重启，会不会导致内存占满或 IP 耗尽？',
      a: '<strong>完全不会</strong>。<code>198.18.0.0/16</code> 网段提供了高达 <strong>65,534 个</strong> 独立可用 IP 地址。现代代理内核均设计了高效的 LRU（Least Recently Used，最近最少使用）内存缓存淘汰算法。当虚拟 IP 池被使用满后，内核会自动将最长时间未产生流量的旧域名映射覆盖释放。此外，Mihomo 等核心支持配置 <code>store-fake-ip: true</code>，将映射持久化至本地数据库，即使客户端重启也不会导致正在进行的旧连接因 IP 对应关系失效而断流。'
    }
  ]"
/>

---

## 九、 交叉研读与深度行动指引

要构筑真正铜墙铁壁般的稳定网络链路，单靠修复 DNS 仅完成了安全防护的半边天。建议系统研读以下关联技术专题，彻底消除网络链路中的全部断流死角：

- **排障大全景**：研读 [网络排障疑难杂症手册与系统级调试白皮书](/troubleshooting/)，掌握 OSI 自底向上的系统级诊断闭环；
- **IPv6 终极封堵**：阅读 [IPv6 真实 IP 暴露与 Happy Eyeballs 漏流防御](/troubleshooting/#六-专题-03ipv6-漏流ipv6-leak成因与全平台终极封堵方案)；
- **底层专线选型**：了解不过 GFW 审查的物理级基础设施，参阅 [IEPL vs IPLC 专线底层机理全对比](/zhuanxian/iepl-vs-iplc)；
- **传输协议演进**：探究抗阻断性能卓越的现代隧道标准，参阅 [主流代理协议全景技术横评](/protocols/)；
- **多端设备落地**：查看家庭客厅与多端落地实践，参阅 [Apple TV 4K 与客厅大屏分流实战](/devices/apple-tv-netflix-surge-clash)；
- **真实基准测速**：查阅全国 12 地晚高峰全链路发包监控数据，参阅 [专线机场网络性能基准与 SLA 审计报告](/benchmark/)。
