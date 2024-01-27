import { ErrorTarget } from '@webwsdk/types';
import ErrorStackParser from 'error-stack-parser';
import { EVENTTYPES, STATUS_CODE } from '@webwsdk/common';
import { getTimestamp } from '@webwsdk/utils';

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
      console.log('errorData', errorData);
    }
  }
};
export { HandleEvents };
