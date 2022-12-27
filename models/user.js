const mongoose = require("mongoose")
const { user_types, departments } = require("../helpers/deptAndRoles")


const userModel = mongoose.Schema({
    fname: {
        type: String,
        required: [true, "What is your first name?"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z]+$/i, "first name can have only alphabets a to z"]
    },
    lname: {
        type: String,
        required: [true, "What is your last name?"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z]+$/i, "last name can have only alphabets a to z"]
    },
    mname: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
        match: [/^[a-zA-Z]+$/i, "middle name can have only alphabets a to z"]
    },
    email: {
        type: String,
        required: [true, "what is your email id ?"],
        lowercase: [true, "expected lowercase"],
        trim: true,
        unique: true,
    },
    campus: {
        type: String,
        enum: ["siliguri", "sonada"],
        required: [true, "you belong to which campus (sondada/siliguri) ?"],
        default: "siliguri"
    },
    password: {
        type: String,
        required: [true, "enter strong password"],
        minlength: [6, "create strong password with minimum length 6"]
    },
    avatar: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        required: [true, "mention you gender"],
        trim: true,
        enum: ["male", "female", 'others'],
        match: [/^[a-zA-Z]+$/i, "gender can have only alphabets a to z"]
    },
    year: {
        type: String,
        enum: ["first year", "second year", "third year"],
    },
    semester: {
        type: String,
    },
    disabled: {
        type: Boolean,
        default: false
    },
    department: {
        type: String,
        required: [true, "you belong to which department ?"],
        trim: true,
        lowercase: true,
        enum: departments,
        match: [/^([a-zA-Z]+( [a-zA-Z]+)+)$/i, "department can have only alphabets a to z"]
    },
    contact: {
        type: String,
        trim: true,
        match: [/^[0-9]$/, "phone number must be numbers only"],
        default: ""
    },
    countrycode: {
        Type: Number
    },
    utype: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "please mention user type"],
        enum: user_types,
        match: [/^[a-zA-Z]+$/i, "first name can have only alphabets a to z"]
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userModel)
module.exports = User;