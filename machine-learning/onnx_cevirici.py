import joblib
import onnxmltools
from onnxmltools.convert.common.data_types import FloatTensorType

# 1. Modeli yüklüyoruz
model = joblib.load('xgboost_firtina_modeli.pkl')

# --- HATA ÇÖZÜMÜ BURADA BAŞLIYOR ---
# Modelin çekirdeğine (booster) erişip, sütun isimlerini ONNX'in 
# zorunlu tuttuğu f0, f1, f2... formatına zorla dönüştürüyoruz.
booster = model.get_booster()
booster.feature_names = [f"f{i}" for i in range(len(booster.feature_names))]
# --- HATA ÇÖZÜMÜ BURADA BİTİYOR ---

# 2. Şema Tanımlaması (1 satır, 15 sütun)
initial_type = [('float_input', FloatTensorType([None, 15]))]

# 3. Çeviri İşlemi
onnx_model = onnxmltools.convert_xgboost(model, initial_types=initial_type)

# 4. Modeli Kaydetme
with open("xgboost_firtina_modeli.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("Model başarıyla ONNX formatına çevrildi!")