import { InitOptions, VueInstance, ViewModel } from '@webwsdk//types';
import {
  HandleEvents,
  breadcrumb,
  handleOptions,
  notify,
  setupReplace,
  subscribeEvent,
  transportData
} from './core';
import { _global, nativeTryCatch } from '@webwsdk/utils';

function init(options: InitOptions) {
  if (!options.dsn || !options.apikey) {
    return console.error(
      `web-see 缺少必须配置项：${!options.dsn ? 'dsn' : 'apikey'} `
    );
  }
  if (!('fetch' in _global) || options.disabled) return;
  // 初始化配置
  handleOptions(options);
  setupReplace();
}

function install(Vue: VueInstance, options: InitOptions) {
  // if (getFlag(EVENTTYPES.VUE)) return;
  // setFlag(EVENTTYPES.VUE, true);
  const handler = Vue.config.errorHandler;
  // vue项目在Vue.config.errorHandler中上报错误
  Vue.config.errorHandler = function (
    err: Error,
    vm: ViewModel,
    info: string
  ): void {
    console.log(err);
    HandleEvents.handleError(err);
    if (handler) handler.apply(null, [err, vm, info]);
  };
  init(options);
}

function use(plugins: any, options?: any) {
  const instance = new plugins(options);
  if (
    !subscribeEvent({
      callback: (data) => {
        instance.transform(data);
      },
      type: instance.type
    })
  )
    return;
  nativeTryCatch(() => {
    instance.core({ transportData, breadcrumb, options, notify });
  });
}
export default { install, init, use };
