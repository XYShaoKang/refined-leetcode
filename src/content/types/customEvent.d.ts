type CustomMap = {
  refinedLeetcodeOptionsChange: {
    options: import('src/options/options').OptionsType
  }
  refinedLeetcodeSaveOptions: {
    options: import('src/options/options').OptionsType
  }
  refinedLeetcodeGetOptions: void
}

type CustomEventMap<T> = { [K in keyof T]: CustomEvent<T[K]> }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WindowEventMap extends CustomEventMap<CustomMap> {}

type Args<T> = CustomMap[T] extends undefined
  ? [name: T]
  : [name: T, data: CustomMap[T]]

type CustomEventDispatch = <K extends keyof CustomMap>(...args: Args<K>) => void
