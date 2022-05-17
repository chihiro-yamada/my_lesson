'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Tasks',
      'creatorId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }, 
      }
    );   
    await queryInterface.addColumn(
      'Tasks',
      'assigneeId',
      {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      }
    );   
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'Tasks',
      'creatorId'
    );
    await queryInterface.removeColumn(
      'Tasks',
      'assigneeId'
    );
  }
};
