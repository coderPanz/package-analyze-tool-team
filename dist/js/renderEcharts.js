const myChart = echarts.init(document.getElementById('main'), 'macarons');

// 监听resize， 重新渲染echarts
window.addEventListener('resize',(e)=>{
    myChart.resize()
})



/**
 * 从不同的 URL 获取数据，并返回一个包含节点、链接和类别信息的对象。
 * @returns {Promise<Object>} 包含节点、链接和类别信息的对象。
 */
async function getData() {
    try {
        const promises = [
            axios.get('../../src/data/nodesInfo.json'),
            axios.get('../../src/data/linksInfo.json'),
            axios.get('../../src/data/categoriesInfo.json')
        ];

        const [nodesRes, linksRes, categoriesRes] = await Promise.all(promises);

        return {
            nodes: nodesRes.data,
            links: linksRes.data,
            categories: categoriesRes.data
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/* TODO: 
1. 关于冗余依赖包的处理,有没有更好的可视化方案
2. active 状态切换 (待商榷)
    a.点击单个依赖图例时,仅显示自身与shared;
    b.当只有自身与shared显示时,再次点击显示全部.
3. 冲突依赖以什么样的形式展示.
4. 根包之间的依赖问题 postCSS 和 vue
*/
async function renderEcharts() {
    // 加载数据与loading动画
    myChart.showLoading();
    const { nodes, links, categories } = await getData();
    myChart.hideLoading();

    // 处理节点 label 的显示情况
    nodes.forEach(function (node) {
        node.label = {
            show: node.symbolSize > 3,
            formatter: (params) => {
                let label = params.name;
                let maxLength = 6;
                return label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;
            }
        };
    });

    option = {
        // 图标标题
        title: {
            text: 'Packages Dependencies',
            subtext: 'npm Analysis Tool',
            top: '5%',
            left: '5%',
        },
        // 提示框
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: (params) => {
                if (params.value) {
                    return `
                    <i style="background-color: pink;"></i><b>${params.name}</b><br\>
                    <i style="background-color: #00d1b2;"></i>${params.value}`;
                } else {
                    return `<b>${params.name}</b>`;
                }
            }
        },
        // 图例
        legend: [
            {
                top: 'middle',
                left: '5%',
                icon: 'circle',
                orient: 'vertical',
                data: categories.map((a) => a.name)
            }
        ],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: 'Version',
                type: 'graph',
                layout: 'force',

                draggable: true,
                roam: true,
                autoCurveness: true,
                scaleLimit: {
                    min: 0.5,
                },
                symbol: "circle",

                data: nodes,
                links: links,
                categories: categories,

                label: {
                    position: 'top',
                    formatter: '{b}'
                },
                labelLayout: {
                    hideOverlap: true,
                },
                lineStyle: {
                    color: 'source',
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 5
                    },
                    label: {
                        fontSize: 16,
                        formatter: (params) => params.name
                    }
                }
            }
        ]
    };
    myChart.setOption(option);

    // 监听图例切换事件
    myChart.on('legendselectchanged', (e) => {
        handleLegendChange(e, categories.length)
    })
    // 监听缩放事件
    // myChart.on('graphroam', (e) => {
    //     console.log(e)
    // })
}

/**
 * 处理点击图例后切换显示数据的逻辑
 * @param {object} events - 点击图例触发的事件 
 * @param {number} totalNum - 图例总数 
 */
function handleLegendChange(events, totalNum) {
    const clickName = events.name;
    const selectedInfo = Object.keys(events.selected).filter(item => events.selected[item]);
    const index = selectedInfo.findIndex(item => item === clickName);
    // 仅剩 shared 与 自身
    if (selectedInfo.length === 1 && selectedInfo[0] === 'shared' && index === -1)
        myChart.dispatchAction({ type: "legendAllSelect" });
    // 全选状态下选择自身
    else if (index === -1 && selectedInfo.length === totalNum - 1) {
        myChart.dispatchAction({ type: 'legendUnSelect', name: 'shared' });
        myChart.dispatchAction({ type: "legendInverseSelect" });
    }
}

renderEcharts();