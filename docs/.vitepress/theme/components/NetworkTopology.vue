<template>
  <div class="topology-wrapper">
    <div class="topology-header">
      <span class="topo-badge">底层通信拓扑</span>
      <span class="topo-title">企业级专线 (IEPL / IPLC) 端到端数据链路解构</span>
    </div>

    <div class="topology-grid">
      <div class="topo-node user-node">
        <div class="node-title">1. 用户终端层</div>
        <div class="node-desc">Clash / Sing-box / Surge</div>
        <div class="node-detail">TUN虚拟网卡 / 系统代理</div>
      </div>

      <div class="topo-arrow">
        <span class="arrow-line">──────▶</span>
        <span class="arrow-text">本地宽带接入</span>
      </div>

      <div class="topo-node bgp-node">
        <div class="node-title">2. 国内 BGP 入口</div>
        <div class="node-desc">华为云/阿里云/腾讯云</div>
        <div class="node-detail"> Anycast 动态路由 / 防DDoS</div>
      </div>

      <div class="topo-arrow special">
        <span class="arrow-line">══════▶</span>
        <span class="arrow-text-highlight">跨境企业内网 (不过GFW)</span>
      </div>

      <div class="topo-node pop-node">
        <div class="node-title">3. 境外 PoP 汇聚</div>
        <div class="node-desc">香港/日本/新加坡机房</div>
        <div class="node-detail">BGP 原生商宽 / 住宅IP</div>
      </div>

      <div class="topo-arrow">
        <span class="arrow-line">──────▶</span>
        <span class="arrow-text">国际公网互联</span>
      </div>

      <div class="topo-node target-node">
        <div class="node-title">4. 目标服务层</div>
        <div class="node-desc">OpenAI / Claude / Google</div>
        <div class="node-detail">8K 视频 / 实时 SSH 终端</div>
      </div>
    </div>

    <div class="topology-note">
      <div class="note-item">
        <strong>关键差异点：</strong>普通中转由于在“第2步到第3步”跨越公网，数据包会被 GFW 进行深度包检测（DPI）并遭受随机丢包；而 IEPL/IPLC 在此阶段完全运行在运营商内网 MPLS 虚电路或物理光缆上，彻底免疫公网 QoS 劣化。
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.topology-wrapper {
  margin: 28px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.topology-header {
  padding: 12px 18px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  gap: 10px;
}

.topo-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #10b981;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
}

.topo-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.topology-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 18px;
  overflow-x: auto;
  gap: 10px;
}

.topo-node {
  flex: 1;
  min-width: 140px;
  padding: 12px 10px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.user-node { border-top: 3px solid #64748b; }
.bgp-node { border-top: 3px solid #0284c7; }
.pop-node { border-top: 3px solid #10b981; }
.target-node { border-top: 3px solid #8b5cf6; }

.node-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.node-desc {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 2px;
}

.node-detail {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
}

.topo-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.arrow-line {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.arrow-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  white-space: nowrap;
}

.topo-arrow.special .arrow-line {
  color: #10b981;
  font-weight: 800;
}

.arrow-text-highlight {
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
  background: #d1fae5;
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 2px;
  white-space: nowrap;
}

.topology-note {
  padding: 12px 18px;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.topology-note strong {
  color: var(--vp-c-text-1);
}
</style>
