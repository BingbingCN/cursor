let currentFilename = '';  // 当前上传的文件名

async function populateTable(data) {
    const tableHead = document.querySelector('#dataTable thead');  // 获取表头元素
    const tableBody = document.querySelector('#dataTable tbody');  // 获取表体元素
    
    // 清空表格
    tableHead.innerHTML = '';  // 清空表头
    tableBody.innerHTML = '';  // 清空表体
    
    // 创建表头
    const headerRow = document.createElement('tr');  // 创建表头行
    data.columns.forEach(column => {  // 遍历列名
        const th = document.createElement('th');  // 创建表头单元格
        th.textContent = column;  // 设置单元格内容为列名
        headerRow.appendChild(th);  // 将单元格添加到表头行
    });
    tableHead.appendChild(headerRow);  // 将表头行添加到表头
    
    // 创建表格内容
    data.rows.forEach(row => {  // 遍历数据行
        const tr = document.createElement('tr');  // 创建表格行
        row.forEach((cell, index) => {  // 遍历每一行的单元格
            const td = document.createElement('td');  // 创建单元格
            td.textContent = cell;  // 设置单元格内容
            td.contentEditable = true;  // 允许编辑单元格内容
            td.addEventListener('blur', () => {  // 添加失去焦点事件
                // 更新数据并重新生成图表
                const updatedRow = Array.from(tr.children).map(td => td.textContent);  // 获取更新后的行数据
                updateChartData(data.columns, updatedRow);  // 更新图表数据
            });
            tr.appendChild(td);  // 将单元格添加到行
        });
        tableBody.appendChild(tr);  // 将行添加到表体
    });
}

function updateChartData(columns, updatedRow) {
    // 更新图表数据
    const xColumn = document.getElementById('xColumn').value;  // 获取X轴列名
    const yColumn = document.getElementById('yColumn').value;  // 获取Y轴列名

    // 找到 X 和 Y 列的索引
    const xIndex = columns.indexOf(xColumn);  // 获取X轴列的索引
    const yIndex = columns.indexOf(yColumn);  // 获取Y轴列的索引

    // 更新数据
    if (xIndex !== -1 && yIndex !== -1) {  // 如果索引有效
        const updatedData = {
            x: [],  // 初始化X轴数据数组
            y: []   // 初始化Y轴数据数组
        };

        // 获取所有行的数据
        const tableRows = document.querySelectorAll('#dataTable tbody tr');  // 获取所有表体行
        tableRows.forEach(row => {  // 遍历每一行
            const cells = row.children;  // 获取行中的单元格
            updatedData.x.push(cells[xIndex].textContent);  // 将X轴数据添加到数组
            updatedData.y.push(parseFloat(cells[yIndex].textContent));  // 将Y轴数据添加到数组并转换为数字
        });

        // 重新生成图表
        Plotly.newPlot('chartContainer', [{  // 使用Plotly绘制图表
            x: updatedData.x,  // 设置X轴数据
            y: updatedData.y,  // 设置Y轴数据
            type: 'scatter',  // 图表类型为散点图
            mode: 'markers'  // 显示为标记
        }], {
            xaxis: {
                title: xColumn  // 设置X轴标题
            },
            yaxis: {
                title: yColumn  // 设置Y轴标题
            }
        });
    }
}

document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];  // 获取上传的文件
    if (!file) return;  // 如果没有文件则返回

    const formData = new FormData();  // 创建FormData对象
    formData.append('file', file);  // 将文件添加到FormData中

    try {
        const response = await fetch('/upload', {  // 发送文件上传请求
            method: 'POST',  // 请求方法为POST
            body: formData  // 请求体为FormData
        });

        const data = await response.json();  // 解析响应为JSON
        
        if (response.ok) {  // 如果响应成功
            currentFilename = data.filename;  // 保存当前文件名
            populateColumnSelects(data.columns);  // 填充列选择下拉框
            document.querySelector('.visualization-section').style.display = 'block';  // 显示可视化部分
            
            // 获取表格数据
            const tableResponse = await fetch('/get_table_data', {  // 发送请求获取表格数据
                method: 'POST',  // 请求方法为POST
                headers: {
                    'Content-Type': 'application/json'  // 设置请求头为JSON
                },
                body: JSON.stringify({ filename: currentFilename })  // 请求体为当前文件名
            });
            const tableData = await tableResponse.json();  // 解析表格数据响应为JSON
            populateTable(tableData);  // 填充表格
        } else {
            alert(data.error);  // 显示错误信息
        }
    } catch (error) {
        console.error('Error:', error);  // 打印错误信息
        alert('上传文件时发生错误');  // 显示上传错误提示
    }
});

function populateColumnSelects(columns) {
    const xSelect = document.getElementById('xColumn');  // 获取X轴选择下拉框
    const ySelect = document.getElementById('yColumn');  // 获取Y轴选择下拉框
    
    xSelect.innerHTML = '<option value="">选择 X 轴数据</option>';  // 清空并添加默认选项
    ySelect.innerHTML = '<option value="">选择 Y 轴数据</option>';  // 清空并添加默认选项
    
    columns.forEach(column => {  // 遍历列名
        xSelect.innerHTML += `<option value="${column}">${column}</option>`;  // 添加X轴选项
        ySelect.innerHTML += `<option value="${column}">${column}</option>`;  // 添加Y轴选项
    });
}

document.getElementById('generateChart').addEventListener('click', async () => {
    const xColumn = document.getElementById('xColumn').value;  // 获取X轴列名
    const yColumn = document.getElementById('yColumn').value;  // 获取Y轴列名
    const chartType = document.getElementById('chartType').value;  // 获取图表类型
    
    if (chartType === 'pie') {  // 如果选择饼图
        if (!xColumn || !yColumn) {  // 检查是否选择了类别和数值数据
            alert('请选择类别和数值数据');
            return;
        }
    } else {
        if (!xColumn || !yColumn) {  // 检查是否选择了X轴和Y轴数据
            alert('请选择 X 轴和 Y 轴数据');
            return;
        }
    }
    
    try {
        const response = await fetch('/visualize', {  // 发送可视化请求
            method: 'POST',  // 请求方法为POST
            headers: {
                'Content-Type': 'application/json'  // 设置请求头为JSON
            },
            body: JSON.stringify({  // 请求体为JSON字符串
                filename: currentFilename,
                x_column: xColumn,
                y_column: yColumn,
                chart_type: chartType
            })
        });
        
        const data = await response.json();  // 解析响应为JSON
        
        if (response.ok) {  // 如果响应成功
            let plotData;  // 初始化图表数据
            if (chartType === 'pie') {  // 如果选择饼图
                plotData = [{
                    values: data.y,  // 设置饼图的值
                    labels: data.x,  // 设置饼图的标签
                    type: 'pie'  // 图表类型为饼图
                }];
            } else {
                plotData = [{
                    x: data.x,  // 设置X轴数据
                    y: data.y,  // 设置Y轴数据
                    type: data.type,  // 图表类型
                    mode: chartType === 'scatter' ? 'markers' : undefined  // 如果是散点图，设置为标记模式
                }];
            }
            
            const layout = {
                paper_bgcolor: 'rgba(0,0,0,0)',  // 设置纸张背景为透明
                plot_bgcolor: 'rgba(0,0,0,0)',  // 设置图表背景为透明
                margin: {
                    l: 50,  // 左边距
                    r: 50,  // 右边距
                    t: 30,  // 上边距
                    b: 50   // 下边距
                },
                xaxis: {
                    title: xColumn,  // 设置X轴标题
                    gridcolor: 'rgba(0,0,0,0.1)',  // 设置网格线颜色
                    zerolinecolor: 'rgba(0,0,0,0.2)'  // 设置零线颜色
                },
                yaxis: {
                    title: yColumn,  // 设置Y轴标题
                    gridcolor: 'rgba(0,0,0,0.1)',  // 设置网格线颜色
                    zerolinecolor: 'rgba(0,0,0,0.2)'  // 设置零线颜色
                }
            };
            
            // 如果是饼图，不需要坐标轴标签
            if (chartType === 'pie') {
                delete layout.xaxis;  // 删除X轴设置
                delete layout.yaxis;  // 删除Y轴设置
            }
            
            Plotly.newPlot('chartContainer', plotData, layout);  // 绘制图表
        } else {
            alert(data.error);  // 显示错误信息
        }
    } catch (error) {
        console.error('Error:', error);  // 打印错误信息
        alert('生成图表时发生错误');  // 显示生成图表错误提示
    }
});

// 添加导出图表的功能
document.getElementById('exportChart').addEventListener('click', () => {
    const chartContainer = document.getElementById('chartContainer');  // 获取图表容器
    
    if (!chartContainer.data) {  // 检查是否生成了图表
        alert('请先生成图表');  // 提示用户生成图表
        return;
    }
    
    // 获取当前时间作为文件名的一部分
    const date = new Date();  // 获取当前时间
    const timestamp = date.toISOString().replace(/[:.]/g, '-');  // 格式化时间戳
    const filename = `chart_${timestamp}`;  // 生成文件名
    
    // 获取当前图表容器的宽度和高度
    const width = chartContainer.clientWidth;  // 获取图表容器宽度
    const height = chartContainer.clientHeight;  // 获取图表容器高度
    
    // 导出为PNG，设置与图表容器相同的宽度和高度，并提高分辨率
    Plotly.downloadImage(chartContainer, {
        format: 'png',  // 导出格式为PNG
        width: width,  // 设置导出宽度
        height: height,  // 设置导出高度
        filename: filename,  // 设置文件名
        scale: 3,     // 提高缩放比例，提高清晰度
        bg: '#ffffff' // 设置白色背景
    });
}); 