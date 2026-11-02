const Kategori = require('../models/categoriesModel');

exports.create = async (req, res) => {
  try {
    const kategori = await Kategori.create(req.body);
    res.status(201).json(kategori);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Kategori.find());
};