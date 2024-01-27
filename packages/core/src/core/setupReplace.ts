import { HandleEvents } from './handleEvents';
import { addReplaceHandler } from './replace';
import { EVENTTYPES } from '@webwsdk/common';

export function setupReplace(): void {
  // 捕获错误
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error);
    },
    type: EVENTTYPES.ERROR
  });
}
