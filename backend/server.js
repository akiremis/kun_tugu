require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./src/utils/db"); // Veritabanı fonksiyonunu içeri al
const apiRoutes = require("./src/routes/api-routes");
const { startCron } = require("./src/services/cronService");

const app = express();

// 2. Veritabanına Bağlan (Bağlantı kurulmadan API çalışmamalı)
connectDB();

app.use(express.json());

// API Rotaları
app.use("/api", apiRoutes);

// Frontend Bilgilendirme Sayfası
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/views/index.html"));
});

// 3. Sunucuyu Ayağa Kaldır
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Uzay Havası Erken Uyarı Sunucusu ${PORT} portunda çalışıyor.`);

    // Sunucu ve veritabanı hazır olduktan sonra zamanlayıcıyı (Cron) başlat
    startCron();
});
