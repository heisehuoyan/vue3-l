var VueReactivity = (function (exports) {
  'use strict';

  const isObject = (value) => typeof value == "object" && value != null;
  const extend = Object.assign; // 合并

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
  const mutableHandlers = {
      get,
      set,
  };
  const shallowReativeHandlers = {
      get: shallowGet,
      set: shallowSet,
  };
  let readonlyObj = {
      set: (target, key) => {
          console.warn(`set on key ${key} failed`);
          return true;
      },
  };
  const reacdonlyHandlers = extend({
      get: readonlyGet,
  }, readonlyObj);
  const shallowReacdonlyhandlers = extend({
      get: shallowReadonlyGet,
  }, readonlyObj);

  function reactive(target) {
      return createReativeObject(target, false, mutableHandlers);
  }
  function shallowReactive(target) {
      return createReativeObject(target, false, shallowReativeHandlers);
  }
  function reacdonly(target) {
      debugger;
      return createReativeObject(target, true, reacdonlyHandlers);
  }
  function shallowReacdonly(target) {
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
      if (!isObject(target))
          return target;
      // 如果某个对象已经被代理过了，就不要再代理了 。。 代理了就直接吧代理过的结果直接返回，可能一个对象被代理深度，又被仅读代理
      const proxyMap = isReadonly ? reacdonlyMap : reactiveMap; //代理的映射表
      const exitProxy = proxyMap.get(target); //判断是否被代理
      if (exitProxy)
          return exitProxy; // 如果已经被代理了，就直接返回结果
      const proxy = new Proxy(target, baseHandles);
      proxyMap.set(target, proxy); // 缓存proxy,表示target被代理了，：将代理对象和对应的结果缓存起来
      return proxy;
  }

  exports.reacdonly = reacdonly;
  exports.reactive = reactive;
  exports.shallowReacdonly = shallowReacdonly;
  exports.shallowReactive = shallowReactive;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
//# sourceMappingURL=reactivity.global.js.map
