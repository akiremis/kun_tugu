const port = 8080;

const express = require("express");
const path = require("path");

const app = express();
const apiRoutes = require("./src/routes/api-routes");

app.use("/api", apiRoutes);
app.use(express.json());

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "/src/views/index.html"));
});


app.listen(port, () => {
    console.log(`Sunucu kalktı ve ${port} portu dinleniyor. http://localhost:${port}`);
});
