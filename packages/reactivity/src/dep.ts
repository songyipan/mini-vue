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
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  propagate(dep.subs);
}
class Dep {
  subs: Link | undefined;
  subsTail: Link | undefined;

  constructor() {}
}
