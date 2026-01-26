export let activeSub;

export class ReactiveEffect {
  constructor(public fn) {}

  run() {
    // 先缓存
    const prevSub = activeSub;

    activeSub = this;
    try {
      return this.fn();
    } finally {
      //   恢复
      activeSub = prevSub;
    }
  }

  notify() {
    this.scheduler();
  }

  // 调度器
  scheduler() {
    this.run();
  }
}

export function effect(fn: Function, options) {
  const e = new ReactiveEffect(fn);
  Object.assign(e, options);

  e.run();
  const runner = () => e.run();

  runner.effect = e;

  return runner;
}
