# Change Log

## v1.3.6   2024-01-12
- 添加循环检测输入法的功能，开启后可支持使用 VSCode 快捷键之外的方式切换输入法 

## v1.3.1   2023-10-16
- 将插件设置为仅在本地运行以支持在 remote / SSH / WSL / docker 情形下使用

## v1.3.0   2023-10-12
- 导出 api 给其他插件：
 ```
getChineseIM(): string // 获取中文输入法的ID
getEnglishIM(): string // 获取英文输入法的ID
async obtainIM(): string // 获取当前输入法的ID
async switchToChineseIM() // 切换到中文输入法
async switchToEnglishIM() // 切换到英文输入法
async switch() // 切换输入法
```

## v1.2.0   2023-09-09
- 添加对Vim插件的支持，可帮助Vim在转入Normal模式时自动将输入语言切换为英语
- 提供一种单独使用shift键切换输入语言的方案

## v1.1.1   2023-09-07
- 使光标颜色与输入语言始终严格对应
  
## v1.1.0   2023-09-06
- 添加使用光标颜色指示中英文输入状态
- 添加与vim插件协同工作方式

## v1.0.0   2023-08-17
- 首次发布
  


