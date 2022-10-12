const mongoose = require("mongoose");
const { userType } = require("../constants/user.constant");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    type: {
        type: String,
        enum: [userType.PASSENGER, userType.RIDER],
        default: userType.PASSENGER
    },
    active: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number]
        }
    },
    provider: {
        id: { type: String },
        name: { type: String },
    },
}, { timestamps: true });

UserSchema.index({ location: "2dsphere" });
UserSchema.static('findNearestByRiders', function (longitude, latitude, distance, unit = 'km') {
    const unitValue = unit == "km" ? 1000 : 1609.3;
    return this.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                query: { active: 1 },
                maxDistance: distance * unitValue,
                distanceField: 'distance',
                distanceMultiplier: 1 / unitValue
            }
        },
        {
            $project: {
                _id: 1,
                email: 1,
                name: 1,
                location: 1,
                distance: {
                    $round: ["$distance", 2]
                }
            }
        },
        {
            $sort: {
                distance: 1
            }
        },
        { $limit: 5 }
    ]);
});
const User = mongoose.model("User", UserSchema);
module.exports = User;