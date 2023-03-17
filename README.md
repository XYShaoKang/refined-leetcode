[![semantic-release][semantic-release-image]][semantic-release-url] [![GitHub Action][actions-release-image]][actions-release-url] [![](https://img.shields.io/chrome-web-store/v/kmpinnjkedaidpojenkiooddkeplniel.svg)][chrome-store-url] [![](https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Figmccckalbaoifpohffkgfdagpgdangl)][edge-store-url]

# Refined LeetCode

> 添加一些有用和有意思的功能,增强 LeetCode-cn 刷题体验

[![chrome-store-badge][chrome-store-badge]][chrome-store-url] [![edge-store-badge][edge-store-badge]][edge-store-url]

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[actions-release-image]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml/badge.svg?branch=master
[actions-release-url]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml?query=branch%3Amaster
[chrome-store-badge]: ./docs/assets/trynow.png
[chrome-store-url]: https://chrome.google.com/webstore/detail/refined-leetcode/kmpinnjkedaidpojenkiooddkeplniel
[edge-store-badge]: ./docs/assets/get_it_from_edge.png
[edge-store-url]: https://microsoftedge.microsoft.com/addons/detail/refined-leetcode/igmccckalbaoifpohffkgfdagpgdangl

Refined LeetCode 是一个 Chrome 浏览器。理论上来说大多数基于 Chromium 开发浏览器都能支持，比如像 Microsoft Edge、Opera、Yanda 等浏览器。

> 我建了个 QQ 群：250316825，有兴趣可以加这个群，在群里进行反馈和交流。

## 功能

各功能的使用说明和视频演示，可以点击链接查看

- [答题页](./docs/%E7%AD%94%E9%A2%98%E9%A1%B5.md)
  - 计时组件（已适配新版答
  - 新版答题页
    - 随机一题按钮
  - 比赛答题页
    - 快捷键的禁用选项
- [竞赛排名页面](./docs/%E7%AB%9E%E8%B5%9B%E6%8E%92%E5%90%8D%E9%A1%B5.md)
  - 显示排名预测
  - 显示对应代码的图标
  - 实时预测
- [首页帖子黑名单功能](./docs/%E9%A6%96%E9%A1%B5%E5%B8%96%E5%AD%90%E9%BB%91%E5%90%8D%E5%8D%95.md)
- [题单管理](./docs/%E9%A2%98%E5%8D%95%E7%AE%A1%E7%90%86.md)
  - 题单侧边栏
  - 题目评分
- [配置选项](./docs/%E9%85%8D%E7%BD%AE%E9%80%89%E9%A1%B9.md) 控制各个功能的开关

## 安装

有两种安装方式，通过在线商店安装，或者通过离线安装。

### 在线安装

可以通过从 [Chrome Web Store][chrome-store-url] 安装。另外我也在 [Microsoft Edge Addons][edge-store-url] 发布了这款扩展，如果使用 Microsoft Edge 浏览器，并且无法访问谷歌的话，可以从这里安装。但微软的审核会长一些，有可能会比谷歌商店慢上一些版本，所以即使使用 Microsoft Edge 浏览器，也比较推荐从[Chrome Web Store][chrome-store-url]安装，可以获得更及时的更新

> 推荐直接通过在线安装的方式来安装，比较方便，并且当扩展有更新的时候，会自动更新到最新版本。
>
> 但因为提交到商店需要进行审核，有时需要进行一些时间的等待，这时如果想要尝鲜，或者是因为某些原因无法连接到商店，可以尝试进行按照下面的方式进行「离线安装」，不过这样如果想要获取更新就需要每次手动来下载一下了。

### 离线安装

离线安装支持以下两种方式

- 解压文件夹
- crx 文件

#### 解压文件夹

从 https://github.com/XYShaoKang/refined-leetcode/releases 下载最新版本的 `refined-leetcode-v[xxx].zip`,解压 `refined-leetcode-v[xxx].zip` （其中 xxx 表示版本号）

安装

1. 打开 Chrome 浏览器
2. 转到 `chrome://extensions/` 页面,直接在地址栏输入 `chrome://extensions/` 即可
3. 切换页面右上角的开发者模式为启用的状态
4. 加载扩展
   - 方式 1: 直接将前面解压的 refined-leetcode 文件夹拖入 `chrome://extensions/` 页面即可
   - 方式 2:
     1. 点击页面左上角的 `加载以解压的扩展程序` 按钮
     2. 选择上面解压的 refined-leetcode 文件夹,再点击确定即可

#### crx 文件

从 https://github.com/XYShaoKang/refined-leetcode/releases 下载最新版本的 `refined-leetcode-[xxx].crx` 文件，或者 `refined-leetcode-[xxx].crx.zip` 进行解压 （其中 xxx 表示版本号）

安装

1. 打开 Chrome 浏览器
2. 转到 `chrome://extensions/` 页面,直接在地址栏输入 `chrome://extensions/` 即可
3. 切换页面右上角的开发者模式为启用的状态
4. 加载扩展
   - 直接将 crx 文件拖入 `chrome://extensions/` 页面，会弹出一个提示，点击`添加扩展程序`按钮即可

## 相关项目

感谢 leetcode.cn 力扣，提供了一个体验非常好的刷题平台，另外感谢以下相关项目提供的数据支持

- https://github.com/baoliay2008/lccn_predictor 力扣竞赛评分预测项目，也是扩展目前使用的预测数据源
- https://github.com/zerotrac/leetcode_problem_rating 力扣题目评分项目，也是扩展中题目评分的数据源
- https://github.com/SysSn13/leetcode-rating-predictor 力扣竞赛评分预测预测，是之前使用的预测数据源
- 评分功能中，对应评分的颜色参考 https://clist.by/problems/ 和 https://codeforces.com/ 中对应等级的颜色
