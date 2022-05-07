interface FiberRoot {
  current: { [key: string]: unknown } // Fiber
}
interface HTMLElement {
  _reactRootContainer?: {
    _internalRoot?: FiberRoot
  }
}

declare let REFINED_LEETCODE_LOG_LEVEL: string
