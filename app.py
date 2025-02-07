from flask import Flask, render_template, request, jsonify  # 导入Flask及相关模块
import pandas as pd  # 导入Pandas用于数据处理
import os  # 导入os模块用于文件路径操作
from werkzeug.utils import secure_filename  # 导入secure_filename用于安全处理文件名

app = Flask(__name__)  # 创建Flask应用实例
app.config['UPLOAD_FOLDER'] = 'uploads'  # 设置文件上传目录
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 设置最大上传文件大小为16MB

# 确保上传文件夹存在
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])  # 如果不存在则创建上传文件夹

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}  # 定义允许上传的文件扩展名

def allowed_file(filename):
    """检查文件扩展名是否被允许"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')  # 定义根路由
def index():
    """渲染主页"""
    return render_template('index.html')  # 返回index.html模板

@app.route('/upload', methods=['POST'])  # 定义文件上传路由
def upload_file():
    """处理文件上传"""
    if 'file' not in request.files:  # 检查请求中是否包含文件
        return jsonify({'error': '没有文件被上传'}), 400  # 返回错误信息

    file = request.files['file']  # 获取上传的文件
    if file.filename == '':  # 检查文件名是否为空
        return jsonify({'error': '没有选择文件'}), 400  # 返回错误信息

    if file and allowed_file(file.filename):  # 检查文件是否有效
        filename = secure_filename(file.filename)  # 安全处理文件名
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # 构建文件保存路径
        file.save(filepath)  # 保存文件
        
        # 读取数据文件
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)  # 读取CSV文件
        else:
            df = pd.read_excel(filepath)  # 读取Excel文件
        
        # 获取列名
        columns = df.columns.tolist()  # 将列名转换为列表
        
        return jsonify({
            'columns': columns,  # 返回列名
            'filename': filename  # 返回文件名
        })
    
    return jsonify({'error': '不支持的文件类型'}), 400  # 返回不支持的文件类型错误

@app.route('/visualize', methods=['POST'])  # 定义可视化路由
def visualize():
    """处理数据可视化请求"""
    data = request.json  # 获取请求中的JSON数据
    filename = data.get('filename')  # 获取文件名
    x_column = data.get('x_column')  # 获取X轴数据列
    y_column = data.get('y_column')  # 获取Y轴数据列
    chart_type = data.get('chart_type')  # 获取图表类型
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # 构建文件路径
    
    if filename.endswith('.csv'):
        df = pd.read_csv(filepath)  # 读取CSV文件
    else:
        df = pd.read_excel(filepath)  # 读取Excel文件
    
    # 准备图表数据
    chart_data = {
        'x': df[x_column].tolist(),  # 获取X轴数据
        'y': df[y_column].tolist(),  # 获取Y轴数据
        'type': chart_type  # 图表类型
    }
    
    return jsonify(chart_data)  # 返回图表数据

@app.route('/get_table_data', methods=['POST'])  # 定义获取表格数据的路由
def get_table_data():
    """获取上传文件的数据表格"""
    data = request.json  # 获取请求中的JSON数据
    filename = data.get('filename')  # 获取文件名
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # 构建文件路径
    
    if filename.endswith('.csv'):
        df = pd.read_csv(filepath)  # 读取CSV文件
    else:
        df = pd.read_excel(filepath)  # 读取Excel文件
    
    rows = df.values.tolist()  # 将数据转换为列表
    columns = df.columns.tolist()  # 获取列名
    
    return jsonify({
        'columns': columns,  # 返回列名
        'rows': rows  # 返回数据行
    })

if __name__ == '__main__':
    app.run(debug=False)  # 运行Flask应用 