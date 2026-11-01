# SI5C Kuis 1 - Data Usaha

## Menjalankan aplikasi

1. Salin `.env.example` menjadi `.env`, lalu isi `MONGODB_URI` dengan URI MongoDB dan `API_KEY` dengan kunci API. `DB_URI` tetap diterima sebagai nama variabel lama.
2. Jalankan `npm install`.
3. Jalankan `npm start` atau `npm run dev`.

Server hanya mulai menerima request setelah berhasil terhubung ke MongoDB.

Untuk mengisi database dengan 3 pemilik dan 25 usaha contoh, jalankan `npm run seed`. Seed menghapus data lama hanya dari collection `businesses` dan `owners` sebelum mengisi ulang; pastikan URI menunjuk ke database pengembangan yang benar.

## Relasi data

Dokumen `Business` menyimpan `lokasi` sebagai embedded schema tanpa `_id`. Setiap usaha memiliki referensi `pemilikId` ke schema `Owner` (`ref: "Owner"`). Saat membaca usaha, `populate()` mengisi data pemilik dan respons menyediakan `pemilikId`, nama `pemilik`, serta `noHp`.

### Pemilik usaha

`GET /owners` menampilkan collection pemilik. `POST /owners` membuat pemilik baru (wajib `x-api-key`):

```json
{
  "nama": "Sari Wulandari",
  "noHp": "082233445566"
}
```

Setelah itu, tautkan pemilik yang sama ke satu atau beberapa usaha dengan mengirim `pemilikId` pada `POST /businesses`. Untuk kompatibilitas dengan payload sebelumnya, mengirim `pemilik` dan `noHp` langsung saat membuat usaha juga tetap didukung; aplikasi akan membuat dokumen Owner terkait secara otomatis.

Contoh payload usaha yang memakai dokumen pemilik yang sudah dibuat:

```json
{
  "namaUsaha": "Anyaman Bambu Sari",
  "pemilikId": "ID_dari_respons_POST_owners",
  "kategori": "kerajinan",
  "kota": "Tasikmalaya"
}
```

Payload untuk membuat atau mengubah usaha:

```json
{
  "namaUsaha": "Anyaman Bambu Sari",
  "pemilik": "Sari Wulandari",
  "kategori": "kerajinan",
  "kota": "Tasikmalaya",
  "noHp": "082233445566"
}
```

## Endpoint daftar usaha

`GET /businesses` mendukung parameter:

| Parameter | Keterangan |
| --- | --- |
| `kategori`, `kota`, `pemilik` | Filter nilai yang cocok persis. |
| `page` | Nomor halaman, mulai dari 1 (default `1`). |
| `limit` | Jumlah data per halaman, 1-100 (default `10`). |
| `sortBy` | `namaUsaha`, `kategori`, `kota`, `createdAt`, atau `updatedAt` (default `namaUsaha`). |
| `sortOrder` | `asc` atau `desc` (default `asc`). |
| `projection` | Daftar field dipisahkan koma: `id`, `namaUsaha`, `pemilik`, `kategori`, `kota`, `noHp`. |

Contoh:

```text
GET /businesses?kategori=kerajinan&kota=Tasikmalaya&page=1&limit=5&sortBy=namaUsaha&sortOrder=asc&projection=namaUsaha,pemilik,kota
```

Respons daftar berisi `data` dan metadata `pagination` (`page`, `limit`, `total`, dan `totalPages`). Endpoint `POST`, `PUT`, dan `DELETE` memerlukan header `x-api-key`.
