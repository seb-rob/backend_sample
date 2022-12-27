const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    url: {
        type: String,
        required: [true, "url is missing"],
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Token = mongoose.model("token", tokenSchema)
module.exports = Token