import { HandleEvents } from './handleEvents';
import { addReplaceHandler } from './replace';
import { EVENTTYPES } from '@webwsdk/common';

export function setupReplace(): void {
  // 捕获框架暴露的错误 && 异步错误
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error);
    },
    type: EVENTTYPES.ERROR
  });
  // 捕获promise的错误
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleUnhandleRejection(data);
    },
    type: EVENTTYPES.UNHANDLEDREJECTION
  });
  // 重写XMLHTTPRequest
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.XHR);
    },
    type: EVENTTYPES.XHR
  });
  // 重写fetch
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.FETCH);
    },
    type: EVENTTYPES.FETCH
  });
  // 监听history模式路由的变化
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data);
    },
    type: EVENTTYPES.HISTORY
  });
  // 监听hashchange
  addReplaceHandler({
    callback: (e: HashChangeEvent) => {
      HandleEvents.handleHashchange(e);
    },
    type: EVENTTYPES.HASHCHANGE
  });
}
