import { Link } from "./ref";

// 链接链表关系
export function link(dep, sub) {
  const newLink: Link = {
    sub: sub,
    next: undefined,
    prev: undefined,
    dep: dep,
    nextDep: undefined,
  };

  // 如果dep和sub创建过关联关系那就不用创建新的link节点了

  const currentDep = sub.depsTail;

  console.log("-------", sub.deps, sub.depsTail);

  /**
   * 复用节点的两种情况
   * 1. sub中的depsTail为undefined，并且sub的deps有，表示复用头结点
   */

  if (currentDep === undefined && sub.deps) {
    if (sub.deps.dep === dep) {
      return;
    }
  }

  /**
   * 链表和dep关联链表
   */
  if (dep.subsTail) {
    dep.subsTail.next = newLink;
    newLink.prev = dep.subsTail;
    dep.subsTail = newLink;
  } else {
    dep.subs = newLink;
    dep.subsTail = newLink;
  }

  /**
   * 将链表和sub建立关系
   */
  if (sub.depsTail) {
    sub.depsTail.next = newLink;
    sub.depsTail = newLink;
  } else {
    console.log("sub.depsTail");
    sub.deps = newLink;
    sub.depsTail = newLink;
  }
}
export function propagate(subs) {
  let link = subs;

  let queueEffects = [];

  while (link) {
    if (link.sub) {
      queueEffects.push(link.sub);
    }
    link = link.next;
  }

  queueEffects.forEach((effect) => {
    effect.notify();
  });
}
