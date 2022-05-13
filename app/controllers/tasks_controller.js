const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');
const task = require('../models/task');

class TasksController extends Controller {
  // GET /create
  async create(req, res) {
    const team = req.params.team;
    res.render('tasks/create', { team: team, task: task });
  }

  // POST /
  async store(req, res) {
    try {
      const task = models.Task.build({
        title: req.body.title,
        body: req.body.body,
        teamId: req.params.team,
        status: req.params.team,
      });
      await task.save({ fields: ['title', 'body', 'teamId', 'status'] });
      await req.flash('info', `新規チーム${task.title}保存しました`);
      res.redirect(`/teams/${task.teamId}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('tasks/create', { task: req.body, err });
      } else {
        throw err;
      }
    }
  }
  // GET /:id/edit
  async edit(req, res) {
    const team = req.params.team;
    const task = await models.Task.findByPk(req.params.task);
    res.render('tasks/edit', { team: team, task: task });
  }

  // PUT or PATCH /:id
  async update(req, res) {
    try {
      const task = await models.Task.findByPk(req.body.id); //---[1]
      task.set(req.body);
      await task.save({ fields: ['title', 'body'] });
      await req.flash('info', `${task.title}を変更しました`);
      res.redirect(`/teams/${task.teamId}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('tasks/edit', { task: req.body, err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = TasksController;