import { extend, isObject } from "@vue/shared/src";
import { reacdonly, reactive } from "./reactive";

// 实现拦截方法
// 是不是仅读，仅读的属性set报异常
// 是不是深度的

function createGetter(isReadonly = false, isShallow = false) {
  // 取值的时候通过代理对象去取：let proxy =reactive(),通过proxy去取，取值触发get方法
  // receiver 代理对象本身 //其实就是proxy
  return function get(target, key, receiver) {
    //proxy +Reflect  Reflect好处：后续object上的方法会被迁移到Reflect ，比如 object.getProptypeof
    // 以前target[key]=value 方式设置值可能会失败，并不会报异常，也没有返回值标志，但Reflect可以，Reflect方法具备返回值
    //Reflect（es6）可以不使用proxy，
    const res = Reflect.get(target, key, receiver); // 等价于target[key] // 固定的api ，反射，去proxy取值，它就吧原来的目标的值反射回去

    if (!isReadonly) {
      // 不是仅读的，收集依赖，等数据变化后更新视图
    }

    if (isShallow) {
      //浅的，直接返回，不用做处理，浅的只代理第一层
      return res;
    }

    if (isObject(res)) {
      //vue2是一上来递归，vue3是当取值的时候进行代理，vue3的代理模式是懒代理
      return isReadonly ? reacdonly(res) : reactive(res); // 递归
    }
    return res;
  };
} // 拦截获取功能

function createSetter(isShallow = false) {
  // 设置值时触发set方法
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver); // 等价于 target[key] =value
    return result;
  };
} // 拦截设置功能

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);

export const mutableHandlers = {
  get,
  set,
};

export const shallowReativeHandlers = {
  get: shallowGet,
  set: shallowSet,
};

let readonlyObj = {
  set: (target, key) => {
    console.warn(`set on key ${key} failed`);
    return true;
  },
};

export const reacdonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);
export const shallowReacdonlyhandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
