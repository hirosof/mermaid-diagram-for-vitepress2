// Shiki同梱のmermaid文法から #mermaid リポジトリを抽出し、
// スタンドアロン言語として再登録する
import type { LanguageRegistration } from 'shiki'

export const mermaidLang: LanguageRegistration = {
  name: 'mermaid',
  scopeName: 'source.mermaid',
  patterns: [
    { include: '#content' }
  ],
  repository: {
    content: {
      patterns: [
        // コメント
        { match: '%%.*', name: 'comment.line.mermaid' },
        // ダイアグラム種別キーワード
        {
          match: '(?i)^\\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|journey|mindmap|quadrantChart|requirementDiagram|xychart(?:-beta)?|architecture-beta|timeline|sankey-beta|block-beta|packet-beta|kanban)\\b',
          captures: {
            1: { name: 'keyword.control.mermaid' }
          }
        },
        // 方向キーワード
        {
          match: '(?i)\\b(TB|TD|BT|RL|LR)\\b',
          name: 'entity.name.function.mermaid'
        },
        // 制御キーワード
        {
          match: '(?i)\\b(subgraph|end|participant|actor|loop|alt|else|opt|par|and|critical|break|rect|note|over|activate|deactivate|autonumber|as|left of|right of|section|title|dateFormat|axisFormat|excludes|todayMarker|class|classDef|click|style|linkStyle|direction|state|fork|join|choice|branch|merge|checkout|commit|cherry-pick|type|id|tag)\\b',
          name: 'keyword.control.mermaid'
        },
        // 文字列
        {
          match: '"[^"]*"',
          name: 'string.quoted.double.mermaid'
        },
        // 数値
        {
          match: '\\b\\d+\\.?\\d*\\b',
          name: 'constant.numeric.mermaid'
        },
        // 矢印・リレーション
        {
          match: '(?:--?>|<--?|--[>ox]|[<ox]--|==>|<==|-->|<-->|\\.->|\\.-|-->|-\\.->?|-\\.-|<\\|--|--\\|>|\\*--|--\\*|o--|--o|\\|\\||o\\{|\\}o|o\\||\\|o)',
          name: 'keyword.operator.mermaid'
        },
        // ブラケット類
        {
          match: '[\\[\\]{}()\\|]',
          name: 'punctuation.mermaid'
        },
        // コロン・セミコロン
        {
          match: '[:;]',
          name: 'keyword.operator.mermaid'
        }
      ]
    }
  }
}