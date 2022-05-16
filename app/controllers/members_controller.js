const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');

class MembersController extends Controller {
  // GET /create
  async create(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const users = await models.User.findAll();
    const joinUsers = await team.getJoinUsers();
    res.render('members/create', { team: team, users: users, joinUsers: joinUsers });
  }

  // POST /
  async store(req, res) {
    try {
      const member = models.Member.build({
        teamId: req.params.team,
        userId: req.body.name
      });
      await member.save({ fields: ['teamId', 'userId'] });
      res.redirect(`/teams/${member.teamId}/members`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('members/create', { err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = MembersController;