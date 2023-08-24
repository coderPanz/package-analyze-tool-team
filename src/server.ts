import fs from "fs";
import path from "path";
import http from "http";
// 处理数据请求
const server = http.createServer();
server.on("request", (req, res) => {
  // 普通文件
  let pathName: string = path.join(__dirname, "../dist", req.url!);
  // 首页
  if (req.url === "/") pathName = path.join(__dirname, "../dist/index.html");
  // json数据
  if (getContentType(req.url!) === "application/json") {
    pathName = `.${req.url!}`;
  }
  fs.readFile(pathName, (err, data) => {
    if (err) {
      console.log(err);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } else {
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
function getContentType(filePath: string) {
  const extname = path.extname(filePath).toLowerCase();
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
export default server;
