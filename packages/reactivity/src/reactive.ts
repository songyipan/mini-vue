import { mutableObj } from "./baseHandler";

export function reactive<T>(target: T): T {
  return createReactiveObject(target);
}

// 保存target和响应式对象的映射关系
const reactiveMap = new WeakMap();

// 保存所有使用reactive创建出来的响应式对象
const reactiveSet = new WeakSet();

function createReactiveObject<T>(target: T): T {
  if (typeof target !== "object" || target === null) {
    return target;
  }

  // 看一下target在不在reactiveSet中，如果在，直接返回target
  // 证明target本来就是响应式对象，不需要再创建响应式对象
  if (reactiveSet.has(target)) {
    return target;
  }

  // 如果target已经存在响应式对象，直接返回
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    // 如果target已经存在响应式对象，直接返回
    return existingProxy;
  }

  //   receiver是为了保证保证访问器中的this指向代理对象
  //   例如：{name: "xiaosong", get name() {return this.name}}
  //   这里get方法中的this指向代理对象，而不是obj
  //    否则会导致get方法中的this指向obj，而不是代理对象。这样就不会触发依赖
  //   其作用就是可以改变访问器中的this指向
  const proxy = new Proxy(target, mutableObj());

  // 保存所有使用reactive创建出来的响应式对象
  reactiveSet.add(proxy);

  // 保存target和响应式对象的映射关系
  // 目的是防止重复创建响应式对象
  // 比如说：{name: "xiaosong", age: 18}
  // 如果我们调用了reactive(obj)两次，那么就会创建两次响应式对象
  // 所以我们需要保存target和响应式对象的映射关系
  // 这样我们就可以根据target来获取响应式对象
  reactiveMap.set(target, proxy);

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
export const targetMap = new WeakMap();

// 判断val是否是响应式对象，
// 只要在reactiveSet中，就是响应式对象
export function isReactive(val: any): boolean {
  return reactiveSet.has(val);
}
