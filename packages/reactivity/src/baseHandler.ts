import { isRef } from "vue";
import { track, trigger } from "./dep";
import { reactive } from "./reactive";

export function mutableObj() {
  return {
    // 收集依赖，绑定对象中的某一个key和sub间的联系
    get(target, key, receiver) {
      track(target, key);

      const result = Reflect.get(target, key, receiver);

      /**
       * const name = ref("xiaosong");
       * const info = reactive({name});
       *
       * 不用再 .value了
       * console.log(info.name);
       *
       */
      if (isRef(result)) {
        return result.value;
      }

      if (typeof result === "object" && result !== null) {
        // 如果result是一个对象，那么就递归地调用reactive函数，将其转换为响应式对象
        return reactive(result);
      }

      return result;
    },

    // 触发依赖，通知订阅者更新
    set(target, key, newValue, receiver) {
      const oldValue = target[key];

      const result = Reflect.set(target, key, newValue, receiver);

      /**
       *如果值是一个ref，并且新的值不是ref，那么就会修改ref的value
       * 例如：const name = ref("xiaosong");
       * const info = reactive({name});
       * info.name = "liuyue";
       * console.log(info.name);
       * 会输出：liuyue
       */
      if (isRef(newValue) && !isRef(oldValue)) {
        newValue.value = oldValue;

        // 这里之所以返回result，是因为ref的value是响应式的对象，所以需要触发依赖，后面就不用再触发依赖
        return result;
      }

      // 如果新值和旧值相同，直接返回
      if (newValue !== oldValue) {
        //   先赋值在执行trigger
        trigger(target, key);
      }

      return result;
    },
  };
}
