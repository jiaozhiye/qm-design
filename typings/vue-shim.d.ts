/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 11:26:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-14 13:48:43
 */
import { VNodeChild } from 'vue';

declare module '*.vue' {
  import { App, defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent> & {
    install(app: App): void;
  };
  export default component;
}

declare module '*.tsx' {
  import { App, defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent> & {
    install(app: App): void;
  };
  export default component;
}

declare module '*.json' {
  const value: any;
  export const version: string;
  export default value;
}

declare module '*.scss' {
  const resource: Record<string, string>;
  export default resource;
}

declare type Nullable<T> = T | null;

declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

declare type VueNode = VNodeChild | JSX.Element;

declare type AnyFunction<T> = (...args: any[]) => T;

declare type CustomizedHTMLElement<T> = HTMLElement & T;

declare type ComponentSize = 'large' | 'medium' | 'small' | 'mini';
