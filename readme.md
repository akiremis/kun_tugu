# Solar Shield (Uzay Havası Erken Uyarı Sistemi)

Solar Shield, Dünya'yı etkileyebilecek güneş fırtınalarını (jeomanyetik fırtınaları) makine öğrenmesi algoritmaları ve gerçek zamanlı uydu verileri kullanarak önceden tahmin etmek için tasarlanmış bağımsız, otonom bir sistemdir.

## Neden İhtiyacımız Var?

Uzay havası (Güneş rüzgarları, plazma atılımları, manyetik dalgalanmalar), Dünya'daki telekomünikasyon altyapılarını, göçmen kuşların yön bulma duyularını, radyo sinyallerini ve uydu elektroniğini doğrudan etkileyebilir. Güçlü bir jeomanyetik fırtına "G5", elektrik şebekelerini devre dışı bırakabilir.

Solar Shield, ABD - NOAA sunucularından çektiği verileri arka planda işleyerek, Dünya etrafındaki manyetik alan bozulmalarını (Kp İndeksi) **2 saat önceden** tahmin eden modern ve açık kaynaklı bir savunma arayüzüdür.

## Teknik Özellikler

- 🤖 **Makine Öğrenmesi (XGBoost):** Gelişmiş regresyon algoritmaları, doğrudan XGBoost modeli kullanılarak ONNX formatında Node.js üzerinden (Python maliyeti olmadan) çalıştırılır.
- 📡 **Otonom Veri Toplayıcı (Zamanlayıcı):** Uygulama her 30 dakikada bir veri sunucularına bağlanarak anlık durumu arka planda denetler ve asimetrik risk durumunda veri tabanına kırmızı alarm kaydeder.
- 🗺️ **Taktiksel Harita (Leaflet.js):** Gerçek zamanlı tehlike raporunu, eş zamanlı (Current & Forecast) dünya ısı haritası üzerinde görselleştirilir.

---

## 🚀 Başlangıç - Kurulum & Docker ile Çalıştırma

Proje, bağımlılık çakışmalarını sıfıra indirmek ve dakikalar içinde ayağa kalkmasını sağlamak için tamamen "Konteyner (Container)" izolasyonunda geliştirilmiştir. Sadece Docker Compose kullanarak sıfır kurulum felsefesiyle çalışır.

### Gereksinimler

- Bilgisayarınızda **Docker** ve **Docker Compose** kurulu olmalıdır.
- 8080 (Arka yüz), 3000 (Ön yüz) ve 27017 (Mongo) portlarının boşta olması gerekir.

### Kurulum Adımları (Adım Adım)

1. **Repoyu Klonlayın ve Dizinine Girin:**

```bash
git clone <repo-url>
cd solarshileld
```

2. **Konteynerleri Başlatın:**
   Arka plan modunda tüm veri tabanı, backend ve frontend servislerini ayağa kaldırmak için aşağıdaki tek komutu çalıştırın:

```bash
docker-compose up -d --build
```

3. **Logları İnceleyin (İsteğe Bağlı):**
   Verilerin NOAA'dan 30 dakikada bir nasıl çekildiğini veya yapay zekanın değerlendirmesini görmek için backend loglarını canlı olarak takip edebilirsiniz:

```bash
docker logs -f astro-backend
```

4. **Projeyi Görüntüleyin:**
   Servisler başladıktan sonra tarayıcınızı açın ve aşağıdaki adrese gidin:

- **Arka Yüz (Backend) API Test:** [http://localhost:8080/](http://localhost:8080/)
- **Ön Yüz (Arayüz / Haritalar):** [http://localhost:3000](http://localhost:3000/)

5. **Kapatmak İçin:**
   Sistemi kapatmak (ancak veri tabanındaki verileri korumak) için aynı dizinde:

```bash
docker-compose down
```

komutunu kullanmanız yeterlidir. Daha sonraki başlatmalarda `--build` parametresini kaldıp sadece `docker-compose up -d` komutunu yazabilirsiniz.
