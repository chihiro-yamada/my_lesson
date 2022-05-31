'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Comments', [{
      taskId: 1,
      creatorId: 2,
      message: 'このタスクをお願いします！',
      kind: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      taskId: 1,
      creatorId: 3,
      message: '完了しました！',
      kind: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      taskId: 2,
      creatorId: 2,
      message: '仕様はどこにありますか？',
      kind: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      taskId: 2,
      creatorId: 3,
      message: 'Slackに送りました。',
      kind: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      taskId: 2,
      creatorId: 2,
      message: 'ありがとうございます！',
      kind: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Comments', null, {});
  }
};
