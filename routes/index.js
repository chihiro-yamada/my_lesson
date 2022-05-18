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

//team routes
route.resource('teams', { controller: 'teams_controller', only: ['create', 'store', 'show', 'edit', 'update'] });
module.exports = route.router;

//tasks routes
const teamRoute = route.sub('/teams/:team', forceLogin);
teamRoute.resource('tasks', { controller: 'tasks_controller', only: ['create', 'store', 'edit', 'update'] });

//members routes
teamRoute.resource('members', forceLogin, { controller: 'members_controller', only: ['index', 'store'] });