const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama destinasi harus diisi'],
    trim: true
  },
  kategori: {
    type: String,
    required: [true, 'Kategori harus diisi'],
    enum: ['alam', 'budaya', 'religi', 'kuliner', 'hiburan']
  },
  harga: {
    type: Number,
    required: [true, 'Harga harus diisi']
  },
  hariOperasional: [{
    type: String,
    enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  }],
  alamat: {
    type: String,
    required: [true, 'Alamat harus diisi']
  },
  kodePos: {
    type: String
  },
  deskripsi: {
    type: String,
    required: [true, 'Deskripsi harus diisi']
  },
  fasilitas: [{
    type: String
  }],
  gambar: [{
    type: String
  }],
  jamBuka: {
    type: String
  },
  jamTutup: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);
