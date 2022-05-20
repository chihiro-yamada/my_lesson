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
      const team = await this.create({
        name: body.name,
        ownerId: user.id
      });
      await team.createOwnMember({ teamId: team.id, userId: user.id, role: 1 });
      return team;
    }
    async isManager(user) {
      const member = await user.getUserMembers({ where: { teamId: this.id, role: 1 } });
      const check = Boolean(member.length);
      return check;
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