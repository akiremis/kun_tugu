// src/services/cronService.js
const cron = require("node-cron");
const getNoaaDatas = require("./noaaService");

// 1. DÜZELTME: Doğru isim ve süslü parantez kullanıldı
const { aiForecast } = require("../utils/forecast");
const Forecast = require("../models/forecast");

// 2. DÜZELTME: physics.js içindeki doğru fonksiyon adı kullanıldı
const { calcNoaaValue } = require("../utils/physics");

const startCron = () => {
    //* */30 * * * *
    // Her 30 dakikada bir çalışacak zamanlanmış görev
    cron.schedule("*/30 * * * *", async () => {
        console.log(`\n[CRON - ${new Date().toLocaleTimeString()}] Sistem uyandı. Analiz döngüsü başlıyor...`);
        try {
            console.log(`[CRON] NOAA sunucularından uzay havası verileri çekiliyor...`);
            const sensorData = await getNoaaDatas();

            if (!sensorData || sensorData.length !== 15) {
                throw new Error("Eksik veya hatalı veri dizisi ulaştı. Tahmin iptal edildi.");
            }

            console.log(`[CRON] Veriler ONNX modeline (XGBoost) iletiliyor...`);

            // 1. DÜZELTME UYGULAMASI
            const kpGuess = await aiForecast(sensorData);

            // 2. DÜZELTME UYGULAMASI
            const physicalData = calcNoaaValue(kpGuess);

            let alertStatus = "GUVENLI";
            let color = "Yeşil";
            if (physicalData.realKp >= 4.5 && physicalData.realKp < 5.5) {
                alertStatus = "UYARI";
                color = "Sarı";
            } else if (physicalData.realKp >= 5.5) {
                alertStatus = "TEHLIKE";
                color = "Kırmızı";
            }

            console.log(`[CRON] Tahmin tamamlandı (Gerçek Kp: ${physicalData.realKp}). Veritabanına yazılıyor...`);

            const yeniKayit = await Forecast.create({
                tahmin_edilen_kp: physicalData.realKp,
                bizim_uyari_sistemimiz: {
                    durum: alertStatus,
                    renk: color,
                },
                noaa_standartlari: {
                    // 3. DÜZELTME: physics.js'in döndüğü İngilizce objeler kullanıldı
                    g_olcegi: physicalData.gScale,
                    g_aciklama: physicalData.gDesc,
                },
                harita_verisi: {
                    etkilenen_minimum_enlem: physicalData.latitude,
                    etki_alani_aciklamasi: `Fırtına etkileri ${physicalData.latitude} derece manyetik enlem ve kuzeyine kadar genişleyecek.`,
                },
                ham_veriler: {
                    bz_gsm: sensorData[0],
                    proton_yogunlugu: sensorData[1],
                    ruzgar_hizi: sensorData[2],
                },
                model_girdi_dizisi: sensorData,
            });

            console.log(`[CRON - BAŞARILI] Kayıt ID: ${yeniKayit._id} | Durum: ${alertStatus}`);
        } catch (err) {
            console.error(`[CRON - HATA] Analiz döngüsü başarısız oldu:`, err.message);
        }
    });
};

module.exports = { startCron };
