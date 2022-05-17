const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');
const task = require('../models/task');

class TasksController extends Controller {
  // GET /create
  async create(req, res) {
    const teamId = req.params.team;
    const team = await models.Team.findByPk(teamId);
    const joinUsers = await team.getJoinUsers();
    res.render('tasks/create', { teamId: teamId, task: task, joinUsers: joinUsers });
  }

  // POST /
  async store(req, res) {
    try {
      const user = req.user;
      const task = models.Task.build({
        title: req.body.title,
        body: req.body.body,
        teamId: req.params.team,
        status: req.params.team,
        creatorId: user.id,
        assigneeId: req.body.assigneeId,
      });
      
      await task.save({ fields: ['title', 'body', 'teamId', 'status', 'creatorId', 'assigneeId'] });
      await req.flash('info', `新規チーム${task.title}保存しました`);
      res.redirect(`/manager/teams/${task.teamId}`);
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
    const teamId = req.params.team;
    const team = await models.Team.findByPk(teamId);
    const task = await models.Task.findByPk(req.params.task);
    const joinUsers = await team.getJoinUsers();
    res.render('tasks/edit', { teamId: teamId, task: task, joinUsers: joinUsers });
  }

  // PUT or PATCH /:id
  async update(req, res) {
    try {
      const task = await models.Task.findByPk(req.body.id); //---[1]
      task.set(req.body);
      await task.save({ fields: ['title', 'body', 'assigneeId'] });
      await req.flash('info', `${task.title}を変更しました`);
      res.redirect(`/manager/teams/${task.teamId}`);
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