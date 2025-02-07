import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 设置随机种子以确保可重复性
np.random.seed(42)

# 生成日期序列
end_date = datetime.now()
dates = [end_date - timedelta(days=x) for x in range(1000)]
dates.reverse()

# 生成初始价格
initial_price = 100.0
price_data = []
current_price = initial_price

# 生成价格数据
for date in dates:
    # 生成当天的价格变动
    daily_volatility = np.random.normal(0, 0.02)  # 2%的标准差
    open_price = current_price * (1 + np.random.normal(0, 0.01))  # 开盘价
    close_price = open_price * (1 + daily_volatility)  # 收盘价
    
    # 确保最高价和最低价合理
    high_price = max(open_price, close_price) * (1 + abs(np.random.normal(0, 0.005)))
    low_price = min(open_price, close_price) * (1 - abs(np.random.normal(0, 0.005)))
    
    # 生成交易量（单位：万股）
    volume = abs(np.random.normal(500, 100))
    
    price_data.append({
        '日期': date.strftime('%Y-%m-%d'),
        '开盘价': round(open_price, 2),
        '收盘价': round(close_price, 2),
        '最高价': round(high_price, 2),
        '最低价': round(low_price, 2),
        '成交量': round(volume, 2)
    })
    
    current_price = close_price

# 创建DataFrame并保存为CSV
df = pd.DataFrame(price_data)
df.to_csv('stock_data.csv', index=False, encoding='utf-8')

print("数据已生成并保存到 stock_data.csv")

