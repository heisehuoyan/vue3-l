// 把package下的所有包都打包

const fs = require("fs");
const execa = require("execa"); // 开启子进程进行打包，最终还是rollup进行打包

//过滤packages目录下的所有模块 不是文件的过滤掉
const targets = fs.readdirSync("packages").filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false;
  }
  return true;
});

//并行打包
runParallel(targets, build);
async function runParallel(targets, iteratorFn) {
  const ret = [];
  for (const item of targets) {
    const p = iteratorFn(item); // 打包是异步的，返回的是一个promise
    ret.push(p);
  }
  return Promise.all(ret);
}

// 打包执行的命令
async function build(target) {
  // -c 表示采用某个配置文件  --environment 采用环境变量
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    // 子进程打包的信息，共享给父进程 // todo
    stdio: "inherit",
  });
}
