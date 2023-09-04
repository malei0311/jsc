import path from 'path';
import { isFile } from '@jsc/shared';
import { execAsync, ExecResult } from './exec-async';
import { JSCError, ERROR_TYPE } from './error';

interface JSCCommandOptions {
  cwd: string;
  timeout?: number;
  isThrowExecResult?: boolean;
  // jsc binary path
  jscPath?: string;
  // files and arguments
  files: string[];
  args: string[];
  // other options
  strictFiles: string[];
  moduleFiles: string[];
  evalCodes: string[];
  profileFilePath?: string;
}

const JSC_PATH = 'JSC_PATH';

function identity<T>(o: T): T {
  return o;
}

function injectOption<T extends string>(arr: T[], option: T, mapper = identity<T>) {
  return arr.map((item) => {
    return `${option}=${mapper(item)}`;
  });
}

export class JSCCommand {
  private options: JSCCommandOptions = {
    cwd: process.cwd(),
    isThrowExecResult: true,
    files: [],
    args: [],
    strictFiles: [],
    moduleFiles: [],
    evalCodes: [],
  };

  cwd(cwd: string) {
    this.options.cwd = path.resolve(cwd);
    return this;
  }

  timeout(timeout: number) {
    this.options.timeout = timeout;
    return this;
  }

  isThrowExecResult(isThrow: boolean) {
    this.options.isThrowExecResult = !!isThrow;
    return this;
  }

  path(jscPath: string) {
    this.options.jscPath = jscPath;
    return this;
  }

  file(filePath: string) {
    this.options.files = [filePath].filter(Boolean);
    return this;
  }

  files(...filePaths: string[]) {
    this.options.files = filePaths.filter(Boolean);
    return this;
  }

  args(...args: string[]) {
    this.options.args = args.filter(Boolean);
    return this;
  }

  strictFile(filePath: string) {
    this.options.strictFiles = [filePath].filter(Boolean);
    return this;
  }

  strictFiles(...filePaths: string[]) {
    this.options.strictFiles = filePaths.filter(Boolean);
    return this;
  }

  moduleFile(filePath: string) {
    this.options.moduleFiles = [filePath].filter(Boolean);
    return this;
  }

  moduleFiles(...filePaths: string[]) {
    this.options.moduleFiles = filePaths.filter(Boolean);
    return this;
  }

  evalCode(code: string) {
    this.options.evalCodes = [code].filter(Boolean);
    return this;
  }

  evalCodes(...codes: string[]) {
    this.options.evalCodes = codes.filter(Boolean);
    return this;
  }

  profileFilePath(filePath: string) {
    this.options.profileFilePath = filePath;
    return this;
  }

  private async resolveCommand() {
    let { jscPath } = this.options;
    if (!jscPath) {
      jscPath = process.env[JSC_PATH];
    }
    if (!jscPath) {
      throw JSCError.create(ERROR_TYPE.E_JSC_PATH_NOT_SPECIFIED);
    }
    jscPath = path.resolve(this.options.cwd, jscPath);
    const isFileExists = await isFile(jscPath);
    if (!isFileExists) {
      throw JSCError.create(ERROR_TYPE.E_JSC_PATH_NOT_FOUND);
    }
    return jscPath;
  }

  private resolveCommandArgs() {
    // jsc [options] [files] [-- arguments]
    const { files, args, strictFiles, moduleFiles, evalCodes, profileFilePath } = this.options;
    const allFiles = files.concat(strictFiles).concat(moduleFiles);
    if (!allFiles.length && !evalCodes.length) {
      throw JSCError.create(ERROR_TYPE.E_JSC_FILES_OR_CODE_NOT_SPECIFIED);
    }
    const filePathMapper = (filePath: string) => {
      return path.resolve(this.options.cwd, filePath);
    };
    const commandArgs = [];
    if (profileFilePath) {
      commandArgs.push('-p');
      commandArgs.push(filePathMapper(profileFilePath));
    }
    const strictFilesArgs = injectOption(strictFiles, '--strict-file', filePathMapper);
    const moduleFilesArgs = injectOption(moduleFiles, '--module-file', filePathMapper);
    const filesArgs = files.map(filePathMapper);
    if (args.length) {
      args.unshift('--');
    }
    return commandArgs.concat(evalCodes, strictFilesArgs, moduleFilesArgs, filesArgs, args);
  }

  async run() {
    try {
      const command = await this.resolveCommand();
      const args = this.resolveCommandArgs();
      const result = await execAsync({
        command,
        args,
        cwd: this.options.cwd,
        timeout: this.options.timeout,
      });
      return result;
    } catch (err: any) {
      if (err instanceof JSCError) {
        throw err;
      }
      if (err instanceof ExecResult) {
        if (this.options.isThrowExecResult) {
          throw err;
        }
        return err;
      }
      throw JSCError.create(ERROR_TYPE.E_JSC_EXEC_FAILED, {
        message: err?.message,
        cause: err,
      });
    }
  }
}
