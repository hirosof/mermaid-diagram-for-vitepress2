import type { UserConfig } from 'vitepress'
import { mermaidLang } from './syntaxhighlight/mermaid-lang'
import { setHighlighter } from './syntaxhighlight/mermaid-highlight'
import { MDRTokenInfoProcessor } from './processor/MDRTokenInfoProcessor'

export function withMermaidDiagramRenderer(config: UserConfig): UserConfig {
  const originalShikiSetup = config.markdown?.shikiSetup
  const originalMdConfig = config.markdown?.config

  return {
    ...config,
    markdown: {
      ...config.markdown,
      shikiSetup(shiki) {
        shiki.loadLanguage(mermaidLang)
        setHighlighter(shiki)
        originalShikiSetup?.(shiki)
      },
      config(md) {
        const defaultFence = md.renderer.rules.fence!
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const processed = MDRTokenInfoProcessor(tokens[idx].info, tokens[idx].content)
          if (processed) {
            if (processed.bypass) {
              tokens[idx].info = processed.newinfo_for_bypass
              return defaultFence(tokens, idx, options, env, self)
            }
            return processed.publish_MDRTag
          }
          return defaultFence(tokens, idx, options, env, self)
        }
        originalMdConfig?.(md)
      },
    },
  }
}

// --- configureMDRTheme: テーマ登録ヘルパー ---
import type { EnhanceAppContext } from 'vitepress'
import MermaidDiagramRenderer from './components/MermaidDiagramRenderer.vue'

export function configureMDRTheme({ app }: EnhanceAppContext) {
  app.component('MermaidDiagramRenderer', MermaidDiagramRenderer)
}

// --- 型・定数のre-export ---
export { MermaidDiagramRenderer }
export { MDRDefaultConfig } from './config/MDRConfig'
export type { MDRConfig } from './config/MDRConfig'
