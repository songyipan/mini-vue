import { activeSub, ReactiveEffect } from "./effect";
import { RefImpl, Link } from "./ref";

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
  if (activeSub) {
    const newLink: Link = {
      sub: sub,
      prevSub: undefined,
      nextSub: undefined,
    };

    if (dep.subsTail) {
      dep.subsTail.nextSub = newLink;
      newLink.prevSub = dep.subsTail;
      dep.subsTail = newLink;
    } else {
      dep.subs = newLink;
      dep.subsTail = newLink;
    }
  }
}
function propagate(sub: Link) {
  let queueEffects: Link[] = [];

  let subs = sub;
  while (subs) {
    queueEffects.push(subs);
    subs = subs.nextSub;
  }
  queueEffects.forEach((item) => {
    item.sub.run();
  });
}
