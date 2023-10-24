<h1 align="center">光标和输入法（IME and Cursor）</h1>
<p align="center"><strong>令光标兼作中英文输入状态的指示器</strong></p>

> “要盲打，不要盲切盲输（切换输入法和输入中英文）。让打字时视觉的自然焦点——光标，告诉你当前的输入语言是英文还是中文。”

**光标和输入法**（**IME and Cursor**）是为 VS Code 编写的一个小插件。它的功能和原理非常简单，就是通过适时获取当前输入语言，来相应地设置光标颜色（默认中文输入状态下光标显示为红色，可设置）或光标样式（默认未开启，可设置）。

安装本插件后，为了能够及时响应输入语言的改变，需要您在使用VSCode的过程中，使用本插件提供的快捷键来进行输入语言的切换（默认快捷键为 `shift+space`，可设置。而要实现通过单击 `Shift` 键切换输入语言则比较困难，具体方法请参考下面的[补充说明四](#additional-remarks-4)）。

<strong>目录</strong>
-   [🔧 各系统下的配置方法](#settings)
    -   [Windows 系统](#windows)
    -   [Mac 系统](#mac)
    -   [Linux 系统](#linux)
-   [⚡ 补充说明](#additional-remarks)
-   [❤️ 源起 · 致谢 · 关于我](#aboutme)
-   [🥚 篇尾彩蛋](#song)

<span id="settings"></span>
## 配置方法
因为涉及到与系统的交互，本插件并不能保证“开箱即用”，很可能还需要您做一点额外工作。下面分系统加以说明。
<span id="windows"></span>
## Windows 系统：
### 安装英语语言包
如果您的 Windows 系统未安装英语语言包（大概率，因为新近的 Windows 中文版不再默认安装），则需要您手动安装一下。具体操作为：

打开**设置**（快捷键：`win+i`） -> **时间和语言** -> **语言**（或**语言和区域**） ，找到“首选语言”栏，查看栏目下是否包含“英语(美国)”，如果未包含，请点击“添加语言”。

在打开的对话框中，找到 “`English(United States)`”，选中它然后点击下方按钮进入下一页。

如无特别需要，取消“可选语言功能”下的各复选项，然后点击“安装”按钮完成安装。

<span id="mac"></span>
## Mac 系统：

### 安装第三方输入法切换工具并完成本插件的相关设置

您可以使用任何能够获取输入法的 key 和使用 key 进行输入法切换的命令行工具。下面以 [im-select](https://github.com/daipeihust/im-select) 为例说明相关安装和配置工作：
#### 1. 安装 im-select（[安装说明](https://github.com/daipeihust/im-select/blob/master/README_CN.md)）
#### 2. 分别获取中文和英文输入法的 key（可以简单理解为输入法的 ID）
切换到英文输入法，并在终端中执行命令：

`/usr/local/bin/im-select` （如果您的 im-select 安装路径与此不同，请替换为您的）

返回值即为您的英文输入法的 key。

以同样的方法获取您使用的中文输入法的 key。

#### 3. 对本插件进行设置

相关的设置项共有四个，分别是：

* `ime-and-cursor.ChineseIM`: 你的中文输入法的 key
* `ime-and-cursor.EnglishIM`: 你的英文输入法的 key
* `ime-and-cursor.obtainIMCmd`: 用于获取输入法的 key 的命令（需要使用绝对路径）
* `ime-and-cursor.switchIMCmd`: 用于切换输入法的命令（需要使用绝对路径，且将 “{im}” 作为要切换的目标输入法的 key 的占位符）

下面是一个具体设置的参考样例：
```json
"ime-and-cursor.ChineseIM": "com.sogou.inputmethod.sogou.pinyin",
"ime-and-cursor.EnglishIM": "com.apple.keylayout.ABC",
"ime-and-cursor.obtainIMCmd": "/usr/local/bin/im-select",
"ime-and-cursor.switchIMCmd": "/usr/local/bin/im-select {im}"

```
<span id="linux"></span>
## Linux 系统：

Linux 有许多命令行工具可以获取输入法的 key 和切换输入法，如 ibus，xkb-switch 等，可参考前面 Mac 系统的配置说明和[这里](https://github.com/daipeihust/im-select/blob/master/README_CN.md)进行配置操作。

---
<span id="additional-remarks"></span>
---
## 补充说明一：

本插件默认提供的输入语言切换快捷键 `shift+space`，通常也被一些输入法用作“全角/半角”切换的快捷键，并且具有更高优先级。如果您发现安装了本插件并完成了前述配置工作后，在 VS Code 中使用 `shift+space` 无法实现输入语言的切换，很可能是因为在您的输入法设置中勾选启用了“全角/半角”的快捷键，引发了冲突。这种情况建议您如无特别需要，取消对“全角/半角”快捷键的勾选。


## 补充说明二（仅针对 Windows 用户）：

对于 Windows 用户，安装了英语语言包后，本插件应该就可以正常使用了。但如有需要也可以参考前面关于Mac系统的说明，自己安装第三方输入法切换工具并完成相关设置（同时参考[这里](https://github.com/daipeihust/im-select/blob/master/README_CN.md)）。下面是 Windows 上本插件的一个参考配置样例：
```json
"ime-and-cursor.ChineseIM": "2052",
"ime-and-cursor.EnglishIM": "1033",
"ime-and-cursor.obtainIMCmd": "D:\\bin\\im-select.exe",
"ime-and-cursor.switchIMCmd": "D:\\bin\\im-select.exe {im}"

```

## 补充说明三（仅针对Vim用户）：
本插件经过简单设置，在单独使用光标颜色指示中英文输入状态时可以和 Vim 插件同时使用，具体设置方法如下：
```json
"ime-and-cursor.cursorStyle.enable": false,
"ime-and-cursor.cursorColor.enable": true,
"ime-and-cursor.useWithVim": true,
```
如需本插件帮忙在 Vim 进入 Normal 模式时将输入语言自动切换为英文，那就再多加一项设置：
```json
"ime-and-cursor.helpVim": true,
```
<span id="additional-remarks-4"></span>
 ## 补充说明四：
 因为 VS Code 不直接向插件开放键盘事件，插件仅能定义快捷键，而单独的 shift、ctrl 等修饰键又不能定义为合法的 VS Code 快捷键，所以本插件才退而求其次，将 `Shift+Space` 这个还算舒服的按键组合定义为了默认的语言切换键。

 如果您想继续使用输入法常用的 shift 键来切换输入语言，也不是完全没有办法，比如通过使用开源软件 AutoHotkey。[这里](https://zhuanlan.zhihu.com/p/655293031)是我编辑的一小段 AutoHotkey 脚本，可用来将 VS Code 窗口下的单击 shift 键操作转为 `Shift+Space`，从而间接实现用 shift 键切换输入语言。不想麻烦安装 AutoHotkey 的用户，也可以到[本插件的github仓库](https://github.com/beishanyufu/ime-and-cursor/releases/tag/v1.2.0)下载我使用 AutoHotkey 制作的独立小工具。

---
<span id="aboutme"></span>
## 源起 · 致谢 · 关于我
本插件的想法源于我以前玩 Smalltalk 时给 Pharo 做的内置输入法（如有需要可通过 issue 告知，我会把镜像文件传到 github上）；技术实现则参考和借助了 [VSCodeVim](https://github.com/VSCodeVim/Vim) 和 [im-select](https://github.com/daipeihust/im-select)，特此致谢！！

作者[北山愚夫](https://beishanyufu.github.io/)，『愚公和鲁班』项目发起人，热爱开源，崇尚共享，致力于将数字世界的共创共享模式引入现实世界，开启一个全民无条件分红的新时代。
<span id="song"></span>

## 篇尾彩蛋😝

基于本插件导出的 api，有小伙伴开发了一款可根据上下文环境自动切换输入法的插件 [Smart IME](https://marketplace.visualstudio.com/items?itemName=OrangeX4.vscode-smart-ime)，在有较多中英文混输、需要频繁切换输入法的情况下很有帮助。