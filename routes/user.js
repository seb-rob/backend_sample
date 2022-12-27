const express = require("express")
const {register, login, update, getall, bulkregister, getAtoZ, forgot, resetpassword, isvalidurl} = require("../controllers/user")
const { adminAndSuperadmin, allAuth, verifyUser } = require("../middlewares/auth")
const router = express.Router()


// login route
router.post("/login", login)
// forgot password? send token to the registered email id with link
router.post("/forgot", forgot)
// is url valid ?
router.post("/:token/valid", [verifyUser,  isvalidurl])
// reset password
router.post("/:token/resetpassword", [verifyUser, resetpassword])
// ********************************************* ADMIN ROUTES *****************************************
//registration route
router.post("/:token/:is_authorized/register", [verifyUser, adminAndSuperadmin, register])
// bulk registration
router.post("/:token/:is_authorized/bulkregister", [verifyUser, adminAndSuperadmin, bulkregister])
//update user or delete ( by disabled: true)
router.put("/:token/:is_authorized/update/:user_id", [verifyUser,adminAndSuperadmin,update])
// get all users (where disabled: false)
router.get("/:token/:is_authorized/getall", [verifyUser, allAuth, getall])
// get all users
router.get("/:token/:is_authorized/getAtoZ", [adminAndSuperadmin, getAtoZ])



module.exports = router;