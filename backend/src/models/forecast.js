const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
    tarih: {
        type: Date,
        default: Date.now,
    },
    // Gelen Yeni Veriler (Modelin Girdisi)
    ham_veri: {
        type: [Number], // 15 elemanlı dizi burada duracak
        required: true,
    },
    // Modelin Sonuçları
    tahmin_edilen_kp: {
        type: Number,
        required: true,
    },
    alarm_durumu: {
        type: String,
        enum: ["GUVENLI", "UYARI", "TEHLIKE"],
        required: true,
    },
});

module.exports = mongoose.model("Forecast", forecastSchema);
