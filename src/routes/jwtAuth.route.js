function routes() {
    const express = require('express');
    const jwtAuthController = require('../controllers/jwtAuth.controller')

    const authRouter = express.Router();
    const controller = jwtAuthController();

    authRouter.route('/user').get(controller.user);

    return authRouter;
}

module.exports = routes;