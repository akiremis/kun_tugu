from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS # flask-cors kütüphanesini kurmalısın


app = Flask(__name__)
CORS(app) # Tüm isteklere izin verir

# Sunucu başlarken modeli sadece bir kere hafızaya yükler (Performans için kritik)
model = joblib.load('xgboost_firtina_modeli.pkl')

# NodeJS bu adrese POST isteği atacak
@app.route('/tahmin', methods=['POST'])
def tahmin_yap():
    try:
        # NodeJS'ten gelen JSON verisini alıyoruz
        gelen_veri = request.get_json()
        
        # XGBoost bizden verileri bir Pandas tablosu (DataFrame) olarak bekler
        # Gelen JSON'u tek satırlık bir tabloya çeviriyoruz
        df_istek = pd.DataFrame([gelen_veri])
        
        # Model tahmini yapıyor
        sonuc = model.predict(df_istek)
        
        # Çıkan sonucu float tipinde NodeJS'e geri döndürüyoruz
        return jsonify({'tahmin_edilen_kp': float(sonuc[0])})

    except Exception as e:
        # (Bu kısımda NodeJS'ten eksik veya yanlış isimlendirilmiş bir parametre 
        # gelirse sistem hata verebilir. Hatayı yakalayıp JSON olarak geri dönüyoruz.)
        return jsonify({'hata': str(e)}), 400

if __name__ == '__main__':
    # API'yi 5000 portunda ayağa kaldır
    app.run(host='0.0.0.0', port=5000, debug=True)