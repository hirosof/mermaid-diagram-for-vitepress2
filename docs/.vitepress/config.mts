import { defineConfig } from 'vitepress'
import { mermaidLang } from './syntaxhighlight/mermaid-lang' //ShikiのMermaid言語設定上書き用
import { setHighlighter } from './syntaxhighlight/mermaid-highlight' //ShikiのMermaid言語ハイライト用

import { MDRTokenInfoProcessor } from './components/MermaidDiagramRenderer/MDRTokenInfoProcessor'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mermaid-diagram-for-vitepress2",
  description: "VitePress2用のMermaid図描画コンポーネント",
  base: "/mermaid-diagram-for-vitepress2/",

  markdown:{
    shikiSetup(shiki) {
      //ShikiのMermaid言語設定を上書きする
      shiki.loadLanguage(mermaidLang)
      setHighlighter(shiki)
    },
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {      
        const processed = MDRTokenInfoProcessor(tokens[idx].info , tokens[idx].content);
        if(processed){
          if(processed.bypass){
            tokens[idx].info = processed.newinfo_for_bypass;
            return defaultFence(tokens, idx, options, env, self)
          }
          //console.log(processed.publish_MDRTag)
          return processed.publish_MDRTag
        }
        return defaultFence(tokens, idx, options, env, self)
      }
    },
  },
  

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'ガイド',link: '/guide/'},
      { text: 'マニュアル',link: '/manual/'},
      { text: '実験場',link: '/experiments/'},

    ],

    sidebar: {
      '/guide/':[{
          text: 'ガイド',
          items:[
            {text: 'トップ' , link:'/guide/'},           
          ]
        }
      ],
      '/manual/':[{
          text: 'マニュアル',
          items:[
            {text: 'トップ' , link:'/manual/'},           
          ]
        }
      ],
      '/experiments/':[{
          text: '実験場',
          items:[
            {text: 'トップ' , link:'/experiments/'},
            {text:'コードグループ',link:'/experiments/code_group'}
          ]
        }
      ]      
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hirosof/mermaid-diagram-for-vitepress2' }
    ]
  }
})
