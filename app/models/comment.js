'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.User = this.belongsTo(models.User, {
        foreignKey: 'creatorId',
        as: 'CreateUser'
      });
      this.Task = this.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'OwnTask'
      });
    }
  }
  Comment.init({
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: DataTypes.TEXT,
    kind: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};