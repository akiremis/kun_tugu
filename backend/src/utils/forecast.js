const ort = require("./xgboost_firtina_modeli.onnx");

async function forecast() {
    try {
        const session = await ort.InferenceSession.create("./xgboost_firtina_modeli.onnx");

        const solarDatas = [
            -5.2,
            12.5,
            650.0, // Anlık: Bz, Proton, Flow

            -4.1,
            11.0,
            620.0,
            50.0, // Lag 1: Bz, Proton, Flow, Kp

            -2.0,
            8.0,
            580.0,
            40.0, // Lag 2: Bz, Proton, Flow, Kp

            1.5,
            5.0,
            450.0,
            20.0, // Lag 3: Bz, Proton, Flow, Kp
        ];

        //? JavaScript sayıları varsayılan olarak 64-bit ondalıklı sayıdır (Float64).
        //? Ancak makine öğrenmesi modelleri performansı artırmak için 32-bit (Float32) kullanır.
        //? Bu yüzden standart dizimizi, saf bir Float32 matrisine (Tensor) çeviriyoruz.
        const dataA = Float32Array.from(solarDatas);
        const tensorA = new ort.Tensor("float32", dataA, [1, 15]); // [1 satır, 15 sütun]

        // 'float_input' ismi, Python'da initial_type tanımlarken verdiğimiz isimdir.
        const feeds = { float_input: tensorA };
        const results = await session.run(feeds);

        const outputTensor = results[session.outputNames[0]];
        const estimatedKp = outputTensor.data[0];

        console.log(`Node.js İçinden Doğrudan Tahmin Edilen Kp: ${tahminEdilenKp.toFixed(2)}`);
    } catch (err) {
        console.error(`ONNX Çalıştırma Hatası: ${err}`);
    }
}

module.exports = forecast;