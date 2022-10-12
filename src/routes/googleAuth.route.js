function routes() {
    const express = require('express');
    const passport = require("passport");
    const googleAuthController = require('../controllers/googleAuth.controller')

    const authRouter = express.Router();
    const controller = googleAuthController();

    authRouter.get("/auth/google", passport.authenticate('google', { scope: ['email', 'profile'], }));
    authRouter.get('/auth/google/callback', passport.authenticate("google", { session: false }), controller.googleAuthCallback);

    return authRouter;
}

module.exports = routes;