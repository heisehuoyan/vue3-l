// // rollup 配置

// // 根据环境变量中的target属性获取对应模块中的package.json

// import path from "path";
// import ts from "rollup-plugin-typescript2";
// import json from "@rollup/plugin-json";
// import resolvePlugin from "@rollup/plugin-node-resolve";

// const packagesDir = path.resolve(__dirname, "packages"); // 获取packages目录
// const packageDir = path.resolve(packagesDir, process.env.TARGET); // 获取要打包的目录
// const name = path.basename(packageDir); // 获取打包的名字

// const resolve = (p) => path.resolve(packageDir, p);
// const pkg = require(resolve("package.json")); // 获取目标对应的package.json

// const packageOptions = pkg.buildOptions; // 获取打包的选项

// const outputOptions = {
//   "esm-bundler": {
//     file: resolve(`dist/${name}.esm-bundler.js`), // webpack打包用
//     format: "es",
//   },
//   cjs: {
//     file: resolve(`dist/${name}.cjs.js`), // webpack打包用
//     format: "cjs",
//   },
//   global: {
//     file: resolve(`dist/${name}.global.js`), // webpack打包用
//     format: "iife",
//   },
// };

// function creatConfig(format, output) {
//   output.name = packageOptions.name;
//   output.sourcemap = true;
//   return {
//     input: resolve("src/index.ts"), // 入口
//     output,
//     plugins: [
//       json(),
//       ts({
//         tsconfig: path.resolve(__dirname, "tsconfig.json"),
//       }),
//       resolvePlugin(),
//     ],
//   };
// }

// export default packageOptions.format.map((format) =>
//   creatConfig(format, outputOptions[format])
// );
import path from "path";
import ts from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve";
const packagesDir = path.resolve(__dirname, "packages"); // 获取packages目录

const packageDir = path.resolve(packagesDir, process.env.TARGET); // 获取要打包的目标目录
const name = path.basename(packageDir); // 获取打包的名字

const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`)); // 获取目标对应的package.json

const packageOptions = pkg.buildOptions; // 打包的选项
const outputConfigs = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`), // webpack打包用的
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`), // node使用的
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`), // 全局的
    format: "iife",
  },
};

function createConfig(format, output) {
  output.name = packageOptions.name;
  output.sourcemap = true;
  return {
    input: resolve(`src/index.ts`), // 入口
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      resolvePlugin(),
    ],
  };
}
// 根据模块配置信息选择性打包
export default packageOptions.formats.map((format) =>
  createConfig(format, outputConfigs[format])
);
