const express = require("express")
const dotenv = require('dotenv').config()
const mongoose = require("mongoose")
const cors = require("cors")

// routes imports
const userRoutes  = require("./routes/user")

const app = express()

mongoose.connect(process.env.MONGO_URI, () => {
    console.log("connection established")
}).catch(error => {
    console.log("eror connecting database", error)
});

// middlewares
app.use(express.json())
app.use(cors())

// routes
app.use("/api/user", userRoutes)

app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`)
});