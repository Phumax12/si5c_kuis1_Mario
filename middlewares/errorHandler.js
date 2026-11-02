function errorHttp(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function notFoundHandler(req, res, next) {
  next(errorHttp(404, `Rute ${req.method} ${req.originalUrl} tidak ditemukan`));
}

function errorHandler(err, req, res, next) {
  // 1. JSON rusak dari client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }
  // 2. ID tidak sesuai format ObjectId (mis. /mahasiswa/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Nilai '${err.value}' tidak valid untuk field ${err.path}` });
  }
  // 3. Pelanggaran aturan Schema (required, enum, dll.)
  if (err.name === 'ValidationError') {
    // Pesan CastError bawaan menyebut nama model; diganti pesan yang aman
    const detail = Object.values(err.errors).map((e) =>
      e.name === 'CastError' ? `Nilai untuk ${e.path} tidak valid` : e.message
    );
    return res.status(400).json({ message: 'Data tidak valid', detail });
  }
  // 4. Pelanggaran unique (kode error MongoDB 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const message = field ? `Nilai ${field} sudah dipakai` : 'Data duplikat';
    return res.status(409).json({ message });
  }
  // 5. Error yang sengaja dilempar lewat errorHttp()
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  // 6. Selain itu: kesalahan server. Detail hanya dicatat di log.
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}

module.exports = { errorHttp, notFoundHandler, errorHandler };