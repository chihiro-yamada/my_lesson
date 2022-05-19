const Controller = require('../controller');
const models = require('../../models');
const { ValidationError } = require('sequelize');


class TeamsController extends Controller {
  // GET /:id
  async show(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const tasks = await team.getOwnTasks({ include: 'assignUser' });
    res.render('manager/teams/show', { team: team, tasks: tasks });
  }
  // GET /:id/edit
  async edit(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    res.render('manager/teams/edit', { team: team });
  }
  // PUT or PATCH /:id
  async update(req, res) {
    try {
      const team = await models.Team.findByPk(req.body.id); //---[1]
      team.set(req.body);
      await team.save({ fields: ['name'] });
      await req.flash('info', `チーム名を${team.name}に変更しました`);
      res.redirect(`/manager/teams/${team.id}/edit`);
    } catch(err) {
      if (err instanceof ValidationError) {
        res.render('manager/teams/edit', { team: req.body, err });
      } else {
        throw err;
      }
    }
  }  
}


module.exports = TeamsController;