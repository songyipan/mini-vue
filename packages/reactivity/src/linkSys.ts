import { Link } from "./ref";

// 链接链表关系
export function link(dep, sub) {
  // 如果dep和sub创建过关联关系那就不用创建新的link节点了

  const currentDep = sub.depsTail;

  /**
   * 复用节点的两种情况
   * 1. sub中的depsTail为undefined，并且sub的deps有，表示复用头结点
   */

  // if (currentDep === undefined && sub.deps) {
  //   if (sub.deps.dep === dep) {
  //     sub.depsTail = sub.deps;
  //     return;
  //   }
  // } else if (currentDep) {
  //   if (currentDep.nextDep?.dep === dep) {
  //     sub.depsTail = currentDep.nextDep;
  //     // 如果尾节点有并且尾结点还有nextDep就尝试复用尾结点的nextDep
  //     return;
  //   }
  // }

  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep;
  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep;
    return;
  }

  const newLink: Link = {
    sub: sub,
    nextSub: undefined,
    prevSub: undefined,
    dep: dep,
    nextDep,
  };

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

// 清理依赖
export function endTrack(sub) {
  const depsTail = sub.depsTail;
  // 第一中情况，depsTail有并且depsTail.nextDep有
  if (depsTail) {
    if (depsTail.nextDep) {
      // console.log("清理", depsTail.nextDep);
      clearTracking(depsTail.nextDep);
      depsTail.nextDep = undefined;
    }
  } else if (sub.deps) {
    console.log("从头开始删除", sub.deps);
    clearTracking(sub.deps);
    sub.deps = undefined;
  }
}

// 清理依赖关系
function clearTracking(link: Link) {
  while (link) {
    const { nextDep, nextSub, dep } = link;

    // 如果preSub 存在，则将preSub的nextSub指向当前节点的nextSub
    if (link.prevSub) {
      // 前后都有节点
      link.prevSub.nextSub = nextSub;
      link.nextSub = undefined;
    } else {
      // 此时是头结点
      dep.subs = nextSub;
    }

    if (nextDep) {
      nextDep.prevSub = link.prevSub;
      link.prevSub = undefined;
    } else {
      // 此时是尾结点
      dep.subsTail = link.prevSub;
    }

    link.dep = link.sub = undefined;
    link.nextDep = undefined;
    link = link.nextDep;
  }
}
