const circleDiv = document.getElementById("circle");
const versionDiv = document.getElementById("multipleVersion");

async function getReport() {
  // 获取report.json文件的数据
  let { data } = await axios.get("../../src/data/report.json");
  // 获取conflict和circle数据
  let { conflict, circle } = data;
  // 多版本
  insertDataObj(conflict, versionDiv);
  // 循环
  insertData(circle, circleDiv);
}
function insertDataObj(obj, ele) {
  if (Object.keys(obj).length === 0) {
    ele.innerHTML = '<p">无多版本实例</p>';
  } else {
    for (const key in obj) {
      let tmpEle1 = document.createElement("p");
      const keys = Object.keys(obj[key]);
      const firstKey = keys[0];
      const firstValue = obj[key][firstKey];
      console.log(firstValue)
      const secondValue = obj[key][keys[1]]
      tmpEle1.textContent = `包名: ${key}--------版本对应实例: ${firstKey}->${firstValue}--------项目原始版本: ${secondValue}`;
      ele.appendChild(tmpEle1);
    }
  }
}
function insertData(arr, ele) {
  // 如果数组为空，则插入一个提示文字
  if (arr.length === 0) {
    ele.innerHTML = '<p">无循环依赖</p>';
  } else {
    // 遍历数组，插入文字
    arr.forEach((item) => {
      let tmpEle = document.createElement("p");
      tmpEle.innerHTML = `依赖包名: ${item}`;
      ele.appendChild(tmpEle);
    });
  }
}

getReport();
