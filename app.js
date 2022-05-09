process.on('uncaughtException', function (err) {
  console.error(err);
  console.error(err.stack);
});

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, './');
const envPath = path.join(rootDir, (process.env.NODE_ENV === 'test') ? '.env.test' : '.env');

if (fs.existsSync(envPath)) {
  console.log(`> read ${envPath}`);
  const result = require('dotenv').config({ path: envPath });
  if (result.error) {
    throw result.error;
  }
}

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const models = require('./app/models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');
const methodOverride = require('method-override');
const csrf = require('csurf');
const i18n = require('i18n');
const { flash } = require('express-flash-message');
const helpers = require('./lib/helpers');
const debug = require('debug')('express-mvc:request:params');

i18n.configure({
  locales: ['ja', 'en'],
  directory: path.join(__dirname, 'config', 'locales'),
  objectNotation: true
});

const store = new SequelizeStore({ db: models.sequelize });
store.sync();

const overridableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const walk = require('pug-walk');
app.use((req, res, next) => {
  res.locals.plugins = [
    {
      preCodeGen: (ast, _options) => {
        return walk(ast, null, (node, replace) => {
          if (node.name === '_method') {
            if (node.attrs.length !== 0) {
              throw new Error('method の引数は指定できません');
            }

            const innerNode = node.block.nodes[0];
            let valueAttr;
            if (innerNode.type === 'Text') {
              const method = innerNode.val;
              if (!overridableMethods.includes(method.toUpperCase())) {
                throw new Error(`methodの引数は${overridableMethods.join(',')}のうちの一つです: ${method}`);
              }
              valueAttr = { name: 'value', val: `"${method}"`, mustEscape: true };
            } else if (innerNode.type === 'Code') {
              valueAttr = { name: 'value', val: innerNode.val, mustEscape: false };
            }

            replace({
              ...node, type: 'Tag', selfClosing: true, block: null, name: 'input', attrs: [
                { name: 'type', val: '"hidden"', mustEscape: true },
                { name: 'name', val: '"_method"', mustEscape: true },
                valueAttr
              ]
            });
          }

          if (node.name === '_csrf') {
            replace({
              ...node, type: 'Tag', name: 'input', attrs: [
                { name: 'type', val: '"hidden"', mustEscape: true },
                { name: 'name', val: '"_csrf"', mustEscape: true },
                { name: 'value', val: 'csrfToken', mustEscape: false }
              ]
            });
          }
        });
      },
    },
  ];
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sessionSecret = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === 'test' ? require('crypto').randomBytes(64).toString('hex') : null
);
if(!sessionSecret) {
  throw new Error('[ERROR]Require environment value of SESSION_SECRET!');
}
app.use(session({
  secret: sessionSecret,
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'test' ? false : process.env.SSL_ENABLED !== 'false',
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function currentUser(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(i18n.init);

// @see http://expressjs.com/en/resources/middleware/method-override.html
app.use(methodOverride(function (req, _res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use(methodOverride('_method', { methods: ['GET', 'POST'] })); // for GET Parameter

if (process.env.NODE_ENV !== 'test') {
  app.use(csrf({ httpOnly: true }));
  app.use((req, res, next) => {
    const csrfToken = req.csrfToken();
    res.locals.csrfToken = csrfToken;
    next();
  });
}

app.use(flash({ sessionKeyName: '_flashMessage' }));
app.use(async (req, res, next) => {
  res.locals.flashMessages = {
    info: await req.consumeFlash('info'),
    alert: await req.consumeFlash('alert')
  };
  next();
});

app.use((req, res, next) => {
  res.locals.helpers = helpers;
  next();
});

app.use((req, res, next) => {
  debug(`${req.method} ${req.path}`);
  next();
  if (debug.enabled) {
    debug(`req.params: %o`, req.params);
    debug(`req.body: %o`, req.body);
    debug(`req.query: %o`, req.query);
  }
});

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.warn(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
