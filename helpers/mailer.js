const nodemailer = require("nodemailer")
const { google } = require("googleapis")
const { OAuth2 } = google.auth;
const OAuthPlayGround = "https://developers.google.com/oauthplayground"

const { 
    MY_EMAIL,
    MAILING_ID,
    MAILING_SECRET,
    MAILING_REFRESH,
    MAILING_ACCESS
} = process.env;

const auth = new OAuth2(
    MAILING_ID,
    MAILING_SECRET,
    MAILING_REFRESH,
    OAuthPlayGround
)

exports.mail = async (emailTo, first_name, emailBody, url, from, text, subject) => {
    try {
        const smtp = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAUTH2",
                user: MY_EMAIL,
                clientId: MAILING_ID,
                clientSecret: MAILING_SECRET
            }
        })
        const mailOptions = {
            from: from,
            to: emailTo,
            subject: subject,
            html: emailBody,
            auth: {
                user: MY_EMAIL,
                refreshToken: MAILING_REFRESH,
                accessToken: MAILING_ACCESS
            }
        }
        await smtp.sendMail(mailOptions)
    } catch (error) {
        return error.message
    }
}