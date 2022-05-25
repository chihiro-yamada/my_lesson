const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');

class CommentsController extends Controller {
  // POST /
  async store(req, res) {
    try {
      if (req.body.finished.length > 1) {
        const comment = await models.Task.finish(req.params.task, req.user, req.body);
        res.redirect(`/tasks/${comment.taskId}`);
      } else {
        const comment = await models.Task.createComment(req.params.task, req.user, req.body);
        res.redirect(`/tasks/${comment.taskId}`);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        const task = await models.Task.findByPk(req.params.task);
        const team = await task.getOwnerTeam();
        const comments = await task.getOwnComments({ include: 'CreateUser' });
        res.render('tasks/show', { team: team, task: task, comments: comments, err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = CommentsController;