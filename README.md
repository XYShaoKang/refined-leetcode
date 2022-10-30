# Refined LeetCode-cn

[![chrome-store-image][chrome-store-image]][chrome-store-url]
[![semantic-release][semantic-release-image]][semantic-release-url] [![GitHub Action][actions-release-image]][actions-release-url]

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[actions-release-image]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml/badge.svg?branch=master
[actions-release-url]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml?query=branch%3Amaster
[chrome-store-image]: ./docs/assets/trynow.png
[chrome-store-url]: https://chrome.google.com/webstore/detail/refined-leetcode/kmpinnjkedaidpojenkiooddkeplniel

> 添加一些有用和有意思的功能,增强 LeetCode-cn 刷题体验

## 安装

有两种安装方式,可以选择从 [Chrome Web Store][chrome-store-url] 安装,或者 [离线安装](#离线安装)

> 推荐直接通过 [Chrome Web Store][chrome-store-url] 来安装,比较方便.
>
> 不过因为提交到商店需要进行审核,有时需要进行一些时间的等待,这时如果想要尝鲜,或者是因为某些原因无法连接到商店,可以尝试进行 [离线安装](#离线安装)

## 功能

- [答题页计时](#答题页计时)
- [竞赛排名页面显示预测](#竞赛排名页面显示预测)
- [竞赛排名页面显示代码对应的语言图标](#竞赛排名页面显示代码对应的语言图标)
- [首页帖子黑名单功能](#首页帖子黑名单功能)

### 答题页计时

> 2022-01-02 添加
>
> 此功能的最初创意由 https://leetcode-cn.com/u/s192516/ 提出

进入答题页时,自动开始计时,第一次提交成功之后会停止计时,并显示所用时间

计时器位于页面右下角,提交和执行代码按钮的左边.

目前提供三种操作,分别是在计时阶段:

提供隐藏时钟的操作

![](docs/assets/hidden.png)

重新显示时钟的操作

![](docs/assets/show.png)

以及在结束之后,重新开始的操作

![](docs/assets/restart.png)

> 2022-01-03 自动添加标记的功能

当成功提交之后,会将当前所有时间自动添加到对应提交的标记中

![](docs/assets/mark.png)

此功能源码 [src/content/pages/problems](./src/content/pages/problems/)

> 2022-10-22 适配力扣新版 UI

### 竞赛排名页面显示预测

> 2022-02-24 添加

效果如下,预测数据来自 https://lcpredictor.herokuapp.com/

![rating-predictor](./docs/assets/rating-predictor.png)

此功能源码 [src/content/pages/ranking](./src/content/pages/ranking)

### 竞赛排名页面显示代码对应的语言图标

> 2022-03-09 添加

在排名页列表中的提交时间前面,将之前代码图标替换为提交所使用的语言对应的图标,这样可以很直观的看到选手提交所使用的语言

这样如果我只想看某种语言的提交,就不需要一个个点进去看,可以节省很多时间

> 由于全球服 API 返回的数据没有对应提交的语言标记,所以目前支持国服的排名页

![show-file-icon](./docs/assets/show-file-icon.png)

此功能源码 [src/content/pages/ranking/FileIcon.tsx](./src/content/pages/ranking/FileIcon.tsx)

### 首页帖子黑名单功能

通过添加黑名单用户，可以阻止该用户的帖子在首页显示。黑名单数据只存储在本地，如果有多个地方使用的话，则需要在对应的浏览器上添加黑名单。目前只支持首页的帖子中过滤掉黑名单用户发的帖子。

安装扩展之后，会在首页右边栏最上方出现一栏黑名单管理的组件，点击可以对当前黑名单列表进行添加和删除等管理。

![演示添加黑名单](docs/assets/block.gif)

如果要将某个用户添加到黑名单中，需要输入其 slug，可以从其个人主页获取，一般会出现在昵称的下面，或者是个人主页 url 的最后一段。

![slug 位置](docs/assets/slug.png)

此功能源码 [src/content/pages/home](./src/content/pages/home)

## 离线安装

### 下载

从 https://github.com/XYShaoKang/refined-leetcode/releases 下载最新版本的 refined-leetcode.zip,解压 refined-leetcode.zip

### 安装使用

1. 打开 Chrome 浏览器
2. 转到 `chrome://extensions/` 页面,直接在地址栏输入 `chrome://extensions/` 即可
3. 切换页面右上角的开发者模式为启用的状态
4. 点击页面左上角的 `加载以解压的扩展程序` 按钮
5. 选择上面解压的 refined-leetcode 文件夹,再点击确定即可

## 开发

首先需要安装运行环境 [Node.js](https://nodejs.org/en/download/)(>=v14),以及依赖管理工具 [pnpm](https://pnpm.io/)

> 依赖管理工具可以使用 yarn 或者 npm 替代,下面使用 pnpm 演示

### 下载

```sh
git clone https://github.com/XYShaoKang/refined-leetcode.git
cd refined-leetcode
```

### 安装依赖

```sh
pnpm install
```

### 运行

```sh
pnpm dev
```

### 加载扩展

运行之后会在项目中生成 dist 文件夹,之后进行如下操作

1. 打开 Chrome 浏览器
2. 转到 chrome://extensions/ 页面
3. 打开页面右上角的开发者模式
4. 点击页面左上角的 `加载以解压的扩展程序` 按钮
5. 选择到 dist 路径,再点击确定即可

### 热模块加载

对于 content 的页面开发,已经配置好了热模块加载([Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/))功能,React 组件内的大多数修改应该都能实时反应到页面中,可能有些特殊情况或者是修改 React 外部的代码时,页面会重新加载,不过这些都会自动完成.

如果是需要修改 background 中的代码,保存之后,等待编译完成,需要到扩展页面,手动按刷新按钮才行.
