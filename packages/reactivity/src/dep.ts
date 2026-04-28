import { activeSub } from "./effect";
import { targetMap } from "./reactive";
import { link, propagate, Link } from "./system";

export function track(target: object, key: string | symbol) {
  if (!activeSub) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }

  link(dep, activeSub);
}
export function trigger(target: object | Array<any>, key: string | symbol) {
  const depsMap = targetMap.get(target);

  if (!depsMap) return;

  /**
   * arr = [1,2,3,4]
   * 更新数组前的的length = 4
   * 更新后的length = 2
   * 如果访问了3，4那么需要触发effect执行，也就是访问了 >= 2的索引的effect
   */

  if (Array.isArray(target) && key.toString() === "length") {
    const length = target.length || 0;
    depsMap.forEach((dep, depKey) => {
      // 如果depKey大于等于length，或者depKey是length，那么需要触发effect执行
      if (depKey >= length || depKey === "length") {
        propagate(dep.subs);
      }
    });
  } else {
    const dep = depsMap.get(key);
    if (!dep) return;

    propagate(dep.subs);
  }
}
class Dep {
  subs: Link | undefined;
  subsTail: Link | undefined;

  constructor() {}
}
