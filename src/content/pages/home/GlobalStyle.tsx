import { createGlobalStyle } from 'styled-components/macro'

const styled = { createGlobalStyle }
const GlobalStyle = styled.createGlobalStyle`
  /* 隐藏黑名单用户发的帖子 */
  .refined-leetcode-block {
    display: none;
  }
  /* 隐藏帖子相邻的分割元素 */
  .refined-leetcode-block + div.css-1vwizfm-Divider {
    display: none;
  }

  /* 临时显示帖子，但对内容进行糢糊处理，以区别 */
  .refined-leetcode-temp {
    display: flex;
    filter: url(#refined-leetcode-noise);
  }
  .refined-leetcode-block.refined-leetcode-temp + div.css-1vwizfm-Divider {
    display: block;
  }
  /* 当悬浮鼠标时，取消糢糊效果 */
  .refined-leetcode-block.refined-leetcode-temp:hover {
    filter: none;
  }

  /* 设置当前鼠标悬浮的帖子元素，以显示拖拽手柄和定位 */
  .css-1pej3s6-FeedContainer:hover {
    position: relative;
    & > span {
      display: block;
    }
  }
  .css-1pej3s6-FeedContainer > span {
    display: none;
  }
`
export default GlobalStyle
