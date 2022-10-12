const mongoose = require("mongoose");
const { rideStatus } = require("../constants/booking.constant");
const Schema = mongoose.Schema;
const BookingSchema = new Schema({
    passenger: {
       id: {
        type: String,
       },
       email: {
        type: String,
       },
       name: {
        type: String,
       }
    },
    rider: {
        id: {
         type: String,
        },
        email: {
         type: String,
        },
        name: {
         type: String,
        }
     },
    expiry: {
        type: Date
    },
    status: {
        type: String,
        enum: [rideStatus.PENDING, rideStatus.EXPIRED, rideStatus.CANCELED, rideStatus.COMPLETED, rideStatus.IN_PROGRESS],
        default: rideStatus.PENDING
    },
    price: {
        type: Number,
        default: 0
    },
    origin: {
        address: {
            type: String
        },
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number]
        }
    },
    destination: {
        address: {
            type: String
        },
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number]
        }
    },
}, { timestamps: true, collection: 'booking' });

BookingSchema.index({ origin: "2dsphere", destination: "2dsphere" });
const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;