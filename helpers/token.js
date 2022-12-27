const jwt = require("jsonwebtoken");
exports.generateToken = (payload, expire) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: expire
    })
}