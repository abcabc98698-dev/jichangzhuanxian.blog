<template>
  <div class="bypass-topo-card">
    <div class="topo-header">
      <div class="header-left">
        <span class="topo-badge">旁路由拓扑</span>
        <h4 class="topo-title">单臂旁路由 (Bypass Gateway) 局域网分流架构</h4>
      </div>
      <span class="header-hint">全屋无感透明分流</span>
    </div>

    <div class="topo-body">
      <!-- Step 1: Main Router -->
      <div class="topo-node-row">
        <div class="node-box main-router-box">
          <div class="node-header">
            <span class="box-badge badge-blue">主路由核心</span>
            <span class="box-title">家庭主路由器 (IP: 192.168.1.1)</span>
          </div>
          <div class="box-desc">
            负责 PPPoE 宽带拨号、NAT 转换与物理 Wi-Fi 无线发射；DHCP 自动分发网关与 DNS 指向旁路由。
          </div>
        </div>
      </div>

      <div class="topo-connector">
        <span class="connector-line">│ LAN 局域网二层物理交换</span>
        <span class="connector-arrow">▼</span>
      </div>

      <!-- Step 2: Split branch (Bypass vs Direct) -->
      <div class="topo-split-row">
        <div class="node-box bypass-router-box">
          <div class="node-header">
            <span class="box-badge badge-purple">旁路由代理</span>
            <span class="box-title">OpenWrt 旁路由 (IP: 192.168.1.2)</span>
          </div>
          <ul class="box-list">
            <li>运行 OpenClash (Mihomo 内核 / TUN 模式)</li>
            <li>开启 <strong>Fake-IP 模式</strong> 实现 1ms 域名极速拦截</li>
            <li>配置 <strong>MASQUERADE 防火墙伪装</strong> 规避非对称路由丢包</li>
          </ul>
        </div>

        <div class="node-box direct-box">
          <div class="node-header">
            <span class="box-badge badge-slate">国内直连</span>
            <span class="box-title">免加速设备 (智能家居/白名单)</span>
          </div>
          <div class="box-desc">
            IP 手动指定网关为 192.168.1.1，流量直接从主路由物理直连出海，旁路由关机维护对其零影响。
          </div>
        </div>
      </div>

      <div class="topo-connector">
        <span class="connector-line">│ 局域网全屋终端静默接入</span>
        <span class="connector-arrow">▼</span>
      </div>

      <!-- Step 3: Accelerating Endpoints -->
      <div class="topo-node-row">
        <div class="node-box clients-box">
          <div class="node-header">
            <span class="box-badge badge-green">加速终端群</span>
            <span class="box-title">全屋加速设备 (Apple TV / PC / 手机 / Switch)</span>
          </div>
          <div class="box-desc">
            网关指向 192.168.1.2，DNS 指向 192.168.1.2；免安装任何客户端，国内直连、海外走 <a href="/zhuanxian/">IEPL 专线</a> 毫秒级秒开。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.bypass-topo-card {
  margin: 28px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  max-width: 100%;
}

.topo-header {
  padding: 14px 20px;
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
  gap: 10px;
}

.topo-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.topo-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.header-hint {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}

.topo-body {
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.topo-node-row {
  width: 100%;
}

.node-box {
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-sizing: border-box;
}

.main-router-box {
  border-top: 3px solid #0284c7;
}

.bypass-router-box {
  border-top: 3px solid #9333ea;
  flex: 1 1 280px;
}

.direct-box {
  border-top: 3px solid #64748b;
  flex: 1 1 280px;
}

.clients-box {
  border-top: 3px solid #16a34a;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.box-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-blue { background: #e0f2fe; color: #0369a1; }
.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-slate { background: #f1f5f9; color: #475569; }

.box-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.box-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

.box-list {
  margin: 0;
  padding-left: 18px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.topo-split-row {
  width: 100%;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.topo-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  gap: 2px;
}

.connector-arrow {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .topo-split-row {
    flex-direction: column;
  }
}
</style>
