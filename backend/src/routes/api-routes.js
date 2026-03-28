const express = require("express");
const router = express.Router();
const { getCurrentForecast } = require("../controllers/forecast-controllers");

router.get("/forecast/current", getCurrentForecast);

module.exports = router;
