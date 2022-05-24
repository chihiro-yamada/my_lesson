'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Members', [{
      teamId: 1,
      userId: 2,
      role: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 1,
      userId: 3,
      role: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 2,
      userId: 2,
      role: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 2,
      userId: 3,
      role: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Members', null, {});
  }
};
