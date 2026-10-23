import DefaultTheme from 'vitepress/theme'
import './style.css'
import AnswerBox from './components/AnswerBox.vue'
import AffiliateCard from './components/AffiliateCard.vue'
import ComparisonTable from './components/ComparisonTable.vue'
import DecisionTree from './components/DecisionTree.vue'
import FaqAccordion from './components/FaqAccordion.vue'
import NetworkTopology from './components/NetworkTopology.vue'
import BypassTopology from './components/BypassTopology.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AnswerBox', AnswerBox)
    app.component('AffiliateCard', AffiliateCard)
    app.component('ComparisonTable', ComparisonTable)
    app.component('DecisionTree', DecisionTree)
    app.component('FaqAccordion', FaqAccordion)
    app.component('NetworkTopology', NetworkTopology)
    app.component('BypassTopology', BypassTopology)
  }
}
