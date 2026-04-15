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
    nextDep,
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
} // 依赖项// 开始追踪依赖，将depsTail设为undefined
export function startTrack(sub: ReactiveEffect) {
  sub.depsTail = undefined;
}
// 结束追踪依赖，清理依赖链
export function endTrack(sub: ReactiveEffect) {
  const depsTail = sub.depsTail;

  // depsTail有并且有nextDep，才清理掉nextDep
  if (depsTail) {
    if (depsTail.nextDep) {
      console.log("清理掉他", depsTail.nextDep);
      clearTracking(depsTail.nextDep);
      depsTail.nextDep = undefined;
    }
  } else if (sub.deps) {
    console.log("从头开始删除", sub.deps);
    clearTracking(sub.deps);
    sub.deps = undefined;
  }
}
// 清理依赖的函数
function clearTracking(link: Link) {
  while (link) {
    const { nextDep, prevSub, nextSub, dep } = link;

    /**
     * 当 prevSub 存在时：
        - 说明当前 link 不是订阅者列表的第一个节点
        - 将前一个节点的 nextSub 指向当前节点的下一个节点（ nextSub ）
        - 将当前节点的 nextSub 设为 undefined ，便于垃圾回收
        当 prevSub 不存在时：
 
        - 说明当前 link 是订阅者列表的第一个节点
        - 直接将依赖的 subs （订阅者列表头）指向当前节点的下一个节点（ nextSub ）
     */
    if (prevSub) {
      prevSub.nextSub = nextSub;
      link.nextSub = undefined;
    } else {
      dep.subs = nextSub;
    }

    link.dep = link.sub = undefined;

    link = nextDep;
  }
}
