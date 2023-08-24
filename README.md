# package-analyze-tool npm包分析工具

## 🌟 介绍

npm包分析工具用于从`package.json`出发，递归遍历所有 `node_modules` 中的`package.json` ，生成模块依赖关系图。

## 🎉 开始使用

首先需要全局安装package-analyze-tool。

```js
npm install package-analyze-tool -g
```

待安装完成后，在目标路径下的命令行窗口内执行下列命令进行依赖分析，分析完成自动打开网页，使用echart进行可视化。

```js
package-cli analyze
```

同时，支持`--depth [n]`参数，限制向下递归分析的层次深度。

```js
package-cli analyze --depth [n]
```

支持 `--json [file-path]` 参数，传入后不再打开网页，只是将依赖关系以 JSON 形式存储到用户指定的文件。

```js
package-cli analyze --json [file-path]
```

如需提升依赖下载速度，可以设置淘宝镜像源：

```js
npm config set registry http://registry.npm.taobao.org/
```

### npx

如果支持npx，可以不安装`package-analyze-tool`，直接执行进行依赖分析：  

```js
npx package-cli analyze
```

查看所有命令可执行。

```js
npx package-cli
```

## 📝 目录结构

```
  │   main.ts                 // 入口函数, 用于处理命令接收参数
  │   package.json            // 项目信息
  │
  ├───dist
  │   │   index.html          // 前端可视化基本文件
  │   │
  │   └───js
  │           axios.min.js
  │           echarts.min.js
  │           macarons.js     // Eaharts 主题
  │           renderEcharts.js// 前端渲染主文件
  │           renderReport.js // 分析报告文件
  │
  └───src
   │   analysis.ts         // 分析依赖并生成json数据
   │   server.ts           // 启动Express服务
   │   type.ts             // typescript类型限制处理
   │
   └───data                // 零时存放生成的json数据
```

## 🎨 Demo 展示

![](https://e1wijx.us.aircodecdn.com/demo-preview.1690731191281_zihoj7txb4a.png)

## 🦄 技术栈

功能开发：
  - 依赖关系图：使用echarts可视化

工程化：
  - 使用 TypeScript 开发；
  - 使用 jest 实现单元测试；
  - 接入 eslint, prettier, lint-staged 代码风格自动化工具；
