import fs from 'fs';

export function isFileSync(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (ignored) {
    return false;
  }
}

export function readJSONSync<T = any>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}
