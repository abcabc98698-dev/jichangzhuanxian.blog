<template>
  <div class="answer-box">
    <div class="answer-header">
      <span class="answer-badge">AEO 核心速答</span>
      <span class="answer-date" v-if="date">实测基线时间：{{ date }}</span>
    </div>
    <div class="answer-title" v-if="question">{{ question }}</div>
    <div class="answer-content">
      <slot></slot>
    </div>
    <div class="answer-takeaway" v-if="takeaway">
      <span class="takeaway-label">决策核心：</span>
      <span class="takeaway-text">{{ takeaway }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  question: { type: String, default: '' },
  date: { type: String, default: '2026-10' },
  takeaway: { type: String, default: '' }
})
</script>

<style scoped>
.answer-box {
  margin: 24px 0;
  padding: 20px 24px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-left: 5px solid var(--vp-c-brand-1);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.answer-badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 4px;
}

.answer-date {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.answer-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.answer-content {
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.answer-takeaway {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 0.9rem;
}

.takeaway-label {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.takeaway-text {
  color: var(--vp-c-text-1);
}
</style>
