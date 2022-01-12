import mails from "nodemailer";
import accountModel from "../models/account.models.js";

export default {
    async sendEmail(userID, text){
        const obj = await accountModel.getUserInfo(userID);
        const email = obj.Email;
        var transporter = mails.createTransport({
            service: 'gmail',
            auth: {
                user: 'khuong16lop9a6@gmail.com',
                pass: '0903024916'
            }
        });

        var mailOptions = {
            from: 'ddkhang19@clc.fitus.edu.vn',
            to: email,
            subject: 'Bidding Wep App: Thông báo đấu giá',
            text: text
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
};