# バイパスモード

## 基本

### デフォルト
```mermaid bypass
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

### 行番号を10から始める

```mermaid bypass [start:10]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

## ハイライト

### 1行目をハイライトする

```mermaid bypass [highlight:"1"]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

### 表示上の行番号を10から始め、3行目の行をハイライトする

```mermaid bypass [start:10,highlight:"3"]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

### 3行目と5行目をハイライトする

```mermaid bypass [highlight:"3,5"]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

### 3行目～5行目をハイライトする

```mermaid bypass [highlight:"3-5"]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

### 1行目と3行目～5行目をハイライトする

```mermaid bypass [highlight:"1,3-5"]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```

## Deatilsでの使用


::: details バイパス

```mermaid bypass
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F    
```

:::