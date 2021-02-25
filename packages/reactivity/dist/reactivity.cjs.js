'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (value) => typeof value == "object" && value != null;
const extend = Object.assign; // 合并

// 我们需要让这个effect变成响应的effect，可以做到数据变化的时候执行
function effect(fn, options = {}) {
    const effect = createReativitveEffect(fn, options);
    if (!options.lazy) {
        effect(fn, options); //响应式的effect 默认先执行一边
    }
    return effect;
}
let uid = 0; // 标示每个effect
let activeEffect; //存储当前的effect
const effectStack = [];
function createReativitveEffect(fn, options) {
    const effect = function reativitveEffect(fn, options) {
        if (!effectStack.includes(effect)) {
            // 保证effect没有加入到effectStack中，解决特殊情况2
            try {
                // 函数执行时可能发生异常
                effectStack.push(effect); // 入栈
                activeEffect = effect;
                return fn(); // 默认第一次执行,函数执行时取值，会执行get方法，让属性和effect产生关联，收集effects
            }
            finally {
                effectStack.pop(); // 出栈，
                activeEffect = effectStack[effectStack.length - 1]; //即每次取数组最后一个
            }
        }
    };
    effect.id = uid++; // 制作一个effect标识，用于区分effect
    effect.isEffect = true; // 用户标识这个是响应式effect
    effect.raw = fn; // 保存effect对应原本函数
    effect.options = options; // 保存选项
    return effect;
}
const targetMap = new WeakMap(); // 映射表
// 让某个对象中的属性收集当前他对应的effect函数
function track(target, type, key) {
    //activeEffect; // 可以拿到当前的effect
    //activeEffect 并不是收集所有，activeEffect有才收集
    if (activeEffect === undefined) {
        return;
    }
    // activeEffect有值，说明此属性在effect中使用，不在effect中使用的不需要收集依赖
    let depsMap = targetMap.get(target); // 取值，取到的是一个map，即value:name=>[effect,effect]
    if (!depsMap) {
        // 如果某个对象不存在这个值
        targetMap.set(target, (depsMap = new Map())); // 没有就把value往里放
    }
    let dep = depsMap.get(key); // 取值，即{name=>set}，检查map中有没有name属性，即重复的属性，一个effect可能对应多个属性
    if (!dep) {
        depsMap.set(key, (dep = new Set())); // 没有，则增加
    }
    if (!dep.has(activeEffect)) {
        // 如果set中没有当前的effect，则加进去
        dep.add(activeEffect);
    }
    debugger;
    console.log(targetMap);
}
//{name:'lcj',age:12} name->name可能对应两个effect，即[effect,effect]
// 某个对象中某个属性对应的effect
// 对象作为key weakMap
//weakMap=>key:{name:'lcj',age:12} ，value:name=>[effect,effect]即也是一个map,map中的key是那么，值是一个set，{name=>set}
// 特殊情况3
// effect(()=>{ // 一个effect可能对应多个属性
//   state.name  state.name  state.name
// })
//特殊情况1,,,,函数调用是一个栈型结构：effectStack，函数执行前入栈，执行完之后出栈    ：保证每个属性收集的effect是对的
// effect(()=>{
//   state.name='33', ->effect1
//   effect(()=>{->effect2
//     StaticRange.arguments.n=10
//   }),
//   state.ad=4444 ->effect2，但是其实是effect1
// })
// 情况2 ，++后持续执行effect，不停的刷新，，，， 思路：在栈中判断是否已经存在了该effect
// effect(()=>{
// state.count++
// })

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
            track(target, 0 /* GET */, key); // 执行effect时会取值，收集effect
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
        // 当数据更新时，通知对应属性的effect重新执行
        //todo
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

exports.effect = effect;
exports.reacdonly = reacdonly;
exports.reactive = reactive;
exports.shallowReacdonly = shallowReacdonly;
exports.shallowReactive = shallowReactive;
//# sourceMappingURL=reactivity.cjs.js.map
