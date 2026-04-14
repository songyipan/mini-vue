import { activeSub, ReactiveEffect } from "./effect";
import { RefImpl } from "./ref";

export interface Dep {
  subs: Link | undefined;
  subsTail: Link | undefined;
}
// 订阅者

// export interface Sub {
//   deps: Link | undefined;
//   depsTail: Link | undefined;
// }

export interface Link {
  sub: ReactiveEffect;
  dep: Dep;
  nextSub: Link | undefined;
  prevSub: Link | undefined;
  nextDep: Link | undefined;
}

export function trackRef(dep: RefImpl) {
  link(dep, activeSub);
}

export function triggerRef(dep: RefImpl) {
  if (dep.subs) {
    propagate(dep.subs);
  }
}

// 建立依赖和副作用函数的关联
export function link(dep: RefImpl, sub: ReactiveEffect) {
  const currentDep = sub.depsTail;

  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep;

  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep;
    return;
  }

  const newLink: Link = {
    sub,
    dep,
    prevSub: undefined,
    nextSub: undefined,
    nextDep: undefined,
  };

  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink;
    newLink.prevSub = dep.subsTail;
    dep.subsTail = newLink;
  } else {
    dep.subs = newLink;
    dep.subsTail = newLink;
  }

  // sub和dep的建立关联关系
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink;
    sub.depsTail = newLink;
  } else {
    sub.deps = newLink;
    sub.depsTail = newLink;
  }
}
function propagate(sub: Link | undefined) {
  let queueEffects: Link[] = [];

  let subs = sub;
  while (subs) {
    queueEffects.push(subs);
    subs = subs.nextSub;
  }
  queueEffects.forEach((item) => {
    item.sub.notify();
  });
} // 依赖项
