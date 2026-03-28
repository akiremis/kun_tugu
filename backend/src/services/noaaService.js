const axios = require("axios");
const findPastHours = require("../utils/dateProcesses").findPastHours;

const getNoaaDatas = async () => {
    try {
        const [plasmaRes, magRes, kpRes] = await Promise.all([axios.get("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"), axios.get("https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json"), axios.get("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")]);

        const plasmaData = plasmaRes.data; // [["time_tag", "density", "speed", "temperature"], ...]
        const magData = magRes.data; // [["time_tag", "bx", "by", "bz", "lon", "lat", "bt"], ...]
        const kpData = kpRes.data; // [["time_tag", "Kp", "a_running", "station_count"], ...]

        //? Mag dizisinde Bz 3. indekstedir. Plasma dizisinde Density 1., Speed 2. indekstedir.
        const instandMag = magData[magData.length - 1];
        const instandPlasma = plasmaData[plasmaData.length - 1];

        //? Makine eğitilirken veriler 10 ile çarpıldığından burada da 10 ile çarpıyoruz.
        const instandKp = parseFloat(kpData[kpData.length - 1][1]) * 10;

        const currentPlasma = plasmaData[plasmaData.length - 1];
        const currentTimeStr = currentPlasma[0];

        const targets = findPastHours(currentTimeStr);

        const lag1_Kp = parseFloat(kpData[kpData.length - 2][1]) * 10;
        const lag1_Plasma = plasmaData.find((line) => line[0] == targets.lag1);
        const mag1_Plasma = magData.find((line) => line[0] == targets.lag1);

        const lag2_Kp = parseFloat(kpData[kpData.length - 3][1]) * 10;
        const lag2_Plasma = plasmaData.find((line) => line[0] == targets.lag2);
        const mag2_Plasma = magData.find((line) => line[0] == targets.lag1);

        const lag3_Kp = parseFloat(kpData[kpData.length - 4][1]) * 10;
        const lag3_Plasma = plasmaData.find((line) => line[0] == targets.lag3);
        const mag3_Plasma = magData.find((line) => line[0] == targets.lag1);

        const modelInputArray = [
            // --- CURRENT (Anlık Veriler) ---
            parseFloat(currentMag[3]), // 1. Bz_GSM
            parseFloat(currentPlasma[1]), // 2. Proton_Density
            parseFloat(currentPlasma[2]), // 3. Flow_Speed

            // --- LAG 1 (1 Saat Önceki Veriler) ---
            parseFloat(lag1_Mag[3]), // 4. Bz_GSM_lag_1
            parseFloat(lag1_Plasma[1]), // 5. Proton_Density_lag_1
            parseFloat(lag1_Plasma[2]), // 6. Flow_Speed_lag_1
            lag1_Kp, // 7. Kp_Index_lag_1 (Zaten float yapıp 10 ile çarpmıştık)

            // --- LAG 2 (2 Saat Önceki Veriler) ---
            parseFloat(lag2_Mag[3]), // 8. Bz_GSM_lag_2
            parseFloat(lag2_Plasma[1]), // 9. Proton_Density_lag_2
            parseFloat(lag2_Plasma[2]), // 10. Flow_Speed_lag_2
            lag2_Kp, // 11. Kp_Index_lag_2

            // --- LAG 3 (3 Saat Önceki Veriler) ---
            parseFloat(lag3_Mag[3]), // 12. Bz_GSM_lag_3
            parseFloat(lag3_Plasma[1]), // 13. Proton_Density_lag_3
            parseFloat(lag3_Plasma[2]), // 14. Flow_Speed_lag_3
            lag3_Kp, // 15. Kp_Index_lag_3
        ];

        // Diziyi Controller veya Cron Job'un kullanması için dışarı aktarıyoruz
        return modelInputArray;
    } catch (err) {
        console.log("Verileri çekilirken haat meydana geldi:", err);
    }
};

module.exports.getNoaaDatas;