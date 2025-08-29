const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User harus diisi']
  },
  orderType: {
    type: String,
    enum: ['destination', 'hotel', 'event'],
    required: [true, 'Tipe order harus diisi']
  },
  items: [{
    itemType: {
      type: String,
      enum: ['destination', 'hotel', 'room', 'event'],
      required: [true, 'Tipe item harus diisi']
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.itemType',
      required: [true, 'ID item harus diisi']
    },
    quantity: {
      type: Number,
      required: [true, 'Jumlah item harus diisi'],
      default: 1
    },
    price: {
      type: Number,
      required: [true, 'Harga item harus diisi']
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total harga harus diisi']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['transfer', 'credit_card', 'e-wallet'],
    required: [true, 'Metode pembayaran harus diisi']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Tanggal booking harus diisi']
  },
  startDate: {
    type: Date,
    required: [true, 'Tanggal mulai harus diisi']
  },
  endDate: {
    type: Date,
    required: [true, 'Tanggal selesai harus diisi']
  },
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'completed', 'cancelled'],
    default: 'booked'
  },
  notes: {
    type: String
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

module.exports = mongoose.model('Order', OrderSchema);
