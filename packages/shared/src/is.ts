import os from 'os';

export function isWindows() {
  return os.platform() === 'win32';
}

export function isUndefined(o: unknown): o is undefined {
  return o === undefined;
}

export function isNull(o: unknown): o is null {
  return o === null;
}

export function isNil(o: unknown): o is null | undefined {
  return isUndefined(o) || isNull(o);
}
