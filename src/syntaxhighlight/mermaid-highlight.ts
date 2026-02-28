import type { HighlighterGeneric } from 'shiki'

let _highlighter: HighlighterGeneric<any, any> | null = null

export function setHighlighter(h: HighlighterGeneric<any, any>) {
  _highlighter = h
}

export function highlightMermaidCode(code: string): string {
  if (!_highlighter) return ''

  try {
    return _highlighter.codeToHtml(code.trimEnd(), {
      lang: 'mermaid',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    })
  } catch {
    return ''
  }
}