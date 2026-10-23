---
title: OpenWrt 旁路由 Fake-IP 全局透明代理配置与数据回流丢包终极排障
description: 深度解构家庭 OpenWrt 单网口旁路由网络拓扑、Fake-IP 毫秒级解析机理、非对称路由与 MASQUERADE 防火墙回流丢包根治，提供生产级配置与容灾方案。
head:
  - - meta
    - name: keywords
      content: OpenWrt旁路由, Fake-IP原理, 旁路由丢包, MASQUERADE, 非对称路由, OpenClash配置, 旁路由断网容灾, 局域网分流
---

# OpenWrt 旁路由 Fake-IP 全局透明代理配置与数据回流丢包终极排障

<AnswerBox 
  question="家庭旁路由透明代理为什么推荐 Fake-IP？如何彻底杜绝网络回流引发的丢包断流？" 
  date="2026-10 实测更新"
  takeaway="Fake-IP 会在本地直接拦截 DNS 请求并在 1 毫秒内响应保留网段虚假 IP，将真实域名解析推迟到海外代理出口，彻底规避本地解析耗时与污染。单网口旁路由丢包断流的根源在于非对称路由，局域网终端发出的出站流量经过旁路由，但主路由回包时直接走交换机直达终端，导致 TCP 连接状态不一致被系统重置。解决此问题的金标准是在旁路由防火墙中为局域网物理接口配置 MASQUERADE 源地址伪装，强制所有流量原路对称返回，并配合私网保留地址白名单豁免内网 NAS 与打印机。"
>
<p>
在家庭与极客工作室组网方案中，将 OpenWrt 部署为单网口旁路由（Bypass Gateway）是最兼顾性能与灵活性的架构。然而，大量工程师在部署后频繁遭遇网页假死、国内测速腰斩、王者荣耀等游戏连麦掉线以及局域网文件共享失效等诡异问题。
</p>
<p>
很多网络管理员误以为是软路由性能不足或固件不稳定，实际根源全部出在<strong>数据链路层的二层交换逻辑、三层非对称路由冲突以及 DNS Fake-IP 映射生命周期管理</strong>。
</p>
<p>
本文从 Linux 内核网络栈、Netfilter 防火墙表项流转以及 IETF 协议规范切入，彻底还原旁路由流量回流与 Fake-IP 工作机理，并提供可直接复制落地的生产级配置方案。
</p>
</AnswerBox>

---

## 一、 旁路由（Bypass Gateway）网络拓扑解构

旁路由并非官方定义的网络层标准术语，在计算机网络工程中更严谨的称谓是“单臂透明网关（One-Arm Transparent Gateway）”。

在典型的家庭宽带环境中，光猫通常运行在桥接模式，由一台物理无线路由器（主路由）完成 PPPoE 拨号并承担全屋局域网的二层交换与无线 Wi-Fi 覆盖：

<BypassTopology />

### 1.1 旁路由基础网络参数核验清单

在进入复杂的代理插件配置前，必须确保 OpenWrt 自身的网络协议栈处于完全健康的基准状态。以下参数若出现任何偏差，后续的所有排障都会徒劳无功：

1. **IPv4 静态地址绑定**  
   OpenWrt 的 `lan` 接口协议必须设为静态地址（Static Address），IP 分配必须位于主路由同一子网且避开主路由的 DHCP 动态地址池。例如主路由为 `192.168.1.1/24`，旁路由可设为 `192.168.1.2`，子网掩码严格设为 `255.255.255.0`。

2. **IPv4 网关指向**  
   旁路由的 IPv4 网关必须且只能指向主路由器 IP，即 `192.168.1.1`。这是旁路由自身访问外部互联网、与境外 [企业级 IEPL 专线](/zhuanxian/) 握手以及同步规则库的唯一出口通道。

3. **DNS 地址配置**  
   旁路由自身的自定义 DNS 服务器建议直接填写主路由 IP `192.168.1.1` 或国内公网公共 DNS 如 `223.5.5.5`。严禁将旁路由系统自身的 DNS 反向指向其内部代理内核监听的 `127.0.0.1`，否则极易在代理内核未完全拉起时造成系统自身解析死锁。

4. **强制关闭 DHCP 守护进程**  
   在 OpenWrt 的“网络 -> 接口 -> LAN -> 基本设置”底部，必须勾选“忽略此接口（不在此接口上提供 DHCP 服务）”。如果主路由与旁路由在同一个局域网二层广播域内同时响应 DHCP Discover 广播包，会导致局域网设备获取到的网关和 DNS 发生随机漂移，引发偶发性全网断连。

---

## 二、 Fake-IP 模式核心原理：规避 DNS 污染与解析耗时

在 OpenWrt 上配置透明网关时，最核心的决策是选择 DNS 接管工作模式。目前行业内主要存在 **Redir-Host 模式** 与 **Fake-IP 模式** 两大技术流派。

理解这两者的差异，是消除网页点击延迟和规避 GFW 污染的关键。

| 工作模式 | DNS 查询响应机制 | 建立连接与首包延迟 | 安全与防污染特性 |
| :--- | :--- | :--- | :--- |
| **传统 Redir-Host 模式** | 客户端向旁路由查询域名，旁路由必须向远端递归服务器发起真实查询并等待回包（耗时 150~300ms） | 拿到真实 IP 后才发起 TCP SYN，点击有严重卡顿感与首包白屏 | 易遭公网运营商抢答污染；若使用国内 DNS 易导致境外 CDN 严重绕路 |
| **现代 Fake-IP 模式** | 旁路由收到查询后，在内存池中分配 `198.18.0.0/15` 保留 IP，**1ms 内直接秒回假 IP** | 客户端瞬间发起 TCP SYN，旁路由反查内存表还原域名推入专线，首包零等待 | 本地完全不对公网发起真实域名查询，彻底消灭 DNS 污染与泄露 |

### 2.1 传统 Redir-Host 模式的缺陷

在传统 Redir-Host 模式下，当局域网终端发起对一个海外网站的访问时，必须先等待 DNS 解析结果。

此时旁路由面临两难抉择。如果将请求发送给国内公共 DNS，解析出来的海外 IP 会被 GFW 深度污染为不可达的错误地址；如果将请求经由加密专线发送给境外如 `8.8.8.8` 或 `1.1.1.1` 进行远程解析，一次 DNS 查询就会消耗 100 到 300 毫秒的专线往返传输时延。

由于现代复杂的网页往往引用了数十个不同子域名的静态资源与 API 接口，这会导致在浏览器中打开页面时出现长达数秒的空白等待，俗称 DNS 阻滞。

此外，当客户端拿到真实 IP 后再向该 IP 发送数据包，代理内核必须把这个真实 IP 拿去反向匹配庞大的 GEOIP 数据库。如果该海外 CDN 节点的 IP 凑巧被收录在国内 IP 段内，分流就会发生灾难性的误判。

### 2.2 Fake-IP 模式的高性能运转机理

Fake-IP 模式彻底颠覆了传统的先解析后建连流程。它的核心运转机理包含三个严密的阶段。

第一阶段为虚假 IP 毫秒级应答。当终端发起对 `google.com` 的 A 或 AAAA 记录查询时，旁路由的 DNS 模块拦截该 UDP/TCP 53 端口报文。内核完全不向任何外部网络发送查询，而是直接从内部维护的地址池中取出一个预留虚拟 IP。例如从 `198.18.0.0/15` 中分配 `198.18.0.42`，并在内部高并发内存字典中建立双向映射关联。整个查询过程完全在旁路由本地内存中完成，通常仅需 0.5 毫秒即可返回给终端。

第二阶段为三层网络报文拦截。终端收到这个响应后，深信 `198.18.0.42` 就是目标服务器的公网 IP，立刻向该 IP 发送 TCP SYN 同步握手报文。数据包经由默认网关抵达旁路由，旁路由的 iptables 或 nftables 防火墙规则将目标为 `198.18.0.0/15` 的流量重定向（REDIRECT）或者透传（TPROXY）至代理内核的本地监听端口。

第三阶段为域名还原与远端出口代理。代理内核接管该报文后，通过查询目标地址 `198.18.0.42` 的内存映射表，瞬间还原出原始域名字符串 `google.com`。随后，内核直接使用原始域名去匹配路由规则集（Rule-Set）。如果判定为代理，内核直接将包含原始域名的代理协议报文（如 [VLESS-Reality](/protocols/) 或 [Shadowsocks-2022](/protocols/)）注入跨境专线发往境外落地服务器。目标服务器的真实 IP 解析完全移交到境外服务器本地完成，既享受了境外本地 CDN 极速解析的红利，又在根本上消除了本地解析的延迟与污染隐患。

### 2.3 为什么选用 198.18.0.0/15 保留地址池？

很多网络管理者会疑问为什么各类内核都默认采用 `198.18.x.x` 作为假 IP 网段。

根据互联网工程任务组发布的 RFC 2544、RFC 3330 与 RFC 6890 规范，`198.18.0.0/15`（即 `198.18.0.0` 到 `198.19.255.255`，共包含 131,072 个可用 IPv4 地址）被专门分配给网络基准测试（Benchmarking Methodology for Network Interconnect Devices）。

这一网段在公网互联网骨干路由器中绝对不会被宣布和路由，同时也严格避开了 RFC 1918 规定的常见家庭局域网私有网段（如 `10.0.0.0/8`、`172.16.0.0/12` 和 `192.168.0.0/16`）。选用这个专用保留网段可以确保虚假 IP 永远不会与任何合法的公网服务器或内网真实主机发生碰撞。

---

## 三、 非对称路由（Asymmetric Routing）与数据回流丢包终极剖析

在单臂旁路由拓扑中，绝大多数偶发性断流、微信图片加载失败、局域网速度腰斩等故障，罪魁祸首既不是代理协议本身，也不是宽带线路故障，而是 TCP 协议栈对非对称路由（Asymmetric Routing）的拒绝机制。

### 3.1 丢包形成的底层流转过程追踪

让我们通过数据链路层与网络层的逐跳包追踪，完整还原这个三角形网络故障：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">出站路径：终端 ➔ 旁路由 ➔ 主路由</div>
        <div class="step-info-desc">终端发包给网关（旁路由），旁路由判定为国内直连后，原样转发给主路由出海。报文源 IP 依然保持为终端自身 IP。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">入站异常：主路由直接发回终端 (绕过旁路由)</div>
        <div class="step-info-desc">主路由收到公网回包后查 ARP 表，发现终端就在同局域网内，直接二层交换发回终端，彻底绕过了旁路由！</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">致命后果：非对称路由导致连接重置 (TCP RST)</div>
        <div class="step-info-desc">旁路由 conntrack 状态表只看到半截出站连接，超时后判定异常并阻断；终端收到源不一致的握手包触发丢包或卡死。</div>
      </div>
    </div>
  </div>
</div>

以下是该网络报文在内核层面的详细时序流转：

1. 终端（`192.168.1.100`）发起对国内网站（`114.114.114.114`）的 TCP 握手。由于终端的默认网关被指定为旁路由，终端构建的以太网数据帧中，三层源 IP 为 `192.168.1.100`，三层目的 IP 为 `114.114.114.114`，而二层目的 MAC 地址被封装为旁路由的 MAC 地址。

2. 旁路由收到该以太网帧后解封装。代理内核在完成规则比对后，判定该目标属于国内直连流量（DIRECT），无须送入专线。旁路由通过系统路由表查询该目标的出接口，匹配到默认路由经由主路由转发。

3. 旁路由将数据包重新封包发出。此时如果在旁路由的防火墙中未作任何特殊处理，发出数据报文的三层源 IP 依然保持为 `192.168.1.100`，三层目的 IP 保持为 `114.114.114.114`，仅将二层目的 MAC 地址修改为主路由的 MAC 地址，随后推入交换机物理链路。

4. 主路由收到该报文，为其执行正常的 SNAT（源地址转换），把源 IP 替换为主路由的公网 IP 并发往外部互联网。外部服务器收到后正常发送 TCP ACK 响应。

5. 关键转折点降临。主路由收到外部服务器的回包后，完成反向 DNAT 转换，将报文的三层目的 IP 还原为终端的 `192.168.1.100`。此时主路由器检索自身的直连路由表与 ARP 缓存，发现 `192.168.1.100` 就在自己所处的同一个局域网二层广播域内。

6. 主路由做出了符合标准交换逻辑、但在旁路由架构下致命的决策。主路由直接将该以太网帧的二层目的 MAC 地址填充为终端设备的 MAC 地址，直接通过交换芯片广播转发回了终端。

7. 此时局域网内发生了严重的数据通道不对称。对于终端设备而言，出站流量走的是旁路由，入站回包却直接来自主路由。如果终端开启了反向路径过滤（rp_filter），或者旁路由自身启用了状态防火墙（conntrack），旁路由的网络连接跟踪表将永远看不到这笔连接的下行握手包。当旁路由内部超时计时器触发后，会主动向双端丢弃连接甚至发送 RST 报文。

8. 更常见的情况是，由于现代网卡普遍开启了 TCP 校验和卸载（Checksum Offloading）与高阶安全过滤，非对称路由会导致滑动窗口异常与包序列号对不上，直接造成连接持续性丢包，表现为网页第一次点击卡死，连续刷新好几次才能勉强打开。

### 3.2 终极解决方案：MASQUERADE 源地址伪装

要根治非对称路由引发的丢包问题，必须强行打破三角形数据路径，将其纠正为严格对称的双向原路往返闭环。

实现这一目标的核心技术手段是在 OpenWrt 旁路由的防火墙输出链上，对流经局域网接口的所有流量强制追加 MASQUERADE 源地址伪装。

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">出站 SNAT 伪装：强制重写源 IP 为旁路由</div>
        <div class="step-info-desc">终端发出的报文在经由旁路由发往主路由时，旁路由防火墙通过 MASQUERADE 强制将源 IP 重写为自身 IP（192.168.1.2）。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">入站对称回流：主路由必须原路发还旁路由</div>
        <div class="step-info-desc">主路由收到公网回包后查目的 IP 为 192.168.1.2，只能老老实实通过二层交换发回旁路由，消灭了绕过旁路由直接发回终端的通道。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">反向还原投递：连接跟踪表还原真实终端</div>
        <div class="step-info-desc">旁路由收到主路由回包后，通过 Netfilter 连接跟踪表反向还原目的 IP 为终端真实 IP 并准确交付，达成严格对称闭环。</div>
      </div>
    </div>
  </div>
</div>

当在旁路由上对出站流量启用 MASQUERADE 后，所有经过旁路由转发至主路由的数据包，其三层源 IP 都会被强制重写为旁路由自身的 IP，即 `192.168.1.2`。

当主路由收到外部公网服务器的回包并完成解包后，主路由查阅目的 IP，发现是 `192.168.1.2`，因此主路由别无选择，必须严格按照 ARP 规则将数据帧发送回旁路由的 MAC 地址。

旁路由收到主路由的回包后，根据其 Netfilter 连接跟踪表执行反向地址转换，将目的 IP 还原为终端的 `192.168.1.100` 并投递给终端。整个链路完全符合 TCP 双向握手的对称性规范，所有丢包与假死问题瞬间迎刃而解。

---

## 四、 典型家庭网络故障终极修复

解决了非对称路由的基础回流后，随着全屋设备的接入，还会遇到三个高频工程痛点。以下是针对性的排障与配置方案。

### 4.1 局域网 SMB 共享文件与本地网络打印机失效修复

在旁路由上全局开启 MASQUERADE 后，会带来一个典型的副作用。

局域网内的群晖、威联通或自建 TrueNAS 服务器在记录访问日志时，会发现所有客户端的访问来源全部变成了旁路由的 IP `192.168.1.2`。这不仅导致 NAS 基于来源 IP 的安全风控策略彻底失效，更糟糕的是，如果内网设备间传输大型文件走到了旁路由并触发代理内核捕获，原本 2.5G 甚至万兆的局域网吞吐会被旁路由小主机的 CPU 算力限制，导致文件拷贝速率骤降至几十兆每秒。

更为严重的是本地网络打印机。很多惠普、佳能或爱普生局域网打印机依赖 Bonjour 或 mDNS（多播组播协议，使用 `224.0.0.251` 及 UDP 5353 端口）进行设备广播与状态探测。一旦这部分多播广播流量被旁路由代理内核接管，打印机就会在 Windows 或 macOS 系统的设备列表中频繁离线。

解决此故障的关键举措是构建精细化的 RFC 1918 本地私网直连与多播白名单。

必须在代理客户端与 OpenWrt 系统路由中将以下保留网段全部置于规则链顶端，强制执行直接放行（DIRECT）并避开 Fake-IP 虚拟地址分配：

```yaml
# 生产级私有网段与本地多播白名单必须包含的 CIDR 清单
payload:
  - '10.0.0.0/8'           # RFC 1918 局域网私网段
  - '172.16.0.0/12'        # RFC 1918 局域网私网段
  - '192.168.0.0/16'       # RFC 1918 典型家庭局域网
  - '100.64.0.0/10'        # 运营商级 CGNAT 保留网段
  - '127.0.0.0/8'          # 本地回环地址
  - '169.254.0.0/16'       # 链路本地自动配置地址 (APIPA)
  - '224.0.0.0/4'          # 多播与组播地址 (包含 mDNS, SSDP)
  - '255.255.255.255/32'   # 局域网受限广播地址
```

在 OpenClash 的 Fake-IP 过滤配置中，同样必须将本地局域网域名与组播服务加入白名单，防止其被解析为 `198.18.x.x`：

```yaml
# Fake-IP 过滤规则 (fake-ip-filter) 生产级放行项
fake-ip-filter:
  - '*.lan'
  - '*.local'
  - '*.internal'
  - 'router.asus.com'
  - 'miwifi.com'
  - 'tplogin.cn'
  - '*.msftconnecttest.com'
  - '*.msftncsi.com'
  - 'msftconnecttest.com'
  - 'msftncsi.com'
  - 'workgroup'
  - 'smb.*'
```

### 4.2 旁路由失联时全家断网应急容灾方案

软路由本质上是一台运行 Linux 系统的微型计算机，免不了要进行固件更新、内核升级或者插件重启。如果全家的网络完全强依赖旁路由，一旦旁路由发生死机或重启，全家所有设备将彻底断网，智能家居设备离线更会引发严重的生活困扰。

实现工业级高可用与容灾回退主要有两种成熟的技术路径。

#### 路径一 主路由保持默认网关，终端按需静态指定（推荐级最高）

这是风险边界最清晰的组网模式。

主路由的 DHCP 服务完全保持出厂默认状态，向全家分发的网关为 `192.168.1.1`，DNS 为 `192.168.1.1`。家里的智能扫地机、空调伴侣、长辈手机在默认状态下完全不经过旁路由，直接走主路由硬件 NAT 直连出海，享有高稳定性。

对于需要加速的设备（例如个人的主力工作 PC、MacBook、iPad 以及客厅 Apple TV），只需在设备的系统网络设置中，将配置 IP 从自动改为手动或 DHCP 静态保留，将网关和 DNS 单独修改为旁路由 IP `192.168.1.2`。

这种模式下，哪怕旁路由被拔掉电源或正在编译新固件，全家其他家庭成员完全不受任何影响。

#### 路径二 主路由 DHCP Option 动态双网关与健康探测脚本

如果主路由器支持运行 OpenWrt 或 RouterOS 等高阶系统，可以通过配置 DHCP Option 结合看门狗（Watchdog）探测脚本实现秒级无感故障转移。

在主路由器的 dnsmasq 配置中，通过设定 DHCP Option 3（默认路由）与 Option 6（DNS 服务器）下发旁路由参数。

同时在主路由器后台运行一个轻量级的保活探测脚本，每隔 15 秒向旁路由发送 ICMP 探测。一旦连续 3 次探测失败，脚本自动调用 `uci` 命令将 Option 3 和 Option 6 修改回主路由自身的 `192.168.1.1` 并触发 DHCP 租约重载，实现全自动平滑回退：

```bash
#!/bin/sh
# 主路由健康探测与网关自动容灾故障转移脚本
# 路径: /etc/storage/bypass_watchdog.sh 或 crontab 定时调用

BYPASS_IP="192.168.1.2"
MAIN_ROUTER_IP="192.168.1.1"
LOCK_FILE="/tmp/bypass_down.lock"

# 向旁路由连续发送 3 次 ping 探测，超时设为 2 秒
if ping -c 3 -W 2 "$BYPASS_IP" > /dev/null 2>&1; then
    # 旁路由存活
    if [ -f "$LOCK_FILE" ]; then
        logger -t "WATCHDOG" "旁路由 $BYPASS_IP 已恢复，切回旁路由网关与 DNS"
        uci set dhcp.lan.dhcp_option='3,'"$BYPASS_IP"' 6,'"$BYPASS_IP"
        uci commit dhcp
        /etc/init.d/dnsmasq restart
        rm -f "$LOCK_FILE"
    fi
else
    # 旁路由失联
    if [ ! -f "$LOCK_FILE" ]; then
        logger -t "WATCHDOG" "旁路由 $BYPASS_IP 宕机失联，自动回退至主路由网关与 DNS！"
        uci set dhcp.lan.dhcp_option='3,'"$MAIN_ROUTER_IP"' 6,'"$MAIN_ROUTER_IP"
        uci commit dhcp
        /etc/init.d/dnsmasq restart
        touch "$LOCK_FILE"
    fi
fi
```

### 4.3 国内王者荣耀、原神网游与语音连麦误走代理的防封号分流规则

网络游戏玩家最忌讳网络抖动与异常 IP 漂移。

《王者荣耀》、《和平精英》、《原神》以及腾讯会议、企业微信实时连麦等应用，底层大多采用专有的私有二进制 UDP 协议或者基于 QUIC 的定制通信框架，并且在各省部署了密集的游戏服务器集群。

如果旁路由的分流规则不够严密，将这些高频实时的 UDP 数据包误判定为未知流量并送入境外专线节点，会引发两大严重灾难。

首先是游戏延迟剧烈飙升。原本在本地连接腾讯机房只需 15 毫秒的时延，经过境外代理绕路后，时延会瞬间暴增至 150 毫秒以上，伴随极高的人物瞬移与掉线丢包。

其次是极高概率触发游戏厂商的反作弊与安全风控机制。腾讯游戏安全中心（ACE）以及米哈游安全系统在检测到客户端登录 IP 在几秒钟内从本地宽带漂移到香港或日本数据中心机房 IP 时，会立即判定为账号共享或恶意异地代练，轻则强制下线重新人脸识别，重则直接封禁账号。

防封分流规则架构实践如下：

在代理内核中，必须建立严格的国内游戏与语音识别规则链，确保其优先命中直接放行：

```yaml
# 游戏与国内语音通信绝对直连策略组
rules:
  # 优先放行本地局域网
  - GEOIP,private,DIRECT,no-resolve

  # 精准匹配国内游戏厂商域名
  - GEOSITE,category-games@cn,DIRECT
  - GEOSITE,tencent,DIRECT
  - GEOSITE,netease,DIRECT
  - GEOSITE,bilibili,DIRECT
  - GEOSITE,mihoyo,DIRECT

  # 精准匹配国内运营商 IP 库，no-resolve 避免在本地无谓触发远程解析
  - GEOIP,CN,DIRECT
  
  # 针对游戏常用语音端口与协议做规则保底
  - DST-PORT,8000-9000,DIRECT
  - DST-PORT,10000-20000,DIRECT
```

此外，在 OpenClash 菜单中，强烈建议将“路由本机代理”以及“绕过中国大陆 IP”开关开启，使中国 IP 地址段在三层网络栈直接被内核路由表旁路，完全不进入代理内核的 TUN 虚拟接口，从物理层面杜绝任何游戏数据包误走代理的风险。

---

## 五、 OpenClash (Meta 内核) / PassWall 生产级配置文件与防火墙脚本实录

为了帮助工程师避开复杂的参数摸索，以下分别提供基于现代 nftables（OpenWrt 22.03+ fw4 架构）与传统 iptables（fw3 架构）的生产级防火墙脚本，以及 OpenClash Mihomo 内核的基准配置范本。

### 5.1 OpenWrt 防火墙防回流丢包脚本实录

#### 方案 A 现代 OpenWrt 22.03 / 23.05+ (基于 fw4 与 nftables)

现代 OpenWrt 全面采用 nftables 替代陈旧的 iptables。请直接编辑 `/etc/nftables.d/99-custom-bypass.nft` 文件，追加以下规则并执行 `fw4 reload`：

```text
# 文件路径: /etc/nftables.d/99-custom-bypass.nft
# 作用: 强制对局域网内部流转数据包执行源地址伪装，根除非对称路由丢包

chain bypass_masquerade {
    type nat hook postrouting priority srcnat; policy accept;
    
    # 匹配经过物理网桥 br-lan 发往局域网主机的流量，强制伪装为旁路由自身 IP
    oifname "br-lan" masquerade
}
```

#### 方案 B 传统 OpenWrt 19.07 / 21.02 (基于 fw3 与 iptables)

对于仍在运行老版固件的设备，登录 OpenWrt Web 管理界面，进入“网络 -> 防火墙 -> 自定义规则”（对应文件 `/etc/firewall.user`），在文件末尾追加以下指令并点击重启防火墙：

```bash
# 文件路径: /etc/firewall.user
# 作用: iptables 架构下单臂旁路由防回流与 DNS 强制重定向脚本

# 1. 开启 NAT 表的 POSTROUTING 源地址伪装，纠正非对称路由
iptables -t nat -A POSTROUTING -o br-lan -j MASQUERADE

# 2. (可选) 强制将所有发往 53 端口的外部 DNS 劫持到旁路由核心 DNS 服务
iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 7874
iptables -t nat -A PREROUTING -p tcp --dport 53 -j REDIRECT --to-ports 7874
```

### 5.2 OpenClash (Mihomo 内核) 生产级精简配置范本

以下配置融合了 Fake-IP 优化池、TUN 虚拟网卡堆栈调优以及高性能二进制规则集逻辑，专为千兆宽带旁路由优化设计：

```yaml
# OpenClash / Mihomo 生产级基准配置文件片段
mixed-port: 7890
allow-lan: true
mode: rule
log-level: warning
ipv6: false

# 开启 TCP 并发提升首包响应速度
tcp-concurrent: true

# 全局 TUN 虚拟网卡配置
tun:
  enable: true
  stack: system        # 推荐使用 system 堆栈，吞吐量高且 CPU 占用均衡
  device: utun
  auto-route: true
  auto-redirect: true
  auto-detect-interface: true

# 高性能 DNS 模块配置
dns:
  enable: true
  listen: 0.0.0.0:7874
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - '+.lan'
    - '+.local'
    - '+.msftconnecttest.com'
    - '+.msftncsi.com'
    - 'msftconnecttest.com'
    - 'msftncsi.com'
    - '+.163.com'
    - '+.126.net'
    - '+.qq.com'
    - '+.baidu.com'

  # 国内分流与基础解析 DNS (走物理直连)
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29

  # 真实上游解析服务器
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query

  # 境外兜底与专线内部解析
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4

# 规则链引擎 (按顺序严格自上而下匹配)
rules:
  # 本地局域网流量绝对直连
  - GEOIP,private,DIRECT,no-resolve
  
  # 国内核心域名与公共服务直连
  - GEOSITE,geolocation-!cn,PROXY
  - GEOSITE,cn,DIRECT
  - GEOIP,CN,DIRECT
  
  # 兜底规则
  - MATCH,PROXY
```

---

## 六、 常见问题与工程排障答疑

<FaqAccordion :items="[
  {
    question: '为什么配置好旁路由 Fake-IP 后，部分国产 App 启动广告消失了，但微信图片和朋友圈视频经常转圈卡顿？',
    answer: '微信朋友圈与图片下载服务器采用了极其复杂的国内 Anycast 与局部 CDN 调度网络，并且部分通信未严格使用标准域名，而是通过 App 内嵌的固定 IP 列表直接通信。当使用 Fake-IP 模式时，如果分流规则中的 GEOIP/GEOSITE 数据库未及时更新，部分腾讯 CDN 节点的 IP 会被判定为外部流量并送入境外专线，导致跨国访问国内 CDN 出现剧烈限速与转圈。解决方案是将微信专属规则库（GEOSITE wechat）强制设定为 DIRECT 直连，并在 Fake-IP 过滤名单中将 *.qpic.cn、*.weixin.qq.com 全部加入直连放行白名单。'
  },
  {
    question: '旁路由上的 Fake-IP 模式、TUN 模式以及 TPROXY 模式到底是什么关系？它们之间可以混用吗？',
    answer: '这三者处于不同的网络协议层级。Fake-IP 属于应用层/传输层的 DNS 域名解析机制，它决定了 DNS 查询返回的是真实 IP 还是保留地址池中的虚假 IP。而 TUN 模式与 TPROXY 模式属于三层与四层的流量截获转发机制。TUN 是基于虚拟以太网卡设备（utun）在内核层接管 IP 报文，TPROXY 则是 Linux Netfilter 防火墙原生提供的高性能透明代理机制，无需经过虚拟网卡解封装。在现代 Mihomo 内核中，推荐使用 Fake-IP 配合 TUN (System Stack) 模式，兼顾了域名解析零等待与三层流量拦截的高稳定性。'
  },
  {
    question: '为什么家庭网络中的 Nintendo Switch 或 PS5 主机接入旁路由后，NAT 测试直接报错或者降级为 NAT Type D？',
    answer: '游戏主机联机非常依赖基于 UDP 的 STUN 打洞技术。导致 NAT 降级为 D 的核心原因通常有两个。首先是代理内核默认禁用了 Full Cone NAT 映射，在配置文件中必须显式声明 full-cone true。其次是非对称路由导致主机的 STUN 握手探测包无法原路返回。在旁路由防火墙启用 MASQUERADE 规则，并确保所使用的境外专线服务商节点支持原生 UDP 转发（而非将 UDP 封包为 TCP 传输），主机 NAT 类型即可稳定提升至 NAT Type B 或 Type A。'
  },
  {
    question: '旁路由开启 MASQUERADE 源地址伪装后，主路由和 NAS 日志里的访问来源全变成了旁路由 IP，如何兼顾日志溯源与防丢包？',
    answer: '如果家庭网络有严格的安全审计或日志溯源需求，可以通过精细化的针对性 MASQUERADE 策略来替代全局伪装。在防火墙规则中，限定只有目标地址不是局域网网段（即感叹号 -d 192.168.1.0/24）的出站报文才执行 MASQUERADE，而对于访问局域网 NAS（例如目的 IP 为 192.168.1.200）的流量，直接在终端侧通过静态路由将其网关指向主路由或者在规则中直接放行。这样终端访问内网 NAS 时依然保留原始三层源 IP，只有真正需要出外网的数据包才在旁路由上进行地址伪装。'
  }
]" />

---

## 七、 关联主题与进阶阅读矩阵

- 网络硬件与客户端大系 [多设备方案与全平台客户端组网白皮书](/devices/)
- 专线基础设施原理 [IEPL vs IPLC 专线底层机理全对比](/zhuanxian/iepl-vs-iplc)
- 跨境数据传输保障 [晚高峰丢包率与 Jitter 抖动实测标准与 SLA 判定](/zhuanxian/sla-packet-loss)
- 现代代理协议选型 [Shadowsocks-2022 vs VLESS-Reality 协议全解](/protocols/)
- 网络底层性能指标 [网络性能度量大系：延迟、丢包与 TCP 拥塞控制](/performance/)
- 机场评测与吞吐实测 [主流专线机场测速与晚高峰真实表现榜单](/benchmark/)
- 实战排错手册库 [网络综合排障与 DNS 泄漏终极排查手册](/troubleshooting/)
- 首页返回 [专线机场与网络架构实验室首页](/)
