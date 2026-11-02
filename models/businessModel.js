const mongoose = require('mongoose');

const pemilikSchema = new mongoose.Schema({
  nama: String,
  alamat: String,
}, { _id: false });

const businessSchema = new mongoose.Schema({
  namaUsaha: { type: String, required: [true, 'nama usaha wajib diisi'], trim: true },
  pemilik: pemilikSchema,
  categoriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kategori' },
  businessId: { type: String, required: [true, 'businessId wajib diisi'], unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Business', businessSchema);