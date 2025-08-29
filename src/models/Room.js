const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel harus diisi']
  },
  type: {
    type: String,
    required: [true, 'Tipe kamar harus diisi'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Harga kamar harus diisi']
  },
  facilities: [{
    type: String,
    trim: true
  }],
  restrictions: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    required: [true, 'Kapasitas kamar harus diisi'],
    default: 2
  },
  images: [{
    type: String,
    default: 'default-room.jpg'
  }],
  available: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Room', RoomSchema);
