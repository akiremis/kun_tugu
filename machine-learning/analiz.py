import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_squared_error
import numpy as np
import matplotlib.pyplot as plt

# 1. YENİ EKLENEN 'Flow_Speed' SÜTUNU BURAYA DAHİL EDİLDİ
sutun_isimleri = ['Year', 'DOY', 'Hour', 'Bz_GSM', 'Proton_Density', 'Flow_Speed', 'Kp_Index']

df = pd.read_csv('omni2_sUoGt4nNgT.txt',
                 sep=r'\s+',
                 names=sutun_isimleri,
                 na_values=[99.9, 999, 999.9, 9999, 99999])

# Zaman hesaplaması (String dönüşümü yapmadan)
zaman_yili = pd.to_datetime(df['Year'], format='%Y')
gun_farki = pd.to_timedelta(df['DOY'] - 1, unit='D')
saat_farki = pd.to_timedelta(df['Hour'], unit='h')

df['Datetime'] = zaman_yili + gun_farki + saat_farki

# Zaman sütunları silindikten ve index ayarlandıktan sonra float dönüşümü yapılır
df = df.drop(columns=['Year', 'DOY', 'Hour']).set_index('Datetime')
df = df.astype(float)

# EKSİK (NaN) VERİLERİ DOLDURMA
df = df.interpolate(method='linear', limit_direction='both')

# HEDEFİ BELİRLEME (2 saat sonrasını tahmin etmek için Kp_Index'i yukarı kaydırma)
tahmin_ufku = 2 
df['Target_Kp'] = df['Kp_Index'].shift(-tahmin_ufku)

# GECİKMELİ ÖZELLİKLER (Trendi anlaması için son 3 saatin verilerini aynı satıra ekleme)
gecikme_saati = 3
for i in range(1, gecikme_saati + 1):
    df[f'Bz_GSM_lag_{i}'] = df['Bz_GSM'].shift(i)
    df[f'Proton_Density_lag_{i}'] = df['Proton_Density'].shift(i)
    # 2. YENİ EKLENEN RÜZGAR HIZI VE KP_INDEX OTOKORELASYONU BURAYA DAHİL EDİLDİ
    df[f'Flow_Speed_lag_{i}'] = df['Flow_Speed'].shift(i)
    df[f'Kp_Index_lag_{i}'] = df['Kp_Index'].shift(i)

# Başıboş satırları sil
df = df.dropna()

# Veri sızıntısını önlemek için orijinal Kp_Index'i sil
df = df.drop(columns=['Kp_Index'])

# --- MAKİNE ÖĞRENMESİ BÖLÜMÜ ---

X = df.drop(columns=['Target_Kp'])
y = df['Target_Kp']

bolme_noktasi = int(len(df) * 0.8)

X_train = X.iloc[:bolme_noktasi]
X_test = X.iloc[bolme_noktasi:]
y_train = y.iloc[:bolme_noktasi]
y_test = y.iloc[bolme_noktasi:]

model = xgb.XGBRegressor(
    n_estimators=100,      
    learning_rate=0.1,     
    max_depth=5,           
    random_state=42        
)

model.fit(X_train, y_train)

tahminler = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, tahminler))
print(f"\nModelin Yeni Ortalama Hatası (RMSE): {rmse:.2f}")

# Feature Importance Grafiğini Çizdirme
xgb.plot_importance(model, importance_type='weight', max_num_features=10)
plt.title('XGBoost Özellik Önemi (Feature Importance)')
plt.savefig('ozellik_onemi.png', bbox_inches='tight')
print("Grafik 'ozellik_onemi.png' adıyla proje klasörüne kaydedildi.")

import joblib

# Eğitilmiş modeli bilgisayara dosya olarak kaydediyoruz
joblib.dump(model, 'xgboost_firtina_modeli.pkl')
print("Model 'xgboost_firtina_modeli.pkl' olarak başarıyla kaydedildi.")