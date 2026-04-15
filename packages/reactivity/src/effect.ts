import { endTrack, Link, startTrack } from "./system";
import { RefImpl } from "./ref";

export let activeSub;

export class ReactiveEffect {
  constructor(public fn: Function) {}

  deps: Link | undefined;

  depsTail: Link | undefined;

  run() {
    let prevActiveSub = activeSub;
    activeSub = this;
    // this.depsTail = undefined;
    startTrack(this);
    try {
      return this.fn();
    } finally {
      // if (this.depsTail.nextDep) {
      //   console.log("清理掉他", this.depsTail.nextDep);
      // }
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
