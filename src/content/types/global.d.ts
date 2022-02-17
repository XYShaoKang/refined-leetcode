interface FiberRoot {
  current: { [key: string]: unknown } // Fiber
}
interface HTMLElement {
  _reactRootContainer?: {
    _internalRoot?: FiberRoot
  }
}
