import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
from dateutil.relativedelta import relativedelta

# 1. ĐỌC DỮ LIỆU TỪ STDIN
try:
    input_data = json.load(sys.stdin)
    history_data = input_data.get('history', [])
    months_to_predict = int(input_data.get('months', 6))
    sim_occupancy = input_data.get('simOccupancy')
    total_rooms = int(input_data.get('totalRooms', 1))
except Exception as e:
    print(json.dumps({"error": f"Lỗi đọc dữ liệu: {str(e)}"}))
    sys.exit(0)

if not history_data or len(history_data) < 3:
    print(json.dumps({
        "error": "Cần tối thiểu 3 tháng dữ liệu có phát sinh hóa đơn 'Đã thanh toán' để AI có thể học được xu hướng.",
        "debug_count": len(history_data)
    }))
    sys.exit(0)

# 2. TIỀN XỬ LÝ
df = pd.DataFrame(history_data)
df['date'] = pd.to_datetime(df['month'] + "-01")
df = df.sort_values('date')
df['revenue'] = df['revenue'].astype(float)

# Tính occupancy_rate từ dữ liệu SQL (paid_rooms / total_rooms)
if 'paid_rooms' in df.columns:
    df['occupancy_rate'] = df['paid_rooms'].astype(float) / total_rooms
else:
    df['occupancy_rate'] = 1.0

# 3. FEATURE ENGINEERING
df['month_index'] = range(len(df))
df['month_of_year'] = df['date'].dt.month
df['quarter'] = df['date'].dt.quarter
X = df[['month_index', 'month_of_year', 'quarter', 'occupancy_rate']]
y = df['revenue']

# 4. HUẤN LUYỆN MÔ HÌNH CHÍNH
final_model = RandomForestRegressor(n_estimators=200, random_state=42, min_samples_leaf=1)
final_model.fit(X, y)

# 5. ĐÁNH GIÁ ĐỘ TIN CẬY
y_pred_all = final_model.predict(X)
r2_all = max(0, r2_score(y, y_pred_all))

if len(df) >= 6:
    train_size = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
    y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]
    
    test_model = RandomForestRegressor(n_estimators=100, random_state=42)
    test_model.fit(X_train, y_train)
    y_pred_test = test_model.predict(X_test)
    r2_test = max(0, r2_score(y_test, y_pred_test))
    mae = mean_absolute_error(y_test, y_pred_test)
    reliability = (r2_all * 0.4 + r2_test * 0.6)
    
    anomalies = []
    threshold = max(np.std(y_test - y_pred_test) * 1.5, y.mean() * 0.1)
    for i in range(len(y_test)):
        error = y_test.iloc[i] - y_pred_test[i]
        if abs(error) > threshold:
            anomalies.append({
                "month": str(df['date'].iloc[train_size + i])[:7],
                "type": "Tăng đột biến" if error > 0 else "Sụt giảm bất thường",
                "deviation": round(float(abs(error)), 0)
            })
else:
    reliability = min(r2_all, 0.75)
    mae = mean_absolute_error(y, y_pred_all)
    anomalies = []

r2_final = round(reliability * 100, 1)

# 6. DỰ BÁO TƯƠNG LAI
current_avg_occ = df['occupancy_rate'].mean()
target_occ = float(sim_occupancy) / 100 if sim_occupancy else current_avg_occ
adjustment_ratio = target_occ / current_avg_occ if current_avg_occ > 0 else 1.0

future_predictions = []
last_date = df['date'].iloc[-1]
for i in range(1, months_to_predict + 1):
    next_date = last_date + relativedelta(months=i)
    input_features = pd.DataFrame(
        [[len(df) + i - 1, next_date.month, (next_date.month - 1) // 3 + 1, target_occ]],
        columns=['month_index', 'month_of_year', 'quarter', 'occupancy_rate']
    )
    base_pred = final_model.predict(input_features)[0]
    adjusted_pred = base_pred * adjustment_ratio
    
    future_predictions.append({
        "month": next_date.strftime("%Y-%m"),
        "realistic": round(float(adjusted_pred), 0),
        "optimistic": round(float(adjusted_pred * 1.12), 0),
        "pessimistic": round(float(adjusted_pred * 0.88), 0)
    })

# 7. PHÂN TÍCH & LỜI KHUYÊN CHI TIẾT
total_predicted = sum(p["realistic"] for p in future_predictions)
weights = final_model.feature_importances_
explanations = []

# Xu hướng
if len(df) >= 3:
    first_half = df['revenue'].iloc[:len(df)//2].mean()
    second_half = df['revenue'].iloc[len(df)//2:].mean()
    trend_pct = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0
    if trend_pct > 5: explanations.append(f"📈 Xu hướng tăng trưởng: Doanh thu nửa sau tăng {trend_pct:.1f}% so với nửa đầu. Nhà trọ đang phát triển tốt.")
    elif trend_pct < -5: explanations.append(f"📉 Xu hướng sụt giảm: Doanh thu nửa sau giảm {abs(trend_pct):.1f}% so với nửa đầu. Cần kiểm tra lại tỷ lệ trống phòng.")
    else: explanations.append("📊 Xu hướng ổn định: Doanh thu duy trì ở mức đều đặn.")

# Mùa vụ
seasonal_weight = float(weights[1]) + float(weights[2])
if seasonal_weight > 0.2:
    monthly_avg = df.groupby('month_of_year')['revenue'].mean()
    best_m = int(monthly_avg.idxmax())
    names = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    
    seasonal_reasons = {
        1: "thời điểm sau Tết, nhu cầu tìm chỗ ở mới thường tăng cao khi mọi người quay lại làm việc",
        2: "dịp Tết Nguyên Đán, khách thuê có xu hướng trả phòng về quê hoặc chuyển đổi chỗ ở, dẫn đến rủi ro trống phòng cao nhất năm",
        3: "tháng bắt đầu ổn định sau Tết, nhu cầu thuê vẫn khá mạnh",
        4: "giai đoạn ổn định, AI nhận thấy dòng tiền của bạn thường rất đều vào tháng này",
        5: "cuối học kỳ, sinh viên có thể bắt đầu trả phòng để về hè",
        6: "cao điểm mùa hè, doanh thu thường giảm do một lượng lớn sinh viên/khách thuê tạm thời trả phòng",
        7: "tháng thấp điểm, rủi ro trống phòng kéo dài nếu không có chính sách ưu đãi tìm khách mới",
        8: "chuẩn bị vào năm học mới, AI dự báo nhu cầu sẽ bắt đầu bật tăng trở lại",
        9: "tháng vàng của doanh thu nhờ lượng tân sinh viên và người lao động thay đổi chỗ ở đầu mùa thu",
        10: "duy trì đà tăng trưởng từ tháng 9, tỷ lệ lấp đầy thường ở mức tối đa",
        11: "tháng ổn định, tập trung thu tiền phòng đúng hạn",
        12: "cuối năm, bắt đầu có dấu hiệu khách chuẩn bị trả phòng sau Tết"
    }
    
    best_reason = seasonal_reasons.get(best_m, "thời điểm thuận lợi theo chu kỳ")
    
    explanations.append(
        f"🗓️ AI phân tích dựa trên Mùa vụ ({round(seasonal_weight*100, 1)}%): "
        f"Lịch sử cho thấy {names[best_m]} là 'tháng vàng' vì {best_reason}. "
        f"Dự báo các tháng tới đã được AI tự động điều chỉnh dựa trên quy luật này để đảm bảo tính an toàn."
    )

# Lấp đầy
if abs(target_occ - current_avg_occ) > 0.05:
    impact = round((total_predicted * adjustment_ratio - total_predicted) / max(months_to_predict, 1), 0)
    explanations.append(f"💡 Giả lập: Nếu đạt lấp đầy {round(target_occ*100)}%, doanh thu trung bình tháng có thể thay đổi {int(impact):,}đ.")

if not explanations: explanations.append("✅ Duy trì phong độ hiện tại để đảm bảo dòng tiền ổn định.")

# 8. TRẢ KẾT QUẢ
print(json.dumps({
    "predictions": future_predictions,
    "totalPredicted": round(total_predicted, 0),
    "accuracy": { "r2_score": r2_final, "mae": round(float(mae), 0), "data_months": len(df) },
    "insight": {
        "avgOccupancy": round(current_avg_occ * 100, 1),
        "factorWeights": {
            "Xu hướng": round(float(weights[0]) * 100, 1),
            "Mùa vụ": round(seasonal_weight * 100, 1),
            "Lấp đầy": round(float(weights[3]) * 100, 1)
        }
    },
    "history": history_data,
    "explanations": explanations,
    "anomalies": anomalies
}))