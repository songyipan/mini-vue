export let activeSub;

export class ReactiveEffect {
  constructor(public fn: Function) {}

  run() {
    let prevActiveSub = activeSub;
    activeSub = this;

    try {
      return this.fn();
    } finally {
      activeSub = prevActiveSub;
    }
  }

  notify() {
    this.scheduler();
  }

  scheduler() {
    this.run();
  }
}

export function effect(fn: () => void, options?: { scheduler?: () => void }) {
  const e = new ReactiveEffect(fn);
  Object.assign(e, options);
  e.run();

  const runner = e.run.bind(e);
  runner.effect = e;
  return runner;
}
