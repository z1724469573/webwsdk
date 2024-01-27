import { notify, subscribeEvent } from './subscribe';
import { ReplaceHandler } from '@webwsdk/types';
import { EVENTTYPES } from '@webwsdk/common';
import { _global, on } from '@webwsdk/utils';

function replace(type: EVENTTYPES): void {
  switch (type) {
    case EVENTTYPES.ERROR:
      listenError();
      break;
    default:
      break;
  }
}
export function addReplaceHandler(handler: ReplaceHandler) {
  if (!subscribeEvent(handler)) return;
  replace(handler.type);
}

function listenError() {
  on(_global, 'error', function (e: ErrorEvent) {
    console.log(e);
    notify(EVENTTYPES.ERROR, e);
  });
}
