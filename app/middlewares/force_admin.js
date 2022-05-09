module.exports = async function forceAdmin(req, res, next) {
  if (req.user.isAdmin()) {
    return next();
  }
  await req.flash('alert', 'アクセスできません');
  res.redirect('/');
};