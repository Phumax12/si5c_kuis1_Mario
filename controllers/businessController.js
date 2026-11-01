const businessModel = require("../models/businessModel");
const { errorHttp } = require("../middlewares/errorHandler");

const projectionFields = new Set([
  "id",
  "namaUsaha",
  "pemilik",
  "pemilikId",
  "kategori",
  "kota",
  "noHp",
]);
const sortableFields = new Set([
  "namaUsaha",
  "kategori",
  "kota",
  "createdAt",
  "updatedAt",
]);

function singleQueryValue(value, name) {
  if (typeof value !== "string") {
    throw errorHttp(400, `Parameter ${name} harus berupa teks`);
  }
  return value.trim();
}

function parsePositiveInteger(value, name, fallback, maximum) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    (maximum && parsed > maximum)
  ) {
    throw errorHttp(
      400,
      `${name} harus berupa bilangan bulat antara 1 dan ${maximum || "maksimum"}`
    );
  }
  return parsed;
}

function parseProjection(value) {
  if (value === undefined) return undefined;
  const fields = singleQueryValue(value, "projection")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

  if (!fields.length || fields.some((field) => !projectionFields.has(field))) {
    throw errorHttp(
      400,
      `projection hanya boleh berisi: ${[...projectionFields].join(", ")}`
    );
  }

  return [...new Set(fields)];
}

function parseBusinessId(value) {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw errorHttp(400, "ID usaha tidak valid");
  }
  return value;
}

function validateOwnerId(ownerId) {
  if (ownerId === undefined) return;
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw errorHttp(400, "pemilikId tidak valid");
  }
}

async function getAllBusinesses(req, res) {
  const { page, limit, sortBy, sortOrder, projection, kategori, kota, pemilik } =
    req.query;
  const parsedPage = parsePositiveInteger(page, "page", 1);
  const parsedLimit = parsePositiveInteger(limit, "limit", 10, 100);
  if (parsedPage > Math.floor(Number.MAX_SAFE_INTEGER / parsedLimit)) {
    throw errorHttp(400, "Kombinasi page dan limit terlalu besar");
  }
  const field = sortBy === undefined ? "namaUsaha" : singleQueryValue(sortBy, "sortBy");
  const direction =
    sortOrder === undefined ? "asc" : singleQueryValue(sortOrder, "sortOrder");

  if (!sortableFields.has(field)) {
    throw errorHttp(400, `sortBy harus salah satu dari: ${[...sortableFields].join(", ")}`);
  }
  if (direction !== "asc" && direction !== "desc") {
    throw errorHttp(400, "sortOrder harus bernilai asc atau desc");
  }

  const filters = {};
  for (const [key, value] of Object.entries({ kategori, kota, pemilik })) {
    if (value !== undefined) {
      const normalized = singleQueryValue(value, key);
      if (normalized) filters[key] = normalized;
    }
  }

  const result = await businessModel.getAll({
    filters,
    page: parsedPage,
    limit: parsedLimit,
    sortBy: field,
    order: direction,
    projection: parseProjection(projection),
  });
  res.status(200).json({ status: "success", ...result });
}

async function getBusinessById(req, res, next) {
  const id = parseBusinessId(req.params.id);
  const data = await businessModel.getById(id);

  if (!data) {
    return next(errorHttp(404, `Data dengan id ${id} tidak ditemukan`));
  }

  res.status(200).json(data);
}

async function createBusiness(req, res, next) {
  const { namaUsaha, pemilik, pemilikId, kategori, kota, noHp } = req.body || {};

  if (!namaUsaha || (!pemilik && !pemilikId) || !kategori || !kota) {
    return next(
      errorHttp(
        400,
        "namaUsaha, kategori, dan kota wajib diisi; sertakan pemilik atau pemilikId"
      )
    );
  }
  validateOwnerId(pemilikId);

  const baru = await businessModel.create({
    namaUsaha,
    pemilik,
    pemilikId,
    kategori,
    kota,
    noHp,
  });

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: baru,
  });
}

async function updateBusiness(req, res, next) {
  const id = parseBusinessId(req.params.id);

  const { namaUsaha, pemilik, pemilikId, kategori, kota, noHp } = req.body || {};

  if (!namaUsaha || (!pemilik && !pemilikId) || !kategori || !kota) {
    return next(
      errorHttp(
        400,
        "namaUsaha, kategori, dan kota wajib diisi; sertakan pemilik atau pemilikId"
      )
    );
  }
  validateOwnerId(pemilikId);

  const diubah = await businessModel.update(id, {
    namaUsaha,
    pemilik,
    pemilikId,
    kategori,
    kota,
    noHp,
  });
  if (!diubah) {
    return next(errorHttp(404, `Data dengan id ${id} tidak ditemukan`));
  }

  res.status(200).json({
    status: "success",
    message: `Data usaha dengan id ${id} berhasil diubah`,
    data: diubah,
  });
}

async function deleteBusiness(req, res, next) {
  const id = parseBusinessId(req.params.id);

  if (!(await businessModel.remove(id))) {
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