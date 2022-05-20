const Controller = require('./controller');

class TopController extends Controller {
  // GET /create
  async index(req, res) {
    if (req.user) {
      const user = req.user;
      const tasks = await user.getOwnTasks({ include: 'OwnerTeam' });
      const members = await user.getUserMembers({ include: 'OwnerTeam' });
      res.render('top/index', { tasks: tasks, user: user, members: members });
    } else {
      res.render('index', { title: 'Express', user: req.user });
    }
  }
}

module.exports = TopController;