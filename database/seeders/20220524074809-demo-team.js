'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Teams', [{
      name: 'チームA',
      ownerId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'チームB',
      ownerId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Teams', null, {});
  }
};
