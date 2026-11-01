require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const businessRoutes = require("./routes/businessRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
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
      "GET /businesses?kategori=kerajinan&kota=Bandung",
      "GET /businesses?page=1&limit=10&sortBy=namaUsaha&sortOrder=asc",
      "GET /businesses?projection=namaUsaha,pemilik,kota",
      "GET /owners",
      "POST /owners (butuh x-api-key)",
      "POST /businesses (butuh x-api-key)",
      "PUT /businesses/:id (butuh x-api-key)",
      "DELETE /businesses/:id (butuh x-api-key)",
    ],
  });
});

app.use("/businesses", businessRoutes);
app.use("/owners", ownerRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diatur; server memerlukan koneksi MongoDB");
  }

  await mongoose.connect(mongoUri);
  console.log("Terhubung ke MongoDB");
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(`Gagal menjalankan server: ${err.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;