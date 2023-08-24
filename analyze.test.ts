import fs from 'fs'
import path from 'path';
// 检车对应文件是否生成的测试套件
describe('Generate corresponding data', () => {
  test('Generate node data', () => {
    const nodePath = path.resolve(__dirname + '/src/data/nodesInfo.json')
    const isExist = fs.existsSync(nodePath)
    expect(isExist).toBe(true);
  });
  test('Generate edge data', () => {
    const edgePath = path.resolve(__dirname + '/src/data/linksInfo.json')
    const isExist = fs.existsSync(edgePath)
    expect(isExist).toBe(true);
  });
  test('Generate node legend data', () => {
    const nodeLegendPath = path.resolve(__dirname + '/src/data/categoriesInfo.json')
    const isExist = fs.existsSync(nodeLegendPath)
    expect(isExist).toBe(true);
  });
});