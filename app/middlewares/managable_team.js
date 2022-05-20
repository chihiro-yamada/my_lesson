const models = require('../models');
module.exports = async function forceManage(req, res, next) {
  const team = await models.Team.findByPk(req.params.team);
  if (!await team.isManager(req.user)) {
    await req.flash('alert', 'アクセスできません');
    res.redirect('/');
  }
  return next();
};