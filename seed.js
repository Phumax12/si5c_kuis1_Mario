// Mengisi database dengan data pemilik dan usaha contoh.
// Aman dijalankan berulang: data pada collection terkait dihapus terlebih dahulu.
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
require("./models/businessModel");
const Business = mongoose.model("Business");
const Owner = require("./models/ownerModel");

const NAMA_USAHA = [
  "Anyaman Bambu Sari",
  "Keripik Pisang Bu Ani",
  "Batik Tulis Nusantara",
  "Kopi Pagi Palembang",
  "Pempek Selera Kita",
  "Tenun Songket Indah",
  "Roti Rumah Maya",
  "Kerajinan Kayu Jati",
  "Sambal Mak Rina",
  "Kue Tradisional Dewi",
  "Dapoer Sriwijaya",
  "Tas Rajut Lina",
  "Mebel Karya Mandiri",
  "Camilan Gurih Oka",
  "Batik Warna Alam",
  "Kopi Bukit Barisan",
  "Kemplang Pak Hadi",
  "Buket Bunga Fitri",
  "Kerupuk Ikan Tono",
  "Songket Palembang Jaya",
  "Dapur Citra Rasa",
  "Anyaman Rotan Indah",
  "Pisang Crispy Zaki",
  "Rendang Uni Sari",
  "Galeri Kriya Sumsel",
];
const KATEGORI = ["kerajinan", "kuliner", "fesyen"];
const KOTA = ["Palembang", "Indralaya", "Prabumulih", "Lubuklinggau"];
const PEMILIK = [
  { nama: "Sari Wulandari", noHp: "082233445566" },
  { nama: "Ani Rahayu", noHp: "081298765432" },
  { nama: "Rudi Hartono", noHp: "085612345678" },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diatur pada file .env");
  }

  try {
    await mongoose.connect(mongoUri);

    await Business.deleteMany({});
    await Owner.deleteMany({});

    const owners = await Owner.insertMany(PEMILIK);
    const businesses = NAMA_USAHA.map((namaUsaha, index) => ({
      namaUsaha,
      kategori: KATEGORI[index % KATEGORI.length],
      lokasi: { kota: KOTA[index % KOTA.length] },
      pemilikId: owners[index % owners.length]._id,
    }));
    await Business.insertMany(businesses);

    console.log(
      `Seed selesai: ${owners.length} pemilik, ${businesses.length} usaha`
    );
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main().catch((err) => {
  console.error(`Seed gagal: ${err.message}`);
  process.exitCode = 1;
});