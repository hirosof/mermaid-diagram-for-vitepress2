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
    initShowType : 'Diagram' | 'Code';
    ShowTypeSwitchType : 'Tab' | 'Swap';
    enableCodeLineNumbers : boolean;
    showDiagramTitle:boolean;
}


/**
 * MermaidDiagramRendererコンポーネントのデフォルト設定
 * @export
 * @const MDRDefaultConfig
 * @type {MDRConfig}
 */
export const MDRDefaultConfig :MDRConfig = {
    initShowType:'Diagram',
    enableCodeLineNumbers:true,
    showDiagramTitle:true,
    ShowTypeSwitchType:'Tab'
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