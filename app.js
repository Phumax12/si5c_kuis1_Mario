require("dotenv").config();

const express = require("express");
const businessRoutes = require("./routes/businessRoutes");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express(); 
const PORT = process.env.PORT || 3000;


app.use(logger);
app.use(express.json());

// GET /
app.get("/", (req, res) => {
  res.json({
    nama: "M. Mario Al Zaky",
    nim: "2428240157",
    topik: 33,
    endpoints: [
      "GET /businesses",
      "GET /businesses/:id",
      "GET /businesses?kategori=kerajinan",
      "POST /businesses (butuh x-api-key)",
      "PUT /businesses/:id (butuh x-api-key)",
      "DELETE /businesses/:id (butuh x-api-key)",
    ],
  });
});

app.use("/businesses", businessRoutes);


app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`Server berjalan di http://localhost:${PORT}`)
  );
}

module.exports = app;