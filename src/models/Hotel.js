const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama hotel harus diisi'],
    trim: true
  },
  detail: {
    type: String,
    required: [true, 'Detail hotel harus diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga dasar hotel harus diisi']
  },
  images: [{
    type: String,
    default: 'default-hotel.jpg'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: {
      type: String,
      required: [true, 'Alamat hotel harus diisi']
    },
    city: {
      type: String,
      required: [true, 'Kota hotel harus diisi']
    },
    province: {
      type: String,
      required: [true, 'Provinsi hotel harus diisi']
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hotel', HotelSchema);
