// 我们需要让这个effect变成响应的effect，可以做到数据变化的时候执行
export function effect(fn, options: any = {}) {
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
      } finally {
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
export function track(target, type, key) {
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
