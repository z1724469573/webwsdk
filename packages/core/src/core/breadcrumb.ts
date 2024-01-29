import { BreadcrumbData, InitOptions } from '@webwsdk/types';
import { _support, getTimestamp, validateOption } from '@webwsdk/utils';
import { EVENTTYPES, BREADCRUMBTYPES } from '@webwsdk/common';

export class Breadcrumb {
  maxBreadcrumbs = 20; // 用户行为存放的最大长度
  stack: BreadcrumbData[];
  constructor() {
    this.stack = [];
  }
  push(data: BreadcrumbData): void {
    this.immediatePush(data);
  }
  immediatePush(data: BreadcrumbData): void {
    data.time || (data.time = getTimestamp());
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift();
    }
    this.stack.push(data);
    this.stack.sort((a, b) => a.time - b.time);
  }
  shift(): boolean {
    return this.stack.shift() !== undefined;
  }
  clear(): void {
    this.stack = [];
  }
  getStack(): BreadcrumbData[] {
    return this.stack;
  }
  getCategory(type: EVENTTYPES): BREADCRUMBTYPES {
    switch (type) {
      // 接口请求
      case EVENTTYPES.XHR:
      case EVENTTYPES.FETCH:
        return BREADCRUMBTYPES.HTTP;

      // 用户点击
      case EVENTTYPES.CLICK:
        return BREADCRUMBTYPES.CLICK;

      // 路由变化
      case EVENTTYPES.HISTORY:
      case EVENTTYPES.HASHCHANGE:
        return BREADCRUMBTYPES.ROUTE;

      // 加载资源
      case EVENTTYPES.RESOURCE:
        return BREADCRUMBTYPES.RESOURCE;

      // Js代码报错
      case EVENTTYPES.UNHANDLEDREJECTION:
      case EVENTTYPES.ERROR:
        return BREADCRUMBTYPES.CODEERROR;

      // 用户自定义
      default:
        return BREADCRUMBTYPES.CUSTOM;
    }
  }
  bindOptions(options: InitOptions): void {
    // maxBreadcrumbs 用户行为存放的最大容量
    const { maxBreadcrumbs } = options;
    validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') &&
      (this.maxBreadcrumbs = maxBreadcrumbs || 20);
  }
}
const breadcrumb =
  _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());
export { breadcrumb };
