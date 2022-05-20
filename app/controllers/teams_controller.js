const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');
const team = require('../models/team');

class TeamsController extends Controller {
  // GET /create
  async create(req, res) {
    res.render('teams/create', { team });
  }
  // POST /
  async store(req, res) {
    try {
      const user = req.user;
      const team = models.Team.build({
        name: req.body.name,
        ownerId: user.id
      });
      await team.save({ fields: ['name', 'ownerId'] });
      const member = models.Member.build({
        teamId: team.id, 
        userId: user.id,
        role: 1
      });
      await member.save({ fields: ['teamId', 'userId', 'role'] });
      await req.flash('info', `新規チーム${team.name}保存しました`);
      res.redirect(`/manager/teams/${team.id}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('teams/create', { team: req.body, err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = TeamsController;