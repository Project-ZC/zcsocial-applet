// 模拟分页API 下拉加载更多
export const mockApiFetchList = (params) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = [];
            for (let i = 0; i < params.pageSize; i++) {
                mockData.push({
                    id: `${params.pageNo}_${i}`,
                    title: params.keyword ? `${params.keyword}的工单${i}` : `工单标题${params.pageNo}_${i}`,
                    description: '内容',
                    createTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000),
                    creator: `用户${Math.floor(Math.random() * 100)}`
                });
            }
            resolve({
                list: mockData,
                total: 35 // 模拟总条数
            });
        }, 1000);
    });
};


// 获取系统信息计算滚动高度
export const getScrollHeight = (opts: any) => {
    return new Promise((resolve) => {
        opts = opts || {};
        let navbarHeight = opts.navbarHeight != undefined ? opts.navbarHeight : 44;
        let footerHeight = opts.footerHeight != undefined ? opts.footerHeight : 0;
        let bounceHeight = opts.bounceHeight != undefined ? opts.bounceHeight : 50;
        uni.getSystemInfo({
            success: (res) => {
                const scrollHeight = res.windowHeight - navbarHeight - footerHeight - bounceHeight;
                resolve(scrollHeight)
            }
        });
    })
}
