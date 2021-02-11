/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 11:26:35
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-02-09 11:26:35
 */
declare module '*.vue' {
  import { App, defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent> & {
    install(app: App): void;
  };
  export default component;
}

declare type Nullable<T> = T | null;

declare type Indexable<T> = { [key: string]: T };

declare type AnyFunction<T> = (...args: any[]) => T;

declare type CustomizedHTMLElement<T> = HTMLElement & T;

declare type ComponentSize = 'large' | 'medium' | 'small' | 'mini';
