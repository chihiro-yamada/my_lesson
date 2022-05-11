'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      this.User = this.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'Owner'
      });
    }
  }
  Team.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [0, 20],
      }
    },
    ownerId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};