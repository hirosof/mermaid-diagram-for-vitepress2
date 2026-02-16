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

### 多数項目

```mermaid {title="図の方向：上 → 下"}
graph TD
    %% ルート
    Root[ルート]

    %% ルート直下
    Item1["アイテム1"]
    Item2["アイテム2"]
    Item3["アイテム3"]
    Item4["アイテム4"]
    Root --> Item1   
    Root --> Item2   
    Root --> Item3   
    Root --> Item4   

    %% Item1直下
    Item5["アイテム5"]
    Item1 --> Item5

    %% Item2直下
    Item6["アイテム6"]
    Item7["アイテム7"]
    Item2 --> Item6
    Item2 --> Item7

    %% Item3直下
    Item8["アイテム8"]
    Item9["アイテム9"]
    Item10["アイテム10"]
    Item3 --> Item8
    Item3 --> Item9
    Item3 --> Item10

    %% Item4直下
    Item11["アイテム11"]
    Item12["アイテム12"]
    Item13["アイテム13"]
    Item14["アイテム14"]
    Item4 --> Item11
    Item4 --> Item12
    Item4 --> Item13
    Item4 --> Item14

    %% Item6 と Item7の合流
    Item15["アイテム15"]
    Item6 --> Item15
    Item7 --> Item15

    %% Item8 と Item9とItem10の合流
    Item16["アイテム16"]

    Item8 --> Item16
    Item9 --> Item16
    Item10 --> Item16

    %% Item11とItem12の合流
    Item17["アイテム17"]
    Item11 --> Item17
    Item12 --> Item17
    
    %% Item13とItem14の合流
    Item18["アイテム18"]
    Item13 --> Item18
    Item14 --> Item18

    %% Item5とItem15の合流
    Item19["アイテム19"]
    Item5 --> Item19
    Item15 --> Item19

    %% Item16とItem19の合流
    Item20["アイテム20"]
    Item19 --> Item20
    Item16 --> Item20
    
    %% Item17とItem18の合流
    Item21["アイテム21"]
    Item17 --> Item21
    Item18 --> Item21

    %% Terminalへ接続
    Terminal[終端]
    Item20 --> Terminal
    Item21 --> Terminal
```

```mermaid {title="図の方向：左 → 右"}
graph LR
    %% ルート
    Root[ルート]

    %% ルート直下
    Item1["アイテム1"]
    Item2["アイテム2"]
    Item3["アイテム3"]
    Item4["アイテム4"]
    Root --> Item1   
    Root --> Item2   
    Root --> Item3   
    Root --> Item4   

    %% Item1直下
    Item5["アイテム5"]
    Item1 --> Item5

    %% Item2直下
    Item6["アイテム6"]
    Item7["アイテム7"]
    Item2 --> Item6
    Item2 --> Item7

    %% Item3直下
    Item8["アイテム8"]
    Item9["アイテム9"]
    Item10["アイテム10"]
    Item3 --> Item8
    Item3 --> Item9
    Item3 --> Item10

    %% Item4直下
    Item11["アイテム11"]
    Item12["アイテム12"]
    Item13["アイテム13"]
    Item14["アイテム14"]
    Item4 --> Item11
    Item4 --> Item12
    Item4 --> Item13
    Item4 --> Item14

    %% Item6 と Item7の合流
    Item15["アイテム15"]
    Item6 --> Item15
    Item7 --> Item15

    %% Item8 と Item9とItem10の合流
    Item16["アイテム16"]

    Item8 --> Item16
    Item9 --> Item16
    Item10 --> Item16

    %% Item11とItem12の合流
    Item17["アイテム17"]
    Item11 --> Item17
    Item12 --> Item17
    
    %% Item13とItem14の合流
    Item18["アイテム18"]
    Item13 --> Item18
    Item14 --> Item18

    %% Item5とItem15の合流
    Item19["アイテム19"]
    Item5 --> Item19
    Item15 --> Item19

    %% Item16とItem19の合流
    Item20["アイテム20"]
    Item19 --> Item20
    Item16 --> Item20
    
    %% Item17とItem18の合流
    Item21["アイテム21"]
    Item17 --> Item21
    Item18 --> Item21

    %% Terminalへ接続
    Terminal[終端]
    Item20 --> Terminal
    Item21 --> Terminal
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
