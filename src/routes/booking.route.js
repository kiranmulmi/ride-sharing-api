function routes() {
    const express = require('express');
    const bookingController = require('../controllers/booking.controller')

    const bookingRouter = express.Router();
    const controller = bookingController();

    bookingRouter.route('/sendPickupRequest').post(controller.sendPickupRequest);
    bookingRouter.route('/details').get(controller.bookingDetails);
    bookingRouter.route('/confirm').post(controller.bookingConfirm);
    bookingRouter.route('/finish').post(controller.bookingFinish);
    bookingRouter.route('/cancel').post(controller.bookingCancel);
    bookingRouter.route('/getAll').get(controller.getAllBooking);
    bookingRouter.route('/cost').get(controller.getBookingCost);
    bookingRouter.route('/current').get(controller.getCurrentBooking);

    return bookingRouter;
}

module.exports = routes;