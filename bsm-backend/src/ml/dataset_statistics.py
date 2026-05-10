"""
DATASET STATISTICS - Phân tích thống kê dataset
================================================
Mục đích: Phân tích và đếm dữ liệu trong Kaggle Hotel Bookings Dataset
Output: dataset_statistics.json + Console report
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("📊 PHÂN TÍCH THỐNG KÊ DATASET")
print("=" * 60)

# ================================
# 1. LOAD DATASET
# ================================
print("\n📂 Đang load dataset...")

try:
    df_raw = pd.read_csv('data/hotel_bookings.csv')
    print(f"✅ Loaded: {len(df_raw):,} records")
    print(f"✅ Columns: {len(df_raw.columns)}")
except FileNotFoundError:
    print("❌ Lỗi: Không tìm thấy data/hotel_bookings.csv")
    exit(1)

# ================================
# 2. BASIC STATISTICS
# ================================
print("\n" + "=" * 60)
print("📋 THỐNG KÊ CƠ BẢN")
print("=" * 60)

total_records = len(df_raw)
total_columns = len(df_raw.columns)
memory_usage = df_raw.memory_usage(deep=True).sum() / 1024 / 1024  # MB

print(f"\n📊 Tổng quan:")
print(f"   Tổng số records:     {total_records:,}")
print(f"   Tổng số columns:     {total_columns}")
print(f"   Memory usage:        {memory_usage:.2f} MB")

# ================================
# 3. MISSING VALUES ANALYSIS
# ================================
print("\n📉 Missing Values:")
print("-" * 60)

missing_stats = []
for col in df_raw.columns:
    missing_count = df_raw[col].isnull().sum()
    if missing_count > 0:
        missing_pct = (missing_count / total_records) * 100
        missing_stats.append({
            "column": col,
            "missing_count": int(missing_count),
            "missing_percentage": float(missing_pct)
        })
        print(f"   {col:30s}: {missing_count:6,} ({missing_pct:5.2f}%)")

if not missing_stats:
    print("   ✅ Không có missing values!")

# ================================
# 4. CANCELLATION ANALYSIS
# ================================
print("\n🚫 Phân tích Cancellation:")
print("-" * 60)

canceled_count = df_raw['is_canceled'].sum()
not_canceled_count = total_records - canceled_count
canceled_pct = (canceled_count / total_records) * 100
not_canceled_pct = 100 - canceled_pct

print(f"   Canceled:            {canceled_count:,} ({canceled_pct:.2f}%)")
print(f"   Not Canceled:        {not_canceled_count:,} ({not_canceled_pct:.2f}%)")

# ================================
# 5. DATA CLEANING PROCESS
# ================================
print("\n🧹 Quá trình Cleaning:")
print("-" * 60)

df = df_raw.copy()
cleaning_steps = []

# Step 1: Remove canceled bookings
step1_before = len(df)
df = df[df['is_canceled'] == 0].copy()
step1_after = len(df)
step1_removed = step1_before - step1_after
cleaning_steps.append({
    "step": "Remove canceled bookings",
    "before": step1_before,
    "after": step1_after,
    "removed": step1_removed
})
print(f"   1. Remove canceled:  {step1_before:,} → {step1_after:,} (-{step1_removed:,})")

# Step 2: Remove ADR = 0
step2_before = len(df)
df = df[df['adr'] > 0].copy()
step2_after = len(df)
step2_removed = step2_before - step2_after
cleaning_steps.append({
    "step": "Remove ADR = 0",
    "before": step2_before,
    "after": step2_after,
    "removed": step2_removed
})
print(f"   2. Remove ADR=0:     {step2_before:,} → {step2_after:,} (-{step2_removed:,})")

# Step 3: Calculate total_nights and remove 0 nights
df['total_nights'] = df['stays_in_weekend_nights'] + df['stays_in_week_nights']
step3_before = len(df)
df = df[df['total_nights'] > 0].copy()
step3_after = len(df)
step3_removed = step3_before - step3_after
cleaning_steps.append({
    "step": "Remove 0 nights",
    "before": step3_before,
    "after": step3_after,
    "removed": step3_removed
})
print(f"   3. Remove 0 nights:  {step3_before:,} → {step3_after:,} (-{step3_removed:,})")

# Step 4: Feature engineering
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

# Step 5: Remove NaN after feature engineering
FEATURES = [
    'month_num', 'quarter', 'total_nights', 'total_guests', 'weekend_ratio',
    'is_repeated', 'lead_time_cat', 'has_changes', 'has_special_requests', 'adr'
]
TARGET = 'revenue'

step4_before = len(df)
df_clean = df[FEATURES + [TARGET]].dropna()
step4_after = len(df_clean)
step4_removed = step4_before - step4_after
cleaning_steps.append({
    "step": "Remove NaN after feature engineering",
    "before": step4_before,
    "after": step4_after,
    "removed": step4_removed
})
print(f"   4. Remove NaN:       {step4_before:,} → {step4_after:,} (-{step4_removed:,})")

print(f"\n✅ Final clean dataset: {len(df_clean):,} records")
print(f"   Data retention: {(len(df_clean)/total_records)*100:.2f}%")

# ================================
# 6. HOTEL TYPE DISTRIBUTION
# ================================
print("\n🏨 Phân bố theo Hotel Type:")
print("-" * 60)

hotel_dist = df['hotel'].value_counts()
hotel_stats = []
for hotel_type, count in hotel_dist.items():
    pct = (count / len(df)) * 100
    hotel_stats.append({
        "hotel_type": hotel_type,
        "count": int(count),
        "percentage": float(pct)
    })
    print(f"   {hotel_type:20s}: {count:,} ({pct:.2f}%)")

# ================================
# 7. MONTHLY DISTRIBUTION
# ================================
print("\n📅 Phân bố theo Tháng:")
print("-" * 60)

month_dist = df_clean['month_num'].value_counts().sort_index()
month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
monthly_stats = []

for month_num, count in month_dist.items():
    pct = (count / len(df_clean)) * 100
    month_name = month_names[int(month_num) - 1]
    monthly_stats.append({
        "month": int(month_num),
        "month_name": month_name,
        "count": int(count),
        "percentage": float(pct)
    })
    print(f"   Tháng {month_num:2d} ({month_name}): {count:,} ({pct:.2f}%)")

# ================================
# 8. QUARTERLY DISTRIBUTION
# ================================
print("\n📊 Phân bố theo Quý:")
print("-" * 60)

quarter_dist = df_clean['quarter'].value_counts().sort_index()
quarterly_stats = []

for quarter, count in quarter_dist.items():
    pct = (count / len(df_clean)) * 100
    quarterly_stats.append({
        "quarter": int(quarter),
        "count": int(count),
        "percentage": float(pct)
    })
    print(f"   Quý {quarter}: {count:,} ({pct:.2f}%)")

# ================================
# 9. REVENUE STATISTICS
# ================================
print("\n💰 Thống kê Revenue:")
print("-" * 60)

revenue_stats = {
    "mean": float(df_clean['revenue'].mean()),
    "median": float(df_clean['revenue'].median()),
    "std": float(df_clean['revenue'].std()),
    "min": float(df_clean['revenue'].min()),
    "max": float(df_clean['revenue'].max()),
    "q25": float(df_clean['revenue'].quantile(0.25)),
    "q75": float(df_clean['revenue'].quantile(0.75))
}

print(f"   Mean:     ${revenue_stats['mean']:,.2f}")
print(f"   Median:   ${revenue_stats['median']:,.2f}")
print(f"   Std Dev:  ${revenue_stats['std']:,.2f}")
print(f"   Min:      ${revenue_stats['min']:,.2f}")
print(f"   Max:      ${revenue_stats['max']:,.2f}")
print(f"   Q25:      ${revenue_stats['q25']:,.2f}")
print(f"   Q75:      ${revenue_stats['q75']:,.2f}")

# ================================
# 10. ADR (AVERAGE DAILY RATE) STATISTICS
# ================================
print("\n💵 Thống kê ADR (Average Daily Rate):")
print("-" * 60)

adr_stats = {
    "mean": float(df_clean['adr'].mean()),
    "median": float(df_clean['adr'].median()),
    "std": float(df_clean['adr'].std()),
    "min": float(df_clean['adr'].min()),
    "max": float(df_clean['adr'].max()),
    "q25": float(df_clean['adr'].quantile(0.25)),
    "q75": float(df_clean['adr'].quantile(0.75))
}

print(f"   Mean:     ${adr_stats['mean']:,.2f}")
print(f"   Median:   ${adr_stats['median']:,.2f}")
print(f"   Std Dev:  ${adr_stats['std']:,.2f}")
print(f"   Min:      ${adr_stats['min']:,.2f}")
print(f"   Max:      ${adr_stats['max']:,.2f}")
print(f"   Q25:      ${adr_stats['q25']:,.2f}")
print(f"   Q75:      ${adr_stats['q75']:,.2f}")

# ================================
# 11. NIGHTS STATISTICS
# ================================
print("\n🌙 Thống kê Số đêm ở:")
print("-" * 60)

nights_stats = {
    "mean": float(df_clean['total_nights'].mean()),
    "median": float(df_clean['total_nights'].median()),
    "std": float(df_clean['total_nights'].std()),
    "min": int(df_clean['total_nights'].min()),
    "max": int(df_clean['total_nights'].max()),
    "q25": float(df_clean['total_nights'].quantile(0.25)),
    "q75": float(df_clean['total_nights'].quantile(0.75))
}

print(f"   Mean:     {nights_stats['mean']:.2f} nights")
print(f"   Median:   {nights_stats['median']:.2f} nights")
print(f"   Std Dev:  {nights_stats['std']:.2f} nights")
print(f"   Min:      {nights_stats['min']} nights")
print(f"   Max:      {nights_stats['max']} nights")
print(f"   Q25:      {nights_stats['q25']:.2f} nights")
print(f"   Q75:      {nights_stats['q75']:.2f} nights")

# ================================
# 12. GUESTS STATISTICS
# ================================
print("\n👥 Thống kê Số khách:")
print("-" * 60)

guests_stats = {
    "mean": float(df_clean['total_guests'].mean()),
    "median": float(df_clean['total_guests'].median()),
    "std": float(df_clean['total_guests'].std()),
    "min": int(df_clean['total_guests'].min()),
    "max": int(df_clean['total_guests'].max()),
    "q25": float(df_clean['total_guests'].quantile(0.25)),
    "q75": float(df_clean['total_guests'].quantile(0.75))
}

print(f"   Mean:     {guests_stats['mean']:.2f} guests")
print(f"   Median:   {guests_stats['median']:.2f} guests")
print(f"   Std Dev:  {guests_stats['std']:.2f} guests")
print(f"   Min:      {guests_stats['min']} guests")
print(f"   Max:      {guests_stats['max']} guests")
print(f"   Q25:      {guests_stats['q25']:.2f} guests")
print(f"   Q75:      {guests_stats['q75']:.2f} guests")

# ================================
# 13. REPEATED GUESTS
# ================================
print("\n🔄 Khách quen (Repeated Guests):")
print("-" * 60)

repeated_count = df_clean['is_repeated'].sum()
new_count = len(df_clean) - repeated_count
repeated_pct = (repeated_count / len(df_clean)) * 100
new_pct = 100 - repeated_pct

repeated_guests_stats = {
    "repeated": int(repeated_count),
    "repeated_percentage": float(repeated_pct),
    "new": int(new_count),
    "new_percentage": float(new_pct)
}

print(f"   Khách quen:          {repeated_count:,} ({repeated_pct:.2f}%)")
print(f"   Khách mới:           {new_count:,} ({new_pct:.2f}%)")

# ================================
# 14. LEAD TIME CATEGORIES
# ================================
print("\n⏰ Phân bố Lead Time (Thời gian đặt trước):")
print("-" * 60)

lead_time_labels = ['0-7 days', '8-30 days', '31-90 days', '91-365 days', '>365 days']
lead_time_dist = df_clean['lead_time_cat'].value_counts().sort_index()
lead_time_stats = []

for cat, count in lead_time_dist.items():
    pct = (count / len(df_clean)) * 100
    label = lead_time_labels[int(cat)]
    lead_time_stats.append({
        "category": int(cat),
        "label": label,
        "count": int(count),
        "percentage": float(pct)
    })
    print(f"   {label:15s}: {count:,} ({pct:.2f}%)")

# ================================
# 15. SPECIAL REQUESTS
# ================================
print("\n⭐ Special Requests:")
print("-" * 60)

has_requests = df_clean['has_special_requests'].sum()
no_requests = len(df_clean) - has_requests
requests_pct = (has_requests / len(df_clean)) * 100
no_requests_pct = 100 - requests_pct

special_requests_stats = {
    "has_requests": int(has_requests),
    "has_requests_percentage": float(requests_pct),
    "no_requests": int(no_requests),
    "no_requests_percentage": float(no_requests_pct)
}

print(f"   Có special requests: {has_requests:,} ({requests_pct:.2f}%)")
print(f"   Không có requests:   {no_requests:,} ({no_requests_pct:.2f}%)")

# ================================
# 16. BOOKING CHANGES
# ================================
print("\n🔄 Booking Changes:")
print("-" * 60)

has_changes = df_clean['has_changes'].sum()
no_changes = len(df_clean) - has_changes
changes_pct = (has_changes / len(df_clean)) * 100
no_changes_pct = 100 - changes_pct

booking_changes_stats = {
    "has_changes": int(has_changes),
    "has_changes_percentage": float(changes_pct),
    "no_changes": int(no_changes),
    "no_changes_percentage": float(no_changes_pct)
}

print(f"   Có thay đổi:         {has_changes:,} ({changes_pct:.2f}%)")
print(f"   Không thay đổi:      {no_changes:,} ({no_changes_pct:.2f}%)")

# ================================
# 17. WEEKEND RATIO
# ================================
print("\n📅 Weekend Ratio Statistics:")
print("-" * 60)

weekend_ratio_stats = {
    "mean": float(df_clean['weekend_ratio'].mean()),
    "median": float(df_clean['weekend_ratio'].median()),
    "std": float(df_clean['weekend_ratio'].std()),
    "min": float(df_clean['weekend_ratio'].min()),
    "max": float(df_clean['weekend_ratio'].max())
}

print(f"   Mean:     {weekend_ratio_stats['mean']*100:.2f}%")
print(f"   Median:   {weekend_ratio_stats['median']*100:.2f}%")
print(f"   Std Dev:  {weekend_ratio_stats['std']*100:.2f}%")
print(f"   Min:      {weekend_ratio_stats['min']*100:.2f}%")
print(f"   Max:      {weekend_ratio_stats['max']*100:.2f}%")

# ================================
# 18. SAVE RESULTS
# ================================
print("\n💾 Đang lưu kết quả...")

statistics_results = {
    "analyzed_at": datetime.now().isoformat(),
    "dataset_overview": {
        "total_records": total_records,
        "total_columns": total_columns,
        "memory_usage_mb": float(memory_usage),
        "final_clean_records": len(df_clean),
        "data_retention_percentage": float((len(df_clean)/total_records)*100)
    },
    "missing_values": missing_stats,
    "cancellation": {
        "canceled": int(canceled_count),
        "canceled_percentage": float(canceled_pct),
        "not_canceled": int(not_canceled_count),
        "not_canceled_percentage": float(not_canceled_pct)
    },
    "cleaning_steps": cleaning_steps,
    "hotel_distribution": hotel_stats,
    "monthly_distribution": monthly_stats,
    "quarterly_distribution": quarterly_stats,
    "revenue_statistics": revenue_stats,
    "adr_statistics": adr_stats,
    "nights_statistics": nights_stats,
    "guests_statistics": guests_stats,
    "repeated_guests": repeated_guests_stats,
    "lead_time_distribution": lead_time_stats,
    "special_requests": special_requests_stats,
    "booking_changes": booking_changes_stats,
    "weekend_ratio_statistics": weekend_ratio_stats
}

output_path = 'models/dataset_statistics.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(statistics_results, f, indent=2, ensure_ascii=False)

print(f"✅ Kết quả đã lưu: {output_path}")

# ================================
# 19. SUMMARY
# ================================
print("\n" + "=" * 60)
print("📋 TỔNG KẾT")
print("=" * 60)

print(f"\n📊 Dataset Overview:")
print(f"   Raw records:         {total_records:,}")
print(f"   Clean records:       {len(df_clean):,}")
print(f"   Data retention:      {(len(df_clean)/total_records)*100:.2f}%")

print(f"\n💰 Revenue:")
print(f"   Mean:                ${revenue_stats['mean']:,.2f}")
print(f"   Median:              ${revenue_stats['median']:,.2f}")

print(f"\n💵 ADR:")
print(f"   Mean:                ${adr_stats['mean']:,.2f}")
print(f"   Median:              ${adr_stats['median']:,.2f}")

print(f"\n🌙 Nights:")
print(f"   Mean:                {nights_stats['mean']:.2f} nights")

print(f"\n👥 Guests:")
print(f"   Mean:                {guests_stats['mean']:.2f} guests")

print(f"\n📅 Top 3 Months:")
top_months = sorted(monthly_stats, key=lambda x: x['count'], reverse=True)[:3]
for i, month in enumerate(top_months, 1):
    print(f"   {i}. {month['month_name']:3s}: {month['count']:,} ({month['percentage']:.2f}%)")

print("\n" + "=" * 60)
print("✅ PHÂN TÍCH HOÀN TẤT!")
print("=" * 60)
print()
