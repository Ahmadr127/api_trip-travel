const Boom = require('@hapi/boom');
const Order = require('../models/Order');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { snap } = require('../config/midtrans');
const { cloudinary } = require('../config/cloudinary');

// @desc    Booking hotel
// @route   POST /order/hotel
// @access  Private
exports.bookHotel = async (request, h) => {
  try {
    const { hotelId, roomId, startDate, endDate, quantity, paymentMethod, notes } = request.payload;
    const user = request.auth.credentials;

    // Cek apakah hotel ada
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return Boom.notFound('Hotel tidak ditemukan');
    }

    // Cek apakah room ada
    const room = await Room.findById(roomId);
    if (!room) {
      return Boom.notFound('Tipe kamar tidak ditemukan');
    }

    // Cek apakah room tersedia
    if (!room.available) {
      return Boom.badRequest('Kamar tidak tersedia');
    }

    // Hitung total harga
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return Boom.badRequest('Tanggal check-in harus sebelum tanggal check-out');
    }

    const totalPrice = room.price * quantity * days;

    // Buat order baru
    const order = await Order.create({
      user: user.id,
      orderType: 'hotel',
      items: [{
        itemType: 'room',
        itemId: roomId,
        quantity,
        price: room.price
      }],
      totalPrice,
      paymentStatus: 'pending',
      paymentMethod,
      bookingDate: new Date(),
      startDate: start,
      endDate: end,
      notes
    });

    // Generate nomor invoice
    const invoiceNumber = `INV-${order._id.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;

    // Kirim email konfirmasi
    const emailMessage = `
      <h1>Konfirmasi Booking Hotel</h1>
      <p>Terima kasih telah melakukan booking di SantaraTrip!</p>
      <p>Berikut detail booking Anda:</p>
      <ul>
        <li>Invoice: ${invoiceNumber}</li>
        <li>Hotel: ${hotel.name}</li>
        <li>Tipe Kamar: ${room.type}</li>
        <li>Check-in: ${new Date(startDate).toLocaleDateString('id-ID')}</li>
        <li>Check-out: ${new Date(endDate).toLocaleDateString('id-ID')}</li>
        <li>Jumlah Kamar: ${quantity}</li>
        <li>Total Harga: Rp ${totalPrice.toLocaleString('id-ID')}</li>
      </ul>
      <p>Silakan lakukan pembayaran sesuai metode yang dipilih.</p>
      <p>Terima kasih!</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SantaraTrip - Konfirmasi Booking Hotel',
        message: emailMessage
      });
    } catch (err) {
      console.error('Error sending email:', err);
      // Tidak menghentikan proses jika email gagal terkirim
    }

    // Generate payment token
    try {
      const paymentToken = await generatePaymentToken(order, user, hotel.name + ' - ' + room.type, invoiceNumber);
      return {
        success: true,
        data: order,
        invoiceNumber,
        paymentToken
      };
    } catch (error) {
      console.error('Error generating payment token:', error);
      return {
        success: true,
        data: order,
        invoiceNumber,
        error: 'Gagal membuat token pembayaran'
      };
    }
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Booking wisata
// @route   POST /order/wisata
// @access  Private
exports.bookWisata = async (request, h) => {
  try {
    const { destinationId, visitDate, quantity, paymentMethod, notes } = request.payload;
    const user = request.auth.credentials;

    // Cek apakah destinasi ada
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return Boom.notFound('Destinasi tidak ditemukan');
    }

    // Hitung total harga
    const totalPrice = destination.price * quantity;

    // Buat order baru
    const order = await Order.create({
      user: user.id,
      orderType: 'destination',
      items: [{
        itemType: 'destination',
        itemId: destinationId,
        quantity,
        price: destination.price
      }],
      totalPrice,
      paymentStatus: 'pending',
      paymentMethod,
      bookingDate: new Date(),
      startDate: new Date(visitDate),
      endDate: new Date(visitDate),
      notes
    });

    // Generate nomor invoice
    const invoiceNumber = `INV-${order._id.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;

    // Kirim email konfirmasi
    const emailMessage = `
      <h1>Konfirmasi Booking Wisata</h1>
      <p>Terima kasih telah melakukan booking di SantaraTrip!</p>
      <p>Berikut detail booking Anda:</p>
      <ul>
        <li>Invoice: ${invoiceNumber}</li>
        <li>Destinasi: ${destination.name}</li>
        <li>Tanggal Kunjungan: ${new Date(visitDate).toLocaleDateString('id-ID')}</li>
        <li>Jumlah Tiket: ${quantity}</li>
        <li>Total Harga: Rp ${totalPrice.toLocaleString('id-ID')}</li>
      </ul>
      <p>Silakan lakukan pembayaran sesuai metode yang dipilih.</p>
      <p>Terima kasih!</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SantaraTrip - Konfirmasi Booking Wisata',
        message: emailMessage
      });
    } catch (err) {
      console.error('Error sending email:', err);
      // Tidak menghentikan proses jika email gagal terkirim
    }

    // Generate payment token
    try {
      const paymentToken = await generatePaymentToken(order, user, destination.name, invoiceNumber);
      return {
        success: true,
        data: order,
        invoiceNumber,
        paymentToken
      };
    } catch (error) {
      console.error('Error generating payment token:', error);
      return {
        success: true,
        data: order,
        invoiceNumber,
        error: 'Gagal membuat token pembayaran'
      };
    }
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Lihat semua order milik user
// @route   GET /order/user
// @access  Private
exports.getUserOrders = async (request, h) => {
  try {
    const user = request.auth.credentials;

    // Get orders and format them
    const orders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 });

    // Format the orders
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // For destination orders, combine start/end date into visitDate
      if (orderObj.orderType === 'destination') {
        orderObj.visitDate = orderObj.startDate;
        delete orderObj.startDate;
        delete orderObj.endDate;
      }
      
      return orderObj;
    });

    return {
      success: true,
      count: orders.length,
      data: formattedOrders
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Detail order
// @route   GET /order/{id}
// @access  Private
exports.getOrderDetail = async (request, h) => {
  try {
    const user = request.auth.credentials;
    const { id } = request.params;

    const order = await Order.findById(id);

    if (!order) {
      return Boom.notFound('Order tidak ditemukan');
    }

    // Cek apakah order milik user yang sedang login
    if (order.user.toString() !== user.id && user.role !== 'admin') {
      return Boom.forbidden('Tidak diizinkan mengakses order ini');
    }

    // Format the order
    const orderObj = order.toObject();
    
    // For destination orders, combine start/end date into visitDate
    if (orderObj.orderType === 'destination') {
      orderObj.visitDate = orderObj.startDate;
      delete orderObj.startDate;
      delete orderObj.endDate;
    }

    return {
      success: true,
      data: orderObj
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Kirim review hotel/wisata
// @route   POST /order/review
// @access  Private
exports.submitReview = async (request, h) => {
  try {
    const user = request.auth.credentials;
    const { orderId, itemId, itemType, rating, comment } = request.payload;

    // Cek apakah order ada
    const order = await Order.findById(orderId);
    if (!order) {
      return Boom.notFound('Order tidak ditemukan');
    }

    // Cek apakah item yang direview ada dalam order
    const orderItem = order.items.find(item => 
      item.itemId.toString() === itemId || 
      (item.itemType === 'room' && itemType === 'hotel')
    );

    if (!orderItem) {
      return Boom.badRequest('Item tidak ditemukan dalam order');
    }

    // Cek apakah sudah pernah review sebelumnya
    const existingReview = await Review.findOne({
      user: user.id,
      order: orderId,
      itemId
    });

    if (existingReview) {
      return Boom.badRequest('Anda sudah memberikan review untuk item ini');
    }

    // Upload foto jika ada
    let uploadedPhotos = [];
    if (request.payload.photos) {
      const photos = Array.isArray(request.payload.photos) 
        ? request.payload.photos 
        : [request.payload.photos];

      for (const photo of photos) {
        try {
          // Upload ke Cloudinary
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'santaratrip/reviews',
                transformation: [{ width: 1200, height: 800, crop: 'limit' }]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            
            photo.pipe(stream);
          });
          
          uploadedPhotos.push(result.secure_url);
        } catch (error) {
          console.error('Error uploading review photo:', error);
          // Lanjutkan dengan foto lainnya jika ada error
        }
      }
    }

    // Buat review baru
    const review = await Review.create({
      user: user.id,
      order: orderId,
      itemType,
      itemId,
      rating,
      comment,
      photos: uploadedPhotos
    });

    return {
      success: true,
      data: review
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Kirim ulang tiket via email
// @route   GET /ticket/email
// @access  Private
exports.resendTicket = async (request, h) => {
  try {
    const user = request.auth.credentials;
    const { orderId } = request.query;

    // Cek apakah order ada
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.itemId',
        select: 'name type'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!order) {
      return Boom.notFound('Order tidak ditemukan');
    }

    // Cek apakah order milik user yang sedang login
    if (order.user._id.toString() !== user.id && user.role !== 'admin') {
      return Boom.forbidden('Tidak diizinkan mengakses order ini');
    }

    // Cek apakah pembayaran sudah selesai
    if (order.paymentStatus !== 'paid') {
      return Boom.badRequest('Tiket hanya tersedia untuk order yang sudah dibayar');
    }

    // Kirim email tiket
    await sendTicketEmail(order);

    return {
      success: true,
      message: 'Tiket berhasil dikirim ke email Anda'
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Endpoint callback pembayaran berhasil
// @route   POST /payment/midtrans-notify
// @access  Public
exports.paymentNotification = async (request, h) => {
  try {
    console.log('Payment notification payload:', request.payload);
    
    // Ambil data dari payload
    const payload = request.payload;
    const orderId = payload.order_id;
    const transactionStatus = payload.transaction_status;
    const paymentType = payload.payment_type;
    
    console.log(`Processing payment: orderId=${orderId}, status=${transactionStatus}, type=${paymentType}`);
    
    // Cari order berdasarkan ID
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order tidak ditemukan: ${orderId}`);
      return h.response({
        statusCode: 404,
        error: 'Not Found',
        message: 'Order tidak ditemukan'
      }).code(404);
    }
    
    console.log(`Order ditemukan: ${order._id}`);
    
    // Update status pembayaran
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      order.paymentStatus = 'cancelled';
      order.status = 'cancelled';
    } else if (transactionStatus === 'pending') {
      order.paymentStatus = 'pending';
    }
    
    if (paymentType) {
      order.paymentMethod = paymentType;
    }
    
    // Simpan perubahan
    await order.save();
    console.log(`Order berhasil diupdate: status=${order.status}, paymentStatus=${order.paymentStatus}`);
    
    // Kirim email tiket jika pembayaran berhasil
    if (order.paymentStatus === 'paid') {
      try {
        // Populate user data dan item details untuk email
        await order.populate([
          { path: 'user' },
          { 
            path: 'items.itemId',
            model: order.orderType === 'hotel' ? 'Room' : 'Destination'
          }
        ]);
        
        await sendTicketEmail(order);
        console.log('Email tiket berhasil dikirim');
      } catch (error) {
        console.error('Gagal mengirim email tiket:', error.message);
      }
    }
    
    return h.response({
      success: true,
      message: 'Status pembayaran berhasil diperbarui',
      data: {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    }).code(200);
  } catch (error) {
    console.error('Error pada payment notification:', error);
    return h.response({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan pada server'
    }).code(500);
  }
};

// Fungsi untuk generate token pembayaran Midtrans
async function generatePaymentToken(order, user, itemName, invoiceNumber) {
  try {
    console.log('Generating Midtrans payment token for order:', order._id.toString());
    console.log('Midtrans Config:', { 
      serverKey: process.env.MIDTRANS_SERVER_KEY ? 'Set' : 'Not Set',
      clientKey: process.env.MIDTRANS_CLIENT_KEY ? 'Set' : 'Not Set',
      isProduction: process.env.MIDTRANS_IS_PRODUCTION
    });
    
    // Hitung total dari item_details untuk memastikan sesuai dengan gross_amount
    const itemDetails = order.items.map(item => ({
      id: item.itemId.toString(),
      price: parseInt(item.price),
      quantity: parseInt(item.quantity),
      name: itemName || `${order.orderType === 'hotel' ? 'Hotel' : 'Wisata'} Booking`
    }));
    
    // Hitung total harga dari item_details
    const calculatedGrossAmount = itemDetails.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    console.log('Calculated gross amount:', calculatedGrossAmount);
    console.log('Order total price:', parseInt(order.totalPrice));
    
    // Siapkan parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: order._id.toString(),
        gross_amount: calculatedGrossAmount
      },
      item_details: itemDetails,
      customer_details: {
        first_name: user.name ? user.name.split(' ')[0] : 'Customer',
        last_name: user.name ? (user.name.split(' ').slice(1).join(' ') || '') : '',
        email: user.email || 'customer@example.com',
        phone: user.phone || '08123456789'
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        error: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/pending`
      },
      expiry: {
        unit: 'day',
        duration: 1
      }
    };

    console.log('Midtrans parameters:', JSON.stringify(parameter, null, 2));

    // Buat token pembayaran
    const transaction = await snap.createTransaction(parameter);
    console.log('Midtrans transaction response:', transaction);
    return transaction.token;
  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    console.error('Error details:', error.message, error.stack);
    throw error;
  }
}

// @desc    Get reviews for hotel/destination
// @route   GET /reviews/:itemType/:itemId
// @access  Public
exports.getReviews = async (request, h) => {
  try {
    const { itemType, itemId } = request.params;

    // Validate item type
    if (!['hotel', 'destination'].includes(itemType)) {
      return Boom.badRequest('Invalid item type');
    }

    // Find reviews
    const reviews = await Review.find({
      itemType,
      itemId
    }).populate('user', 'name');

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      success: true,
      data: {
        reviews,
        averageRating,
        totalReviews: reviews.length
      }
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// Fungsi helper untuk mengirim email tiket
async function sendTicketEmail(order) {
  try {
    // Generate nomor tiket
    const ticketNumber = `TIX-${order._id.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;
    
    // Dapatkan detail item yang dipesan
    let itemName = '';
    let itemType = '';
    
    if (order.items[0].itemId.name) {
      itemName = order.items[0].itemId.name;
      itemType = order.items[0].itemId.type || order.orderType;
    }

    // Buat pesan email
    const emailMessage = `
      <h1>E-Tiket SantaraTrip</h1>
      <p>Terima kasih telah melakukan pemesanan di SantaraTrip!</p>
      <p>Berikut adalah e-tiket Anda:</p>
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
        <h2>Tiket #${ticketNumber}</h2>
        <p><strong>Nama:</strong> ${order.user.name}</p>
        <p><strong>Email:</strong> ${order.user.email}</p>
        <p><strong>Jenis Pesanan:</strong> ${order.orderType === 'hotel' ? 'Hotel' : order.orderType === 'destination' ? 'Wisata' : 'Event'}</p>
        <p><strong>${order.orderType === 'hotel' ? 'Hotel' : order.orderType === 'destination' ? 'Destinasi' : 'Event'}:</strong> ${itemName}</p>
        ${order.orderType === 'hotel' ? `<p><strong>Tipe Kamar:</strong> ${itemType}</p>` : ''}
        <p><strong>Tanggal:</strong> ${new Date(order.startDate).toLocaleDateString('id-ID')} - ${new Date(order.endDate).toLocaleDateString('id-ID')}</p>
        <p><strong>Jumlah:</strong> ${order.items[0].quantity}</p>
        <p><strong>Total Harga:</strong> Rp ${order.totalPrice.toLocaleString('id-ID')}</p>
        <p><strong>Status Pembayaran:</strong> ${order.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}</p>
      </div>
      <p>Silakan tunjukkan e-tiket ini saat check-in.</p>
      <p>Terima kasih telah menggunakan layanan SantaraTrip!</p>
    `;

    // Kirim email
    await sendEmail({
      email: order.user.email,
      subject: 'SantaraTrip - E-Tiket Anda',
      message: emailMessage
    });

    return true;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    return false;
  }
}
