const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/user.model");
const loggerHelper = require("../helpers/logger.helper")

passport.use(new GoogleStrategy({
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: `${process.env.HOST_URL}/auth/google/callback`,
  passReqToCallback: true
},
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      let existingUser = await User.findOne({ 'provider.id': profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }
      loggerHelper.log('Creating new user...');
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: {
          id: profile.id,
          name: "google"
        }
      });
      await newUser.save();
      return done(null, newUser);
    }
    catch (error) {
      return done(error, false)
    }
  }
));

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = jwtPayload.user;
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);