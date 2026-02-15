# Mermaid サンプル集

::: info

このファイルのコンテンツはClaude Code Opus 4.6に作成してもらったものです。

なお、作成依頼時のプロンプトは以下になります。

```
「Mermaid」のサンプルをまとめたMarkdownファイルを作成してください。
Mermaidにする内容については、特に意味がなくて問題ありません。
```
:::

## 1. フローチャート (Flowchart)

```mermaid
flowchart TD
    A[朝起きる] --> B{天気は?}
    B -->|晴れ| C[散歩に行く]
    B -->|雨| D[家で読書]
    C --> E[カフェに寄る]
    D --> E
    E --> F[昼ごはんを食べる]
```

---

## 2. シーケンス図 (Sequence Diagram)

```mermaid
sequenceDiagram
    participant 客 as お客さん
    participant 店 as 店員
    participant 厨 as キッチン

    客->>店: ラーメンください
    店->>厨: ラーメン1丁!
    厨-->>店: できました
    店-->>客: お待たせしました
    客->>店: 替え玉お願いします
    店->>厨: 替え玉!
    厨-->>店: どうぞ
    店-->>客: 替え玉です
```

---

## 3. クラス図 (Class Diagram)

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +speak() String
    }
    class Dog {
        +String breed
        +fetch()
    }
    class Cat {
        +bool isIndoor
        +purr()
    }
    class Owner {
        +String name
        +adopt(Animal)
    }

    Animal <|-- Dog
    Animal <|-- Cat
    Owner "1" --> "*" Animal : owns
```

---

## 4. 状態遷移図 (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> 待機中
    待機中 --> 調理中 : 注文受付
    調理中 --> 完成 : 調理完了
    完成 --> 配達中 : 配達開始
    配達中 --> 届済 : 配達完了
    届済 --> [*]
    調理中 --> キャンセル : キャンセル依頼
    キャンセル --> [*]
```

---

## 5. ER図 (Entity Relationship Diagram)

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "is in"
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date order_date
        int customer_id FK
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
    }
    PRODUCT {
        int id PK
        string name
        float price
    }
```

---

## 6. ガントチャート (Gantt Chart)

```mermaid
gantt
    title 夏休みの宿題スケジュール
    dateFormat  YYYY-MM-DD
    section 国語
        読書感想文     :a1, 2025-07-21, 5d
        漢字ドリル     :a2, after a1, 3d
    section 算数
        計算ドリル     :b1, 2025-07-21, 4d
        自由研究まとめ :b2, 2025-07-28, 7d
    section 理科
        観察日記       :c1, 2025-07-21, 30d
    section 美術
        絵画           :d1, 2025-08-01, 5d
```

---

## 7. 円グラフ (Pie Chart)

```mermaid
pie title 好きな果物アンケート
    "りんご" : 35
    "みかん" : 25
    "バナナ" : 20
    "ぶどう" : 12
    "いちご" : 8
```

---

## 8. Git グラフ (Git Graph)

```mermaid
gitGraph
    commit id: "init"
    commit id: "add README"
    branch feature/login
    checkout feature/login
    commit id: "login UI"
    commit id: "auth logic"
    checkout main
    branch feature/dashboard
    commit id: "dashboard layout"
    checkout main
    merge feature/login id: "merge login"
    merge feature/dashboard id: "merge dashboard"
    commit id: "v1.0 release"
```

---

## 9. マインドマップ (Mindmap)

```mermaid
mindmap
  root((旅行計画))
    行き先
      国内
        京都
        沖縄
      海外
        台湾
        ベトナム
    予算
      交通費
      宿泊費
      食費
    持ち物
      パスポート
      カメラ
      モバイルバッテリー
```

---

## 10. タイムライン (Timeline)

```mermaid
timeline
    title インターネットの歴史（ざっくり）
    1969 : ARPANET 誕生
    1983 : TCP/IP 標準化
    1991 : World Wide Web 公開
    1998 : Google 設立
    2004 : Facebook 登場
    2007 : iPhone 発売
    2010 : Instagram 登場
    2022 : ChatGPT 公開
```

---

## 11. カスタマージャーニー (User Journey)

```mermaid
journey
    title コーヒーを買う体験
    section 店に向かう
      家を出る: 3: 自分
      電車に乗る: 2: 自分
      駅から歩く: 3: 自分
    section 注文する
      メニューを見る: 4: 自分
      注文する: 5: 自分, 店員
      待つ: 2: 自分
    section 受け取る
      コーヒーを受け取る: 5: 自分, 店員
      一口飲む: 5: 自分
```

---

## 12. 要件図 (Requirement Diagram)

```mermaid
requirementDiagram
    requirement high_availability {
        id: "REQ-001"
        text: "システムは99.9%の可用性を維持すること"
        risk: high
        verifymethod: test
    }
    requirement response_time {
        id: "REQ-002"
        text: "APIレスポンスは200ms以内であること"
        risk: medium
        verifymethod: test
    }
    element backend_service {
        type: service
    }
    element load_balancer {
        type: infrastructure
    }

    backend_service - satisfies -> high_availability
    backend_service - satisfies -> response_time
    load_balancer - satisfies -> high_availability
```
