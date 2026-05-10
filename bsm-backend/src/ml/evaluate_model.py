"""
EVALUATE MODEL - Đánh giá chi tiết mô hình
==========================================
Mục đích: Đánh giá toàn diện model đã train
Output: evaluation_results.json
"""

import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime
from sklearn.metrics import (
    r2_score, 
    mean_absolute_error, 
    mean_squared_error,
    mean_absolute_percentage_error
)
from sklearn.model_selection import cross_val_score
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("📊 ĐÁNH GIÁ MÔ HÌNH MACHINE LEARNING")
print("=" * 60)

# ================================
# 1. LOAD MODEL & DATA
# ================================
print("\n📂 Đang load model và data...")

try:
    # Load model
    with open('models/revenue_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    # Load metadata
    with open('models/model_metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    # Load dataset
    df = pd.read_csv('data/hotel_bookings.csv')
    
    print("✅ Load thành công!")
    print(f"   Model: {metadata['model_type']}")
    print(f"   Trained: {metadata['trained_at']}")
    print(f"   Dataset: {len(df):,} records")
    
except FileNotFoundError as e:
    print(f"❌ Lỗi: {e}")
    print("   Vui lòng chạy train_model.py trước")
    exit(1)

# ================================
# 2. PREPARE DATA (giống train_model.py)
# ================================
print("\n🔧 Chuẩn bị dữ liệu...")

# Cleaning
df = df[df['is_canceled'] == 0].copy()
df = df[df['adr'] > 0].copy()

# Feature Engineering
df['total_nights'] = df['stays_in_weekend_nights'] + df['stays_in_week_nights']
df = df[df['total_nights'] > 0].copy()
df['revenue'] = df['adr'] * df['total_nights']
df['total_guests'] = (df['adults'] + df['children'].fillna(0) + df['babies'].fillna(0)).clip(lower=1)

month_map = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
}
df['month_num'] = df['arrival_date_month'].map(month_map)
df['quarter'] = ((df['month_num'] - 1) // 3) + 1
df['weekend_ratio'] = df['stays_in_weekend_nights'] / df['total_nights']
df['is_repeated'] = df['is_repeated_guest'].astype(int)
df['lead_time'] = df['lead_time'].fillna(0)
df['lead_time_cat'] = pd.cut(df['lead_time'], bins=[-1, 7, 30, 90, 365, 9999], labels=[0, 1, 2, 3, 4]).astype(int)
df['has_changes'] = (df['booking_changes'] > 0).astype(int)
df['has_special_requests'] = (df['total_of_special_requests'] > 0).astype(int)

FEATURES = metadata['features']
TARGET = metadata['target']

df_clean = df[FEATURES + [TARGET]].dropna()
X = df_clean[FEATURES]
y = df_clean[TARGET]

print(f"✅ Dataset sạch: {len(df_clean):,} records")

# ================================
# 3. TRAIN-TEST SPLIT (giống training)
# ================================
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Train: {len(X_train):,} | Test: {len(X_test):,}")

# ================================
# 4. PREDICTIONS
# ================================
print("\n🔮 Đang predict...")

y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

print("✅ Predictions hoàn tất!")

# ================================
# 5. METRICS CALCULATION
# ================================
print("\n📊 Tính toán metrics...")

def calculate_detailed_metrics(y_true, y_pred, dataset_name):
    """Tính toán metrics chi tiết"""
    
    # Basic metrics
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    
    # MAPE
    mask = y_true > 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    
    # Additional metrics
    residuals = y_true - y_pred
    
    # Mean Residual
    mean_residual = np.mean(residuals)
    
    # Median Absolute Error
    median_ae = np.median(np.abs(residuals))
    
    # Max Error
    max_error = np.max(np.abs(residuals))
    
    # Percentage within threshold
    threshold_5 = np.sum(np.abs(residuals / y_true) < 0.05) / len(y_true) * 100
    threshold_10 = np.sum(np.abs(residuals / y_true) < 0.10) / len(y_true) * 100
    threshold_20 = np.sum(np.abs(residuals / y_true) < 0.20) / len(y_true) * 100
    
    metrics = {
        "mae": float(mae),
        "mse": float(mse),
        "rmse": float(rmse),
        "r2_score": float(r2),
        "mape": float(mape),
        "mean_residual": float(mean_residual),
        "median_absolute_error": float(median_ae),
        "max_error": float(max_error),
        "within_5_percent": float(threshold_5),
        "within_10_percent": float(threshold_10),
        "within_20_percent": float(threshold_20)
    }
    
    print(f"\n{dataset_name}:")
    print(f"  R² Score:        {r2*100:6.2f}%")
    print(f"  MAE:             ${mae:,.2f}")
    print(f"  RMSE:            ${rmse:,.2f}")
    print(f"  MAPE:            {mape:6.2f}%")
    print(f"  Median AE:       ${median_ae:,.2f}")
    print(f"  Max Error:       ${max_error:,.2f}")
    print(f"  Within ±5%:      {threshold_5:6.2f}%")
    print(f"  Within ±10%:     {threshold_10:6.2f}%")
    print(f"  Within ±20%:     {threshold_20:6.2f}%")
    
    return metrics

train_metrics = calculate_detailed_metrics(y_train, y_train_pred, "📚 TRAIN SET")
test_metrics = calculate_detailed_metrics(y_test, y_test_pred, "🧪 TEST SET")

# ================================
# 6. CROSS-VALIDATION (Optional)
# ================================
print("\n🔄 Cross-Validation (5-fold)...")

try:
    cv_scores = cross_val_score(
        model, X_train, y_train, 
        cv=5, 
        scoring='r2',
        n_jobs=-1
    )
    
    cv_results = {
        "mean": float(cv_scores.mean()),
        "std": float(cv_scores.std()),
        "scores": [float(s) for s in cv_scores]
    }
    
    print(f"  Mean R²: {cv_scores.mean()*100:.2f}% (±{cv_scores.std()*100:.2f}%)")
    print(f"  Scores: {[f'{s*100:.2f}%' for s in cv_scores]}")
    
except Exception as e:
    print(f"  ⚠️ Bỏ qua CV (quá lâu): {e}")
    cv_results = None

# ================================
# 7. RESIDUAL ANALYSIS
# ================================
print("\n📉 Phân tích residuals...")

train_residuals = y_train - y_train_pred
test_residuals = y_test - y_test_pred

residual_analysis = {
    "train": {
        "mean": float(np.mean(train_residuals)),
        "std": float(np.std(train_residuals)),
        "min": float(np.min(train_residuals)),
        "max": float(np.max(train_residuals)),
        "q25": float(np.percentile(train_residuals, 25)),
        "q50": float(np.percentile(train_residuals, 50)),
        "q75": float(np.percentile(train_residuals, 75))
    },
    "test": {
        "mean": float(np.mean(test_residuals)),
        "std": float(np.std(test_residuals)),
        "min": float(np.min(test_residuals)),
        "max": float(np.max(test_residuals)),
        "q25": float(np.percentile(test_residuals, 25)),
        "q50": float(np.percentile(test_residuals, 50)),
        "q75": float(np.percentile(test_residuals, 75))
    }
}

print(f"  Train Residuals: μ={residual_analysis['train']['mean']:.2f}, σ={residual_analysis['train']['std']:.2f}")
print(f"  Test Residuals:  μ={residual_analysis['test']['mean']:.2f}, σ={residual_analysis['test']['std']:.2f}")

# ================================
# 8. FEATURE IMPORTANCE
# ================================
print("\n🎯 Feature Importance:")

feature_importance = pd.DataFrame({
    'feature': FEATURES,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:25s}: {row['importance']*100:5.2f}%")

# ================================
# 9. OVERFITTING CHECK
# ================================
print("\n🔍 Kiểm tra Overfitting:")

r2_diff = abs(train_metrics['r2_score'] - test_metrics['r2_score'])
mae_diff = abs(train_metrics['mae'] - test_metrics['mae'])

print(f"  R² diff:  {r2_diff*100:.2f}%")
print(f"  MAE diff: ${mae_diff:.2f}")

if r2_diff < 0.05:
    overfitting_status = "✅ Không có overfitting"
    overfitting_level = "none"
elif r2_diff < 0.1:
    overfitting_status = "⚠️ Overfitting nhẹ"
    overfitting_level = "mild"
else:
    overfitting_status = "❌ Overfitting nghiêm trọng"
    overfitting_level = "severe"

print(f"  {overfitting_status}")

# ================================
# 10. MODEL QUALITY ASSESSMENT
# ================================
print("\n⭐ Đánh giá chất lượng:")

r2_test = test_metrics['r2_score']

if r2_test >= 0.9:
    quality = "⭐⭐⭐⭐⭐ EXCELLENT"
    quality_level = "excellent"
elif r2_test >= 0.8:
    quality = "⭐⭐⭐⭐ GOOD"
    quality_level = "good"
elif r2_test >= 0.7:
    quality = "⭐⭐⭐ ACCEPTABLE"
    quality_level = "acceptable"
else:
    quality = "⭐⭐ NEEDS IMPROVEMENT"
    quality_level = "poor"

print(f"  {quality}")
print(f"  R² Score: {r2_test*100:.2f}%")
print(f"  MAPE: {test_metrics['mape']:.2f}%")

# ================================
# 11. SAVE RESULTS
# ================================
print("\n💾 Lưu kết quả...")

evaluation_results = {
    "evaluated_at": datetime.now().isoformat(),
    "model_info": {
        "type": metadata['model_type'],
        "trained_at": metadata['trained_at'],
        "hyperparameters": metadata['hyperparameters']
    },
    "dataset": {
        "total_records": len(df),
        "clean_records": len(df_clean),
        "train_size": len(X_train),
        "test_size": len(X_test)
    },
    "metrics": {
        "train": train_metrics,
        "test": test_metrics
    },
    "cross_validation": cv_results,
    "residual_analysis": residual_analysis,
    "feature_importance": feature_importance.to_dict('records'),
    "overfitting": {
        "r2_diff": float(r2_diff),
        "mae_diff": float(mae_diff),
        "status": overfitting_status,
        "level": overfitting_level
    },
    "quality": {
        "rating": quality,
        "level": quality_level,
        "r2_score": float(r2_test),
        "mape": float(test_metrics['mape'])
    }
}

output_path = 'models/evaluation_results.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(evaluation_results, f, indent=2, ensure_ascii=False)

print(f"✅ Kết quả đã lưu: {output_path}")

# ================================
# 12. SUMMARY
# ================================
print("\n" + "=" * 60)
print("📋 TỔNG KẾT ĐÁNH GIÁ")
print("=" * 60)

print(f"\n🎯 Chất lượng Model: {quality}")
print(f"   R² Score (Test): {r2_test*100:.2f}%")
print(f"   MAE (Test): ${test_metrics['mae']:,.2f}")
print(f"   MAPE (Test): {test_metrics['mape']:.2f}%")

print(f"\n🔍 Overfitting: {overfitting_status}")
print(f"   R² diff: {r2_diff*100:.2f}%")

print(f"\n🎯 Top 3 Features:")
for i, row in enumerate(feature_importance.head(3).itertuples(), 1):
    print(f"   {i}. {row.feature}: {row.importance*100:.1f}%")

print(f"\n✅ Predictions trong ±10%: {test_metrics['within_10_percent']:.1f}%")
print(f"✅ Predictions trong ±20%: {test_metrics['within_20_percent']:.1f}%")

print("\n" + "=" * 60)
print("✅ ĐÁNH GIÁ HOÀN TẤT!")
print("=" * 60)
print(f"\n📊 Xem biểu đồ: python visualize_results.py")
print()
