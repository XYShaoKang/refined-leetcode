import { StyledComponentProps } from 'styled-components/macro'

export type SCProps<
  BaseProps extends object,
  AsC extends string | React.ComponentType<any>,
  FAsC extends string | React.ComponentType<any> = AsC
> = Omit<
  StyledComponentProps<AsC, never, BaseProps, never, FAsC>,
  keyof BaseProps
> &
  BaseProps & {
    as?: AsC | undefined
    forwardedAs?: FAsC | undefined
  }

export type StyledComponent<
  BaseProps extends object,
  DefaultAsC extends string | React.ComponentType<any>
> = <
  AsC extends string | React.ComponentType<any> = DefaultAsC,
  FAsC extends string | React.ComponentType<any> = AsC
>(
  props: SCProps<BaseProps, AsC>,
  ref?: React.Ref<AsC>
) => React.ReactElement<SCProps<BaseProps, AsC, FAsC>> | null
