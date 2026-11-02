const mongoose = require('mongoose');

const kategoriSchema = new mongoose.Schema({
  kodeKategori: { type: String, required: [true, 'kode wajib diisi'], unique: true, trim: true, uppercase: true },
  namaKategori: { type: String, required: [true, 'nama wajib diisi'], trim: true },
});

module.exports = mongoose.model('Kategori', kategoriSchema);