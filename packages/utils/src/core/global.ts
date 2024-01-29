import { WebSee, Window } from '@webwsdk/types';
import { variableTypeDetection } from './verifyType';

export const isBrowserEnv = variableTypeDetection.isWindow(
  typeof window !== 'undefined' ? window : 0
);
export function getGlobal(): Window {
  return window as unknown as Window;
}
const _global = getGlobal();
const _support = getGlobalSupport();

// 获取全部变量__webWsdk__的引用地址
export function getGlobalSupport() {
  _global.__webWsdk__ = _global.__webWsdk__ || ({} as WebSee);
  return _global.__webWsdk__;
}

// errorMap 存储代码错误的集合
_support.errorMap = new Map();

_support.hasError = false;

_support.replaceFlag = _support.replaceFlag || {};
const replaceFlag = _support.replaceFlag;
export function setFlag(replaceType: string, isSet: boolean) {
  if (replaceFlag[replaceType]) return;
  replaceFlag[replaceType] = isSet;
}
export function getFlag(replaceType: string) {
  return replaceFlag[replaceType] ? true : false;
}

export { _global, _support };
