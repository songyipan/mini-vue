import { endTrack, Link, startTrack } from "./system";
import { RefImpl } from "./ref";

export let activeSub;

export function setActiveSub(sub: ReactiveEffect | undefined) {
  activeSub = sub;
}

export class ReactiveEffect {
  constructor(public fn: Function) {}

  deps: Link | undefined;

  depsTail: Link | undefined;

  tracking = false;

  run() {
    let prevActiveSub = activeSub;

    setActiveSub(this);

    startTrack(this);
    try {
      return this.fn();
    } finally {
      endTrack(this);
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
