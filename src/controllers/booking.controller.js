
function bookingController() {

    const { calculatePriceFromDistance } = require("../utils/helper.util");
    const { rideStatus } = require("../constants/booking.constant");
    const User = require("../models/user.model");
    const Booking = require("../models/booking.model");
    const moment = require('moment');
    const emailHelper = require("../helpers/email.helper");
    const loggerHelper = require("../helpers/logger.helper");

    async function sendPickupRequest(req, res) {

        try {

            const passenger = req.user;
            const originLat = parseFloat(req.body.from.lat);
            const originLon = parseFloat(req.body.from.lon);
            const originAddress = req.body.from.address;

            const destinationLat = parseFloat(req.body.to.lat);
            const destinationLon = parseFloat(req.body.to.lon);
            const destinationAddress = req.body.to.address;
            
            const price = calculatePriceFromDistance(req.body.distance);

            let prevBookings = await Booking.find({ 'passenger.id': passenger._id, 'status' : rideStatus.PENDING });
            for(const booking of prevBookings) {
                booking.status = rideStatus.CANCELED;
                await booking.save();
            }
            const expiry = moment(new Date()).add(process.env.PICKUP_LINK_EXPIRY, 'm').toDate();
            const bookingData = {
                passenger: {
                    id: passenger._id,
                    email: passenger.email,
                    name: passenger.name
                },
                expiry: expiry,
                price: price,
                status: rideStatus.PENDING,
                origin: {
                    address: originAddress,
                    type: 'Point',
                    coordinates: [originLon, originLat]
                },
                destination: {
                    address: destinationAddress,
                    type: 'Point',
                    coordinates: [destinationLon, destinationLat]
                }
            }

            const newBooking = new Booking(bookingData);
            await newBooking.save();
            loggerHelper.log(`Ride request from ${originAddress} to ${destinationAddress} saved to database`);

            const nearestRiders = await User.findNearestByRiders(originLon, originLat, process.env.RIDER_RANGE_KM);
            for(const rider of nearestRiders) {

                const pickupDetails = {
                    bookingID: newBooking._id,
                    rider: {
                        email: rider.email,
                        name: rider.name
                    },
                    passenger: {
                        email: passenger.email,
                        name: passenger.name
                    },
                    origin: originAddress,
                    destination: destinationAddress,
                    calculatedPrice: price
                }

                // EMAIL TO RIDER
                emailHelper.sendPickupRequest(pickupDetails);
                loggerHelper.log(`Pickup request is sent to ${rider.name}`);
            }

            const response = {
                success: true,
                message: "Pickup request is sent to nearest Riders",
                data: {
                    bookingID: newBooking._id
                }
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(500).json(response);
        }

    }

    async function bookingDetails(req, res) {
        try {
            const bookingID = req.query.bookingID;
            const bookingDetails = await Booking.findById(bookingID);
            loggerHelper.log(`Booking info details, Booking id: ${bookingID}`);
            const response = {
                success: true,
                message: "Booking details",
                data: bookingDetails
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }
    async function getCurrentBooking(req, res) {
        try {
            const bookingDetails = await Booking.findOne({"passenger.id": req.user._id, $or: [{'status': rideStatus.PENDING}, {'status': rideStatus.IN_PROGRESS}]});
            loggerHelper.log(`Current booking info details, User id: ${req.user._id}`);
            const response = {
                success: true,
                message: "Current booking details",
                data: bookingDetails ? bookingDetails : {}
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    async function bookingConfirm(req, res) {
        try {
            
            const bookingID = req.body.bookingID;
            const booking = await Booking.findById(bookingID);

            let now = moment(new Date());
            let end = moment(booking.createdAt);
            let duration = moment.duration(now.diff(end));
            let mins = duration.asMinutes();
            if(mins > parseInt(process.env.PICKUP_LINK_EXPIRY)) {
                booking.status = rideStatus.EXPIRED;
                booking.save();
                loggerHelper.log(`Booking id: ${bookingID} is expired`);
                throw new Error("This pickup request is expired");
            }

            if(booking.status !== rideStatus.PENDING) {
                switch(booking.status) {
                    case rideStatus.IN_PROGRESS:
                        loggerHelper.log(`Booking id: ${bookingID} is already taken`);
                        throw new Error("This request is already taken by another rider");
                    case rideStatus.CANCELED:
                        loggerHelper.log(`Request id: ${bookingID} is canceled by passenger`);
                        throw new Error("This request is canceled by passenger");
                    case rideStatus.COMPLETED:
                        loggerHelper.log(`Request id: ${bookingID} is already completed`);
                        throw new Error("This request is already completed");
                    case rideStatus.EXPIRED:
                        loggerHelper.log(`Request id: ${bookingID} is expired`);
                        throw new Error("This request is expired");   
                }
            }

            const rider = req.user;
            if(rider.type !== "rider") {
                loggerHelper.log(`Invalid API call by passenger`);
                throw new Error("Request can not be accepted by passenger");   
            }

            booking.status = rideStatus.IN_PROGRESS;
            booking.rider = {
                id: rider._id,
                email: rider.email,
                name: rider.name
            }

            await booking.save();

            const pickupDetails = {
                bookingID: booking._id,
                rider: {
                    email: booking.rider.email,
                    name: booking.rider.name
                },
                passenger: {
                    email: booking.passenger.email,
                    name: booking.passenger.name
                },
                origin: booking.origin.address,
                destination: booking.destination.address,
                calculatedPrice: booking.price
            }

            emailHelper.confirmPickupRequest(pickupDetails);
            loggerHelper.log(`Booking is confirmed booking id: ${bookingID}`);

            const response = {
                success: true,
                message: "Booking Confirmed"
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    async function bookingFinish(req, res) {
        try {
            
            const bookingID = req.body.bookingID;
            const booking = await Booking.findById(bookingID);
            if(booking.status === rideStatus.CANCELED) {
                loggerHelper.log(`Booking id: ${bookingID} is canceled by passenger`);
                throw new Error("This request is already canceled by passenger");
            }

            const rider = req.user;
            if(rider.type !== "rider") {
                loggerHelper.log(`Invalid API call by passenger`);
                throw new Error("Error! You are passenger");   
            }

            booking.status = rideStatus.COMPLETED;
            await booking.save();
            loggerHelper.log(`Booking id: ${bookingID} is successfully completed`);

            const response = {
                success: true,
                message: "Booking Completed"
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    async function bookingCancel(req, res) {
        try {
            
            const bookingID = req.body.bookingID;
            const booking = await Booking.findById(bookingID);
            booking.status = rideStatus.CANCELED;
            await booking.save();
            loggerHelper.log(`Booking id: ${bookingID} is canceled`);

            const response = {
                success: true,
                message: "Booking canceled"
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    async function getAllBooking(req, res) {
        try {
            const user = req.user;
            let bookings = await Booking
                .find({ [user.type + '.id']: user._id })
                .sort({'createdAt': -1})
                .limit(20);

            const response = {
                success: true,
                message: "Booking lists",
                data: bookings
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    async function getBookingCost(req, res) {
        try {
            const distance = req.query.distance;
            const price = calculatePriceFromDistance(distance);

            const response = {
                success: true,
                message: "Booking cost",
                data: {
                    cost: price
                }
            };

            return res.status(200).json(response);
        } catch (e) {
            loggerHelper.error(e);
            const response = {
                success: false,
                message: e.message
            };
            return res.status(400).json(response);
        }
    }

    return {
        sendPickupRequest,
        bookingDetails,
        bookingConfirm,
        bookingFinish,
        bookingCancel,
        getAllBooking,
        getBookingCost,
        getCurrentBooking
    }
}

module.exports = bookingController