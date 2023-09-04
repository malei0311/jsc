import fs from 'fs';
import fsPromise from 'fs/promises';

export function isFileSync(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (ignored) {
    return false;
  }
}

export function isFile(filePath: string) {
  return fsPromise
    .stat(filePath)
    .then((stats) => stats.isFile())
    .catch(() => false);
}

export function readJSONSync<T = any>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}
