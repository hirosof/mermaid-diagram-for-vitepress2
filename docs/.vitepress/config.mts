import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mermaid-diagram-for-vitepress2",
  description: "VitePress2用のMermaid図描画コンポーネント",
  base: "/mermaid-diagram-for-vitepress2/",
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
