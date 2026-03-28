const calcNoaaValue = (modelGuess) => {
    //? Model kp değerini 10 ile çarparak verdiği için gerçek kp değerini bulmak için 10'a böldük
    const realKp = modelGuess / 10;

    //Kp arttıkça fırtına ekvatora doğru iner. Her 1 Kp artışı enlemi yaklaşık 2.5 derece güneye çeker.
    // Başlangıç noktası kutup dairesi olan 66 derecedir.
    const latitude = 66.0 - realKp * 2.5;

    //G-Ölçeği (Geomagnetic Storm Scale) Hesaplama
    let gScale = "G0";
    let gDesc = "Normal Uzay Havası";

    if (realKp >= 5) {
        // Kp 5 = G1, Kp 6 = G2 ... formülü: G = Kp - 4
        const gLevel = realKp - 4;
        gScale = `G${gLevel}`;

        const descs = {
            1: "Minör Jeomanyetik Fırtına",
            2: "Orta Şiddetli Jeomanyetik Fırtına",
            3: "Güçlü Jeomanyetik Fırtına",
            4: "Şiddetli Jeomanyetik Fırtına",
            5: "Kritik (Ekstrem) Jeomanyetik Fırtına",
        };
        gDesc = descs[gLevel] || "Bilinmeyen Fırtına Sınıfı";
    }
    
    return {
        realKp: parseFloat(realKp.toFixed(2)),
        latitude: parseFloat(latitude.toFixed(1)),
        gScale,
        gDesc
    };

}

module.exports = { calcNoaaValue };