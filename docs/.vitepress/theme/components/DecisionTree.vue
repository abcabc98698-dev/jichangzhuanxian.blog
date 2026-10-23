<template>
  <div class="decision-tree-card">
    <div class="tree-header">
      <div class="header-left">
        <span class="tree-badge">{{ badgeText }}</span>
        <h3 class="tree-title">{{ currentTitle }}</h3>
      </div>
      <span class="header-hint">响应式自适应选型系统</span>
    </div>

    <!-- TYPE 1: RECOMMEND / GENERAL (Default) -->
    <div v-if="treeType === 'recommend'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">核心诉求判定</div>
          <div class="step-question">你对出海代理网络的第一优先级要求是什么？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch Left: Stability / Dedicated Line -->
        <div class="branch-card branch-stable">
          <div class="branch-header">
            <span class="branch-tag tag-blue">A 路线：绝对稳定 / 零丢包 / 晚高峰秒开</span>
          </div>

          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">预算判定：</span>
              <span class="cond-text">月度预算是否 ≥ ¥25 ~ 40 / 月？</span>
            </div>

            <div class="path-options">
              <div class="path-item path-flagship">
                <div class="path-badge badge-green">是 (预算充裕 / 生产力)</div>
                <div class="path-res-title">选型推荐：企业级全内网专线 (IEPL / IPLC)</div>
                <p class="path-res-desc">
                  全程在运营商物理光纤或二层 MPLS 传输，物理隔离公网审查与晚高峰拥塞，Jitter &lt; 2ms。
                </p>
                <div class="path-brands">
                  <span class="brand-label">代表服务商：</span>
                  <span class="brand-item">AmyTelecom</span>
                  <span class="brand-item">TAG VPN (92国)</span>
                  <span class="brand-item">FlowerCloud</span>
                </div>
              </div>

              <div class="path-item path-economy">
                <div class="path-badge badge-primary">否 (预算有限 ≤ ¥15/月)</div>
                <div class="path-res-title">选型推荐：高性价比轻量专线 / 永久买断</div>
                <p class="path-res-desc">
                  保留真专线晚高峰不卡顿底线，通过轻量年付或永久套餐大幅拉低月均持有成本。
                </p>
                <div class="path-brands">
                  <span class="brand-label">重点推荐：</span>
                  <a href="/recommend/guangsucloud" class="brand-item highlight">⭐ 光速云 (年付8元/月 · 147永久)</a>
                  <a href="/recommend/feimao" class="brand-item highlight">飞猫云 (年付7元/月)</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch Right: High Traffic / Budget -->
        <div class="branch-card branch-budget">
          <div class="branch-header">
            <span class="branch-tag tag-slate">B 路线：超大流量 / 低单价 / 跑量下载</span>
          </div>

          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">场景特征：</span>
              <span class="cond-text">月度预算 &lt; ¥20，但月流量需求 &gt; 500GB</span>
            </div>

            <div class="path-options">
              <div class="path-item path-transit">
                <div class="path-badge badge-amber">高性价比跑量中转</div>
                <div class="path-res-title">选型推荐：优质 BGP 隧道中转机场</div>
                <p class="path-res-desc">
                  国内云主机 BGP 入口 + 隧道加密过境，配合 Hysteria 2 / Trojan 抵御轻微丢包，单价极低。
                </p>
                <div class="path-warning">
                  <span>⚠️ 场景注意：不建议用于严肃外盘量化盯盘交易，重大网络敏感期需配置备用线路。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">🛡️</span>
          <div class="alert-content">
            <strong>行业避坑铁律：</strong>凡宣传“全内网 IPLC 专线”但售价低于 ¥10/月且承诺无限流量的，100% 为公网隧道伪装或超售 50 倍以上的假专线，晚高峰必然发生恶性断流。
          </div>
        </div>
      </div>
    </div>

    <!-- TYPE 2: FREE AIRPORTS RISK TREE -->
    <div v-else-if="treeType === 'free'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">安全风险红线判定</div>
          <div class="step-question">你当前准备在免费节点下执行什么类型的网络操作？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch Left: High Risk Action -->
        <div class="branch-card branch-danger">
          <div class="branch-header">
            <span class="branch-tag tag-rose">高危操作：登录账号 / 密码输入 / 办公通信</span>
          </div>

          <div class="branch-body">
            <div class="path-item path-danger-box">
              <div class="path-badge badge-rose">🚫 极度危险！立刻坚决终止！</div>
              <div class="path-res-title">安全警告：面临凭证窃取与中间人劫持风险</div>
              <p class="path-res-desc">
                公网抓取的免费节点节点主极易部署抓包嗅探脚本。未加密或自签名流量将被全量抓取，电商页面会被劫持注入恶意返利代码，账号密码存在被撞库勒索风险。
              </p>
              <div class="path-warning danger-bg">
                <span>⚠️ 绝对禁忌：严禁在免费节点环境下登录网银、交易所、工作邮箱及社媒主账号。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch Right: Emergency Rescue Only -->
        <div class="branch-card branch-emergency">
          <div class="branch-header">
            <span class="branch-tag tag-amber">应急救急：纯粹临时救急 5 分钟更新配置</span>
          </div>

          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">场景核验：</span>
              <span class="cond-text">是否仅用于拉取正规付费专线的更新订阅地址？</span>
            </div>

            <div class="path-options">
              <div class="path-item path-pass">
                <div class="path-badge badge-green">是 (纯拉取订阅)</div>
                <div class="path-res-title">准许临时使用（严格限制时限）</div>
                <p class="path-res-desc">
                  使用浏览器隐私模式临时拉取节点订阅配置，更新完毕后立即在客户端内永久删除该免费节点。
                </p>
              </div>

              <div class="path-item path-deny">
                <div class="path-badge badge-slate">否 (用于常态日常浏览)</div>
                <div class="path-res-title">坚决不建议使用</div>
                <p class="path-res-desc">
                  免费节点晚高峰丢包率通常 &gt; 90%，高延迟与突发断连严重破坏工作流。建议配置超低门槛正规轻量专线：
                </p>
                <div class="path-brands">
                  <a href="/recommend/feimao" class="brand-item highlight">飞猫云 (¥7/月 · 专属客户端)</a>
                  <a href="/recommend/guangsucloud" class="brand-item highlight">光速云 (8元/月 · 147永久)</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content">
            <strong>安全审计铁律：</strong>“免费往往是最昂贵的代价”。任何无商业化来源的公共节点，其维护成本必然通过流量中继挖矿、黑产蜜罐诱捕或转售用户隐私连接日志回收。
          </div>
        </div>
      </div>
    </div>

    <!-- TYPE 3: TROUBLESHOOTING TREE -->
    <div v-else-if="treeType === 'troubleshooting'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">物理与传输层校验 (L1-L4)</div>
          <div class="step-question">本地局域网网关 Ping 与节点服务器入口 TCP 三次握手测试 (Tcping) 是否正常？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch 1: L1-L4 Failure -->
        <div class="branch-card branch-trouble-1">
          <div class="branch-header">
            <span class="branch-tag tag-rose">TCP 握手全部超时 / 端口不通</span>
          </div>
          <div class="branch-body">
            <div class="path-item path-danger-box">
              <div class="path-badge badge-rose">故障定界：入口中断或基础网络脱机</div>
              <ul class="trouble-list">
                <li><strong>国内 BGP 入口维护或被攻击：</strong> 检查服务商官方公告或切换备用集群；</li>
                <li><strong>本地系统 NTP 时钟偏差 &gt; 60 秒：</strong> 时间戳失效会导致加密握手直接被静默丢弃；</li>
                <li><strong>本地运营商 DNS 阻断：</strong> 尝试修改本地 DNS 为 223.5.5.5 或 119.29.29.29。</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Branch 2: L1-L4 Success -> Go to L7 -->
        <div class="branch-card branch-trouble-2">
          <div class="branch-header">
            <span class="branch-tag tag-green">TCP 握手毫秒级响应 (L1-L4 通畅)</span>
          </div>
          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">进入 STEP 2：</span>
              <span class="cond-text">在终端执行 nslookup www.google.com 127.0.0.1 校验 DNS 防污染</span>
            </div>

            <div class="path-options">
              <div class="path-item path-dns-fail">
                <div class="path-badge badge-amber">返回假 IP (127.0.0.1 或国内 IP)</div>
                <div class="path-res-title">故障定界：本地递归 DNS 被污染劫持</div>
                <p class="path-res-desc">
                  本地 DNS 查询泄露至公网，触发 GFW 投毒。<strong>必须在客户端开启 Fake-IP 模式</strong>，并将远程 DNS 指向 DoH / 专线通道。
                </p>
              </div>

              <div class="path-item path-dns-pass">
                <div class="path-badge badge-blue">返回 198.18.x.x (Fake-IP 成功)</div>
                <div class="path-res-title">进入 STEP 3：内核路由表与 IPv6 审计</div>
                <p class="path-res-desc">
                  若依然无法访问网页，检查是否 TUN 与系统代理双开冲突导致 Metric 倒置；访问 ipleak.net 若显示国内 IPv6，需彻底禁用本地 IPv6 协议栈。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">🛠️</span>
          <div class="alert-content">
            <strong>工程排障金科玉律：</strong>网络排障必须遵循“物理链路 ➔ 入口握手 ➔ DNS 防污染 ➔ 内核路由策略”自底向上推演，切勿在入口脱机时盲目修改分流规则。
          </div>
        </div>
      </div>
    </div>

    <!-- TYPE 4: DEVICES TREE -->
    <div v-else-if="treeType === 'devices'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">组网规模与终端需求判定</div>
          <div class="step-question">局域网内需要出海加速的设备数量与包含的终端类型？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch 1: Few devices -->
        <div class="branch-card branch-devices-small">
          <div class="branch-header">
            <span class="branch-tag tag-blue">轻量终端：≤ 3 台设备 (仅手机与 PC)</span>
          </div>

          <div class="branch-body">
            <div class="path-item path-flagship">
              <div class="path-badge badge-green">极简方案：终端独立客户端</div>
              <div class="path-res-title">各端独立安装现代代理客户端</div>
              <ul class="trouble-list">
                <li><strong>Windows:</strong> 推荐 Clash Verge Rev (Mihomo 内核，开箱即用)</li>
                <li><strong>macOS:</strong> 推荐 Clash Verge Rev 或 Surge for Mac</li>
                <li><strong>iOS:</strong> 推荐 Shadowrocket (小火箭) 或 Loon</li>
              </ul>
              <p class="path-res-desc">
                优势：拓扑极其简单，零局域网冲突风险，移动出差与家庭网络无缝衔接。
              </p>
            </div>
          </div>
        </div>

        <!-- Branch 2: Many devices / Smart TV / Gaming -->
        <div class="branch-card branch-devices-large">
          <div class="branch-header">
            <span class="branch-tag tag-purple">多设备生态：≥ 4 台设备 / 包含电视与游戏机</span>
          </div>

          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">硬件资源：</span>
              <span class="cond-text">局域网内是否有闲置硬件 (x86小主机、N1、NAS)？</span>
            </div>

            <div class="path-options">
              <div class="path-item path-openwrt">
                <div class="path-badge badge-primary">是 (具备闲置硬件)</div>
                <div class="path-res-title">搭建【OpenWrt 旁路由】</div>
                <p class="path-res-desc">
                  主路由拨号 + 旁路由 OpenClash (Fake-IP 模式)。全屋电视、Switch、手机静默透明分流，旁路由关机不影响全屋普通宽带。
                </p>
              </div>

              <div class="path-item path-appletv">
                <div class="path-badge badge-amber">否 (无额外硬件)</div>
                <div class="path-res-title">Apple TV 软网关 或 选购工控软路由</div>
                <p class="path-res-desc">
                  方案 A：Apple TV 运行 tvOS 17 原生小火箭开启网关转发；方案 B：选购百元级成品工控软路由 (如 N100 / R4S)。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">💡</span>
          <div class="alert-content">
            <strong>全屋组网铁律：</strong>单臂旁路由拓扑中，防火墙必须配置 MASQUERADE 伪装，避免非对称路由导致数据包回流异常与恶性丢包。
          </div>
        </div>
      </div>
    </div>

    <!-- TYPE 5: PERFORMANCE TREE -->
    <div v-else-if="treeType === 'performance'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">网络性能劣化表征定位</div>
          <div class="step-question">客户端打开网页、视频或下载时遭遇的核心瓶颈是什么？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch 1: High Throughput but Slow First-byte -->
        <div class="branch-card branch-perf-ttfb">
          <div class="branch-header">
            <span class="branch-tag tag-amber">现象 A：单流吞吐高，但点击与加载严重卡顿</span>
          </div>

          <div class="branch-body">
            <div class="path-options">
              <div class="path-item path-dns">
                <div class="path-badge badge-rose">排查项 1：DNS TTFB 延迟 &gt; 500ms</div>
                <div class="path-res-title">根因：本地 DNS 跨洋递归或未命中 CDN</div>
                <p class="path-res-desc">
                  客户端发起的每一次域名解析均往返跨洋服务器。<strong>修复方案：</strong>开启 Fake-IP 模式实现 1ms 虚假应答，配合 ECS 调度最近 CDN。
                </p>
              </div>

              <div class="path-item path-tls">
                <div class="path-badge badge-slate">排查项 2：TLS 双重握手延迟过长</div>
                <div class="path-res-title">根因：老旧协议握手往返开销大</div>
                <p class="path-res-desc">
                  <strong>修复方案：</strong>升级至支持 0-RTT 的现代架构协议 (如 VLESS-Reality 或 Shadowsocks-2022)。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch 2: Throughput Collapse -->
        <div class="branch-card branch-perf-drop">
          <div class="branch-header">
            <span class="branch-tag tag-rose">现象 B：单流吞吐断崖式暴跌，跑不满物理带宽</span>
          </div>

          <div class="branch-body">
            <div class="path-options">
              <div class="path-item path-loss">
                <div class="path-badge badge-rose">排查项 1：持续丢包率 p &gt; 2%</div>
                <div class="path-res-title">根因：公网晚高峰 QoS 挤压丢包</div>
                <p class="path-res-desc">
                  依据 Mathis 公式，2% 丢包会使 TCP 吞吐暴跌 90% 以上。<strong>修复方案：</strong>彻底放弃公网中转，升级至全内网物理专线 (<a href="/zhuanxian/">IEPL / IPLC</a>)。
                </p>
              </div>

              <div class="path-item path-jitter">
                <div class="path-badge badge-amber">排查项 2：RTT 抖动剧烈 (&gt; 50ms)</div>
                <div class="path-res-title">根因：交换机/光猫缓冲区膨胀 (Bufferbloat)</div>
                <p class="path-res-desc">
                  <strong>修复方案：</strong>在主路由器开启 Cake 或 FQ-CoDel 智能主动队列管理，削减高突发排队延迟。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">⚡</span>
          <div class="alert-content">
            <strong>性能物理铁律：</strong>在长距离跨洋链路中，低丢包率和低抖动的专线永远碾压盲目追求标称千兆的公网中转，丢包率降低 1% 对实际体验的提升远超带宽翻倍。
          </div>
        </div>
      </div>
    </div>

    <!-- TYPE 6: PROTOCOLS TREE -->
    <div v-else-if="treeType === 'protocols'" class="tree-flow">
      <div class="flow-step root-step">
        <div class="step-num">STEP 1</div>
        <div class="step-content">
          <div class="step-label">底层通信链路介质判定</div>
          <div class="step-question">客户端出口至落地机房的底层物理传输介质形态？</div>
        </div>
      </div>

      <div class="flow-branches">
        <!-- Branch 1: Dedicated Line -->
        <div class="branch-card branch-proto-dedicated">
          <div class="branch-header">
            <span class="branch-tag tag-blue">A 路线：跨境物理/内网专线 (IEPL / IPLC 架构)</span>
          </div>

          <div class="branch-body">
            <div class="path-item path-flagship">
              <div class="path-badge badge-green">首选方案：Shadowsocks-2022</div>
              <div class="path-res-title">2022-blake3-aes-128-gcm 对称流加密</div>
              <ul class="trouble-list">
                <li><strong>极致低开销：</strong> 0-RTT 直连，无多余公网 TLS 握手层损耗；</li>
                <li><strong>硬件加速跑满：</strong> CPU AES-NI 指令集硬解，千兆吞吐 CPU 占用 &lt; 5%；</li>
                <li><strong>移动设备极省电：</strong> 手机端长驻后台几乎零温升。</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Branch 2: Public Internet Transit -->
        <div class="branch-card branch-proto-public">
          <div class="branch-header">
            <span class="branch-tag tag-slate">B 路线：公网跨境中转 (穿越 GFW 审查)</span>
          </div>

          <div class="branch-body">
            <div class="sub-condition">
              <span class="cond-label">网络丢包质量：</span>
              <span class="cond-text">晚高峰时段公网跨境丢包与阻断强度？</span>
            </div>

            <div class="path-options">
              <div class="path-item path-hysteria">
                <div class="path-badge badge-amber">晚高峰丢包严重 (&gt; 10%)</div>
                <div class="path-res-title">首选方案：Hysteria 2 (QUIC/UDP)</div>
                <p class="path-res-desc">
                  采用 Brutal 拥塞控制算法，无视传统 TCP 拥塞退避机制，在 20% 高丢包环境下依然能拉满视频吞吐。
                </p>
              </div>

              <div class="path-item path-reality">
                <div class="path-badge badge-blue">公网丢包较低 (&lt; 2%)</div>
                <div class="path-res-title">首选方案：VLESS-Reality</div>
                <p class="path-res-desc">
                  借用真实大厂域名合法 TLS 证书与握手特征，杜绝特征识别与主动探测，适合公网平稳长期驻留。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <div class="footer-alert">
          <span class="alert-icon">📐</span>
          <div class="alert-content">
            <strong>协议选型认知铁律：</strong>不存在全场景最优的万能协议。物理专线选 SS-2022 追求极致低延迟；公网高丢包选 Hysteria 2 强力抗拥塞；公网防阻断选 VLESS-Reality。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  type: { type: String, default: 'recommend' } // 'recommend' | 'free' | 'troubleshooting' | 'devices' | 'performance' | 'protocols'
})

const treeType = computed(() => {
  return props.type || 'recommend'
})

const badgeText = computed(() => {
  switch (treeType.value) {
    case 'free': return '风险评估'
    case 'troubleshooting': return '工程排障'
    case 'devices': return '组网架构'
    case 'performance': return '瓶颈诊断'
    case 'protocols': return '协议选型'
    default: return '极速选型'
  }
})

const currentTitle = computed(() => {
  if (props.title) return props.title
  switch (treeType.value) {
    case 'free': return '免费节点使用风险评估决策树'
    case 'troubleshooting': return '端到端网络故障工程排障决策模型'
    case 'devices': return '多设备场景与组网架构选型决策树'
    case 'performance': return '底层传输瓶颈诊断与网络性能选型决策模型'
    case 'protocols': return '网络环境与协议架构工业级选型决策树'
    default: return '专线与网络架构极速选型决策树'
  }
})
</script>

<style scoped>
.decision-tree-card {
  margin: 32px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.tree-header {
  padding: 16px 22px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tree-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.tree-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.header-hint {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}

.tree-flow {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

.root-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.step-num {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: #fff;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.step-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.step-question {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.45;
}

.flow-branches {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.branch-card {
  flex: 1 1 320px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.branch-header {
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.branch-tag {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.4;
}

.tag-blue { color: #0284c7; }
.tag-slate { color: #475569; }
.tag-rose { color: #e11d48; }
.tag-amber { color: #d97706; }
.tag-green { color: #16a34a; }
.tag-purple { color: #9333ea; }

.branch-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex-grow: 1;
}

.sub-condition {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--vp-c-divider);
  font-size: 0.85rem;
}

.cond-label {
  font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.cond-text {
  color: var(--vp-c-text-2);
}

.path-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.path-item {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.badge-green { background: #dcfce7; color: #15803d; }
.badge-primary { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.badge-amber { background: #fef3c7; color: #b45309; }
.badge-rose { background: #ffe4e6; color: #be123c; }
.badge-blue { background: #e0f2fe; color: #0369a1; }
.badge-slate { background: #f1f5f9; color: #475569; }

.path-res-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.path-res-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0 !important;
}

.path-brands {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.78rem;
  margin-top: 4px;
}

.brand-label {
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.brand-item {
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  text-decoration: none !important;
  font-weight: 600;
}

.brand-item.highlight {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.brand-item.highlight:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.path-warning {
  padding: 8px 12px;
  border-radius: 6px;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  font-size: 0.78rem;
  color: #92400e;
  line-height: 1.45;
}

.danger-bg {
  background: #fff1f2 !important;
  border-left-color: #f43f5e !important;
  color: #9f1239 !important;
}

.trouble-list {
  margin: 4px 0 0 0;
  padding-left: 18px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.tree-footer {
  margin-top: 8px;
}

.footer-alert {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.alert-icon {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .flow-branches {
    flex-direction: column;
  }
  
  .branch-card {
    flex: 1 1 100%;
  }

  .tree-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
