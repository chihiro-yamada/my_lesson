const app = require('../../../app.js');
const models = require('../../../app/models');
const { login, agent } = require('../../../tests/support/request_helper');

let admin;
let user1;

beforeAll(async () => {
  await models.User.sync({ force: true });

  admin = await models.User.create({
    username: 'admin',
    displayName: 'Admin',
    email: 'admin@example.com',
    role: models.User.roles.admin,
    passwordHash: await models.User.generateHash('password')
  });

  user1 = await models.User.create({
    username: 'user1',
    displayName: 'User1',
    email: 'user1@example.com',
    passwordHash: await models.User.generateHash('password')
  });
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('access controll', () => {
  describe('when not logged in', () => {
    test('should redirect to /login', async () => {
      const res = await agent(app).get('/admin/users').expect(302);
      expect(res.headers.location).toBe('/login');
    });
  });

  describe('when logged in', () => {
    test('should redirect to / when access normal user', async () => {
      const agnt = agent(app);
      {
        await login(agnt, user1);
        const res = await agnt.get('/admin/users').expect(302);
        expect(res.headers.location).toBe('/');
      }

      {
        const res = await agnt.get('/').expect(200);
        expect(res.text).toContain('アクセスできません');
      }
    });

    test('should access 200 when access admin user', async () => {
      const agnt = agent(app);
      await login(agnt, admin);
      const res = await agnt.get('/admin/users').expect(200);
      expect(res.text).toContain('<h1>ユーザー管理</h1>');
    });
  });
});

describe('access by admin', () => {
  const agnt = agent(app);

  beforeAll(async () => {
    await login(agnt, admin);
  });

  describe('GET /admin/users', () => {
    test('should success with all user list', async () => {
      const res = await agnt.get('/admin/users').expect(200);
      expect(res.text).toContain('<h1>ユーザー管理</h1>');

      // has list of all users
      expect(res.text).toContain(`admin@example.com`);
      expect(res.text).toContain(`user1@example.com`);
    });
  });

  describe('GET /admin/users/create', () => {
    test('should success', async () => {
      const res = await agnt.get('/admin/users/create').expect(200);
      expect(res.text).toContain('<a href="/admin/users">ユーザー管理</a>/ ユーザー作成</h1>');
    });
  });

  describe('GET /admin/users/:id', () => {
    test('should success', async () => {
      const res = await agnt.get(`/admin/users/${user1.id}`).expect(200);
      expect(res.text).toContain(`<a href="/admin/users">ユーザー管理</a>/ ${user1.displayName}</h1>`);
    });
  });

  describe('GET /admin/users/edit', () => {
    test('should success', async () => {
      const res = await agnt.get(`/admin/users/${user1.id}/edit`).expect(200);
      expect(res.text).toContain(`<a href="/admin/users">ユーザー管理</a>/ ${user1.displayName}編集</h1>`);
    });
  });

  describe('POST /admin/users', () => {
    test('should success', async () => {
      {
        const userCount = await models.User.count();

        const res = await agnt
          .post('/admin/users')
          .send({
            username: 'admin2',
            displayName: 'Admin2',
            email: 'admin2@example.com',
            role: models.User.roles.admin,
            password: 'password'
          })
          .expect(302);

        expect(await models.User.count()).toBe(userCount + 1);
        expect(res.headers.location).toBe('/admin/users/');
      }

      {
        const res = await agnt.get('/admin/users');
        expect(res.text).toContain(`新規ユーザー「admin2」を作成しました`);
      }
    });
  });

  describe('PUT /admin/users/:id', () => {
    test('should success', async () => {
      const admin2 = await models.User.findOne({ where: { username: 'admin2' } });

      {
        const res = await agnt
          .put(`/admin/users/${admin2.id}`)
          .send({
            username: 'admin2-edit',
            displayName: 'Admin2-edit',
            email: 'admin2-edit@example.com',
            role: models.User.roles.normal
          })
          .expect(302);

        expect(res.headers.location).toBe(`/admin/users/${admin2.id}`);
      }

      {
        const res = await agnt.get(`/admin/users/${admin2.id}`);
        expect(res.text).toContain('更新しました');
        expect(res.text).toContain('admin2-edit');
        expect(res.text).toContain('Admin2-edit');
        expect(res.text).toContain('admin2-edit@example.com');
        expect(res.text).toContain('通常');
      }
    });
  });

  describe('DELETE /admin/users/:id', () => {
    test('should success', async () => {
      const admin2 = await models.User.findOne({ where: { username: 'admin2-edit' } });

      {
        const res = await agnt
          .delete(`/admin/users/${admin2.id}`)
          .expect(302);

        expect(res.headers.location).toBe(`/admin/users/`);
      }

      {
        const res = await agnt.get('/admin/users').expect(200);
        expect(res.text).toContain('削除しました');
        expect(res.text).not.toContain('admin2-edit');
      }
    });
  });
});
