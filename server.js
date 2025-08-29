'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const connectDB = require('./src/config/database');
require('dotenv').config();
const path = require('path');

// Import routes
const routes = require('./src/routes');

const init = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language', 'Origin', 'X-Requested-With'],
        exposedHeaders: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
        additionalExposedHeaders: ['X-Requested-With'],
        maxAge: 86400
      }
    }
  });

  // Register plugins
  await server.register(Inert);

  // Register routes plugin
  await server.register(routes);

  // Serve static files from uploads directory
  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'uploads'),
        listing: false,
        index: false
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
