const supertest = require('supertest');

async function login(agent, user) {
  if (!agent) { throw new Error('agent required'); }
  if (!user) { throw new Error('user required'); }

  return await agent
    .post('/login')
    .send({
      username: user.username,
      password: 'password'
    })
    .expect(302);
}

function agent(webApp, { csrfToken } = { csrfToken: 'dummyToken' }) {
  return supertest.agent(webApp)
    .set('x-csrf-token', csrfToken)
    .set('Accept-Language', 'ja');
}

module.exports = { login, agent };