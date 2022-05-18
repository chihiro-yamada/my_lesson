const Controller = require('../controller');
const models = require('../../models');
const { ValidationError } = require('sequelize');

class MembersController extends Controller {
  // GET /create
  async index(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const users = await models.User.findAll();
    const joinUsers = await team.getOwnMembers({ include: 'OwnerUser' });
    res.render('manager/members/index', { team: team, users: users, joinUsers: joinUsers });
  }

  // POST /
  async store(req, res) {
    try {
      const member = models.Member.build({
        teamId: req.params.team,
        userId: req.body.name
      });
      await member.save({ fields: ['teamId', 'userId'] });
      res.redirect(`/manager/teams/${member.teamId}/members`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('manager/members/index', { err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = MembersController;