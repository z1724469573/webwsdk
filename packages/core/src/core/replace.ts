import { notify, subscribeEvent } from './subscribe';
import { ReplaceHandler, voidFun } from '@webwsdk/types';
import { EMethods, EVENTTYPES, HTTPTYPE } from '@webwsdk/common';
import {
  _global,
  getLocationHref,
  getTimestamp,
  isExistProperty,
  on,
  replaceAop,
  supportsHistory,
  throttle,
  variableTypeDetection
} from '@webwsdk/utils';
import { options } from './options';
import { transportData } from './reportData';

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
    case EVENTTYPES.FETCH:
      fetchReplace();
      break;
    case EVENTTYPES.HISTORY:
      historyReplace();
      break;
    case EVENTTYPES.HASHCHANGE:
      listenHashchange();
      break;
    case EVENTTYPES.CLICK:
      domReplace();
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
      // const { method, url } = this.webwsdk_xhr;
      // 监听loadend事件，接口成功或失败都会执行
      on(this, 'loadend', function (this: any) {
        // isSdkTransportUrl 判断当前接口是否为上报的接口
        // isFilterHttpUrl 判断当前接口是否为需要过滤掉的接口
        // if (method === EMethods.Post) return;
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
function fetchReplace() {
  if (!('fetch' in _global)) {
    return;
  }
  replaceAop(_global, EVENTTYPES.FETCH, (originalFetch) => {
    return function (url: any, config: Partial<Request> = {}): void {
      const sTime = getTimestamp();
      const method = (config && config.method) || 'GET';
      let fetchData = {
        type: HTTPTYPE.FETCH,
        method,
        requestData: config && config.body,
        url,
        response: ''
      };
      // 获取配置的headers
      const headers = new Headers(config.headers || {});
      Object.assign(headers, {
        setRequestHeader: headers.set
      });
      config = Object.assign({}, config, headers);
      return originalFetch.apply(_global, [url, config]).then(
        (res: any) => {
          // 克隆一份，防止被标记已消费
          const tempRes = res.clone();
          const eTime = getTimestamp();
          fetchData = Object.assign({}, fetchData, {
            elapsedTime: eTime - sTime,
            Status: tempRes.status,
            time: sTime
          });
          tempRes.text().then((data: any) => {
            // 同理，进接口进行过滤
            if (
              method === EMethods.Post &&
              transportData.isSdkTransportUrl(url)
            )
              return;
            // 用户设置handleHttpStatus函数来判断接口是否正确，只有接口报错时才保留response
            if (
              options.handleHttpStatus &&
              typeof options.handleHttpStatus == 'function'
            ) {
              fetchData.response = data;
            }
            notify(EVENTTYPES.FETCH, fetchData);
          });
          return res;
        },
        // 接口报错
        (err: any) => {
          const eTime = getTimestamp();
          if (method === EMethods.Post) return;
          fetchData = Object.assign({}, fetchData, {
            elapsedTime: eTime - sTime,
            status: 0,
            time: sTime
          });
          notify(EVENTTYPES.FETCH, fetchData);
          throw err;
        }
      );
    };
  });
}
function listenHashchange(): void {
  // 通过onpopstate事件，来监听hash模式下路由的变化
  if (isExistProperty(_global, 'onhashchange')) {
    on(_global, EVENTTYPES.HASHCHANGE, function (e: HashChangeEvent) {
      notify(EVENTTYPES.HASHCHANGE, e);
    });
  }
}
// last time route
let lastHref: string = getLocationHref();
function historyReplace() {
  // 是否支持history
  if (!supportsHistory()) return;
  const oldOnpopstate = _global.onpopstate;
  // 添加 onpopState事件
  _global.onpopstate = function (this: any, ...args: any): void {
    const to = getLocationHref();
    const from = lastHref;
    lastHref = to;
    notify(EVENTTYPES.HISTORY, {
      from,
      to
    });
    oldOnpopstate && oldOnpopstate.apply(this, args);
  };
  function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
    return function (this: any, ...args: any[]): void {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        const from = lastHref;
        const to = String(url);
        lastHref = to;
        notify(EVENTTYPES.HISTORY, {
          from,
          to
        });
      }
      return originalHistoryFn.apply(this, args);
    };
  }
  // 重写pushState、replaceState事件
  replaceAop(_global.history, 'pushState', historyReplaceFn);
  replaceAop(_global.history, 'replaceState', historyReplaceFn);
}
function domReplace(): void {
  if (!('document' in _global)) return;
  // 节流，默认0s
  const clickThrottle = throttle(notify, options.throttleDelayTime);
  on(
    _global.document,
    'click',
    function (this: any): void {
      clickThrottle(EVENTTYPES.CLICK, {
        category: 'click',
        data: this
      });
    },
    true
  );
}
