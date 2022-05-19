module.exports = async function forceManage(req, res, next) {
  const member = await req.user.getOwnMembers({ where: { teamId: req.params.team, role: 1 } });
  console.log(member);
  if (member.length > 0) {
    return next();
  }
  await req.flash('alert', 'アクセス権限がありません');
  res.redirect('/login');
};