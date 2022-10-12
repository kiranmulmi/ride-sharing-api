const authMiddleware = require('./middlewares/auth.middleware');
const addRoutes = function (app) {
    const googleAuthRoute = require('./routes/googleAuth.route.js')();
    app.use('/', googleAuthRoute);

    const jwtAuthRoute = require('./routes/jwtAuth.route.js')();
    app.use('/auth/jwt', authMiddleware.jwtAuth, jwtAuthRoute);

    const userRoute = require('./routes/user.route.js')();
    app.use('/user', authMiddleware.jwtAuth, userRoute);

    const bookingRoute = require('./routes/booking.route.js')();
    app.use('/booking', authMiddleware.jwtAuth, bookingRoute);

    app.get('/config/get', authMiddleware.jwtAuth, (req, res) => {
        let response = {
            success: true,
            message: "Site Configureation",
            data: {
                cost: {
                    startingPrice: parseFloat(process.env.STARTING_PRICE),
                    pricePerKm: parseFloat(process.env.PRICE_PER_KM)
                }
            }
        };

        return res.status(200).json(response);
    })
};

module.exports = { addRoutes };