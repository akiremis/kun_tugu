const cron = require("node-cron");
const { getNoaaDatas } = require("./noaaService");
const { guess } = require("../utils/forecast");
const Forecast = require("../models/forecast");
const forecast = require("../models/forecast");

const startCron = () => {
    //* '*/30 * * * *' -> Her saatin 00. ve 30. dakikalarında tetiklenir
    cron.schedule("*/30 * * * *", async () => {
        console.log(`\n[CRON - ${new Date().toLocaleTimeString()}] Sistem uyandı. Analiz döngüsü başlıyor...`);
        try {
            console.log(`[CRON] NOAA sunucularından uzay havası verileri çekiliyor...`);
            const sensorData = await getNoaaDatas();

            //! Eğer NOAA API'si çökmüşse ve veri gelmemişse işlemi iptal et
            if (!sensorVerileri || sensorVerileri.length !== 15) {
                throw new Error("Eksik veya hatalı veri dizisi ulaştı. Tahmin iptal edildi.");
            }

            console.log(`[CRON] Veriler ONNX modeline (XGBoost) iletiliyor...`);

            const kpGuess = await forecast(sensorData);

            let alertStatus = "GUVENLI";
            if (kpTahmini >= 45 && kpTahmini < 55) {
                alarmDurumu = "UYARI";
            } else if (kpTahmini >= 55) {
                alarmDurumu = "TEHLIKE";
            }

            console.log(`[CRON] Tahmin tamamlandı (Kp: ${kpTahmini.toFixed(2)}). Veritabanına yazılıyor...`);

            const yeniKayit = await Forecast.create({
                ham_veri: sensorVerileri, // 15'li dizi
                tahmin_edilen_kp: kpTahmini,
                alarm_durumu: alarmDurumu,
            });

            console.log(`[CRON - BAŞARILI] Kayıt ID: ${yeniKayit._id} | Durum: ${alarmDurumu}`);
        } catch (err) {
            // NOAA API'sinden 'timeout' (zaman aşımı) yenirse veya veritabanı bağlantısı koparsa sistem çökmesin diye hatayı burada yutuyoruz.
            console.error(`[CRON - HATA] Analiz döngüsü başarısız oldu:`, error.message);
        }
    });
};

module.exports = { startCron };
