import { ErrorTarget, HttpData } from '@webwsdk/types';
import ErrorStackParser from 'error-stack-parser';
import { EVENTTYPES, STATUS_CODE } from '@webwsdk/common';
import { getTimestamp, unknownToString } from '@webwsdk/utils';
import { httpTransform } from './transformData';

const HandleEvents = {
  handleError(ev: ErrorTarget): void {
    const target = ev.target;
    if (!target || (ev.target && !ev.target.localName)) {
      // vue和react捕获的报错使用ev解析，异步错误使用ev.error解析
      const stackFrame = ErrorStackParser.parse(!target ? ev : ev.error)[0];
      const { fileName, columnNumber, lineNumber } = stackFrame;
      const errorData = {
        type: EVENTTYPES.ERROR,
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        message: ev.message,
        fileName,
        line: lineNumber,
        column: columnNumber
      };
    }
  },
  handleUnhandleRejection(ev: PromiseRejectionEvent): void {
    const stackFrame = ErrorStackParser.parse(ev.reason)[0];
    const { fileName, columnNumber, lineNumber } = stackFrame;
    const message = unknownToString(ev.reason.message || ev.reason.stack);
    const data = {
      type: EVENTTYPES.UNHANDLEDREJECTION,
      status: STATUS_CODE.ERROR,
      time: getTimestamp(),
      message,
      fileName,
      line: lineNumber,
      column: columnNumber
    };
  },
  // 处理xhr、fetch回调
  handleHttp(data: HttpData, type: EVENTTYPES): void {
    const result = httpTransform(data);
    console.log(result);
  }
};
export { HandleEvents };
