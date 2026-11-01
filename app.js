require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const businessRoutes = require("./routes/businessRoutes");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(express.json());

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

if (require.main === module && process.env.NODE_ENV !== "production") {
  const startServer = () => {
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  };

  if (!process.env.DB_URI) {
    console.warn("DB_URI belum diatur, menjalankan server tanpa koneksi MongoDB");
    startServer();
    return;
  }

  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Terhubung ke MongoDB");
      startServer();
    })
    .catch((err) => {
      console.warn(`Gagal terhubung ke MongoDB: ${err.message}`);
      console.warn("Menjalankan server tanpa koneksi MongoDB");
      startServer();
    });
}

module.exports = app;