'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('Teams', 'teamname', 'name');
  },

  async down() {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
