const Controller = require('../controller');
const models = require('../../models');
const { ValidationError } = require('sequelize');
const task = require('../../models/task');

class TasksController extends Controller {
  // GET /create
  async create(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const joinUsers = await team.getOwnMembers({ include: 'OwnerUser' });
    res.render('manager/tasks/create', { team: team, task: task, joinUsers: joinUsers });
  }

  // POST /
  async store(req, res) {
    try {
      const user = req.user;
      const task = models.Task.build({
        title: req.body.title,
        body: req.body.body,
        teamId: req.params.team,
        status: 0,
        creatorId: user.id,
        assigneeId: req.body.assigneeId,
      });
      
      await task.save({ fields: ['title', 'body', 'teamId', 'status', 'creatorId', 'assigneeId'] });
      await req.flash('info', `新規チーム${task.title}保存しました`);
      res.redirect(`/manager/teams/${task.teamId}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        const team = await models.Team.findByPk(req.params.team);
        const joinUsers = await team.getOwnMembers({ include: 'OwnerUser' });
        res.render('manager/tasks/create', { task: req.body, team: team, joinUsers: joinUsers, err });
      } else {
        throw err;
      }
    }
  }
  // GET /:id/edit
  async edit(req, res) {
    const team = await models.Team.findByPk(req.params.team);
    const task = await models.Task.findByPk(req.params.task);
    const joinUsers = await team.getOwnMembers({ include: 'OwnerUser' });
    res.render('manager/tasks/edit', { team: team, task: task, joinUsers: joinUsers });
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
        const team = await models.Team.findByPk(req.params.team);
        const joinUsers = await team.getOwnMembers({ include: 'OwnerUser' });
        res.render('manager/tasks/edit', { task: req.body, team: team, joinUsers: joinUsers, err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = TasksController;