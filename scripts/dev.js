// 只针对具体的某个包

const execa = require("execa"); // 开启子进程进行打包，最终还是rollup进行打包

const target = "reactivity";

// 打包执行的命令
// -c 表示采用某个配置文件  --environment 采用环境变量
//-wc 监控并执行配置文件
execa("rollup", ["-wc", "--environment", `TARGET:${target}`], {
  // 子进程打包的信息，共享给父进程 // todo
  stdio: "inherit",
});
