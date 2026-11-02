const Business = require('../models/businessModel');
const Category = require('../models/categoriesModel');
const { errorHttp } = require('../middlewares/errorHandler');
const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['namaUsaha', 'businessId', 'createdAt'];
const FIELD_BOLEH_DIPILIH = ['namaUsaha', 'businessId', 'pemilik', 'categoriesId', 'createdAt'];

// Mengubah bilangan dari query string menjadi bilangan bulat yang aman
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  const { namaUsaha, businessId, pemilik, categoriesId } = req.body;
  const business = await Business.create({ namaUsaha, businessId, pemilik, categoriesId });
  res.status(201).json(business);
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.alamat) {
    filter['pemilik.alamat'] = String(req.query.alamat);
  }
  const kodeKategori = req.query.kategori || req.query.prodi;
  if (kodeKategori) {
    const category = await Category.findOne({ kodeKategori: String(kodeKategori).toUpperCase() });
    // Kode kategori tidak dikenal -> hasil kosong ($in: [] tidak cocok dengan apa pun)
    filter.categoriesId = category ? category._id : { $in: [] };
  }
  const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);

  // Sorting: ?sort=namaUsaha (naik) atau ?sort=-namaUsaha (turun). Bawaan: terbaru dulu
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');
  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(400, `sort hanya boleh: ${FIELD_SORT.join(', ')}`);
  }

  // Projection: ?fields=namaUsaha,businessId
  let select = '';
  if (req.query.fields) {
    const fields = String(req.query.fields).split(',').map((f) => f.trim());
    if (!fields.every((f) => FIELD_BOLEH_DIPILIH.includes(f))) {
      throw errorHttp(400, `fields hanya boleh: ${FIELD_BOLEH_DIPILIH.join(', ')}`);
    }
    select = fields.join(' ');
  }

  const query = Business.find(filter)
    .select(select)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  if (!select || select.split(' ').includes('categoriesId')) {
    query.populate('categoriesId', 'kodeKategori namaKategori');
  }

  const [data, total] = await Promise.all([query, Business.countDocuments(filter)]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
};
exports.getById = async (req, res) => {
  const data = await Business.findById(req.params.id).populate('categoriesId');
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.update = async (req, res) => {
  const { namaUsaha, businessId, pemilik, categoriesId } = req.body;
  const data = await Business.findByIdAndUpdate(
    req.params.id,
    { namaUsaha, businessId, pemilik, categoriesId },
    { returnDocument: 'after', runValidators: true }
  );
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await Business.findByIdAndDelete(req.params.id);
  if (!data) throw errorHttp(404, 'Data tidak ditemukan');
  res.status(204).send();
};