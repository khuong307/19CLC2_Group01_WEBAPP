import express from 'express';
import accountModel from '../models/account.models.js'
import BCrypt from 'bcrypt'
import moment from "moment";
import mails from 'nodemailer'
import productModel from "../models/product.models.js";
const router = express.Router();
//register.
router.get('/register', async function(req, res){
    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }
    res.render('vWAccount/register')
})
//send email;

router.post('/register', async function(req, res){

    let newUserID = 0;
    const id_present = await accountModel.countUser();
    let number = parseInt(id_present[0].NumberOfUser) + 1;
    if ( number>= 100){
        newUserID = "U" + number
    }
    else if (number >= 10){
        newUserID = "U0" + number
    }
    else{
        newUserID = "U00" + number
    }

    //Account Info
    const username = req.body.Username
    const password = req.body.Password
    const hashPass = BCrypt.hashSync(password, 10);
    const newAccount = {
        Username: username,
        UserID: newUserID,
        Password: hashPass,
        Type: 1,
        Activate: 0
    }
    accountModel.addNewAccount(newAccount)

    //User Info
    const name = req.body.Name
    const address = req.body.Address;
    const dob = moment(req.body.Dob, 'MM/DD/YYYY').format('YYYY/MM/DD');
    const email = req.body.Email;
    const newUser = {
        UserID: newUserID,
        Name: name,
        Dob: dob,
        Address: address,
        Email: email,
        LikePoint: 0,
        DislikePoint: 0,
    }

    //send OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'biddingwebapp01@gmail.com',
            pass: '123456789zZ'
        }
    });
    accountModel.addNewUser(newUser)

    //random OTP:
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }

    var mailOptions = {
        from: 'biddingwebapp01@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Confirm your email',
        text: 'Mã xác nhận OTP: ' + OTP
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const OTPConfirm = {
        Email: email,
        OTPCode: OTP
    }
    accountModel.InsertOTP(OTPConfirm)

    res.redirect(`OTP/${email}`)
})


router.get('/is_available_account', async function(req, res){
    const email = req.query.email;
    const username = req.query.username;
    const user_email = await accountModel.findByEmail(email);
    const user_name = await accountModel.findByUsername(username);

    if(user_email===null && user_name===null){
        return res.json(false);
    }
    res.json(true);
})

router.get('/OTP/:email', async function(req, res){
    res.render('vWAccount/OTPConfirm')

})

router.post('/OTP/:email', async function(req, res){
    const email = req.params.email || 0
    const data = await accountModel.findOTPByEmail(email);
    console.log(req.body.OTP)
    const OTP = parseInt(req.body.OTP);

    if (OTP === data.OTPCode){
        const username = await accountModel.findUserIDByEmail(email)
        accountModel.UpdateActivateAccountByUserID(username.UserID)
    }
    res.render('vWAccount/OTPConfirm')

})

//login.
router.get('/login', async function(req, res){
    res.render('vWAccount/login')
})

//login.
router.get('/profile', async function(req, res){

    res.render('vWAccount/profile')
})

export default router;