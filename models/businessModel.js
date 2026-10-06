let businesses = [
  {
    id: 1,
    namaUsaha: "Anyaman Bambu Sari",
    pemilik: "Sari Wulandari",
    kategori: "kerajinan",
    kota: "Tasikmalaya",
    noHp: "082233445566",
  },
  {
    id: 2,
    namaUsaha: "Keripik Pisang Bu Ani",
    pemilik: "Ani Rahayu",
    kategori: "kuliner",
    kota: "Bandar Lampung",
    noHp: "081298765432",
  },
  {
    id: 3,
    namaUsaha: "Batik Tulis Nusantara",
    pemilik: "Rudi Hartono",
    kategori: "fesyen",
    kota: "Pekalongan",
    noHp: "085612345678",
  },
];
let nextId = 4;

function getAll(kategori) {
  if (kategori) return businesses.filter((b) => b.kategori === kategori);
  return businesses;
}

function getById(id) {
  return businesses.find((b) => b.id === id);
}

function create({ namaUsaha, pemilik, kategori, kota, noHp }) {
  const baru = { id: nextId++, namaUsaha, pemilik, kategori, kota, noHp };
  businesses.push(baru);
  return baru;
}


function update(id, { namaUsaha, pemilik, kategori, kota, noHp }) {
  const index = businesses.findIndex((b) => b.id === id);
  if (index === -1) return null;

  businesses[index] = { id, namaUsaha, pemilik, kategori, kota, noHp };
  return businesses[index];
}


function remove(id) {
  const index = businesses.findIndex((b) => b.id === id);
  if (index === -1) return false;

  businesses.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };