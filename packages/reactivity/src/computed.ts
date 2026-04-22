import { activeSub, setActiveSub } from "./effect";
import { ReactivityFlags } from "./ref";
import { Dependency, link, Link, Sub, startTrack, endTrack } from "./system";

export function computed(
  getterOrOptions: Function | { getter: Function; setter: Function },
) {
  let getter: Function = null as any;
  let setter: Function = null as any;

  if (typeof getterOrOptions === "function") {
    // 只有一个函数说明就是一个getter属性，没有setter属性
    getter = getterOrOptions;
  } else if (typeof getterOrOptions === "object") {
    // 如果是一个对象，说明有getter和setter属性
    getter = getterOrOptions.getter;
    setter = getterOrOptions.setter;
  }

  return new ComputedRef(getter, setter);
}

export class ComputedRef implements Dependency, Sub {
  [ReactivityFlags.IS_REF] = true;

  //   保存fn的返回值
  _value: any;

  /**
   * 作为dep
   */
  //   头结点
  subs: Link | undefined;

  //   尾结点
  subsTail: Link | undefined;

  /**
   * 作为sub
   */
  //   头结点
  deps: Link | undefined;

  //   尾结点
  depsTail: Link | undefined;

  tracking = false;

  constructor(
    public fn: Function, // getter
    private setter: Function,
  ) {}

  update() {
    // 实现sub的功能，为了在执行fn期间，收集fn执行过程的中的dep
    // 建立起dep和sub的关联关系

    let prevActiveSub = activeSub;

    setActiveSub(this as any);

    // this.depsTail = undefined;
    startTrack(this as any);
    try {
      this._value = this.fn();
    } finally {
      endTrack(this as any);

      setActiveSub(prevActiveSub);
    }
  }

  get value() {
    this.update();

    if (activeSub) {
      link(this, activeSub);
    }

    return this._value;
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      console.warn("computed属性没有setter方法");
    }
  }
}
