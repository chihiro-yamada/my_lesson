const Controller = require('./controller');
const models = require('../models');
const { ValidationError } = require('sequelize');

class TasksController extends Controller {
  // POST /
  async store(req, res) {
    try {
      if (req.body.finished.length > 1) {
        req.body.finished = req.body.finished[1];
      }
      const comment = models.Comment.build({
        taskId: req.params.task,
        creatorId: req.user.id,
        message: req.body.message,
        kind: req.body.finished
      });
      await comment.save({ fields: ['taskId', 'creatorId', 'message', 'kind'] });
      if (comment.kind == 1) {
        const task = await models.Task.findByPk(req.params.task);
        task.set({ status: 1 });
        await task.save({ fields: ['status'] });
      }
      res.redirect(`/tasks/${comment.taskId}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('tasks/show', { team: req.body, err });
      } else {
        throw err;
      }
    }
  }
}

module.exports = TasksController;