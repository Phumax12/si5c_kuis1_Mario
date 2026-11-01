const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    noHp: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Owner || mongoose.model("Owner", ownerSchema);
