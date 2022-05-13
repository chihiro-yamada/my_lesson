'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamname: {
        type: Sequelize.STRING
      },

      ownerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' } // これを指定することで、外部キー制約を行えます
      },
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Teams');
  }
};