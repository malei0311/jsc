import type { Bench } from './bench';

export type TaskFn = () => any;

interface TaskResultError {
  error: Error;
}

interface TaskResultSuccess {
  error?: null;
  totalTime: number;
  samples: number;
  hz: number;
  mean: number;
}

export type TaskResult = TaskResultSuccess | TaskResultError;

export class Task {
  name: string;
  fn: TaskFn;
  result?: TaskResult;

  constructor(name: string, fn: TaskFn) {
    this.name = name;
    this.fn = fn;
  }

  run(bench: Bench) {
    // NOTE: jsc 没有 nano time 的 api, 所以只计算总耗时
    let totalTime = 0; // ms
    let samples = 0;
    try {
      const startTime = bench.now();
      // 这里有点误差，不只是 fn 的执行时间, 由于不支持 nano time, 所以只能这样
      while (bench.now() - startTime < bench.time || samples < bench.iterations) {
        this.fn();
        samples += 1;
      }
      totalTime = bench.now() - startTime;
    } catch (err) {
      let fixedErr: Error;
      if (err instanceof Error) {
        fixedErr = err;
      } else {
        fixedErr = new Error(`${err}`, { cause: err });
      }
      this.result = { error: fixedErr };
      return this;
    }

    const mean = totalTime / samples;
    const hz = 1000 / mean;
    this.result = {
      totalTime,
      samples,
      mean,
      hz,
    };
    return this;
  }

  warmup(bench: Bench) {
    try {
      const startTime = bench.now();
      while (bench.now() - startTime < bench.warmupTime) {
        this.fn();
      }
    } catch (err) {
      // ignore
    }
  }

  reset() {
    this.result = undefined;
  }
}
