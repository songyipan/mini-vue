import { activeSub } from "./effect";
import { Link, link, propagate } from "./system";
import { RefImpl } from "./ref";

export function reactive<T>(target: T): T {
  return createReactiveObject(target);
}

function createReactiveObject<T>(target: T): T {
  if (typeof target !== "object" || target === null) {
    return target;
  }

  //   receiver是为了保证保证访问器中的this指向代理对象
  //   例如：{name: "xiaosong", get name() {return this.name}}
  //   这里get方法中的this指向代理对象，而不是obj
  //    否则会导致get方法中的this指向obj，而不是代理对象。这样就不会触发依赖
  //   其作用就是可以改变访问器中的this指向
  const proxy = new Proxy(target, {
    // 收集依赖，绑定对象中的某一个key和sub间的联系
    get(target, key, receiver) {
      track(target, key);

      return Reflect.get(target, key, receiver);
    },

    // 触发依赖，通知订阅者更新
    set(target, key, newValue, receiver) {
      const result = Reflect.set(target, key, newValue, receiver);

      //   先赋值在执行trigger
      trigger(target, key);
      return result;
    },
  });

  return proxy;
}

/**
 * 这么一个需要代理的对象
 * obj: {name: "xiaosong", age: 18}
 * 那么targetMap结构如下
 * targetMap:{
 *  [obj]: {
 *    name: new Dep(),
 *    age: new Dep(),
 *   }:Map
 * }:WeakMap
 */
const targetMap = new WeakMap();

function track(target: object, key: string | symbol) {
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
  console.log("dep", dep);
}

function trigger(target: object, key: string | symbol) {
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
