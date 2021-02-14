/*
 * @Author: 焦质晔
 * @Date: 2021-02-14 14:25:07
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-02-14 14:25:07
 */
import { App, VNodeChild } from 'vue';

export type Nullable<T> = T | null;

export type LooseObject<T> = { [key: string]: T };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type VueNode = VNodeChild | JSX.Element;

export type AnyFunction<T> = (...args: any[]) => T;

export type CustomizedHTMLElement<T> = HTMLElement & T;

export type ComponentSize = 'large' | 'medium' | 'small' | 'mini';

export type SFCWithInstall<T> = T & { install(app: App): void };
