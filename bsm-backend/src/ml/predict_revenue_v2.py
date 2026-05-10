"""
PREDICT REVENUE - PRODUCTION (Hybrid Approach)
===============================================
Mục đích: Dự đoán doanh thu cho từng chủ trọ
Strategy: 
  - Chủ trọ CŨ: Historical average + Seasonal pattern từ global model
  - Chủ trọ MỚI: Global model predictions với VNĐ context
"""

import sys
import json
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta
import io

# Fix Windows encoding issue
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Get script directory for absolute paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'models', 'revenue_model.pkl')
METADATA_PATH = os.path.join(SCRIPT_DIR, 'models', 'model_metadata.json')

# ================================
# 1. LOAD PRE-TRAINED MODEL
# ================================
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    
    # Load metadata
    try:
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
            model_r2 = metadata['metrics']['test']['r2_score']
            trained_size = metadata['dataset_size']
    except:
        model_r2 = 0.80
        trained_size = 100000
        
except FileNotFoundError:
    print(json.dumps({
        "error": "Model chưa được train. Vui lòng chạy: python train_model.py"
    }, ensure_ascii=False))
    sys.exit(1)

# ================================
# 2. ĐỌC INPUT TỪ STDIN
# ================================
try:
    input_data = json.load(sys.stdin)
    history_data = input_data.get('history', [])
    months_to_predict = int(input_data.get('months', 6))
    sim_occupancy = input_data.get('simOccupancy')
    total_rooms = int(input_data.get('totalRooms', 1))
    owner_id = input_data.get('ownerId')
except Exception as e:
    print(json.dumps({"error": f"Lỗi đọc dữ liệu: {str(e)}"}, ensure_ascii=False))
    sys.exit(1)

# ================================
# 3. PHÂN TÍCH DỮ LIỆU LỊCH SỬ
# ================================
data_count = len(history_data) if history_data else 0
is_new_owner = data_count < 3

if is_new_owner:
    prediction_type = "cold_start"
    reliability = 65
    reliability_note = f"Chủ trọ mới ({data_count} tháng dữ liệu). Dự đoán dựa trên pattern chung từ {trained_size:,} bookings. Độ tin cậy: {reliability}%."
else:
    prediction_type = "personalized"
    if data_count < 6:
        reliability = 75
    elif data_count < 12:
        reliability = 85
    else:
        reliability = 92
    reliability_note = f"Có {data_count} tháng dữ liệu. Độ tin cậy: {reliability}%."

# ================================
# 4. TÍNH TOÁN BASELINE METRICS
# ================================
if not is_new_owner and len(history_data) > 0:
    # Chủ trọ CŨ: Phân tích lịch sử
    df_hist = pd.DataFrame(history_data)
    df_hist['date'] = pd.to_datetime(df_hist['month'] + "-01")
    df_hist = df_hist.sort_values('date')
    df_hist['revenue'] = df_hist['revenue'].astype(float)
    
    # Tính occupancy
    if 'paid_rooms' in df_hist.columns:
        df_hist['occupancy_rate'] = df_hist['paid_rooms'].astype(float) / total_rooms
    else:
        df_hist['occupancy_rate'] = 0.85
    
    # Metrics
    avg_revenue = df_hist['revenue'].mean()
    avg_occupancy = df_hist['occupancy_rate'].mean()
    last_date = df_hist['date'].iloc[-1]
    
    # Trend analysis
    if len(df_hist) >= 3:
        first_half = df_hist['revenue'].iloc[:len(df_hist)//2].mean()
        second_half = df_hist['revenue'].iloc[len(df_hist)//2:].mean()
        trend_pct = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0
    else:
        trend_pct = 0
    
    # Seasonal pattern từ lịch sử (nếu có đủ data)
    if len(df_hist) >= 6:
        df_hist['month_num'] = df_hist['date'].dt.month
        seasonal_avg = df_hist.groupby('month_num')['revenue'].mean().to_dict()
    else:
        seasonal_avg = {}
    
else:
    # Chủ trọ MỚI: Dùng giá trị mặc định
    if history_data and len(history_data) > 0:
        recent = history_data[-1]
        avg_revenue = recent.get('revenue', 3500000 * total_rooms)
        avg_occupancy = recent.get('paid_rooms', total_rooms * 0.7) / total_rooms if total_rooms > 0 else 0.7
    else:
        avg_revenue = 3500000 * total_rooms
        avg_occupancy = 0.70
    
    last_date = datetime.now()
    trend_pct = 0
    seasonal_avg = {}

# ================================
# 5. LẤY SEASONAL MULTIPLIERS TỪ MODEL
# ================================
# Dùng model để học seasonal pattern (tháng nào cao/thấp hơn)
target_occupancy = float(sim_occupancy) / 100 if sim_occupancy else avg_occupancy

# Tính seasonal multiplier cho mỗi tháng từ global model
seasonal_multipliers = {}
base_adr = 100  # Baseline ADR
base_nights = 25  # Baseline nights

for month in range(1, 13):
    quarter = (month - 1) // 3 + 1
    features = pd.DataFrame([{
        'month_num': month,
        'quarter': quarter,
        'total_nights': base_nights,
        'total_guests': 2.0,
        'weekend_ratio': 0.29,
        'is_repeated': 0.3,
        'lead_time_cat': 2,
        'has_changes': 0.2,
        'has_special_requests': 0.15,
        'adr': base_adr
    }])
    
    pred = model.predict(features)[0]
    seasonal_multipliers[month] = pred

# Normalize multipliers (trung bình = 1.0)
avg_pred = np.mean(list(seasonal_multipliers.values()))
seasonal_multipliers = {k: v / avg_pred for k, v in seasonal_multipliers.items()}

# ================================
# 6. DỰ ĐOÁN TƯƠNG LAI
# ================================
future_predictions = []

# Base revenue (điều chỉnh theo occupancy simulation)
occupancy_adjustment = target_occupancy / avg_occupancy if avg_occupancy > 0 else 1.0
base_revenue = avg_revenue * occupancy_adjustment

for i in range(1, months_to_predict + 1):
    next_date = last_date + relativedelta(months=i)
    month_num = next_date.month
    
    # Bắt đầu từ base revenue
    predicted_revenue = base_revenue
    
    # Áp dụng seasonal multiplier từ global model
    seasonal_factor = seasonal_multipliers.get(month_num, 1.0)
    predicted_revenue *= seasonal_factor
    
    # Áp dụng trend (nếu có)
    if not is_new_owner and abs(trend_pct) > 5:
        trend_factor = 1 + (trend_pct / 100) * (i / months_to_predict)
        predicted_revenue *= trend_factor
    
    # Uncertainty bounds
    if is_new_owner:
        uncertainty = 0.20  # ±20%
    else:
        uncertainty = 0.15  # ±15%
    
    future_predictions.append({
        "month": next_date.strftime("%Y-%m"),
        "realistic": round(float(predicted_revenue), 0),
        "optimistic": round(float(predicted_revenue * (1 + uncertainty)), 0),
        "pessimistic": round(float(predicted_revenue * (1 - uncertainty)), 0)
    })

# ================================
# 7. PHÂN TÍCH & INSIGHTS CHI TIẾT
# ================================
total_predicted = sum(p["realistic"] for p in future_predictions)
avg_predicted = total_predicted / months_to_predict if months_to_predict > 0 else 0

explanations = []
recommendations = []  # Khuyến nghị hành động

# ===== PHẦN 1: LOẠI DỰ ĐOÁN =====
if is_new_owner:
    explanations.append(
        f"🆕 **Chủ trọ mới**: AI học từ {trained_size:,} bookings khách sạn (Kaggle Dataset). "
        f"Model hiểu quy luật chung về mùa vụ, occupancy, pricing. "
        f"Độ chính xác sẽ tăng khi có thêm dữ liệu lịch sử."
    )
    recommendations.append({
        "type": "data",
        "priority": "high",
        "title": "Tích lũy dữ liệu",
        "description": "Hãy duy trì ghi chép hóa đơn đầy đủ. Sau 6-12 tháng, AI sẽ dự đoán chính xác hơn dựa trên pattern riêng của bạn.",
        "action": "Đảm bảo mọi hóa đơn được ghi nhận đúng hạn"
    })
else:
    explanations.append(
        f"✅ **Dự đoán cá nhân hóa**: AI phân tích {data_count} tháng lịch sử riêng của bạn "
        f"kết hợp với seasonal pattern từ {trained_size:,} bookings toàn cầu."
    )

# ===== PHẦN 2: XU HƯỚNG & KHUYẾN NGHỊ =====
if not is_new_owner and abs(trend_pct) > 5:
    if trend_pct > 0:
        explanations.append(f"📈 **Xu hướng tích cực**: Doanh thu tăng {trend_pct:.1f}% trong thời gian gần đây.")
        recommendations.append({
            "type": "growth",
            "priority": "medium",
            "title": "Duy trì đà tăng trưởng",
            "description": f"Doanh thu đang tăng {trend_pct:.1f}%. Đây là thời điểm tốt để mở rộng hoặc nâng cấp dịch vụ.",
            "action": "Xem xét tăng giá nhẹ (3-5%) hoặc đầu tư cải thiện tiện ích"
        })
    else:
        explanations.append(f"📉 **Xu hướng sụt giảm**: Doanh thu giảm {abs(trend_pct):.1f}%. Cần hành động ngay.")
        recommendations.append({
            "type": "alert",
            "priority": "high",
            "title": "Cảnh báo sụt giảm",
            "description": f"Doanh thu giảm {abs(trend_pct):.1f}%. Cần kiểm tra nguyên nhân và điều chỉnh chiến lược.",
            "action": "Phân tích: Giá quá cao? Cạnh tranh tăng? Chất lượng dịch vụ?"
        })
        
        # Phân tích nguyên nhân
        if avg_occupancy < 0.7:
            recommendations.append({
                "type": "occupancy",
                "priority": "high",
                "title": "Cải thiện tỷ lệ lấp đầy",
                "description": f"Occupancy chỉ {avg_occupancy*100:.1f}%. Đây là nguyên nhân chính doanh thu giảm.",
                "action": "Giảm giá 5-10% hoặc chạy khuyến mãi để thu hút khách"
            })
        else:
            recommendations.append({
                "type": "pricing",
                "priority": "medium",
                "title": "Tối ưu giá phòng",
                "description": "Occupancy tốt nhưng doanh thu giảm. Có thể giá phòng đang thấp.",
                "action": "Xem xét tăng giá 3-5% để tối ưu doanh thu"
            })

# ===== PHẦN 3: MÙA VỤ & KHUYẾN NGHỊ THEO THÁNG =====
seasonal_insights = {
    1: {
        "insight": "Tháng sau Tết, nhu cầu thuê tăng mạnh",
        "recommendation": {
            "type": "seasonal",
            "priority": "medium",
            "title": "Tận dụng cao điểm sau Tết",
            "description": "Tháng 1 là thời điểm nhiều người tìm phòng mới sau kỳ nghỉ Tết.",
            "action": "Đăng tin cho thuê tích cực, có thể tăng giá 5-10%"
        }
    },
    2: {
        "insight": "Dịp Tết, rủi ro trống phòng cao",
        "recommendation": {
            "type": "seasonal",
            "priority": "high",
            "title": "Chuẩn bị cho Tết",
            "description": "Nhiều khách về quê, phòng có thể trống. Doanh thu thường giảm 15-20%.",
            "action": "Ưu đãi cho khách ở lại Tết hoặc tìm khách ngắn hạn"
        }
    },
    5: {
        "insight": "Cuối học kỳ, sinh viên bắt đầu trả phòng",
        "recommendation": {
            "type": "seasonal",
            "priority": "medium",
            "title": "Chuẩn bị mùa hè",
            "description": "Sinh viên kết thúc học kỳ, có thể trả phòng. Doanh thu giảm 10-15%.",
            "action": "Tìm khách mới sớm, xem xét cho thuê ngắn hạn"
        }
    },
    6: {
        "insight": "Mùa hè, doanh thu thường giảm 10-15%",
        "recommendation": {
            "type": "seasonal",
            "priority": "high",
            "title": "Chiến lược mùa hè",
            "description": "Thấp điểm trong năm. Sinh viên về quê, ít người thuê mới.",
            "action": "Giảm giá 10-15% hoặc khuyến mãi để duy trì occupancy"
        }
    },
    7: {
        "insight": "Thấp điểm mùa hè",
        "recommendation": {
            "type": "seasonal",
            "priority": "high",
            "title": "Duy trì trong mùa thấp điểm",
            "description": "Tháng khó khăn nhất. Cần linh hoạt về giá và điều kiện thuê.",
            "action": "Ưu đãi đặc biệt: Miễn phí 1 tháng khi thuê 6 tháng"
        }
    },
    8: {
        "insight": "Chuẩn bị năm học mới, bắt đầu tăng",
        "recommendation": {
            "type": "seasonal",
            "priority": "medium",
            "title": "Chuẩn bị cao điểm",
            "description": "Sinh viên bắt đầu tìm phòng cho năm học mới. Nhu cầu tăng dần.",
            "action": "Đăng tin sớm, chuẩn bị phòng sạch sẽ, có thể tăng giá nhẹ"
        }
    },
    9: {
        "insight": "Tháng vàng - sinh viên nhập học, tăng 15-20%",
        "recommendation": {
            "type": "seasonal",
            "priority": "high",
            "title": "Tận dụng cao điểm tháng 9",
            "description": "Đỉnh điểm trong năm! Sinh viên nhập học, nhu cầu thuê phòng cực cao.",
            "action": "Tăng giá 10-15%, ưu tiên khách dài hạn, có thể yêu cầu đặt cọc cao hơn"
        }
    },
    10: {
        "insight": "Duy trì đà tăng từ tháng 9",
        "recommendation": {
            "type": "seasonal",
            "priority": "medium",
            "title": "Duy trì momentum",
            "description": "Vẫn còn sinh viên tìm phòng muộn. Occupancy cao.",
            "action": "Giữ giá cao, tập trung vào chất lượng dịch vụ"
        }
    },
    11: {
        "insight": "Ổn định, chuẩn bị cuối năm",
        "recommendation": {
            "type": "seasonal",
            "priority": "low",
            "title": "Giai đoạn ổn định",
            "description": "Occupancy ổn định. Thời điểm tốt để bảo trì, nâng cấp.",
            "action": "Kiểm tra, sửa chữa phòng trống để sẵn sàng cho năm mới"
        }
    },
    12: {
        "insight": "Cuối năm, chuẩn bị Tết",
        "recommendation": {
            "type": "seasonal",
            "priority": "medium",
            "title": "Chuẩn bị Tết",
            "description": "Một số khách có thể về quê sớm. Doanh thu có thể giảm nhẹ.",
            "action": "Thông báo lịch nghỉ Tết sớm, thu tiền trước"
        }
    }
}

next_month = (last_date + relativedelta(months=1)).month
if next_month in seasonal_insights:
    seasonal_data = seasonal_insights[next_month]
    explanations.append(f"🗓️ **Yếu tố mùa vụ**: {seasonal_data['insight']}.")
    recommendations.append(seasonal_data['recommendation'])

# ===== PHẦN 4: OCCUPANCY SIMULATION =====
if abs(target_occupancy - avg_occupancy) > 0.05:
    diff = (target_occupancy - avg_occupancy) * 100
    impact = (occupancy_adjustment - 1) * 100
    
    if diff > 0:
        explanations.append(
            f"💡 **Giả lập tăng lấp đầy**: Nếu tăng từ {round(avg_occupancy*100)}% lên {round(target_occupancy*100)}% "
            f"(+{diff:.1f}%), doanh thu sẽ tăng ~{impact:.1f}%."
        )
        recommendations.append({
            "type": "simulation",
            "priority": "medium",
            "title": f"Cách đạt {round(target_occupancy*100)}% lấp đầy",
            "description": f"Để tăng từ {round(avg_occupancy*100)}% lên {round(target_occupancy*100)}%, bạn cần thu hút thêm {int((target_occupancy - avg_occupancy) * total_rooms)} phòng.",
            "action": "Đăng tin trên nhiều kênh, cải thiện ảnh/mô tả, giảm giá nhẹ nếu cần"
        })
    else:
        explanations.append(
            f"⚠️ **Giả lập giảm lấp đầy**: Nếu giảm xuống {round(target_occupancy*100)}% "
            f"({diff:.1f}%), doanh thu sẽ giảm ~{abs(impact):.1f}%."
        )

# ===== PHẦN 5: PHÂN TÍCH SÂU (CHỈ CHO CHỦ TRỌ CŨ) =====
if not is_new_owner and len(df_hist) >= 6:
    # Phân tích biến động
    revenue_std = df_hist['revenue'].std()
    revenue_cv = (revenue_std / avg_revenue * 100) if avg_revenue > 0 else 0
    
    if revenue_cv > 20:
        explanations.append(
            f"📊 **Biến động cao**: Doanh thu dao động mạnh (CV={revenue_cv:.1f}%). "
            f"Điều này cho thấy occupancy hoặc giá phòng không ổn định."
        )
        recommendations.append({
            "type": "stability",
            "priority": "medium",
            "title": "Ổn định doanh thu",
            "description": f"Doanh thu biến động {revenue_cv:.1f}% - quá cao. Cần tìm nguyên nhân.",
            "action": "Phân tích: Khách ngắn hạn nhiều? Giá thay đổi thường xuyên? Cần ổn định hơn"
        })
    
    # Phân tích occupancy
    if avg_occupancy < 0.7:
        recommendations.append({
            "type": "occupancy",
            "priority": "high",
            "title": "Occupancy thấp - Cần hành động ngay",
            "description": f"Chỉ {avg_occupancy*100:.1f}% phòng có người. Đây là vấn đề nghiêm trọng.",
            "action": "Kiểm tra: Giá có quá cao? Vị trí có vấn đề? Cạnh tranh gay gắt? Marketing yếu?"
        })
    elif avg_occupancy > 0.95:
        recommendations.append({
            "type": "pricing",
            "priority": "high",
            "title": "Occupancy quá cao - Tăng giá!",
            "description": f"Lấp đầy {avg_occupancy*100:.1f}% - gần như full. Bạn đang để mất cơ hội tăng doanh thu.",
            "action": "Tăng giá 10-15% ngay. Nếu vẫn full, tiếp tục tăng đến khi occupancy về 85-90%"
        })
    elif avg_occupancy >= 0.85:
        recommendations.append({
            "type": "optimal",
            "priority": "low",
            "title": "Occupancy tối ưu",
            "description": f"Lấp đầy {avg_occupancy*100:.1f}% - rất tốt! Đây là mức cân bằng giữa giá và occupancy.",
            "action": "Duy trì chiến lược hiện tại, tập trung vào chất lượng dịch vụ"
        })

# ===== PHẦN 6: SO SÁNH VỚI THÁNG TRƯỚC =====
if not is_new_owner and len(df_hist) >= 2:
    last_month_revenue = df_hist['revenue'].iloc[-1]
    prev_month_revenue = df_hist['revenue'].iloc[-2]
    mom_change = ((last_month_revenue - prev_month_revenue) / prev_month_revenue * 100) if prev_month_revenue > 0 else 0
    
    if abs(mom_change) > 10:
        if mom_change > 0:
            explanations.append(
                f"📈 **Tăng trưởng tháng gần nhất**: +{mom_change:.1f}% so với tháng trước. "
                f"Xu hướng tích cực!"
            )
        else:
            explanations.append(
                f"📉 **Giảm tháng gần nhất**: {mom_change:.1f}% so với tháng trước. "
                f"Cần theo dõi sát."
            )

# ================================
# 8. TRẢ KẾT QUẢ
# ================================
result = {
    "predictions": future_predictions,
    "totalPredicted": round(total_predicted, 0),
    "accuracy": {
        "r2_score": round(model_r2 * 100, 1),
        "data_months": data_count,
        "prediction_type": prediction_type,
        "reliability": reliability,
        "reliability_note": reliability_note
    },
    "insight": {
        "avgOccupancy": round(avg_occupancy * 100, 1),
        "targetOccupancy": round(target_occupancy * 100, 1),
        "avgRevenue": round(avg_predicted, 0),
        "totalRooms": total_rooms
    },
    "explanations": explanations,
    "recommendations": recommendations,  # ← NEW: Khuyến nghị hành động
    "model_info": {
        "type": "Hybrid: Historical Average + Global Seasonal Pattern",
        "trained_on": "Kaggle Hotel Bookings Dataset",
        "dataset_size": trained_size,
        "trained_at": metadata.get('trained_at', 'Unknown'),
        "note": "Combines owner history with global seasonal knowledge"
    }
}

# Thêm history (luôn luôn, kể cả chủ trọ mới)
result["history"] = history_data

print(json.dumps(result, ensure_ascii=False))
