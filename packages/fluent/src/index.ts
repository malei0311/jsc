import { JSCCommand } from './command';

export { JSCCommand };

export function jsc() {
  return new JSCCommand();
}
