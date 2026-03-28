// src/services/noaaService.js
const axios = require("axios");
const { findPastHours } = require("../utils/dateProcesses"); //! Süslü parantez içine aldım (import hatası olmasın diye)

const getNoaaDatas = async () => {
    try {
        const [plasmaRes, magRes, kpRes] = await Promise.all([axios.get("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"), axios.get("https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"), axios.get("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")]);

        const plasmaData = plasmaRes.data;
        const magData = magRes.data;
        const kpData = kpRes.data;

        // ANLIK VERİLER
        const currentMag = magData[magData.length - 1]; //! isimleri currentMag olarak düzelttim
        const currentPlasma = plasmaData[plasmaData.length - 1];
        const currentTimeStr = currentPlasma[0];

        const targets = findPastHours(currentTimeStr);

        console.log("Aranan Geçmiş Saat Ön Ekleri:", targets);

        // GEÇMİŞ VERİLER
        const lag1_Kp = parseFloat(kpData[kpData.length - 2][1]) * 10;
        const lag1_Plasma = plasmaData.find((line) => line[0] && line[0].startsWith(targets.lag1));
        const lag1_Mag = magData.find((line) => line[0] && line[0].startsWith(targets.lag1));

        const lag2_Kp = parseFloat(kpData[kpData.length - 3][1]) * 10;
        const lag2_Plasma = plasmaData.find((line) => line[0] && line[0].startsWith(targets.lag2));
        const lag2_Mag = magData.find((line) => line[0] && line[0].startsWith(targets.lag2));

        const lag3_Kp = parseFloat(kpData[kpData.length - 4][1]) * 10;
        const lag3_Plasma = plasmaData.find((line) => line[0] && line[0].startsWith(targets.lag3));
        const lag3_Mag = magData.find((line) => line[0] && line[0].startsWith(targets.lag3));

        // Girdi dizisini oluşturmadan önce uydudan veri gelmemişse sistemi koruyan kontrol:
        if (!lag1_Plasma || !lag1_Mag || !lag2_Plasma || !lag2_Mag || !lag3_Plasma || !lag3_Mag) {
            throw new Error("NOAA saat eşleşmesi bulunamadı (Veri eksik).");
        }

        const modelInputArray = [parseFloat(currentMag[3]), parseFloat(currentPlasma[1]), parseFloat(currentPlasma[2]), parseFloat(lag1_Mag[3]), parseFloat(lag1_Plasma[1]), parseFloat(lag1_Plasma[2]), lag1_Kp, parseFloat(lag2_Mag[3]), parseFloat(lag2_Plasma[1]), parseFloat(lag2_Plasma[2]), lag2_Kp, parseFloat(lag3_Mag[3]), parseFloat(lag3_Plasma[1]), parseFloat(lag3_Plasma[2]), lag3_Kp];

        return modelInputArray;
    } catch (err) {
        console.log("Veriler çekilirken hata meydana geldi:", err.message);
        throw err; //! Hatayı yutma, dışarı (Cron'a) fırlat ki sistem bilsin.
    }
};

module.exports = getNoaaDatas;
