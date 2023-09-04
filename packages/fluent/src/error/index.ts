import { inspect } from 'node:util';
import { ERROR_TYPE, ERROR_CONFIG } from './config';

interface JSCErrorParams {
  type: string;
  code: number;
  message: string;
  cause?: Error;
}

interface CreateJSCErrorOptions {
  message?: string;
  isAppend?: boolean;
  cause?: Error;
}

export { ERROR_TYPE };

export class JSCError extends Error {
  public type: string;
  public code: number;
  public cause?: Error;

  constructor({ type, message, code, cause }: JSCErrorParams) {
    super(message);
    this.type = type;
    this.code = code;
    this.cause = cause;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      type: this.type,
      code: this.code,
      cause: this.cause?.toString(),
    };
  }

  toString() {
    return `JSCError ${JSON.stringify(this.toJSON(), null, 2)}`;
  }

  [inspect.custom]() {
    return this.toString();
  }

  static create(
    type: ERROR_TYPE,
    { message = '', isAppend = false, cause }: CreateJSCErrorOptions = {},
  ) {
    let tmpType = type;
    let conf = ERROR_CONFIG[tmpType];
    if (!conf) {
      tmpType = ERROR_TYPE.E_UNKNOWN;
      conf = ERROR_CONFIG[tmpType];
    }
    return new JSCError({
      type: tmpType,
      message: isAppend && message ? `${conf[1]}: ${message}` : message || conf[1],
      code: conf[0],
      cause,
    });
  }
}
