const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama event harus diisi'],
    trim: true
  },
  detail: {
    type: String,
    required: [true, 'Detail event harus diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga event harus diisi']
  },
  startDate: {
    type: Date,
    required: [true, 'Waktu mulai event harus diisi']
  },
  endDate: {
    type: Date,
    required: [true, 'Waktu selesai event harus diisi']
  },
  images: [{
    type: String,
    default: 'default-event.jpg'
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
      required: [true, 'Alamat event harus diisi']
    },
    city: {
      type: String,
      required: [true, 'Kota event harus diisi']
    },
    province: {
      type: String,
      required: [true, 'Provinsi event harus diisi']
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Kapasitas event harus diisi']
  },
  availableSeats: {
    type: Number
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

// Set availableSeats sama dengan capacity saat pertama kali dibuat
EventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.capacity;
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
