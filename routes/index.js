const { Route } = require('../lib/route');
const forceLogin = require('../app/middlewares/force_login');
const forceAdmin = require('../app/middlewares/force_admin');
const forceManage = require('../app/middlewares/managable_team');

const route = new Route();

// function style
route.get('/', 'top_controller@index');

// single style
route.get('/user/edit', forceLogin, 'users_controller@edit');
route.put('/user', forceLogin, 'users_controller@update');

// resource style
route.resource('examples', 'examples_controller');

// /adminのURL階層の作成。ログインチェック、管理者チェックが有効。
const adminRoute = route.sub('/admin', forceLogin, forceAdmin);
adminRoute.resource('users', 'admin/users_controller');

//managerのURL階層の作成.
const managerRoute = route.sub('/manager', forceLogin);

//team routes
route.resource('teams', forceLogin, { controller: 'teams_controller', only: ['create', 'store'] });
managerRoute.resource('teams', forceManage, { controller: 'manager/teams_controller', only: ['show', 'edit', 'update'] });

//manager/teamのURL階層の作成
const teamManagerRoute = managerRoute.sub('/teams/:team', forceManage);

//tasks routes
route.resource('tasks', { controller: 'tasks_controller', only: ['show'] });
teamManagerRoute.resource('tasks', { controller: 'manager/tasks_controller', only: ['create', 'store', 'edit', 'update'] });

//members routes
teamManagerRoute.resource('members', { controller: 'manager/members_controller', only: ['index', 'store'] });


module.exports = route.router;
