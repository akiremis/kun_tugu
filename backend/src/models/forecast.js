const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
    tarih: {
        type: Date,
        default: Date.now,
    },
    tahmin_edilen_kp: {
        type: Number,
        required: true,
    },
    bizim_uyari_sistemimiz: {
        durum: { type: String, enum: ["GUVENLI", "UYARI", "TEHLIKE"] },
        renk: String,
    },
    noaa_standartlari: {
        g_olcegi: String,
        g_aciklama: String,
    },
    harita_verisi: {
        etkilenen_minimum_enlem: Number,
        etki_alani_aciklamasi: String,
    },
    ham_veriler: {
        bz_gsm: Number,
        ruzgar_hizi: Number,
        proton_yogunlugu: Number,
    },
    // ONNX modeline giren orijinal 15'li dizi (Hata ayıklama ve makine öğrenmesi logları için)
    model_girdi_dizisi: {
        type: [Number],
        required: true,
    },
});

module.exports = mongoose.model("Forecast", forecastSchema);
