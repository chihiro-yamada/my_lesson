const models = require('../models');
module.exports = async function forceManage(req, res, next) {
  const team = await models.Team.findByPk(req.params.team);
  const member = await models.Member.findOne({ where: { teamId: team.id, role: 1 } });
  if (member.userId == req.user.id) {
    return next();
  }
  await req.flash('alert', 'アクセス権限がありません');
  res.redirect('/login');
};