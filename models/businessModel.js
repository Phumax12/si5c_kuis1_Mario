const mongoose = require("mongoose");
const Owner = require("./ownerModel");

const locationSchema = new mongoose.Schema(
  {
    kota: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const businessSchema = new mongoose.Schema(
  {
    namaUsaha: { type: String, required: true, trim: true },
    kategori: { type: String, required: true, trim: true },
    lokasi: { type: locationSchema, required: true },
    pemilikId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
  },
  { timestamps: true }
);

const Business =
  mongoose.models.Business || mongoose.model("Business", businessSchema);

const fieldMap = {
  id: "_id",
  namaUsaha: "namaUsaha",
  kategori: "kategori",
  kota: "lokasi.kota",
  pemilik: "pemilikId",
  pemilikId: "pemilikId",
  noHp: "pemilikId",
};

function toResponse(business, projection) {
  const values = {
    id: business._id.toString(),
    namaUsaha: business.namaUsaha,
    pemilikId:
      business.pemilikId && business.pemilikId._id
        ? business.pemilikId._id.toString()
        : business.pemilikId && business.pemilikId.toString(),
    pemilik: business.pemilikId && business.pemilikId.nama,
    kategori: business.kategori,
    kota: business.lokasi && business.lokasi.kota,
    noHp: business.pemilikId && business.pemilikId.noHp,
  };

  if (!projection) return values;
  return Object.fromEntries(
    projection
      .filter((field) => field in values)
      .map((field) => [field, values[field]])
  );
}

async function getAll({
  filters,
  page,
  limit,
  sortBy,
  order,
  projection,
}) {
  const query = {};

  if (filters.kategori) query.kategori = filters.kategori;
  if (filters.kota) query["lokasi.kota"] = filters.kota;

  if (filters.pemilik) {
    const owners = await Owner.find({ nama: filters.pemilik }).select("_id").lean();
    query.pemilikId = { $in: owners.map((owner) => owner._id) };
  }

  const databaseFields = projection
    ? [...new Set(projection.map((field) => fieldMap[field]).filter(Boolean))]
    : ["namaUsaha", "kategori", "lokasi.kota", "pemilikId"];
  if (!databaseFields.includes("_id")) databaseFields.push("_id");

  const shouldPopulate =
    !projection ||
    projection.includes("pemilik") ||
    projection.includes("pemilikId") ||
    projection.includes("noHp");
  const ownerFields = shouldPopulate
    ? projection
      ? projection.filter(
          (field) => field === "pemilik" || field === "noHp"
        )
      : ["pemilik", "noHp"]
    : [];
  if (projection && projection.includes("pemilikId")) {
    ownerFields.push("pemilikId");
  }
  const ownerProjection = ownerFields
    .map((field) => (field === "pemilik" ? "nama" : field === "noHp" ? "noHp" : "_id"))
    .join(" ");

  const sortFields = {
    namaUsaha: "namaUsaha",
    kategori: "kategori",
    kota: "lokasi.kota",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };
  const sort = { [sortFields[sortBy]]: order === "desc" ? -1 : 1 };

  const businessQuery = Business.find(query)
    .select(databaseFields.join(" "))
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  if (shouldPopulate) {
    businessQuery.populate({ path: "pemilikId", select: ownerProjection });
  }

  const [businesses, total] = await Promise.all([
    businessQuery.lean(),
    Business.countDocuments(query),
  ]);

  return {
    data: businesses.map((business) => toResponse(business, projection)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getById(id) {
  const business = await Business.findById(id)
    .populate({ path: "pemilikId", select: "nama noHp" })
    .lean();
  return business ? toResponse(business) : null;
}

async function create({ namaUsaha, pemilik, pemilikId, kategori, kota, noHp }) {
  const owner = pemilikId
    ? await Owner.findById(pemilikId)
    : await Owner.create({ nama: pemilik, noHp });
  if (!owner) {
    const error = new Error("Data pemilik tidak ditemukan");
    error.status = 404;
    throw error;
  }
  const business = await Business.create({
    namaUsaha,
    kategori,
    lokasi: { kota },
    pemilikId: owner._id,
  });
  return toResponse({
    ...business.toObject(),
    pemilikId: owner,
  });
}

async function update(id, { namaUsaha, pemilik, pemilikId, kategori, kota, noHp }) {
  const business = await Business.findById(id);
  if (!business) return null;

  let owner;
  if (pemilikId) {
    owner = await Owner.findById(pemilikId);
    if (!owner) {
      const error = new Error("Data pemilik tidak ditemukan");
      error.status = 404;
      throw error;
    }
    business.pemilikId = owner._id;
  } else {
    const currentOwner = await Owner.findById(business.pemilikId);
    owner = await Owner.create({
      nama: pemilik,
      noHp: noHp === undefined ? currentOwner && currentOwner.noHp : noHp,
    });
    business.pemilikId = owner._id;
  }

  business.namaUsaha = namaUsaha;
  business.kategori = kategori;
  business.lokasi.kota = kota;
  await business.save();

  return toResponse({ ...business.toObject(), pemilikId: owner });
}

async function remove(id) {
  const business = await Business.findByIdAndDelete(id);
  if (!business) return false;
  const ownerIsReferenced = await Business.exists({
    pemilikId: business.pemilikId,
  });
  if (!ownerIsReferenced) await Owner.findByIdAndDelete(business.pemilikId);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
