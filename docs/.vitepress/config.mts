import { defineConfig } from 'vitepress'
import { mermaidLang } from './syntaxhighlight/mermaid-lang' //ShikiのMermaid言語設定上書き用

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mermaid-diagram-for-vitepress2",
  description: "VitePress2用のMermaid図描画コンポーネント",
  base: "/mermaid-diagram-for-vitepress2/",

  markdown:{
    shikiSetup(shiki) {
      //ShikiのMermaid言語設定を上書きする
      shiki.loadLanguage(mermaidLang)
    }
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
          ]
        }
      ]      
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hirosof/mermaid-diagram-for-vitepress2' }
    ]
  }
})
