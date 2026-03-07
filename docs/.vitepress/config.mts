import { defineConfig } from 'vitepress'
import {withMermaidDiagramRenderer} from '../../src/configuration'
import '../../src/config/MDRConfig'

// https://vitepress.dev/reference/site-config

export default withMermaidDiagramRenderer(
  defineConfig({
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
              {text:'導入手順書',link:'/guide/introduction'}
              
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
              {text:'バイパスモード',link:'/experiments/bypass_mode'},
              {text:'コードグループ',link:'/experiments/code_group'},
              {text:'MermaidサンプルA' , link:'/experiments/mermaid-samples-by-claude'},
              {text:'MermaidサンプルB' , link:'/experiments/mermaid-large-samples-by-claude'}

            ]
          }
        ]      
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/hirosof/mermaid-diagram-for-vitepress2' }
      ],
      MDRConfig:{
        InitShowType:'Diagram',
        
      }
    }
  })
)
