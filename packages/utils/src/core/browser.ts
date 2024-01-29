import { EVENTTYPES } from '@webwsdk/common';
import { _support, setFlag } from './global';

export function setSilentFlag({
  silentXhr = true,
  silentFetch = true,
  silentHistory = true,
  silentError = true,
  silentUnhandledrejection = true
}): void {
  setFlag(EVENTTYPES.XHR, !silentXhr);
  setFlag(EVENTTYPES.FETCH, !silentFetch);
  setFlag(EVENTTYPES.HISTORY, !silentHistory);
  setFlag(EVENTTYPES.ERROR, !silentError);
  setFlag(EVENTTYPES.UNHANDLEDREJECTION, !silentUnhandledrejection);
}
// 对每一个错误详情，生成唯一的编码
export function getErrorUid(input: string): string {
  return window.btoa(encodeURIComponent(input));
}

export function hashMapExist(hash: string): boolean {
  const exist = _support.errorMap.has(hash);
  if (!exist) {
    _support.errorMap.set(hash, true);
  }
  return exist;
}
