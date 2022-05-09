const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50
});
router.use(limiter);

const models = require('../app/models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return done(new Error('session data error'), null);
  }

  done(null, user);
});

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await models.User.authenticate({ username, password });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {}, (err, user) => {
    if (err) {
      if (err.errors) {
        return res.render('login', { err });
      } else {
        return next(err);
      }
    }

    if (!user) {
      return res.render('login', {
        user: req.user, err: new Error('ユーザ名、パスワードを入力してください')
      });
    }

    // @see https://qiita.com/KeitaMoromizato/items/55c35a5d6d039aa7a385
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        req.flash('info', 'ログインしました');
        res.redirect('/');
      });
    });

  })(req, res, next);
});

router.get('/login', (req, res, _next) => {
  res.render('login');
});

router.get('/logout', (req, res, _next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
