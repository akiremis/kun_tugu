// src/services/noaaService.js
const axios = require("axios");
const { findPastHours } = require("../utils/dateProcesses");

/**
 * SAATLİK ORTALAMA HESAPLAYICI
 * Model OMNI2 verisetinin saatlik ortalamaları ile eğitildi.
 * Çıkarım sırasında da aynı formatta veri vermek için her saatteki
 * tüm dakikalık ölçümleri alıp ortalamasını hesaplıyoruz.
 * @param {Array} data - NOAA API'den gelen satır dizisi (ilk eleman time_tag)
 * @param {string} saatPrefix - "YYYY-MM-DD HH:" formatında saat öneki
 * @param {number} sutunIndex - Ortalanacak sütunun indeksi
 * @returns {number|null} Saatlik ortalama değer veya null (veri yoksa)
 */
function saatlikOrtalama(data, saatPrefix, sutunIndex) {
    const satirlar = data.filter((row) => row[0] && row[0].startsWith(saatPrefix));
    if (satirlar.length === 0) return null;

    const gecerliDegerler = satirlar
        .map((row) => parseFloat(row[sutunIndex]))
        .filter((val) => !isNaN(val));

    if (gecerliDegerler.length === 0) return null;

    const ortalama = gecerliDegerler.reduce((acc, val) => acc + val, 0) / gecerliDegerler.length;
    return ortalama;
}

const getNoaaDatas = async () => {
    try {
        const [plasmaRes, magRes, kpRes] = await Promise.all([
            axios.get("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"),
            axios.get("https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"),
            axios.get("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"),
        ]);

        const plasmaData = plasmaRes.data;
        const magData = magRes.data;
        const kpData = kpRes.data;

        // Son gelen verinin zaman damgasından saat prefix'lerini türet
        const currentTimeStr = plasmaData[plasmaData.length - 1][0];
        const targets = findPastHours(currentTimeStr);

        console.log("[SİSTEM] Saatlik ortalama için prefix'ler:", targets);

        // --- SAATLİK ORTALAMALAR (OMNI2 eğitim formatı ile birebir uyumlu) ---
        // Plasma sütunları: [time(0), density(1), speed(2), temperature(3)]
        // Mag sütunları:    [time(0), bx_gsm(1), by_gsm(2), bz_gsm(3), ...]

        const curr_bz    = saatlikOrtalama(magData,    targets.current, 3);
        const curr_dens  = saatlikOrtalama(plasmaData, targets.current, 1);
        const curr_speed = saatlikOrtalama(plasmaData, targets.current, 2);

        const lag1_bz    = saatlikOrtalama(magData,    targets.lag1, 3);
        const lag1_dens  = saatlikOrtalama(plasmaData, targets.lag1, 1);
        const lag1_speed = saatlikOrtalama(plasmaData, targets.lag1, 2);

        const lag2_bz    = saatlikOrtalama(magData,    targets.lag2, 3);
        const lag2_dens  = saatlikOrtalama(plasmaData, targets.lag2, 1);
        const lag2_speed = saatlikOrtalama(plasmaData, targets.lag2, 2);

        const lag3_bz    = saatlikOrtalama(magData,    targets.lag3, 3);
        const lag3_dens  = saatlikOrtalama(plasmaData, targets.lag3, 1);
        const lag3_speed = saatlikOrtalama(plasmaData, targets.lag3, 2);

        // Kp değerleri NOAA'dan 3-saatlik periyotlar halinde geliyor (zaten period ortalaması)
        // OMNI2 ile uyumlu olması için x10 kodlaması korunuyor
        const lag1_Kp = parseFloat(kpData[kpData.length - 2][1]) * 10;
        const lag2_Kp = parseFloat(kpData[kpData.length - 3][1]) * 10;
        const lag3_Kp = parseFloat(kpData[kpData.length - 4][1]) * 10;

        // Tüm saatlik ortalamalar için null kontrolü
        const tumDegerler = [curr_bz, curr_dens, curr_speed, lag1_bz, lag1_dens, lag1_speed, lag2_bz, lag2_dens, lag2_speed, lag3_bz, lag3_dens, lag3_speed];
        if (tumDegerler.some((v) => v === null)) {
            throw new Error("Saatlik ortalama hesaplanamadı: Bir veya daha fazla saat diliminde veri bulunamadı.");
        }

        // Model girdi dizisi (15 özellik, OMNI2 eğitim sırası ile aynı)
        const modelInputArray = [
            curr_bz,    curr_dens,   curr_speed,
            lag1_bz,    lag1_dens,   lag1_speed,  lag1_Kp,
            lag2_bz,    lag2_dens,   lag2_speed,  lag2_Kp,
            lag3_bz,    lag3_dens,   lag3_speed,  lag3_Kp,
        ];

        console.log(`[SİSTEM] Saatlik ortalamalar hesaplandı. Bz(anlık saat)=${curr_bz?.toFixed(2)}, Yoğunluk=${curr_dens?.toFixed(2)}, Hız=${curr_speed?.toFixed(1)}`);

        return modelInputArray;
    } catch (err) {
        console.log("Veriler çekilirken hata meydana geldi:", err.message);
        throw err; // Hatayı yutma, dışarı (Cron'a) fırlat ki sistem bilsin.
    }
};

module.exports = getNoaaDatas;
