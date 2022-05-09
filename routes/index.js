const { Route } = require('../lib/route');
const forceLogin = require('../app/middlewares/force_login');
const forceAdmin = require('../app/middlewares/force_admin');

const route = new Route();

// function style
route.get('/', function (req, res, _next) {
  res.render('index', { title: 'Express', user: req.user });
});

// single style
route.get('/user/edit', forceLogin, 'users_controller@edit');
route.put('/user', forceLogin, 'users_controller@update');

// resource style
route.resource('examples', 'examples_controller');

// /adminのURL階層の作成。ログインチェック、管理者チェックが有効。
const adminRoute = route.sub('/admin', forceLogin, forceAdmin);
adminRoute.resource('users', 'admin/users_controller');

module.exports = route.router;
