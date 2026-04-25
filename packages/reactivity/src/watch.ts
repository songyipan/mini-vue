import { ReactiveEffect } from "./effect";
import { isRef } from "./ref";
import { isReactive } from "./reactive";
export function watch(source, cb, options) {
  let { immediate = false, deep, once = false } = options || {};

  let getter;
  let oldValue;

  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    // 如果监听的是reactive那么默认是深监听
    getter = () => source;

    // 如果没有指定deep，默认是监听所有层级
    // 如果指定了deep，那么就监听指定的层级
    if (!deep) {
      deep = true;
    }
  } else if (typeof source === "function") {
    getter = source;
  }
  // 只监听一次
  if (once) {
    // 其实就是在执行完第一次之后调用了stop
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      stop();
    };
  }

  // 深层监听
  if (deep) {
    const baseGetter = getter;

    const depth = deep === true ? Infinity : deep;

    getter = () => traverse(baseGetter(), depth);
  }

  // 这是scheduler
  const job = () => {
    // 拿到最新的值，其实就是getter的返回值
    // 为什么不直接执行getter呢，因为要重新执行依赖收集
    const newValue = e.run();
    cb(newValue, oldValue);

    oldValue = newValue;
  };

  const e = new ReactiveEffect(getter);

  e.scheduler = job;

  if (immediate) {
    job();
  } else {
    // 如果是立即执行的就不用在保存旧的值和收集依赖了
    oldValue = e.run();
  }

  function stop() {
    e.stop();
  }

  return () => {
    stop();
  };
}

function traverse(value, depth = Infinity, seen = new Set()) {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return value;
  }

  // 防止循环引用爆栈
  if (seen.has(value)) {
    return value;
  }

  // 监听指定的层级的属性
  if (depth <= 0) {
    return value;
  }

  depth--;

  seen.add(value);

  for (const key in value) {
    traverse(value[key], depth, seen);
  }
  return value;
}
