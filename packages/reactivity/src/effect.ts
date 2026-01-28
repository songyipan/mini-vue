import { Link } from "./ref";

export let activeSub;

export class ReactiveEffect {
  constructor(public fn) {}

  // 依赖项链表的头
  deps: Link | undefined;

  // 链表的尾
  depsTail: Link | undefined;

  run() {
    // 先缓存
    const prevSub = activeSub;

    activeSub = this;

    // 标记 undefined表 表示被dep触发了重复执行，尝试复用link节点
    this.depsTail = undefined;
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
