const businessModel = require("../models/businessModel");
const { errorHttp } = require("../middlewares/errorHandler");

function getAllBusinesses(req, res) {
  const { kategori } = req.query;
  res.status(200).json(businessModel.getAll(kategori));
}

function getBusinessById(req, res, next) {
  const id = parseInt(req.params.id);
  const data = businessModel.getById(id);

  if (!data) {
    return next(errorHttp(404, `Data dengan id ${id} tidak ditemukan`));
  }

  res.status(200).json(data);
}

function createBusiness(req, res, next) {
  const { namaUsaha, pemilik, kategori, kota, noHp } = req.body || {};

  if (!namaUsaha || !pemilik || !kategori || !kota) {
    return next(
      errorHttp(400, "namaUsaha, pemilik, kategori, dan kota wajib diisi")
    );
  }

  const baru = businessModel.create({ namaUsaha, pemilik, kategori, kota, noHp });

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: baru,
  });
}

function updateBusiness(req, res, next) {
  const id = parseInt(req.params.id);

  if (!businessModel.getById(id)) {
    return next(errorHttp(404, `Data dengan id ${id} tidak ditemukan`));
  }

  const { namaUsaha, pemilik, kategori, kota, noHp } = req.body || {};

  if (!namaUsaha || !pemilik || !kategori || !kota) {
    return next(
      errorHttp(400, "namaUsaha, pemilik, kategori, dan kota wajib diisi")
    );
  }

  const diubah = businessModel.update(id, { namaUsaha, pemilik, kategori, kota, noHp });

  res.status(200).json({
    status: "success",
    message: `Data usaha dengan id ${id} berhasil diubah`,
    data: diubah,
  });
}

function deleteBusiness(req, res, next) {
  const id = parseInt(req.params.id);

  if (!businessModel.remove(id)) {
    return next(errorHttp(404, `Data dengan id ${id} tidak ditemukan`));
  }

  res.status(200).json({
    status: "success",
    message: `Data usaha dengan id ${id} berhasil dihapus`,
    data: null,
  });
}

module.exports = {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
};