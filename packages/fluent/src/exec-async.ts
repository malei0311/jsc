import type { ChildProcess } from 'node:child_process';

import { spawn } from 'node:child_process';
import { inspect } from 'node:util';
import { noop, isNil } from '@x-jsc/shared';

type Resolve = (out: ExecResult) => void;

interface ExecResultParams {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  message: string;
}

export class ExecResult extends Error {
  public readonly exitCode: number | null;
  public readonly signal: NodeJS.Signals | null;
  public readonly stdout: string;
  public readonly stderr: string;

  constructor({ exitCode, signal, stdout, stderr, message }: ExecResultParams) {
    super(message);
    this.exitCode = exitCode;
    this.signal = signal;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  toJSON() {
    return {
      code: this.exitCode,
      signal: this.signal,
      stdout: this.stdout,
      stderr: this.stderr,
    };
  }

  toString() {
    return `ExecResult ${JSON.stringify(this.toJSON(), null, 2)}}`;
  }

  [inspect.custom]() {
    return this.toString();
  }
}

interface ExecOptions {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
}

interface ExecInternalOptions extends ExecOptions {
  resolve: Resolve;
  reject: Resolve;
}

class ExecPromise extends Promise<ExecResult> {
  private child!: ChildProcess;

  private command = '';
  private args: string[] = [];

  private resolve: Resolve = noop;
  private reject: Resolve = noop;

  run(options: ExecInternalOptions) {
    this.command = options.command;
    this.args = options.args || [];
    this.resolve = options.resolve;
    this.reject = options.reject;

    this.child = spawn(this.command, this.args, {
      cwd: options.cwd || process.cwd(),
      shell: false,
      stdio: 'pipe',
      windowsHide: true,
      timeout: options.timeout,
    });

    this.handleEvents();
  }

  get stdin() {
    return this.child.stdin;
  }

  get stdout() {
    return this.child.stdout;
  }

  get stderr() {
    return this.child.stderr;
  }

  get exitCode(): Promise<number | null> {
    return this.then(
      (p) => p.exitCode,
      (p) => p.exitCode,
    );
  }

  kill(signal: NodeJS.Signals = 'SIGTERM') {
    this.child.kill(signal);
  }

  private handleEvents() {
    let stdout = '';
    let stderr = '';

    this.child.on('close', (code, signal) => {
      let message = `exit code: ${code}`;
      if (code !== 0 || !isNil(signal)) {
        message = `${stderr || '\n'}`;
        message += `\n    exit code: ${code}`;
        if (!isNil(signal)) {
          message += `\n    signal: ${signal}`;
        }
      }
      const result = new ExecResult({ exitCode: code, signal, stdout, stderr, message });
      if (code === 0) {
        this.resolve(result);
      } else {
        this.reject(result);
      }
    });

    this.child.on('error', (err: NodeJS.ErrnoException) => {
      const message = `${err.message}\n    errno: ${err.errno}\n    code: ${err.code}\n`;
      this.reject(new ExecResult({ exitCode: null, signal: null, stdout, stderr, message }));
    });

    this.child.stdout?.on('data', (data: any) => {
      stdout += data;
    });

    this.child.stderr?.on('data', (data: any) => {
      stderr += data;
    });
  }
}

export function execAsync(options: ExecOptions) {
  let resolve: Resolve = noop;
  let reject: Resolve = noop;
  const promise = new ExecPromise((...args) => {
    [resolve, reject] = args;
  });
  promise.run({
    ...options,
    resolve,
    reject,
  });
  return promise;
}
