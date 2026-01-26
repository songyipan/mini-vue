import { Link } from "./ref";

// 链接链表关系
export function link(dep, sub) {
  const newLink: Link = {
    sub: sub,
    next: undefined,
    prev: undefined,
  };

  /**
   * 关联链表
   */
  if (dep.subsTail) {
    dep.subsTail.next = newLink;
    newLink.prev = dep.subsTail;
    dep.subsTail = newLink;
  } else {
    dep.subs = newLink;
    dep.subsTail = newLink;
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
