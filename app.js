require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const categoriesRoutes = require('./routes/categoriesRoutes'); 
const businessRoutes = require('./routes/businessRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware global ----------
app.use(logger);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ---------- Route dasar ----------
app.get('/', (req, res) => {
  res.send('Server Express.js berjalan!');
});

// ---------- Route per modul ----------
app.use('/business', businessRoutes);
app.use('/categories', categoriesRoutes); 

// ---------- Handler 404 dan error handler (paling bawah) ----------
app.use(notFoundHandler);
app.use(errorHandler);


// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });

// app.get("/", (req, res) => {
//   res.json({
//     nama: "M. Mario Al Zaky",
//     nim: "2428240157",
//     topik: 33,
//     endpoints: [
//       "GET /businesses",
//       "GET /businesses/:id",
//       "GET /businesses?kategori=kerajinan&kota=Bandung",
//       "GET /businesses?page=1&limit=10&sortBy=namaUsaha&sortOrder=asc",
//       "GET /businesses?projection=namaUsaha,pemilik,kota",
//       "GET /kategori",
//       "POST /kategri (butuh x-api-key)",
//       "POST /businesses (butuh x-api-key)",
//       "PUT /businesses/:id (butuh x-api-key)",
//       "DELETE /businesses/:id (butuh x-api-key)",
//     ],
//   });
// });

// async function startServer() {
//   const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
//   if (!mongoUri) {
//     throw new Error("MONGODB_URI belum diatur; server memerlukan koneksi MongoDB");
//   }

//   await mongoose.connect(mongoUri);
//   console.log("Terhubung ke MongoDB");
//   app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
// }

// if (require.main === module) {
//   startServer().catch((err) => {
//     console.error(`Gagal menjalankan server: ${err.message}`);
//     process.exitCode = 1;
//   });
// }

// module.exports = app;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal terhubung:', err.message);
    process.exit(1);
  });