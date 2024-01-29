import { EVENTTYPES } from '@webwsdk/common';
import { _support, setFlag } from './global';

/**
 * 将地址字符串转换成对象，
 * 输入：'https://github.com/z1724469573/webwsdk?token=123&name=11'
 * 输出：{
 *  "host": "github.com",
 *  "path": "/z1724469573/webwsdk",
 *  "protocol": "https",
 *  "relative": "/z1724469573/webwsdk?token=123&name=11"
 * }
 */
export function parseUrlToObj(url: string) {
  if (!url) {
    return {};
  }
  const match = url.match(
    /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/
  );
  if (!match) {
    return {};
  }
  const query = match[6] || '';
  const fragment = match[8] || '';
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    relative: match[5] + query + fragment
  };
}
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
