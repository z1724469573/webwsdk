import { Callback } from 'packages/types/src';
import { variableTypeDetection } from './verifyType';

/**
 * 添加事件监听器
 * ../export
 * ../param {{ addEventListener: Function }} target
 * ../param {keyof TotalEventName} eventName
 * ../param {Function} handler
 * ../param {(boolean | Object)} opitons
 * ../returns
 */
export function on(
  target: any,
  eventName: string,
  handler: Callback,
  opitons = false
) {
  target.addEventListener(eventName, handler, opitons);
}

// 获取当前的时间戳
export function getTimestamp(): number {
  return Date.now();
}

export function typeofAny(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}

// 验证选项的类型
export function validateOption(
  target: any,
  targetName: string,
  expectType: string
): any {
  if (!target) return false;
  if (typeofAny(target) === expectType) return true;
  console.error(
    `web-see: ${targetName}期望传入${expectType}类型，目前是${typeofAny(target)}类型`
  );
}

export function unknownToString(target: unknown): string {
  if (variableTypeDetection.isString(target)) {
    return target as string;
  }
  if (variableTypeDetection.isUndefined(target)) {
    return 'undefined';
  }
  return JSON.stringify(target);
}
