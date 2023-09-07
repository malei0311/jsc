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

export interface TaskOptions {
  beforeAll?: (this: Task) => void;
  beforeEach?: (this: Task) => void;
  afterEach?: (this: Task) => void;
  afterAll?: (this: Task) => void;
}

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
  options: TaskOptions;
  result?: TaskResult;

  constructor(name: string, fn: TaskFn, options?: TaskOptions) {
    this.name = name;
    this.fn = fn;
    this.options = options || {};
  }

  runHook<Key extends keyof TaskOptions>(name: Key) {
    if (typeof this.options[name] === 'function') {
      (this.options[name] as Required<TaskOptions>[Key]).call(this);
    }
  }

  run(bench: Bench) {
    // NOTE: jsc 没有 nano time 的 api, 这里使用 micro time 代替
    let totalTime = 0;
    let runs = 0;
    const samples: number[] = [];
    this.runHook('beforeAll');

    try {
      while (totalTime < bench.time || runs < bench.iterations) {
        this.runHook('beforeEach');
        const startTime = bench.now();
        this.fn();
        const taskTime = bench.now() - startTime;
        samples.push(taskTime);
        runs += 1;
        totalTime += taskTime;
        this.runHook('afterEach');
      }
    } catch (err) {
      let fixedErr: Error;
      if (err instanceof Error) {
        fixedErr = err;
      } else {
        fixedErr = new Error(`${err}`, { cause: err });
      }
      this.runHook('afterAll');
      this.result = { error: fixedErr };
      return this;
    }
    this.runHook('afterAll');
    this.result = calcResult(totalTime, samples);
    return this;
  }

  warmup(bench: Bench) {
    this.runHook('beforeAll');
    try {
      const startTime = bench.now();
      while (bench.now() - startTime < bench.warmupTime) {
        this.runHook('beforeEach');
        this.fn();
        this.runHook('afterEach');
      }
    } catch (err) {
      // ignore
    }
    this.runHook('afterAll');
  }

  reset() {
    this.result = undefined;
  }
}
