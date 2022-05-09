const models = require('../../app/models');

beforeAll(async () => {
  await models.User.sync({ force: true });

  await models.User.create({
    username: 'user1',
    displayName: 'User1',
    email: 'user1@example.com',
    passwordHash: await models.User.generateHash('password')
  });
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('#isAdmin', () => {
  test('should true for admin', () => {
    const admin = models.User.build({ role: models.User.roles.admin });
    expect(admin.isAdmin()).toBe(true);
  });

  test('should false for normal', () => {
    const normal = models.User.build({ role: models.User.roles.normal });
    expect(normal.isAdmin()).toBe(false);
  });
});

describe('.authenticate', () => {
  test('should return match user', async () => {
    const user = await models.User.authenticate({
      username: 'user1',
      password: 'password'
    });

    expect(user).not.toBeNull();
    expect(user.username).toBe('user1');
    expect(user.email).toBe('user1@example.com');
    expect(user.displayName).toBe('User1');
  });

  /* eslint-disable jest/no-conditional-expect */

  test('should error when not match', async () => {
    expect.assertions(2);

    try {
      await models.User.authenticate({
        username: 'unknown',
        password: 'password'
      });
    } catch (err) {
      expect(err).toBeInstanceOf(models.Sequelize.ValidationError);
      expect(err).toHaveProperty('message', 'ログインに失敗しました');
    }
  });

  test('should error when username blank', async () => {
    expect.assertions(2);

    try {
      await models.User.authenticate({
        password: 'password'
      });
    } catch (err) {
      expect(err).toBeInstanceOf(models.Sequelize.ValidationError);
      expect(err).toHaveProperty('message', 'ログインに失敗しました');
    }
  });

  test('should error when password blank', async () => {
    expect.assertions(2);

    try {
      await models.User.authenticate({
        username: 'user1'
      });
    } catch (err) {
      expect(err).toBeInstanceOf(models.Sequelize.ValidationError);
      expect(err).toHaveProperty('message', 'ログインに失敗しました');
    }
  });

  /* eslint-enable jest/no-conditional-expect */
});

describe('.register', () => {
  test('should save new user', async () => {
    const user = await models.User.register({
      username: 'user2',
      password: 'password',
      email: 'user2@example.com',
      displayName: 'User2',
      role: models.User.roles.normal
    });

    expect(user).not.toBeNull();
    expect(user.username).toBe('user2');
    expect(user.email).toBe('user2@example.com');
    expect(user.displayName).toBe('User2');
    expect(user.role).toBe(models.User.roles.normal);
  });

  /* eslint-disable jest/no-conditional-expect */

  test('should error when any properties blank', async () => {
    expect.assertions(5);

    try {
      await models.User.register({
        password: 'password',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(models.Sequelize.ValidationError);
      expect(err.errors).toHaveLength(3);
      expect(err.errors[0]).toHaveProperty('message', 'User.username cannot be null');
      expect(err.errors[1]).toHaveProperty('message', 'User.email cannot be null');
      expect(err.errors[2]).toHaveProperty('message', 'User.displayName cannot be null');
    }
  });

  test('should error when password blank', async () => {
    expect.assertions(4);

    try {
      await models.User.register({
        username: 'notsaved',
        email: 'notsaved@example.com',
        displayName: 'NotSaved',
        role: models.User.roles.normal  
      });
    } catch (err) {
      expect(err).toBeInstanceOf(models.Sequelize.ValidationError);
      expect(err).toHaveProperty('message', 'ユーザ新規登録に失敗しました');
      expect(err.errors).toHaveLength(1);
      expect(err.errors[0]).toHaveProperty('message', 'パスワードは必須です');
    }
  });

  /* eslint-enable jest/no-conditional-expect */
});