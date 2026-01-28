import { Link } from "./ref";

// 链接链表关系
export function link(dep, sub) {
  const newLink: Link = {
    sub: sub,
    nextSub: undefined,
    prevSub: undefined,
    dep: dep,
    nextDep: undefined,
  };

  // 如果dep和sub创建过关联关系那就不用创建新的link节点了

  const currentDep = sub.depsTail;

  /**
   * 复用节点的两种情况
   * 1. sub中的depsTail为undefined，并且sub的deps有，表示复用头结点
   */

  if (currentDep === undefined && sub.deps) {
    if (sub.deps.dep === dep) {
      sub.depsTail = sub.deps;
      return;
    }
  } else if (currentDep) {
    if (currentDep.nextDep?.dep === dep) {
      sub.depsTail = currentDep.nextDep;
      // 如果尾节点有并且尾结点还有nextDep就尝试复用尾结点的nextDep
      return;
    }
  }

  /**
   * 链表和dep关联链表
   */
  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink;
    newLink.prevSub = dep.subsTail;
    dep.subsTail = newLink;
  } else {
    // console.log("链表和dep关联链表", dep);
    dep.subs = newLink;
    dep.subsTail = newLink;
  }

  /**
   * 将链表和sub建立关系
   */
  if (sub.depsTail) {
    console.log("将链表和sub建立关系", sub);
    sub.depsTail.nextDep = newLink;
    sub.depsTail = newLink;
  } else {
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
