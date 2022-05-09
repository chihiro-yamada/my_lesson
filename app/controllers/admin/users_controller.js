const { ValidationError } = require('sequelize');
const Controller = require('../controller');
const models = require('../../models');

class UsersController extends Controller {
  // GET /
  async index(req, res) {
    const users = await models.User.findAll({ order: [['id', 'DESC']] });
    res.render('admin/users/index', { users: users });
  }

  // GET /create
  async create(req, res) {
    const user = models.User.build({});
    res.render('admin/users/create', { user });
  }

  // POST /
  async store(req, res) {
    try {
      const user = await models.User.register(req.body);
      await req.flash('info', `新規ユーザー「${user.username}」を作成しました`);
      res.redirect('/admin/users/');
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('admin/users/create', { user: req.body, err });
      } else {
        throw err;
      }
    }
  }

  // GET /:id
  async show(req, res) {
    const user = await this._user(req);
    res.render('admin/users/show', { user });
  }

  // GET /:id/edit
  async edit(req, res) {
    const user = await this._user(req);
    res.render('admin/users/edit', { user });
  }

  // PUT or PATCH /:id
  async update(req, res) {
    const user = await this._user(req);
    try {
      user.set(req.body);

      let fields = ['username', 'email', 'displayName'];
      if (user.id !== req.user.id) {
        fields = [...fields, 'role'];
      }

      await user.save({ fields });
      await req.flash('info', '更新しました');
      res.redirect(`/admin/users/${req.params.user}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.render('admin/users/edit', { user, err });
      } else {
        throw err;
      }
    }
  }

  // DELETE /:id
  async destroy(req, res) {
    const user = await this._user(req);
    if (user.id === req.user.id) {
      await req.flash('alert', '自分は削除できません');
      return res.redirect('/admin/users/');
    }

    await user.destroy();
    await req.flash('info', '削除しました');
    res.redirect('/admin/users/');
  }

  async _user(req) {
    const user = await models.User.findByPk(req.params.user);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = UsersController;