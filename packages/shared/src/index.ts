const op = Object.prototype;

export function isArray(arr: any) {
  return op.toString.call(arr) === '[object Array]';
}

export function noop() {}
