<template>
  <div class="affiliate-card">
    <div class="card-top">
      <div class="card-brand">
        <h4 class="brand-title">{{ name }}</h4>
        <span class="brand-tier">{{ tier }}</span>
      </div>
      <div class="card-price">
        <span class="price-val">¥{{ price }}</span>
        <span class="price-unit">/月起</span>
      </div>
    </div>

    <div class="card-specs">
      <div class="spec-item">
        <span class="spec-label">线路架构</span>
        <span class="spec-val highlight">{{ lineType }}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">入口基建</span>
        <span class="spec-val">{{ entry }}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">实测 SLA</span>
        <span class="spec-val">{{ sla }}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">实测延迟</span>
        <span class="spec-val font-mono">{{ ping }}</span>
      </div>
    </div>

    <div class="card-evaluation">
      <div class="eval-column pros">
        <div class="eval-title">核心优势</div>
        <ul>
          <li v-for="(pro, idx) in prosList" :key="idx">{{ pro }}</li>
        </ul>
      </div>
      <div class="eval-column cons">
        <div class="eval-title">注意/不适场景</div>
        <ul>
          <li v-for="(con, idx) in consList" :key="idx">{{ con }}</li>
        </ul>
      </div>
    </div>

    <div class="card-bottom">
      <div class="card-disclaimer">
        <span>* 实测基准于晚高峰 21:00 采样；客观评测，独立购买决策</span>
      </div>
      <a :href="url" target="_blank" rel="nofollow sponsored noopener" class="cta-button">
        前往官网实测
        <span class="cta-arrow">→</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  tier: { type: String, default: '企业级专线' },
  price: { type: [String, Number], default: '38' },
  lineType: { type: String, default: 'IEPL 内网专线' },
  entry: { type: String, default: '多线 BGP 智能分流' },
  sla: { type: String, default: '99.95%' },
  ping: { type: String, default: '港 20ms / 日 32ms' },
  pros: { type: [String, Array], default: () => [] },
  cons: { type: [String, Array], default: () => [] },
  url: { type: String, default: '#' }
})

const prosList = computed(() => {
  if (Array.isArray(props.pros)) return props.pros
  return props.pros ? props.pros.split('|') : []
})

const consList = computed(() => {
  if (Array.isArray(props.cons)) return props.cons
  return props.cons ? props.cons.split('|') : []
})
</script>

<style scoped>
.affiliate-card {
  margin: 28px 0;
  padding: 24px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.affiliate-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-title {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.brand-tier {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.card-price {
  text-align: right;
}

.price-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.price-unit {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-left: 2px;
}

.card-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  background: var(--vp-c-bg-soft);
  padding: 14px;
  border-radius: 8px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.spec-val {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.spec-val.highlight {
  color: var(--vp-c-brand-1);
}

.font-mono {
  font-family: var(--vp-font-family-mono);
}

.card-evaluation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .card-evaluation {
    grid-template-columns: 1fr;
  }
}

.eval-column {
  padding: 12px 14px;
  border-radius: 6px;
}

.eval-column.pros {
  background: rgba(16, 185, 129, 0.06);
  border-left: 3px solid #10b981;
}

.eval-column.cons {
  background: rgba(245, 158, 11, 0.06);
  border-left: 3px solid #f59e0b;
}

.eval-title {
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.eval-column.pros .eval-title {
  color: #059669;
}

.eval-column.cons .eval-title {
  color: #d97706;
}

.eval-column ul {
  margin: 0;
  padding-left: 18px;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.card-disclaimer {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 6px;
  background-color: var(--vp-c-brand-1);
  color: #fff !important;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background-color: var(--vp-c-brand-2);
  transform: translateX(2px);
}

.cta-arrow {
  transition: transform 0.2s ease;
}

.cta-button:hover .cta-arrow {
  transform: translateX(3px);
}
</style>
