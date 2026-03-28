const Forecast = require("../models/forecast");

const getCurrentForecast = async (req, res) => {
    try {
        // MongoDB'den en son kaydedilen (tarihe göre azalan sıralı) tek bir tahmini çekiyoruz.
        const latestGuess = await Forecast.findOne().sort({ tarih: -1 });

        if (!latestGuess) {
            return res.status(404).json({
                success: false,
                error: "Veritabanında henüz analiz edilmiş uzay havası verisi bulunmuyor.",
            });
        }
        return res.status(200).json({
            success: true,
            time: latestGuess.tarih,
            guess: {
                kp_index: latestGuess.tahmin_edilen_kp,
                ourWarningSystem: latestGuess.bizim_uyari_sistemimiz,
                noaa_standarts: latestGuess.noaa_standartlari,
            },
            harita_verisi: latestGuess.harita_verisi,
            ham_veriler: latestGuess.ham_veriler,
        });
    } catch (err) {
        console.error("API Veri Çekme Hatası:", err);
        return res.status(500).json({ success: false, error: "Sunucu içi bir hata oluştu." });
    }
};

module.exports = { getCurrentForecast };