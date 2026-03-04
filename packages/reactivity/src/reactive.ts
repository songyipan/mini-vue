import { isObject } from "@vue/shared";
import { link, propagate } from "./linkSys";
import { Link } from "./ref";
import { activeSub } from "./effect";

export function reactive(target: object) {
  return createReactiveObject(target);
}

function createReactiveObject(target: object) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key);
      const res = Reflect.get(target, key, receiver);

      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      //   触发依赖
      trigger(target, key);
      return res;
    },
  });

  return proxy;
}

const targetMap = new WeakMap();

/**
 * targetMap = {
 *   target: {
 *     key: DepReactive,
 *   }
 * }
 */

// 收集依赖
function track(target: object, key: string | symbol) {
  let depsMap = targetMap.get(target);

  if (!activeSub) {
    return;
  }

  // 如果之前没收集过这个target，就初始化一个map
  if (!depsMap) {
    depsMap = new Map();

    // 保存这个target的依赖map
    targetMap.set(target, depsMap);
  }

  let depReactive = depsMap.get(key);

  // 如果之前没收集过这个key，就初始化一个DepReactive
  if (!depReactive) {
    depReactive = new DepReactive();
    depsMap.set(key, depReactive);
  }

  link(depReactive, activeSub);
}

function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const depReactive = depsMap.get(key);
  if (!depReactive) {
    return;
  }

  propagate(depReactive);
}

class DepReactive {
  constructor() {}

  sub: Link;
  subsTail: Link;
}
