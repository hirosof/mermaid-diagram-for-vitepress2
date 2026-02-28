import MermaidDiagramRenderer from './components/MermaidDiagramRenderer.vue'

import type { EnhanceAppContext } from 'vitepress'

export function registerMermaidDiagramRendererComponent({ app }: EnhanceAppContext) {
  app.component('MermaidDiagramRenderer', MermaidDiagramRenderer)
}


