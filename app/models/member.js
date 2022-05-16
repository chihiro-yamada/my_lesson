'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      this.User = this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'OwnerUser'
      });
      this.Team = this.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'OwnerTeam'
      });
    }
  }
  Member.init({
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};