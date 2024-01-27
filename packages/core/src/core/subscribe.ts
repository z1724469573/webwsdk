import { ReplaceHandler, ReplaceCallback } from '@webwsdk/types';
import { getFlag, nativeTryCatch, setFlag } from '@webwsdk/utils';
import { EVENTTYPES } from '@webwsdk/common';

const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {};

export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || getFlag(handler.type)) return false;
  setFlag(handler.type, true);
  handlers[handler.type] = handlers[handler.type] || [];
  handlers[handler.type]?.push(handler.callback);
  return true;
}
export function notify(type: EVENTTYPES, data?: any): void {
  if (!type || !handlers[type]) return;
  handlers[type]?.forEach((callback) => {
    nativeTryCatch(
      () => {
        callback(data);
      },
      () => {
        // console.error(
        //   `web-see 重写事件notify的回调函数发生错误\nType:${type}\nName: ${getFunctionName(
        //     callback
        //   )}\nError: ${e}`
        // );
      }
    );
  });
}
