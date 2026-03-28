const express = require("express");
const apiRouter = express.Router();

apiRouter.get("/", (req, res, next) => {
    res.render("index", { title: "anasayfa" });
});

module.exports = apiRouter;