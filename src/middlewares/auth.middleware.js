const passport = require("passport");
const jwtAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        try {
            if (err) throw new Error(err)
            if (!user) throw new Error('Not authenticated');
            const token = req.header('Authorization').replace('Bearer ', '');
            req.user = user;
            req.token = token;
            next();
        } catch (e) {
            console.log(e);
            res.status(401).send({
                success: false,
                message: e.message
            })
        }
    })(req, res)
}

module.exports = { jwtAuth }