// src/services/cronService.js
const cron = require("node-cron");
const getNoaaDatas = require("./noaaService");

const { aiForecast } = require("../utils/forecast");
const Forecast = require("../models/forecast");
const { calcNoaaValue } = require("../utils/physics");

const runForecastJob = async () => {
    console.log(`\n[SİSTEM - ${new Date().toLocaleTimeString()}] Analiz döngüsü başlıyor...`);
    try {
        console.log(`[SİSTEM] NOAA sunucularından uzay havası verileri çekiliyor...`);
        const sensorData = await getNoaaDatas();

        if (!sensorData || sensorData.length !== 15) {
            throw new Error("Eksik veya hatalı veri dizisi ulaştı. Tahmin iptal edildi.");
        }

        console.log(`[SİSTEM] Veriler ONNX modeline (XGBoost) iletiliyor...`);

        const kpGuess = await aiForecast(sensorData);
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

        console.log(`[SİSTEM] Tahmin tamamlandı (Gerçek Kp: ${physicalData.realKp}). Veritabanına yazılıyor...`);

        const yeniKayit = await Forecast.create({
            tahmin_edilen_kp: physicalData.realKp,
            bizim_uyari_sistemimiz: {
                durum: alertStatus,
                renk: color,
            },
            noaa_standartlari: {
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

        console.log(`[SİSTEM - BAŞARILI] Kayıt ID: ${yeniKayit._id} | Durum: ${alertStatus}`);
    } catch (err) {
        console.error(`[SİSTEM - HATA] Analiz döngüsü başarısız oldu:`, err.message);
    }
};

const startCron = () => {
    // A. Sunucu ayağa kalkar kalkmaz ilk tahmini anında yap (İlk veri kaydı için)
    runForecastJob();

    // B. Ardından her 30 dakikada bir çalışacak şekilde zamanla
    // cron.schedule("*/30 * * * *", runForecastJob);

    // 1 Saatlik cron job
    cron.schedule("0 * * * *", runForecastJob);
    console.log("=> Otonom Zamanlayıcı (Cron) aktif. Sistem her 30 dakikada bir fırtına analizi yapacak.");
};

module.exports = { startCron };
