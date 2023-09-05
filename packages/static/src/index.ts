import os from 'os';
import path from 'path';
import { isFileSync, readJSONSync } from '@x-jsc/shared';
import { fileURLToPath } from 'url';

type BinaryInfo =
  | {
      error: Error;
    }
  | {
      error: null;
      path: string;
      version: string;
    };

const platform = `${os.platform()}-${os.arch()}`;
const packageScope = '@x-jsc';
const packageName = `platform-${platform}`;
const dirname = path.dirname(fileURLToPath(import.meta.url));

function isPlatformSupported() {
  const staticPackageJson = readJSONSync(path.join(dirname, '../package.json'));
  return staticPackageJson.optionalDependencies[`${packageScope}/${packageName}`];
}

function getPossiblePaths() {
  return [
    // 与 static 平级
    path.resolve(dirname, '../../', packageName),
    // 在 static 的 node_modules 中
    path.resolve(dirname, '../node_modules', packageScope, packageName),
    // 最上层的 node_modules 中
    path.resolve(
      dirname.substring(0, dirname.indexOf('node_modules')),
      'node_modules',
      packageScope,
      packageName,
    ),
  ];
}

function getBinaryVersion(packagePath: string): string {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = readJSONSync(packageJsonPath);
  return packageJson.jsc || packageJson.version;
}

function sniffBinaryInfo(): BinaryInfo {
  if (!isPlatformSupported()) {
    return {
      error: new Error(`[@x-jsc/static] unsupported platform: ${platform}`),
    };
  }

  const possiblePaths = getPossiblePaths();
  const binaryName = 'jsc';
  for (const packagePath of possiblePaths) {
    const packageBinaryPath = path.join(packagePath, binaryName);
    if (isFileSync(packageBinaryPath)) {
      return {
        error: null,
        path: packageBinaryPath,
        version: getBinaryVersion(packagePath),
      };
    }
  }

  return {
    error: new Error(
      `[@x-jsc/static] could not find jsc executable, tried: ${possiblePaths.join(', ')}`,
    ),
  };
}

export default sniffBinaryInfo();
