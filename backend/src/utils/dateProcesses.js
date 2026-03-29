const convertToNoaaFormat = (dateObj) => {
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const hour = String(dateObj.getUTCHours()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:`;
};

function findPastHours(currentDateStr) {
    // Örnek Dönüşüm: "2026-03-28 15:47:00.000" -> "2026-03-28T15:47:00.000Z"
    const isoFormat = currentDateStr.replace(" ", "T") + "Z";
    const referenceDate = new Date(isoFormat);

    // Olası bir yapısal hataya karşı güvenlik kontrolü
    if (isNaN(referenceDate.getTime())) {
        console.error("[HATA] JavaScript bu tarihi okuyamadı. Gelen format:", currentDateStr);
    }

    // Hem mevcut saatin prefix'ini hem de geçmiş 3 saati döndür
    const targetDates = {
        current: convertToNoaaFormat(referenceDate), // Saatlik ortalama için mevcut saat
        lag1: "",
        lag2: "",
        lag3: "",
    };

    for (let i = 1; i <= 3; i++) {
        const pastDate = new Date(referenceDate.getTime());
        pastDate.setUTCHours(pastDate.getUTCHours() - i);
        targetDates[`lag${i}`] = convertToNoaaFormat(pastDate);
    }
    return targetDates;
}

module.exports = { findPastHours: findPastHours };