function jwtAuthController() {
    const User = require("../models/user.model");

    async function user(req, res) {
        try {
            let user = await User.findById(req.user._id);
            let response = {
                success: true,
                data: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    type: user.type,
                    active: user.active,
                    location: user.location
                }
            };

            return res.status(200).json(response);
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
        user
    }
}

module.exports = jwtAuthController