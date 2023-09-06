import type { Bench } from './bench';

export type TaskFn = () => any;

interface TaskResultError {
  error: Error;
}

interface TaskResultSuccess {
  error?: null;
  totalTime: number;
  samples: number;
  mean: number;
  hz: number;
  min: number;
  max: number;
  p75: number;
  p99: number;
  p995: number;
  p999: number;
}

export type TaskResult = TaskResultSuccess | TaskResultError;

function calcResult(totalTime: number, samples: number[]): TaskResultSuccess {
  samples.sort((a, b) => a - b);
  const len = samples.length;
  const mean = totalTime / len;
  const hz = 1000 / mean;

  const min = samples[0];
  const max = samples[len - 1];
  const p75 = samples[Math.ceil(samples.length * (75 / 100)) - 1];
  const p99 = samples[Math.ceil(samples.length * (99 / 100)) - 1];
  const p995 = samples[Math.ceil(samples.length * (99.5 / 100)) - 1];
  const p999 = samples[Math.ceil(samples.length * (99.9 / 100)) - 1];

  return {
    totalTime,
    samples: len,
    mean,
    hz,
    min,
    max,
    p75,
    p99,
    p995,
    p999,
  };
}

export class Task {
  name: string;
  fn: TaskFn;
  result?: TaskResult;

  constructor(name: string, fn: TaskFn) {
    this.name = name;
    this.fn = fn;
  }

  run(bench: Bench) {
    // NOTE: jsc 没有 nano time 的 api, 这里使用 micro time 代替
    let totalTime = 0;
    let runs = 0;
    const samples: number[] = [];
    try {
      while (totalTime < bench.time || runs < bench.iterations) {
        const startTime = bench.now();
        this.fn();
        const taskTime = bench.now() - startTime;
        samples.push(taskTime);
        runs += 1;
        totalTime += taskTime;
      }
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
    this.result = calcResult(totalTime, samples);
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
