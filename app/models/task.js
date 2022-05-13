'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      this.Team = this.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'OwnerTeam'
      });
    }
  }
  Task.init({
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [0, 20],
      },
    },
    body: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [0, 20],
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};