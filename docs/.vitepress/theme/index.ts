// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import './style.css'

//追加するコンポーネント読み込み
import MermaidDiagramRenderer from '../components/MermaidDiagramRenderer/MermaidDiagramRenderer.vue'


export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...

    //MermaidDiagramRendererの登録  
    app.component("MermaidDiagramRenderer" , MermaidDiagramRenderer)
  }
} satisfies Theme
