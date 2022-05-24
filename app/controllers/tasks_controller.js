const Controller = require('./controller');
const models = require('../models');

class TaskController extends Controller {
  // GET /create
  async show(req, res) {
    const task = await models.Task.findByPk(req.params.task);
    const team = await task.getOwnerTeam();
    const comments = await task.getOwnComments({ include: 'CreateUser' });
    res.render('tasks/show', { task: task, team: team, comments: comments });
  }
}

module.exports = TaskController;