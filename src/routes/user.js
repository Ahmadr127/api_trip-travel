'use strict';

const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const Joi = require('@hapi/joi');

const routes = [
  {
    method: 'GET',
    path: '/users/profile',
    options: {
      pre: [{ method: auth }]
    },
    handler: userController.getProfile
  },
  {
    method: 'PUT',
    path: '/users/profile',
    options: {
      pre: [{ method: auth }],
      validate: {
        payload: Joi.object({
          name: Joi.string().max(50),
          photo: Joi.string(),
          preferences: Joi.object().description('Preferensi pengguna seperti notifikasi, tema, dll')
        })
      }
    },
    handler: userController.updateProfile
  },
  {
    method: 'DELETE',
    path: '/users/delete',
    options: {
      pre: [{ method: auth }]
    },
    handler: userController.deleteUser
  }
];

module.exports = {
  plugin: {
    name: 'user-routes',
    version: '1.0.0',
    register: async (server, options) => {
      server.route(routes);
    }
  }
};
