'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Tasks', [{
      teamId: 1,
      creatorId: 2,
      assigneeId: 3,
      title: 'タスク1',
      body: 'チームAのタスク',
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 1,
      creatorId: 2,
      assigneeId: 3,
      title: 'タスク2',
      body: 'チームAのタスク',
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 2,
      creatorId: 3,
      assigneeId: 2,
      title: 'タスク3',
      body: 'チームBのタスク',
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      teamId: 2,
      creatorId: 3,
      assigneeId: 2,
      title: 'タスク4',
      body: 'チームBのタスク',
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Tasks', null, {});
  }
};
