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
}
