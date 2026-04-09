import { activeSub, ReactiveEffect } from "./effect";
import { trackRef, triggerRef } from "./system";

enum ReactivityFlags {
  IS_REF = "__v_isRef",
}

export interface Link {
  sub: ReactiveEffect;
  nextSub: Link | undefined;
  prevSub: Link | undefined;
}

export class RefImpl {
  _value: any;

  [ReactivityFlags.IS_REF] = true;

  //   头结点
  subs: Link | undefined;

  //   尾结点
  subsTail: Link | undefined;

  constructor(value) {
    this._value = value;
  }

  get value() {
    if (activeSub) {
      trackRef(this);
    }
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
    triggerRef(this);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(val: any): boolean {
  return val[ReactivityFlags.IS_REF];
}
