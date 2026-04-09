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
}

export function effect(fn: () => void) {
  const e = new ReactiveEffect(fn);
  e.run();
}
