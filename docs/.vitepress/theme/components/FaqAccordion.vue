<template>
  <div class="faq-container">
    <div class="faq-header" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    <div class="faq-list">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="faq-item"
        :class="{ active: openIndices.includes(index) }"
      >
        <button class="faq-question" @click="toggle(index)">
          <span class="q-icon">Q</span>
          <span class="q-text">{{ item.q }}</span>
          <span class="q-toggle">{{ openIndices.includes(index) ? '−' : '+' }}</span>
        </button>
        <div class="faq-answer" v-show="openIndices.includes(index)">
          <div class="a-wrapper">
            <span class="a-icon">A</span>
            <div class="a-text" v-html="item.a"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Open first item by default
const openIndices = ref([0])

const toggle = (index) => {
  if (openIndices.value.includes(index)) {
    openIndices.value = openIndices.value.filter(i => i !== index)
  } else {
    openIndices.value.push(index)
  }
}
</script>

<style scoped>
.faq-container {
  margin: 32px 0;
}

.faq-header h3 {
  margin-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item.active {
  border-color: var(--vp-c-brand-1);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.q-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-right: 12px;
  flex-shrink: 0;
}

.q-text {
  flex-grow: 1;
}

.q-toggle {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  margin-left: 10px;
}

.faq-answer {
  padding: 0 18px 16px 18px;
  border-top: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.a-wrapper {
  display: flex;
  align-items: flex-start;
  padding-top: 12px;
  gap: 12px;
}

.a-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #10b98120;
  color: #059669;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}

.a-text {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--vp-c-text-1);
}
</style>
