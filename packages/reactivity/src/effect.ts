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

  // 这个是防止循环依赖导致的死循环
  /**
   * 例如
   * const num = ref(0)
   * effect(() => num.value + 1)
   * 以上代码会导致死循环
   */
  tracking = false;

  active = true;

  run() {
    let prevActiveSub = activeSub;

    setActiveSub(this);

    // 如果在未激活状态下还访问run函数了那就不收集依赖了直接当普通函数执行
    if (!this.active) {
      return this.fn();
    }

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

  stop() {
    if (this.active) {
      // 先执行startTrack，再执行endTrack，这样做是为了触发清理所用的依赖的逻辑函数clearTracking(sub.deps);
      startTrack(this);
      endTrack(this);
      this.active = false;
    }
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
