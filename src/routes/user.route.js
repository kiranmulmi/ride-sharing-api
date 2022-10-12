function routes() {
    const express = require('express');
    const userController = require('../controllers/user.controller')

    const userRouter = express.Router();
    const controller = userController();

    userRouter.route('/completeSignup').post(controller.completeSignup);
    userRouter.route('/toggleUserType').post(controller.toggleUserType);

    return userRouter;
}

module.exports = routes;