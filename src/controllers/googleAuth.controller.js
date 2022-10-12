function googleAuthController() {
    
    const jwt = require("jsonwebtoken");
    const loggerHelper = require("../helpers/logger.helper");

    async function googleAuthCallback(req, res) {
        try {
            jwt.sign(
                { user: req.user },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY},
                (err, token) => {
                    if (err) {
                        throw new Error(err);
                    }
                    return res.redirect(`${process.env.FRONTEND_HOST_URL}/signup?access_token=${token}`)
                }
            );
        } catch (e) {
            loggerHelper.log(e);
            return res.redirect(`${process.env.FRONTEND_HOST_URL}/signup?access_token=`);
        }
    }

    return {
        googleAuthCallback
    }
}

module.exports = googleAuthController