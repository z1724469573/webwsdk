import { validateOption, _support, setSilentFlag } from '@webwsdk/utils';
import { InitOptions } from '@webwsdk/types';
import { transportData } from './reportData';

export class Options {
  dsn = ''; // 监控上报接口的地址
  throttleDelayTime = 0; // click事件的节流时长
  overTime = 10; // 接口超时时长
  filterXhrUrlRegExp: any; // 过滤的接口请求正则
  handleHttpStatus: any; // 处理接口返回的 response
  repeatCodeError = false; // 是否去除重复的代码错误，重复的错误只上报一次
  constructor() {}
  bindOptions(options: InitOptions): void {
    const {
      dsn,
      filterXhrUrlRegExp,
      throttleDelayTime = 0,
      overTime = 10,
      handleHttpStatus,
      repeatCodeError = false
    } = options;
    validateOption(dsn, 'dsn', 'string') && (this.dsn = dsn);
    validateOption(throttleDelayTime, 'throttleDelayTime', 'number') &&
      (this.throttleDelayTime = throttleDelayTime);
    validateOption(overTime, 'overTime', 'number') &&
      (this.overTime = overTime);
    validateOption(filterXhrUrlRegExp, 'filterXhrUrlRegExp', 'regexp') &&
      (this.filterXhrUrlRegExp = filterXhrUrlRegExp);
    validateOption(handleHttpStatus, 'handleHttpStatus', 'function') &&
      (this.handleHttpStatus = handleHttpStatus);
    validateOption(repeatCodeError, 'repeatCodeError', 'boolean') &&
      (this.repeatCodeError = repeatCodeError);
  }
}
const options = _support.options || (_support.options = new Options());

export function handleOptions(paramOptions: InitOptions): void {
  // setSilentFlag 给全局添加已设置的标识，防止重复设置
  setSilentFlag(paramOptions);
  // transportData 配置上报的信息
  transportData.bindOptions(paramOptions);
  // 绑定其他配置项
  options.bindOptions(paramOptions);
}
export { options };
