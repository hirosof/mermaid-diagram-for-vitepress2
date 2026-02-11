
import { MCLSParser, MCLSParser_getNamedParameterValue, MCLSParsedData } from '../../MCLSParser/MCLSParser'

import { highlightMermaidCode } from '../../syntaxhighlight/mermaid-highlight'

export type MDRTokenInfoProcessedData = {
    bypass: boolean
    newinfo_for_bypass: string
    parsedInfo: MCLSParsedData
    publish_MDRTag: string
}


export function MDRTokenInfoProcessor(info: string, content: string): MDRTokenInfoProcessedData | null {

    const parsed = MCLSParser(info.trim())

    if ((parsed) && ['mmd', 'mermaid'].includes(parsed.name)) {

        const bypass = (parsed.unnamedParameters.length > 0) && (parsed.unnamedParameters[0] == 'bypass')

        const line_numbers = MCLSParser_getNamedParameterValue(parsed.namedParameters, "start", "1")
        let highlight_line_ranges = MCLSParser_getNamedParameterValue(parsed.namedParameters, "highlight")

        if(highlight_line_ranges.length==0){
            highlight_line_ranges = MCLSParser_getNamedParameterValue(parsed.namedParameters, "hl")
        }

        let newinfo_for_bypass = "mermaid";
        if (line_numbers.length > 0) newinfo_for_bypass += ":line-numbers=" + line_numbers
        if (highlight_line_ranges.length > 0)  newinfo_for_bypass += " {" + highlight_line_ranges + "}"


        var diagram_title = MCLSParser_getNamedParameterValue(parsed.namedParameters , "title")

        const encoded = encodeURIComponent(content)
        const highlightedHtml = highlightMermaidCode(content) // Shiki highlighterから直接ハイライト済みHTMLを生成
        const encodedHtml = encodeURIComponent(highlightedHtml)
         
        const tag = `<MermaidDiagramRenderer 
            code="${encoded}"
            highlighted-code="${encodedHtml}"
            startLineNumbers="${line_numbers}"
            title="${diagram_title}"
        />`

        return {
            bypass : bypass,
            newinfo_for_bypass : newinfo_for_bypass,
            parsedInfo:parsed,
            publish_MDRTag :tag
        } satisfies MDRTokenInfoProcessedData;
    }


    return null
}
