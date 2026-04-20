import { activeSub } from "./effect";
import { Link, trackRef, triggerRef } from "./system";
import { reactive } from "./reactive";

enum ReactivityFlags {
  IS_REF = "__v_isRef",
}

export class RefImpl {
  _value: any;

  [ReactivityFlags.IS_REF] = true;

  //   头结点
  subs: Link | undefined;

  //   尾结点
  subsTail: Link | undefined;

  constructor(value) {
    // 如果value是一个对象
    if (typeof value === "object" && value !== null) {
      value = reactive(value);
    }
    this._value = value;
  }

  get value() {
    if (activeSub) {
      trackRef(this);
    }
    return this._value;
  }

  set value(newValue) {
    const oldValue = this._value;

    if (typeof newValue === "object" && newValue !== null) {
      newValue = reactive(newValue);
    }
    this._value = newValue;

    // 如果新值和旧值相同，直接返回
    if (newValue !== oldValue) {
      triggerRef(this);
    }
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(val: any): boolean {
  return val[ReactivityFlags.IS_REF];
}
