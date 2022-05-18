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
      res.redirect(`/teams/${team.id}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('teams/create', { team: req.body, err });
      } else {
        throw err;
      }
    }
  }
  // GET /:id
  async show(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const tasks = await team.getOwnTasks({ include: 'assignUser' });
    res.render('teams/show', { team: team, tasks: tasks });
  }
  // GET /:id/edit
  async edit(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    res.render('teams/edit', { team: team });
  }
  // PUT or PATCH /:id
  async update(req, res) {
    try {
      const team = await models.Team.findByPk(req.body.id); //---[1]
      team.set(req.body);
      await team.save({ fields: ['name'] });
      await req.flash('info', `チーム名を${team.name}に変更しました`);
      res.redirect(`/teams/${team.id}/edit`);
    } catch(err) {
      if (err instanceof ValidationError) {
        res.render('teams/edit', { team: req.body, err });
      } else {
        throw err;
      }
    }
  }  
}


module.exports = TeamsController;