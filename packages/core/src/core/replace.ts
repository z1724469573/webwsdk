import { notify, subscribeEvent } from './subscribe';
import { ReplaceHandler, voidFun } from '@webwsdk/types';
import { EMethods, EVENTTYPES, HTTPTYPE } from '@webwsdk/common';
import {
  _global,
  getTimestamp,
  on,
  replaceAop,
  variableTypeDetection
} from '@webwsdk/utils';
import { options } from './options';

function replace(type: EVENTTYPES): void {
  switch (type) {
    case EVENTTYPES.ERROR:
      listenError();
      break;
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace();
      break;
    case EVENTTYPES.XHR:
      xhrReplace();
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
function xhrReplace() {
  if (!('XMLHttpRequest' in _global)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;
  replaceAop(originalXhrProto, 'open', (originalOpen: voidFun) => {
    return function (this: any, ...args: any[]): void {
      this.webwsdk_xhr = {
        method: variableTypeDetection.isString(args[0])
          ? args[0].toUpperCase()
          : args[0],
        url: args[1],
        sTime: getTimestamp(),
        type: HTTPTYPE.XHR
      };
      originalOpen.apply(this, args);
    };
  });
  replaceAop(originalXhrProto, 'send', (originalSend: voidFun) => {
    return function (this: any, ...args: any[]): void {
      const { method, url } = this.webwsdk_xhr;
      // 监听loadend事件，接口成功或失败都会执行
      on(this, 'loadend', function (this: any) {
        // isSdkTransportUrl 判断当前接口是否为上报的接口
        // isFilterHttpUrl 判断当前接口是否为需要过滤掉的接口
        if (method === EMethods.Post) return;
        const { responseType, response, status } = this;
        this.webwsdk_xhr.requestData = args[0];
        const eTime = getTimestamp();
        // 设置该接口的time，用户用户行为按时间排序
        this.webwsdk_xhr.time = this.webwsdk_xhr.sTime;
        this.webwsdk_xhr.Status = status;
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          // 用户设置handleHttpStatus函数来判断接口是否正确，只有接口报错时才保留response
          if (
            options.handleHttpStatus &&
            typeof options.handleHttpStatus == 'function'
          ) {
            this.webwsdk_xhr.response = response && JSON.parse(response);
          }
        }
        // 接口的执行时长
        this.webwsdk_xhr.elapsedTime = eTime - this.webwsdk_xhr.sTime;
        // 执行之前注册的xhr回调函数
        notify(EVENTTYPES.XHR, this.webwsdk_xhr);
      });
      originalSend.apply(this, args);
    };
  });
}
