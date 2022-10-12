const { userType } = require("../constants/user.constant");

function authController() {

    const User = require("../models/user.model");
    const loggerHelper = require("../helpers/logger.helper");
    const jwt = require("jsonwebtoken");
    
    async function completeSignup(req, res) {
        try {
            let user = await User.findById(req.body.id);
            user.active = 1;
            user.type = req.body.type;
            user.location = req.body.location;
            await user.save();
            loggerHelper.log(`User ${user.name}(${user._id}) has completed signup`);

            jwt.sign(
                { user: user },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY},
                (err, token) => {
                    if (err) throw new Error(err);
                    let response = {
                        success: true,
                        message: "Signup complete",
                        data: {
                            accessToken: token
                        }
                    };
        
                    return res.status(200).json(response);
                }
            );

            
        } catch (e) {
            console.log(e)
            const response = {
                success: false,
                message: e.message
            };
            return res.status(500).json(response);
        }
    }

    async function toggleUserType(req, res) {
        try {
            let user = await User.findById(req.body.id);
            user.type = user.type === userType.PASSENGER ? userType.RIDER : userType.PASSENGER;
            await user.save();
            loggerHelper.log(`User ${user.name}(${user._id}), type is changed`);

            jwt.sign(
                { user: user },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY},
                (err, token) => {
                    if (err) throw new Error(err);
                    let response = {
                        success: true,
                        message: `user type is changed to ${user.type}`,
                        data: {
                            accessToken: token
                        }
                    };
        
                    return res.status(200).json(response);
                }
            );

            
        } catch (e) {
            console.log(e)
            const response = {
                success: false,
                message: e.message
            };
            return res.status(500).json(response);
        }
    }

    return {
        completeSignup,
        toggleUserType
    }
}

module.exports = authController