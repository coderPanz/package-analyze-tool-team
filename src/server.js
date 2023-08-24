"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
// 处理数据请求
const server = http_1.default.createServer();
server.on("request", (req, res) => {
    // 普通文件
    let pathName = path_1.default.join(__dirname, "../dist", req.url);
    // 首页
    if (req.url === "/")
        pathName = path_1.default.join(__dirname, "../dist/index.html");
    // json数据
    if (getContentType(req.url) === "application/json") {
        pathName = `.${req.url}`;
    }
    fs_1.default.readFile(pathName, (err, data) => {
        if (err) {
            console.log(err);
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
        }
        else {
            res.writeHead(200, { "Content-Type": getContentType(pathName) });
            res.end(data);
        }
    });
});
/**
 * 判断请求文件类型
 * @param filePath 文件地址
 * @returns 文件类型
 */
function getContentType(filePath) {
    const extname = path_1.default.extname(filePath).toLowerCase();
    switch (extname) {
        case ".html":
            return "text/html";
        case ".css":
            return "text/css";
        case ".js":
            return "text/javascript";
        case ".json":
            return "application/json";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        default:
            return "application/octet-stream";
    }
}
exports.default = server;
