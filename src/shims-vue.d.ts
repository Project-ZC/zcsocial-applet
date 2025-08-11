declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export * from '@vue/runtime-core'
}

declare module '@dcloudio/uni-app' {
  export function createSSRApp(app: any): any
  export function onLaunch(callback: () => void): void
  export function onShow(callback: () => void): void
  export function onHide(callback: () => void): void
}