# 実験場


## 独自コンポーネント使用


### タイトルなし

```mermaid
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
```

* 横方向 + コードの開始行番号を8行目にしたバージョン

    ```mermaid (start:8)
    graph LR
        A --> B
        C --> D
        B --> E
        D --> E
    ```


### タイトルあり

```mermaid (title:"これは図の外のタイトルです")
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
```


## AIに作成してもらったMermaidサンプル集

### Claude Code Opus 4.6に作成してもらったサンプル

::: code-group
```mermaid [縦向き] {title='フローチャートサンプル'}
flowchart TD
    A[開始] --> B{条件チェック}
    B -->|Yes| C[処理A実行]
    B -->|No| D[処理B実行]
    C --> E{結果判定}
    D --> F[ログ出力]
    F --> G[リトライ準備]
    G --> B
    E -->|成功| H[データ保存]
    E -->|失敗| I[エラーハンドリング]
    H --> J[通知送信]
    I --> K{再試行可能?}
    K -->|Yes| C
    K -->|No| L[アラート発報]
    J --> M[レポート生成]
    L --> M
    M --> N{追加処理あり?}
    N -->|Yes| O[後続バッチ起動]
    N -->|No| P[終了]
    O --> P
```
```mermaid [横向き] {title='フローチャートサンプル'}
flowchart LR
    A[開始] --> B{条件チェック}
    B -->|Yes| C[処理A実行]
    B -->|No| D[処理B実行]
    C --> E{結果判定}
    D --> F[ログ出力]
    F --> G[リトライ準備]
    G --> B
    E -->|成功| H[データ保存]
    E -->|失敗| I[エラーハンドリング]
    H --> J[通知送信]
    I --> K{再試行可能?}
    K -->|Yes| C
    K -->|No| L[アラート発報]
    J --> M[レポート生成]
    L --> M
    M --> N{追加処理あり?}
    N -->|Yes| O[後続バッチ起動]
    N -->|No| P[終了]
    O --> P
```
:::
## Deatilsでの使用

::: details 独自コンポーネント使用

```mermaid
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F    
```

:::

## Error

### 空

```mermaid
```

