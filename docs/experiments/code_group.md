## コードグループのチェック


::: code-group
```mermaid
graph TD
    A --> B
    C --> D
    B --> E
```
```mermaid [独自コンポーネント使用]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```
```mermaid bypass [バイパス]
graph TD
    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
```
:::