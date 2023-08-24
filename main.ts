#!/usr/bin/env node
import path from "path";
import fs from "fs";
import net from "net";

import { Command } from "commander";
// import chalk from "chalk";
// import boxen from "boxen";
import server from "./src/server";
import { Server, IncomingMessage, ServerResponse } from "http";
import { runAnalysis } from "./src/analysis";
import { exec } from "child_process";

// 定义基本的url
const baseUrl: string = path.join(__dirname, "src", "data");

// 定义端口号
let defaultPort: number = 5152;

// 分配可用port
function findAvailablePort(port: number, callback: (port: number) => void) {
  const server = net.createServer();

  server.listen(port, () => {
    server.close(() => {
      callback(port);
    });
  });

  server.on("error", () => {
    findAvailablePort(port + 1, callback);
  });
}

// 创建命令行参数对象
const program: Command = new Command();
program
  .command("analyze")
  .description("分析 package-lock.json 中的依赖关系")
  .option("--depth [n]", "限制递归深度")
  .option("--json [file-path]", "将依赖关系以json格式导入指定路径中")
  .action(async (options): Promise<void> => {
    // 获取深度
    const depth = options.depth || 9999;
    // 获取json文件路径
    const jsonFilePath = options.json || "default";
    //
    if (depth === true || jsonFilePath === true) {
      console.error("请输入正确的参数");
      return;
    }
    // 执行依赖分析
    await runAnalysis(depth, jsonFilePath);
    // 如果输入了 jsonFilePath 就打开对应目录
    if (jsonFilePath !== "default") {
      exec(`start ${jsonFilePath.replace(/\//g, '\\')}`, (err) => {
        if (err) {
          console.error("Failed to save:", err);
          return;
        }
      });
    } else {
      //服务区器实例
      let serverInstance: Server<typeof IncomingMessage, typeof ServerResponse>;

      // 分配可用port
      findAvailablePort(defaultPort, (port: number) => {
        // 没被占用的port
        defaultPort = port;
        // 启动服务器
        serverInstance = server.listen(port, () => {
          // 打开渲染后的网页
          exec(`start http://localhost:${defaultPort}`, (err) => {
            if (err) {
              console.error("Failed to open:", err);
              return;
            }
          });
          console.log("分析完成!");
        });
      });

      // 监听 Ctrl+C 退出事件
      process.on("SIGINT", () => {
        // 关闭express
        serverInstance.close();
        // 删除临时文件
        const files: string[] = fs.readdirSync(baseUrl);
        files.forEach((item) => {
          const filePath: string = path.join(baseUrl, item);
          fs.unlinkSync(filePath);
        });
        console.log("Bye~");
        process.exit(0);
      });
    }
  });

// 获取消息
// function getBeautifulMsg(): string {
//   const message: string = `
//     Serving!
    
//     - Local:    ${chalk.blue(`http://localhost:${defaultPort}`)}
//     - Network:  ${chalk.blue(`http://192.168.10.10:${defaultPort}`)}
    
//     Copied local address to clipboard!
//     `;
//   const boxedMessage: string = boxen(message, {
//     padding: 1,
//     margin: 1,
//     borderStyle: "round",
//     borderColor: "green",
//   });
//   return boxedMessage;
// }

// 解析命令行参数
program.parse(process.argv);
