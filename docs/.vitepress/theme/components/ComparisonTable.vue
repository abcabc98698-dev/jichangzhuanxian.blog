<template>
  <div class="comparison-container">
    <div class="table-scroll">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="sticky-col">线路架构类型</th>
            <th>物理层/承载方式</th>
            <th>是否过 GFW</th>
            <th>典型延迟 (广港/沪日)</th>
            <th>晚高峰丢包率</th>
            <th>抖动 Jitter</th>
            <th>抗封锁/稳定性</th>
            <th>成本系数</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-highlight">
            <td class="sticky-col">
              <strong>IPLC 物理租用专线</strong>
              <span class="tag-pill tag-green">顶级低延迟</span>
            </td>
            <td>海底/跨境陆缆光纤 TDM/SDH 二层物理信道</td>
            <td><span class="status-yes">不过墙 (物理隔离)</span></td>
            <td>18ms / 28ms</td>
            <td><span class="status-good">&lt; 0.05%</span></td>
            <td>0.5 - 1.2ms</td>
            <td><span class="status-good">极高 (敏感期零影响)</span></td>
            <td>★★★★★ (昂贵)</td>
          </tr>
          <tr class="row-highlight">
            <td class="sticky-col">
              <strong>IEPL 以太网虚拟专线</strong>
              <span class="tag-pill tag-blue">主流旗舰推荐</span>
            </td>
            <td>云厂商/运营商 MPLS/OTN 二层以太网承载</td>
            <td><span class="status-yes">不过墙 (专有私网)</span></td>
            <td>20ms / 32ms</td>
            <td><span class="status-good">&lt; 0.10%</span></td>
            <td>0.8 - 2.0ms</td>
            <td><span class="status-good">极高 (仅需防入口打流)</span></td>
            <td>★★★★☆ (高)</td>
          </tr>
          <tr>
            <td class="sticky-col">
              <strong>BGP 隧道中转 (公网跨境外跨)</strong>
              <span class="tag-pill tag-amber">平价大流量</span>
            </td>
            <td>国内云主机 BGP 入口 + TLS/WireGuard 境外公网跨越</td>
            <td><span class="status-warn">过墙 (隧道全加密)</span></td>
            <td>35ms / 48ms</td>
            <td><span class="status-warn">1.0% - 5.0%</span></td>
            <td>5.0 - 18.0ms</td>
            <td><span class="status-warn">中等 (敏感期易遭干扰)</span></td>
            <td>★★☆☆☆ (中低)</td>
          </tr>
          <tr>
            <td class="sticky-col">
              <strong>CN2 GIA / AS9929 精品公网</strong>
              <span class="tag-pill tag-slate">小众直连</span>
            </td>
            <td>电信 AS4809 / 联通 A网 独立出海公网光纤</td>
            <td><span class="status-warn">过墙 (公网高 QoS)</span></td>
            <td>45ms / 55ms</td>
            <td><span class="status-good">&lt; 0.5%</span></td>
            <td>2.0 - 5.0ms</td>
            <td><span class="status-danger">低 (IP 极易被墙精准封锁)</span></td>
            <td>★★★☆☆ (中)</td>
          </tr>
          <tr>
            <td class="sticky-col">
              <strong>163 / 4837 普通公网直连</strong>
              <span class="tag-pill tag-red">极易卡顿</span>
            </td>
            <td>公网普通民用互联路由 (AS4134 等)</td>
            <td><span class="status-danger">过墙 (最低 QoS 排队)</span></td>
            <td>80ms - 220ms</td>
            <td><span class="status-danger">15% - 40% (雪崩)</span></td>
            <td>30.0 - 150ms</td>
            <td><span class="status-danger">极低 (晚高峰基本瘫痪)</span></td>
            <td>★☆☆☆☆ (白菜价)</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-legend">
      <span>* 数据基准：基于全国多地电信/联通/移动节点在晚高峰 20:30~22:30 实测聚合均值。</span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.comparison-container {
  margin: 28px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  line-height: 1.5;
  text-align: left;
  min-width: 820px;
  margin: 0;
}

.comparison-table th {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 700;
  padding: 12px 14px;
  border-bottom: 2px solid var(--vp-c-divider);
  white-space: nowrap;
}

.comparison-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.sticky-col {
  position: sticky;
  left: 0;
  background: var(--vp-c-bg);
  z-index: 2;
  box-shadow: 2px 0 5px rgba(0,0,0,0.03);
}

.row-highlight {
  background-color: rgba(37, 99, 235, 0.02);
}

.tag-pill {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  width: fit-content;
}

.tag-green { background: #d1fae5; color: #065f46; }
.tag-blue { background: #dbeafe; color: #1e40af; }
.tag-amber { background: #fef3c7; color: #92400e; }
.tag-slate { background: #f1f5f9; color: #475569; }
.tag-red { background: #fee2e2; color: #991b1b; }

.status-good { color: #059669; font-weight: 600; }
.status-yes { color: #0284c7; font-weight: 600; }
.status-warn { color: #d97706; font-weight: 600; }
.status-danger { color: #dc2626; font-weight: 600; }

.table-legend {
  padding: 8px 14px;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
}
</style>
