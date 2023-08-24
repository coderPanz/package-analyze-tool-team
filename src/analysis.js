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
exports.runAnalysis = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let plainData = ""; // 存储流式读入的数据
let packages; // 所有依赖包信息
let conflictPackages = {}; // 冲突包信息
let isVisit; // 访问标记,用于处理循环依赖
let linksInfo = []; // 记录依赖关系
let circleInfo = []; // 记录循环依赖
let thisMaxDepth = -1;
let maxDepth = 9999;
let saveUrl = 'default';
// 流式读取文件并处理
function main(depth, jsonFilePath) {
    // 设置初始信息
    maxDepth = depth;
    saveUrl = jsonFilePath;
    plainData = "";
    const baseUrl = path_1.default.resolve(process.cwd(), "package-lock.json");
    const readStream = fs_1.default.createReadStream(baseUrl, {
        encoding: "utf8",
    });
    return new Promise((resolve, reject) => {
        // 流式读入数据
        readStream.on("data", (chunk) => {
            plainData += chunk;
        });
        // 读入完毕处理数据
        readStream.on("end", () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // 数据预处理: 解析 json 数据并提取所需信息
            const parseDate = JSON.parse(plainData);
            packages = {};
            Object.keys(parseDate.packages).forEach((item) => {
                let newName = item.replace("node_modules/", "");
                packages[newName] = parseDate.packages[item];
            });
            // 提取 packages 空字符串对象中的依赖信息
            let directDependencies = (_a = packages === null || packages === void 0 ? void 0 : packages[""]) === null || _a === void 0 ? void 0 : _a["dependencies"];
            let dependenciesArray = Object.keys(directDependencies);
            try {
                let url = path_1.default.join(__dirname, "data");
                if (!fs_1.default.existsSync(url))
                    fs_1.default.mkdirSync(url);
                // 递归分析依赖
                yield generateAnalysis(dependenciesArray);
                if (saveUrl === 'default') {
                    // 生成节点相关信息
                    yield generateNodeInfo();
                    // 生成类别信息
                    yield generateCategories(dependenciesArray);
                    // 记录依赖冲突信息
                    yield generateConflict();
                }
            }
            catch (err) {
                reject(err);
            }
            resolve("文件处理完毕");
        }));
        readStream.on("error", (error) => {
            reject(error);
        });
    });
}
function runAnalysis(depth, jsonFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield main(depth, jsonFilePath);
        }
        catch (err) {
            console.error("处理文件时发生错误:", err);
        }
    });
}
exports.runAnalysis = runAnalysis;
/**
 * 将数据写入文件,可以使用 await 阻塞
 * @param {string} fileName - 文件名
 * @param {Object} data - 要写入的数据
 * @returns {Promise<string>} - Promise，成功时返回成功消息，失败时返回错误
 * @throws {Error} - 如果写入文件时发生错误，则抛出错误
 */
function promiseWriteFile(fileName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = '';
        if (fileName === 'dependency' && saveUrl !== 'default') {
            // 判断输入的路径是相对路径还是绝对路径
            const pathRegex = /^(\/|[A-Za-z]:\\)/;
            if (pathRegex.test(saveUrl))
                url = saveUrl;
            else
                url = path_1.default.resolve(process.cwd(), saveUrl);
        }
        else
            url = path_1.default.join(__dirname, "data");
        return new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(url)) {
                fs_1.default.mkdirSync(url, { recursive: true });
            }
            url = path_1.default.join(url, `${fileName}.json`);
            fs_1.default.writeFile(url, JSON.stringify(data), (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(`-- ${fileName} success --`);
                }
            });
        });
    });
}
/**
 * 递归分析依赖信息
 * @param {Array} keys - 包含直接依赖键名信息的数组
 */
function generateAnalysis(keys) {
    return __awaiter(this, void 0, void 0, function* () {
        let resObj = {};
        keys.forEach((item) => {
            isVisit = {};
            resObj[item] = dfs(item, item, 1);
        });
        yield promiseWriteFile("dependency", resObj);
    });
}
/**
 * 深度优先搜索，生成依赖关系图
 * @param {string} rootPackageName - 根包名
 * @param {string} nowPackageName - 当前包名
 * @param {number} depth - 深度
 * @param {string} prefix - 前缀
 * @param {string[]} prefixDep - 前缀依赖
 * @returns {object} - 依赖关系对象
 */
function dfs(rootPackageName, nowPackageName, depth, prefix = "NotFound", prefixDependency = []) {
    // 判断循环引用
    if (prefixDependency.indexOf(nowPackageName) !== -1) {
        circleInfo.push([...prefixDependency, nowPackageName].join(' ->'));
    }
    // 先查找前缀的node_modules目录中是否存在依赖
    let prefixArr = prefix.split('/node_modules/');
    let payload = '';
    let checkPackage = packages === null || packages === void 0 ? void 0 : packages[payload];
    let packageName = payload;
    let isConflict = false;
    for (let i = prefixArr.length - 1; i >= 0; i--) {
        payload = [...prefixArr.slice(0, i + 1), nowPackageName].join('/node_modules/');
        checkPackage = packages === null || packages === void 0 ? void 0 : packages[payload];
        packageName = payload;
        // console.log(payload);
        // 存在依赖冲突
        if (checkPackage) {
            conflictPackages[nowPackageName] = conflictPackages[nowPackageName] || {};
            conflictPackages[nowPackageName][checkPackage.version] =
                conflictPackages[nowPackageName][checkPackage.version] || [];
            conflictPackages[nowPackageName][checkPackage.version].push(prefix);
            isConflict = true;
            break;
        }
    }
    if (!isConflict) {
        checkPackage = packages === null || packages === void 0 ? void 0 : packages[nowPackageName];
        packageName = nowPackageName;
    }
    // 记录依赖关系
    if (prefix !== "NotFound") {
        linksInfo.push({
            source: prefix,
            target: packageName,
        });
    }
    // 处理已经访问过的情况
    if (isVisit[packageName]) {
        return {
            packageName,
            version: checkPackage.version,
            dependencies: [],
            conflict: true,
        };
    }
    isVisit[packageName] = true; // 标记已访问
    packages[packageName].category = packages[packageName].category
        ? "shared"
        : rootPackageName; // 标记属于哪个包
    packages[packageName].depth = depth; // 记录包的最小深度
    thisMaxDepth = Math.max(thisMaxDepth, depth); // 统计最大深度,便于计算可视化后的图形大小
    let { version, dependencies } = checkPackage || {};
    let tmpObj = { packageName, version, depth, dependencies: [] };
    // 递归检索依赖关系
    if (dependencies) {
        // 限制递归深度
        if (depth + 1 > maxDepth) {
            tmpObj.dependencies = "...";
        }
        else if (depth + 1 <= maxDepth) {
            tmpObj.dependencies = Object.keys(dependencies).map((item) => dfs(rootPackageName, item, depth + 1, packageName, [...prefixDependency, packageName]));
        }
    }
    return tmpObj;
}
/**
 * 生成 Echarts 所需的 Nodes 与 Links 数据格式
 */
function generateNodeInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        // 添加额外信息以便前端渲染
        let nodesInfo = Object.keys(packages).map((item) => {
            let size = 10 - packages[item].depth + 1 || 2;
            if (item)
                return {
                    name: item,
                    value: `@${packages[item].version}`,
                    category: packages[item].category || "alone",
                    symbolSize: Math.pow(1.32, size),
                };
        });
        yield promiseWriteFile("nodesInfo", nodesInfo.slice(1));
        // 去除重复的边避免影响循环依赖的判断
        const linksInfoUnique = linksInfo.reduce((acc, obj) => {
            const isDuplicate = acc.some(item => item.source === obj.source && item.target === obj.target);
            if (!isDuplicate)
                acc.push(obj);
            return acc;
        }, []);
        yield promiseWriteFile("linksInfo", linksInfoUnique);
    });
}
/**
 * 生成 Echarts 所需的 categories
 * @param {Array} keys - 包含直接依赖键名信息的数组
 */
function generateCategories(keys) {
    return __awaiter(this, void 0, void 0, function* () {
        let categories = keys.map((item) => {
            return { name: item };
        });
        categories.push({ name: "alone" });
        categories.push({ name: "shared" });
        yield promiseWriteFile("categoriesInfo", categories);
    });
}
/**
 * 生成依赖冲突相关的信息.
 */
function generateConflict() {
    return __awaiter(this, void 0, void 0, function* () {
        Object.keys(conflictPackages).forEach((item) => {
            var _a;
            conflictPackages[item].rootVersion = (_a = packages[item]) === null || _a === void 0 ? void 0 : _a.version;
        });
        yield promiseWriteFile("report", { conflict: conflictPackages, circle: circleInfo });
    });
}
