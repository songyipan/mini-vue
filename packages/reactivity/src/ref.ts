import { activeSub, ReactiveEffect } from "./effect";
import { link, propagate } from "./linkSys";

enum RefImplType {
  IS_REF = "__is_ref",
}

export interface Link {
  sub: ReactiveEffect;
  // 下一个订阅者节点
  nextSub: Link | undefined;
  // 上一个订阅者节点
  prevSub: Link | undefined;
  dep: RefImp;
  nextDep: RefImp;
}

class RefImp {
  __value: any;

  [RefImplType.IS_REF] = true;

  //   头结点  存储订阅者
  subs: Link;

  //   尾结点   存储订阅者
  subsTail: Link;

  constructor(value) {
    this.__value = value;
  }

  get value() {
    if (activeSub) {
      trackRef(this);
    }
    return this.__value;
  }

  set value(newValue) {
    this.__value = newValue;
    triggerRef(this);
  }
}

export function isRef(ref) {
  return !!ref[RefImplType.IS_REF];
}

export function ref(value) {
  return new RefImp(value);
}

// 收集订阅者
export function trackRef(dep) {
  if (activeSub) {
    link(dep, activeSub);
  }
}

// 触发订阅者
export function triggerRef(dep) {
  if (dep.subs) {
    propagate(dep.subs);
  }
}
