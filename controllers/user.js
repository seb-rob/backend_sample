const User = require("../models/user")
const bcrypt = require("bcryptjs")
const Token = require("../models/token")

// helpers
const { user_types, departments, campuses } = require("../helpers/deptAndRoles")
const {checkLength} = require("../helpers/user")
const {generateToken} = require("../helpers/token")
const { mail } = require("../helpers/mailer")

// *************************************************** USER ************************************************
// user login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(403).json({
                message: "email and password are required required"
            })
        }
        const user = await User.findOne({ email })
        if (user.disabled) {
            return res.status(403).json({
                message: "account does not exist...!"
            })
        }
        if (!user) {
            return res.status(403).json({
                message: "incorrect user email or password"
            })
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(403).json({
                message: "incorrect user email or password"
            })
        }
        const token = generateToken({ id: user._id }, "10h")
        return res.status(200).json({
            token,
            id: user._id,
            first_name: user.fname,
            last_name: user.lname,
            middle_name: user.mname,
            email: user.email,
            profile_pic: user.avatar,
            gender: user.gender,
            department: user.department,
            phone_number: user.contact,
            role: user.utype,
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error \n ${error.message}`
        })
    }
}
// forgot password
exports.forgot = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(403).json({
                message: `user with email ${email} does not exist`
            })
        }
        const token = generateToken({ id: user._id }, "20m")
        const url = `${process.env.FRONT_END}/${token}/valid`
        const emailBody = `
            <h5>reset your password</h5>
            <a href=${url}>click on the link to reset your password</a>
        `;
        await Token.create({url, createdBy: user._id, expireAfterSeconds: 30})
        const mailError = await mail(user.email, fname="", emailBody, url, from = "", text = "", subject = "Request for password reset")
        if (mailError) {
            return res.status(400).json({
                message: mailError
            })
        }
        return res.status(200).json({
            message: "password reset mail has been sent to your account."
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
// is url valid
exports.isvalidurl = async (req, res) => {
    try {
        const { url } = req.body;
        const isUrl = await Token.findOne({url}).where("active").equals("true")
        if (!isUrl) {
            return res.status(403).json({
                success: false,
                message: "invalid url"
            })
        }
        return res.status(200).json({
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error -- ${error.message}`
        })
    }
}
// reset password
exports.resetpassword = async (req, res) => {
    try {
        const { password, url } = req.body;
        const isUrl = await Token.findOne({ url }).where("active").equals("true")
        if (!isUrl) {
            return res.status(400).json({
                message: "invalid url"
            })
        }
        const user = await User.findOne({ _id: isUrl.createdBy })
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
        user.save()
        isUrl.active = false
        isUrl.save();
        return res.status(200).json({
            success: true,
            message: "passwor has been updated!"
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error -- ${error}`
        })
    }
}
// *************************************************** ADMIN **********************************************
//register user
exports.register = async (req, res) => {
    try {
        const { fname,
            lname,
            email,
            mname,
            utype,
            password,
            gender,
            department,
            campus
        } = req.body;

        if (!fname || !lname || !email || !password || !gender || !department || !utype || !campus) {
            return res.status(403).json({
                message: "make sure you have entered all required fields"
            })
        }
        if (checkLength(fname, 2) == false) {
            return res.status(403).json({
                message: "fisrt name is too short"
            })
        }
        if (checkLength(lname, 2) == false) {
            return res.status(403).json({
                message: "last name is too short"
            })
        }
        if (checkLength(password, 6) == false) {
            return res.status(403).json({
                message: "password must be atleast 6 character long"
            })
        }
        if (campuses.indexOf(campus.toLowerCase()) == -1) {
            is_error.error = true,
            is_error.message = `campus must be either siliguri or sonada, but got ${campus}`
            return is_error
        }
        const user_type_exist = user_types.indexOf(utype.toLowerCase())
        if (user_type_exist == -1) {
            return res.status(400).json({
                message: `${utype} -- is not valid selection`
            })
        }
        if (departments.indexOf(department.toLowerCase()) == -1) {
            return res.status(400).json({
                message: `${department} -- department does not exist`
            })
        }
        const emailExistance = await User.findOne({ email })
        if (emailExistance) {
            return res.status(403).json({
                message: "email is taken, try with different email"
            })
        }
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            fname,
            lname,
            mname,
            utype,
            email,
            password: hashedPassword,
            gender,
            department,
            campus
        })
        const token = generateToken({ id: user._id }, "30m")
        // const url = `${process.env.FRONT_END}/${token}`
        // await Token.create({token})
        const emailBody =  `
                <h1>Welcome to Salesian College </h1>
            `
        const emailError = await mail(email, fname, emailBody, url="", from="no-reply@salesiancollege.com", text="", subject="warm welcome")
        if (emailError) {
            return res.status(400).json({
                message: "registration successful but could not send mail"
            })
        }
        return res.status(200).json({
            message: `Registration successful! Email sent to ${email} id.`,
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error -- ${error.message}`
        })
    }
}
// bulk registration
exports.bulkregister = async (req, res) => {
    try {
        const arr = req.body
        let is_error = { error: false, message: "" }
        // let emails = await User.find().select("email -_id")
        // const emails_list = emails.map(elem => {
        //     return elem.email
        // })
        const arr2 = await Promise.all(arr.map(async user => {
            let {
                fname,
                lname,
                email,
                password,
                gender,
                department,
                utype,
                campus
            } = user
            if (!fname || !lname || !email || !password || !gender || !department || !utype || !campus) {
                is_error.error = true,
                is_error.message = "make sure you have entered all required fields"
                return is_error
            }
            if (checkLength(fname, 2) == false) {
                is_error.error = true,
                is_error.message = "fisrt name is too short" 
                return is_error
            }
            if (checkLength(lname, 2) == false) {
                is_error.error = true,
                is_error.message = "last name is too short"
                return is_error
            }
            if (checkLength(password, 6) == false) {
                is_error.error = true,
                is_error.message = "password must be atleast 6 character long"
                return is_error
            }
            const user_type_exist = user_types.indexOf(utype.toLowerCase())
            if (user_type_exist == -1) {
                is_error.error = true,
                is_error.message = `${utype} -- is not valid selection`
                return is_error.error
            }
            if (campuses.indexOf(campus.toLowerCase()) == -1) {
                is_error.error = true,
                is_error.message = `campus must be either siliguri or sonada, but got ${campus}`
                return is_error
            }
            if (departments.indexOf(department.toLowerCase()) == -1) {
                is_error.error = true,
                is_error.message = `${user.department} -- department does not exist`
                return is_error
            }
            // const emailExistance = emails_list.indexOf(email)
            const emailExistance = await User.findOne({ email })
            if (emailExistance) {
                is_error.error = true,
                is_error.message = `${email} --- email is taken, try with different email`
                return is_error
            }
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)
            user.password = hashedPassword
            return user
        }));
        if (is_error.error) {
            return res.status(400).json({
                message: is_error.message
            })
        }
        await User.insertMany(arr2)
        return res.status(200).json({
            message: "registration successful...!"
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error --- ${error.message}`
        })
    }
}
//update user or delete ( by disabled: false)
exports.update = async (req, res) => {
    try {
        const update_body = req.body
        const user = await User.findById(req.params.user_id)
        if (!user) {
            return res.status(402).json({
                message: "user does not exist"
            })
        }
        if (update_body.password) {
            return res.status(400).json({
                message: "password cannot be updated, Try using forgot password option"
            })
        }
        if (update_body._id) {
            return res.status(400).json({
                message: "Id cannot be changed"
            })
        }
        await User.findByIdAndUpdate(req.params.user_id, { $set: update_body })
        return res.status(200).json({
            message: "details have been updated !"
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error \n ${error.message}`
        })
    }
}
// get all users (where disabled: false)
exports.getall = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.is_authorized }, disabled: {$eq: false} }).select("-password")
        return res.status(200).json({
            users
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error \n ${error.message}`
        })
    }
}
// get all users
exports.getAtoZ = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.is_authorized } }).select("-password")
        return res.status(200).json({
            users
        })
    } catch (error) {
        return res.status(500).json({
            message: `Please contact admin about this error \n ${error.message}`
        })
    }
}