"""
TRAIN RANDOM FOREST MODEL - GLOBAL KNOWLEDGE
=============================================
Mục đích: Train model từ Kaggle Hotel Bookings Dataset
Strategy: Học quy luật chung về booking/occupancy/revenue
Input: data/hotel_bookings.csv (Kaggle)
Output: models/revenue_model.pkl
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

print("=" * 60)
print("🚀 TRAINING GLOBAL REVENUE MODEL")
print("=" * 60)

# ================================
# 1. LOAD KAGGLE DATASET
# ================================
print("\n📂 Đang load Kaggle Hotel Bookings Dataset...")

try:
    df = pd.read_csv('data/hotel_bookings.csv')
    print(f"✅ Loaded: {len(df):,} bookings")
    print(f"✅ Columns: {len(df.columns)}")
except FileNotFoundError:
    print("❌ Lỗi: Không tìm thấy data/hotel_bookings.csv")
    print("   Vui lòng tải dataset từ Kaggle và đặt vào thư mục data/")
    exit(1)

# ================================
# 2. DATA CLEANING & PREPROCESSING
# ================================
print("\n🧹 Cleaning data...")

# Loại bỏ bookings bị cancel
df = df[df['is_canceled'] == 0].copy()
print(f"✅ Sau khi loại canceled: {len(df):,} bookings")

# Loại bỏ ADR = 0 (không hợp lệ)
df = df[df['adr'] > 0].copy()
print(f"✅ Sau khi loại ADR=0: {len(df):,} bookings")

# ================================
# 3. FEATURE ENGINEERING
# ================================
print("\n🔧 Feature Engineering...")

# Tính tổng số đêm ở
df['total_nights'] = df['stays_in_weekend_nights'] + df['stays_in_week_nights']

# Loại bỏ bookings 0 đêm
df = df[df['total_nights'] > 0].copy()

# Tính revenue (ADR * số đêm)
df['revenue'] = df['adr'] * df['total_nights']

# Tính tổng số người
df['total_guests'] = df['adults'] + df['children'].fillna(0) + df['babies'].fillna(0)
df['total_guests'] = df['total_guests'].clip(lower=1)  # Ít nhất 1 người

# Revenue per guest
df['revenue_per_guest'] = df['revenue'] / df['total_guests']

# Month number (1-12)
month_map = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
}
df['month_num'] = df['arrival_date_month'].map(month_map)

# Quarter
df['quarter'] = ((df['month_num'] - 1) // 3) + 1

# Weekend ratio
df['weekend_ratio'] = df['stays_in_weekend_nights'] / df['total_nights']

# Is repeated guest
df['is_repeated'] = df['is_repeated_guest'].astype(int)

# Lead time category
df['lead_time'] = df['lead_time'].fillna(0)
df['lead_time_cat'] = pd.cut(df['lead_time'], 
                              bins=[-1, 7, 30, 90, 365, 9999],
                              labels=[0, 1, 2, 3, 4]).astype(int)

# Booking changes
df['has_changes'] = (df['booking_changes'] > 0).astype(int)

# Special requests
df['has_special_requests'] = (df['total_of_special_requests'] > 0).astype(int)

print(f"✅ Features created")

# ================================
# 4. SELECT FEATURES
# ================================
FEATURES = [
    'month_num',              # Tháng trong năm (mùa vụ)
    'quarter',                # Quý
    'total_nights',           # Số đêm ở
    'total_guests',           # Số khách
    'weekend_ratio',          # Tỷ lệ cuối tuần
    'is_repeated',            # Khách quen
    'lead_time_cat',          # Thời gian đặt trước
    'has_changes',            # Có thay đổi booking
    'has_special_requests',   # Có yêu cầu đặc biệt
    'adr'                     # Average Daily Rate (giá phòng)
]

TARGET = 'revenue'

# Loại bỏ missing values
df_clean = df[FEATURES + [TARGET]].dropna()
print(f"✅ Clean dataset: {len(df_clean):,} records")

X = df_clean[FEATURES]
y = df_clean[TARGET]

# ================================
# 5. TRAIN-TEST SPLIT
# ================================
print("\n📊 Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Train: {len(X_train):,} records")
print(f"✅ Test: {len(X_test):,} records")

# ================================
# 6. TRAIN MODEL
# ================================
print("\n🤖 Training Random Forest...")

model = RandomForestRegressor(
    n_estimators=200,       # Số cây
    max_depth=20,           # Độ sâu
    min_samples_split=10,   # Min samples để split
    min_samples_leaf=4,     # Min samples ở leaf
    random_state=42,
    n_jobs=-1,              # Dùng tất cả CPU
    verbose=1
)

model.fit(X_train, y_train)
print("✅ Training hoàn tất!")

# ================================
# 7. EVALUATE MODEL
# ================================
print("\n📊 ĐÁNH GIÁ MODEL")
print("-" * 60)

# Predict
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

# Metrics
def calculate_metrics(y_true, y_pred, dataset_name):
    """Tính toán metrics"""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # MAPE
    mask = y_true > 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    
    print(f"\n{dataset_name}:")
    print(f"  MAE:  ${mae:,.2f}")
    print(f"  RMSE: ${rmse:,.2f}")
    print(f"  R²:   {r2*100:.2f}%")
    print(f"  MAPE: {mape:.2f}%")
    
    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2_score": float(r2),
        "mape": float(mape)
    }

train_metrics = calculate_metrics(y_train, y_train_pred, "📚 TRAIN SET")
test_metrics = calculate_metrics(y_test, y_test_pred, "🧪 TEST SET")

# ================================
# 8. FEATURE IMPORTANCE
# ================================
print("\n🎯 Feature Importance:")
print("-" * 60)

feature_importance = pd.DataFrame({
    'feature': FEATURES,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:25s}: {row['importance']*100:5.2f}%")

# ================================
# 9. SAVE MODEL
# ================================
print("\n💾 Đang lưu model...")

# Tạo thư mục models
os.makedirs('models', exist_ok=True)

# Save model
model_path = 'models/revenue_model.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"✅ Model đã lưu: {model_path}")

# ================================
# 10. SAVE METADATA
# ================================
metadata = {
    "model_type": "RandomForestRegressor",
    "trained_at": datetime.now().isoformat(),
    "dataset": "Kaggle Hotel Bookings",
    "dataset_size": len(df_clean),
    "features": FEATURES,
    "target": TARGET,
    "train_size": len(X_train),
    "test_size": len(X_test),
    "hyperparameters": {
        "n_estimators": 200,
        "max_depth": 20,
        "min_samples_split": 10,
        "min_samples_leaf": 4
    },
    "metrics": {
        "train": train_metrics,
        "test": test_metrics
    },
    "feature_importance": feature_importance.to_dict('records'),
    "note": "Global model trained on Kaggle dataset. Use with owner-specific data for personalized predictions."
}

metadata_path = 'models/model_metadata.json'
with open(metadata_path, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"✅ Metadata đã lưu: {metadata_path}")

# ================================
# 11. SUMMARY
# ================================
print("\n" + "=" * 60)
print("📋 TỔNG KẾT")
print("=" * 60)

r2_test = test_metrics['r2_score']
mae_test = test_metrics['mae']

if r2_test >= 0.85:
    quality = "⭐⭐⭐⭐⭐ EXCELLENT"
elif r2_test >= 0.75:
    quality = "⭐⭐⭐⭐ GOOD"
elif r2_test >= 0.65:
    quality = "⭐⭐⭐ ACCEPTABLE"
else:
    quality = "⭐⭐ NEEDS IMPROVEMENT"

print(f"\n🎯 Chất lượng model: {quality}")
print(f"   R² Score: {r2_test*100:.2f}%")
print(f"   MAE: ${mae_test:,.2f}")

# Overfitting check
r2_diff = abs(train_metrics['r2_score'] - test_metrics['r2_score'])
if r2_diff < 0.05:
    print(f"\n✅ Không có overfitting (diff: {r2_diff*100:.2f}%)")
elif r2_diff < 0.1:
    print(f"\n⚠️ Overfitting nhẹ (diff: {r2_diff*100:.2f}%)")
else:
    print(f"\n❌ Overfitting nghiêm trọng (diff: {r2_diff*100:.2f}%)")

# Top features
print(f"\n🔝 Top 5 features quan trọng nhất:")
for i, row in enumerate(feature_importance.head(5).itertuples(), 1):
    print(f"   {i}. {row.feature}: {row.importance*100:.1f}%")

print("\n" + "=" * 60)
print("✅ HOÀN TẤT TRAINING!")
print("=" * 60)
print("\n📌 Next Steps:")
print("   1. Test model: python predict_revenue_v2.py")
print("   2. Deploy: Model sẵn sàng cho production")
print("   3. API endpoint: /api/ai/predict-revenue")
print()
