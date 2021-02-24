import { isObject } from "@vue/shared/src";
import {
  mutableHandlers,
  shallowReativeHandlers,
  reacdonlyHandlers,
  shallowReacdonlyhandlers,
} from "./basehandlers";

export function reactive(target) {
  return createReativeObject(target, false, mutableHandlers);
}
export function shallowReactive(target) {
  return createReativeObject(target, false, shallowReativeHandlers);
}
export function reacdonly(target) {
  return createReativeObject(target, true, reacdonlyHandlers);
}
export function shallowReacdonly(target) {
  return createReativeObject(target, true, shallowReacdonlyhandlers);
}

// 创建两个存储空间
const reactiveMap = new WeakMap(); // 会自动回收，不会造成内存泄漏，存储key只能是对象
const reacdonlyMap = new WeakMap();

// 拦截的方式不同
// 是不是仅读，是不是深度，柯里化 new Proxy最核心是的就是拦截数据的读取和更改   get set

/**
 *
 * @param target // 目标对象
 * @param isReadonly //是否仅读
 * @param baseHandles //拦截函数
 */
function createReativeObject(target, isReadonly, baseHandles) {
  // 如果目标不是对象，没法拦截，reactive这个api只能拦截对象类型
  if (!isObject(target)) return target;

  // 如果某个对象已经被代理过了，就不要再代理了 。。 代理了就直接吧代理过的结果直接返回，可能一个对象被代理深度，又被仅读代理

  const proxyMap = isReadonly ? reacdonlyMap : reactiveMap; //代理的映射表

  const exitProxy = proxyMap.get(target); //判断是否被代理
  if (exitProxy) return exitProxy; // 如果已经被代理了，就直接返回结果

  const proxy = new Proxy(target, baseHandles);
  proxyMap.set(target, proxy); // 缓存proxy,表示target被代理了，：将代理对象和对应的结果缓存起来

  return proxy;
}
