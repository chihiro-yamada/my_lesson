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
      this.Tasks = this.hasMany(models.Task, {
        foreignKey: 'teamId',
        as: 'OwnTasks'
      });
      this.Members = this.hasMany(models.Member, {
        foreignKey: 'teamId',
        as: 'OwnMembers'
      });
    }
    static async createWithOwner(user, body) {
      const team = this.build({
        name: body.name,
        ownerId: user.id
      });
      await team.save({ fields: ['name', 'ownerId'] });
      await team.createMember({ teamId: team.id, userId: user.id, role: 1 });
      return team;
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
    ownerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};