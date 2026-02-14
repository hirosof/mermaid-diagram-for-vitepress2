<!--------------------------------------------------------------------
======================================================================
MermaidDiagramRendererコンポーネント
======================================================================
--------------------------------------------------------------------->



<!--------------------------------------------------------------------
    グローバル設定
--------------------------------------------------------------------->
<script lang="ts">

let diagramGlobalCounter = 0

</script>

<!--------------------------------------------------------------------
    インスタンスごとの設定・処理
--------------------------------------------------------------------->
<script setup lang="ts">

import { ref, computed, onMounted, watch, nextTick, Ref } from 'vue'
import { useData } from 'vitepress'
import { MDRDefaultConfig, type MDRConfig } from './MDRConfig'
import mermaid from 'mermaid';


// 属性の取得
const props = defineProps<{
    code: string
    highlightedCode: string
    startLineNumbers: string
    title: string
    isCodeGroupFirstItem?:string
}>()

// テーマのデータを取得
const { isDark, theme } = useData()

// 設定の取得
const config = computed<MDRConfig>(() => ({
    ...MDRDefaultConfig,
    ...(theme.value.MDRConfig ?? {}),
}))

const mdr_frame_container = ref<HTMLElement>();

const isThisCodeGroupElement = ref<boolean>(false);
const initCSSLineNumber = ref((props.startLineNumbers != null) ? Number(props.startLineNumbers) - 1 : 1)


/*
------------------------------------------------------------------------
コンテンツ切り替え系
------------------------------------------------------------------------
*/

type ContentsType = "Diagram" | "Code";
const currentContentType = ref<ContentsType>((config.value.initShowType=='Diagram') ? 'Diagram' : 'Code');
function changeContentType(type : ContentsType | null){
    if(!type){
        if(currentContentType.value === 'Diagram'){
            changeContentType("Code");
        }else{
            changeContentType("Diagram");
        }
        return;
    }
    currentContentType.value = type;
}


/*
------------------------------------------------------------------------
カラーパレット
------------------------------------------------------------------------
*/

//カラーパレットの型
type ColorPalletType = {
    backColor: string,
    frontColor:string,
    borderColor:string,
    tabItemHoverBackColor:string,
    tabItemHoverFrontColor:string,
    tabActivedItemBackColor:string,
    tabActivedItemFrontColor:string,

}

//ライトモード時のカラーパレット
let colorPalletForLight:ColorPalletType = {
    backColor:"#00000020",
    frontColor:"#000",
    borderColor:"#00000020",
    tabItemHoverBackColor:"#000000C8",
    tabItemHoverFrontColor:"#FFF",
    tabActivedItemBackColor:"#000",
    tabActivedItemFrontColor:"#FFF"
}

//ダークモード時のカラーパレット
let colorPalletForDark:ColorPalletType = {
    backColor:"#FFFFFF20",
    frontColor:"#FFF",
    borderColor:"#FFFFFF20",
    tabItemHoverBackColor:"#FFFFFFC8",
    tabItemHoverFrontColor:"#000",
    tabActivedItemBackColor:"#FFF",
    tabActivedItemFrontColor:"#000"
}






// 現在のモードに合わせたカラーパレット
let currentColorPallet : Ref<ColorPalletType | null> = ref(null)

// テーマ切り替え時の処理

async function onChangeTheme() {
    //モードに合わせてカラーパレット切り替え
    currentColorPallet.value = (isDark.value) ? colorPalletForDark : colorPalletForLight;
    renderDiagram()
}



const MermaidHighlightedCode = computed(()=>decodeURIComponent(props.highlightedCode))

/*

    ダイアグラム描画関連

*/

const DiagramID = ref('')
const MermaidCode = computed(()=>decodeURIComponent(props.code))
const DiagramData = ref('')


async function renderDiagram(){

    mermaid.initialize({
        startOnLoad:false,
        theme: isDark.value ? 'dark' : 'default',
        securityLevel:'loose'
    })

    DiagramID.value = `mermaid-diagramId-${diagramGlobalCounter++}`;

    try{
        const data = await mermaid.render(DiagramID.value , MermaidCode.value);
        DiagramData.value = data.svg
    }catch(e){
        DiagramData.value = `<pre style="color:red">Mermaid render error: ${e}</pre>`;
    }
    
}

/*
------------------------------------------------------------------------
汎用処理
------------------------------------------------------------------------
*/

watch(isDark, async () => {
    await nextTick()
    onChangeTheme()
})

onMounted(() => {
    isThisCodeGroupElement.value = (mdr_frame_container.value?.closest('.vp-code-group') ? true : false)
    onChangeTheme();
})


function isShowDiagramTitle(){
    return config.value.showDiagramTitle && (props.title.length>0);
}


</script>


<!--------------------------------------------------------------------
    HTMLテンプレート
--------------------------------------------------------------------->
<template>
    <!--フレーム-->
    <div class="mdr-frame" :class="{'language-mermaid':isThisCodeGroupElement , 'active':(isCodeGroupFirstItem!=null)}" ref="mdr_frame_container">
        <div class="mdr-innerFrame" :class="{'mdr-innerFrame-for-codegroup':isThisCodeGroupElement}">
            <div class="mdf-header">

                <div class="mdf-content-tab">
                    <div class="mdf-content-tab-item" :class="{'mdf-content-tab-item-actived':currentContentType==='Diagram'}" @click="changeContentType('Diagram')">ダイアグラム</div>
                    <div class="mdf-content-tab-item" :class="{'mdf-content-tab-item-actived':currentContentType==='Code'}" @click="changeContentType('Code')">Mermaidコード</div>
                </div>
                
            </div>

            <div class="mdf-main">


                <div class="mdf-diagram-title" v-if="isShowDiagramTitle()">
                    {{ title }}
                </div>
                
                <div class="mdf-diagram" v-html="DiagramData" v-if="currentContentType=='Diagram'" :class="{'mdf-common-style-border-top':isShowDiagramTitle()}">
                    
                </div>
                
                <div class="mdf-code-block" v-html="MermaidHighlightedCode" v-if="currentContentType==='Code'" :class="{
                    'mdf-code-block-with-line-numbers':config.enableCodeLineNumbers,
                    'mdf-common-style-border-top':isShowDiagramTitle()}">

                </div>

            </div>


            
        </div>

    </div>



  
</template>


<!--------------------------------------------------------------------
スタイルシート
--------------------------------------------------------------------->
<style scoped>

/* 汎用 */

.mdf-common-style-border-top{
    margin-top: 5px;
    border-top: 1px solid v-bind('currentColorPallet?.borderColor');
}

/* フレーム */
.mdr-frame {
    margin: 5px 0;
    --mdr-border-radius-size:10px;
}


.mdr-innerFrame{
    margin: 0;
    
    padding: 5px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    border-radius: var(--mdr-border-radius-size);
    background: v-bind('currentColorPallet?.backColor');
    color: v-bind('currentColorPallet?.frontColor');
}

.mdr-innerFrame-for-codegroup{
    margin: 5px;
}

/*ヘッダー */

.mdf-header{
    border-bottom: 1px solid v-bind('currentColorPallet?.borderColor');
    min-height: 30px;
    display: flex;
}

/* コンテンツタブ */

.mdf-content-tab {
    margin: 5px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    display: flex;
    border-radius: var(--mdr-border-radius-size);
    overflow: hidden;
}

.mdf-content-tab-item {
    padding: 5px 10px;
    text-align: center;
    border-right: 1px solid v-bind('currentColorPallet?.borderColor');
}

.mdf-content-tab-item:last-of-type{
    border-right: none;
}



.mdf-content-tab-item:hover {
    background: v-bind('currentColorPallet?.tabItemHoverBackColor');
    color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
    cursor: pointer;
}

.mdf-content-tab-item-actived{
    background: v-bind('currentColorPallet?.tabActivedItemBackColor');
    color: v-bind('currentColorPallet?.tabActivedItemFrontColor');    
}



.mdf-nav-buttons{

    color: #000;



}



/* コンテンツ */

.mdf-main{
    margin: 5px 0;
    padding: 5px;
    min-height: 100px;
    background: var(--vp-code-block-bg);
    border-radius: var(--mdr-border-radius-size);
}


/* タイトル */

.mdf-diagram-title{

    background: v-bind('currentColorPallet?.backColor');
    border-radius: var(--mdr-border-radius-size);
    padding: 2px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    text-align: center;
}

/* ダイアグラム */

.mdf-diagram{
    padding: 5px;
    max-height: 500px;
    overflow: auto;
}


/* コードブロック */

.mdf-code-block{
    padding: 5px;
    max-height: 500px;
    overflow: auto;
}

.mdf-code-block :deep(pre){
    margin: 0 !important;
    padding: 0% !important;
}
.mdf-code-block :deep(code){
    margin: 0 !important;
    padding: 0% !important;
    background: transparent;
}



.mdf-code-block-with-line-numbers{
    counter-reset: current_line_number v-bind(initCSSLineNumber);
}

.mdf-code-block-with-line-numbers  :deep(.line)::before{
    display: inline-block;
    width: 2.5em;
    content: 'XX';
    color: var(--vp-code-line-number-color);
    text-align: right;
    margin-right: 5px;
    padding-right: 5px;
    counter-increment: current_line_number;
    content: counter(current_line_number);
    border-right: 2px solid var(--vp-code-block-divider-color);
}

/*フッター */
.mdf-footer{
    border-top: 1px solid v-bind('currentColorPallet?.borderColor');
    min-height: 30px;
}

</style>