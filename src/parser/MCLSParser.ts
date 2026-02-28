/*
    MCLSParser :  Markdown Codeblock Language Specified Parser
*/

export type MCLSStringDictionaryItem = {
    name: string
    value: string
}

export type MCLSParsedData = {
    name: string
    unnamedParameters: Array<string>
    namedParameters: Array<MCLSStringDictionaryItem>
}


function MCLSParser_getNextString(target: string, start: number, endChar: string): [nextString: string , endPoint:number] {
    let result = ""
    let next_bypass = false;
    let idx;
    for (idx= start; idx < target.length; idx++) {

        if(next_bypass){
            next_bypass = false
            result += target[idx]
            continue;
        }

        if (target[idx] == endChar) {
            break;
        }else if(target[idx] == '\\'){
            next_bypass = true;
            continue;
        }
        result += target[idx]
    }
    return [result.trim(),idx]
}

function MCLSParser_analyzeNextParameterBlock(target: string, start: number, endChar: string): [parameters: Array<MCLSStringDictionaryItem>, endPoint: number] {
    let result: Array<MCLSStringDictionaryItem> = []

    let current_name = ""
    let current_value = ""

    let target_idx: number

    for (target_idx = start; target_idx < target.length; target_idx++) {
        if (target[target_idx] == endChar) {
            break;
        }

        // 半角スペースは無視
        if (target[target_idx] == ' ') continue;

        // , でアイテム登録
        if (target[target_idx] == ',') {
            let param: MCLSStringDictionaryItem = {
                name: current_name.trim(),
                value: current_value.trim()
            }
            result.push(param)
            current_name = ""
            current_value = ""
            continue;
        }

        if ([':', "="].includes(target[target_idx]) && (current_name.length == 0)) {
            current_name = current_value
            current_value = ""
            continue
        }

        let nextString = ""
        let endPoint
        switch (target[target_idx]) {
            case '\'':
            case '"':
                [nextString , endPoint] = MCLSParser_getNextString(target, target_idx + 1, target[target_idx])
                current_value += nextString
                target_idx = endPoint
                break;
            default:
                current_value += target[target_idx]
                break;
        }

    }

    if ((current_value.length > 0) || (current_name.length > 0)) {
        let param: MCLSStringDictionaryItem = {
            name: current_name.trim(),
            value: current_value.trim()
        }
        result.push(param)
    }

    return [result, target_idx]
}

export function MCLSParser(md_cb_lang_specified: string): MCLSParsedData | null {


    let target = md_cb_lang_specified.trim()


    let unnamedParameters: Array<string> = []
    let namedParameters: Array<MCLSStringDictionaryItem> = []
    let isExtraAnalyze: boolean;
    let current_str = ""

    let code_block_brackets = ['()', '[]', '{}']
    let invalid_begin = false


    for(const element of code_block_brackets){
        if (element[0] === target[0]) {
            invalid_begin = true;
            break;
        }    
    }

    if (invalid_begin) return null

    for (let idx = 0; idx < target.length; idx++) {

        isExtraAnalyze = false

        switch (target[idx]) {
            case '\'':
            case '"':
            case ' ':
            case ',':
                isExtraAnalyze = true
                break;
            default:
                for(const element of code_block_brackets){
                    if (target[idx] == element[0]) {
                        isExtraAnalyze = true
                        break;
                    }
                }
                break;
        }

        if (!isExtraAnalyze) {
            current_str += target[idx]
            continue;
        } else {
            const cs = current_str.trim()
            if (cs.length > 0) {
                unnamedParameters.push(cs)
                current_str = ""
            }
        }

        let params: Array<MCLSStringDictionaryItem> = []
        let endPoint = 0
        let nextString = ""

        switch (target[idx]) {
            case '\'':
            case '"':
                [nextString , endPoint] = MCLSParser_getNextString(target, idx + 1, target[idx])
                unnamedParameters.push(nextString)
                break;
            // 以下は位置調整のみ
            case ' ':
            case ',':
                endPoint = idx
                break;

            default:
                //ブラケットの処理
                for(const element of code_block_brackets){
                    if (target[idx] == element[0]) {
                        [params, endPoint] = MCLSParser_analyzeNextParameterBlock(target, idx + 1, element[1])
                        break;
                    }
                }
                break;
        }

        if (params.length > 0) {

            //ネームドパラメータとネームレス(値のみ)のパラメータを分類
            for (let paramIdx = 0; paramIdx < params.length; paramIdx++) {
                if (params[paramIdx].name.length > 0) {
                    namedParameters.push(params[paramIdx])
                } else {
                    unnamedParameters.push(params[paramIdx].value)
                }
            }
        }

        idx = endPoint
    }

    const cs = current_str.trim();
    if (cs.length > 0) unnamedParameters.push(cs);
    
    return {
        name: unnamedParameters[0],
        unnamedParameters: unnamedParameters.toSpliced(0, 1),
        namedParameters: namedParameters
    } satisfies MCLSParsedData;
}

export function MCLSParser_getNamedParameterValue(parameters : Array<MCLSStringDictionaryItem> , target_name:string ,  defaultReturn : string = "") : string{
    for(const element of parameters ){
        if(element.name === target_name){
            return element.value;
        }
    }
    return defaultReturn;
}