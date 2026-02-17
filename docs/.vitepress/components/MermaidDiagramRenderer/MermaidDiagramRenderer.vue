<!--------------------------------------------------------------------
======================================================================
MermaidDiagramRendererコンポーネント
======================================================================
--------------------------------------------------------------------->



<!--------------------------------------------------------------------
    グローバル設定
--------------------------------------------------------------------->
<script lang="ts">

let IsMermaidInitializedInDarkMode : boolean | null= null

</script>

<!--------------------------------------------------------------------
    インスタンスごとの設定・処理
--------------------------------------------------------------------->
<script setup lang="ts">

import { ref, computed, onMounted, watch, nextTick,useId, Ref, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { MDRDefaultConfig, type MDRConfig } from './MDRConfig'
import mermaid from 'mermaid';
import { RefSymbol } from '@vue/reactivity';


// 属性の取得
const props = defineProps<{
    code: string
    highlightedCode: string
    startLineNumbers: string
    title: string
    isCodeGroupFirstItem?: string
}>()

// テーマのデータを取得
const { isDark, theme } = useData()

// 設定の取得
const config = computed<MDRConfig>(() => ({
    ...MDRDefaultConfig,
    ...(theme.value.MDRConfig ?? {}),
}))


/*
------------------------------------------------------------------------
内部変数(汎用)
------------------------------------------------------------------------
*/

const SelfID = useId()

const mdr_frame_container = ref<HTMLElement>();
const isThisCodeGroupElement = ref<boolean>(false);
const initCSSLineNumber = ref((props.startLineNumbers != null) ? Number(props.startLineNumbers) - 1 : 1)
const DiagramMaxHeightStr = (config.value.DiagramMaxHeight != 0) ? config.value.DiagramMaxHeight+"px" : "none";
const CodeMaxHeightStr = (config.value.CodeMaxHeight != 0) ? config.value.CodeMaxHeight+"px" : "none";


/*
------------------------------------------------------------------------
コンテンツ切り替え系
------------------------------------------------------------------------
*/

type ContentsType = "Diagram" | "Code" | "Exports";
const currentContentType = ref<ContentsType>((config.value.InitShowType == 'Diagram') ? 'Diagram' : 'Code');

function displayNameFromContentsType(type: ContentsType){
    switch(type){
        case 'Diagram':
            return 'ダイアグラム';
        case 'Code':
            return '元コード';
        case 'Exports':
            return 'エクスポート';
    }

}

function nextContentType(type :ContentsType) : ContentsType{
    switch(type){
        case 'Diagram':
            return 'Code';
        case 'Code':
            return (isValidExport.value) ? 'Exports': 'Diagram';
        case 'Exports':
            return 'Diagram';
    }
}

function changeContentType(type: ContentsType | null) {
    if (!type) {
        changeContentType(nextContentType(currentContentType.value));
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
type ColorPaletteType = {
    backColor: string,
    backColor2: string,
    overlayBackColor:string,
    frontColor: string,
    borderColor: string,
    itemHoverBackColor: string,
    itemHoverFrontColor: string,
    activedItemBackColor: string,
    activedItemFrontColor: string,
}

//ライトモード時のカラーパレット
const colorPaletteForLight: ColorPaletteType = {
    backColor: "#00000020",
    backColor2: "#FFFFFFA0",
    overlayBackColor:"#000000A0",
    frontColor: "#000",
    borderColor: "#00000020",
    itemHoverBackColor: "#000000C8",
    itemHoverFrontColor: "#FFF",
    activedItemBackColor: "#000",
    activedItemFrontColor: "#FFF"
}

//ダークモード時のカラーパレット
const colorPaletteForDark: ColorPaletteType = {
    backColor: "#FFFFFF20",
    backColor2: "#000000A0",
    overlayBackColor:"#FFFFFFA0",
    frontColor: "#FFF",
    borderColor: "#FFFFFF20",
    itemHoverBackColor: "#FFFFFFC8",
    itemHoverFrontColor: "#000",
    activedItemBackColor: "#FFF",
    activedItemFrontColor: "#000"
}


// 現在のモードに合わせたカラーパレット
const currentColorPallet= computed<ColorPaletteType>(()=>{
    return (isDark.value) ? colorPaletteForDark : colorPaletteForLight;
})

// テーマ切り替え時の処理
async function onChangeTheme() {
    await InitializeMermaid();
    renderDiagram()
}



/*
    ハイライト済みMermaidコード
*/
const MermaidHighlightedCode = decodeURIComponent(props.highlightedCode);

/*

    ダイアグラム関連

*/

const DiagramID = ref('')
let   DiagramGeneratedNumber = 0;

const DiagramDrawTargetElement = ref<HTMLElement>();

const EnableDrawAreaSizeFitByDiagramSize = ref(true);
const DrawAreaSizeForDiagramSizeMatch = computed(()=>{
    if(!DiagramSize.value) return {};
    return {
        minWidth : `${DiagramSize.value.width}px`,
        minHeight : `${DiagramSize.value.height}px`
    }
})

const DrawAreaSize = computed(()=>{
    if(EnableDrawAreaSizeFitByDiagramSize.value) return {};
    return DrawAreaSizeForDiagramSizeMatch.value;
})


const EnableDiagramDrawAreaMaxSize = ref(true);

const MermaidCode = decodeURIComponent(props.code);
const DiagramData = ref('')
const DiagramSize = ref<MDRSize>();
const MermaidException = ref('');


async function InitializeMermaid(){
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark.value ? 'dark' : 'default',
        securityLevel: 'strict',
        suppressErrorRendering:true
    })
    IsMermaidInitializedInDarkMode = isDark.value;
}

async function renderDiagram() {

    if(IsMermaidInitializedInDarkMode==null){
        await InitializeMermaid();
    }

    DiagramID.value = `mermaid-diagramId-${SelfID}-${DiagramGeneratedNumber++}`;

    try {
        const data = await mermaid.render(DiagramID.value, MermaidCode);
        MermaidException.value = ""
        DiagramData.value = data.svg
        DiagramSize.value = getSVGSize(data.svg , null) || undefined;
    } catch (e) {
        MermaidException.value = `${e}`;
        DiagramData.value = "";
        DiagramSize.value = undefined;
    }
}


/*
    コードブロック
*/

const EnableCodeBlockAreaMaxSize = ref(true);
const ShowCodeBlockLineNumbers = ref(config.value.InitShowCodeLineNumbers)

/*

    SVG Tool

*/

type MDRSize = {
    width:number,
    height:number
}


function getSVGSize(target_svg : string , areaSizeForFailedGotSVGRealSize : MDRSize | null = null) : MDRSize | null{

    const parser = new DOMParser();
    const top_element = parser.parseFromString(target_svg , 'image/svg+xml');
    const svg_element = top_element.querySelector('svg');
    if(!svg_element) return null;

    let realAreaSize = areaSizeForFailedGotSVGRealSize;
    if((DiagramDrawTargetElement !=null)&&(DiagramDrawTargetElement.value !=null)){
        realAreaSize={
            width : DiagramDrawTargetElement.value.clientWidth,
            height : DiagramDrawTargetElement.value.clientHeight
        }satisfies MDRSize;
    }

    if(!realAreaSize){
        realAreaSize = {
            width:800,
            height:600
        }satisfies MDRSize;
    }

    const viewBoxAttribute = svg_element.getAttribute('viewBox');

    let width:number;
    let height:number;

    if(viewBoxAttribute != null){
        const parts = viewBoxAttribute.split(/[\s,]+/)
        width = parseFloat(parts[2]);
        height = parseFloat(parts[3]);
    }else{
        width = parseFloat(svg_element.getAttribute('width') || realAreaSize.width.toString())
        height = parseFloat(svg_element.getAttribute('height') || realAreaSize.height.toString())

    }

    return {width:width , height:height} satisfies MDRSize;
}

/*
------------------------------------------------------------------------
追加の生成系
------------------------------------------------------------------------
*/

function createMarkdownCodeBlockCode() : string{
    let code = "```mermaid\n"+MermaidCode;
    if(code[code.length-1] !== '\n') code+='\n';
    code += "```\n"
    return code;
}

/*
------------------------------------------------------------------------
ダウンロード処理
------------------------------------------------------------------------
*/

function getDownloadFileNameBase() : string{
    return DiagramID.value;
}

function downloadSvg() {
    const blob = new Blob([DiagramData.value], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, getDownloadFileNameBase() + ".svg")
}


function downloadPng(isTransparent : boolean) {
    if (!DiagramData.value) return
    const svgSize = getSVGSize(DiagramData.value);

    if(!svgSize)return

    try{
        // viewBox or width/height から寸法を取得
        let width = svgSize.width;
        let height  = svgSize.height;

        const scale = 2
        const canvas = document.createElement('canvas')
        canvas.width = width * scale
        canvas.height = height * scale

        const ctx = canvas.getContext('2d')
        if(ctx){
            ctx.scale(scale, scale)

            if(!isTransparent){
                ctx.fillStyle = (isDark.value) ? '#000' : '#FFF';
                ctx.fillRect(0,0,canvas.width , canvas.height);
            }
            const svgBase64 = btoa(unescape(encodeURIComponent(DiagramData.value)))
            const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

            const img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob((blob) => {
                    if (blob) triggerDownload(blob, getDownloadFileNameBase() + ".png")
                }, 'image/png')
            }
            img.src = dataUrl
        }else{
            throw new Error ("2d Contextの取得に失敗しました");
        }
    }catch(e){
        console.error("downloadPng Error ： " + e);
    }
}

function downloadMermaidCodeFile(){
   const blob = new Blob([MermaidCode], { type: 'text/vnd.mermaid' })
    triggerDownload(blob, getDownloadFileNameBase() + ".mmd")
}
function downloadMarkdownCodeBlockCodeFile(){
   const blob = new Blob([createMarkdownCodeBlockCode()], { type: 'text/markdown' })
    triggerDownload(blob, getDownloadFileNameBase() + ".md")
}




function triggerDownload(blob: Blob, filename: string) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)   
}

/*
------------------------------------------------------------------------
コピー処理
------------------------------------------------------------------------
*/


const eitherCopied = ref<Boolean | 'Error'>(false)
const eitherCopiedMark = computed(()=>{
    switch(eitherCopied.value){
        case true:
            return '✅';
        case false:
            return '';
        case 'Error':
            return '❌️'
    }
    return '';
})

async function copyTextData(data:string){
    try{
        await navigator.clipboard.writeText(data)
        eitherCopied.value = true;
        setTimeout(() => { eitherCopied.value = false; }, 500);
    }catch(e){
        eitherCopied.value = 'Error'
        console.error("copyTextData Error : " + e);
        setTimeout(() => { eitherCopied.value = false; }, 1000);
    }

}

async function copyMermaidCode() {
    copyTextData(MermaidCode);
}

async function copyMermaidSVG() {
    copyTextData(DiagramData.value);
}

async function copyMarkdownCodeBlockCode() {
    copyTextData(createMarkdownCodeBlockCode());
}


/*
------------------------------------------------------------------------
フルスクリーン関連
------------------------------------------------------------------------
*/


const FullScreenContentsAreaElement = ref<HTMLElement>();
const FullScreenDiagramAreaElement = ref<HTMLElement>();

const visibleFullScreen = ref(false)
let body_overflow_backup:string ="";

const FullScreenDiagramZoomRateMin = 10;
const InitializedFullScreenDiagramZoomRate = 100;
const FullScreenDiagramZoomRateMax = 300;
const FullScreenDiagramZoomRateStep = 10;
const FullScreenDiagramZoomRate = ref(InitializedFullScreenDiagramZoomRate);



function openFullScreen(){
    body_overflow_backup = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    visibleFullScreen.value= true;
    document.addEventListener('keydown' , FullScreenOnKeyDown); 
    nextTick(()=>{
        if((FullScreenContentsAreaElement.value !=undefined) && (FullScreenDiagramAreaElement.value !=undefined)){

        }
    })
}



function closeFullScreen(){
    visibleFullScreen.value= false;
    document.body.style.overflow = body_overflow_backup;
    document.removeEventListener('keydown' , FullScreenOnKeyDown);

}


const FullScreenOnKeyDown = (event:KeyboardEvent) =>{
    if(event.key === 'Escape'){
        event.preventDefault();
        closeFullScreen();
    }
};

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

onUnmounted(()=>{
    if(visibleFullScreen.value) closeFullScreen();
})

const isShowDiagramTitle = computed(()=>{
    return config.value.ShowDiagramTitle && (props.title.length > 0);
})


const isValidDiagramData = computed(()=>{
    return DiagramData.value.length > 0;
})

const isValidMermaidCode = computed(()=>{
    return MermaidCode.length > 0;
})

const isValidExport = computed(()=>{
    return isValidDiagramData.value || isValidMermaidCode.value;
});


</script>


<!--------------------------------------------------------------------
    HTMLテンプレート
--------------------------------------------------------------------->
<template>
    <!--フレーム-->
    <div class="mdr-frame" :class="{ 'language-mermaid': isThisCodeGroupElement, 'active': (isCodeGroupFirstItem != null) }"
        ref="mdr_frame_container" ontouchstart="">
        <div class="mdr-innerFrame" :class="{ 'mdr-innerFrame-for-codegroup': isThisCodeGroupElement }">

            <!--コンテンツタブ-->
            <div class="mdr-content-tab-frame">
                <div class="mdr-content-tab"  v-if="config.ShowTypeSwitchType=='Tab'">
                    <div class="mdr-content-tab-item"
                        :class="{ 'mdr-content-tab-item-actived': currentContentType === 'Diagram' }"
                        @click="changeContentType('Diagram')">{{ displayNameFromContentsType('Diagram') }}</div>
                    <div class="mdr-content-tab-item"
                        :class="{ 'mdr-content-tab-item-actived': currentContentType === 'Code' }"
                        @click="changeContentType('Code')">{{displayNameFromContentsType('Code')}}</div>
                    <div class="mdr-content-tab-item" v-if="isValidExport"
                        :class="{ 'mdr-content-tab-item-actived': currentContentType === 'Exports' }"
                        @click="changeContentType('Exports')">{{displayNameFromContentsType('Exports')}}</div>
                </div>
                <div class="mdr-content-tab"  v-if="config.ShowTypeSwitchType=='Swap'">
                    <div class="mdr-content-tab-item" @click="changeContentType(null)">
                        🔃 {{ displayNameFromContentsType(nextContentType(currentContentType)) }}画面へ切り替える
                    </div>
                </div>
            </div>

            <div class="mdr-operation-panel-frame" v-if="(currentContentType == 'Diagram')">


                <div class="mdr-operation-panel">
                    <div class="mdr-operation-panel-button" @click="EnableDiagramDrawAreaMaxSize = !EnableDiagramDrawAreaMaxSize" v-if="config.DiagramMaxHeight != 0">
                        高さ制限{{ EnableDiagramDrawAreaMaxSize?'解除':'設定' }}
                    </div>
                    <div class="mdr-operation-panel-button" @click="EnableDrawAreaSizeFitByDiagramSize = !EnableDrawAreaSizeFitByDiagramSize">
                        {{(EnableDrawAreaSizeFitByDiagramSize) ? "幅フィット解除" : "幅フィット"}}
                    </div>
                    <div class="mdr-operation-panel-button" @click="openFullScreen();">⛶</div>
                </div>
 
            </div>

            <div class="mdr-operation-panel-frame" v-if="(currentContentType == 'Code') && (config.CodeMaxHeight != 0)">

                <div class="mdr-operation-panel">
                     <div class="mdr-operation-panel-button" @click="ShowCodeBlockLineNumbers = !ShowCodeBlockLineNumbers">
                        行番号を{{ ShowCodeBlockLineNumbers ? '隠す' : '表示する'}}
                    </div>                   
                    <div class="mdr-operation-panel-button" @click="EnableCodeBlockAreaMaxSize = !EnableCodeBlockAreaMaxSize">
                        高さ制限{{ EnableCodeBlockAreaMaxSize?'解除':'設定' }}
                    </div>

                </div>

            </div>

            <div class="mdr-main">

                <div class="mdr-diagram-title" v-if="isShowDiagramTitle">
                    {{ title }}
                </div>

                <div class="mdr-diagram"  v-if="currentContentType == 'Diagram'" 
                    :class="{
                        'mdr-common-style-border-top': isShowDiagramTitle,
                        'mdr-diagram-max-height': (config.DiagramMaxHeight !=0) && EnableDiagramDrawAreaMaxSize
                    }">
                
                    <div class="mdr-diagram-drawArea" v-html="DiagramData" ref="DiagramDrawTargetElement" v-if="(DiagramData.length > 0)" :style="DrawAreaSize"/>

                    <div class="mdr-diagram-drawArea" style="color:red" v-if="(DiagramData.length==0) && (MermaidException.length>0)">
                        Mermaid render error : {{ MermaidException }}
                    </div>

                </div>

                <div class="mdr-code-block" v-html="MermaidHighlightedCode" v-if="currentContentType === 'Code'"
                    :class="{ 
                        'mdr-code-block-with-line-numbers': ShowCodeBlockLineNumbers,
                        'mdr-common-style-border-top': isShowDiagramTitle,
                        'mdr-code-block-max-height' : (config.CodeMaxHeight != 0) && EnableCodeBlockAreaMaxSize
                    }" />

                <div class="mdr-exports" v-if="currentContentType==='Exports'">
                    <ul>
                        <li><div>ダウンロード</div>
                            <ul>
                                <li @click="downloadSvg()">
                                    SVG
                                </li>
                                <li @click="downloadPng(false)">
                                    PNG
                                </li>
                                <li @click="downloadPng(true)">
                                    透過PNG
                                </li>
                                <li @click="downloadMermaidCodeFile()">
                                    元コード (Mermaidファイル)
                                </li>
                                <li @click="downloadMarkdownCodeBlockCodeFile()">
                                    Markdownファイル (コードブロックのみ)
                                </li>
                            </ul>
                        </li>
                        <li><div>{{ eitherCopiedMark }}コピー</div>
                            <ul>
                                <li @click="copyMermaidSVG()">
                                    SVG
                                </li>
                                <li @click="copyMermaidCode()">
                                    元コード (Mermaidコード)
                                </li>
                                <li @click="copyMarkdownCodeBlockCode()">
                                    Markdownコードブロック
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
       </div>
    </div>

    <Teleport to="body">
        <div class="mdr-fullscreen-overlay" v-if="visibleFullScreen" ontouchstart="">
            <div class="mdr-fullscreen-wall">
                <div class="mdr-fullscreen-general-menu-frame">
                    <ul class="mdr-fullscreen-general-menu mdr-fullscreen-system-menu">
                        <li @click="closeFullScreen()">
                            閉じる
                        </li>
                    </ul>
                </div>
                <div class="mdr-fullscreen-general-menu-frame">
                    <ul class="mdr-fullscreen-general-menu mdr-fullscreen-operation-menu">
                        <li>
                           最小
                        </li>
                        <li>
                            縮小
                        </li>
                        <li>
                            {{ FullScreenDiagramZoomRate }} %
                        </li>
                        <li>
                            拡大
                        </li>
                        <li>
                            最大
                        </li>
                    </ul>
                </div>
                <div class="mdr-fullscreen-contents-frame">

                    <div class="mdr-fullscreen-contents-area" ref="FullScreenContentsAreaElement">

                        <div class="mdr-fullscreen-diagram-area" ref="FullScreenDiagramAreaElement" v-html="DiagramData">

                            
                        </div>
                        
                    </div>


                </div>



            </div>
        </div>
    </Teleport>

</template>


<!--------------------------------------------------------------------
スタイルシート
--------------------------------------------------------------------->
<style scoped>
/* 汎用 */

.mdr-common-style-border-top {
    margin-top: 5px;
    border-top: 1px solid v-bind('currentColorPallet?.borderColor');
}

/* フレーム */
.mdr-frame {
    margin: 15px 0;
    --mdr-border-radius-size: 10px;
}


.mdr-innerFrame {
    margin: 0;

    padding: 5px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    border-radius: var(--mdr-border-radius-size);
    background: v-bind('currentColorPallet?.backColor');
    color: v-bind('currentColorPallet?.frontColor');
}

.mdr-innerFrame-for-codegroup {
    margin: 5px;
}




/* コンテンツタブ */

.mdr-content-tab-frame {
    border-bottom: 1px solid v-bind('currentColorPallet?.borderColor');
    min-height: 30px;
    display: flex;
}

.mdr-content-tab {
    margin: 5px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    display: flex;
    border-radius: var(--mdr-border-radius-size);
    overflow: hidden;
}

.mdr-content-tab-item {
    padding: 5px 10px;
    text-align: center;
    border-right: 1px solid v-bind('currentColorPallet?.borderColor');
}

.mdr-content-tab-item:last-of-type {
    border-right: none;
}

@media (hover: hover){
    .mdr-content-tab-item:hover {
        background: v-bind('currentColorPallet?.itemHoverBackColor');
        color: v-bind('currentColorPallet?.itemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-content-tab-item:active {
    background: v-bind('currentColorPallet?.itemHoverBackColor');
    color: v-bind('currentColorPallet?.itemHoverFrontColor');
    cursor: pointer;
}


.mdr-content-tab-item-actived {
    background: v-bind('currentColorPallet?.activedItemBackColor');
    color: v-bind('currentColorPallet?.activedItemFrontColor');
}

/* 操作パネル */

.mdr-operation-panel-frame {
    border-bottom: 1px solid v-bind('currentColorPallet?.borderColor');
    min-height: 30px;
    display: flex;
}


.mdr-operation-panel {
    display: flex;
    overflow: hidden;
    margin: 5px 5px 5px auto;
}

.mdr-operation-panel-button {
    min-width: 38px;
    padding: 5px 5px;
    margin: 0 5px;
    text-align: center;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    border-radius: var(--mdr-border-radius-size);
}

@media (hover: hover){
    .mdr-operation-panel-button:hover {
        background: v-bind('currentColorPallet?.itemHoverBackColor');
        color: v-bind('currentColorPallet?.itemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-operation-panel-button:active {
    background: v-bind('currentColorPallet?.itemHoverBackColor');
    color: v-bind('currentColorPallet?.itemHoverFrontColor');
    cursor: pointer;
}

/* コンテンツ */

.mdr-main {
    margin: 5px 0;
    padding: 5px;
    background: var(--vp-code-block-bg);
    border-radius: var(--mdr-border-radius-size);
}


/* タイトル */

.mdr-diagram-title {

    background: v-bind('currentColorPallet?.backColor');
    border-radius: var(--mdr-border-radius-size);
    padding: 2px;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    text-align: center;
}

/* ダイアグラム */

.mdr-diagram {
    padding: 5px;
    overflow: auto;
}


.mdr-diagram-max-height{
    max-height: v-bind(DiagramMaxHeightStr);
}
    


.mdr-diagram-drawArea{
    padding: 0;
    margin: 0;
}

/* コードブロック */

.mdr-code-block {
    padding: 5px;
    overflow: auto;
}

.mdr-code-block-max-height{
    max-height: v-bind(CodeMaxHeightStr);
}


.mdr-code-block :deep(pre) {
    margin: 0 !important;
    padding: 0% !important;
}

.mdr-code-block :deep(code) {
    margin: 0 !important;
    padding: 0% !important;
    background: transparent;
}



.mdr-code-block-with-line-numbers {
    counter-reset: current_line_number v-bind(initCSSLineNumber);
}

.mdr-code-block-with-line-numbers :deep(.line)::before {
    display: inline-block;
    width: 50px;
    overflow-x: hidden;
    vertical-align: middle;
    color: var(--vp-code-line-number-color);
    text-align: right;
    margin-right: 5px;
    padding-right: 5px;
    counter-increment: current_line_number;
    content: counter(current_line_number);
    border-right: 2px solid var(--vp-code-block-divider-color);
}



/* エクスポート */

.mdr-exports{
    padding: 5px;
    overflow: auto;
} 

.mdr-exports > ul{
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
}


.mdr-exports > ul > li{
    margin: 5px;
    padding: 5px;
    flex-grow: 1;
    background: v-bind('currentColorPallet?.backColor');
    border-radius: var(--mdr-border-radius-size);
}


.mdr-exports > ul > li > div{
    padding: 5px;
}

.mdr-exports > ul > li > ul{
    background: v-bind('currentColorPallet?.backColor2');
    text-align: left;
    list-style: none;
    margin: 4px;
    padding: 0;

}


.mdr-exports > ul > li > ul > li{
    padding: 5px;
    margin: 0;
    border-bottom: 1px solid v-bind('currentColorPallet?.borderColor');
}

.mdr-exports > ul > li > ul > li:last-of-type{
    border-bottom: none;
}


@media (hover: hover){
    .mdr-exports > ul > li > ul > li:hover {
        background: v-bind('currentColorPallet?.itemHoverBackColor');
        color: v-bind('currentColorPallet?.itemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-exports > ul > li > ul > li:active {
    background: v-bind('currentColorPallet?.itemHoverBackColor');
    color: v-bind('currentColorPallet?.itemHoverFrontColor');
    cursor: pointer;
}


/*

    Teleport : フルスクリーン

*/

.mdr-fullscreen-overlay{
    --mdr-border-radius-size: 10px;
    position: fixed;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: v-bind('currentColorPallet.overlayBackColor');
    color: v-bind('currentColorPallet?.frontColor');
    inset: 0;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    overflow: hidden;
}

.mdr-fullscreen-wall{

    width: 98vw;
    height: 95vh;
    max-width: 98vw;
    max-height: 95vh;
    
    margin: 0;
    padding: 5px;
    background: v-bind('currentColorPallet.backColor2');
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    border-radius: var(--mdr-border-radius-size);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    /* dvw , dvh 対応環境用 */
    width: 98dvw;
    height: 95dvh; 
    max-width: 98dvw;
    max-height: 95dvh;
}

.mdr-fullscreen-general-menu-frame {
    padding: 0px;
    border-bottom: 1px solid v-bind('currentColorPallet?.borderColor');
}


.mdr-fullscreen-general-menu{
    margin: 2.5px;
    padding: 2.5px;
    display: flex;
    align-items: center;
    vertical-align: middle;
}

.mdr-fullscreen-general-menu li{
    margin: 0 2.5px;
    padding: 10px 5px;
    text-align: center;
    min-width: 64px;
    line-height: 25px;
    background: v-bind('currentColorPallet.backColor2');
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    border-radius: var(--mdr-border-radius-size);
}


@media (hover: hover){
    .mdr-fullscreen-general-menu li:hover {
        background: v-bind('currentColorPallet?.itemHoverBackColor');
        color: v-bind('currentColorPallet?.itemHoverFrontColor');
        cursor: pointer;
    }
}
.mdr-fullscreen-general-menu li:active {
    background: v-bind('currentColorPallet?.itemHoverBackColor');
    color: v-bind('currentColorPallet?.itemHoverFrontColor');
    cursor: pointer;
}


.mdr-fullscreen-system-menu{
    justify-content: flex-end;    
}

.mdr-fullscreen-operation-menu{
    justify-content: center;    
}


.mdr-fullscreen-contents-frame{
    flex:1;
    margin-top: 5px;
    background: var(--vp-code-block-bg);
    border-radius: var(--mdr-border-radius-size);
    overflow: auto;
    padding: 5px;
}


.mdr-fullscreen-contents-area{
    padding: 0;
    margin: 0;
}

.mdr-fullscreen-diagram-area{
    padding: 0;
    margin: 0;
    object-fit: contain;
}

</style>