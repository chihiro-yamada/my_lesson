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
      const team = await models.Team.createWithOwner(req.user, req.body);
      await req.flash('info', `新規チーム${team.name}保存しました`);
      res.redirect(`/`);
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