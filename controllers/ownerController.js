const Owner = require("../models/ownerModel");
const { errorHttp } = require("../middlewares/errorHandler");

async function getAllOwners(req, res) {
  const data = await Owner.find().sort({ nama: 1 }).lean();
  res.status(200).json(data);
}

async function createOwner(req, res, next) {
  const { nama, noHp } = req.body || {};
  if (!nama) {
    return next(errorHttp(400, "nama pemilik wajib diisi"));
  }

  const owner = await Owner.create({ nama, noHp });
  res.status(201).json(owner);
}

module.exports = { getAllOwners, createOwner };
