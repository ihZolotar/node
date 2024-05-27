const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const userModel = require('../src/models/userModel');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new Strategy(options, async (jwtPayload, done) => {
    try {
      const user = await userModel.findById(jwtPayload.id);

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }),
);
