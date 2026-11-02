// Mengisi database dengan kategori dan 25 contoh usaha.
// Aman dijalankan berulang: data pada collection terkait dihapus terlebih dahulu.
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const Business = require('./models/businessModel');
const Category = require('./models/categoriesModel');

const NAMA_USAHA = [
  'Anyaman Bambu Sari',
  'Keripik Pisang Bu Ani',
  'Batik Tulis Nusantara',
  'Kopi Pagi Palembang',
  'Pempek Selera Kita',
  'Tenun Songket Indah',
  'Roti Rumah Maya',
  'Kerajinan Kayu Jati',
  'Sambal Mak Rina',
  'Kue Tradisional Dewi',
  'Dapoer Sriwijaya',
  'Tas Rajut Lina',
  'Mebel Karya Mandiri',
  'Camilan Gurih Oka',
  'Batik Warna Alam',
  'Kopi Bukit Barisan',
  'Kemplang Pak Hadi',
  'Buket Bunga Fitri',
  'Kerupuk Ikan Tono',
  'Songket Palembang Jaya',
  'Dapur Citra Rasa',
  'Anyaman Rotan Indah',
  'Pisang Crispy Zaki',
  'Rendang Uni Sari',
  'Galeri Kriya Sumsel',
];

const KATEGORI = [
  { kodeKategori: 'KERAJINAN', namaKategori: 'Kerajinan' },
  { kodeKategori: 'KULINER', namaKategori: 'Kuliner' },
  { kodeKategori: 'FESYEN', namaKategori: 'Fesyen' },
];

const PEMILIK = [
  { nama: 'Sari Wulandari', alamat: 'Palembang' },
  { nama: 'Ani Rahayu', alamat: 'Indralaya' },
  { nama: 'Rudi Hartono', alamat: 'Prabumulih' },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI belum diatur pada file .env');
  }

  try {
    await mongoose.connect(mongoUri);
    await Promise.all([Business.deleteMany({}), Category.deleteMany({})]);

    const categories = await Category.insertMany(KATEGORI);
    const businesses = NAMA_USAHA.map((namaUsaha, index) => ({
      namaUsaha,
      businessId: `BIZ-${String(index + 1).padStart(4, '0')}`,
      pemilik: PEMILIK[index % PEMILIK.length],
      categoriesId: categories[index % categories.length]._id,
    }));
    await Business.insertMany(businesses);

    console.log(`Seed selesai: ${categories.length} kategori, ${businesses.length} usaha`);
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
