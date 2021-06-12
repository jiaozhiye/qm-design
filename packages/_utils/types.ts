/*
 * @Author: 焦质晔
 * @Date: 2021-02-14 14:25:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-19 16:04:32
 */
import type { App, VNode } from 'vue';

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type JSXNode = VNode | JSX.Element;

export type AnyObject<T> = { [key: string]: T };

export type AnyFunction<T> = (...args: any[]) => T;

export type CustomHTMLElement<T> = HTMLElement & T;

export type SFCWithInstall<T> = T & { install(app: App): void };

export type ComponentSize = 'medium' | 'small' | 'mini'; // 40  36  32  28
