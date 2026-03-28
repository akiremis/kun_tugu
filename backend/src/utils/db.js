const mongoose = require("mongoose");

const connectDB = async () => {
    console.log("Veri tabanı bağlantısı kurulmaya çalışılıyor...")
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
        process.exit(1); // Hata durumunda sunucuyu durdur
    }
};

module.exports = connectDB;
