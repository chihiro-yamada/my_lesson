'use strict';

const models = require('../../app/models');

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'admin',
      displayName: 'Admin',
      email: 'admin@example.com',
      role: models.User.roles.admin,
      passwordHash: await models.User.generateHash('password'),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'user1',
      displayName: 'User1',
      email: 'user1@example.com',
      role: models.User.roles.normal,
      passwordHash: await models.User.generateHash('password'),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'user2',
      displayName: 'User2',
      email: 'user2@example.com',
      role: models.User.roles.normal,
      passwordHash: await models.User.generateHash('password'),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, _Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
