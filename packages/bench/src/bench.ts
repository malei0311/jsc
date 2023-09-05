import type { TaskFn } from './task';
import { Task } from './task';

interface BenchOptions {
  time?: number;
  iterations?: number;
  warmupTime?: number;
  autoWarmup?: boolean;
  now?: () => number;
}

function now() {
  return Date.now();
}

function noop() {}

export class Bench {
  private _tasks = new Map<string, Task>();
  time: number;
  iterations: number;
  warmupTime: number;
  autoWarmup: boolean;
  now: () => number;

  constructor(options: BenchOptions = {}) {
    this.now = options.now || now;
    this.time = options.time || 500;
    this.iterations = options.iterations || 100000;
    this.warmupTime = options.warmupTime || 100;
    this.autoWarmup = options.autoWarmup || false;
  }

  run() {
    const tasks: Task[] = [];
    if (this.autoWarmup) {
      this.warmup();
    }
    for (const task of this._tasks.values()) {
      tasks.push(task.run(this));
    }
    return tasks;
  }

  // 针对 jit 代码预热，实际预热后依然误差较大，不过比不预热好多了
  // 实际 jsc 在手机上是不开启 jit 的，所以不用预热
  warmup() {
    for (const task of this._tasks.values()) {
      task.warmup(this);
    }
    const warm = new Task('warm', noop);
    warm.run(this);
  }

  reset() {
    this._tasks.forEach((task) => {
      task.reset();
    });
  }

  add(name: string, fn: TaskFn) {
    const task = new Task(name, fn);
    this._tasks.set(name, task);
    return this;
  }

  remove(name: string) {
    this._tasks.delete(name);
    return this;
  }

  get tasks(): Task[] {
    return [...this._tasks.values()];
  }
}
