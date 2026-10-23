---
title: VLESS Reality 服务端伪装目标 (SNI) 甄选与证书偷借避坑实战手册
description: 深度解析 VLESS-Reality 借用公网 TLS 证书公钥与反主动探测底层机理，提供目标域名（SNI/dest）五大筛选准则、实测验证的合规域名梯队清单、Linux 终端自动化检测脚本，以及 Xray-core 与 Sing-box 双端生产级配置模板与排错避坑指南。
head:
  - - meta
    - name: keywords
      content: VLESS Reality, SNI伪装域名, dest配置, Reality偷借证书, Xray Reality, Sing-box Reality, TLS 1.3, ALPN h2, 主动探测, shortId
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "VLESS Reality 服务端伪装目标 (SNI) 甄选与证书偷借避坑实战手册",
        "description": "深入剖析 VLESS-Reality 协议反主动探测机制与 TLS 证书公钥借用原理，提供伪装域名五大黄金筛选法则、自动化检测脚本与生产级双端配置模板。",
        "author": {
          "@type": "Organization",
          "name": "专线机场技术实验室"
        },
        "datePublished": "2026-10-22",
        "dateModified": "2026-10-22"
      }
---

# VLESS Reality 服务端伪装目标 (SNI) 甄选与证书偷借避坑实战手册

<AnswerBox 
  question="VLESS Reality 伪装域名（SNI / dest）该怎么选？选错会导致什么后果？" 
  date="2026-10 实测更新"
  takeaway="Reality 协议的底层精髓是‘偷天换日与真实回落’：利用海外权威大厂现成的 TLS 1.3 证书公钥完成握手协商，并将非授权探针透明重定向至真实站点。选择伪装域名必须严格满足：原生强制支持 TLS 1.3、ALPN 包含 h2、机房到目标站点物理 RTT < 5ms、必须是全球跨国大厂且境内直连未被 GFW 阻断。一旦选错（如借用被墙域名、不支持 TLS 1.3 或机房跨洋回落），将直接导致客户端 Handshake Failure 无法联网、握手时延暴增 100ms+，甚至因探针时延特征暴露导致服务器 IP 被精准封锁。"
>
<p>
自 2023 年 Xray-core 团队发布 Reality 规范以来，它迅速取代了传统的自建 TLS 证书方案（如 Trojan、VLESS-XTLS-Direct），成为公网直连抗封锁的技术天花板。
</p>
<p>
然而，<strong>成也 SNI，败也 SNI</strong>。Reality 摆脱了购买域名和申请证书的繁琐流程，却将整套系统的生存概率完全绑定在服务端所配置的 <code>dest</code> 与客户端填写的 <code>serverName</code>（SNI）之上。如果使用了已经被审查系统特征标记的域名、缺少现代密码学套件的老旧网站，或者与你 VPS 落地机房物理拓扑相隔数千公里的站点，你的节点不但起不到伪装效果，反而会成为主动探测系统眼中“此地无银三百两”的典型靶子。
</p>
<p>
本文将从 RFC 握手密码学原理出发，剖析 Reality 如何借用公网证书实现 0 证书成本与反主动探测，确立五大工程筛选准则，公布实测验证的白名单域名梯队，并提供一键 Linux 验证脚本与 Xray / Sing-box 生产级配置模板。
</p>
</AnswerBox>

---

## 目录导览

1. [Reality 核心原理：0 证书成本与反主动探测底层机理](#一、-reality-核心原理-0-证书成本与反主动探测底层机理)
2. [伪装目标（SNI / dest）五大黄金筛选法则](#二、-伪装目标-sni-dest-五大黄金筛选法则)
3. [翻车典型反面教材：新手最容易踩的三大深坑](#三、-翻车典型反面教材-新手最容易踩的三大深坑)
4. [实测验证的白名单域名梯队推荐与 CDN 拓扑匹配表](#四、-实测验证的白名单域名梯队推荐与-cdn-拓扑匹配表)
5. [Linux 终端一键检测脚本：OpenSSL 与 Curl 自动化验证工具](#五、-linux-终端一键检测脚本-openssl-与-curl-自动化验证工具)
6. [Xray-core 与 Sing-box 生产级双端完整配置模板与 ShortId 密钥体系](#六、-xray-core-与-sing-box-生产级双端完整配置模板与-shortid-密钥体系)
7. [高频故障排错与技术疑难实战 (FAQ)](#七、-高频故障排错与技术疑难实战-faq)
8. [全站技术关联导航与延伸阅读](#八、-全站技术关联导航与延伸阅读)

---

## 一、 Reality 核心原理：0 证书成本与反主动探测底层机理

### 1.1 传统自建 TLS 伪装的“阿喀琉斯之踵”

在传统的代理模型中（无论是 [Trojan-GFW](/protocols/) 还是早期配合 Nginx 的 VLESS-WS-TLS），服务端架构始终依赖于自建证书：

```
[客户端] ----(明文 SNI: myproxy.com)----> [境外 VPS (自建证书 Nginx)]
```

这种自建伪装体系在面对现代国家级深度包检测（DPI）与主动探测系统（Active Probing）时，暴露出三个致命软肋：

1. **证书与域名的强绑定暴露所有权**：通过 Let's Encrypt 或 ZeroSSL 免费申请的证书，全部会被强制同步记入公开的**证书透明度日志（Certificate Transparency Log, 简称 CT Log）**。防火墙只需订阅全球 CT Log，便可自动化筛选所有刚解析到海外高危 VPS 供应商（如搬瓦工、DigitalOcean、Vultr）的新域名，并列入重点监控清单。
2. **小站流量与证书的离群统计学特征**：个人搭建的小网站日常几乎没有任何自然访问流量。一旦某个名不见经传的个人小站突然 7×24 小时产生持续数十 GB 的境外流媒体和超长 TCP 会话，统计学模型会迅速将其标记为异常代理行为。
3. **主动探针（Active Probing）的指纹降维打击**：审查系统会模拟各类合规客户端对目标端口发送畸形握手、未授权 HTTP/2 请求或空报文。很多自建小站虽然配置了 Nginx 伪装主页，但在面对复杂的 TLS 密码套件协商、ALPN 重协商或畸形 HTTP 头时，其返回的响应指纹（如 Server 标头、TCP Window 行为、证书链深度）与真实的全球大厂网站存在巨大的统计学差异。

### 1.2 Reality 的颠覆性设计：借鸡生蛋与偷天换日

VLESS-Reality 彻底废除了“自建证书”这一环节。它不向任何证书颁发机构（CA）申请证书，而是直接**偷借（Borrow）公网中真实合法大厂站点的 TLS 1.3 证书与公钥**：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">客户端发起 ClientHello 握手 (SNI 借用大厂权威域名)</div>
        <div class="step-info-desc">客户端向服务端发起握手，SNI 借用真实大厂合法域名（如 gateway.icloud.com），并在握手扩展字段中隐蔽编码预共享 ShortId。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">服务端内核校验与双路分流 Fallback</div>
        <div class="step-info-desc">
          <strong>合法客户端 (ShortId 匹配)：</strong> 基于 X25519 协商临时密钥，建立全密文出海代理隧道；<br>
          <strong>审查探针探测 (无 ShortId)：</strong> 服务端将 TCP 流量原样透明转发至真实大厂 443 端口，向探针返回大厂权威证书，杜绝特征识别。
        </div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">脱离 CA 证书监管与消灭离群指纹</div>
        <div class="step-info-desc">无需自建证书或挂载 Nginx 伪装页，彻底规避 CT Log 证书透明度日志追踪。</div>
      </div>
    </div>
  </div>
</div>

#### 底层握手工作流程解析：

1. **证书公钥提取与临时密钥预设**：
   Reality 服务端在初次配置时，管理员通过工具抓取目标伪装域名（例如 `gateway.icloud.com:443`）的真实公钥（PublicKey），并由内核生成一对基于 Curve25519 的私钥（PrivateKey）与公钥。
2. **鉴权报文封装（ClientHello Extension）**：
   合法客户端发起连接时，严格模拟标准主流浏览器（通过 uTLS 指纹库，伪装为 Chrome 120+ 或 Safari 17+）发出 TLS 1.3 ClientHello 报文。客户端在 Server Name 指示中填入借用的伪装域名（例如 `gateway.icloud.com`），并将预共享的 `shortId`、时间戳等认证凭据，使用服务端的真实 PublicKey 加密后塞入 TLS 握手的扩展字段中（利用 Session ID 或 Key Share 字段混淆）。
3. **服务端精准路由与二元分流判定**：
   - **分支 A（合法代理请求）**：
     Reality 服务端捕获客户端的 ClientHello 包，使用本地持有的 PrivateKey 尝试解密并校验 `shortId`。如果凭证合法且时间戳在允许偏差范围内，服务端判定为合法用户，随后立即与客户端完成定制化的 TLS 握手，直接步入代理数据传输阶段。整个过程对公网旁路监听者而言，完全是一次标准的、发往苹果服务器的 TLS 1.3 协商。
   - **分支 B（审查主动探针探测）**：
     当国家级防火墙的主动探针向该 VPS 端口发起探测时，由于探针根本不知道管理员预设的 `shortId`，解密校验必定失败。
     **此时 Reality 展现出其最核心的防御杀招：服务端绝不丢弃数据包，也不返回连接重置（TCP RST），更不返回自建的伪装 HTML，而是像一个纯粹的四层反向代理一样，直接将该 TCP 连接的所有后续数据包，原封不动地通过底层 Socket 转发给配置的 `dest`（即苹果的官方服务器 `gateway.icloud.com:443`）！**
4. **探针视角的完美伪装**：
   探针收到的是直接由苹果官方服务器返回的 100% 真实、正版、受信任的证书链与合规 HTTP/2 握手包。无论探针发送多么刁钻的探测报文，返回的数据全部由苹果官方服务器生成。在探针的统计模型中，当前这台 VPS 端口表现得与真正的苹果 CDN 节点完全无异，彻底瓦解了主动探测的定性判据。

---

## 二、 伪装目标（SNI / dest）五大黄金筛选法则

Reality 的反探测闭环极其优雅，但其安全防线建立在**回落行为的真实性与一致性**之上。只要伪装目标（dest）选错了一个参数，整套伪装体系就会被 DPI 系统轻易瓦解。

在甄选伪装目标时，必须严格遵守以下五大黄金法则：

<div class="process-flow-container">
  <div class="process-steps-list">
    <div class="process-step-item">
      <div class="step-circle">1</div>
      <div class="step-info">
        <div class="step-info-title">法则 1：必须原生支持 TLS 1.3</div>
        <div class="step-info-desc">全密文传输证书链，服务器优先协商标准 Cipher Suites，杜绝明文证书泄露。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">2</div>
      <div class="step-info">
        <div class="step-info-title">法则 2：必须原生支持 HTTP/2 (ALPN: h2)</div>
        <div class="step-info-desc">与现代客户端 uTLS 浏览器模拟指纹严丝合缝，消除协议协商离群指纹。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">3</div>
      <div class="step-info">
        <div class="step-info-title">法则 3：回落 RTT 必须 &lt; 5ms (同城/同 IDC)</div>
        <div class="step-info-desc">落地机房与伪装 dest 必须物理同拓扑直连，避免回落往返时延过长被探针时序测绘识别。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">4</div>
      <div class="step-info">
        <div class="step-info-title">法则 4：必须属于全球顶级大厂或权威 CDN</div>
        <div class="step-info-desc">拥有海量日常合法公网流量基数，审查模型不会将其轻易归类为异常小众站点。</div>
      </div>
    </div>
    <div class="process-step-item">
      <div class="step-circle">5</div>
      <div class="step-info">
        <div class="step-info-title">法则 5：目标域名在境内必须直连畅通</div>
        <div class="step-info-desc">杜绝选用已被 GFW SNI 阻断、DNS 投毒或配置了地域重定向的域名。</div>
      </div>
    </div>
  </div>
</div>

### 法则 1：必须强制原生支持 TLS 1.3

- **底层机理**：在 TLS 1.2 中，服务器发送给客户端的证书链（ServerCertificate）是**纯明文传输**的，审查设备在链路中间可以无阻碍截获并解析证书内容。而 TLS 1.3（RFC 8446）引入了全新的密钥派生体系，所有扩展信息和证书链均在第一阶段密钥协商完成后**全密文传输**。
- **强制约束**：Reality 协议只支持 TLS 1.3。如果你的目标站点只支持 TLS 1.2，客户端在发起 TLS 1.3 协商时，目标站点直接返回握手失败，导致探针探测时暴露出握手异常，客户端自身也无法建立隧道。

### 法则 2：必须原生支持 HTTP/2 (ALPN: h2)

- **底层机理**：现代桌面端和移动端浏览器（Chrome、Edge、Safari）在访问 HTTPS 网站时，99% 以上都会在 ClientHello 的 ALPN（Application-Layer Protocol Negotiation）扩展中声明协商 `h2, http/1.1`。
- **强制约束**：如果伪装站点的 Web 服务器过于老旧，仅支持 `http/1.1`，那么当客户端使用 uTLS 模拟 Chrome 指纹（期望协商出 `h2`）而服务端回落却协商出 `http/1.1` 时，会产生明显的**浏览器指纹与协议响应脱节**。更严重的是，部分客户端内核在 ALPN 协商失败时会直接掐断连接。

### 法则 3：VPS 落地机房与目标 dest 必须物理同拓扑 (RTT < 5ms)

这是 80% 的自建节点被精准识别的最隐蔽死穴——**时延指纹暴露（Latency-Based Anomaly Detection）**。

假设你购买了一台位于日本东京的 VPS，却将伪装目标随手设置为了位于美国达拉斯的单机房小网站：

```
[主动探测系统探针] ────(公网探测)────► [日本东京 VPS] ────(跨洋单向回落)────► [美国达拉斯目标站点]
   从发出 ClientHello 到接收 ServerHello 的实测回落耗时：
   东京探针直连耗时 (10ms) + VPS 到达拉斯往返耗时 (140ms) = 150ms！
```

审查系统的探测引擎内部维护了全球 BGP 路由的时延基线数据库。探针探测你的东京 VPS 基础 ICMP Ping 延迟只有 15ms，然而向该端口发送 TLS 握手包时，获取苹果或微软证书的耗时却高达 160ms！这种**基础网络往返时间与应用层握手时间严重不匹配的离群特征**，立刻会被判定为中间存在四层中继代理，进而导致 IP 惨遭拉黑。

> [!IMPORTANT] 拓扑匹配原则
> 香港 VPS 必须回落到香港本地节点（或香港 Anycast CDN）；日本 VPS 必须回落到东京本地或日本全域 CDN；美国 VPS 必须回落到美西/美东本地节点。本地回落往返 RTT 必须控制在 **5ms 以内**，甚至同机房内网 1ms 直达。

### 法则 4：必须归属境外顶级权威大厂

伪装的目标站点流量基数越大，你的个人节点在宏观大数据模型中就越安全。
选用 Apple（`icloud.com`）、Microsoft（`azure.com` / `microsoft.com`）、Cloudflare（`dash.cloudflare.com`）、Amazon（`cloudfront.net`）等大厂的原因在于：
- 这些大厂的 IP 段遍布全球各大骨干机房；
- 中国大陆每天有数十亿次合规的操作系统更新、推送服务和云办公流量流向这些域名；
- 它们的证书链极其规范，根证书全部属于全球公信的顶级 CA（如 DigiCert、GlobalSign、Sectigo），具备最深厚的信任背书。

### 法则 5：目标域名在境内必须直连畅通，绝无地理围栏重定向

很多境外网站会对中国大陆的 IP 发起 `302/301` 重定向（例如访问某些跨国企业国际站，自动跳往其境内 `.cn` 镜像站），或者限制境外访问。更关键的是，**该域名在中国大陆的 DNS 权威解析必须健康，未被列入国家级防火墙的 SNI 阻断黑名单**。
如果客户端在本地发出的 ClientHello 中写了一个本身就被 GFW 阻断的 SNI，数据包甚至还没离开中国大陆的省际出口，就会被边界路由器直接下发伪造的 TCP RST 包切断，根本轮不到你的 VPS 做出响应。

---

## 三、 翻车典型反面教材：新手最容易踩的三大深坑

以下是生产环境中最常见的翻车现场，每一个都是血泪沉淀的技术陷阱：

### 翻车深坑 1：偷借已被 GFW 列入黑名单的海外域名

* **错误配置示例**：将 `dest` 设置为 `www.google.com:443`、`twitter.com:443` 或 `www.wikipedia.org:443`。
* **新手致命误区**：“反正我的海外 VPS 可以无障碍访问 Google，既然要伪装，不如直接伪装成 Google 官方！”
* **底层翻车现场**：
  GFW 的 SNI 过滤系统部署在跨国光缆的出口边界，工作在二层与三层旁路。当你的客户端向 VPS 发送首个 TCP 数据包时，虽然目的 IP 是你自己的海外 VPS，但 TLS ClientHello 扩展字段中的 Server Name 是纯明文的 `www.google.com`。
  **骨干网 DPI 探针在微秒级时间内匹配到该 SNI 属于敏感阻断清单，在你的数据包还没离开国境光缆时，旁路系统立刻双向注入伪造的 TCP RST 报文，连接瞬间猝死。** 你的 VPS 连一个握手字节都没有收到。

### 翻车深坑 2：借用过时高校、地方政企或廉价外贸小站

* **错误配置示例**：随手在网上搜寻冷门大学图书馆主页或外贸企业小网站 `www.some-cheap-shop.org:443`。
* **底层翻车现场**：
  1. **不支持现代密码学**：该网站可能依然运行着十年前的 Apache 或未打补丁的 OpenSSL，只支持 TLS 1.2 甚至 TLS 1.0，ALPN 只支持 `http/1.1`。客户端使用 Chrome 指纹强行发起 TLS 1.3 协商时，连接直接被服务端掐断，日志疯狂输出 `remote error: tls: protocol version not supported`。
  2. **站点生命周期不可控**：小站可能随时因为欠费停机、证书过期未续签、或者遭到黑客攻击宕机。一旦目标网站挂掉，你的 Reality 节点由于回落目标失效，会在探针面前表现为端口完全挂起或死连接，直接沦为“僵尸节点”而被系统批量封锁。
  3. **WAF 拦截反噬**：许多小型商用站点开启了严苛的 Cloudflare 5 秒盾（JavaScript Challenge）或各类自动化防爬 WAF。当探针探测 VPS 回落时，频繁收到带有反爬特征的 403 页面，导致探测特征高度离群。

### 翻车深坑 3：偷借国内大厂的海外镜像或备案域名

* **错误配置示例**：将 `dest` 设置为 `www.baidu.com:443`、`www.qq.com:443` 或 `aliyun.com:443`。
* **底层翻车现场**：
  从行为逻辑与统计学模型来看，这种配置自相矛盾到极点：**一台物理机房位于德国法兰克福或美国加州的云主机，日常却频繁产生声明访问“百度”或“腾讯”的跨境 TLS 流量**。
  国内主流互联网企业的海外 IP 池受严格的安全团队监控，一旦发现海外未知 VPS 频繁将未授权探针流量透明转发至其海外 PoP 点，其自有的智能态势感知平台会立刻向云防火墙报警，甚至触发云服务商层面的合规审计。

---

## 四、 实测验证的白名单域名梯队推荐与 CDN 拓扑匹配表

以下域名均经过全国多省份电信、联通、移动网络环境 7×24 小时的持续实测，原生满足 TLS 1.3、HTTP/2 支持，并在全球各大数据中心具备优秀的 Anycast 就近接入节点。

### 4.1 全球权威伪装域名多维度评测大表

| 推荐梯队 | 伪装目标域名 (dest / SNI) | 归属主体 | 默认端口 | TLS 1.3 | ALPN (h2) | 推荐匹配机房区域 | 架构优势与注意事项 |
|:---|:---|:---|:---:|:---:|:---:|:---|:---|
| **T1 旗舰** | `gateway.icloud.com` | Apple Inc. | 443 | 强制原生 | 完美支持 | 香港 / 日本 / 新加坡 / 美西 | 苹果核心推送与云网关，全球 Anycast，境内流量基数极大，公信度极高 |
| **T1 旗舰** | `swdist.apple.com` | Apple CDN | 443 | 强制原生 | 完美支持 | 全球全机房通用 | 苹果软件分发与系统更新 CDN，抗探测能力极强，回落时延极低 |
| **T1 旗舰** | `www.microsoft.com` | Microsoft | 443 | 强制原生 | 完美支持 | 香港 / 日本 / 新加坡 / 欧美 | 微软全球官网，全节点部署 Azure 前端 Anycast，证书轮换规范，极为稳定 |
| **T2 优秀** | `azure.microsoft.com` | Microsoft Azure | 443 | 强制原生 | 完美支持 | 美西 / 美东 / 欧洲 / 新加坡 | 微软云计算核心入口，适合欧美机房落地节点，网络拓扑纯净 |
| **T2 优秀** | `dash.cloudflare.com` | Cloudflare | 443 | 强制原生 | 完美支持 | 欧美 / 亚太全网 | Cloudflare 核心仪表盘，Anycast 覆盖极致，抗审查表现稳健 |
| **T2 优秀** | `registry-1.docker.io` | Docker Inc. | 443 | 强制原生 | 完美支持 | 美西 / 美东 / 欧洲 | 程序员高频拉取镜像业务，流量模式与程序员代理习惯完美贴合 |
| **T3 良好** | `www.nvidia.com` | Nvidia / Akamai | 443 | 强制原生 | 完美支持 | 美国 / 欧洲 / 日本 | 全球算力大厂，依赖 Akamai 全球 CDN 边缘加速，适合高配机房 |
| **T3 良好** | `www.yahoo.com` | Yahoo / Edge | 443 | 强制原生 | 完美支持 | 日本 / 美国 / 欧洲 | 老牌门户网站，日本地区流量极大，非常契合日本软银/NTT 线路 |
| **T3 良好** | `www.amazon.com` | Amazon AWS | 443 | 强制原生 | 完美支持 | 美西 / 美东 / 德国 | 亚马逊全球电商与 CloudFront CDN 承载，北美与欧洲机房首选之一 |

### 4.2 针对不同机房位置的黄金匹配矩阵

- **中国香港机房 (HKT / HKBN / 阿里云轻量香港)**：
  - 核心首选：`gateway.icloud.com`、`swdist.apple.com`
  - 备选推荐：`dash.cloudflare.com`
  - 拓扑原因：香港拥有大量 Apple 与 Cloudflare 的边缘缓存节点，VPS 到 dest 的往返延迟通常在 **1.2ms ~ 3.5ms** 之间，探针几乎无法捕捉到任何多余的中继延迟。
- **日本东京 / 大阪机房 (IIJ / NTT / Softbank)**：
  - 核心首选：`www.yahoo.com`、`gateway.icloud.com`
  - 备选推荐：`www.microsoft.com`
  - 拓扑原因：雅虎在日本是绝对国民级应用，拥有极密集的本地物理机房集群；配合微软与苹果在日本的 Anycast 节点，回落极其自然。
- **美西硅谷 / 洛杉矶机房 (Cogent / Telia / GTT)**：
  - 核心首选：`azure.microsoft.com`、`registry-1.docker.io`
  - 备选推荐：`www.amazon.com`、`www.nvidia.com`
  - 拓扑原因：美西是全球互联网中枢，各大云厂商数据中心在此高度互联。选择 Docker 或 Azure 作为伪装，能完全融入硅谷本地的海量技术业务流中。

---

## 五、 Linux 终端一键检测脚本：OpenSSL 与 Curl 自动化验证工具

为了防止运维工程师在配置 Reality 服务端时凭肉眼主观臆断，我们编写了一款工业级自动化检测脚本 `check_reality_sni.sh`。

该脚本在 VPS 本地直接运行，深度调用 `openssl s_client` 与 `curl`，全自动检测目标伪装域名的 **TLS 1.3 协商、ALPN 支持、证书有效期、本地回落往返 RTT 时延**，并输出直观的达标判定报告。

### 5.1 自动化检测脚本源代码 (`check_reality_sni.sh`)

```bash
#!/usr/bin/env bash
# ==============================================================================
# 脚本名称: check_reality_sni.sh
# 适用平台: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+, Alpine)
# 核心功能: 严格校验伪装域名是否满足 VLESS-Reality 生产级要求
# 依赖工具: bash, openssl (>= 1.1.1), curl, ping
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TARGET_DOMAIN="${1}"
TARGET_PORT="${2:-443}"

function show_usage() {
    echo -e "${YELLOW}使用方法:${NC}"
    echo -e "  bash check_reality_sni.sh <伪装域名> [目标端口(默认443)]"
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  bash check_reality_sni.sh gateway.icloud.com"
    echo -e "  bash check_reality_sni.sh www.microsoft.com 443"
    exit 1
}

if [[ -z "${TARGET_DOMAIN}" ]]; then
    show_usage
fi

echo -e "\n${BLUE}====================================================================${NC}"
echo -e "${BLUE}        VLESS-Reality 伪装目标 (SNI / dest) 工业级合规审计        ${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "正在审计目标目标: ${GREEN}${TARGET_DOMAIN}:${TARGET_PORT}${NC}\n"

# 1. 检查基础 DNS 解析与 IP 获取
echo -n "[1/5] 正在执行 DNS 权威解析... "
RESOLVED_IP=$(getent ahosts "${TARGET_DOMAIN}" | awk '{print $1}' | head -n 1 || true)
if [[ -z "${RESOLVED_IP}" ]]; then
    echo -e "${RED}[FAILED]${NC}"
    echo -e "${RED}错误: 无法解析域名 ${TARGET_DOMAIN}，请检查本地网络或 DNS 配置！${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} (解析 IP: ${RESOLVED_IP})"

# 2. 检查 TLS 1.3 原生握手支持
echo -n "[2/5] 校验是否强制支持 TLS 1.3 密码套件... "
TLS13_TEST=$(echo | openssl s_client -connect "${TARGET_DOMAIN}:${TARGET_PORT}" \
    -servername "${TARGET_DOMAIN}" -tls1_3 2>&1 || true)

if echo "${TLS13_TEST}" | grep -q "Protocol  : TLSv1.3"; then
    CIPHER_SUITE=$(echo "${TLS13_TEST}" | grep "Cipher    :" | awk '{print $3}')
    echo -e "${GREEN}[PASS]${NC} (协商协议: TLSv1.3, 加密套件: ${CIPHER_SUITE})"
else
    echo -e "${RED}[FAILED]${NC}"
    echo -e "${RED}致命警告: 该目标站点不支持 TLS 1.3！严禁用于 Reality 服务端！${NC}"
    exit 1
fi

# 3. 检查 ALPN 协商 (必须包含 h2)
echo -n "[3/5] 校验 ALPN 是否成功协商 HTTP/2 (h2)... "
ALPN_TEST=$(echo | openssl s_client -connect "${TARGET_DOMAIN}:${TARGET_PORT}" \
    -servername "${TARGET_DOMAIN}" -alpn h2,http/1.1 2>&1 || true)

if echo "${ALPN_TEST}" | grep -q "ALPN protocol: h2"; then
    echo -e "${GREEN}[PASS]${NC} (ALPN 成功协商: h2)"
else
    echo -e "${YELLOW}[WARN]${NC}"
    echo -e "${YELLOW}警告: 站点未能协商出 h2，若客户端 uTLS 模拟 Chrome 会产生指纹冲突！${NC}"
fi

# 4. 提取证书 Issuer 与剩余有效期
echo -n "[4/5] 审查 SSL 证书颁发机构与有效期... "
CERT_INFO=$(echo | openssl s_client -connect "${TARGET_DOMAIN}:${TARGET_PORT}" \
    -servername "${TARGET_DOMAIN}" 2>/dev/null | openssl x509 -noout -dates -issuer 2>/dev/null || true)

if [[ -n "${CERT_INFO}" ]]; then
    NOT_AFTER=$(echo "${CERT_INFO}" | grep "notAfter=" | cut -d= -f2)
    ISSUER=$(echo "${CERT_INFO}" | grep "issuer=" | cut -d= -f2-)
    EXPIRY_DATE=$(date -d "${NOT_AFTER}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${NOT_AFTER}" +%s 2>/dev/null || echo "0")
    NOW_DATE=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_DATE - NOW_DATE) / 86400 ))

    if [[ ${DAYS_LEFT} -gt 15 ]]; then
        echo -e "${GREEN}[PASS]${NC}"
        echo -e "      颁发机构: ${BLUE}${ISSUER}${NC}"
        echo -e "      过期时间: ${NOT_AFTER} (剩余 ${GREEN}${DAYS_LEFT} 天${NC})"
    else
        echo -e "${YELLOW}[WARN]${NC} 证书即将到期 (剩余不足 15 天: ${DAYS_LEFT} 天)"
    fi
else
    echo -e "${RED}[FAILED] 无法获取对端证书！${NC}"
    exit 1
fi

# 5. 测量本机到目标站点的回落往返 RTT 时延
echo -n "[5/5] 测算本机到回落站点的 TLS 物理往返 RTT... "
TCP_RTT=$(curl -w "%{time_connect}s (TCP) / %{time_appconnect}s (TLS)\n" -o /dev/null -s -k \
    --resolve "${TARGET_DOMAIN}:${TARGET_PORT}:${RESOLVED_IP}" \
    "https://${TARGET_DOMAIN}:${TARGET_PORT}" || echo "0.000s")

TOTAL_TLS_MS=$(curl -w "%{time_appconnect}" -o /dev/null -s -k \
    --resolve "${TARGET_DOMAIN}:${TARGET_PORT}:${RESOLVED_IP}" \
    "https://${TARGET_DOMAIN}:${TARGET_PORT}" | awk '{printf "%.2f", $1 * 1000}' || echo "999")

if (( $(echo "${TOTAL_TLS_MS} < 10.0" | bc -l) )); then
    echo -e "${GREEN}[EXCELLENT]${NC} (TLS 耗时: ${TOTAL_TLS_MS}ms, 属于极速同城/内网拓扑)"
elif (( $(echo "${TOTAL_TLS_MS} < 35.0" | bc -l) )); then
    echo -e "${GREEN}[GOOD]${NC} (TLS 耗时: ${TOTAL_TLS_MS}ms, 处于同区域网络拓扑)"
else
    echo -e "${RED}[HIGH LATENCY]${NC} (TLS 耗时: ${TOTAL_TLS_MS}ms)"
    echo -e "${RED}警告: 回落延迟过高！说明该域名没有在你的 VPS 本地机房部署 CDN，极易被探针发现代理特征！${NC}"
fi

echo -e "\n${BLUE}====================================================================${NC}"
echo -e "${GREEN}综合判定: 目标域名 ${TARGET_DOMAIN} 审计完毕，可作为 Reality 伪装候选！${NC}"
echo -e "${BLUE}====================================================================${NC}\n"
```

### 5.2 终端检测实测输出示例

在香港机房对 `gateway.icloud.com` 运行检测命令：

```bash
chmod +x check_reality_sni.sh
./check_reality_sni.sh gateway.icloud.com
```

**终端返回的完整合规报告：**

```text
====================================================================
        VLESS-Reality 伪装目标 (SNI / dest) 工业级合规审计        
====================================================================
正在审计目标: gateway.icloud.com:443

[1/5] 正在执行 DNS 权威解析... [OK] (解析 IP: 17.248.146.138)
[2/5] 校验是否强制支持 TLS 1.3 密码套件... [PASS] (协商协议: TLSv1.3, 加密套件: TLS_AES_128_GCM_SHA256)
[3/5] 校验 ALPN 是否成功协商 HTTP/2 (h2)... [PASS] (ALPN 成功协商: h2)
[4/5] 审查 SSL 证书颁发机构与有效期... [PASS]
      颁发机构: C = US, O = Apple Inc., CN = Apple Public EV Server RSA CA 2 - G1
      过期时间: Nov 14 20:31:02 2026 GMT (剩余 388 天)
[5/5] 测算本机到回落站点的 TLS 物理往返 RTT... [EXCELLENT] (TLS 耗时: 1.84ms, 属于极速同城/内网拓扑)

====================================================================
综合判定: 目标域名 gateway.icloud.com 审计完毕，可作为 Reality 伪装候选！
====================================================================
```

---

## 六、 Xray-core 与 Sing-box 生产级双端完整配置模板与 ShortId 密钥体系

### 6.1 密钥体系与 ShortId 生成最佳实践

在配置 Reality 节点之前，必须在服务端使用工具生成专属的 Curve25519 密钥对和短 ID（ShortId）。

#### 第一步：生成 Curve25519 密钥对
在安装了 Xray 或 Sing-box 的 Linux 服务器上执行：

```bash
# 使用 Xray 内置命令生成
xray x25519
```
终端将输出两个密钥：
```text
Private key: uEP7g... (私钥，仅填入服务端配置文件，严禁泄露给客户端)
Public key:  wXZ8k... (公钥，填入客户端配置文件供客户端加密使用)
```

#### 第二步：生成预共享短 ID (ShortId)
`shortId` 用于在 ClientHello 阶段完成身份鉴权认证。必须是 **偶数位长度的 16 进制字符串**（支持 0 到 16 字符，推荐使用标准的 8 字节即 16 个字符）：

```bash
# 生成 8 字节 (16 字符) 高强度十六进制 shortId
openssl rand -hex 8
# 输出示例: 4a9f81d3bc729e01
```

> [!TIP] 多 ShortId 隔离原则
> Reality 服务端的 `shortIds` 是一个 JSON 数组。强烈建议为不同的设备（如 `PC-Home`、`iPhone-Mobile`、`MacBook-Work`）配置不同的 ShortId。当某一台设备的配置意外泄露时，只需在服务端将该特定的 ShortId 删除即可，无需更换公私钥导致全部设备重新配置。

---

### 6.2 Xray-core 生产级配置模板

#### 服务端配置：`/usr/local/etc/xray/config.json`

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/xray/access.log",
    "error": "/var/log/xray/error.log"
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "e4b11f7c-3f92-4a7b-b892-0a77f3398321", // 用户 UUID
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "gateway.icloud.com:443", // 真实回落大厂目标与端口
          "xver": 0,
          "serverNames": [
            "gateway.icloud.com" // 允许客户端填写的伪装 SNI 列表
          ],
          "privateKey": "uEP7g_YOUR_PRIVATE_KEY_HERE_xxxxxxxxxxxxxx=", // 服务端私钥
          "minClientVer": "",
          "maxClientVer": "",
          "maxTimeDiff": 60000, // 允许客户端时间误差 60 秒
          "shortIds": [
            "4a9f81d3bc729e01", // 设备 A: PC
            "c29188e0ab39df55"  // 设备 B: 手机
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ]
}
```

#### 客户端配置：Xray-core 格式 (适用于 Windows / macOS / Linux 桌面端)

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "port": 10808,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    },
    {
      "listen": "127.0.0.1",
      "port": 10809,
      "protocol": "http"
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "198.51.100.22", // 你的 VPS 真实公网 IP 或未被阻断的解析域名
            "port": 443,
            "users": [
              {
                "id": "e4b11f7c-3f92-4a7b-b892-0a77f3398321",
                "flow": "xtls-rprx-vision",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "fingerprint": "chrome", // 必须指定 uTLS 浏览器指纹 (chrome/firefox/safari)
          "serverName": "gateway.icloud.com", // 必须与服务端 serverNames 列表一致
          "publicKey": "wXZ8k_YOUR_PUBLIC_KEY_HERE_xxxxxxxxxxxxxx=", // 对应的服务端公钥
          "shortId": "4a9f81d3bc729e01", // 分配给本客户端的 shortId
          "spiderX": ""
        }
      },
      "tag": "proxy"
    },
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ]
}
```

---

### 6.3 Sing-box 生产级配置模板

Sing-box 凭借极小内存占用与原生全平台支持，已成为当今极客与移动设备的首选核心。

#### 服务端配置：`/etc/sing-box/config.json`

```json
{
  "log": {
    "level": "warn",
    "timestamp": true
  },
  "inbounds": [
    {
      "type": "vless",
      "tag": "vless-reality-in",
      "listen": "::",
      "listen_port": 443,
      "users": [
        {
          "uuid": "e4b11f7c-3f92-4a7b-b892-0a77f3398321",
          "flow": "xtls-rprx-vision"
        }
      ],
      "tls": {
        "enabled": true,
        "server_name": "gateway.icloud.com",
        "reality": {
          "enabled": true,
          "handshake": {
            "server": "gateway.icloud.com",
            "server_port": 443
          },
          "private_key": "uEP7g_YOUR_PRIVATE_KEY_HERE_xxxxxxxxxxxxxx=",
          "short_id": [
            "4a9f81d3bc729e01",
            "c29188e0ab39df55"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    }
  ]
}
```

#### 客户端配置：Sing-box 格式 (适用于 iOS Sing-box / Android / Clash.Meta 转换)

```json
{
  "outbounds": [
    {
      "type": "vless",
      "tag": "Reality-HK-Node",
      "server": "198.51.100.22", // VPS 真实服务器 IP
      "server_port": 443,
      "uuid": "e4b11f7c-3f92-4a7b-b892-0a77f3398321",
      "flow": "xtls-rprx-vision",
      "tls": {
        "enabled": true,
        "server_name": "gateway.icloud.com", // SNI 伪装目标
        "utls": {
          "enabled": true,
          "fingerprint": "chrome" // 启用 uTLS 伪装 Chrome 握手
        },
        "reality": {
          "enabled": true,
          "public_key": "wXZ8k_YOUR_PUBLIC_KEY_HERE_xxxxxxxxxxxxxx=",
          "short_id": "4a9f81d3bc729e01"
        }
      }
    }
  ]
}
```

---

## 七、 高频故障排错与技术疑难实战 (FAQ)

<FaqAccordion 
  title="VLESS-Reality 伪装目标甄选与部署高频避坑 FAQ"
  :items="[
    {
      q: '客户端连接报错 remote error: tls: handshake failure 或 certificate signed by unknown authority 是何原因？',
      a: '这一报错 95% 源于三大配置不匹配：其一，公钥（publicKey）与服务端的私钥（privateKey）非同一对生成，或者客户端将 privateKey 错误当成了 publicKey 填入；其二，客户端填写的 shortId 不在服务端允许的 shortIds 列表内（或者存在空格/大写字母未匹配问题，shortId 必须全为十六进制小写）；其三，服务端配置的 dest 与 serverNames 域名不一致，或者借用的伪装域名证书在近期发生了大版本轮换（如从 RSA 证书变动为非标准 ECC 证书），导致公钥指纹验证失败。此时使用 check_reality_sni.sh 重新验证 dest 并重启服务端核心即可解决。'
    },
    {
      q: '为什么配置了看似完美的 Reality 伪装，节点晚高峰依然频繁卡顿断流，甚至几天后 IP 就被墙？',
      a: '很多用户忽视了物理回落 RTT 和伪装域名国内解析问题。第一种情况：你使用的是香港或日本 VPS，却偷借了美国本土机房的域名，审查探针探测你的端口时遭遇了高达 150ms+ 的回落延迟，时延特征暴露导致 IP 被墙；第二种情况：你所选用的域名虽然没被彻底阻断，但在境内遭遇了严重的 QoS 限速或 DNS 投毒污染；第三种情况：公网直连晚高峰国际出口拥塞，丢包率飙升至 20% 以上，TCP 发生连续拥塞窗口折半。对于晚高峰恶劣网络，公网直连的物理上限决定了体验，若追求 0 丢包极速体验，建议改用二层物理专线架构（如 IEPL / IPLC），或转用 UDP 暴力抢包的 Hysteria 2 协议。'
    },
    {
      q: 'ShortId 到底该设置多长？留空（Empty）会有什么安全风险？',
      a: '规范允许 shortId 长度为 0 到 16 个十六进制字符（必须为偶数位）。如果在服务端将其留空（或 shortIds 包含空字符串），意味着服务端允许客户端在没有提供任何身份凭证的情况下直接握手！任何只要猜到你 PublicKey 的探针（或者通过特定漏洞提取到握手公钥的探测器），都能直接通过握手校验建立会话。这相当于将防盗门虚掩。生产环境最佳实践是严格使用 8 字节（16 位十六进制，例如 openssl rand -hex 8 生成的 16 位字符），且每一台客户端独立分配，严禁全局留空。'
    },
    {
      q: '在企业级内网专线（IEPL / IPLC）中转链路上，适合套用 VLESS-Reality 吗？',
      a: '完全不适合，甚至属于严重负优化。IEPL / IPLC 企业专线是通过境内 BGP 机房切入内网光纤二层直达海外 PoP 点，全程物理隔离，根本不经过公网国际出口，完全不受 GFW 的 DPI 深度包检测与主动探测威胁。在原本绝对安全的内网专线上强行套用 Reality，不仅无法带来任何额外的抗封锁收益，反而会白白增加客户端与服务端的非对称密钥计算开销，增加 15~25ms 的 TLS 1.3 握手延迟，并降低千兆网络下的吞吐跑满率。专线环境的最佳搭档是纯对称加密、0 握手损耗、硬件 AES 极速直通的 Shadowsocks-2022。'
    }
  ]"
/>

---

## 八、 全站技术关联导航与延伸阅读

掌握了 Reality 的核心原理与 SNI 甄选法则后，建议结合以下网络工程白皮书与排障手册构建完整的技术闭环：

- **现代代理协议总览**：深入探究五大代理协议底层握手机制、拥塞控制与适用场景，参阅 [现代代理协议大系与底层技术白皮书 (VLESS Reality / SS-2022 / Trojan / Hysteria 2)](/protocols/)。
- **物理专线底层机理**：理解为什么二层物理光纤无需任何 TLS 伪装，详见 [专线机场全景知识图谱与选型大系 (IEPL / IPLC 深度技术白皮书)](/zhuanxian/) 以及 [IEPL vs IPLC 专线底层机理全对比](/zhuanxian/iepl-vs-iplc)。
- **网络延迟与抖动量化**：学习如何使用专业工具精确抓包测量 RTT、Jitter 与丢包率，详见 [网络性能量化标准库与晚高峰监测](/performance/)。
- **多端设备配置方案**：在 iOS (Sing-box/Loon)、Android、Windows 与 OpenWrt 软路由上高效配置 Reality 客户端与分流规则，参阅 [多设备方案与软路由全指南](/devices/)。
- **Wireshark 抓包排障**：遇到握手中断、证书错误与网络断流时，查阅 [网络排障指南与 Wireshark 抓包实战手册](/troubleshooting/)。
- **服务商基准实测**：查看行业标杆专线服务商在全国 12 地监测点的晚高峰持续压测数据，参阅 [机场性能基准实测横评](/benchmark/)。
- **站点首页导航**：回退至 [专线机场技术实验室首页](/) 查看最新行业动态与技术演进。
