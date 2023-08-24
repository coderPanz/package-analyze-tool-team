#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const net_1 = __importDefault(require("net"));
const commander_1 = require("commander");
// import chalk from "chalk";
// import boxen from "boxen";
const server_1 = __importDefault(require("./src/server"));
const analysis_1 = require("./src/analysis");
const child_process_1 = require("child_process");
// 定义基本的url
const baseUrl = path_1.default.join(__dirname, "src", "data");
// 定义端口号
let defaultPort = 5152;
// 分配可用port
function findAvailablePort(port, callback) {
    const server = net_1.default.createServer();
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
const program = new commander_1.Command();
program
    .command("analyze")
    .description("分析 package-lock.json 中的依赖关系")
    .option("--depth [n]", "限制递归深度")
    .option("--json [file-path]", "将依赖关系以json格式导入指定路径中")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield (0, analysis_1.runAnalysis)(depth, jsonFilePath);
    // 如果输入了 jsonFilePath 就打开对应目录
    if (jsonFilePath !== "default") {
        (0, child_process_1.exec)(`start ${jsonFilePath.replace(/\//g, '\\')}`, (err) => {
            if (err) {
                console.error("Failed to save:", err);
                return;
            }
        });
    }
    else {
        //服务区器实例
        let serverInstance;
        // 分配可用port
        findAvailablePort(defaultPort, (port) => {
            // 没被占用的port
            defaultPort = port;
            // 启动服务器
            serverInstance = server_1.default.listen(port, () => {
                // 打开渲染后的网页
                (0, child_process_1.exec)(`start http://localhost:${defaultPort}`, (err) => {
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
            const files = fs_1.default.readdirSync(baseUrl);
            files.forEach((item) => {
                const filePath = path_1.default.join(baseUrl, item);
                fs_1.default.unlinkSync(filePath);
            });
            console.log("Bye~");
            process.exit(0);
        });
    }
}));
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
