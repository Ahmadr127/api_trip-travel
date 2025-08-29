// Auth 
http://localhost:3000/auth/register
POST
{
  "name": "Mocha Shaa",
  "email": "chasouluix.testing@gmail.com",
  "password": "password123"
}

http://localhost:3000/auth/verify-email
POST
{
  "email": "chasouluix.testing@gmail.com",
  "code": "123456"
}

http://localhost:3000/auth/resend-verification
POST
{
  "email": "chasouluix.testing@gmail.com"
}

http://localhost:3000/auth/login
POST
{
  "email": "chasouluix.testing@gmail.com",
  "password": "password123"
}

http://localhost:3000/auth/forgot-password
POST
{
  "email": "chasouluix.testing@gmail.com"
}

http://localhost:3000/auth/reset-password
POST
{
  "email": "chasouluix.testing@gmail.com",
  "code": "123456",
  "password": "newpassword123"
}

http://localhost:3000/users/delete
DELETE




// User
http://localhost:3000/users/profile
GET

http://localhost:3000/users/delete
DELETE

http://localhost:3000/users/update
PUT

http://localhost:3000/destinasi
GET

http://localhost:3000/destinasi/{id}
GET

http://localhost:3000/hotels
GET

http://localhost:3000/hotel/{id}
GET

http://localhost:3000/admin/hotel/{hotelId}/rooms
GET

http://localhost:3000/order/user
GET

http://localhost:3000/order/hotel
POST
{
  "hotelId": "68053757d33cdb7d2f130f7d",
  "roomId": "68053772d33cdb7d2f130f82",
  "startDate": "2025-05-03", 
  "endDate": "2025-05-04",
  "quantity": 1,
  "paymentMethod": "credit_card", 
  "notes": "catatan optional"
} 


http://localhost:3000/order/wisata
POST
{
  "destinationId": "680522195b8d9cdcb983a004",
  "visitDate": "2025-05-01T00:00:00.000Z",
  "quantity": 1,
  "paymentMethod": "transfer",
  "notes": "Test booking wisata"
}

http://localhost:3000/order/review
POST
{
  "orderId": "68052889d4086cf0ba2469c0",
  "itemId": "680522195b8d9cdcb983a004",
  "itemType": "hotel",
  "rating": 5,
  "comment": "Pengalaman yang luar biasa! Pelayanan sangat memuaskan dan fasilitas lengkap.",
  "photos": []
}

http://localhost:3000/reviews/{itemType}/{itemId}
GET

http://localhost:3000/order/{id}
GET

http://localhost:3000/payment/midtrans-notify
POST
{
  "transaction_status": "settlement",
  "order_id": "681592d39225795581b64d26",
  "gross_amount": "750000.00"
}

link simulator paymentnya
https://simulator.sandbox.midtrans.com/


ML implementation
GET
http://localhost:3000/recommendation/weather?days=7

http://localhost:3000/recommendation/destination?query=wisata%20untuk%20cuaca%20dingin&preferensi=wisata&top_n=20

http://localhost:3000/recommendation/destination?query=wisata%20untuk%20cuaca%20panas&preferensi=wisata&top_n=20

http://localhost:3000/recommendation/hotel?review=bagus%20dan%20nyaman



// Admin
http://localhost:3000/admin/destinasi
POST
{
  "name": "Pantai Kuta",
  "detail": "Pantai Kuta adalah salah satu pantai terkenal di Bali yang menawarkan pemandangan sunset yang indah",
  "price": 50000,
  "benefits": "Pemandangan sunset yang indah, Akses mudah, Area parkir luas",
  "restrictions": "Dilarang berenang saat ombak tinggi, Dilarang membuang sampah sembarangan",
  "location": {
    "address": "Jl. Pantai Kuta, Kuta",
    "city": "Badung",
    "province": "Bali",
    "coordinates": [115.1686, -8.718500000000001]
  }
}

http://localhost:3000/admin/destinasi/{id}
PUT
{
  "name": "Pantai Kuta 2",
  "detail": "Pantai Kuta adalah salah satu pantai terkenal di Bali yang menawarkan pemandangan sunset yang indah",
  "price": 50000,
  "benefits": "Pemandangan sunset yang indah, Akses mudah, Area parkir luas",
  "restrictions": "Dilarang berenang saat ombak tinggi, Dilarang membuang sampah sembarangan",
  "location": {
    "address": "Jl. Pantai Kuta, Kuta",
    "city": "Badung",
    "province": "Bali",
    "coordinates": [115.1686, -8.718500000000001]
  }
}

http://localhost:3000/admin/destinasi/{id}
DELETE

http://localhost:3000/admin/hotel
POST
{
  "name": "Hotel Santara Bali",
  "detail": "Hotel Santara Bali adalah hotel bintang 5 yang menawarkan pemandangan laut yang indah dan fasilitas mewah",
  "price": 1500000,
  "location": {
    "address": "Jl. Pantai Kuta No. 88, Kuta",
    "city": "Badung",
    "province": "Bali",
    "coordinates": [115.1686, -8.7185]
  }
}

http://localhost:3000/admin/hotel/{id}
PUT
{
  "name": "Hotel Santara Bali 2",
  "detail": "Hotel Santara Bali adalah hotel bintang 5 yang menawarkan pemandangan laut yang indah dan fasilitas mewah",
  "price": 1500000,
  "location": {
    "address": "Jl. Pantai Kuta No. 88, Kuta",
    "city": "Badung",
    "province": "Bali",
    "coordinates": [115.1686, -8.7185]
  }
}

http://localhost:3000/admin/hotel/{id}
DELETE

http://localhost:3000/admin/hotel/kamar
POST
{
  "hotel": "680522195b8d9cdcb983a004",
  "type": "Deluxe Room",
  "price": 750000,
  "facilities": "AC, TV, Mini Bar, Free WiFi, Breakfast",
  "restrictions": "No Smoking, No Pets",
  "capacity": 2
}

http://localhost:3000/admin/hotel/kamar/{id}
PUT
{
  "hotel": "680522195b8d9cdcb983a004",
  "type": "Deluxe Room",
  "price": 750000,
  "facilities": "AC, TV, Mini Bar, Free WiFi, Breakfast",
  "restrictions": "No Smoking, No Pets",
  "capacity": 2
}

http://localhost:3000/admin/hotel/kamar/{id}
DELETE

http://localhost:3000/admin/event
POST
{
  "name": "Festival Budaya Bali",
  "detail": "Festival tahunan yang menampilkan berbagai pertunjukan seni dan budaya Bali",
  "price": 250000,
  "startDate": "2025-05-15T10:00:00.000Z",
  "endDate": "2025-05-17T22:00:00.000Z",
  "location": {
    "address": "Lapangan Puputan Badung",
    "city": "Denpasar",
    "province": "Bali",
    "coordinates": [115.2196, -8.6573]
  },
  "capacity": 1000
}

http://localhost:3000/admin/event/{id}
PUT
{
  "name": "Festival Budaya Bali 2",
  "detail": "Festival tahunan yang menampilkan berbagai pertunjukan seni dan budaya Bali",
  "price": 250000,
  "startDate": "2025-05-15T10:00:00.000Z",
  "endDate": "2025-05-17T22:00:00.000Z",
  "location": {
    "address": "Lapangan Puputan Badung",
    "city": "Denpasar",
    "province": "Bali",
    "coordinates": [115.2196, -8.6573]
  },
  "capacity": 1000
}

http://localhost:3000/admin/event/{id}
DELETE

http://localhost:3000/admin/users
GET

http://localhost:3000/admin/orders
GET

http://localhost:3000/admin/orders/excel
GET

http://localhost:3000/admin/users/{id}
DELETE

http://localhost:3000/lang
GET
# api_trip-travel
