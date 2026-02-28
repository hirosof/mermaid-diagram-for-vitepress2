/*======================================================================
MermaidDiagramRendererコンポーネントの設定
======================================================================*/

import 'vitepress'



/**
 * MermaidDiagramRendererコンポーネントの設定コレクション
 * 
 * @export
 * @typedef {MDRConfig}
 */
export type MDRConfig = {
    InitShowType : 'Diagram' | 'Code';
    ShowTypeSwitchType : 'Tab' | 'Swap';
    InitShowCodeLineNumbers : boolean;
    ShowDiagramTitle:boolean;
    DiagramMaxHeight:number;
    CodeMaxHeight:number;
}


/**
 * MermaidDiagramRendererコンポーネントのデフォルト設定
 * @export
 * @const MDRDefaultConfig
 * @type {MDRConfig}
 */
export const MDRDefaultConfig :MDRConfig = {
    InitShowType:'Diagram',
    InitShowCodeLineNumbers:true,
    ShowDiagramTitle:true,
    ShowTypeSwitchType:'Tab',
    DiagramMaxHeight:300,
    CodeMaxHeight:300
}



/** DefaultTheme.Config を拡張
 * @see https://vitepress.dev/guide/extending-default-theme#extending-defaultthemeconfig
 */
declare module 'vitepress' {
  namespace DefaultTheme {
    interface Config {
        // 追加: MermaidDiagramRendererコンポーネントの設定
        MDRConfig?: Partial<MDRConfig>
    }
  }
}