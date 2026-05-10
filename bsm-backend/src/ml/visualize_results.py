"""
VISUALIZE RESULTS - Vẽ biểu đồ đánh giá
========================================
Mục đích: Tạo các biểu đồ đánh giá model
Output: Các file PNG trong thư mục visualizations/
"""

import pandas as pd
import numpy as np
import pickle
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
import os
import warnings
warnings.filterwarnings('ignore')

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10

print("=" * 60)
print("📊 VẼ BIỂU ĐỒ ĐÁNH GIÁ MÔ HÌNH")
print("=" * 60)

# ================================
# 1. LOAD DATA
# ================================
print("\n📂 Đang load dữ liệu...")

try:
    # Load model
    with open('models/revenue_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    # Load evaluation results
    with open('models/evaluation_results.json', 'r', encoding='utf-8') as f:
        eval_results = json.load(f)
    
    # Load metadata
    with open('models/model_metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    # Load dataset
    df = pd.read_csv('data/hotel_bookings.csv')
    
    print("✅ Load thành công!")
    
except FileNotFoundError as e:
    print(f"❌ Lỗi: {e}")
    print("   Vui lòng chạy evaluate_model.py trước")
    exit(1)

# Create output directory
os.makedirs('visualizations', exist_ok=True)

# ================================
# 2. PREPARE DATA
# ================================
print("\n🔧 Chuẩn bị dữ liệu...")

# Cleaning & Feature Engineering (giống evaluate_model.py)
df = df[df['is_canceled'] == 0].copy()
df = df[df['adr'] > 0].copy()
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

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

print("✅ Dữ liệu sẵn sàng!")

# ================================
# 3. PLOT 1: ACTUAL VS PREDICTED
# ================================
print("\n📊 Vẽ biểu đồ 1: Actual vs Predicted...")

fig, axes = plt.subplots(1, 2, figsize=(15, 6))

# Train set
axes[0].scatter(y_train, y_train_pred, alpha=0.3, s=10)
axes[0].plot([y_train.min(), y_train.max()], [y_train.min(), y_train.max()], 'r--', lw=2)
axes[0].set_xlabel('Actual Revenue ($)', fontsize=12)
axes[0].set_ylabel('Predicted Revenue ($)', fontsize=12)
axes[0].set_title(f'Train Set (R² = {eval_results["metrics"]["train"]["r2_score"]*100:.2f}%)', fontsize=14, fontweight='bold')
axes[0].grid(True, alpha=0.3)

# Test set
axes[1].scatter(y_test, y_test_pred, alpha=0.3, s=10, color='green')
axes[1].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
axes[1].set_xlabel('Actual Revenue ($)', fontsize=12)
axes[1].set_ylabel('Predicted Revenue ($)', fontsize=12)
axes[1].set_title(f'Test Set (R² = {eval_results["metrics"]["test"]["r2_score"]*100:.2f}%)', fontsize=14, fontweight='bold')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('visualizations/1_actual_vs_predicted.png', dpi=300, bbox_inches='tight')
print("✅ Saved: visualizations/1_actual_vs_predicted.png")
plt.close()

# ================================
# 4. PLOT 2: RESIDUALS DISTRIBUTION
# ================================
print("\n📊 Vẽ biểu đồ 2: Residuals Distribution...")

train_residuals = y_train - y_train_pred
test_residuals = y_test - y_test_pred

fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Train residuals histogram
axes[0, 0].hist(train_residuals, bins=50, edgecolor='black', alpha=0.7)
axes[0, 0].axvline(0, color='red', linestyle='--', linewidth=2)
axes[0, 0].set_xlabel('Residuals ($)', fontsize=12)
axes[0, 0].set_ylabel('Frequency', fontsize=12)
axes[0, 0].set_title('Train Set: Residuals Distribution', fontsize=14, fontweight='bold')
axes[0, 0].grid(True, alpha=0.3)

# Test residuals histogram
axes[0, 1].hist(test_residuals, bins=50, edgecolor='black', alpha=0.7, color='green')
axes[0, 1].axvline(0, color='red', linestyle='--', linewidth=2)
axes[0, 1].set_xlabel('Residuals ($)', fontsize=12)
axes[0, 1].set_ylabel('Frequency', fontsize=12)
axes[0, 1].set_title('Test Set: Residuals Distribution', fontsize=14, fontweight='bold')
axes[0, 1].grid(True, alpha=0.3)

# Train residuals vs predicted
axes[1, 0].scatter(y_train_pred, train_residuals, alpha=0.3, s=10)
axes[1, 0].axhline(0, color='red', linestyle='--', linewidth=2)
axes[1, 0].set_xlabel('Predicted Revenue ($)', fontsize=12)
axes[1, 0].set_ylabel('Residuals ($)', fontsize=12)
axes[1, 0].set_title('Train Set: Residuals vs Predicted', fontsize=14, fontweight='bold')
axes[1, 0].grid(True, alpha=0.3)

# Test residuals vs predicted
axes[1, 1].scatter(y_test_pred, test_residuals, alpha=0.3, s=10, color='green')
axes[1, 1].axhline(0, color='red', linestyle='--', linewidth=2)
axes[1, 1].set_xlabel('Predicted Revenue ($)', fontsize=12)
axes[1, 1].set_ylabel('Residuals ($)', fontsize=12)
axes[1, 1].set_title('Test Set: Residuals vs Predicted', fontsize=14, fontweight='bold')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('visualizations/2_residuals_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Saved: visualizations/2_residuals_analysis.png")
plt.close()

# ================================
# 5. PLOT 3: FEATURE IMPORTANCE
# ================================
print("\n📊 Vẽ biểu đồ 3: Feature Importance...")

feature_imp = pd.DataFrame(eval_results['feature_importance'])
feature_imp = feature_imp.sort_values('importance', ascending=True)

fig, ax = plt.subplots(figsize=(10, 8))
colors = plt.cm.viridis(np.linspace(0, 1, len(feature_imp)))
ax.barh(feature_imp['feature'], feature_imp['importance'] * 100, color=colors, edgecolor='black')
ax.set_xlabel('Importance (%)', fontsize=12)
ax.set_ylabel('Features', fontsize=12)
ax.set_title('Feature Importance', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3, axis='x')

# Add values on bars
for i, (idx, row) in enumerate(feature_imp.iterrows()):
    ax.text(row['importance'] * 100 + 0.5, i, f"{row['importance']*100:.2f}%", 
            va='center', fontsize=10)

plt.tight_layout()
plt.savefig('visualizations/3_feature_importance.png', dpi=300, bbox_inches='tight')
print("✅ Saved: visualizations/3_feature_importance.png")
plt.close()

# ================================
# 6. PLOT 4: METRICS COMPARISON
# ================================
print("\n📊 Vẽ biểu đồ 4: Metrics Comparison...")

metrics_names = ['R² Score', 'MAE', 'RMSE', 'MAPE']
train_values = [
    eval_results['metrics']['train']['r2_score'] * 100,
    eval_results['metrics']['train']['mae'],
    eval_results['metrics']['train']['rmse'],
    eval_results['metrics']['train']['mape']
]
test_values = [
    eval_results['metrics']['test']['r2_score'] * 100,
    eval_results['metrics']['test']['mae'],
    eval_results['metrics']['test']['rmse'],
    eval_results['metrics']['test']['mape']
]

fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# R² Score
axes[0, 0].bar(['Train', 'Test'], [train_values[0], test_values[0]], color=['blue', 'green'], edgecolor='black')
axes[0, 0].set_ylabel('R² Score (%)', fontsize=12)
axes[0, 0].set_title('R² Score Comparison', fontsize=14, fontweight='bold')
axes[0, 0].set_ylim([0, 105])
axes[0, 0].grid(True, alpha=0.3, axis='y')
for i, v in enumerate([train_values[0], test_values[0]]):
    axes[0, 0].text(i, v + 2, f'{v:.2f}%', ha='center', fontsize=12, fontweight='bold')

# MAE
axes[0, 1].bar(['Train', 'Test'], [train_values[1], test_values[1]], color=['blue', 'green'], edgecolor='black')
axes[0, 1].set_ylabel('MAE ($)', fontsize=12)
axes[0, 1].set_title('Mean Absolute Error', fontsize=14, fontweight='bold')
axes[0, 1].grid(True, alpha=0.3, axis='y')
for i, v in enumerate([train_values[1], test_values[1]]):
    axes[0, 1].text(i, v + 0.05, f'${v:.2f}', ha='center', fontsize=12, fontweight='bold')

# RMSE
axes[1, 0].bar(['Train', 'Test'], [train_values[2], test_values[2]], color=['blue', 'green'], edgecolor='black')
axes[1, 0].set_ylabel('RMSE ($)', fontsize=12)
axes[1, 0].set_title('Root Mean Squared Error', fontsize=14, fontweight='bold')
axes[1, 0].grid(True, alpha=0.3, axis='y')
for i, v in enumerate([train_values[2], test_values[2]]):
    axes[1, 0].text(i, v + 1, f'${v:.2f}', ha='center', fontsize=12, fontweight='bold')

# MAPE
axes[1, 1].bar(['Train', 'Test'], [train_values[3], test_values[3]], color=['blue', 'green'], edgecolor='black')
axes[1, 1].set_ylabel('MAPE (%)', fontsize=12)
axes[1, 1].set_title('Mean Absolute Percentage Error', fontsize=14, fontweight='bold')
axes[1, 1].grid(True, alpha=0.3, axis='y')
for i, v in enumerate([train_values[3], test_values[3]]):
    axes[1, 1].text(i, v + 0.01, f'{v:.2f}%', ha='center', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig('visualizations/4_metrics_comparison.png', dpi=300, bbox_inches='tight')
print("✅ Saved: visualizations/4_metrics_comparison.png")
plt.close()

# ================================
# 7. PLOT 5: ERROR DISTRIBUTION
# ================================
print("\n📊 Vẽ biểu đồ 5: Error Distribution...")

test_errors_pct = np.abs((y_test - y_test_pred) / y_test) * 100

fig, axes = plt.subplots(1, 2, figsize=(15, 6))

# Error percentage histogram
axes[0].hist(test_errors_pct, bins=50, edgecolor='black', alpha=0.7, color='orange')
axes[0].axvline(5, color='green', linestyle='--', linewidth=2, label='±5%')
axes[0].axvline(10, color='yellow', linestyle='--', linewidth=2, label='±10%')
axes[0].axvline(20, color='red', linestyle='--', linewidth=2, label='±20%')
axes[0].set_xlabel('Absolute Percentage Error (%)', fontsize=12)
axes[0].set_ylabel('Frequency', fontsize=12)
axes[0].set_title('Test Set: Error Distribution', fontsize=14, fontweight='bold')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Cumulative error
sorted_errors = np.sort(test_errors_pct)
cumulative = np.arange(1, len(sorted_errors) + 1) / len(sorted_errors) * 100
axes[1].plot(sorted_errors, cumulative, linewidth=2, color='purple')
axes[1].axvline(5, color='green', linestyle='--', linewidth=2, label='±5%')
axes[1].axvline(10, color='yellow', linestyle='--', linewidth=2, label='±10%')
axes[1].axvline(20, color='red', linestyle='--', linewidth=2, label='±20%')
axes[1].set_xlabel('Absolute Percentage Error (%)', fontsize=12)
axes[1].set_ylabel('Cumulative Percentage (%)', fontsize=12)
axes[1].set_title('Cumulative Error Distribution', fontsize=14, fontweight='bold')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

# Add text annotations
within_5 = eval_results['metrics']['test']['within_5_percent']
within_10 = eval_results['metrics']['test']['within_10_percent']
within_20 = eval_results['metrics']['test']['within_20_percent']

axes[1].text(5, within_5 - 5, f'{within_5:.1f}%', fontsize=12, fontweight='bold', color='green')
axes[1].text(10, within_10 - 5, f'{within_10:.1f}%', fontsize=12, fontweight='bold', color='orange')
axes[1].text(20, within_20 - 5, f'{within_20:.1f}%', fontsize=12, fontweight='bold', color='red')

plt.tight_layout()
plt.savefig('visualizations/5_error_distribution.png', dpi=300, bbox_inches='tight')
print("✅ Saved: visualizations/5_error_distribution.png")
plt.close()

# ================================
# 8. SUMMARY
# ================================
print("\n" + "=" * 60)
print("📋 TỔNG KẾT")
print("=" * 60)

print(f"\n✅ Đã tạo 5 biểu đồ trong thư mục 'visualizations/':")
print("   1. actual_vs_predicted.png - So sánh giá trị thực tế vs dự đoán")
print("   2. residuals_analysis.png - Phân tích residuals")
print("   3. feature_importance.png - Độ quan trọng của features")
print("   4. metrics_comparison.png - So sánh metrics Train vs Test")
print("   5. error_distribution.png - Phân bố lỗi dự đoán")

print(f"\n📊 Chất lượng Model: {eval_results['quality']['rating']}")
print(f"   R² Score: {eval_results['quality']['r2_score']*100:.2f}%")
print(f"   MAPE: {eval_results['quality']['mape']:.2f}%")

print("\n" + "=" * 60)
print("✅ VẼ BIỂU ĐỒ HOÀN TẤT!")
print("=" * 60)
print()
