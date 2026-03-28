// src/utils/forecast.js
const ort = require("onnxruntime-node");
const path = require("path");

const MODEL_PATH = path.join(__dirname, "xgboost_firtina_modeli.onnx");

const aiForecast = async (inputArray) => {
    try {
        const session = await ort.InferenceSession.create(MODEL_PATH);

        const dataA = Float32Array.from(inputArray);
        const tensorA = new ort.Tensor("float32", dataA, [1, 15]);

        const feeds = { float_input: tensorA };
        const results = await session.run(feeds);

        const outputTensor = results[session.outputNames[0]];
        return outputTensor.data[0];
    } catch (err) {
        console.error(`ONNX Çalıştırma Hatası: ${err}`);
        throw err;
    }
};

module.exports = { aiForecast };
