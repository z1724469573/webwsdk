import {
  _support,
  generateUUID,
  getLocationHref,
  isBrowserEnv,
  isEmpty,
  Queue,
  validateOption
} from '@webwsdk/utils';
import { InitOptions, ReportData } from '@webwsdk/types';
/**
 * 用来上报数据，包含图片打点上报、xhr请求
 */
export class TransportData {
  queue: Queue = new Queue();
  errorDsn = ''; // 监控上报接口的地址
  uuid: string; //每次页面加载的唯一标识
  useImgUpload = false; // 是否使用图片打点上报
  apikey = ''; // 每个项目对应的唯一标识
  userId = ''; // 用户id
  constructor() {
    this.uuid = generateUUID();
  }
  bindOptions(options: InitOptions): void {
    const { dsn, apikey, userId, useImgUpload } = options;
    validateOption(apikey, 'apikey', 'string') && (this.apikey = apikey);
    validateOption(dsn, 'dsn', 'string') && (this.errorDsn = dsn);
    validateOption(userId, 'userId', 'string') && (this.userId = userId || '');
    validateOption(useImgUpload, 'useImgUpload', 'boolean') &&
      (this.useImgUpload = useImgUpload || false);
  }
  beacon(url: string, data: any): boolean {
    return navigator.sendBeacon(url, JSON.stringify(data));
  }
  imgRequest(data: ReportData, url: string) {
    const requestFun = () => {
      const img = new Image();
      const spliceStr = url.indexOf('?') === -1 ? '?' : '&';
      img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
    };
    this.queue.addFn(requestFun);
  }
  async beforePost(data: ReportData): Promise<ReportData | boolean> {
    const transportData = this.getTransportData(data);
    return transportData;
  }
  async xhrPost(data: ReportData, url: string): Promise<void> {
    const requestFun = () => {
      fetch(`${url}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    };
    this.queue.addFn(requestFun);
  }
  getTransportData(data: any): ReportData {
    const info = {
      ...data,
      uuid: this.uuid,
      pageUrl: getLocationHref()
    };
    return info;
  }
  async send(data: ReportData) {
    const dsn = this.errorDsn;
    if (isEmpty(dsn)) {
      console.error(
        'webWsdk: dsn为空，没有传入监控错误上报的dsn地址，请在init中传入'
      );
      return;
    }
    const result = (await this.beforePost(data)) as ReportData;
    if (isBrowserEnv && result) {
      // 优先使用sendBacon上报，若数据量大， 再使用图片打点上报和fetch上报
      const value = this.beacon(dsn, result);
      if (!value) {
        return this.useImgUpload
          ? this.imgRequest(result, dsn)
          : this.xhrPost(result, dsn);
      }
    }
  }
}

const transportData =
  _support.transportData || (_support.transportData = new TransportData());
export { transportData };
