module.exports = async function forceLogin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  await req.flash('alert', 'ログインしてください');
  res.redirect('/login');
};
