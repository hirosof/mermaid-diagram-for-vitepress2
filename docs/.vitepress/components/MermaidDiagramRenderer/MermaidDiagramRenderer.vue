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

import { ref, computed, onMounted, watch, nextTick,useId } from 'vue'
import { useData } from 'vitepress'
import { MDRDefaultConfig, type MDRConfig } from './MDRConfig'
import mermaid from 'mermaid';


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

type ContentsType = "Diagram" | "Code";
const currentContentType = ref<ContentsType>((config.value.InitShowType == 'Diagram') ? 'Diagram' : 'Code');
function changeContentType(type: ContentsType | null) {
    if (!type) {
        if (currentContentType.value === 'Diagram') {
            changeContentType("Code");
        } else {
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
type ColorPaletteType = {
    backColor: string,
    frontColor: string,
    borderColor: string,
    tabItemHoverBackColor: string,
    tabItemHoverFrontColor: string,
    tabActivedItemBackColor: string,
    tabActivedItemFrontColor: string,
}

//ライトモード時のカラーパレット
const colorPaletteForLight: ColorPaletteType = {
    backColor: "#00000020",
    frontColor: "#000",
    borderColor: "#00000020",
    tabItemHoverBackColor: "#000000C8",
    tabItemHoverFrontColor: "#FFF",
    tabActivedItemBackColor: "#000",
    tabActivedItemFrontColor: "#FFF"
}

//ダークモード時のカラーパレット
const colorPaletteForDark: ColorPaletteType = {
    backColor: "#FFFFFF20",
    frontColor: "#FFF",
    borderColor: "#FFFFFF20",
    tabItemHoverBackColor: "#FFFFFFC8",
    tabItemHoverFrontColor: "#000",
    tabActivedItemBackColor: "#FFF",
    tabActivedItemFrontColor: "#000"
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
ダウンロード処理
------------------------------------------------------------------------
*/
function downloadSvg() {
    const blob = new Blob([DiagramData.value], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, `${DiagramID.value}.svg`)
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
                    if (blob) triggerDownload(blob, `${DiagramID.value}.png`)
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
    triggerDownload(blob, `${DiagramID.value}.mmd`)
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


const mermaidCodeCopied = ref(false)
async function copyMermaidCode() {
    try{
        await navigator.clipboard.writeText(MermaidCode)
        mermaidCodeCopied.value = true;
        setTimeout(() => {
            mermaidCodeCopied.value = false;
        }, 2000);
    }catch(e){
        console.error("copyMermaidCode Error : " + e);
    }
}

const mermaidSVGCopied = ref(false)
async function copyMermaidSVG() {
    try{
        await navigator.clipboard.writeText(DiagramData.value)
        mermaidSVGCopied.value = true;
        setTimeout(() => {
            mermaidSVGCopied.value = false;
        }, 2000);
    }catch(e){
        console.error("copyMermaidSVG Error : " + e);
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



const isShowDiagramTitle = computed(()=>{
    return config.value.ShowDiagramTitle && (props.title.length > 0);
})


const isValidDiagramData = computed(()=>{
    return DiagramData.value.length > 0;
})

const isValidMermaidCode = computed(()=>{
    return MermaidCode.length > 0;
})

const isValidExportToolbar = computed(()=>{
    return isValidDiagramData.value || isValidMermaidCode.value;
});


</script>


<!--------------------------------------------------------------------
    HTMLテンプレート
--------------------------------------------------------------------->
<template>
    <!--フレーム-->
    <div class="mdr-frame" :class="{ 'language-mermaid': isThisCodeGroupElement, 'active': (isCodeGroupFirstItem != null) }"
        ref="mdr_frame_container">
        <div class="mdr-innerFrame" :class="{ 'mdr-innerFrame-for-codegroup': isThisCodeGroupElement }">

            <!--コンテンツタブ-->
            <div class="mdr-content-tab-frame">
                <div class="mdr-content-tab"  v-if="config.ShowTypeSwitchType=='Tab'">
                    <div class="mdr-content-tab-item"
                        :class="{ 'mdr-content-tab-item-actived': currentContentType === 'Diagram' }"
                        @click="changeContentType('Diagram')">ダイアグラム</div>
                    <div class="mdr-content-tab-item"
                        :class="{ 'mdr-content-tab-item-actived': currentContentType === 'Code' }"
                        @click="changeContentType('Code')">Mermaidコード</div>
                </div>
                <div class="mdr-content-tab"  v-if="config.ShowTypeSwitchType=='Swap'">
                    <div class="mdr-content-tab-item" @click="changeContentType(null)">
                        🔃 {{ (currentContentType==='Code')? "ダイアグラム" :"Mermaidコード" }}表示へ切り替える
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
                    <div class="mdr-operation-panel-button">⛶</div>
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

            </div>

            <div class="mdr-export-toolbar-frame" v-if="isValidExportToolbar">
                <div class="mdr-export-toolbar-label">ダウンロード：</div>
                <div class="mdr-export-toolbar">
                    <div v-if="isValidDiagramData" class="mdr-export-toolbar-item" @click="downloadSvg()">SVG</div>
                    <div v-if="isValidDiagramData" class="mdr-export-toolbar-item" @click="downloadPng(false)">PNG</div>
                    <div v-if="isValidDiagramData" class="mdr-export-toolbar-item" @click="downloadPng(true)">透過PNG</div>
                    <div v-if="isValidMermaidCode" class="mdr-export-toolbar-item" @click="downloadMermaidCodeFile()">Mermaidコード</div>
                </div>
            </div>
            <div class="mdr-export-toolbar-frame" v-if="isValidExportToolbar">
                <div class="mdr-export-toolbar-label">コピー：</div>
                <div class="mdr-export-toolbar">
                    <div v-if="isValidDiagramData" class="mdr-export-toolbar-item" @click="copyMermaidSVG()">
                         {{ (mermaidSVGCopied) ? '✅' : '📋' }} SVG
                    </div>
                    <div v-if="isValidMermaidCode" class="mdr-export-toolbar-item" @click="copyMermaidCode()">
                        {{ (mermaidCodeCopied) ? '✅' : '📋' }} Mermaidコード</div>
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
        background: v-bind('currentColorPallet?.tabItemHoverBackColor');
        color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-content-tab-item:active {
    background: v-bind('currentColorPallet?.tabItemHoverBackColor');
    color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
    cursor: pointer;
}


.mdr-content-tab-item-actived {
    background: v-bind('currentColorPallet?.tabActivedItemBackColor');
    color: v-bind('currentColorPallet?.tabActivedItemFrontColor');
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
        background: v-bind('currentColorPallet?.tabItemHoverBackColor');
        color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-operation-panel-button:active {
    background: v-bind('currentColorPallet?.tabItemHoverBackColor');
    color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
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


/* エクスポートツールバー */

.mdr-export-toolbar-frame {
    border-top: 1px solid v-bind('currentColorPallet?.borderColor');
    min-height: 30px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 5px;
}


.mdr-export-toolbar-label{
    text-align: left;
    margin: auto 5px;
}

.mdr-export-toolbar {
    margin: 5px 5px 5px auto;
    border: 2px solid v-bind('currentColorPallet?.borderColor');
    display: flex;
    justify-content: flex-end;
    border-radius: var(--mdr-border-radius-size);
    overflow: hidden;
}

.mdr-export-toolbar-item {

    padding: 5px 10px;
    text-align: center;
    border-right: 1px solid v-bind('currentColorPallet?.borderColor');
}

.mdr-export-toolbar-item:last-of-type {
    border-right: none;
}

@media (hover: hover){
    .mdr-export-toolbar-item:hover {
        background: v-bind('currentColorPallet?.tabItemHoverBackColor');
        color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
        cursor: pointer;
    }
}

.mdr-export-toolbar-item:active {
    background: v-bind('currentColorPallet?.tabItemHoverBackColor');
    color: v-bind('currentColorPallet?.tabItemHoverFrontColor');
    cursor: pointer;
}
</style>