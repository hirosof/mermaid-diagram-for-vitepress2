/*======================================================================
MermaidDiagramRendererコンポーネントの設定
======================================================================*/

import 'vitepress'



/**
 * MermaidDiagramRendererコンポーネントの設定コレクション
 * 
 * @export
 * @typedef {MDRConfigType}
 */
export type MDRConfigType = {
    InitShowType : 'Diagram' | 'Code';
    ShowTypeSwitchType : 'Tab' | 'Swap';
    InitShowCodeLineNumbers : boolean;
    ShowDiagramTitle:boolean;
    DiagramMaxHeight:number;
    CodeMaxHeight:number;
    AvailableExportType:'None' | 'Download' | 'Copy' | 'Both'
}


/**
 * MermaidDiagramRendererコンポーネントのデフォルト設定
 * @export
 * @const MDRDefaultConfig
 * @type {MDRConfigType}
 */
export const MDRDefaultConfig :MDRConfigType = {
    InitShowType:'Diagram',
    InitShowCodeLineNumbers:true,
    ShowDiagramTitle:true,
    ShowTypeSwitchType:'Tab',
    DiagramMaxHeight:300,
    CodeMaxHeight:300,
    AvailableExportType:'Both'
}



/** DefaultTheme.Config を拡張
 * @see https://vitepress.dev/guide/extending-default-theme#extending-defaultthemeconfig
 */
declare module 'vitepress' {
  namespace DefaultTheme {
    interface Config {
        // 追加: MermaidDiagramRendererコンポーネントの設定
        MDRConfig?: Partial<MDRConfigType>
    }
  }
}