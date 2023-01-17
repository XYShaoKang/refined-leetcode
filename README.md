# Refined LeetCode

[![chrome-store-image][chrome-store-image]][chrome-store-url]
[![semantic-release][semantic-release-image]][semantic-release-url] [![GitHub Action][actions-release-image]][actions-release-url]

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[actions-release-image]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml/badge.svg?branch=master
[actions-release-url]: https://github.com/XYShaoKang/refined-leetcode/actions/workflows/release.yml?query=branch%3Amaster
[chrome-store-image]: ./docs/assets/trynow.png
[chrome-store-url]: https://chrome.google.com/webstore/detail/refined-leetcode/kmpinnjkedaidpojenkiooddkeplniel

> 添加一些有用和有意思的功能,增强 LeetCode-cn 刷题体验

我建了个内测群：250316825，有兴趣可以加这个群，在群里进行反馈和交流。

## 功能

各功能和使用说明，可以查看下面列出来的链接

- [答题页](./docs/%E7%AD%94%E9%A2%98%E9%A1%B5.md)
  - 计时组件（已适配新版答题页）
  - 新版答题页
    - 随机一题按钮
    - 阻止保存页面弹窗
- [竞赛排名页面](./docs/%E7%AB%9E%E8%B5%9B%E6%8E%92%E5%90%8D%E9%A1%B5.md)
  - 显示排名预测
  - 显示对应代码的图标
- [首页帖子黑名单功能](./docs/%E9%A6%96%E9%A1%B5%E5%B8%96%E5%AD%90%E9%BB%91%E5%90%8D%E5%8D%95.md)
- [题单管理](./docs/%E9%A2%98%E5%8D%95%E7%AE%A1%E7%90%86.md)
  - 题单侧边栏
  - 题目评分

## 安装

有两种安装方式，可以选择从 [Chrome Web Store][chrome-store-url] 安装，或者 [离线安装](#离线安装)

> 推荐直接通过 [Chrome Web Store][chrome-store-url] 来安装，比较方便，并且当扩展有更新的时候，会自动更新到最新版本。
>
> 因为提交到商店需要进行审核，有时需要进行一些时间的等待，这时如果想要尝鲜，或者是因为某些原因无法连接到商店，可以尝试进行按照下面的方式进行「离线安装」，不过这样如果想要获取更新就需要每次手动来下载一下了。

### 离线安装

#### 下载

从 https://github.com/XYShaoKang/refined-leetcode/releases 下载最新版本的 refined-leetcode.zip,解压 refined-leetcode.zip

#### 安装使用

1. 打开 Chrome 浏览器
2. 转到 `chrome://extensions/` 页面,直接在地址栏输入 `chrome://extensions/` 即可
3. 切换页面右上角的开发者模式为启用的状态
4. 点击页面左上角的 `加载以解压的扩展程序` 按钮
5. 选择上面解压的 refined-leetcode 文件夹,再点击确定即可

## 相关项目

感谢 leetcode.cn 力扣，提供了一个体验非常好的刷题平台，另外感谢以下相关项目提供的数据支持

- https://github.com/baoliay2008/lccn_predictor 力扣竞赛评分预测项目，也是扩展目前使用的预测数据源
- https://github.com/zerotrac/leetcode_problem_rating 力扣题目评分项目，也是扩展中题目评分的数据源
- https://github.com/SysSn13/leetcode-rating-predictor 力扣竞赛评分预测预测，是之前使用的预测数据源
