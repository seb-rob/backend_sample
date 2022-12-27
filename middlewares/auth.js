const User = require("../models/user")
const jwt = require("jsonwebtoken")


exports.adminAndSuperadmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.params.is_authorized })
        if (!user) {
            return res.status(403).json({
                message: "user does not exist"
            })
        }
        if (user.utype == "admin" || user.utype == "superadmin") {
            next();
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this particular task! contact admin.."
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.allAuth = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.params.is_authorized })
        if (!user) {
            return res.status(403).json({
                message: "user does not exist"
            })
        }
        if (user.utype == "admin" || user.utype == "superadmin" || user.utype == "lecturer" || user.utype == "office" || user.utype == "management") {
            next();
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this particular task! contact admin.."
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.verifyUser = async (req, res, next) => {
    try {
        const token = req.params.token;
        await jwt.verify(token, process.env.TOKEN_SECRET)
        next()
    } catch (error) {
        if (jwt.TokenExpiredError) {
            return res.status(400).json({
                message: `token expired`
            })
        }
        return res.status(500).json({
            message: error
        })
    }
}