import { notify, subscribeEvent } from './subscribe';
import { ReplaceHandler } from '@webwsdk/types';
import { EVENTTYPES } from '@webwsdk/common';
import { _global, on } from '@webwsdk/utils';

function replace(type: EVENTTYPES): void {
  switch (type) {
    case EVENTTYPES.ERROR:
      listenError();
      break;
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace();
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
    notify(EVENTTYPES.ERROR, e);
  });
}
function unhandledrejectionReplace(): void {
  on(
    _global,
    EVENTTYPES.UNHANDLEDREJECTION,
    function (ev: PromiseRejectionEvent) {
      // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
      notify(EVENTTYPES.UNHANDLEDREJECTION, ev);
    }
  );
}
