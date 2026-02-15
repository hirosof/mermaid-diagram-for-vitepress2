# Mermaid サンプル集B（大規模版）


::: info

このファイルのコンテンツはClaude Code Opus 4.6に作成してもらったものです。

なお、作成依頼時のプロンプトは以下になります。
(サンプル集Aの後に続けて依頼)

```
少し規模が大きいバージョンの作成をお願いします。
なお、表示文字列についてはダブルクォーテーションで囲ってください。
```
:::

---

## 1. フローチャート (Flowchart)

```mermaid
flowchart TD
    A["ユーザーがサイトにアクセス"] --> B{"アカウントを持っている?"}
    B -->|"はい"| C["ログイン画面を表示"]
    B -->|"いいえ"| D["新規登録画面を表示"]

    C --> E{"認証方式の選択"}
    E -->|"メール+パスワード"| F["メールとパスワードを入力"]
    E -->|"SNSログイン"| G{"SNSプロバイダ選択"}
    E -->|"生体認証"| H["指紋 / 顔認証"]

    G -->|"Google"| G1["Google OAuth"]
    G -->|"GitHub"| G2["GitHub OAuth"]
    G -->|"Apple"| G3["Apple Sign In"]
    G1 --> I["OAuthコールバック処理"]
    G2 --> I
    G3 --> I

    F --> J{"認証成功?"}
    H --> J
    I --> J

    J -->|"成功"| K["セッション生成"]
    J -->|"失敗"| L{"試行回数チェック"}
    L -->|"3回未満"| M["エラーメッセージ表示"] --> C
    L -->|"3回以上"| N["アカウントロック"] --> O["ロック解除メール送信"]

    D --> P["登録フォーム入力"]
    P --> Q["メール確認リンク送信"]
    Q --> R{"メール確認済み?"}
    R -->|"はい"| S["初期プロフィール設定"]
    R -->|"いいえ"| T["リマインダー送信"] --> R

    S --> K
    K --> U["ダッシュボードを表示"]
    U --> V{"操作選択"}
    V -->|"プロフィール編集"| W["プロフィール画面"]
    V -->|"設定変更"| X["設定画面"]
    V -->|"コンテンツ閲覧"| Y["コンテンツ一覧"]
    V -->|"ログアウト"| Z["セッション破棄"] --> A

    W --> U
    X --> U
    Y --> AA{"コンテンツ操作"}
    AA -->|"閲覧"| AB["詳細表示"]
    AA -->|"お気に入り登録"| AC["お気に入りリストに追加"]
    AA -->|"シェア"| AD["共有リンク生成"]
    AB --> U
    AC --> U
    AD --> U
```

---

## 2. シーケンス図 (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as "ユーザー"
    participant FE as "フロントエンド"
    participant GW as "APIゲートウェイ"
    participant Auth as "認証サービス"
    participant US as "ユーザーサービス"
    participant OS as "注文サービス"
    participant PS as "決済サービス"
    participant INV as "在庫サービス"
    participant NF as "通知サービス"
    participant DB as "データベース"
    participant MQ as "メッセージキュー"

    U->>FE: "商品をカートに追加"
    FE->>GW: "POST /cart/items"
    GW->>Auth: "トークン検証"
    Auth-->>GW: "検証OK"
    GW->>INV: "在庫確認リクエスト"
    INV->>DB: "SELECT stock FROM products"
    DB-->>INV: "在庫数: 15"
    INV-->>GW: "在庫あり"
    GW->>OS: "カートに商品追加"
    OS->>DB: "INSERT INTO cart_items"
    DB-->>OS: "追加完了"
    OS-->>GW: "カート更新完了"
    GW-->>FE: "200 OK（カート情報）"
    FE-->>U: "カートに追加しました"

    U->>FE: "注文確定ボタンを押す"
    FE->>GW: "POST /orders"
    GW->>Auth: "トークン検証"
    Auth-->>GW: "検証OK"
    GW->>OS: "注文作成リクエスト"
    OS->>DB: "BEGIN TRANSACTION"

    OS->>INV: "在庫引き当て"
    INV->>DB: "UPDATE products SET stock = stock - 1"
    DB-->>INV: "更新完了"
    INV-->>OS: "引き当て成功"

    OS->>PS: "決済リクエスト"
    PS->>PS: "与信チェック"
    PS-->>OS: "決済承認"

    OS->>DB: "INSERT INTO orders"
    DB-->>OS: "注文レコード作成完了"
    OS->>DB: "COMMIT"

    OS->>MQ: "注文確定イベント発行"
    MQ->>NF: "注文確定イベント受信"
    NF->>NF: "メール本文生成"
    NF->>U: "注文確認メール送信"

    MQ->>INV: "在庫更新イベント受信"
    INV->>INV: "在庫レポート更新"

    OS-->>GW: "注文作成完了"
    GW-->>FE: "200 OK（注文詳細）"
    FE-->>U: "ご注文ありがとうございます"

    Note over U,DB: "--- 30分後：出荷処理 ---"

    OS->>MQ: "出荷開始イベント発行"
    MQ->>NF: "出荷開始イベント受信"
    NF->>U: "出荷通知メール送信"
```

---

## 3. クラス図 (Class Diagram)

```mermaid
classDiagram
    class Application {
        -Router router
        -Config config
        +start() void
        +stop() void
        +getStatus() String
    }

    class Router {
        -List~Route~ routes
        -MiddlewareChain middlewares
        +addRoute(Route) void
        +removeRoute(String) void
        +match(Request) Route
        +use(Middleware) void
    }

    class Route {
        +String path
        +String method
        +Handler handler
        +List~Middleware~ middlewares
        +matches(Request) bool
    }

    class Middleware {
        <<interface>>
        +handle(Request, Response, Next) void
    }

    class AuthMiddleware {
        -TokenService tokenService
        +handle(Request, Response, Next) void
        -validateToken(String) bool
    }

    class LoggingMiddleware {
        -Logger logger
        +handle(Request, Response, Next) void
        -formatLog(Request, Response) String
    }

    class RateLimitMiddleware {
        -int maxRequests
        -int windowMs
        -Map~String,int~ counters
        +handle(Request, Response, Next) void
        -isLimitExceeded(String) bool
    }

    class CORSMiddleware {
        -List~String~ allowedOrigins
        -List~String~ allowedMethods
        +handle(Request, Response, Next) void
    }

    class Controller {
        <<abstract>>
        #Service service
        +handleRequest(Request) Response
    }

    class UserController {
        +getUser(Request) Response
        +createUser(Request) Response
        +updateUser(Request) Response
        +deleteUser(Request) Response
        +listUsers(Request) Response
    }

    class OrderController {
        +getOrder(Request) Response
        +createOrder(Request) Response
        +cancelOrder(Request) Response
        +listOrders(Request) Response
    }

    class Service {
        <<abstract>>
        #Repository repository
        #Logger logger
    }

    class UserService {
        -PasswordHasher hasher
        +findById(int) User
        +create(UserDTO) User
        +update(int, UserDTO) User
        +delete(int) void
        +authenticate(String, String) Token
    }

    class OrderService {
        -PaymentGateway paymentGateway
        -InventoryService inventoryService
        +findById(int) Order
        +create(OrderDTO) Order
        +cancel(int) void
        +calculateTotal(Order) Decimal
    }

    class Repository {
        <<interface>>
        +findById(int) Entity
        +findAll() List~Entity~
        +save(Entity) Entity
        +delete(int) void
    }

    class UserRepository {
        +findByEmail(String) User
        +findByRole(String) List~User~
    }

    class OrderRepository {
        +findByUserId(int) List~Order~
        +findByStatus(String) List~Order~
        +findByDateRange(Date, Date) List~Order~
    }

    class Database {
        -ConnectionPool pool
        +query(String) ResultSet
        +transaction(Callback) void
        +getConnection() Connection
        +releaseConnection(Connection) void
    }

    Application --> Router
    Router --> Route
    Route --> Middleware
    Middleware <|.. AuthMiddleware
    Middleware <|.. LoggingMiddleware
    Middleware <|.. RateLimitMiddleware
    Middleware <|.. CORSMiddleware
    Controller <|-- UserController
    Controller <|-- OrderController
    Service <|-- UserService
    Service <|-- OrderService
    Controller --> Service
    Service --> Repository
    Repository <|.. UserRepository
    Repository <|.. OrderRepository
    UserRepository --> Database
    OrderRepository --> Database
    UserController --> UserService
    OrderController --> OrderService
```

---

## 4. 状態遷移図 (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> 下書き

    下書き --> レビュー待ち : 著者が提出
    レビュー待ち --> レビュー中 : レビュアーが着手

    state レビュー中 {
        [*] --> コード確認
        コード確認 --> テスト確認 : コードOK
        コード確認 --> 指摘あり : 問題発見
        テスト確認 --> ドキュメント確認 : テストOK
        テスト確認 --> 指摘あり : テスト不足
        ドキュメント確認 --> 承認準備 : ドキュメントOK
        ドキュメント確認 --> 指摘あり : ドキュメント不備
        指摘あり --> [*]
        承認準備 --> [*]
    }

    レビュー中 --> 修正中 : 修正依頼
    修正中 --> レビュー待ち : 修正完了・再提出
    修正中 --> 取り下げ : 著者が取り下げ

    レビュー中 --> 承認済み : 全員が承認
    承認済み --> マージ待ち : CI/CDパイプライン通過
    承認済み --> CI失敗 : CI/CDパイプライン失敗
    CI失敗 --> 修正中 : 修正対応

    マージ待ち --> マージ済み : メインブランチにマージ
    マージ待ち --> コンフリクト : コンフリクト検出
    コンフリクト --> 修正中 : コンフリクト解消

    マージ済み --> デプロイ待ち : デプロイキューに追加
    デプロイ待ち --> デプロイ中 : デプロイ開始
    デプロイ中 --> デプロイ完了 : デプロイ成功
    デプロイ中 --> ロールバック : デプロイ失敗
    ロールバック --> 修正中 : 再修正

    デプロイ完了 --> [*]
    取り下げ --> [*]
```

---

## 5. ER図 (Entity Relationship Diagram)

```mermaid
erDiagram
    COMPANY ||--o{ DEPARTMENT : "has"
    DEPARTMENT ||--o{ TEAM : "contains"
    TEAM ||--o{ EMPLOYEE : "belongs to"
    DEPARTMENT ||--|| EMPLOYEE : "managed by"
    EMPLOYEE ||--o{ PROJECT_ASSIGNMENT : "assigned to"
    PROJECT ||--o{ PROJECT_ASSIGNMENT : "includes"
    PROJECT ||--o{ MILESTONE : "has"
    MILESTONE ||--o{ TASK : "contains"
    TASK ||--o{ TASK_COMMENT : "has"
    EMPLOYEE ||--o{ TASK : "responsible for"
    EMPLOYEE ||--o{ TASK_COMMENT : "writes"
    EMPLOYEE ||--o{ TIMESHEET : "submits"
    TASK ||--o{ TIMESHEET : "tracked in"
    PROJECT ||--o{ BUDGET : "has"
    CLIENT ||--o{ PROJECT : "commissions"
    EMPLOYEE ||--o{ SKILL_SET : "has"
    SKILL ||--o{ SKILL_SET : "included in"
    EMPLOYEE ||--o{ LEAVE_REQUEST : "submits"

    COMPANY {
        int id PK
        string name
        string industry
        string address
        date founded_at
    }

    DEPARTMENT {
        int id PK
        int company_id FK
        int manager_id FK
        string name
        string description
        int budget_annual
    }

    TEAM {
        int id PK
        int department_id FK
        string name
        string focus_area
    }

    EMPLOYEE {
        int id PK
        int team_id FK
        string first_name
        string last_name
        string email
        string position
        string grade
        date hire_date
        decimal salary
        bool is_active
    }

    CLIENT {
        int id PK
        string company_name
        string contact_person
        string email
        string phone
        string contract_type
    }

    PROJECT {
        int id PK
        int client_id FK
        string name
        string description
        string status
        date start_date
        date end_date
        decimal estimated_cost
    }

    PROJECT_ASSIGNMENT {
        int id PK
        int employee_id FK
        int project_id FK
        string role
        decimal allocation_percent
        date assigned_date
    }

    MILESTONE {
        int id PK
        int project_id FK
        string title
        string description
        date due_date
        string status
    }

    TASK {
        int id PK
        int milestone_id FK
        int assignee_id FK
        string title
        string description
        string priority
        string status
        int estimated_hours
        date due_date
    }

    TASK_COMMENT {
        int id PK
        int task_id FK
        int author_id FK
        text content
        datetime created_at
    }

    TIMESHEET {
        int id PK
        int employee_id FK
        int task_id FK
        date work_date
        decimal hours_worked
        string description
    }

    BUDGET {
        int id PK
        int project_id FK
        string category
        decimal planned_amount
        decimal actual_amount
        string fiscal_quarter
    }

    SKILL {
        int id PK
        string name
        string category
    }

    SKILL_SET {
        int id PK
        int employee_id FK
        int skill_id FK
        string proficiency_level
        date acquired_date
    }

    LEAVE_REQUEST {
        int id PK
        int employee_id FK
        string leave_type
        date start_date
        date end_date
        string status
        string reason
    }
```

---

## 6. ガントチャート (Gantt Chart)

```mermaid
gantt
    title "Webアプリケーション開発プロジェクト"
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section "企画・要件定義"
        "市場調査"                         :done, plan1, 2025-04-01, 10d
        "ユーザーインタビュー"              :done, plan2, 2025-04-05, 7d
        "要件定義書作成"                   :done, plan3, after plan2, 10d
        "ステークホルダーレビュー"          :done, plan4, after plan3, 5d

    section "設計"
        "システムアーキテクチャ設計"        :done, des1, after plan4, 8d
        "DB設計"                           :done, des2, after plan4, 7d
        "API設計"                          :done, des3, after des1, 6d
        "UIワイヤーフレーム"               :done, des4, after plan4, 10d
        "UIデザインカンプ"                 :active, des5, after des4, 12d
        "デザインレビュー"                 :des6, after des5, 3d

    section "フロントエンド開発"
        "プロジェクト初期セットアップ"      :active, fe1, after des3, 3d
        "共通コンポーネント開発"            :fe2, after fe1, 12d
        "認証機能（ログイン・登録）"        :fe3, after fe2, 8d
        "ダッシュボード画面"               :fe4, after fe2, 10d
        "ユーザー管理画面"                 :fe5, after fe3, 7d
        "注文管理画面"                     :fe6, after fe4, 10d
        "レポート・分析画面"               :fe7, after fe5, 8d
        "レスポンシブ対応"                 :fe8, after fe6, 5d
        "アクセシビリティ対応"             :fe9, after fe8, 5d

    section "バックエンド開発"
        "プロジェクト初期セットアップ"      :active, be1, after des3, 3d
        "認証・認可API"                    :be2, after be1, 10d
        "ユーザー管理API"                  :be3, after be2, 7d
        "注文管理API"                      :be4, after be2, 10d
        "決済連携"                         :be5, after be4, 8d
        "通知サービス（メール・Push）"     :be6, after be3, 7d
        "バッチ処理・ジョブ管理"           :be7, after be5, 6d
        "管理者向けAPI"                    :be8, after be6, 5d

    section "インフラ・DevOps"
        "クラウド環境構築"                 :infra1, after des1, 5d
        "CI/CDパイプライン構築"            :infra2, after infra1, 7d
        "監視・アラート設定"               :infra3, after infra2, 5d
        "ステージング環境構築"             :infra4, after infra2, 3d
        "本番環境構築"                     :infra5, after infra4, 5d
        "セキュリティ設定・WAF"            :infra6, after infra5, 4d

    section "テスト"
        "テスト計画書作成"                 :test1, after des6, 5d
        "単体テスト"                       :test2, after be7, 10d
        "結合テスト"                       :test3, after test2, 10d
        "E2Eテスト"                        :test4, after test3, 8d
        "パフォーマンステスト"             :test5, after test3, 5d
        "セキュリティテスト"               :test6, after test4, 5d
        "UAT（ユーザー受入テスト）"        :test7, after test6, 7d

    section "リリース"
        "リリース判定会議"                 :rel1, after test7, 1d
        "本番デプロイ"                     :rel2, after rel1, 2d
        "リリース後モニタリング"           :rel3, after rel2, 7d
        "振り返り・KPTミーティング"        :rel4, after rel3, 1d
```

---

## 7. 円グラフ (Pie Chart)

```mermaid
pie title "2024年度 部門別 IT予算配分"
    "インフラ・クラウド" : 28
    "アプリケーション開発" : 24
    "セキュリティ" : 16
    "データ分析・AI/ML" : 14
    "保守・運用" : 10
    "教育・研修" : 5
    "予備費" : 3
```

---

## 8. Git グラフ (Git Graph)

```mermaid
gitGraph
    commit id: "initial commit"
    commit id: "add project structure"
    commit id: "add CI config"

    branch develop
    checkout develop
    commit id: "setup dev environment"
    commit id: "add linter config"

    branch feature/auth
    checkout feature/auth
    commit id: "add login page"
    commit id: "add JWT auth"
    commit id: "add password reset"
    commit id: "add OAuth integration"

    checkout develop
    branch feature/dashboard
    checkout feature/dashboard
    commit id: "add dashboard layout"
    commit id: "add chart components"
    commit id: "add data fetching"

    checkout develop
    merge feature/auth id: "merge auth feature"

    branch feature/orders
    checkout feature/orders
    commit id: "add order model"
    commit id: "add order API"
    commit id: "add order UI"
    commit id: "add order validation"

    checkout develop
    merge feature/dashboard id: "merge dashboard feature"
    merge feature/orders id: "merge orders feature"

    commit id: "integration fixes"
    commit id: "update dependencies"

    branch release/1.0
    checkout release/1.0
    commit id: "bump version to 1.0.0"
    commit id: "update changelog"
    commit id: "fix release bug #42"

    checkout main
    merge release/1.0 id: "release v1.0.0" tag: "v1.0.0"

    checkout develop
    merge release/1.0 id: "merge release back"

    branch hotfix/1.0.1
    checkout hotfix/1.0.1
    commit id: "fix critical security issue"

    checkout main
    merge hotfix/1.0.1 id: "hotfix v1.0.1" tag: "v1.0.1"

    checkout develop
    merge hotfix/1.0.1 id: "merge hotfix back"
    commit id: "continue development"
```

---

## 9. マインドマップ (Mindmap)

```mermaid
mindmap
  root("ソフトウェアエンジニアのスキルマップ")
    ("プログラミング言語")
      ("静的型付け")
        ("TypeScript")
        ("Java")
        ("Go")
        ("Rust")
      ("動的型付け")
        ("Python")
        ("Ruby")
        ("JavaScript")
      ("関数型")
        ("Haskell")
        ("Elixir")
        ("Scala")
    ("フロントエンド")
      ("フレームワーク")
        ("React")
        ("Vue.js")
        ("Angular")
        ("Svelte")
      ("スタイリング")
        ("CSS / Sass")
        ("Tailwind CSS")
        ("CSS-in-JS")
      ("状態管理")
        ("Redux")
        ("Zustand")
        ("Jotai")
      ("テスト")
        ("Jest")
        ("Playwright")
        ("Storybook")
    ("バックエンド")
      ("フレームワーク")
        ("Express / Fastify")
        ("Spring Boot")
        ("Django / FastAPI")
        ("Gin / Echo")
      ("認証・認可")
        ("OAuth 2.0")
        ("JWT")
        ("SAML")
      ("メッセージング")
        ("Kafka")
        ("RabbitMQ")
        ("SQS / SNS")
    ("データベース")
      ("RDB")
        ("PostgreSQL")
        ("MySQL")
      ("NoSQL")
        ("MongoDB")
        ("DynamoDB")
        ("Redis")
      ("検索エンジン")
        ("Elasticsearch")
        ("OpenSearch")
    ("インフラ・DevOps")
      ("クラウド")
        ("AWS")
        ("GCP")
        ("Azure")
      ("コンテナ")
        ("Docker")
        ("Kubernetes")
      ("IaC")
        ("Terraform")
        ("Pulumi")
        ("CloudFormation")
      ("CI/CD")
        ("GitHub Actions")
        ("GitLab CI")
        ("Jenkins")
    ("ソフトスキル")
      ("コミュニケーション")
      ("チームマネジメント")
      ("プロジェクト管理")
      ("技術文書作成")
```

---

## 10. タイムライン (Timeline)

```mermaid
timeline
    title "Webフレームワークの歴史"

    section "黎明期（1990年代）"
        1993 : "CGI（Common Gateway Interface）登場"
        1995 : "PHP 初版リリース"
             : "Java Servlet 仕様策定"
        1996 : "ASP（Active Server Pages）登場"
        1998 : "JSP（JavaServer Pages）リリース"

    section "フレームワーク時代（2000年代）"
        2002 : "Spring Framework 登場"
        2004 : "Ruby on Rails 公開"
             : "Django プロジェクト開始"
        2005 : "Django 初版リリース"
             : "Rails 1.0 リリース"
        2006 : "jQuery 登場・DOM操作革命"
        2009 : "Node.js 登場・サーバサイドJS"
             : "AngularJS 開発開始"

    section "モダンフロントエンド（2010年代）"
        2010 : "Express.js リリース"
             : "Backbone.js 登場"
        2013 : "React 公開（Facebook）"
        2014 : "Vue.js 公開"
        2015 : "GraphQL 公開"
             : "ES2015（ES6）標準化"
        2016 : "Angular 2 リリース（完全刷新）"
             : "Next.js 登場"
             : "Create React App リリース"
        2017 : "TypeScript 急速に普及"
        2019 : "Svelte 3 リリース"
             : "Deno 発表"

    section "次世代へ（2020年代）"
        2020 : "Next.js 10 / ISR 登場"
             : "Tailwind CSS 2.0"
        2021 : "Remix 公開"
             : "Astro 登場"
        2022 : "React 18（Concurrent）"
             : "Bun 1.0 目前"
        2023 : "React Server Components 本格化"
             : "Astro 3.0 リリース"
        2024 : "AI統合型フレームワーク台頭"
```

---

## 11. カスタマージャーニー (User Journey)

```mermaid
journey
    title "SaaSプロダクトのオンボーディング体験"

    section "認知・興味"
        "広告を目にする" : 3 : "見込み客"
        "ブログ記事を読む" : 4 : "見込み客"
        "比較サイトで評価を見る" : 3 : "見込み客"
        "無料トライアルに登録" : 4 : "見込み客"

    section "初期セットアップ"
        "確認メールを受信" : 3 : "新規ユーザー"
        "アカウント作成完了" : 4 : "新規ユーザー"
        "チュートリアル開始" : 3 : "新規ユーザー", "CS担当"
        "初期データをインポート" : 2 : "新規ユーザー"
        "チーム招待メール送信" : 3 : "新規ユーザー"

    section "価値体験"
        "最初のプロジェクト作成" : 4 : "ユーザー"
        "ダッシュボードを確認" : 5 : "ユーザー"
        "自動レポート受信" : 5 : "ユーザー", "CS担当"
        "チームでコラボレーション" : 4 : "ユーザー", "チームメンバー"

    section "定着・拡大"
        "有料プランにアップグレード" : 4 : "ユーザー", "営業担当"
        "API連携を設定" : 3 : "ユーザー", "開発者"
        "カスタムワークフロー構築" : 5 : "ユーザー"
        "社内展開を推進" : 4 : "ユーザー", "CS担当", "営業担当"

    section "サポート・継続"
        "問い合わせチケット起票" : 2 : "ユーザー"
        "サポートから回答受信" : 4 : "ユーザー", "サポート担当"
        "四半期レビューMTG" : 5 : "ユーザー", "CS担当"
        "契約更新" : 4 : "ユーザー", "営業担当"
```

---

## 12. 要件図 (Requirement Diagram)

```mermaid
requirementDiagram

    requirement "高可用性" {
        id: "REQ-001"
        text: "システム全体で99.95%以上の可用性を維持すること"
        risk: high
        verifymethod: test
    }

    requirement "レスポンス性能" {
        id: "REQ-002"
        text: "API応答時間はP95で200ms以内であること"
        risk: high
        verifymethod: test
    }

    requirement "スケーラビリティ" {
        id: "REQ-003"
        text: "同時接続10万ユーザーに対応可能であること"
        risk: high
        verifymethod: analysis
    }

    requirement "データ暗号化" {
        id: "REQ-004"
        text: "保存データおよび通信データをAES-256で暗号化すること"
        risk: medium
        verifymethod: inspection
    }

    requirement "監査ログ" {
        id: "REQ-005"
        text: "全ての管理操作を監査ログに記録し1年間保持すること"
        risk: medium
        verifymethod: test
    }

    requirement "自動バックアップ" {
        id: "REQ-006"
        text: "データベースを日次で自動バックアップし30日間保持すること"
        risk: medium
        verifymethod: test
    }

    requirement "アクセス制御" {
        id: "REQ-007"
        text: "RBAC（ロールベースアクセス制御）を実装すること"
        risk: medium
        verifymethod: test
    }

    requirement "多言語対応" {
        id: "REQ-008"
        text: "日本語・英語・中国語に対応すること"
        risk: low
        verifymethod: demonstration
    }

    element "ロードバランサー" {
        type: "infrastructure"
    }

    element "APIサーバー群" {
        type: "service"
    }

    element "データベースクラスター" {
        type: "infrastructure"
    }

    element "認証サービス" {
        type: "service"
    }

    element "暗号化モジュール" {
        type: "module"
    }

    element "ログ収集基盤" {
        type: "infrastructure"
    }

    element "i18nライブラリ" {
        type: "module"
    }

    element "バックアップジョブ" {
        type: "service"
    }

    "ロードバランサー" - satisfies -> "高可用性"
    "ロードバランサー" - satisfies -> "スケーラビリティ"
    "APIサーバー群" - satisfies -> "レスポンス性能"
    "APIサーバー群" - satisfies -> "スケーラビリティ"
    "APIサーバー群" - satisfies -> "高可用性"
    "データベースクラスター" - satisfies -> "高可用性"
    "認証サービス" - satisfies -> "アクセス制御"
    "暗号化モジュール" - satisfies -> "データ暗号化"
    "ログ収集基盤" - satisfies -> "監査ログ"
    "i18nライブラリ" - satisfies -> "多言語対応"
    "バックアップジョブ" - satisfies -> "自動バックアップ"
```
